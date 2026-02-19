const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/fraudshield");

const TransactionSchema = new mongoose.Schema({
  amount: Number,
  location: String,
  score: Number,
  status: String,
});

const Transaction = mongoose.model("Transaction", TransactionSchema);

app.post("/analyze", async (req, res) => {
  const { amount, location } = req.body;

  let score = 0;

  if (amount > 100000) score += 50;
  else if (amount > 50000) score += 30;
  else score += 10;

  const riskyLocations = ["unknown", "international", "darkweb"];
  if (riskyLocations.includes(location.toLowerCase())) {
    score += 40;
  } else {
    score += 10;
  }

  score += Math.floor(Math.random() * 15);
  if (score > 100) score = 100;

  let status =
    score > 70
      ? "High Risk"
      : score > 40
      ? "Medium Risk"
      : "Low Risk";

  const transaction = await Transaction.create({
    amount,
    location,
    score,
    status,
  });

  res.json(transaction);
});

app.get("/transactions", async (req, res) => {
  const data = await Transaction.find().sort({ _id: -1 });
  res.json(data);
});

app.listen(5000, () => console.log("Server running on port 5000"));
