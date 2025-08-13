const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
app.use(express.json());

// MongoDB Schema
const taskSchema = new mongoose.Schema({
    title: String,
    completed: Boolean
});
const Task = mongoose.model('Task', taskSchema);

// Routes
app.get('/tasks', async (req, res) => {
    try {
        const tasks = await Task.find();
        res.json(tasks);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch tasks', details: err.message });
    }
});

app.post('/tasks', async (req, res) => {
    try {
        const task = new Task({
            title: req.body.title,
            completed: false
        });
        await task.save();
        res.json(task);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create task', details: err.message });
    }
});

app.put('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndUpdate(req.params.id, { completed: req.body.completed }, { new: true });
        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.json(task);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update task', details: err.message });
    }
});

app.delete('/tasks/:id', async (req, res) => {
    try {
        const task = await Task.findByIdAndDelete(req.params.id);
        if (!task) return res.status(404).json({ error: 'Task not found' });
        res.sendStatus(204);
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete task', details: err.message });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'OK', message: 'Server is running' });
});

// Connect to MongoDB
async function connectToMongo() {
    try {
        let retries = 5;
        while (retries > 0) {
            try {
                await mongoose.connect(process.env.MONGO_URI);
                console.log('Connected to MongoDB');
                break;
            } catch (err) {
                console.error('MongoDB connection attempt failed:', err.message);
                retries--;
                if (retries === 0) throw err;
                await new Promise(resolve => setTimeout(resolve, 5000));
            }
        }
        app.listen(process.env.PORT || 3000, '0.0.0.0', () => {
            console.log(`Server running on port ${process.env.PORT || 3000}`);
        });
    } catch (err) {
        console.error('MongoDB connection error:', err);
        process.exit(1);
    }
}

connectToMongo();

module.exports = app;
