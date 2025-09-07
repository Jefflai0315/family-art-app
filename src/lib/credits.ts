import { Db, MongoClient, ObjectId } from "mongodb";
import clientPromise from "./mongodb";

export interface CreditTransaction {
  userEmail: string;
  amount: number; // Positive for adding credits, negative for deducting
  type: "deduction" | "refund" | "purchase";
  description: string;
  createdAt: Date;
}

export class CreditManager {
  private client: MongoClient;
  private db: Db;

  constructor(client: MongoClient) {
    this.client = client;
    this.db = client.db("bazgym");
  }

  /**
   * Check if user has enough credits for an operation
   */
  async hasEnoughCredits(
    userEmail: string,
    requiredCredits: number = 1
  ): Promise<boolean> {
    try {
      const usersCollection = this.db.collection("users");
      const user = await usersCollection.findOne({ email: userEmail });

      if (!user) {
        return false;
      }

      return (user.credits || 0) >= requiredCredits;
    } catch (error) {
      console.error("Error checking user credits:", error);
      return false;
    }
  }

  /**
   * Get current credit balance for a user
   */
  async getCredits(userEmail: string): Promise<number> {
    try {
      const usersCollection = this.db.collection("users");
      const user = await usersCollection.findOne({ email: userEmail });

      if (!user) {
        return 0;
      }

      return user.credits || 0;
    } catch (error) {
      console.error("Error getting user credits:", error);
      return 0;
    }
  }

  /**
   * Deduct credits from user account
   */
  async deductCredits(
    userEmail: string,
    amount: number = 1,
    description: string = "Generation"
  ): Promise<boolean> {
    try {
      const usersCollection = this.db.collection("users");

      // First check if user has enough credits
      const hasCredits = await this.hasEnoughCredits(userEmail, amount);
      if (!hasCredits) {
        return false;
      }

      // Deduct credits
      const result = await usersCollection.updateOne(
        { email: userEmail },
        {
          $inc: { credits: -amount },
          $set: { updatedAt: new Date() },
        }
      );

      if (result.modifiedCount === 0) {
        return false;
      }

      // Log the transaction
      await this.logTransaction({
        userEmail,
        amount: -amount,
        type: "deduction",
        description,
        createdAt: new Date(),
      });

      return true;
    } catch (error) {
      console.error("Error deducting credits:", error);
      return false;
    }
  }

  /**
   * Refund credits to user account
   */
  async refundCredits(
    userEmail: string,
    amount: number = 1,
    description: string = "Failed generation refund"
  ): Promise<boolean> {
    try {
      const usersCollection = this.db.collection("users");

      // Add credits back
      const result = await usersCollection.updateOne(
        { email: userEmail },
        {
          $inc: { credits: amount },
          $set: { updatedAt: new Date() },
        }
      );

      if (result.modifiedCount === 0) {
        return false;
      }

      // Log the transaction
      await this.logTransaction({
        userEmail,
        amount,
        type: "refund",
        description,
        createdAt: new Date(),
      });

      return true;
    } catch (error) {
      console.error("Error refunding credits:", error);
      return false;
    }
  }

  /**
   * Log a credit transaction
   */
  private async logTransaction(transaction: CreditTransaction): Promise<void> {
    try {
      const transactionsCollection = this.db.collection("credit_transactions");
      await transactionsCollection.insertOne(transaction);
    } catch (error) {
      console.error("Error logging credit transaction:", error);
    }
  }

  /**
   * Get user credit history
   */
  async getCreditHistory(
    userEmail: string,
    limit: number = 10
  ): Promise<CreditTransaction[]> {
    try {
      const transactionsCollection = this.db.collection("credit_transactions");
      const transactions = await transactionsCollection
        .find({ userEmail })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();

      return transactions as unknown as CreditTransaction[];
    } catch (error) {
      console.error("Error getting credit history:", error);
      return [];
    }
  }
}

/**
 * Helper function to get a CreditManager instance
 */
export async function getCreditManager(): Promise<CreditManager> {
  const client = await clientPromise;
  return new CreditManager(client);
}
