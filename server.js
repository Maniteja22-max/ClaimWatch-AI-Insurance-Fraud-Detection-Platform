const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// 🔥 FRAUD PREDICTION ROUTE
app.post("/api/predict", (req, res) => {
  const {
    claimAmount,
    coverage,
    previousClaims,
    frequency,
  } = req.body;

  // Convert to numbers
  const amount = Number(claimAmount);
  const policyCoverage = Number(coverage);
  const prevClaims = Number(previousClaims);
  const freq = Number(frequency);

  let score = 0;

  // 🔥 Basic Fraud Logic
  if (amount > policyCoverage) score += 40;
  if (prevClaims > 3) score += 25;
  if (freq > 5) score += 20;
  if (amount > 100000) score += 15;

  if (score > 100) score = 100;

  let status = "Low Risk";
  if (score > 70) status = "High Risk";
  else if (score > 40) status = "Medium Risk";

  res.json({
    score,
    status,
  });
});

// 🔥 TEST ROUTE
app.get("/", (req, res) => {
  res.send("Backend Running");
});

app.listen(5000, () =>
  console.log("Server running on port 5000")
);
