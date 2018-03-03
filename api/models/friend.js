var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var friendSchema = new Schema({
  user: { type: String, ref: 'User' },
  friend: { type: String, ref: 'User' },
  created_at : String,
  accepted : Boolean
});

friendSchema.pre('save', function(next) {
  var currentDate = new Date();

  if (this.accepted && !this.created_at){
    this.created_at = currentDate;
  }

  next();
});

var Friend = mongoose.model('Friend', friendSchema);

module.exports = Friend;