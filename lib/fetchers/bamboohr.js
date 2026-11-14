// bamboohr.js
// Public careers JSON endpoints, no auth. Reads company subdomains from
// config/companies.json.
//
// The list endpoint has no descriptions, and the scorer needs one to see
// your skills, so each developer-looking job also gets its detail page.
// Non-developer jobs (sales, finance...) skip that extra request.

import { safeGet, makeJob } from "./base.js";
import { loadJson } from "../loadJson.js";

const companies = loadJson(import.meta.url, "../../config/companies.json");

const LIST_URL = (slug) => `https://${slug}.bamboohr.com/careers/list`;
const DETAIL_URL = (slug, id) =>
  `https://${slug}.bamboohr.com/careers/${id}/detail`;

const DEV_TITLE =
  /engineer|developer|frontend|front-end|full[- ]?stack|software|mobile|web/i;

// BambooHR marks remote jobs with locationType "1" (or isRemote).
function locationOf(item) {
  const place = [
    item.location?.city || item.atsLocation?.city,
    item.atsLocation?.country,
  ]
    .filter(Boolean)
    .join(", ");
  const remote = item.isRemote === true || String(item.locationType) === "1";
  if (remote) return place ? `Remote, ${place}` : "Remote";
  return place;
}

export async function fetchBambooHR() {
  const jobs = [];
  for (const slug of companies.bamboohr || []) {
    const res = await safeGet(LIST_URL(slug));
    if (!res) continue;
    const data = await res.json();
    for (const item of data.result || []) {
      const title = item.jobOpeningName || "";
      let description = "";
      if (DEV_TITLE.test(title)) {
        const detail = await safeGet(DETAIL_URL(slug, item.id));
        if (detail) {
          const body = await detail.json().catch(() => null);
          description = body?.result?.jobOpening?.description || "";
        }
      }
      jobs.push(makeJob({
        title: title.trim(),
        company: slug,
        location: locationOf(item),
        employmentType: item.employmentStatusLabel || "",
        link: `https://${slug}.bamboohr.com/careers/${item.id || ""}`,
        description,
        source: "bamboohr",
      }));
    }
  }
  return jobs;
}
