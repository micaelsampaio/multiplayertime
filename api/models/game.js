'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var gameSchema = new Schema({
  route: { type: String, required: true, unique: true },
  name: { type: String,  required: true},
  description: String,
  min_players: Number,
  max_players: Number,
  players: String,
  color: String,
  card_image: String,
  logo: String,
  category: { type: String, ref: 'Category' },
  created_at: Date
});

gameSchema.pre('save', function(next) {
  var currentDate = new Date();
  
  this.players = this.min_players + (this.max_players>0 && this.max_players>this.min_players ? " - " + this.max_players : "");

  if (!this.created_at)
    this.created_at = currentDate;

  next();
});

var Game = mongoose.model('Game', gameSchema);

module.exports = Game;