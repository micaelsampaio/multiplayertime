'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var categorySchema = new Schema({
  name: String,
  description: String,
  color: String
});

var Category = mongoose.model('Category', categorySchema);

module.exports = Category;