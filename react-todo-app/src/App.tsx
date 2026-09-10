import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

interface Todo {
  id: number
  text: string
  completed: boolean
}

type Filter = 'all' | 'active' | 'completed'

const STORAGE_KEY = 'react-todo-app-data'

function loadTodos(): Todo[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch {
    return []
  }
}

function saveTodos(todos: Todo[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos)
  const [input, setInput] = useState('')
  const [filter, setFilter] = useState<Filter>('all')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editText, setEditText] = useState('')
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set())
  const editInputRef = useRef<HTMLInputElement>(null)

  // Persist to localStorage
  useEffect(() => {
    saveTodos(todos)
  }, [todos])

  // Focus edit input when editing starts
  useEffect(() => {
    if (editingId !== null && editInputRef.current) {
      editInputRef.current.focus()
    }
  }, [editingId])

  // Add todo
  const addTodo = useCallback(() => {
    const text = input.trim()
    if (!text) return
    setTodos(prev => [{ id: Date.now(), text, completed: false }, ...prev])
    setInput('')
  }, [input])

  // Delete todo with animation
  const deleteTodo = useCallback((id: number) => {
    setRemovingIds(prev => new Set(prev).add(id))
    setTimeout(() => {
      setTodos(prev => prev.filter(t => t.id !== id))
      setRemovingIds(prev => {
        const next = new Set(prev)
        next.delete(id)
        return next
      })
    }, 350)
  }, [])

  // Toggle complete
  const toggleTodo = useCallback((id: number) => {
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }, [])

  // Start editing
  const startEdit = useCallback((todo: Todo) => {
    setEditingId(todo.id)
    setEditText(todo.text)
  }, [])

  // Save edit
  const saveEdit = useCallback(() => {
    if (editingId === null) return
    const text = editText.trim()
    if (!text) {
      deleteTodo(editingId)
    } else {
      setTodos(prev =>
        prev.map(t => (t.id === editingId ? { ...t, text } : t))
      )
    }
    setEditingId(null)
    setEditText('')
  }, [editingId, editText, deleteTodo])

  // Cancel edit
  const cancelEdit = useCallback(() => {
    setEditingId(null)
    setEditText('')
  }, [])

  // Handle key down in edit input
  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') saveEdit()
      if (e.key === 'Escape') cancelEdit()
    },
    [saveEdit, cancelEdit]
  )

  // Filtered todos
  const filtered = todos.filter(t => {
    if (filter === 'active') return !t.completed
    if (filter === 'completed') return t.completed
    return true
  })

  // Stats
  const total = todos.length
  const active = todos.filter(t => !t.completed).length
  const completed = total - active

  return (
    <div className="app-container">
      <div className="app-header">
        <h1>📝 Todo List</h1>
        <p>管理你的待办事项</p>
      </div>

      {/* Stats */}
      <div className="stats-bar">
        <div className="stat-item">
          <span className="stat-number">{total}</span>全部
        </div>
        <div className="stat-item">
          <span className="stat-number">{active}</span>进行中
        </div>
        <div className="stat-item">
          <span className="stat-number">{completed}</span>已完成
        </div>
      </div>

      {/* Input */}
      <div className="input-area">
        <input
          type="text"
          placeholder="添加新的待办事项..."
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') addTodo()
          }}
        />
        <button className="btn-add" onClick={addTodo}>
          添加
        </button>
      </div>

      {/* Filters */}
      <div className="filter-tabs">
        {(['all', 'active', 'completed'] as Filter[]).map(f => (
          <button
            key={f}
            className={`filter-tab ${filter === f ? 'active' : ''}`}
            onClick={() => setFilter(f)}
          >
            {f === 'all' ? '全部' : f === 'active' ? '进行中' : '已完成'}
          </button>
        ))}
      </div>

      {/* Todo List */}
      {filtered.length === 0 ? (
        <div className="empty-state">
          <div className="emoji">
            {filter === 'completed' ? '🎯' : filter === 'active' ? '🎉' : '📋'}
          </div>
          <p>
            {filter === 'completed'
              ? '还没有已完成的事项'
              : filter === 'active'
                ? '所有事项都已完成！'
                : '暂无待办事项，添加一个吧！'}
          </p>
        </div>
      ) : (
        <ul className="todo-list">
          {filtered.map(todo => (
            <li
              key={todo.id}
              className={`todo-item ${removingIds.has(todo.id) ? 'removing' : ''}`}
            >
              <div
                className={`todo-checkbox ${todo.completed ? 'checked' : ''}`}
                onClick={() => toggleTodo(todo.id)}
              />

              {editingId === todo.id ? (
                <input
                  ref={editInputRef}
                  className="todo-edit-input"
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  onKeyDown={handleEditKeyDown}
                  onBlur={saveEdit}
                />
              ) : (
                <span className={`todo-text ${todo.completed ? 'completed' : ''}`}>
                  {todo.text}
                </span>
              )}

              <div className="todo-actions">
                {editingId === todo.id ? (
                  <>
                    <button className="btn-icon btn-save" onClick={saveEdit} title="保存">
                      ✓
                    </button>
                    <button className="btn-icon btn-cancel" onClick={cancelEdit} title="取消">
                      ✕
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn-icon btn-edit"
                      onClick={() => startEdit(todo)}
                      title="编辑"
                    >
                      ✎
                    </button>
                    <button
                      className="btn-icon btn-delete"
                      onClick={() => deleteTodo(todo.id)}
                      title="删除"
                    >
                      ✕
                    </button>
                  </>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
