// intake-submit: backend for the public project intake form at finessemedia.pro/start.
//
// Two calls from the form:
//   1) { action: "prepare", files: [{ name, type, size, field }] }
//      -> creates a submission id and returns one signed upload URL per file
//         (files go straight to the private "intake-uploads" bucket).
//   2) { action: "submit", submissionId, data, files, hp }
//      -> saves the submission, adds a lead to the admin Leads board,
//         emails Angel the full brief (with file links) and emails the client a confirmation.
//
// Secrets:
//   RESEND_API_KEY      (required for emails; without it the submission still saves)
//   CALLMEBOT_APIKEY    (optional; when set, Angel also gets a WhatsApp alert through CallMeBot)
//   INTAKE_ALERT_PHONE  (optional; WhatsApp number for the alert, default 14079609004)
import { createClient } from 'npm:@supabase/supabase-js@2.45.4';

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });

const BUCKET = 'intake-uploads';
const MAX_FILES = 20;
const MAX_SIZE = 25 * 1024 * 1024;
const FROM = Deno.env.get('INTAKE_FROM') ?? 'Finesse Media <hello@alerts.finessemedia.pro>';
const ANGEL = Deno.env.get('INTAKE_ALERT_EMAIL') ?? 'angel@finessemedia.pro';
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const esc = (s: unknown) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
const clip = (s: unknown, n = 4000) => String(s ?? '').trim().slice(0, n);
const safeName = (s: string) => s.normalize('NFKD').replace(/[^\w.\-]+/g, '-').replace(/-+/g, '-').slice(-80) || 'file';

type Section = { title: string; rows: [string, string][] };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  const db = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, { auth: { persistSession: false } });

  let body: Record<string, any>;
  try { body = await req.json(); } catch { return json({ error: 'Bad request' }, 400); }

  // ---------- 1) prepare uploads ----------
  if (body.action === 'prepare') {
    const files = Array.isArray(body.files) ? body.files.slice(0, MAX_FILES) : [];
    const submissionId = crypto.randomUUID();
    const uploads = [];
    for (const [i, f] of files.entries()) {
      const size = Number(f?.size ?? 0);
      if (!f?.name || size <= 0 || size > MAX_SIZE) { uploads.push({ error: 'too_large' }); continue; }
      const path = `${submissionId}/${String(i + 1).padStart(2, '0')}-${clip(f.field, 20).replace(/\W/g, '') || 'file'}-${safeName(String(f.name))}`;
      const { data, error } = await db.storage.from(BUCKET).createSignedUploadUrl(path);
      uploads.push(error ? { error: error.message } : { path, signedUrl: data.signedUrl });
    }
    return json({ submissionId, uploads });
  }

  // ---------- 2) submit ----------
  if (body.action !== 'submit') return json({ error: 'Unknown action' }, 400);
  if (body.hp) return json({ ok: true }); // honeypot filled: quietly drop bots

  const submissionId = UUID.test(String(body.submissionId ?? '')) ? String(body.submissionId) : crypto.randomUUID();
  const d = (body.data ?? {}) as Record<string, any>;
  const fullName = clip(d.fullName, 120), email = clip(d.email, 200).toLowerCase();
  if (!fullName || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ error: 'Name and a valid email are required.' }, 400);
  if (d.depositAck !== true) return json({ error: 'Please confirm the deposit note.' }, 400);

  // Light rate limit: 3 submissions per email per 10 minutes.
  const since = new Date(Date.now() - 10 * 60 * 1000).toISOString();
  const { count } = await db.from('intake_submissions').select('id', { count: 'exact', head: true }).ilike('email', email).gte('created_at', since);
  if ((count ?? 0) >= 3) return json({ error: 'Too many submissions. Please try again in a few minutes.' }, 429);

  // Only keep file paths that belong to this submission.
  const files = (Array.isArray(body.files) ? body.files : [])
    .filter((f: any) => typeof f?.path === 'string' && f.path.startsWith(submissionId + '/'))
    .slice(0, MAX_FILES)
    .map((f: any) => ({ path: f.path, name: clip(f.name, 160), field: clip(f.field, 40) }));

  const sections: Section[] = Array.isArray(body.summary) ? body.summary.slice(0, 20).map((s: any) => ({
    title: clip(s?.title, 80),
    rows: (Array.isArray(s?.rows) ? s.rows : []).slice(0, 60).map((r: any) => [clip(r?.[0], 120), clip(r?.[1], 3000)] as [string, string]),
  })) : [];
  const stillNeeded = (Array.isArray(body.stillNeeded) ? body.stillNeeded : []).slice(0, 20).map((s: unknown) => clip(s, 80));
  const lang = body.lang === 'es' ? 'es' : 'en';
  const biz = clip(d.bizName, 160) || null;
  const phone = clip(d.phone, 40) || null;

  // Lead for the admin Leads board.
  const [first, ...rest] = fullName.split(/\s+/);
  const { data: lead } = await db.from('leads').insert({
    first_name: first, last_name: rest.join(' ') || null, business_name: biz, email, phone,
    service_interest: 'Web Design', source: 'website', status: 'new',
    notes: `Project intake form (finessemedia.pro/start). Submission ${submissionId}. Still needed: ${stillNeeded.join(', ') || 'nothing'}.`,
  }).select('id').maybeSingle();

  const { error: insErr } = await db.from('intake_submissions').insert({
    id: submissionId, lang, full_name: fullName, business_name: biz, email, phone,
    client_slug: clip(body.clientSlug, 60) || null,
    answers: { data: d, summary: sections }, still_needed: stillNeeded, files,
    deposit_ack: true, lead_id: lead?.id ?? null,
  });
  if (insErr) return json({ error: 'Could not save your form. Please try again.' }, 500);

  // File links for Angel (valid 90 days; files stay in the bucket after that).
  const links: { name: string; field: string; url: string }[] = [];
  for (const f of files) {
    const { data } = await db.storage.from(BUCKET).createSignedUrl(f.path, 60 * 60 * 24 * 90);
    if (data?.signedUrl) links.push({ name: f.name, field: f.field, url: data.signedUrl });
  }

  const resendKey = Deno.env.get('RESEND_API_KEY');
  const sent: Record<string, unknown> = {};
  if (resendKey) {
    const send = (payload: Record<string, unknown>) => fetch('https://api.resend.com/emails', {
      method: 'POST', headers: { Authorization: `Bearer ${resendKey}`, 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
    }).then((r) => r.ok).catch(() => false);

    // Brief to Angel
    const font = 'font-family:-apple-system,Segoe UI,Helvetica,Arial,sans-serif';
    const secHtml = sections.map((s) => `<h3 style="${font};font-size:15px;color:#93702E;margin:22px 0 8px;text-transform:uppercase;letter-spacing:.08em">${esc(s.title)}</h3>
      <table style="width:100%;border-collapse:collapse;${font};font-size:14px">${s.rows.map(([k, v]) => `<tr><td style="padding:6px 10px 6px 0;color:#706858;vertical-align:top;width:38%">${esc(k)}</td><td style="padding:6px 0;color:#24211C;white-space:pre-wrap">${esc(v)}</td></tr>`).join('')}</table>`).join('');
    const fileHtml = links.length ? `<h3 style="${font};font-size:15px;color:#93702E;margin:22px 0 8px;text-transform:uppercase;letter-spacing:.08em">Files</h3><ul style="${font};font-size:14px;padding-left:18px">${links.map((l) => `<li><a href="${esc(l.url)}">${esc(l.name)}</a> <span style="color:#706858">(${esc(l.field)})</span></li>`).join('')}</ul><p style="${font};font-size:12px;color:#706858">File links work for 90 days.</p>` : '';
    const needHtml = stillNeeded.length ? `<p style="${font};font-size:14px;background:#FAF6EE;border:1px solid #EDE4D3;border-radius:10px;padding:12px 14px"><b>Still needed:</b> ${esc(stillNeeded.join(', '))}</p>` : '';
    const contact = [email, phone].filter(Boolean).join(' · ');
    sent.angel = await send({
      from: FROM, to: [ANGEL], reply_to: email,
      subject: `New project intake: ${fullName}${biz ? ` (${biz})` : ''}`,
      html: `<div style="max-width:640px;margin:0 auto;padding:24px 18px">
        <p style="${font};font-size:13px;color:#93702E;letter-spacing:.14em;text-transform:uppercase;margin:0 0 6px">finessemedia.pro/start</p>
        <h2 style="font-family:Georgia,serif;font-weight:500;font-size:26px;margin:0 0 6px;color:#24211C">${esc(fullName)}${biz ? ` <span style="color:#706858">· ${esc(biz)}</span>` : ''}</h2>
        <p style="${font};font-size:14px;color:#24211C;margin:0 0 14px">${esc(contact)} · Updates in ${lang === 'es' ? 'Spanish' : 'English'}</p>
        ${needHtml}${secHtml}${fileHtml}
        <p style="${font};font-size:12px;color:#706858;margin-top:26px">Deposit note accepted. Hit reply to answer ${esc(first)} directly.</p></div>`,
    });

    // Confirmation to the client
    const es = lang === 'es';
    const hi = es ? `Hola ${first},` : `Hi ${first},`;
    const lines = es ? [
      'Recibí tu formulario. Gracias por tomarte el tiempo.',
      'Voy a revisar todo y te contacto en 1 a 2 días laborables con los próximos pasos y tu propuesta.',
      stillNeeded.length ? `Cuando puedas, envíame lo que falta: ${stillNeeded.join(', ')}. Solo responde a este correo.` : '',
      'Si tienes preguntas, responde a este correo o escríbeme por WhatsApp al (407) 960-9004.',
      'Angel Gerena\nFundador, Finesse Media LLC\nfinessemedia.pro',
    ] : [
      'I got your form. Thanks for taking the time.',
      "I'll review everything and reach out within 1 to 2 business days with next steps and your proposal.",
      stillNeeded.length ? `Whenever you can, send me what's still missing: ${stillNeeded.join(', ')}. Just reply to this email.` : '',
      'Questions? Reply to this email or message me on WhatsApp at (407) 960-9004.',
      'Angel Gerena\nFounder, Finesse Media LLC\nfinessemedia.pro',
    ];
    const body2 = [hi, ...lines.filter(Boolean)];
    sent.client = await send({
      from: FROM, to: [email], reply_to: ANGEL,
      subject: es ? 'Recibí tu formulario | Finesse Media' : 'I got your project form | Finesse Media',
      text: body2.join('\n\n'),
      html: `<div style="max-width:520px;margin:0 auto;padding:28px 20px">${body2.map((l) => `<p style="margin:0 0 16px;${font};font-size:16px;line-height:1.55;color:#24211C">${esc(l).replace(/\n/g, '<br>')}</p>`).join('')}</div>`,
    });
  }

  // Optional WhatsApp alert (CallMeBot, free personal API).
  const cmb = Deno.env.get('CALLMEBOT_APIKEY');
  if (cmb) {
    const phoneTo = Deno.env.get('INTAKE_ALERT_PHONE') ?? '14079609004';
    const text = `New project intake: ${fullName}${biz ? ` (${biz})` : ''}. ${email}${phone ? ` · ${phone}` : ''}. Check your email for the full brief.`;
    sent.whatsapp = await fetch(`https://api.callmebot.com/whatsapp.php?phone=${phoneTo}&text=${encodeURIComponent(text)}&apikey=${encodeURIComponent(cmb)}`).then((r) => r.ok).catch(() => false);
  }

  return json({ ok: true, submissionId, sent });
});
