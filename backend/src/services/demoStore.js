import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { v4 as uuidv4 } from "uuid";
import { seedData } from "../data/seedData.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataFile = path.join(__dirname, "../data/demo-db.json");

const ensureDb = () => {
  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify(seedData, null, 2));
  }
};

const readDb = () => {
  ensureDb();
  const db = JSON.parse(fs.readFileSync(dataFile, "utf-8"));
  let hasUpdates = false;

  for (const [collectionName, defaultValue] of Object.entries(seedData)) {
    if (!(collectionName in db)) {
      db[collectionName] = defaultValue;
      hasUpdates = true;
    }
  }

  if (hasUpdates) {
    writeDb(db);
  }

  return db;
};

const writeDb = (db) => {
  fs.writeFileSync(dataFile, JSON.stringify(db, null, 2));
};

const createCollectionApi = (collectionName) => ({
  findAll: async () => readDb()[collectionName],
  findById: async (id) => readDb()[collectionName].find((item) => item.id === id),
  findOne: async (predicate) => readDb()[collectionName].find(predicate),
  filter: async (predicate) => readDb()[collectionName].filter(predicate),
  insert: async (item) => {
    const db = readDb();
    const record = { id: item.id || uuidv4(), ...item };
    db[collectionName].push(record);
    writeDb(db);
    return record;
  },
  update: async (id, updater) => {
    const db = readDb();
    const index = db[collectionName].findIndex((item) => item.id === id);
    if (index === -1) {
      return null;
    }
    db[collectionName][index] = {
      ...db[collectionName][index],
      ...updater,
      updatedAt: new Date().toISOString()
    };
    writeDb(db);
    return db[collectionName][index];
  },
  remove: async (id) => {
    const db = readDb();
    const index = db[collectionName].findIndex((item) => item.id === id);
    if (index === -1) {
      return false;
    }
    db[collectionName].splice(index, 1);
    writeDb(db);
    return true;
  }
});

export const demoDb = {
  users: createCollectionApi("users"),
  projects: createCollectionApi("projects"),
  chats: createCollectionApi("chats"),
  projectApplications: createCollectionApi("projectApplications"),
  messages: createCollectionApi("messages"),
  payments: createCollectionApi("payments"),
  applications: createCollectionApi("applications"),
  reviews: createCollectionApi("reviews"),
  courses: createCollectionApi("courses"),
  certificates: createCollectionApi("certificates"),
  internships: createCollectionApi("internships"),
  learningProgress: createCollectionApi("learningProgress"),
  quizAttempts: createCollectionApi("quizAttempts"),
  certifications: createCollectionApi("certifications"),
  learningPosts: createCollectionApi("learningPosts")
};

export const resetDemoDb = () => writeDb(seedData);
