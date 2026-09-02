import { JobnetClient } from "../src/jobnet-client.ts";
import { JobbankClient } from "../src/providers/jobbank/client.ts";
import { JobindexClient } from "../src/providers/jobindex/client.ts";
import { JobdanmarkClient } from "../src/providers/jobdanmark/client.ts";

const checks: Record<string, unknown> = {};

const jobnet = await new JobnetClient().search({ searchString: "data", resultsPerPage: 1, pageNumber: 1, orderType: "PublicationDate", kmRadius: 50 });
checks.jobnet = { total: jobnet.totalJobAdCount, returned: jobnet.jobAds.length };

const jobbank = await new JobbankClient().search({ keywords: "data", page: 1, limit: 1 });
checks.jobbank = { returned: jobbank.jobs.length, filteredResultsUrl: jobbank.resultsUrl };

const jobindex = await new JobindexClient().search({ query: "data", exactPhrase: false, maxAgeDays: 30, page: 1, limit: 1 });
checks.jobindex = { returned: jobindex.jobs.length, publishedResultsUrl: jobindex.resultsUrl };

const jobdanmarkClient = new JobdanmarkClient();
const settings = await jobdanmarkClient.getSettings();
const jobdanmark = await jobdanmarkClient.search({ query: "data", page: 1, limit: 1 });
checks.jobdanmark = { returned: jobdanmark.jobs.length, total: jobdanmark.totalItems, categories: settings.categories.length, jobTypes: settings.jobTypes };

console.log(JSON.stringify({ status: "ok", checkedAt: new Date().toISOString(), checks }, null, 2));
