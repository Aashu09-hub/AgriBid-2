import { User, Product, Contract, Message } from "../shared/schema";
import { IStorage } from "./types";
import type {
  User as IUser,
  InsertUser,
  Product as IProduct,
  InsertProduct,
  Contract as IContract,
  InsertContract,
  Message as IMessage,
  InsertMessage,
} from "@shared/schema";
import mongoose from "mongoose";

export class MongoStorage implements IStorage {
  async getAllUsers(): Promise<IUser[]> {
    return User.find();
  }

  async getUser(id: string): Promise<IUser | undefined> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid user ID");
    }
    return User.findById(id);
  }

  async getUserByUsername(username: string): Promise<IUser | undefined> {
    return User.findOne({ username });
  }

  async createUser(user: InsertUser): Promise<IUser> {
    return await User.create(user);
  }

  async getAllProducts(): Promise<IProduct[]> {
    return Product.find();
  }

  async getProduct(id: string): Promise<IProduct | undefined> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid product ID");
    }
    return Product.findById(id);
  }

  async createProduct(product: InsertProduct & { farmerId: string; status: string }): Promise<IProduct> {
    if (!mongoose.Types.ObjectId.isValid(product.farmerId)) {
      throw new Error("Invalid farmerId");
    }
    try {
      const newProduct = await Product.create(product);
      console.log("Product created successfully:", newProduct);
      return newProduct;
    } catch (error) {
      console.error("Error creating product:", error);
      throw error;
    }
  }

  async updateProduct(id: string, updates: Partial<IProduct>): Promise<IProduct | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid product ID");
    }
    return Product.findByIdAndUpdate(id, updates, { new: true });
  }

  async getContract(id: string): Promise<IContract | undefined> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid contract ID");
    }
    return Contract.findById(id);
  }

  async createContract(contract: InsertContract & { buyerId: string; farmerId: string; status: string }): Promise<IContract> {
    if (!mongoose.Types.ObjectId.isValid(contract.buyerId) || !mongoose.Types.ObjectId.isValid(contract.farmerId)) {
      throw new Error("Invalid buyerId or farmerId");
    }
    return await Contract.create(contract);
  }

  async updateContract(id: string, updates: Partial<IContract>): Promise<IContract | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new Error("Invalid contract ID");
    }
    return Contract.findByIdAndUpdate(id, updates, { new: true });
  }

  async getContractsByUser(userId: string): Promise<IContract[]> {
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error("Invalid user ID");
    }
    return Contract.find({ $or: [{ buyerId: userId }, { farmerId: userId }] });
  }

  async createMessage(message: InsertMessage & { senderId: string; receiverId: string }): Promise<IMessage> {
    if (!mongoose.Types.ObjectId.isValid(message.senderId) || !mongoose.Types.ObjectId.isValid(message.receiverId)) {
      throw new Error("Invalid senderId or receiverId");
    }
    return await Message.create(message);
  }

  async getMessagesBetweenUsers(user1Id: string, user2Id: string): Promise<IMessage[]> {
    if (!mongoose.Types.ObjectId.isValid(user1Id) || !mongoose.Types.ObjectId.isValid(user2Id)) {
      throw new Error("Invalid user IDs");
    }
    return Message.find({
      $or: [
        { senderId: user1Id, receiverId: user2Id },
        { senderId: user2Id, receiverId: user1Id },
      ],
    });
  }
}

export const storage = new MongoStorage();
