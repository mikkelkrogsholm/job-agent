import { JobnetClient } from "../src/jobnet-client.ts";

const client = new JobnetClient();
const search = await client.search({
  searchString: "data",
  resultsPerPage: 2,
  pageNumber: 1,
  orderType: "PublicationDate",
  employmentDurationType: "Permanent",
  workHoursType: "FullTime",
  regions: [
    "Nordjylland",
    "Midtjylland",
    "Syddanmark",
    "HovedstadenOgBornholm",
    "OevrigeSjaelland",
  ],
  kmRadius: 50,
});

if (
  !Array.isArray(search.jobAds) ||
  typeof search.totalJobAdCount !== "number"
) {
  throw new Error("Jobnet search returned an unexpected response shape");
}

const areas = await client.listOccupations();
if (!areas.some((area) => area.hierarchyLevel === "OccupationArea")) {
  throw new Error("Jobnet occupation hierarchy returned no occupation areas");
}

const suggestions = await client.suggestTerms("dataanal");
const firstJob = search.jobAds[0];
const detailVerified = firstJob
  ? firstJob.isExternal
    ? (await client.findJobById(firstJob.jobAdId))?.jobAdId === firstJob.jobAdId
    : (await client.getJob(firstJob.jobAdId)).id === firstJob.jobAdId
  : false;

console.log(
  JSON.stringify(
    {
      status: "ok",
      totalMatchingJobs: search.totalJobAdCount,
      returnedJobs: search.jobAds.length,
      occupationAreas: areas.length,
      suggestions,
      detailVerified,
    },
    null,
    2,
  ),
);
