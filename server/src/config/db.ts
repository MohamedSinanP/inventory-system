import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const connectDB = async (): Promise<void> => {
  try {
    const uri = process.env.PORT;

    await mongoose.connect(process.env.MONGO_URI as string, {})
    console.log("Mongodb connected successfully");

  } catch (error) {
    console.error("Mongodb connection failed ", error);
    process.exit(1);
  }
}

export default connectDB;