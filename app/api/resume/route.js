// app/api/resume/route.js
// Downloads one of your 3 CVs: /api/resume?cv=frontend_engineer
// Only CV names listed in config/cvMapping.json work, so no other file can be requested.

import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { RESUME_FILE_BY_CV, DEFAULT_CV } from "../../../lib/resumes.js";


export async function GET(request) {
  const cv = new URL(request.url).searchParams.get("cv") || DEFAULT_CV;
  const fileName = Object.hasOwn(RESUME_FILE_BY_CV, cv) ? RESUME_FILE_BY_CV[cv] : null;
  if (!fileName) {
    return NextResponse.json({ error: "Unknown CV" }, { status: 400 });
  }

  const filePath = path.join(process.cwd(), "resumes", fileName);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json(
      { error: "Resume file not found" },
      { status: 404 },
    );
  }

  const data = fs.readFileSync(filePath);
  return new NextResponse(data, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${fileName}"`,
    },
  });
}
