# Provider contracts

Verified against the public Danish sites in September 2026. “Verified” describes observed website behavior, not a stability promise or endorsement by the portal.

## Jobnet

Uses `GET https://jobnet.dk/bff/FindJob/Search` with repeated query parameters and `x-csrf: 1`. Details, occupation hierarchy, and typeahead use sibling BFF endpoints. The adapter covers the complete currently verified search schema. External advertisements can lack a detail record; exact-ID search supplies a limited fallback.

The BFF is public but undocumented. For sustained production use, contact STAR and evaluate the official JobannonceService.

## Akademikernes Jobbank

`/job/` and `/job/rss` accept the same search parameters. The adapter requests `/job/rss?...`, so Jobbank itself applies `key`, `antikey`, repeated numeric filters, company, remote-work, date, and page. RSS is a server-generated representation of the chosen search, not a global feed filtered in this project. A valid empty RSS channel is an empty result; malformed/non-RSS feeds or items without a title or link are provider errors. Returned item URLs must be exact HTTPS Jobbank job paths. Details are read from public semantic HTML and require a nonblank title and sanitized body.

## Jobindex

The adapter creates the same navigable `/jobsoegning/...` URL as the site, fetches it, and follows its `<link type="application/rss+xml">`. Thus Jobindex resolves category/area paths and query parameters before returning its published result representation. A valid empty RSS channel is an empty result; malformed/non-RSS feeds or items without a title or link are provider errors. Returned item URLs must be exact HTTPS Jobindex detail paths. Details are read from the public `/vis-job/...` result page and require a nonblank title and sanitized body.

Only verified filters are exposed. Radius/address, employment type, working hours, and home-working UI filters are explicitly not claimed yet. A future addition must prove the site's server-side representation and add fixtures/live checks first.

## Jobdanmark

The Vue frontend uses:

- `GET /api/jobsearch/settings`
- `GET /api/search/locations?q=...`
- `POST /api/jobsearch/search/{page}`

The adapter reads current category/title values, resolves location semantics, and submits the same structured filter body. Details come from the page's JobPosting JSON-LD. These endpoints are public but undocumented and may change.

## Operational policy

Requests are user-triggered, bounded, cached, and use an identifying user-agent. Successful provider HTTP responses are cached per client instance for their TTL, with expired entries swept on each request and FIFO eviction after 256 entries; failures are never cached. Do not crawl entire catalogs, bypass access controls, or use the code to defeat rate limits. Before public/high-volume use, review each portal's current terms, robots policy, attribution requirements, and any contractual API options.
