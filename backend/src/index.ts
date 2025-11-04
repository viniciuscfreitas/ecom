import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./lib/prisma";
import productsRoutes from "./routes/products";
import ordersRoutes from "./routes/orders";
import adminRoutes from "./routes/admin";
import paymentsRoutes from "./routes/payments";

dotenv.config();

const app = express();

app.use(cors());

const webhookMiddleware = express.raw({ type: 'application/json' });
app.use("/api/webhooks/abacatepay", webhookMiddleware);
app.use(express.json());

app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", paymentsRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

