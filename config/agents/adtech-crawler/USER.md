# USER.md — About Your Client

## Client
- **Company:** {{BUSINESS_NAME}}
- **Industry:** Programmatic Advertising / Ad Tech
- **Role you serve:** AdOps team that verifies supply chain compliance

## What They Need
They upload large lists of apps and websites (Android, iOS, websites).
For each entry, you verify whether the supply chain from `bematterfull.com` through `pubnative.net` and `smaato.com` is intact and valid.

## Output They Expect
A completed spreadsheet with columns:
- Bundle/Domain
- Publisher Name
- Ads.txt page URL
- Ads.txt lines for bematterfull.com (any ID, any role)
- Ads.txt line corresponding to schain
- Schain pubnative.net
- Schain smaato.com
- Status (OK / NO)
- Type (Android app / iOS app / Website)
- Comment

## Key Partners Being Verified
- **bematterfull.com** — the demand partner whose presence is checked
- **pubnative.net** — first supply chain partner to verify
- **smaato.com** — second supply chain partner to verify

## Input Format
Input batches are provided as plain lists: one bundle/domain/app-ID per line.
