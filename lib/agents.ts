import { ObjectId, type WithId, type Document } from "mongodb";
import client from "./db";

const DB_NAME = "fireclaw";

export interface Agent {
  _id?: ObjectId;
  userId: string;
  name: string;
  template: "sales" | "support" | "assistant" | "custom";
  status: "provisioning" | "running" | "stopped" | "error";
  serverId?: string; // Hetzner server ID
  serverIp?: string;
  gatewayToken?: string; // OpenClaw gateway auth token
  region: string;
  channels: {
    whatsapp: boolean;
    telegram: boolean;
    webchat: boolean;
  };
  messageCount: number;
  createdAt: Date;
  updatedAt: Date;
}

function agents() {
  return client.db(DB_NAME).collection<Agent>("agents");
}

export async function createAgent(
  data: Omit<Agent, "_id" | "createdAt" | "updatedAt" | "messageCount" | "channels" | "status">
): Promise<Agent> {
  const now = new Date();
  const agent: Omit<Agent, "_id"> = {
    ...data,
    status: "provisioning",
    channels: { whatsapp: false, telegram: false, webchat: false },
    messageCount: 0,
    createdAt: now,
    updatedAt: now,
  };
  const result = await agents().insertOne(agent as Document as Agent);
  return { ...agent, _id: result.insertedId };
}

export async function getAgentsByUser(userId: string): Promise<Agent[]> {
  const docs = await agents().find({ userId }).sort({ createdAt: -1 }).toArray();
  return docs as unknown as Agent[];
}

export async function getAgentById(
  id: string,
  userId: string
): Promise<Agent | null> {
  if (!ObjectId.isValid(id)) return null;
  const doc = await agents().findOne({
    _id: new ObjectId(id),
    userId,
  });
  return doc as unknown as Agent | null;
}

export async function updateAgent(
  id: string,
  userId: string,
  update: Partial<Pick<Agent, "name" | "status" | "serverId" | "serverIp" | "gatewayToken" | "channels">>
): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const result = await agents().updateOne(
    { _id: new ObjectId(id), userId },
    { $set: { ...update, updatedAt: new Date() } }
  );
  return result.modifiedCount === 1;
}

export async function deleteAgent(id: string, userId: string): Promise<boolean> {
  if (!ObjectId.isValid(id)) return false;
  const result = await agents().deleteOne({
    _id: new ObjectId(id),
    userId,
  });
  return result.deletedCount === 1;
}

export async function countAgentsByUser(userId: string): Promise<number> {
  return agents().countDocuments({ userId });
}
