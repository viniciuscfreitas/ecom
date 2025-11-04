import { Router } from "express";

const router = Router();

const zones: Record<string, number> = {
  '01310': 10.00,
  '04000': 15.00,
  '10000': 20.00,
};

router.get("/calculate", async (req, res) => {
  try {
    const { zipCode } = req.query;

    if (!zipCode || typeof zipCode !== 'string') {
      return res.status(400).json({ error: "zipCode is required" });
    }

    const prefix = zipCode.slice(0, 5);
    const value = zones[prefix] || 25.00;

    res.json({ value });
  } catch (error) {
    console.error("Error calculating shipping:", error);
    res.status(500).json({ error: "Failed to calculate shipping" });
  }
});

export default router;

