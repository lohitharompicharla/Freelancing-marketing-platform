import Message from "../models/Message.js";
import Project from "../models/Project.js";
import Chat from "../models/Chat.js";
import { isMongoConnected } from "../config/db.js";
import { demoDb } from "../services/demoStore.js";
import { ensureProjectChat, getChatByProjectId, getChatsForUser, sanitizeChat } from "../services/chatService.js";

const toId = (value) => value?.toString?.() || value || "";

const sanitizeMessage = (message) => ({
  id: message.id || message._id?.toString(),
  chatId: toId(message.chatId),
  projectId: toId(message.projectId),
  clientId: toId(message.clientId),
  freelancerId: toId(message.freelancerId),
  senderId: toId(message.senderId),
  text: message.text,
  createdAt: message.createdAt,
  updatedAt: message.updatedAt
});

const sortMessages = (messages = []) =>
  [...messages].sort((left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime());

const getProjectById = async (projectId) => {
  if (isMongoConnected()) {
    const mongoProject = await Project.findById(projectId).lean();
    if (mongoProject) {
      return mongoProject;
    }
  }

  return demoDb.projects.findById(projectId);
};

export const getChats = async (req, res) => {
  const userId = req.user.id;

  if (isMongoConnected()) {
    return res.json(await getChatsForUser(userId));
  }

  const chats = await demoDb.chats.filter((chat) => (chat.participantIds || []).includes(userId));
  res.json(
    chats
      .map(sanitizeChat)
      .sort((left, right) => new Date(right.lastMessageAt || 0).getTime() - new Date(left.lastMessageAt || 0).getTime())
  );
};

export const createChat = async (req, res) => {
  const { projectId } = req.body;

  if (!projectId) {
    return res.status(400).json({ message: "projectId is required" });
  }

  const project = await getProjectById(projectId);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (!project.clientId || !project.freelancerId) {
    return res.status(400).json({ message: "Both client and freelancer must be assigned to create chat" });
  }

  const isParticipant = [toId(project.clientId), toId(project.freelancerId)].includes(req.user.id);
  if (!isParticipant && req.user.role !== "client") {
    return res.status(403).json({ message: "You are not allowed to create this chat" });
  }

  const chat = await ensureProjectChat(project);
  return res.status(201).json(chat);
};

export const getChatsByUserId = async (req, res) => {
  const { userId } = req.params;

  if (req.user.id !== userId) {
    return res.status(403).json({ message: "You can only access your own chats" });
  }

  const chats = await getChatsForUser(userId);
  return res.json(chats);
};

export const getMessages = async (req, res) => {
  const userId = req.user.id;

  if (isMongoConnected()) {
    const messages = await Message.find({
      $or: [{ clientId: userId }, { freelancerId: userId }]
    }).lean();
    return res.json(sortMessages(messages).map(sanitizeMessage));
  }

  const messages = await demoDb.messages.filter((message) => message.clientId === userId || message.freelancerId === userId);
  res.json(sortMessages(messages).map(sanitizeMessage));
};

export const getMessagesByChatId = async (req, res) => {
  const { chatId } = req.params;

  let chat;
  if (isMongoConnected()) {
    chat = await Chat.findById(chatId).lean();
  } else {
    chat = await demoDb.chats.findById(chatId);
  }

  if (!chat) {
    return res.status(404).json({ message: "Chat not found" });
  }

  const isParticipant = [toId(chat.clientId), toId(chat.freelancerId)].includes(req.user.id);
  if (!isParticipant) {
    return res.status(403).json({ message: "You are not allowed to access this conversation" });
  }

  if (isMongoConnected()) {
    const messages = await Message.find({ chatId }).sort({ createdAt: 1 }).lean();
    return res.json(messages.map(sanitizeMessage));
  }

  const messages = await demoDb.messages.filter((message) => message.chatId === chatId);
  return res.json(sortMessages(messages).map(sanitizeMessage));
};

export const createMessage = async (req, res) => {
  const { projectId, text } = req.body;
  const normalizedText = String(text || "").trim();

  if (!projectId || !normalizedText) {
    return res.status(400).json({ message: "Project id and message text are required" });
  }

  const project = await getProjectById(projectId);

  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }

  if (!project.freelancerId) {
    return res.status(400).json({ message: "Assign a freelancer to this project before starting chat" });
  }

  const isParticipant = [toId(project.clientId), toId(project.freelancerId)].includes(req.user.id);
  if (!isParticipant) {
    return res.status(403).json({ message: "You are not allowed to access this conversation" });
  }

  const chat = (await getChatByProjectId(projectId)) || (await ensureProjectChat(project));

  const payload = {
    chatId: chat.id,
    projectId,
    clientId: toId(project.clientId),
    freelancerId: toId(project.freelancerId),
    senderId: req.user.id,
    text: normalizedText,
    createdAt: new Date().toISOString()
  };

  let message;

  if (isMongoConnected()) {
    message = await Message.create(payload);
    const { default: Chat } = await import("../models/Chat.js");
    await Chat.findByIdAndUpdate(chat.id, { lastMessageAt: new Date() });
  } else {
    message = await demoDb.messages.insert(payload);
    await demoDb.chats.update(chat.id, { lastMessageAt: payload.createdAt });
  }

  res.status(201).json(sanitizeMessage(message));
};
