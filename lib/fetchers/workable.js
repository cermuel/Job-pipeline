// workable.js
// Public careers widget endpoint, no auth. Reads company accounts from
// config/companies.json (apply.workable.com/{slug}).

import { safeGet, makeJob } from "./base.js";
import { loadJson } from "../loadJson.js";

const companies = loadJson(import.meta.url, "../../config/companies.json");

const API_TEMPLATE = (slug) =>
  `https://apply.workable.com/api/v1/widget/accounts/${slug}`;

export async function fetchWorkable() {
  const jobs = [];
  for (const slug of companies.workable || []) {
    const res = await safeGet(API_TEMPLATE(slug), { details: "true" });
    if (!res) continue;
    const data = await res.json();
    const seen = new Set();
    for (const item of data.jobs || []) {
      // One job posted in several countries comes back once per country.
      const link = item.url || item.shortlink || "";
      if (!link || seen.has(link)) continue;
      seen.add(link);
      const place = [item.city, item.country].filter(Boolean).join(", ");
      const remote = item.telecommuting === true || item.telecommuting === "True";
      jobs.push(makeJob({
        title: item.title || "",
        company: data.name || slug,
        location: remote ? `Remote${place ? `, ${place}` : ""}` : place,
        employmentType: item.employment_type || "",
        link,
        description: item.description || "",
        source: "workable",
      }));
    }
  }
  return jobs;
}
