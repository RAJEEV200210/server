const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 5000;

app.use(cors());
app.use(bodyParser.json());

const tasksFilePath = path.join(__dirname, 'tasks.json');

const readTasks = () => {
    const data = fs.readFileSync(tasksFilePath);
    return JSON.parse(data);
};

const writeTasks = (tasks) => {
    fs.writeFileSync(tasksFilePath, JSON.stringify(tasks, null, 2));
};

app.get('/api/tasks', (req, res) => {
    const tasks = readTasks();
    res.json(tasks);
});

app.post('/api/tasks', (req, res) => {
    const tasks = readTasks();
    const newTask = req.body;
    newTask.id = Date.now();
    newTask.startDate = new Date().toISOString(); // Add start date when creating a task
    tasks.push(newTask);
    writeTasks(tasks);
    res.status(201).json(newTask);
});

app.delete('/api/tasks/:id', (req, res) => {
    const tasks = readTasks();
    const taskId = parseInt(req.params.id, 10);
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    if (updatedTasks.length === tasks.length) {
        return res.status(404).json({ error: 'Task not found' });
    }
    writeTasks(updatedTasks);
    res.status(204).end();
});

app.put('/api/tasks/:id', (req, res) => {
    const tasks = readTasks();
    const taskId = parseInt(req.params.id, 10);
    const taskIndex = tasks.findIndex(task => task.id === taskId);

    if (taskIndex !== -1) {
        const updatedTask = { ...tasks[taskIndex], ...req.body };
        tasks[taskIndex] = updatedTask;
        writeTasks(tasks);
        res.json(updatedTask);
    } else {
        res.status(404).json({ error: 'Task not found' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
