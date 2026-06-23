/**
 * Analytics loaders — GTM (carrying GA4) + PostHog.
 *
 * These lived in the old CRA `public/index.html` and were dropped in the
 * CRA→Next migration, so every `dataLayer.push` / `gtag()` / `posthog` call in
 * the app was a no-op until this was restored. IDs reused from the old site:
 *   • GTM container  : GTM-NSZF3Q8  (loads GA4 G-K0QTRESXBJ inside the container)
 *   • PostHog project: phc_xAvL2Iq4tFmANRE7kzbKwaSqp1HJjN7x48s3vr0CMjs
 *
 * Ordering is load-bearing: the Consent Mode v2 default (everything DENIED)
 * MUST execute before GTM so GA4 starts in a compliant state. `useCookieConsent`
 * flips storage to 'granted' (and opts PostHog in) once the user accepts.
 *
 * These load via `next/script` rather than raw inline <script> tags. Raw inline
 * scripts were rendered as React children of <body>, so when GTM/PostHog
 * injected their own <script> siblings the body's hydration reconciliation
 * mismatched ("a tree hydrated but some attributes didn't match") on every page,
 * forcing a client re-render of the body. `next/script` with
 * `strategy="beforeInteractive"` is injected into the initial HTML OUTSIDE the
 * React tree and still executes in placement order (per the Next 16 docs), so
 * the consent→GTM sequence is preserved without the hydration mismatch.
 */
import Script from "next/script";

const GTM_ID = "GTM-NSZF3Q8";

// 1) Consent Mode v2 default — denied until the user accepts (ePrivacy/GDPR).
const CONSENT_DEFAULT = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('consent', 'default', {
  'analytics_storage': 'denied',
  'ad_storage': 'denied',
  'ad_user_data': 'denied',
  'ad_personalization': 'denied',
  'personalization_storage': 'denied',
  'wait_for_update': 500
});
gtag('js', new Date());
`;

// 2) Standard async GTM snippet.
const GTM_LOADER = `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`;

/**
 * Consent default + GTM loader + GTM <noscript> fallback. The two scripts are
 * `beforeInteractive` (injected into the initial HTML, run before hydration, in
 * order — consent first), so DOM position no longer matters for execution.
 */
export function GtmScripts() {
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document --
         App Router has no _document; beforeInteractive belongs in the root layout
         (this renders <html>/<body>) per the Next 16 docs. Rule is Pages-Router-only. */}
      <Script
        id="gtm-consent-default"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: CONSENT_DEFAULT }}
      />
      {/* eslint-disable-next-line @next/next/no-before-interactive-script-outside-document -- see above */}
      <Script
        id="gtm-loader"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: GTM_LOADER }}
      />
      <noscript>
        <iframe
          src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
          height="0"
          width="0"
          style={{ display: "none", visibility: "hidden" }}
        />
      </noscript>
    </>
  );
}

// 3) PostHog — deferred to browser idle (≈150KB), starts opted-out + recording
//    disabled; useCookieConsent arms it on analytics consent. Stub + init copied
//    verbatim from the old site's install.
const POSTHOG = `
!(function (t, e) {
    var o, n, p, r;
    e.__SV ||
        ((window.posthog = e),
        (e._i = []),
        (e.init = function (i, s, a) {
            function g(t, e) {
                var o = e.split(".");
                2 == o.length && ((t = t[o[0]]), (e = o[1])),
                    (t[e] = function () {
                        t.push(
                            [e].concat(
                                Array.prototype.slice.call(
                                    arguments,
                                    0,
                                ),
                            ),
                        );
                    });
            }
            ((p = t.createElement("script")).type =
                "text/javascript"),
                (p.crossOrigin = "anonymous"),
                (p.async = !0),
                (p.src =
                    s.api_host.replace(
                        ".i.posthog.com",
                        "-assets.i.posthog.com",
                    ) + "/static/array.js"),
                (r =
                    t.getElementsByTagName(
                        "script",
                    )[0]).parentNode.insertBefore(p, r);
            var u = e;
            for (
                void 0 !== a ? (u = e[a] = []) : (a = "posthog"),
                    u.people = u.people || [],
                    u.toString = function (t) {
                        var e = "posthog";
                        return (
                            "posthog" !== a && (e += "." + a),
                            t || (e += " (stub)"),
                            e
                        );
                    },
                    u.people.toString = function () {
                        return u.toString(1) + ".people (stub)";
                    },
                    o =
                        "init me ws ys ps bs capture je Di ks register register_once register_for_session unregister unregister_for_session Ps getFeatureFlag getFeatureFlagPayload isFeatureEnabled reloadFeatureFlags updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures on onFeatureFlags onSurveysLoaded onSessionId getSurveys getActiveMatchingSurveys renderSurvey canRenderSurvey canRenderSurveyAsync identify setPersonProperties group resetGroups setPersonPropertiesForFlags resetPersonPropertiesForFlags setGroupPropertiesForFlags resetGroupPropertiesForFlags reset get_distinct_id getGroups get_session_id get_session_replay_url alias set_config startSessionRecording stopSessionRecording sessionRecordingStarted captureException loadToolbar get_property getSessionProperty Es $s createPersonProfile Is opt_in_capturing opt_out_capturing has_opted_in_capturing has_opted_out_capturing clear_opt_in_out_capturing Ss debug xs getPageViewId captureTraceFeedback captureTraceMetric".split(
                            " ",
                        ),
                    n = 0;
                n < o.length;
                n++
            )
                g(u, o[n]);
            e._i.push([i, s, a]);
        }),
        (e.__SV = 1));
})(document, window.posthog || []);
var __initPostHog = function () {
    posthog.init("phc_xAvL2Iq4tFmANRE7kzbKwaSqp1HJjN7x48s3vr0CMjs", {
        api_host: "https://us.i.posthog.com",
        person_profiles: "identified_only",
        autocapture: false,
        capture_pageview: false,
        capture_pageleave: false,
        disable_session_recording: true,
        opt_out_capturing_by_default: true,
    });
};
if ("requestIdleCallback" in window) {
    requestIdleCallback(__initPostHog, { timeout: 4000 });
} else {
    setTimeout(__initPostHog, 3000);
}
`;

/** PostHog stub + deferred init. `afterInteractive` (Next-managed, not a
 * hydrated body child); the script itself further defers init to idle. */
export function PostHogScript() {
  return (
    <Script
      id="posthog-init"
      strategy="afterInteractive"
      dangerouslySetInnerHTML={{ __html: POSTHOG }}
    />
  );
}
