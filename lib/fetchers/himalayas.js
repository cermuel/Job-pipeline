// himalayas.js
// Public jobs API, no key required. https://himalayas.app/jobs/api
//
// Two passes:
//   1. The latest jobs feed (any country).
//   2. A search per keyword limited to jobs open to Nigeria. This is where
//      most "remote, Africa" and "remote, Nigeria" roles show up.

import { safeGet, makeJob } from "./base.js";

const FEED_URL = "https://himalayas.app/jobs/api";
const SEARCH_URL = "https://himalayas.app/jobs/api/search";

const SEARCH_COUNTRY = "Nigeria";
const SEARCH_TERMS = [
  "react",
  "next.js",
  "vue",
  "nuxt",
  "frontend",
  "full stack",
  "node.js",
  "laravel",
  "typescript",
  "react native",
];

function toJob(item) {
  const locations = item.locationRestrictions || [];
  return makeJob({
    title: item.title || "",
    company: item.companyName || "",
    // A long country list that includes Nigeria is shortened so the
    // location filter and the sheet both stay readable.
    location: !locations.length
      ? "Worldwide"
      : locations.length > 8 && locations.includes(SEARCH_COUNTRY)
        ? `Remote, ${locations.length} countries incl. ${SEARCH_COUNTRY}`
        : locations.join(", "),
    employmentType: item.employmentType || "",
    link: item.applicationLink || item.guid || "",
    description: item.description || "",
    source: "himalayas",
  });
}

export async function fetchHimalayas(limit = 100) {
  const jobs = [];
  const seen = new Set();
  const add = (item) => {
    const job = toJob(item);
    if (!job.link || seen.has(job.link)) return;
    seen.add(job.link);
    jobs.push(job);
  };

  const feed = await safeGet(FEED_URL, { limit });
  if (feed) for (const item of (await feed.json()).jobs || []) add(item);

  for (const q of SEARCH_TERMS) {
    const res = await safeGet(SEARCH_URL, {
      q,
      country: SEARCH_COUNTRY,
      sort: "recent",
    });
    if (!res) continue;
    for (const item of (await res.json()).jobs || []) add(item);
  }
  return jobs;
}
