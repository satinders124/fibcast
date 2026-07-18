# Fibcast Network Connector

The bridge between Fibcast and your **Syrotech OLT**. The app never talks to
the OLT directly — an outbound-only connector does, on a machine that can
reach the OLT's LAN.

```
Fibcast App  →  API Gateway (verifies Firebase login + owner/staff role)
                      ↕ HTTPS only
                 Connector (this folder)  ←  small service near the OLT
                      ↕ HTTP/Telnet — LAN only
                 Syrotech OLT  →  OMCI  →  Customer ONTs
```

## Phase plan

| Phase | What | Status |
|---|---|---|
| 0 | Device Hub in app (modem fields, copy creds, open-admin deep link) | **Done** (this release) |
| 1 | **Discovery** — map the Syrotech web UI with `discovery.mjs` | ← you are here |
| 2 | Syrotech adapter — poll ONUs every ~60s: online/offline, RX power, uptime | Pending discovery output |
| 3 | API gateway (Firebase-auth + role checks) → Firestore status per customer | Planned |
| 4 | Actions: reboot ONT (and later GenieACS for remote WiFi changes) | Planned |

## Run discovery (5 minutes, read-only)

On any laptop **connected to the OLT's network**:

```bash
node connector/discovery.mjs 192.168.8.100      # ← your OLT's IP
```

It performs **GET requests only** — no logins, no writes, no config changes —
and saves what the UI exposes into `connector/dumps/<timestamp>/` (gitignored,
contains OLT fingerprints — share privately, never commit).

Send us the dump (or screenshots of the OLT's web GUI: ONU list page + ONU
detail page). The adapter is written against *your* firmware's real pages —
not guessed.

## Two unknowns to check while you're at it

1. **How is the OLT managed today?** Open a browser on a machine on-site and
   try the OLT's IP (typical Syrotech defaults: `192.168.8.100`,
   `192.168.1.100`, `10.0.0.2` — check the sticker or your installer's notes).
   If you get a Syrotech/Hsgq-style login page, you have the answer.
2. **Is there a MikroTik/PPPoE server?** Look at what's plugged between the
   OLT's uplink and the internet. A single router doing PPPoE = your BNG.
   (If yes, we get live sessions and disconnects for free later.)

## Hosting note (VPS + VPN)

You chose VPS + VPN tunnel. A tunnel needs **one always-on peer at the OLT
site**: the site router (MikroTik/any box that supports WireGuard/IPSec) or a
Raspberry Pi. The connector then runs on the VPS and reaches the OLT through
the tunnel. Decide the on-site peer before Phase 2.

## Hardening rules (non-negotiable)

- OLT management IP must **never** be reachable from the public internet.
- Change the OLT's default admin password before the connector goes live.
- Connector account on the OLT = least privilege; read-only if the firmware allows.
- No WAN-side admin on customer ONTs. Ever.
- All app → gateway traffic authenticated with Firebase ID tokens + role check.
  Gateway allow-lists actions; raw OLT responses never leave the backend.
