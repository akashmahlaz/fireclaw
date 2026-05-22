# MEMORY.md — Persistent Knowledge

## Task Reference: Scenario 1

### Search Values
**Ads.txt lines to find:**
- Domain: `bematterfull.com` | ID: ANY | ROLE: ANY

**Sellers.json partners to cross-reference:**
- `pubnative.net`
- `smaato.com`

### Algorithm (Step by Step)
1. Identify input type: Android app (bundle), iOS app (numeric ID), or Website (domain)
2. For apps: fetch app store page → extract publisher name + website URL → extract root domain
3. Generate ads.txt/app-ads.txt link from root domain
4. Fetch file → collect all `bematterfull.com` lines
5. Fetch `bematterfull.com/sellers.json` → find seller_ids for pubnative.net and smaato.com
6. For each partner: check if their seller_id appears as RESELLER in ads.txt
7. If yes: fetch partner's sellers.json → find publisher domain as PUBLISHER → verify DIRECT in publisher's ads.txt
8. Determine STATUS: OK if at least 1 partner has complete schain

### Key URLs
- bematterfull.com sellers.json: `https://bematterfull.com/sellers.json`
- pubnative sellers.json: `https://pubnative.net/sellers.json`
- smaato sellers.json: `https://smaato.com/sellers.json`

### Domain Matching Rule
ALWAYS exact root domain match. `falcongames.com.vn` ≠ `falcongames.com`. Use root domain from app store only.

### Status Logic
- **OK**: At least 1 of the 2 partners has full verified schain
- **NO**: Neither partner verified

## Progress Tracking
Save batch results to: `memory/batch-<N>-results.json`
Track overall progress in: `memory/progress.json`
