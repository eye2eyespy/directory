import { prisma } from "@/lib/prisma";
import { format } from "date-fns";

const COLUMNS = [
  { name: "external_id", required: false, note: "Permanent ID such as ROOF-000101. Used to update existing rows. Do not change it after the first import." },
  { name: "business_name", required: true, note: "Listing title. Required on every row." },
  { name: "slug", required: false, note: "URL slug. Generated from the name if left blank." },
  { name: "description", required: false, note: "About text on the profile." },
  { name: "phone", required: false, note: "Main phone number." },
  { name: "email", required: false, note: "Public or lead email." },
  { name: "website", required: false, note: "Full URL, including https://." },
  { name: "address_1", required: false, note: "Street address." },
  { name: "city", required: false, note: "City name, e.g. Orlando." },
  { name: "state", required: false, note: "Full name or abbreviation, e.g. Florida or FL." },
  { name: "zip", required: false, note: "Postal code." },
  { name: "country", required: false, note: "Defaults to US." },
  { name: "latitude", required: false, note: "Map pin. Decimal degrees." },
  { name: "longitude", required: false, note: "Map pin. Decimal degrees." },
  { name: "google_place_id", required: false, note: "Google Place ID for later enrichment." },
  { name: "video_url", required: false, note: "YouTube or Vimeo URL." },
  { name: "hero_image_url", required: false, note: "Direct image URL for the listing card." },
  { name: "featured", required: false, note: "true or false." },
  { name: "sponsored", required: false, note: "true or false." },
  { name: "verified", required: false, note: "true or false." },
  { name: "published", required: false, note: "true or false. Defaults to true if blank." },
];

export default async function ImportsPage() {
  const [industries, jobs] = await Promise.all([
    prisma.industry.findMany({ orderBy: { name: "asc" } }),
    prisma.importJob.findMany({ orderBy: { createdAt: "desc" }, take: 20, include: { errors: true } }),
  ]);

  return (
    <div>
      <h1 className="text-3xl font-bold tracking-tight text-navy">Imports</h1>
      <p className="mt-1 text-sm text-ink-soft">
        Spreadsheet rows create or update businesses. Matching uses <code>external_id</code>, never the business name.
      </p>

      <section className="mt-6 rounded-xl border border-line bg-white p-5">
        <h2 className="text-lg font-bold tracking-tight">1. Download the template</h2>
        <p className="mt-2 text-sm text-ink-soft">
          Use this CSV as the starting file. Keep the header row exactly as it is. Add one business per row. You can
          save it as .csv, .xls, or .xlsx before uploading.
        </p>
        <a href="/templates/business-import-template.csv" download className="btn btn-primary mt-4">
          Download import template
        </a>
      </section>

      <section className="mt-6 rounded-xl border border-line bg-white p-5">
        <h2 className="text-lg font-bold tracking-tight">2. How to fill and upload</h2>
        <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm text-ink">
          <li>Open the template in Excel, Google Sheets, or Numbers.</li>
          <li>
            Give every business a unique <strong>external_id</strong> (example: <code>ROOF-000101</code>). Re-importing
            the same ID updates that listing instead of creating a duplicate.
          </li>
          <li>
            <strong>business_name</strong> is required. Other columns can be blank.
          </li>
          <li>
            For yes/no fields (<code>featured</code>, <code>sponsored</code>, <code>verified</code>,{" "}
            <code>published</code>) use <code>true</code> / <code>false</code>, or <code>yes</code> / <code>no</code>.
          </li>
          <li>Do not rename, reorder, or delete the header columns.</li>
          <li>Choose the industry below. That industry is applied to every row in the file.</li>
          <li>Upload the saved CSV or Excel file and click <strong>Upload and import</strong>.</li>
        </ol>
      </section>

      <section className="mt-6 rounded-xl border border-line bg-white p-5">
        <h2 className="text-lg font-bold tracking-tight">3. Upload file</h2>
        <form action="/api/imports/csv" method="post" encType="multipart/form-data" className="mt-4 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-soft">Industry</label>
            <select name="industryId" required className="w-full max-w-md rounded-lg border border-line bg-white px-3 py-2.5 text-sm">
              {industries.map((industry) => (
                <option key={industry.id} value={industry.id}>
                  {industry.name}
                </option>
              ))}
            </select>
            <p className="mt-1 text-xs text-ink-soft">Applied to all rows in this file.</p>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wider text-ink-soft">File</label>
            <input
              type="file"
              name="file"
              accept=".csv,.xls,.xlsx"
              required
              className="block w-full text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-navy file:px-3 file:py-2 file:font-semibold file:text-paper"
            />
            <p className="mt-1 text-xs text-ink-soft">Accepted: .csv, .xls, .xlsx</p>
          </div>
          <button className="btn btn-primary">Upload and import</button>
        </form>
      </section>

      <section className="mt-6 overflow-hidden rounded-xl border border-line bg-white">
        <div className="border-b border-line px-5 py-3">
          <h2 className="text-lg font-bold tracking-tight">Column reference</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-paper-2 text-xs uppercase tracking-wide text-ink-soft">
              <tr>
                <th className="px-5 py-2">Column</th>
                <th className="px-5 py-2">Required</th>
                <th className="px-5 py-2">Notes</th>
              </tr>
            </thead>
            <tbody>
              {COLUMNS.map((column) => (
                <tr key={column.name} className="border-t border-line align-top">
                  <td className="px-5 py-2 font-mono text-xs">{column.name}</td>
                  <td className="px-5 py-2">{column.required ? "Yes" : "No"}</td>
                  <td className="px-5 py-2 text-ink-soft">{column.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <h2 className="mt-10 text-2xl font-bold tracking-tight text-navy">History</h2>
      <ul className="mt-3 divide-y divide-line rounded-xl border border-line bg-white">
        {jobs.map((job) => (
          <li key={job.id} className="px-4 py-3 text-sm">
            <div className="flex justify-between">
              <span className="font-medium">{job.filename}</span>
              <span className="text-ink-soft">{format(job.createdAt, "MMM d, yyyy HH:mm")}</span>
            </div>
            <p className="text-ink-soft">
              {job.status} · {job.rowsProcessed} rows · +{job.createdCount} / ~{job.updatedCount} / skip {job.skippedCount}{" "}
              / fail {job.failedCount}
            </p>
          </li>
        ))}
        {!jobs.length ? <li className="px-4 py-6 text-sm text-ink-soft">No imports yet.</li> : null}
      </ul>
    </div>
  );
}
