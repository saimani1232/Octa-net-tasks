const express = require('express');
const Task = require('../models/Task');
const jwt = require('jsonwebtoken');

const router = express.Router();

const authenticate = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, 'your_jwt_secret');
    req.user = decoded;
    next();
  } catch (e) {
    res.status(400).json({ message: 'Invalid token' });
  }
};

router.get('/', authenticate, async (req, res) => {
  const tasks = await Task.find({ user: req.user.userId });
  res.json(tasks);
});

router.post('/', authenticate, async (req, res) => {
  const { text, category, dueDate } = req.body;
  const task = new Task({ text, category, dueDate, user: req.user.userId });
  await task.save();
  res.json(task);
});

router.put('/:id', authenticate, async (req, res) => {
  const { text, completed, category, dueDate } = req.body;
  const task = await Task.findByIdAndUpdate(req.params.id, { text, completed, category, dueDate }, { new: true });
  res.json(task);
});

router.delete('/:id', authenticate, async (req, res) => {
  await Task.findByIdAndDelete(req.params.id);
  res.json({ message: 'Task deleted' });
});

module.exports = router;
