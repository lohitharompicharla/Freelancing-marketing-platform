import Chat from "../models/Chat.js";
import { isMongoConnected } from "../config/db.js";
import { demoDb } from "./demoStore.js";

export const sanitizeChat = (chat) => ({
  id: chat.id || chat._id?.toString(),
  projectId: chat.projectId?.toString?.() || chat.projectId,
  clientId: chat.clientId?.toString?.() || chat.clientId,
  freelancerId: chat.freelancerId?.toString?.() || chat.freelancerId,
  participantIds: (chat.participantIds || []).map((participantId) => participantId?.toString?.() || participantId),
  lastMessageAt: chat.lastMessageAt || chat.updatedAt || chat.createdAt,
  createdAt: chat.createdAt,
  updatedAt: chat.updatedAt
});

export const ensureProjectChat = async (project) => {
  if (!project?.clientId || !project?.freelancerId) {
    return null;
  }

  const payload = {
    projectId: project.id || project._id?.toString() || project.projectId,
    clientId: project.clientId?.toString?.() || project.clientId,
    freelancerId: project.freelancerId?.toString?.() || project.freelancerId,
    participantIds: [project.clientId?.toString?.() || project.clientId, project.freelancerId?.toString?.() || project.freelancerId],
    lastMessageAt: new Date()
  };

  if (isMongoConnected()) {
    const chat = await Chat.findOneAndUpdate(
      { projectId: payload.projectId },
      payload,
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();
    return sanitizeChat(chat);
  }

  const existing = await demoDb.chats.findOne((chat) => chat.projectId === payload.projectId);
  if (existing) {
    const updated = await demoDb.chats.update(existing.id, payload);
    return sanitizeChat(updated);
  }

  const inserted = await demoDb.chats.insert({
    ...payload,
    lastMessageAt: new Date().toISOString(),
    createdAt: new Date().toISOString()
  });
  return sanitizeChat(inserted);
};

export const getChatsForUser = async (userId) => {
  if (isMongoConnected()) {
    const chats = await Chat.find({ participantIds: userId }).sort({ lastMessageAt: -1 }).lean();
    return chats.map(sanitizeChat);
  }

  const chats = await demoDb.chats.filter((chat) => (chat.participantIds || []).includes(userId));
  return chats
    .map(sanitizeChat)
    .sort((left, right) => new Date(right.lastMessageAt || 0).getTime() - new Date(left.lastMessageAt || 0).getTime());
};

export const getChatByProjectId = async (projectId) => {
  if (isMongoConnected()) {
    const chat = await Chat.findOne({ projectId }).lean();
    return chat ? sanitizeChat(chat) : null;
  }

  const chat = await demoDb.chats.findOne((item) => item.projectId === projectId);
  return chat ? sanitizeChat(chat) : null;
};
