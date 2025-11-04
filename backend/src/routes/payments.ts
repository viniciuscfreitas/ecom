import { Router } from "express";
import { OrderStatus } from "@prisma/client";
import { createPayment, getPayment, processWebhook, isMockPayment } from "../lib/payment-gateway";
import { prisma } from "../lib/prisma";

const PAYMENT_STATUSES = ['pending', 'paid', 'expired'] as const;
type PaymentStatus = typeof PAYMENT_STATUSES[number];

const router = Router();

router.post("/orders/:id/payment", async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (order.paymentId) {
      const existingPayment = await getPayment(order.paymentId);
      return res.json({
        id: existingPayment.id,
        status: existingPayment.status,
        qrCode: existingPayment.qrCode,
        pixKey: existingPayment.pixKey,
        isMock: isMockPayment(),
      });
    }

    const total = order.items.reduce(
      (sum: number, item) => sum + Number(item.price) * item.quantity,
      0
    );

    const payment = await createPayment(
      Number(total),
      `Pedido ${orderId.slice(0, 8)}`
    );

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentId: payment.id,
        paymentStatus: payment.status,
      },
    });
    
    res.json({
      id: payment.id,
      status: payment.status,
      qrCode: payment.qrCode,
      pixKey: payment.pixKey,
      isMock: isMockPayment(),
    });
  } catch (error) {
    console.error("Error creating payment:", error);
    res.status(500).json({ error: "Failed to create payment" });
  }
});

router.get("/orders/:id/payment", async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (!order.paymentId) {
      return res.status(404).json({ error: "Payment not found for this order" });
    }

    const payment = await getPayment(order.paymentId);

    if (payment.status !== order.paymentStatus) {
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: payment.status,
        },
      });
    }
    
    res.json({
      id: payment.id,
      status: payment.status,
      qrCode: payment.qrCode,
      pixKey: payment.pixKey,
      isMock: isMockPayment(),
    });
  } catch (error) {
    console.error("Error fetching payment:", error);
    res.status(500).json({ error: "Failed to fetch payment" });
  }
});

router.post("/orders/:id/payment/simulate", async (req, res) => {
  try {
    const orderId = req.params.id;
    const { status } = req.body;

    if (!PAYMENT_STATUSES.includes(status as PaymentStatus)) {
      return res.status(400).json({ error: "Invalid status" });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId },
    });

    if (!order) {
      return res.status(404).json({ error: "Order not found" });
    }

    if (!order.paymentId) {
      return res.status(404).json({ error: "Payment not found for this order" });
    }

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: status,
        ...(status === 'paid' && { status: OrderStatus.PREPARANDO }),
      },
    });

    res.json({ success: true, status });
  } catch (error) {
    console.error("Error simulating payment:", error);
    res.status(500).json({ error: "Failed to simulate payment" });
  }
});

router.post("/webhooks/abacatepay", async (req, res) => {
  try {
    const body = JSON.parse(req.body.toString());
    const { event, data } = body;
    const signature = req.headers["x-abacatepay-signature"] as string;
    const rawBody = req.body.toString();

    const result = await processWebhook(event, data, signature, rawBody);

    const order = await prisma.order.findFirst({
      where: { paymentId: result.paymentId },
    });

    if (!order) {
      console.error(`Webhook: Order not found for payment ${result.paymentId}`, { event, data });
      return res.status(200).json({ success: false, error: "Order not found for payment" });
    }

    if (result.status === "paid") {
      await prisma.order.update({
        where: { id: order.id },
        data: {
          paymentStatus: "paid",
          status: OrderStatus.PREPARANDO,
        },
      });
      console.log(`Webhook: Order ${order.id} marked as paid`);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("Error processing webhook:", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      body: req.body?.toString?.()?.substring(0, 500),
    });
    res.status(200).json({ success: false, error: "Failed to process webhook" });
  }
});

export default router;

