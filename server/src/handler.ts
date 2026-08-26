import serverless from "serverless-http";
import app from "./index.js";
import connectDB from "./db/mongodb.js";

await connectDB();
export const hello = serverless(app);