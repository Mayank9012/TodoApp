const express = require('express');
const router = express.Router();
const Task = require('../models/Task');

router.get('/', async (req, res) => {
  try {
    const { search } = req.query;
    let query = {};
    
    if (search) {
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ]
      };
    }
    
    const tasks = await Task.find(query).sort({ dateTime: 1 });
    res.json(tasks);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

router.post('/', async (req, res) => {
  const task = new Task({
    title: req.body.title,
    description: req.body.description,
    dateTime: req.body.dateTime,
    priority: req.body.priority,
    status: req.body.status || 'Open'
  });

  try {
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }

    if (req.body.title !== undefined) task.title = req.body.title;
    if (req.body.description !== undefined) task.description = req.body.description;
    if (req.body.dateTime !== undefined) task.dateTime = req.body.dateTime;
    if (req.body.priority !== undefined) task.priority = req.body.priority;
    if (req.body.status !== undefined) task.status = req.body.status;

    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
