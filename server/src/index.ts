import "dotenv/config";
import express from "express";
import authRouter from "./routers/authRouter.js";
import userRouter from "./routers/userRouter.js";
import courseRouter from "./routers/courseRouter.js";
import lessonRouter from "./routers/lessonRouter.js";
import reviewRouter from "./routers/reviewRouter.js";
import moduleRouter from "./routers/moduleRouter.js";
import categoryRouter from "./routers/categoryRouter.js";
import enrollmentRouter from "./routers/enrollmentRouter.js";
import cartRouter from "./routers/cartRouter.js";
import progressRouter from "./routers/progressRouter.js";
import wishlistRouter from "./routers/wishlistRouter.js";
import paymentRouter from "./routers/paymentRouter.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import { authenticate } from "./middleware/authMiddleware.js";
import path from "path";
import { fileURLToPath } from "url";


const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
// const PORT = 3000;

app.use(express.json());

// Enable cookie parser
app.use(cookieParser());

app.use((req, _res, next) => {
  const sessionId = req.cookies?.sessionId;
  if (sessionId) {
    (req as any).sessionId = sessionId;
  }
  next();
});

const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.FRONTEND_URL_2,
  "https://kvault.online",
  "https://www.kvault.online"
].filter(Boolean);

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests with no origin (e.g., Postman, mobile apps)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        // Return null, false to block CORS without throwing a 500 error on the server
        callback(null, false);
      }
    },
    credentials: true,
  }),
);
// Serve static files from uploads directory
app.use("/uploads", express.static("uploads"));


const API_VERSION = process.env.API_VERSION || "api/v1";

app.use(`/${API_VERSION}/auth`, authRouter);
app.use(`/${API_VERSION}/user`, authenticate, userRouter);
app.use(`/${API_VERSION}/cart`, authenticate, cartRouter);
app.use(`/${API_VERSION}/wishlist`, authenticate, wishlistRouter);



app.use(`/${API_VERSION}/courses`, courseRouter);
app.use(`/${API_VERSION}/reviews`, reviewRouter);
app.use(`/${API_VERSION}/categories`, categoryRouter);
app.use(`/${API_VERSION}/lessons`, lessonRouter);
app.use(`/${API_VERSION}/enrollments`, authenticate, enrollmentRouter);
app.use(`/${API_VERSION}/modules`, moduleRouter);
app.use(`/${API_VERSION}/progress`, authenticate, progressRouter);
app.use(`/${API_VERSION}/payment`, authenticate, paymentRouter);

app.get("/", (req, res) => {
  res.send("Hello from Express + TypeScript!");
});

// app.listen(PORT, () => {
//   console.log(`Server running at http://localhost:${PORT}`);
// });


export default app