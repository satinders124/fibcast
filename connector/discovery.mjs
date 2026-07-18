#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────
// Fibcast OLT Discovery (READ-ONLY)
//
// Maps what the OLT's web management UI exposes so a real adapter
// can be written against the actual firmware pages — not guesses.
//
//   node connector/discovery.mjs <olt-ip>
//
// Safety guarantees:
//   - GET requests only. No POSTs, no logins, no credentials, no writes.
//   - Requires an explicit PRIVATE IP argument.
//   - Saves responses locally to connector/dumps/<ts>/ (gitignored).
// ─────────────────────────────────────────────────────────────

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ip = (process.argv[2] || '').trim();

function isPrivateIp(v) {
  const parts = v.split('.');
  const quad  = parts.length === 4 && parts.every(o => /^\d{1,3}$/.test(o) && Number(o) <= 255);
  return quad && (/^10\./.test(v) || /^192\.168\./.test(v) || /^172\.(1[6-9]|2\d|3[01])\./.test(v));
}

if (!isPrivateIp(ip)) {
  console.error('Usage: node connector/discovery.mjs <private-olt-ip>');
  console.error('Example: node connector/discovery.mjs 192.168.8.100');
  process.exit(1);
}

const BASE   = `http://${ip}`;
const TS     = new Date().toISOString().replace(/[:.]/g, '-');
const OUTDIR = path.join(__dirname, 'dumps', TS);
const TIMEOUT_MS = 5000;

// Common entry points on Syrotech-family (Realtek OEM) web UIs.
// All are GETs. 404s are useful data too.
const CANDIDATE_PATHS = [
  '/login.cgi', '/index.cgi', '/index.html', '/main.html',
  '/status.html', '/status_device_info.asp',
  '/pon/onu_list.asp', '/gpon_onu_list.asp', '/onu_list.asp',
  '/ont_list.asp', '/cgi-bin/onu_list', '/cgi-bin/status',
];

const seen      = new Map(); // url -> { status, type, bytes }
const linkQueue = [];

async function probe(url, depth = 0) {
  if (seen.has(url)) return;
  seen.set(url, { pending: true });

  const ctrl = new AbortController();
  const t    = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res  = await fetch(url, { signal: ctrl.signal, redirect: 'follow' });
    const body = await res.text();
    const meta = { status: res.status, type: res.headers.get('content-type') || '', bytes: body.length };
    seen.set(url, meta);

    const slug = url.replace(BASE, '').replace(/[^a-z0-9]+/gi, '_') || '_root';
    await writeFile(
      path.join(OUTDIR, `${String(seen.size).padStart(3, '0')}${slug}.txt`),
      `URL: ${url}\nStatus: ${meta.status}\nContent-Type: ${meta.type}\nBytes: ${meta.bytes}\n${'─'.repeat(60)}\n${body}`
    );

    if (depth === 0 && meta.status === 200 && /html/i.test(meta.type)) {
      const links = new Set();
      for (const m of body.matchAll(/(?:href|src|action)\s*=\s*["']([^"'#]+?)["']/gi)) {
        try {
          const u = new URL(m[1], BASE);
          if (u.origin === BASE) links.add(u.href);
        } catch { /* ignore malformed */ }
      }
      linkQueue.push(...links);
    }
  } catch (e) {
    seen.set(url, { status: 'ERROR', type: '', bytes: 0, error: String(e.code || e.message || e) });
  } finally {
    clearTimeout(t);
  }
}

async function main() {
  await mkdir(OUTDIR, { recursive: true });
  console.log(`Probing OLT web UI at ${BASE} (read-only GETs)…\n`);

  await probe(BASE + '/');

  for (const p of CANDIDATE_PATHS) await probe(BASE + p);

  // Depth-1 crawl of links found on the root page (cap to stay polite).
  for (const url of linkQueue.slice(0, 30)) await probe(url);

  const manifest = Object.fromEntries([...seen.entries()].sort());
  await writeFile(path.join(OUTDIR, 'manifest.json'), JSON.stringify(manifest, null, 2));

  const hits = [...seen.entries()].filter(([, m]) => m.status === 200);
  console.log('── Pages found (HTTP 200) ─────────────────────────');
  hits.forEach(([u, m]) => console.log(`  ${u.replace(BASE, '') || '/'}  [${m.type}; ${m.bytes}b]`));
  if (!hits.length) console.log('  (none — is the IP right? is this machine on the OLT LAN?)');
  console.log(`\nSaved ${seen.size} probes → ${OUTDIR}`);
  console.log('Share the dump folder (or GUI screenshots) privately — it contains OLT fingerprints.');
}

main().catch(e => { console.error('Discovery failed:', e.message); process.exit(1); });
