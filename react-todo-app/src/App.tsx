import { useState, useEffect, useRef, useCallback } from 'react'
import './App.css'

interface Todo {
  id: number
  text: string
  completed: boolean
  createdAt: number
}

type FilterType = 'all' | 'active' | 'completed'

const STORAGE_KEY = 'react-todo-app-data'

function loadTodos(): Todo[] {
  try {
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  } catch {
    return []
  }
}

function App() {
  const [todos, setTodos] = useState<Todo[]>(loadTodos)
  const [inputValue, setInputValue] = useState('')
  const [filter, setFilter] = useState<FilterType>('all')
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editingText, setEditingText] = useState('')
  const [removingIds, setRemovingIds] = useState<Set<number>>(new Set())
  const [addingIds, setAddingIds] = useState<Set<number>>(new Set())
  const inputRef = useRef<HTMLInputElement>(null)
  const editInputRef = useRef<HTMLInputElement>(null)

  // Persist to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(todos))
  }, [todos])

  // Focus edit input when editing
  useEffect(() => {
    if (editingId !== null && editInputRef.current) {
      editInputRef.current.focus()
    }
  }, [editingId])

  // Remove adding animation class after animation completes
  useEffect(() => {
    if (addingIds.size > 0) {
      const timer = setTimeout(() => {
        setAddingIds(new Set())
      }, 400)
      return () => clearTimeout(timer)
    }
  }, [addingIds])

  const addTodo = useCallback(() => {
    const trimmed = inputValue.trim()
    if (!trimmed) return

    const newTodo: Todo = {
      id: Date.now(),
      text: trimmed,
      completed: false,
      createdAt: Date.now(),
    }

    setAddingIds(new Set([newTodo.id]))
    setTodos(prev => [newTodo, ...prev])
    setInputValue('')
    inputRef.current?.focus()
  }, [inputValue])

  const removeTodo = useCallback((id: number) => {
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

  const toggleTodo = useCallback((id: number) => {
    setTodos(prev =>
      prev.map(t => (t.id === id ? { ...t, completed: !t.completed } : t))
    )
  }, [])

  const startEditing = useCallback((todo: Todo) => {
    setEditingId(todo.id)
    setEditingText(todo.text)
  }, [])

  const saveEdit = useCallback(() => {
    if (editingId === null) return
    const trimmed = editingText.trim()
    if (trimmed) {
      setTodos(prev =>
        prev.map(t => (t.id === editingId ? { ...t, text: trimmed } : t))
      )
    }
    setEditingId(null)
    setEditingText('')
  }, [editingId, editingText])

  const cancelEdit = useCallback(() => {
    setEditingId(null)
    setEditingText('')
  }, [])

  const clearCompleted = useCallback(() => {
    const completedIds = todos.filter(t => t.completed).map(t => t.id)
    completedIds.forEach(id => {
      setRemovingIds(prev => new Set(prev).add(id))
    })
    setTimeout(() => {
      setTodos(prev => prev.filter(t => !t.completed))
      setRemovingIds(new Set())
    }, 350)
  }, [todos])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') addTodo()
  }

  const handleEditKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') saveEdit()
    if (e.key === 'Escape') cancelEdit()
  }

  // Filtered todos
  const filteredTodos = todos.filter(todo => {
    if (filter === 'active') return !todo.completed
    if (filter === 'completed') return todo.completed
    return true
  })

  // Stats
  const totalCount = todos.length
  const activeCount = todos.filter(t => !t.completed).length
  const completedCount = todos.filter(t => t.completed).length
  const completionRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0

  const filterButtons: { key: FilterType; label: string }[] = [
    { key: 'all', label: '全部' },
    { key: 'active', label: '进行中' },
    { key: 'completed', label: '已完成' },
  ]

  return (
    <div className="app-container">
      <div className="app-card">
        {/* Header */}
        <div className="app-header">
          <h1 className="app-title">
            <span className="title-icon">✨</span>
            Todo List
          </h1>
          <p className="app-subtitle">高效管理你的每一天</p>
        </div>

        {/* Stats Bar */}
        <div className="stats-bar">
          <div className="stat-item">
            <span className="stat-number">{totalCount}</span>
            <span className="stat-label">总计</span>
          </div>
          <div className="stat-item stat-active">
            <span className="stat-number">{activeCount}</span>
            <span className="stat-label">进行中</span>
          </div>
          <div className="stat-item stat-completed">
            <span className="stat-number">{completedCount}</span>
            <span className="stat-label">已完成</span>
          </div>
          <div className="stat-item stat-rate">
            <span className="stat-number">{completionRate}%</span>
            <span className="stat-label">完成率</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <div
            className="progress-bar"
            style={{ width: `${completionRate}%` }}
          />
        </div>

        {/* Input Area */}
        <div className="input-area">
          <input
            ref={inputRef}
            type="text"
            className="todo-input"
            placeholder="添加新的待办事项..."
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          <button
            className="add-button"
            onClick={addTodo}
            disabled={!inputValue.trim()}
          >
            <span className="add-icon">+</span>
            添加
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="filter-bar">
          <div className="filter-tabs">
            {filterButtons.map(btn => (
              <button
                key={btn.key}
                className={`filter-tab ${filter === btn.key ? 'active' : ''}`}
                onClick={() => setFilter(btn.key)}
              >
                {btn.label}
                {btn.key === 'all' && <span className="tab-count">{totalCount}</span>}
                {btn.key === 'active' && <span className="tab-count">{activeCount}</span>}
                {btn.key === 'completed' && <span className="tab-count">{completedCount}</span>}
              </button>
            ))}
          </div>
          {completedCount > 0 && (
            <button className="clear-button" onClick={clearCompleted}>
              清除已完成
            </button>
          )}
        </div>

        {/* Todo List */}
        <div className="todo-list">
          {filteredTodos.length === 0 && (
            <div className="empty-state">
              <span className="empty-icon">
                {filter === 'completed' ? '🎯' : filter === 'active' ? '🎉' : '📝'}
              </span>
              <p className="empty-text">
                {filter === 'completed'
                  ? '还没有已完成的任务'
                  : filter === 'active'
                  ? '所有任务都已完成！'
                  : '暂无待办事项，添加一个吧！'}
              </p>
            </div>
          )}

          {filteredTodos.map(todo => {
            const isRemoving = removingIds.has(todo.id)
            const isAdding = addingIds.has(todo.id)
            const isEditing = editingId === todo.id

            return (
              <div
                key={todo.id}
                className={`todo-item ${todo.completed ? 'completed' : ''} ${
                  isRemoving ? 'removing' : ''
                } ${isAdding ? 'adding' : ''}`}
              >
                {isEditing ? (
                  <div className="edit-mode">
                    <input
                      ref={editInputRef}
                      type="text"
                      className="edit-input"
                      value={editingText}
                      onChange={e => setEditingText(e.target.value)}
                      onKeyDown={handleEditKeyDown}
                      onBlur={saveEdit}
                    />
                  </div>
                ) : (
                  <>
                    <button
                      className={`checkbox ${todo.completed ? 'checked' : ''}`}
                      onClick={() => toggleTodo(todo.id)}
                    >
                      {todo.completed && (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      )}
                    </button>
                    <span
                      className="todo-text"
                      onDoubleClick={() => startEditing(todo)}
                    >
                      {todo.text}
                    </span>
                    <div className="todo-actions">
                      <button
                        className="action-btn edit-btn"
                        onClick={() => startEditing(todo)}
                        title="编辑"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                      </button>
                      <button
                        className="action-btn delete-btn"
                        onClick={() => removeTodo(todo.id)}
                        title="删除"
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                  </>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer */}
        <div className="app-footer">
          <p>双击任务文字可编辑 · 数据自动保存到本地</p>
        </div>
      </div>
    </div>
  )
}

export default App
