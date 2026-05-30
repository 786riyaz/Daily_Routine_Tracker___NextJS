'use client';
import { useState, useEffect } from 'react';
import '../styles/todo.css';

const CATEGORIES = ['Learning', 'Notes', 'Doubt', 'Work', 'Personal'];

function getCategoryIcon(cat) {
  return { Learning: '📚', Notes: '📄', Doubt: '❓', Work: '💼', Personal: '👤' }[cat] || '📌';
}

export default function TodoPage() {
  const [todos, setTodos] = useState([]);
  const [taskInput, setTaskInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('Learning');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/todos').then(r => r.json()).then(data => { setTodos(data); setLoading(false); });
  }, []);

  async function addTodo() {
    if (!taskInput.trim()) return;
    const newTodo = { id: Date.now(), task: taskInput.trim(), category: categoryInput, completed: false, createdAt: new Date().toISOString() };
    setTodos(prev => [...prev, newTodo]);
    setTaskInput('');
    await fetch('/api/todos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: newTodo.id, task: newTodo.task, category: newTodo.category, completed: false, createdAt: newTodo.createdAt }) });
  }

  async function deleteTodo(id) {
    setTodos(prev => prev.filter(t => t.id !== id));
    await fetch(`/api/todos/${id}`, { method: 'DELETE' });
  }

  async function toggleComplete(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;
    const newVal = !todo.completed;
    setTodos(prev => prev.map(t => t.id === id ? { ...t, completed: newVal } : t));
    await fetch(`/api/todos/${id}`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ completed: newVal }) });
  }

  const grouped = CATEGORIES.reduce((acc, cat) => { acc[cat] = todos.filter(t => t.category === cat); return acc; }, {});

  if (loading) return <div className="loading-state">Loading...</div>;

  return (
    <div className="layout">
      <div className="app-header" style={{ borderBottom: 'none', marginBottom: 0, paddingBottom: 0 }}>
        <h1 style={{ fontSize: '1.6rem', marginBottom: 4 }}>📝 My ToDo List</h1>
        <p className="muted">Total tasks: {todos.length}</p>
      </div>

      <div className="todo-container">
        <div className="todo-input-card">
          <div className="todo-form">
            <input
              type="text" placeholder="Add new task..."
              value={taskInput} onChange={e => setTaskInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTodo()}
            />
            <select value={categoryInput} onChange={e => setCategoryInput(e.target.value)}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <button type="button" onClick={addTodo}>Add Task</button>
          </div>
        </div>

        <div className="todo-categories">
          {CATEGORIES.map(category => {
            const items = grouped[category];
            return (
              <div key={category} className="todo-category-card">
                <div className="todo-category-header">
                  <h2 className="todo-category-title">{getCategoryIcon(category)} {category}</h2>
                  <span className="todo-category-count">{items.length}</span>
                </div>
                {items.length === 0 ? (
                  <div className="todo-empty">
                    <div className="todo-empty-icon">📭</div>
                    No tasks yet
                  </div>
                ) : (
                  <ul className="todo-list">
                    {items.map(todo => (
                      <li key={todo.id} className={`todo-item ${todo.completed ? 'completed' : ''}`}>
                        <input type="checkbox" className="todo-checkbox" checked={todo.completed} onChange={() => toggleComplete(todo.id)} />
                        <span className="todo-task-text">{todo.task}</span>
                        <button type="button" className="todo-delete-btn" onClick={() => deleteTodo(todo.id)}>✕</button>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
