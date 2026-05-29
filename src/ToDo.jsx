import React, { useState, useEffect } from 'react';
import './styles/ToDo.css';

const STORAGE_KEY = 'personal-tracker-todos';
const CATEGORIES = ['Learning', 'Notes', 'Doubt', 'Work', 'Personal'];

export default function TodoPage() {
  const [todos, setTodos] = useState([]);
  const [taskInput, setTaskInput] = useState('');
  const [categoryInput, setCategoryInput] = useState('Learning');
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    const loadTodos = () => {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        console.log('📦 Loading from localStorage:', stored);
        if (stored) {
          const parsed = JSON.parse(stored);
          setTodos(parsed);
          console.log('✅ Loaded todos:', parsed);
        }
      } catch (error) {
        console.error('❌ Error loading todos:', error);
      } finally {
        setIsLoaded(true);
      }
    };
    
    loadTodos();
  }, []);

  // Save to localStorage whenever todos change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(todos));
        console.log('💾 Saved to localStorage:', todos);
      } catch (error) {
        console.error('❌ Error saving todos:', error);
      }
    }
  }, [todos, isLoaded]);

  const addTodo = () => {
    if (taskInput.trim()) {
      const newTodo = {
        id: Date.now(),
        task: taskInput,
        category: categoryInput,
        completed: false,
        createdAt: new Date().toISOString()
      };
      console.log('➕ Adding new todo:', newTodo);
      setTodos(prevTodos => [...prevTodos, newTodo]);
      setTaskInput('');
    }
  };

  const deleteTodo = (id) => {
    console.log('🗑️ Deleting todo with id:', id);
    setTodos(prevTodos => prevTodos.filter(todo => todo.id !== id));
  };

  const toggleComplete = (id) => {
    console.log('✔️ Toggling todo with id:', id);
    setTodos(prevTodos =>
      prevTodos.map(todo =>
        todo.id === id ? { ...todo, completed: !todo.completed } : todo
      )
    );
  };

  const groupedTodos = CATEGORIES.reduce((acc, cat) => {
    acc[cat] = todos.filter(t => t.category === cat);
    return acc;
  }, {});

  return (
    <div className="app-shell">
      <div className="app-header">
        <h1>📝 My ToDo List</h1>
        <p className="muted">Total tasks: {todos.length}</p>
      </div>

      <div className="todo-container">
        {/* INPUT SECTION */}
        <div className="todo-input-card">
          <form className="todo-form" onSubmit={(e) => { e.preventDefault(); addTodo(); }}>
            <input
              type="text"
              placeholder="Add new task..."
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addTodo()}
            />
            <select
              value={categoryInput}
              onChange={(e) => setCategoryInput(e.target.value)}
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <button type="submit">
              Add Task
            </button>
          </form>
        </div>

        {/* CATEGORIES GRID */}
        <div className="todo-categories">
          {CATEGORIES.map(category => {
            const items = groupedTodos[category];
            return (
              <div key={category} className="todo-category-card">
                <div className="todo-category-header">
                  <h2 className="todo-category-title">
                    {getCategoryIcon(category)} {category}
                  </h2>
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
                      <li
                        key={todo.id}
                        className={`todo-item ${todo.completed ? 'completed' : ''}`}
                      >
                        <input
                          type="checkbox"
                          className="todo-checkbox"
                          checked={todo.completed}
                          onChange={() => toggleComplete(todo.id)}
                        />
                        <span className="todo-task-text">{todo.task}</span>
                        <button
                          type="button"
                          className="todo-delete-btn"
                          onClick={() => deleteTodo(todo.id)}
                          title="Delete task"
                        >
                          ✕
                        </button>
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

function getCategoryIcon(category) {
  const icons = {
    'Learning': '📚',
    'Notes': '📄',
    'Doubt': '❓',
    'Work': '💼',
    'Personal': '👤'
  };
  return icons[category] || '📌';
}