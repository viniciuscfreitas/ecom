import { Router } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { OrderStatus } from "@prisma/client";
import { authenticateAdmin } from "../middleware/auth";
import { prisma } from "../lib/prisma";
import { ProductUpdateData, isPrismaKnownRequestError } from "../types";

const router = Router();

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    const admin = await prisma.admin.findUnique({
      where: { email },
    });

    if (!admin) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, admin.password);

    if (!isValid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { adminId: admin.id },
      process.env.JWT_SECRET || "secret",
      { expiresIn: "24h" }
    );

    res.json({ token });
  } catch (error) {
    res.status(500).json({ error: "Failed to login" });
  }
});

router.get("/orders", authenticateAdmin, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

router.patch("/orders/:id/status", authenticateAdmin, async (req, res) => {
  try {
    const { status } = req.body;

    if (!Object.values(OrderStatus).includes(status)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: "Failed to update order status" });
  }
});

router.get("/products", authenticateAdmin, async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: "desc" },
    });
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch products" });
  }
});

router.get("/products/:id", authenticateAdmin, async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
    });

    if (!product) {
      return res.status(404).json({ error: "Product not found" });
    }

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch product" });
  }
});

router.post("/products", authenticateAdmin, async (req, res) => {
  try {
    const { name, price, stock, description, imageUrl, category } = req.body;

    if (!name || price === undefined || stock === undefined) {
      return res.status(400).json({ error: "Name, price and stock are required" });
    }

    if (Number(price) <= 0) {
      return res.status(400).json({ error: "Price must be greater than 0" });
    }

    if (Number(stock) < 0) {
      return res.status(400).json({ error: "Stock must be greater than or equal to 0" });
    }

    const product = await prisma.product.create({
      data: {
        name,
        price: Number(price),
        stock: Number(stock),
        description: description || null,
        imageUrl: imageUrl || null,
        category: category || null,
      },
    });

    res.status(201).json(product);
  } catch (error) {
    console.error("Error creating product:", error);
    res.status(500).json({ error: "Failed to create product" });
  }
});

router.patch("/products/:id", authenticateAdmin, async (req, res) => {
  try {
    const { name, price, stock, description, imageUrl, category } = req.body;

    const updateData: ProductUpdateData = {};

    if (name !== undefined) updateData.name = name;
    if (price !== undefined) {
      if (Number(price) <= 0) {
        return res.status(400).json({ error: "Price must be greater than 0" });
      }
      updateData.price = Number(price);
    }
    if (stock !== undefined) {
      if (Number(stock) < 0) {
        return res.status(400).json({ error: "Stock must be greater than or equal to 0" });
      }
      updateData.stock = Number(stock);
    }
    if (description !== undefined) updateData.description = description || null;
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null;
    if (category !== undefined) updateData.category = category || null;

    const product = await prisma.product.update({
      where: { id: req.params.id },
      data: updateData,
    });

    res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    if (isPrismaKnownRequestError(error) && error.code === "P2025") {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(500).json({ error: "Failed to update product" });
  }
});

router.delete("/products/:id", authenticateAdmin, async (req, res) => {
  try {
    await prisma.product.delete({
      where: { id: req.params.id },
    });

    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting product:", error);
    if (isPrismaKnownRequestError(error) && error.code === "P2025") {
      return res.status(404).json({ error: "Product not found" });
    }
    res.status(500).json({ error: "Failed to delete product" });
  }
});

export default router;

