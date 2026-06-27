import fs from "fs";
import path from "path";

const certificateDir = path.resolve(process.cwd(), "src/uploads/certificates");

if (!fs.existsSync(certificateDir)) {
  fs.mkdirSync(certificateDir, { recursive: true });
}

const sanitizeFilePart = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const generateCertificateAsset = async ({ userName, courseTitle, issuedAt, certificateNumber }) => {
  const safeCourse = sanitizeFilePart(courseTitle || "course");
  const safeUser = sanitizeFilePart(userName || "user");
  const fileName = `${Date.now()}-${safeUser}-${safeCourse}.html`;
  const filePath = path.join(certificateDir, fileName);
  const issueDate = new Date(issuedAt).toLocaleDateString("en-IN");

  const certificateMarkup = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${courseTitle} Certificate</title>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: linear-gradient(135deg, #07111f, #12314e);
        font-family: Georgia, "Times New Roman", serif;
        color: #10233a;
      }
      .frame {
        width: min(920px, calc(100vw - 32px));
        background: linear-gradient(145deg, #fff9e7, #f0dfae);
        border: 12px solid #7c5c17;
        border-radius: 24px;
        padding: 56px;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.35);
      }
      .eyebrow {
        letter-spacing: 0.35em;
        text-transform: uppercase;
        font-size: 12px;
        color: #7c5c17;
      }
      h1 {
        margin: 18px 0 12px;
        font-size: 54px;
      }
      h2 {
        margin: 0;
        font-size: 34px;
      }
      p {
        font-size: 18px;
        line-height: 1.7;
      }
      .meta {
        display: flex;
        justify-content: space-between;
        gap: 24px;
        margin-top: 44px;
        font-size: 15px;
      }
    </style>
  </head>
  <body>
    <main class="frame">
      <div class="eyebrow">FreelanceFlow Certification</div>
      <h1>Certificate of Completion</h1>
      <p>This certifies that</p>
      <h2>${userName}</h2>
      <p>has successfully completed the course</p>
      <h2>${courseTitle}</h2>
      <div class="meta">
        <span>Issued on ${issueDate}</span>
        <span>Certificate No. ${certificateNumber}</span>
      </div>
    </main>
  </body>
</html>`;

  await fs.promises.writeFile(filePath, certificateMarkup, "utf-8");

  return {
    downloadUrl: `/api/uploads/certificates/${fileName}`,
    fileName
  };
};
