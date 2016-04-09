
var mongoose = require('mongoose');
// var autoIncrement = require('mongoose-auto-increment');

var pairSchema = new mongoose.Schema({
  donator: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  tested_at: Date,

  comparisons: Array,


}, { timestamps: true });

// pairSchema.plugin(autoIncrement.plugin, { model: 'Pairs', field: '');
var Pairs = mongoose.model('Pairs', pairSchema);

module.exports = Pairs;
