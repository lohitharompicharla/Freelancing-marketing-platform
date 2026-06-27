import fs from "fs";
import path from "path";
import multer from "multer";

const uploadDir = path.resolve(process.cwd(), "src/uploads/resumes");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const safeName = `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`;
    cb(null, safeName);
  }
});

const allowedMimeTypes = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/octet-stream"
]);

const allowedExtensions = new Set([".pdf", ".doc", ".docx"]);

export const resumeUpload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    if (allowedMimeTypes.has(file.mimetype) && allowedExtensions.has(extension)) {
      cb(null, true);
      return;
    }
    cb(new Error("Only PDF, DOC, and DOCX files are allowed"));
  }
});

const projectUploadDir = path.resolve(process.cwd(), "src/uploads/projects");
if (!fs.existsSync(projectUploadDir)) {
  fs.mkdirSync(projectUploadDir, { recursive: true });
}

export const projectUpload = multer({
  storage: multer.diskStorage({
    destination: (_req, _file, cb) => cb(null, projectUploadDir),
    filename: (_req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`);
    }
  }),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit for project files
});
