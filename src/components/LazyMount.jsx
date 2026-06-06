"use client";
import React, { useState, useEffect, useRef, Suspense } from 'react';

/**
 * Defer hydration of below-the-fold sections until they are about to
 * enter the viewport — the textbook fix for "TBT-after-FCP" patterns
 * (Lighthouse 13 surfaces these heavily on slow-CPU emulation).
 *
 * Why this matters: React's Suspense fallback resolves the moment the
 * FIRST lazy chunk arrives, and then React commits ALL children inside
 * that Suspense boundary in one big task. On the homepage that means
 * ~14 below-fold sections mount simultaneously, blocking the main
 * thread for 3-6 seconds on a Moto G4-class CPU.
 *
 * `<LazyMount>` short-circuits that by rendering a CSS-only placeholder
 * (preserves layout for CLS) until an IntersectionObserver fires
 * `rootMargin: 1200px` ahead of the viewport. The actual child component
 * mounts well before the user can see it — no perceived lag and no
 * scroll jump as content arrives.
 *
 * Once mounted, the child stays mounted. We do NOT unmount on scroll
 * out — re-running React render trees during scroll is worse than the
 * memory savings.
 *
 * Anti-CLS strategy:
 *   1. `minHeight` is set as accurately as possible (measured per-section)
 *   2. `rootMargin: '1200px'` means we mount ~1.5 viewports ahead, so by
 *      the time the user reaches the section, hydration is already done
 *      and the section has reflowed to its final size
 *   3. Each LazyMount has its OWN Suspense boundary with a minHeight-
 *      reserving fallback. If a downstream React.lazy() chunk for the
 *      child is still in flight when LazyMount mounts, the placeholder
 *      stays visible (same height as before) — without the per-instance
 *      boundary, a single suspending sibling would collapse every
 *      section under a shared Suspense to null and shrink the whole
 *      page (causing massive scroll jumps).
 *
 * Props:
 *   - `minHeight`: pixel height to reserve so the placeholder takes the
 *     same vertical space as the eventual rendered section (CLS
 *     prevention). MUST be ≥ the actual rendered section height. See
 *     App.js for measured values.
 *   - `rootMargin`: how far ahead of the viewport to start mounting.
 *     Default 1200px ≈ 1.5 phone screens of runway.
 *   - `fallback`: optional custom placeholder. Defaults to a transparent
 *     div with the reserved min-height.
 */
export default function LazyMount({
  children,
  minHeight = 600,
  rootMargin = '1200px',
  fallback = null,
  testId,
}) {
  const [mounted, setMounted] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (mounted) return;
    // Older browsers without IntersectionObserver get the section
    // immediately — safest fallback, matches pre-LazyMount behaviour.
    if (typeof IntersectionObserver === 'undefined') {
      setMounted(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setMounted(true);
          observer.disconnect();
        }
      },
      { rootMargin },
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [mounted, rootMargin]);

  // Same placeholder shape for both pre-mount and chunk-in-flight states
  // so the section never goes from N px → 0 px → N px (which would yank
  // the rest of the page upward and create a scroll jump).
  const placeholder = (
    <div
      ref={ref}
      style={{ minHeight: `${minHeight}px` }}
      aria-hidden="true"
      data-testid={testId || 'lazy-mount-placeholder'}
    >
      {fallback}
    </div>
  );

  if (!mounted) return placeholder;

  // Per-instance Suspense isolates code-split chunk loading: if this
  // section's React.lazy() chunk is still streaming, only THIS section
  // shows the placeholder — not every sibling.
  return (
    <Suspense fallback={placeholder}>
      {children}
    </Suspense>
  );
}
