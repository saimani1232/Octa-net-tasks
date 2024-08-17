const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  text: String,
  completed: Boolean,
  category: String,
  dueDate: Date,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

module.exports = mongoose.model('Task', taskSchema);
