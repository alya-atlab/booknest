import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db";
import authRoutes from "./routes/auth.route";
import userRoutes from "./routes/user.route";
import bookRoutes from "./routes/book.route";
import cartRoutes from "./routes/cart.route";
import orderRoutes from "./routes/order.route";
import { errorMiddleware } from "./middlewares/error.middleware";
import cors from "cors";
dotenv.config();
const app = express();

app.use(express.json());
const PORT = process.env.PORT as string;

connectDB();
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);
app.use("/auth", authRoutes);
app.use("/user", userRoutes);
app.use("/books", bookRoutes);
app.use("/cart", cartRoutes);
app.use("/orders", orderRoutes);

app.use(errorMiddleware);
app.listen(PORT, () => console.log(`API running on ${PORT}`));
