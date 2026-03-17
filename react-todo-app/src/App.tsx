import { FormEvent, useEffect, useMemo, useState } from 'react'
import './App.css'

type FilterType = 'all' | 'active' | 'completed'

interface Todo {
  id: number
  text: string
  completed: boolean
  createdAt: number
}

const STORAGE_KEY = 'react-ts-todos'

function App() {
  const [todos, setTodos] = useState<Todo[]>([])
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingText, setEditingText] = useState('')

  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      try {
        const parsed: Todo[] = JSON.parse(raw)
        setTodos(parsed)
      } catch (error) {
        console.error('Failed to parse todos from localStorage', error)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  const handleAddTodo = (e: FormEvent) => {
    e.preventDefault()
    const text = input.trim()
    if (!text) return

    const newTodo: Todo = {
      id: Date.now(),
      text,
      completed: false,
      createdAt: Date.now(),
    }

    setTodos((prev) => [newTodo, ...prev])
    setInput('')
  }

  const handleDeleteTodo = (id: number) => {
    setTodos((prev) => prev.filter((todo) => todo.id !== id))
  }

  const handleToggleTodo = (id: number) => {
    setTodos((prev) =>
      prev.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo)),
    )
  }

  const startEditing = (todo: Todo) => {
    setEditingId(todo.id)
    setEditingText(todo.text)
  }

  const saveEditing = () => {
    const text = editingText.trim()
    if (!text || editingId === null) {
      setEditingId(null)
      setEditingText('')
      return
    }

    setTodos((prev) => prev.map((todo) => (todo.id === editingId ? { ...todo, text } : todo)))
    setEditingId(null)
    setEditingText('')
  }

  const cancelEditing = () => {
    setEditingId(null)
    setEditingText('')
  }

  const filteredTodos = useMemo(() => {
    switch (filter) {
      case 'active':
        return todos.filter((todo) => !todo.completed)
      case 'completed':
        return todos.filter((todo) => todo.completed)
      default:
        return todos
    }
  }, [todos, filter])

  const stats = useMemo(() => {
    const total = todos.length
    const completed = todos.filter((todo) => todo.completed).length
    const active = total - completed
    return { total, completed, active }
  }, [todos])

  return (
    <div className="app-bg">
      <div className="todo-card">
        <h1>✨ Todo List</h1>

        <form className="todo-form" onSubmit={handleAddTodo}>
          <input
            type="text"
            placeholder="添加你的任务..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button type="submit">添加</button>
        </form>

        <div className="filters">
          <button className={filter === 'all' ? 'active' : ''} onClick={() => setFilter('all')}>
            全部
          </button>
          <button className={filter === 'active' ? 'active' : ''} onClick={() => setFilter('active')}>
            进行中
          </button>
          <button className={filter === 'completed' ? 'active' : ''} onClick={() => setFilter('completed')}>
            已完成
          </button>
        </div>

        <div className="stats">
          <span>总计: {stats.total}</span>
          <span>进行中: {stats.active}</span>
          <span>已完成: {stats.completed}</span>
        </div>

        <ul className="todo-list">
          {filteredTodos.map((todo) => (
            <li key={todo.id} className={`todo-item ${todo.completed ? 'done' : ''}`}>
              <label className="todo-main">
                <input
                  type="checkbox"
                  checked={todo.completed}
                  onChange={() => handleToggleTodo(todo.id)}
                />
                {editingId === todo.id ? (
                  <input
                    className="edit-input"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onBlur={saveEditing}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveEditing()
                      if (e.key === 'Escape') cancelEditing()
                    }}
                    autoFocus
                  />
                ) : (
                  <span>{todo.text}</span>
                )}
              </label>

              <div className="actions">
                {editingId === todo.id ? (
                  <button onClick={saveEditing}>保存</button>
                ) : (
                  <button onClick={() => startEditing(todo)}>编辑</button>
                )}
                <button className="danger" onClick={() => handleDeleteTodo(todo.id)}>
                  删除
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App
