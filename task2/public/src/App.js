import React, { useState, useEffect } from 'react';
import axios from 'axios';
import jwt_decode from 'jwt-decode';
import './App.css';

const App = () => {
    const [tasks, setTasks] = useState([]);
    const [newTask, setNewTask] = useState('');
    const [category, setCategory] = useState('');
    const [dueDate, setDueDate] = useState('');
    const [token, setToken] = useState(localStorage.getItem('token') || '');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    useEffect(() => {
        if (token) {
            const decodedToken = jwt_decode(token);
            if (decodedToken.exp * 1000 < Date.now()) {
                localStorage.removeItem('token');
                setToken('');
            } else {
                setIsAuthenticated(true);
                fetchTasks();
            }
        }
    }, [token]);

    const fetchTasks = async () => {
        const response = await axios.get('http://localhost:5000/tasks', {
            headers: { 'x-auth-token': token },
        });
        setTasks(response.data);
    };

    const handleRegister = async () => {
        await axios.post('http://localhost:5000/users/register', { username, password });
        alert('User registered successfully');
    };

    const handleLogin = async () => {
        const response = await axios.post('http://localhost:5000/users/login', { username, password });
        localStorage.setItem('token', response.data.token);
        setToken(response.data.token);
        setIsAuthenticated(true);
        fetchTasks();
    };

    const addTask = async () => {
        if (newTask.trim() === '') return;
        const response = await axios.post('http://localhost:5000/tasks', { text: newTask, category, dueDate }, {
            headers: { 'x-auth-token': token },
        });
        setTasks([...tasks, response.data]);
        setNewTask('');
        setCategory('');
        setDueDate('');
    };

    const toggleCompletion = async (id) => {
        const task = tasks.find((t) => t._id === id);
        const response = await axios.put(`http://localhost:5000/tasks/${id}`, {
            ...task,
            completed: !task.completed
        }, {
            headers: { 'x-auth-token': token },
        });
        setTasks(tasks.map((t) => (t._id === id ? response.data : t)));
    };

    const editTask = async (id, text) => {
        const task = tasks.find((t) => t._id === id);
        const response = await axios.put(`http://localhost:5000/tasks/${id}`, {
            ...task,
            text
        }, {
            headers: { 'x-auth-token': token },
        });
        setTasks(tasks.map((t) => (t._id === id ? response.data : t)));
    };

    const deleteTask = async (id) => {
        await axios.delete(`http://localhost:5000/tasks/${id}`, {
            headers: { 'x-auth-token': token },
        });
        setTasks(tasks.filter((t) => t._id !== id));
    };

    return (
        <div className="app">
            {!isAuthenticated ? (
                <div className="auth">
                    <h1>Register/Login</h1>
                    <input
                        type="text"
                        placeholder="Username"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <button onClick={handleRegister}>Register</button>
                    <button onClick={handleLogin}>Login</button>
                </div>
            ) : (
                <div>
                    <h1>To-Do List</h1>
                    <div className="task-input">
                        <input
                            type="text"
                            value={newTask}
                            onChange={(e) => setNewTask(e.target.value)}
                            placeholder="Add a new task..."
                        />
                        <select value={category} onChange={(e) => setCategory(e.target.value)}>
                            <option value="">Select Category</option>
                            <option value="Work">Work</option>
                            <option value="Personal">Personal</option>
                            <option value="Shopping">Shopping</option>
                        </select>
                        <input
                            type="date"
                            value={dueDate}
                            onChange={(e) => setDueDate(e.target.value)}
                        />
                        <button onClick={addTask}>Add Task</button>
                    </div>
                    <ul className="task-list">
                        {tasks.map((task) => (
                            <li key={task._id} className={task.completed ? 'completed' : ''}>
                                <span onClick={() => toggleCompletion(task._id)}>{task.text}</span>
                                <input
                                    type="text"
                                    defaultValue={task.text}
                                    onBlur={(e) => editTask(task._id, e.target.value)}
                                />
                                <button onClick={() => deleteTask(task._id)}>Delete</button>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default App;
