import fs from "fs/promises";
import path from "path";

const knownSkills = [
  "C++",
  "Java",
  "React",
  "Next.js",
  "Node.js",
  "Express",
  "MongoDB",
  "JavaScript",
  "TypeScript",
  "HTML",
  "CSS",
  "Tailwind CSS",
  "Figma",
  "Branding",
  "REST API",
  "UI Design",
  "Communication",
  "Python",
  "PHP",
  "MySQL",
  "AWS",
  "Docker",
  "PostgreSQL",
  "Redux",
  "GraphQL",
  "API Integration",
  "UI/UX",
  "Git",
  "GitHub",
  "SQL",
  "DBMS",
  "Machine Learning",
  "Artificial Intelligence",
  "NLP",
  "Flask",
  "Salesforce",
  "Apex",
  "Lightning Web Components",
  "LWC",
  "Visualforce",
  "Data Structures",
  "Algorithms",
  "GenAI"
];

const emailPattern = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i;

const sectionAliases = {
  summary: ["profile summary", "summary", "objective"],
  experience: ["experience", "work experience", "employment", "internships", "internship"],
  projects: ["projects", "project", "selected projects", "academic projects", "portfolio"],
  education: ["education", "academics", "academic background"],
  skills: ["skills", "technical skills", "technical skillssoft skills"],
  certifications: ["certifications", "certificates", "achievements"]
};

const normalizeText = (text) =>
  text
    .replace(/\r/g, "")
    .replace(/[•●▪◦·]/g, "\n• ")
    .replace(/[|]/g, " | ")
    .replace(/[§#ï]/g, " ")
    .replace(/[^\S\n]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const normalizeList = (entries = []) =>
  [
    ...new Set(
      entries
        .map((entry) =>
          String(entry)
            .replace(/^[\W_]+/, "")
            .replace(/\s+/g, " ")
            .trim()
        )
        .filter(Boolean)
    )
  ];

const toComparable = (value = "") =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9+#/.& ]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const headingToSection = (line = "") => {
  const comparable = toComparable(line);
  return Object.entries(sectionAliases).find(([, aliases]) => aliases.includes(comparable))?.[0] || null;
};

const splitLines = (text = "") =>
  text
    .split(/\n/)
    .map((line) => line.trim())
    .filter(Boolean);

const buildSections = (lines = []) => {
  const sections = {};
  let currentSection = "header";

  for (const line of lines) {
    const nextSection = headingToSection(line);

    if (nextSection) {
      currentSection = nextSection;
      if (!sections[currentSection]) {
        sections[currentSection] = [];
      }
      continue;
    }

    if (!sections[currentSection]) {
      sections[currentSection] = [];
    }

    sections[currentSection].push(line);
  }

  return sections;
};

const mergeWrappedLines = (lines = []) => {
  const merged = [];

  for (const line of lines) {
    if (!merged.length) {
      merged.push(line);
      continue;
    }

    const previous = merged[merged.length - 1];
    const startsBullet = /^•\s*/.test(line);
    const looksLikeNewEntry = /^[A-Z][A-Za-z0-9/&,+(). -]{3,}$/.test(line) || /\|/.test(line);

    if (!startsBullet && !looksLikeNewEntry && previous.length < 140) {
      merged[merged.length - 1] = `${previous} ${line}`.replace(/\s+/g, " ").trim();
    } else {
      merged.push(line);
    }
  }

  return merged;
};

const sanitizePhone = (value = "") => {
  const digits = String(value).replace(/[^\d+]/g, "");

  if (!digits) {
    return "";
  }

  if (digits.startsWith("+") && digits.length >= 11) {
    const compact = digits.slice(1);
    return compact.startsWith("91") && compact.length === 12 ? `+91 ${compact.slice(2)}` : digits;
  }

  if (digits.length === 10) {
    return `+91 ${digits}`;
  }

  if (digits.length === 12 && digits.startsWith("91")) {
    return `+91 ${digits.slice(2)}`;
  }

  return digits.length >= 10 ? digits : "";
};

const extractSkills = (text, skillLines = []) => {
  const normalizedText = ` ${toComparable(text)} `;
  const detectedByDictionary = knownSkills.filter((skill) => {
    const comparable = toComparable(skill);
    return comparable && normalizedText.includes(` ${comparable} `);
  });

  const detectedFromLines = skillLines.flatMap((line) =>
    line
      .replace(/^•\s*/, "")
      .split(/[:|,]/)
      .map((part) => part.trim())
      .filter((part) => part.length > 1 && !/^(technical skills|soft skills|languages|web|databases|technologies|concepts)$/i.test(part))
  );

  return normalizeList([...detectedByDictionary, ...detectedFromLines]).slice(0, 20);
};

const extractProjectTitles = (lines = []) => {
  const projects = [];

  for (const line of mergeWrappedLines(lines)) {
    const cleaned = line.replace(/^•\s*/, "").trim();

    if (!cleaned || cleaned.length < 4) {
      continue;
    }

    if (/^(built|developed|implemented|designed|integrated|evaluated|added)\b/i.test(cleaned)) {
      continue;
    }

    const title = cleaned.split("|")[0].trim();

    if (/^[A-Z][A-Za-z0-9&,+()./| -]{3,}$/.test(cleaned) && /\s/.test(title) && title.length <= 65) {
      projects.push(title);
    }
  }

  return normalizeList(projects).slice(0, 8);
};

const extractEducationEntries = (lines = []) =>
  normalizeList(
    mergeWrappedLines(lines).filter(
      (line) =>
        !/^•\s*/.test(line) &&
        /(b\.?tech|m\.?tech|bca|mca|bsc|msc|bachelor|master|university|college|gpa)/i.test(line)
    )
  ).slice(0, 5);

const extractExperienceEntries = (lines = []) =>
  normalizeList(
    mergeWrappedLines(lines).filter(
      (line) =>
        !/^•\s*/.test(line) &&
        /(intern|developer|engineer|analyst|designer|salesforce|remote|present|jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)/i.test(
          line
        )
    )
  ).slice(0, 6);

const inferExperienceLevel = (experienceEntries = []) => {
  const score = experienceEntries.reduce((total, entry) => {
    if (/(intern|trainee|student)/i.test(entry)) {
      return total + 1;
    }
    if (/(developer|engineer|analyst|specialist)/i.test(entry)) {
      return total + 2;
    }
    return total + 1;
  }, 0);

  if (score >= 5) {
    return "Expert";
  }
  if (score >= 2) {
    return "Intermediate";
  }
  return "Beginner";
};

const tryParsePdf = async (filePath) => {
  const pdfParse = (await import("pdf-parse")).default;
  const buffer = await fs.readFile(filePath);
  const result = await pdfParse(buffer);
  return result.text || "";
};

const tryParseDocx = async (filePath) => {
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value || "";
};

export const parseResumeFile = async (file) => {
  if (!file) {
    throw new Error("Resume file is required");
  }

  const extension = path.extname(file.originalname).toLowerCase();
  let text = "";

  try {
    if (extension === ".pdf") {
      text = await tryParsePdf(file.path);
    } else if (extension === ".docx") {
      text = await tryParseDocx(file.path);
    } else {
      text = await fs.readFile(file.path, "utf-8");
    }
  } catch (_error) {
    text = await fs.readFile(file.path).then((buffer) => buffer.toString("utf-8")).catch(() => "");
  }

  if (!text.trim()) {
    throw new Error("Unable to parse resume content");
  }

  const cleanedText = normalizeText(text);
  const lines = splitLines(cleanedText);
  const sections = buildSections(lines);
  const headerLines = sections.header || [];
  const detectedName =
    headerLines.find((line) => /^[A-Z][A-Za-z.' -]{2,50}$/.test(line) && !emailPattern.test(line) && !/\d/.test(line)) ||
    lines.find((line) => /^[A-Z][A-Za-z.' -]{2,50}$/.test(line) && !emailPattern.test(line) && !/\d/.test(line)) ||
    "";
  const extractedSkills = extractSkills(cleanedText, sections.skills || []);
  const extractedProjects = extractProjectTitles(sections.projects || []);
  const extractedEducation = extractEducationEntries(sections.education || []);
  const extractedExperience = extractExperienceEntries(sections.experience || []);
  const detectedEmail = cleanedText.match(emailPattern)?.[0] || "";
  const detectedPhone =
    sanitizePhone(
      headerLines.join(" ").match(/(\+?\d[\d\s()-]{9,}\d)/)?.[0] ||
        cleanedText.match(/(\+?\d[\d\s()-]{9,}\d)/)?.[0] ||
        ""
    ) || "";

  return {
    rawText: cleanedText,
    skills: extractedSkills,
    projects: extractedProjects,
    education: extractedEducation,
    experience: extractedExperience,
    name: detectedName,
    email: detectedEmail,
    phone: detectedPhone,
    experienceLevel: inferExperienceLevel(extractedExperience)
  };
};
