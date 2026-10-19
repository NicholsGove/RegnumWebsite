// Regnum Personia website: form intake.
// Receives the contact form and the demo-request form, checks them,
// stores them in public.submissions and (optionally) emails a notification.
//
// Public endpoint (no login): it does its own checks instead
//   - only accepts the site's own origins (CORS)
//   - honeypot field and minimum fill time to stop bots
//   - at most 5 submissions per sender per 10 minutes
//   - strict length limits on every field
//
// Secrets (set in Supabase > Edge Functions > Secrets):
//   SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY  provided automatically
//   RESEND_API_KEY   optional; when set, each submission is emailed
//   NOTIFY_EMAIL     where notifications go (comma-separated allowed)
//   NOTIFY_FROM      verified sender, e.g. "Regnum website <forms@yourdomain>"
import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://www.regnumpecuniae.com",
  "https://regnumpecuniae.com",
  "https://nicholsgove.github.io",
  "http://localhost:4400",
  "http://127.0.0.1:4400",
  "http://localhost:8000",
  "http://127.0.0.1:8000",
  "null", // pages opened straight from disk (file://)
];

const LIMITS: Record<string, number> = {
  name: 120, email: 200, org: 160, topic: 80, sites: 40, message: 5000, page: 200,
};
const TOPICS = new Set([
  "A walkthrough", "Joining early access", "Pricing and licensing",
  "Technical or security", "Partnership or investment", "Something else",
]);
const SITES = new Set(["One site", "2 to 5 sites", "6 to 20 sites", "More than 20"]);
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function cors(origin: string | null): Record<string, string> {
  const allow = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allow,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "content-type, apikey, authorization, x-client-info",
    "Access-Control-Max-Age": "86400",
    "Vary": "Origin",
  };
}

function json(body: unknown, status: number, origin: string | null) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...cors(origin) },
  });
}

function clean(v: unknown, max: number): string {
  if (typeof v !== "string") return "";
  // drop control characters except newlines and tabs, trim, cap length
  return v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "").trim().slice(0, max);
}

async function sha256(text: string): Promise<string> {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));
}

async function notify(row: Record<string, string | null>, id: string) {
  const key = Deno.env.get("RESEND_API_KEY");
  const to = Deno.env.get("NOTIFY_EMAIL");
  const from = Deno.env.get("NOTIFY_FROM");
  if (!key || !to || !from) return "skipped";
  const kind = row.kind === "demo" ? "Demo request" : "Website message";
  const subject = `${kind}: ${row.name}${row.organisation ? ", " + row.organisation : ""}`;
  const lines: [string, string | null][] = [
    ["Name", row.name], ["Email", row.email], ["Facility", row.organisation],
    ["Topic", row.topic], ["Sites", row.sites], ["Page", row.page], ["Message", row.message],
  ];
  const html = `<p><b>${escapeHtml(kind)}</b> (reference ${id.slice(0, 8)})</p><table cellpadding="6" style="border-collapse:collapse;font-family:Arial,sans-serif;font-size:14px">${
    lines.filter(([, v]) => v).map(([k, v]) =>
      `<tr><td style="vertical-align:top;color:#505a5f">${k}</td><td style="white-space:pre-wrap">${escapeHtml(v!)}</td></tr>`
    ).join("")
  }</table><p style="color:#505a5f;font-size:12px">Reply to this email to answer ${escapeHtml(row.name ?? "")} directly.</p>`;
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from,
      to: to.split(",").map((s) => s.trim()).filter(Boolean),
      reply_to: row.email,
      subject,
      html,
    }),
  });
  return res.ok ? "sent" : `failed ${res.status}`;
}

Deno.serve(async (req) => {
  const origin = req.headers.get("Origin");
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors(origin) });
  if (req.method !== "POST") return json({ ok: false, error: "Method not allowed" }, 405, origin);
  if (origin && !ALLOWED_ORIGINS.includes(origin)) {
    return json({ ok: false, error: "Origin not allowed" }, 403, origin);
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return json({ ok: false, error: "Send the form as JSON." }, 400, origin);
  }

  // Bots: a hidden field people never see, and a form filled faster than a human could
  if (clean(body.company_website, 200)) return json({ ok: true, id: null }, 200, origin);
  const elapsed = Number(body.elapsed_ms);
  if (Number.isFinite(elapsed) && elapsed < 2500) return json({ ok: true, id: null }, 200, origin);

  const kind = body.kind === "demo" ? "demo" : "contact";
  const name = clean(body.name, LIMITS.name);
  const email = clean(body.email, LIMITS.email).toLowerCase();
  const organisation = clean(body.org, LIMITS.org) || null;
  const topicRaw = clean(body.topic, LIMITS.topic);
  const topic = topicRaw ? (TOPICS.has(topicRaw) ? topicRaw : "Something else") : null;
  const sitesRaw = clean(body.sites, LIMITS.sites);
  const sites = sitesRaw ? (SITES.has(sitesRaw) ? sitesRaw : null) : null;
  const message = clean(body.message, LIMITS.message) || null;
  const page = clean(body.page, LIMITS.page) || null;

  const errors: Record<string, string> = {};
  if (!name) errors.name = "This one is required.";
  if (!email) errors.email = "This one is required.";
  else if (!EMAIL_RE.test(email)) errors.email = "That email address looks off.";
  if (kind === "contact" && (!message || message.length < 20)) {
    errors.message = "A little more detail, please (20+ characters).";
  }
  if (kind === "demo" && !organisation) errors.org = "This one is required.";
  if (Object.keys(errors).length) return json({ ok: false, errors }, 422, origin);

  const db = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  // Rate limit by a salted hash of the sender's address (the raw IP is never stored)
  const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim() || "unknown";
  const ipHash = await sha256("rp-forms:" + ip);
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count } = await db
    .from("submissions")
    .select("id", { count: "exact", head: true })
    .eq("ip_hash", ipHash)
    .gte("created_at", since);
  if ((count ?? 0) >= 5) {
    return json({ ok: false, error: "Too many messages from this connection. Please try again in a few minutes." }, 429, origin);
  }

  const row = {
    kind, name, email, organisation, topic, sites, message, page,
    user_agent: clean(req.headers.get("user-agent"), 300) || null,
    ip_hash: ipHash,
  };
  const { data, error } = await db.from("submissions").insert(row).select("id").single();
  if (error || !data) {
    console.error("insert failed", error);
    return json({ ok: false, error: "We could not save that. Please email us directly." }, 500, origin);
  }

  let mail = "skipped";
  try {
    mail = await notify(row as Record<string, string | null>, data.id);
    if (mail !== "skipped") await db.from("submissions").update({ notified: mail === "sent" }).eq("id", data.id);
  } catch (e) {
    console.error("notify failed", e);
  }

  return json({ ok: true, id: data.id }, 200, origin);
});
