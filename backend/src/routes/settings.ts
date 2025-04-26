import express from "express";
const router = express.Router();

let diagnosticTimerMinutes = 60; // default value

// GET timer
router.get("/diagnostic-timer", (req, res) => {
  res.json({ diagnosticTimerMinutes });
});

// POST update timer
router.post("/diagnostic-timer", (req, res) => {
  const { diagnosticTimerMinutes: minutes } = req.body;
  if (typeof minutes === "number" && minutes > 0) {
    diagnosticTimerMinutes = minutes;
    res.json({ success: true, diagnosticTimerMinutes: minutes });
  } else {
    res.status(400).json({ error: "Invalid timer value" });
  }
});

export default router;
