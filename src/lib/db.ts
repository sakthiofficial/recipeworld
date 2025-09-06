import mongoose from "mongoose";

const MONGODB_URI = process.env.MONGODB_URI || "";

if (!MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

const cached: {
  connection?: typeof mongoose;
  promise?: Promise<typeof mongoose>;
} = {};

export async function connectDB() {
  if (cached.connection) {
    return cached.connection;
  }
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI, {
      bufferCommands: false,
    });
  }
  cached.connection = await cached.promise;
  (global as { mongoose?: typeof cached }).mongoose = cached;
  return cached.connection;
}
