const mongoose = require("mongoose");

const claimSchema = new mongoose.Schema({
  claimAmount: Number,
  coverage: Number,
  claimHistory: Number,
  frequency: Number,
  duplicateDocs: Number,
  suspiciousTx: Number,
  fraudScore: Number,
  status: String,
});

module.exports = mongoose.model("Claim", claimSchema);
