var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var inviteSchema = new Schema({
  room: String,
  you: { type: String, ref: 'User' },
  user: { type: String, ref: 'User' },
  game: { type: String, ref: 'Game'},
  accepted: Boolean,
  created_at: String
});

inviteSchema.pre('save', function(next) {
  var currentDate = new Date();

  if (!this.created_at)
    this.created_at = currentDate;

  next();
});

var Invite = mongoose.model('Invite', inviteSchema);

module.exports = Invite;