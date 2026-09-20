import React, { useState, useEffect } from 'react';
import { 
  StickyNote, 
  CheckSquare, 
  Copy, 
  Trash2, 
  ArrowUpRight, 
  Plus, 
  Check, 
  X,
  FileEdit
} from 'lucide-react';
import { useToast } from '../../common/ToastContext';

interface QuickScratchpadProps {
  onConvertToEntry?: (data: { title: string; content: string }) => void;
}

interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export const QuickScratchpad: React.FC<QuickScratchpadProps> = ({ onConvertToEntry }) => {
  const { showToast } = useToast();
  const [activeTab, setActiveTab] = useState<'notes' | 'checklist'>('notes');

  // Text state
  const [text, setText] = useState(() => {
    return localStorage.getItem('life_os_scratchpad_text') || '';
  });

  // Checklist state
  const [todos, setTodos] = useState<ChecklistItem[]>(() => {
    try {
      const saved = localStorage.getItem('life_os_scratchpad_todos');
      return saved ? JSON.parse(saved) : [
        { id: '1', text: 'Reflect on this week’s achievements', completed: true },
        { id: '2', text: 'Capture new ideas & memories in MyWorld', completed: false },
        { id: '3', text: 'Explore 3D section realms & themes', completed: false },
      ];
    } catch {
      return [];
    }
  });

  const [newTodoInput, setNewTodoInput] = useState('');
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving'>('saved');

  // Save text to localStorage
  useEffect(() => {
    const timer = setTimeout(() => {
      localStorage.setItem('life_os_scratchpad_text', text);
      setSaveStatus('saved');
    }, 400);
    return () => clearTimeout(timer);
  }, [text]);

  // Save todos to localStorage
  useEffect(() => {
    localStorage.setItem('life_os_scratchpad_todos', JSON.stringify(todos));
  }, [todos]);

  // Copy text to clipboard
  const handleCopy = async () => {
    const contentToCopy = activeTab === 'notes'
      ? text
      : todos.map(t => `[${t.completed ? 'x' : ' '}] ${t.text}`).join('\n');

    if (!contentToCopy) {
      showToast('Nothing to copy', 'info');
      return;
    }

    try {
      await navigator.clipboard.writeText(contentToCopy);
      showToast('Copied to clipboard', 'success');
    } catch {
      showToast('Failed to copy', 'error');
    }
  };

  // Clear content
  const handleClear = () => {
    if (activeTab === 'notes') {
      if (!text) return;
      if (window.confirm('Clear all scratchpad text?')) {
        setText('');
        showToast('Scratchpad cleared', 'info');
      }
    } else {
      if (todos.length === 0) return;
      if (window.confirm('Clear completed tasks?')) {
        setTodos(todos.filter(t => !t.completed));
        showToast('Completed tasks cleared', 'info');
      }
    }
  };

  // Convert to official Entry
  const handleConvert = () => {
    const rawContent = activeTab === 'notes'
      ? text
      : todos.map(t => `- [${t.completed ? 'x' : ' '}] ${t.text}`).join('\n');

    if (!rawContent.trim()) {
      showToast('Please add some content before saving as entry', 'error');
      return;
    }

    const firstLine = rawContent.split('\n')[0].replace(/^#*\s*/, '').slice(0, 45);
    const title = firstLine || 'Quick Scratchpad Thought';

    if (onConvertToEntry) {
      onConvertToEntry({
        title,
        content: rawContent,
      });
    }
  };

  // Add todo
  const handleAddTodo = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newTodoInput.trim()) return;

    setTodos([
      ...todos,
      {
        id: Date.now().toString(),
        text: newTodoInput.trim(),
        completed: false,
      }
    ]);
    setNewTodoInput('');
  };

  // Toggle todo
  const toggleTodo = (id: string) => {
    setTodos(todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  // Delete todo
  const deleteTodo = (id: string) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;
  const completedTodos = todos.filter(t => t.completed).length;

  return (
    <div className="relative rounded-3xl glass-card p-6 overflow-hidden flex flex-col justify-between group border border-slate-200 dark:border-white/10 shadow-2xl min-h-[280px]">
      {/* Ambient gradient */}
      <div className="absolute top-0 right-0 w-44 h-44 bg-amber-500/10 rounded-full blur-3xl pointer-events-none -mr-16 -mt-16" />

      {/* Top Bar: Tabs & Quick Action buttons */}
      <div className="relative z-10 flex items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/5">
        {/* Tab switch */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/5">
          <button
            onClick={() => setActiveTab('notes')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'notes'
                ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <StickyNote className="w-3.5 h-3.5 text-amber-500" />
            <span>Scratchpad</span>
          </button>
          <button
            onClick={() => setActiveTab('checklist')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
              activeTab === 'checklist'
                ? 'bg-white dark:bg-white/15 text-slate-900 dark:text-white shadow-sm font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            <CheckSquare className="w-3.5 h-3.5 text-emerald-500" />
            <span>Checklist ({completedTodos}/{todos.length})</span>
          </button>
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Copy content"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleClear}
            className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Clear content"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="relative z-10 my-3 flex-1 min-h-[140px] flex flex-col">
        {activeTab === 'notes' ? (
          <div className="flex-1 flex flex-col">
            <textarea
              value={text}
              onChange={(e) => {
                setText(e.target.value);
                setSaveStatus('saving');
              }}
              placeholder="Jot down a sudden thought, inspiration, quote, or snippet... (Auto-saves locally)"
              className="w-full flex-1 min-h-[130px] p-3 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 focus:border-indigo-500/40 focus:bg-white dark:focus:bg-white/[0.06] text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder:text-slate-400 font-sans resize-none focus:outline-none transition-all leading-relaxed"
            />
          </div>
        ) : (
          <div className="flex-1 flex flex-col space-y-2">
            {/* Input to add new task */}
            <form onSubmit={handleAddTodo} className="flex items-center gap-2">
              <input
                type="text"
                value={newTodoInput}
                onChange={(e) => setNewTodoInput(e.target.value)}
                placeholder="Add a milestone or priority..."
                className="flex-1 px-3 py-1.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200 dark:border-white/5 focus:border-indigo-500/40 text-xs text-slate-900 dark:text-slate-100 placeholder:text-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="p-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            </form>

            {/* Todo items list */}
            <div className="space-y-1.5 max-h-[130px] overflow-y-auto pr-1">
              {todos.length === 0 ? (
                <div className="text-center py-6 text-xs text-slate-400 dark:text-slate-500">
                  No tasks pending. You're all clear!
                </div>
              ) : (
                todos.map((todo) => (
                  <div
                    key={todo.id}
                    className="flex items-center justify-between gap-2 px-2.5 py-1.5 rounded-xl bg-slate-50/70 hover:bg-slate-100 dark:bg-white/[0.02] dark:hover:bg-white/[0.05] border border-slate-200 dark:border-white/5 group/todo transition-colors"
                  >
                    <button
                      onClick={() => toggleTodo(todo.id)}
                      className="flex items-center gap-2 text-left min-w-0 flex-1 cursor-pointer"
                    >
                      <div
                        className={`w-4 h-4 rounded-md border flex items-center justify-center transition-colors shrink-0 ${
                          todo.completed
                            ? 'bg-emerald-500 border-emerald-500 text-white'
                            : 'border-slate-300 dark:border-white/20 hover:border-slate-400 dark:hover:border-white/40'
                        }`}
                      >
                        {todo.completed && <Check className="w-3 h-3" />}
                      </div>
                      <span
                        className={`text-xs truncate ${
                          todo.completed ? 'line-through text-slate-400 dark:text-slate-500' : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {todo.text}
                      </span>
                    </button>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="opacity-0 group-hover/todo:opacity-100 text-slate-400 hover:text-rose-500 p-1 transition-opacity cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Bar: Stats & Convert to Entry Action */}
      <div className="relative z-10 pt-3 border-t border-slate-200 dark:border-white/5 flex items-center justify-between gap-3 text-[11px]">
        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <span className={`w-1.5 h-1.5 rounded-full ${saveStatus === 'saved' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
            <span>{saveStatus === 'saved' ? 'Saved' : 'Saving...'}</span>
          </span>
          <span>•</span>
          {activeTab === 'notes' ? (
            <span>{wordCount} words ({charCount} chars)</span>
          ) : (
            <span>{todos.length} total tasks</span>
          )}
        </div>

        {onConvertToEntry && (
          <button
            onClick={handleConvert}
            className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 font-semibold transition-colors cursor-pointer group/btn"
          >
            <FileEdit className="w-3 h-3" />
            <span>Save as Vault Entry</span>
            <ArrowUpRight className="w-3 h-3 transition-transform group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
          </button>
        )}
      </div>
    </div>
  );
};
