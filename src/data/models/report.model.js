const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  name: String,
  type: String,
  criteria: Object,
  generatedAt: { type: Date, default: Date.now },
  data: Array,
});

module.exports = mongoose.model('Report', reportSchema);
