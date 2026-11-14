// recruitee.js
// Public careers JSON endpoint, no auth. Reads company subdomains from
// config/companies.json (for example Tether: tether.recruitee.com).

import { safeGet, makeJob } from "./base.js";
import { loadJson } from "../loadJson.js";

const companies = loadJson(import.meta.url, "../../config/companies.json");

const API_TEMPLATE = (slug) => `https://${slug}.recruitee.com/api/offers/`;

export async function fetchRecruitee() {
  const jobs = [];
  for (const slug of companies.recruitee || []) {
    const res = await safeGet(API_TEMPLATE(slug));
    if (!res) continue;
    const data = await res.json();
    for (const item of data.offers || []) {
      // Recruitee often says just "Remote job"; the slug and title usually
      // carry the real region ("...-nigeria", "(100% Remote - Worldwide)").
      const where = [item.location, item.slug, item.title].join(" ");
      const location = /nigeria/i.test(where)
        ? "Remote, Nigeria"
        : /worldwide|global/i.test(where) || item.remote
          ? "Remote, Worldwide"
          : item.location || "";
      jobs.push(makeJob({
        title: item.title || "",
        company: item.company_name || slug,
        location,
        employmentType: item.employment_type_code || "",
        link: item.careers_url || "",
        description: `${item.description || ""} ${item.requirements || ""}`,
        source: "recruitee",
      }));
    }
  }
  return jobs;
}
