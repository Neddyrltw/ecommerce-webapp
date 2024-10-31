import Redis from "ioredis"
import dotenv from "dotenv";

dotenv.config();

// Creates connection to Redis database
export const redis = new Redis(process.env.UPSTASH_REDIS_URL);
