const serverless = require('serverless-http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Normalize path when Netlify invokes the function: requests may include
// '/.netlify/functions/api' as a prefix (e.g. '/.netlify/functions/api/tasks').
// Strip that prefix so our Express routes like '/api/tasks' or '/tasks' match.
app.use((req, res, next) => {
  const prefix = '/.netlify/functions/api';
  if (req.url && req.url.startsWith(prefix)) {
    req.url = req.url.replace(prefix, '');
  }
  next();
});

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/todoapp';

let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) {
    return;
  }

  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    isConnected = true;
    console.log('Connected to MongoDB');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  dateTime: {
    type: Date,
    required: true
  },
  priority: {
    type: String,
    enum: ['Low', 'Medium', 'High'],
    default: 'Low'
  },
  status: {
    type: String,
    enum: ['Open', 'In Progress', 'Completed'],
    default: 'Open'
  }
}, {
  timestamps: true
});

const Task = mongoose.models.Task || mongoose.model('Task', taskSchema);

// Support both '/api/tasks' and '/tasks' so Netlify function routing works
const listTasksHandler = async (req, res) => {
  await connectToDatabase();
  
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
};

app.get('/api/tasks', listTasksHandler);
app.get('/tasks', listTasksHandler);

// Health / root endpoint so visiting /api returns a friendly message
app.get('/api', (req, res) => {
  const hasMongoUri = !!process.env.MONGODB_URI;
  res.json({
    ok: true,
    message: 'API function is running',
    mongodbConfigured: hasMongoUri
  });
});

const getTaskHandler = async (req, res) => {
  await connectToDatabase();
  
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ message: 'Task not found' });
    }
    res.json(task);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

app.get('/api/tasks/:id', getTaskHandler);
app.get('/tasks/:id', getTaskHandler);

const createTaskHandler = async (req, res) => {
  await connectToDatabase();
  
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
};

app.post('/api/tasks', createTaskHandler);
app.post('/tasks', createTaskHandler);

const updateTaskHandler = async (req, res) => {
  await connectToDatabase();
  
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
};

app.put('/api/tasks/:id', updateTaskHandler);
app.put('/tasks/:id', updateTaskHandler);

const deleteTaskHandler = async (req, res) => {
  await connectToDatabase();
  
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
};

app.delete('/api/tasks/:id', deleteTaskHandler);
app.delete('/tasks/:id', deleteTaskHandler);

module.exports.handler = serverless(app);
