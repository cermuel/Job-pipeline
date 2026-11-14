// resumes.js
// One place for "which PDF belongs to which CV". The file names come from
// config/cvMapping.json, so swapping a CV means editing that file only.

import { loadJson } from "./loadJson.js";

const cvMapping = loadJson(import.meta.url, "../config/cvMapping.json");

export const RESUME_FILE_BY_CV = Object.fromEntries(
  Object.entries(cvMapping)
    .filter(([key, value]) => !key.startsWith("_") && value?.resumeFile)
    .map(([key, value]) => [key, value.resumeFile]),
);

export const DEFAULT_CV =
  Object.entries(cvMapping).find(([, v]) => v?.isDefault)?.[0] ||
  Object.keys(RESUME_FILE_BY_CV)[0];

// The PDF for a CV name, falling back to the default CV.
export function resumeFileFor(cvKey) {
  return RESUME_FILE_BY_CV[cvKey] || RESUME_FILE_BY_CV[DEFAULT_CV];
}
