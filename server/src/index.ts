import "dotenv/config";
import express from "express";
import connectDB from "./db/mongodb.js";
import authRouter from "./routers/authRouter.js";
import userRouter from "./routers/userRouter.js";
import cors from "cors"


const app = express();
const PORT = 3000;

// Enable JSON body parser
app.use(express.json());

// Enable CORS
app.use(cors({
  origin : process.env.FRONTEND_URL as string,
  credentials : true
}));

await connectDB();

// Mount API routes
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);

app.get("/", (req, res) => {
  res.send("Hello from Express + TypeScript!");
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});