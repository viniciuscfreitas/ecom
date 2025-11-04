import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./lib/prisma";
import productsRoutes from "./routes/products";
import ordersRoutes from "./routes/orders";
import adminRoutes from "./routes/admin";
import paymentsRoutes from "./routes/payments";
import shippingRoutes from "./routes/shipping";

dotenv.config();

const app = express();

const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(",") || ["http://localhost:3000"];
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

const webhookMiddleware = express.raw({ type: 'application/json' });
app.use("/api/webhooks/abacatepay", webhookMiddleware);
app.use(express.json());

app.use("/api/products", productsRoutes);
app.use("/api/orders", ordersRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api", paymentsRoutes);
app.use("/api/shipping", shippingRoutes);

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    console.log("Connecting to database...");
    await prisma.$connect();
    console.log("Database connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

startServer();

process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

