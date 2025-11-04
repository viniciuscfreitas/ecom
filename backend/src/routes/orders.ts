import { Router } from "express";
import { OrderStatus } from "@prisma/client";
import { prisma } from "../lib/prisma";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const { customerName, customerEmail, customerPhone, address, items, shippingValue, deliveryTime } = req.body;

    if (!customerName || !customerEmail || !customerPhone || !address || !items || items.length === 0) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    const productIds = items.map((item: { productId: string }) => item.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const stockErrors: Array<{ productId: string; productName: string; available: number; requested: number }> = [];

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return res.status(400).json({ error: `Product ${item.productId} not found` });
      }

      if (product.stock < item.quantity) {
        stockErrors.push({
          productId: product.id,
          productName: product.name,
          available: product.stock,
          requested: item.quantity,
        });
      }
    }

    if (stockErrors.length > 0) {
      return res.status(400).json({
        error: "Insufficient stock",
        details: stockErrors,
      });
    }

    const order = await prisma.$transaction(async (tx) => {
      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
        });

        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`);
        }

        await tx.product.update({
          where: { id: item.productId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }

      return await tx.order.create({
        data: {
          customerName,
          customerEmail,
          customerPhone,
          status: OrderStatus.PENDENTE,
          ...(shippingValue !== undefined && { shippingValue: Number(shippingValue) }),
          ...(deliveryTime && { deliveryTime }),
          items: {
            create: items.map((item: { productId: string; quantity: number; price: number }) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
          address: {
            create: {
              street: address.street,
              number: address.number,
              complement: address.complement,
              neighborhood: address.neighborhood,
              city: address.city,
              zipCode: address.zipCode,
            },
          },
        },
        include: {
          items: {
            include: {
              product: true,
            },
          },
          address: true,
        },
      });
    });

    res.status(201).json(order);
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Failed to create order" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
        address: true,
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    res.json({
      ...order,
      paymentId: order.paymentId,
      paymentStatus: order.paymentStatus,
    });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch order" });
  }
});

export default router;

