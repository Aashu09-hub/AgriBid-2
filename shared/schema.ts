import mongoose, { Schema, Document } from "mongoose";
import { z } from "zod";

// Define User schema
export interface IUser extends Document {
  username: string;
  password: string;
  role: "farmer" | "buyer";
  fullName: string;
  email: string;
  phoneNumber?: string;
}

const UserSchema = new Schema<IUser>({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["farmer", "buyer"], required: true },
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phoneNumber: { type: String },
});

export const User = mongoose.model<IUser>("User", UserSchema);

// Define Product schema
export interface IProduct extends Document {
  farmerId: mongoose.Types.ObjectId;
  name: string;
  description: string;
  quantity: string;
  unit: string;
  price: string;
  status: "available" | "sold" | "pending";
  createdAt: Date;
}

const ProductSchema = new Schema<IProduct>({
  farmerId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  name: { type: String, required: true },
  description: { type: String, required: true },
  quantity: { type: String, required: true },
  unit: { type: String, required: true },
  price: { type: String, required: true },
  status: { type: String, enum: ["available", "sold", "pending"], required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Product = mongoose.model<IProduct>("Product", ProductSchema);

// Define Contract schema
export interface IContract extends Document {
  buyerId: mongoose.Types.ObjectId;
  farmerId: mongoose.Types.ObjectId;
  productId: mongoose.Types.ObjectId;
  quantity: string;
  price: string;
  status: "pending" | "accepted" | "rejected" | "completed";
  deliveryDate: Date;
  createdAt: Date;
}

const ContractSchema = new Schema<IContract>({
  buyerId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  farmerId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  productId: { type: Schema.Types.ObjectId, required: true, ref: "Product" },
  quantity: { type: String, required: true },
  price: { type: String, required: true },
  status: { type: String, enum: ["pending", "accepted", "rejected", "completed"], required: true },
  deliveryDate: { type: Date, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Contract = mongoose.model<IContract>("Contract", ContractSchema);

// Define Message schema
export interface IMessage extends Document {
  senderId: mongoose.Types.ObjectId;
  receiverId: mongoose.Types.ObjectId;
  content: string;
  createdAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  senderId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  receiverId: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export const Message = mongoose.model<IMessage>("Message", MessageSchema);

// Zod Schemas for Validation
export const insertUserSchema = z.object({
  username: z.string(),
  password: z.string(),
  role: z.enum(["farmer", "buyer"]),
  fullName: z.string(),
  email: z.string(),
  phoneNumber: z.string().optional(),
});

export const insertProductSchema = z.object({
  farmerId: z.string(),
  name: z.string(),
  description: z.string(),
  quantity: z.string(),
  unit: z.string(),
  price: z.string(),
  status: z.enum(["available", "sold", "pending"]),
});

export const insertContractSchema = z.object({
  buyerId: z.string(),
  farmerId: z.string(),
  productId: z.string(),
  quantity: z.string(),
  price: z.string(),
  status: z.enum(["pending", "accepted", "rejected", "completed"]),
  deliveryDate: z.string(),
});

export const insertMessageSchema = z.object({
  senderId: z.string(),
  receiverId: z.string(),
  content: z.string(),
});

// Infer TypeScript types from Zod schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type InsertContract = z.infer<typeof insertContractSchema>;
export type InsertMessage = z.infer<typeof insertMessageSchema>;
