import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { getBlogPost } from "@/lib/blogApi";

export const runtime = "nodejs";

// ── Branded hero design (mirrors the static generator: gradient + topic icon +
// title, no wordmark). Rendered on the fly per post + locale so every new post
// (and German titles) get a unique on-brand hero automatically. Edge-cached. ──

const ICONS: Record<string, string> = {
  cred: '<path d="M12 2l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V5z"/><path d="M9 12l2 2 4-4" fill="none" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>',
  badge: '<circle cx="12" cy="9" r="6"/><path d="M9 14l-2 7 5-3 5 3-2-7"/><path d="M9.5 9l1.7 1.7L15 7" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  skills: '<path d="M3 10l9-5 9 5-9 5z"/><path d="M7 12v4c0 1.5 2.5 3 5 3s5-1.5 5-3v-4" fill="none" stroke="#fff" stroke-width="1.8"/><line x1="21" y1="10" x2="21" y2="15" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>',
  verify: '<path d="M12 2l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V5z"/><circle cx="12" cy="11" r="4.6" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M10 11l1.5 1.5L14.5 9.5" fill="none" stroke="#fff" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>',
  cert: '<rect x="4" y="3" width="16" height="14" rx="1.5"/><line x1="7" y1="7" x2="17" y2="7" stroke="#fff" stroke-width="1.6"/><line x1="7" y1="10" x2="14" y2="10" stroke="#fff" stroke-width="1.6"/><circle cx="16.5" cy="17.5" r="3.2"/><path d="M14.8 20l-1 3 2.7-1.4L19.2 23l-1-3"/>',
  chain: '<rect x="3" y="9" width="6" height="6" rx="1.4"/><rect x="15" y="9" width="6" height="6" rx="1.4"/><line x1="9" y1="12" x2="15" y2="12" stroke="#fff" stroke-width="2"/>',
  micro: '<rect x="5" y="14" width="14" height="3.4" rx="1"/><rect x="6.5" y="9.5" width="11" height="3.4" rx="1" opacity="0.85"/><rect x="8" y="5" width="8" height="3.4" rx="1" opacity="0.7"/>',
  edu: '<path d="M2 9l10-5 10 5-10 5z"/><path d="M6 11v4c0 1.6 2.7 3 6 3s6-1.4 6-3v-4" fill="none" stroke="#fff" stroke-width="1.8"/>',
  security: '<path d="M12 2l8 3v6c0 5-3.5 8.5-8 10-4.5-1.5-8-5-8-10V5z"/><rect x="9" y="10" width="6" height="5.5" rx="1" fill="#fff"/><path d="M10 10V8.5a2 2 0 0 1 4 0V10" fill="none" stroke="#fff" stroke-width="1.6"/>',
  team: '<circle cx="9" cy="8" r="3"/><circle cx="16" cy="9" r="2.4"/><path d="M3 19c0-3.3 2.7-6 6-6s6 2.7 6 6" fill="none" stroke="#fff" stroke-width="1.8"/><path d="M15 13c2.8 0 5 2.2 5 5" fill="none" stroke="#fff" stroke-width="1.8"/>',
  chart: '<line x1="4" y1="20" x2="20" y2="20" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><rect x="6" y="11" width="3" height="7"/><rect x="11" y="7" width="3" height="11"/><rect x="16" y="14" width="3" height="4"/>',
  health: '<path d="M12 21C6 17 3 13 3 8.5 3 5.5 5.4 3 8.3 3c1.7 0 3.1.8 3.7 2 .6-1.2 2-2 3.7-2C18.6 3 21 5.5 21 8.5 21 13 18 17 12 21z"/><path d="M12 8v6M9 11h6" stroke="#fff" stroke-width="1.6" stroke-linecap="round"/>',
  book: '<path d="M4 4h7a2 2 0 0 1 2 2v13a2 2 0 0 0-2-2H4z"/><path d="M20 4h-7a2 2 0 0 0-2 2v13a2 2 0 0 1 2-2h7z" opacity="0.8"/>',
  share: '<circle cx="6" cy="12" r="2.4"/><circle cx="18" cy="6" r="2.4"/><circle cx="18" cy="18" r="2.4"/><path d="M8 11l8-4M8 13l8 4" stroke="#fff" stroke-width="1.6"/>',
  event: '<rect x="4" y="5" width="16" height="15" rx="2"/><line x1="4" y1="9" x2="20" y2="9" stroke="#fff" stroke-width="1.6"/><line x1="8" y1="3" x2="8" y2="7" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/><line x1="16" y1="3" x2="16" y2="7" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/>',
};

const TOPIC: Record<string, { icon: string; g: [string, string] }> = {
  blockchain: { icon: "chain", g: ["#2B4FD9", "#6A22D6"] },
  linkedin: { icon: "share", g: ["#2B6FD9", "#6A22D6"] },
  healthcare: { icon: "health", g: ["#E83C5C", "#7B2BD6"] },
  graduation: { icon: "edu", g: ["#6A22D6", "#B82BC4"] },
  elearning: { icon: "book", g: ["#5B22D6", "#21A8C4"] },
  badge: { icon: "badge", g: ["#B82BC4", "#E83C5C"] },
  training: { icon: "skills", g: ["#5B22D6", "#2B7FD9"] },
  certificate: { icon: "cert", g: ["#E83C5C", "#B82BC4"] },
  analytics: { icon: "chart", g: ["#5B22D6", "#2BB0C4"] },
  security: { icon: "security", g: ["#1D1A4E", "#5B22D6"] },
  event: { icon: "event", g: ["#2E2A3D", "#5B22D6"] },
  verification: { icon: "verify", g: ["#3F2BD9", "#7B2BD6"] },
  credential: { icon: "cred", g: ["#5B22D6", "#B82BC4"] },
  team: { icon: "team", g: ["#E83C5C", "#E8743C"] },
  micro: { icon: "micro", g: ["#B82BC4", "#5B22D6"] },
  default: { icon: "cred", g: ["#5B22D6", "#B82BC4"] },
};

const RULES: [string[], string][] = [
  [["blockchain", "tamper-proof", "immutable", "decentrali"], "blockchain"],
  [["linkedin", "social-sharing", "social-media", "sharing-credential"], "linkedin"],
  [["healthcare", "medical", "nursing", "hospital", "clinical", "health-care", "clini"], "healthcare"],
  [["graduation", "diploma", "university", "higher-education", "graduate", "alumnus"], "graduation"],
  [["elearning", "e-learning", "online-learning", "lms", "online-course", "mooc", "coursera", "moodle"], "elearning"],
  [["micro-credential", "microcredential", "stackable"], "micro"],
  [["digital-badge", "open-badge", "badge-maker", "badge", "badging"], "badge"],
  [["employee", "training-program", "corporate-training", "workforce", "reskill", "upskill", "soft-skill", "skill", "cpd", "professional-development"], "training"],
  [["template", "certificate-template", "free-certificate", "certificate-design", "appreciation"], "certificate"],
  [["analytics", "data-driven", "roi", "engagement", "tracking", "metric"], "analytics"],
  [["security", "gdpr", "compliance", "soc-2", "data-protection", "fraud", "counterfeit", "ghost"], "security"],
  [["event", "worldskills", "conference", "summit", "partnership", "tuv", "certif-id", "didac"], "event"],
  [["verification", "verify", "instant-verification", "qr-code", "credential-verification"], "verification"],
  [["digital-certificate", "digital-credential", "credentialing", "credsure", "certificate", "certification"], "certificate"],
  [["team", "company", "career", "hiring", "customer-success", "case-study", "resume"], "team"],
];
const CAT: Record<string, string> = { Education: "elearning", Insights: "credential", Industry: "training", Technology: "blockchain", "Customer Success": "team", Healthcare: "healthcare", News: "event", Events: "event" };

function detectTopic(slug: string, title: string, category: string, tags: string[]): string {
  const c = `${slug} ${title} ${(tags || []).join(" ")}`.toLowerCase();
  for (const [kws, key] of RULES) if (kws.some((k) => c.includes(k))) return key;
  return CAT[category] || "default";
}

const fontPromise = readFile(new URL("./Inter-ExtraBold.ttf", import.meta.url));

export async function GET(
  request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const sp = new URL(request.url).searchParams;
  const lang = sp.get("lang") === "de" ? "de" : "en";
  // `bg=1` renders a title-less variant (gradient + icon only) — used as the
  // faded post-page hero background, where the page already shows the H1, so the
  // baked title would just duplicate it.
  const noTitle = sp.get("bg") === "1";

  const post = await getBlogPost(slug, lang).catch(() => null);
  const title = (post?.title || slug.replace(/-/g, " ")).trim();
  const topicKey = detectTopic(slug, title, (post?.category as string) || "", (post?.tags as string[]) || []);
  const tp = TOPIC[topicKey] || TOPIC.default;

  const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="170" height="170" fill="rgba(255,255,255,0.9)">${ICONS[tp.icon]}</svg>`;
  const iconUri = `data:image/svg+xml;base64,${Buffer.from(iconSvg).toString("base64")}`;

  const fontData = await fontPromise;
  const fontSize = title.length > 52 ? 52 : title.length > 30 ? 60 : 66;

  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          position: "relative",
          backgroundImage: `linear-gradient(135deg, ${tp.g[0]}, ${tp.g[1]})`,
          fontFamily: "Inter",
        }}
      >
        <div style={{ position: "absolute", top: -180, right: -60, width: 600, height: 600, borderRadius: 9999, background: "rgba(255,255,255,0.06)" }} />
        <div style={{ position: "absolute", bottom: -120, right: 60, width: 400, height: 400, borderRadius: 9999, background: "rgba(255,255,255,0.05)" }} />
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", height: "100%", padding: "0 64px" }}>
          {noTitle ? (
            <div style={{ display: "flex" }} />
          ) : (
            <div style={{ display: "flex", color: "#ffffff", fontWeight: 800, fontSize, lineHeight: 1.12, letterSpacing: -1.5, maxWidth: 700 }}>
              {title}
            </div>
          )}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={iconUri} width={170} height={170} alt="" />
        </div>
      </div>
    ),
    {
      width: 1200,
      height: 630,
      fonts: [{ name: "Inter", data: fontData, weight: 800, style: "normal" }],
      headers: {
        "Cache-Control": "public, max-age=86400, s-maxage=31536000, stale-while-revalidate=86400",
      },
    }
  );
}
