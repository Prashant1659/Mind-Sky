import React, { useEffect, useState, useRef, useCallback } from 'react';
import * as FiIcons from 'react-icons/fi';

/* ───────────────────────── helpers ───────────────────────── */
const API = '/api/journal';
const token = () => localStorage.getItem('token');

const MOODS = [
  { emoji: '😊', label: 'Happy',    color: '#10B981', bg: 'bg-emerald-50',   text: 'text-emerald-600' },
  { emoji: '😔', label: 'Sad',      color: '#F59E0B', bg: 'bg-amber-50',     text: 'text-amber-600'   },
  { emoji: '😰', label: 'Anxious',  color: '#EF4444', bg: 'bg-red-50',       text: 'text-red-600'     },
  { emoji: '😤', label: 'Angry',    color: '#F97316', bg: 'bg-orange-50',    text: 'text-orange-600'  },
  { emoji: '😌', label: 'Calm',     color: '#6366F1', bg: 'bg-indigo-50',    text: 'text-indigo-600'  },
  { emoji: '🥰', label: 'Loved',    color: '#EC4899', bg: 'bg-pink-50',      text: 'text-pink-600'    },
  { emoji: '😴', label: 'Tired',    color: '#8B5CF6', bg: 'bg-violet-50',    text: 'text-violet-600'  },
  { emoji: '🤔', label: 'Confused', color: '#14B8A6', bg: 'bg-teal-50',      text: 'text-teal-600'    },
];

const formatDate = (d) => {
  const date = new Date(d);
  return date.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
};
const formatTime = (d) => {
  const date = new Date(d);
  return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
};
const wordCount = (text) => text.trim().split(/\s+/).filter(Boolean).length;
const readingTime = (text) => Math.max(1, Math.ceil(wordCount(text) / 200));
const getMoodMeta = (emoji) => MOODS.find(m => m.emoji === emoji) || MOODS[0];

const PROMPTS = [
  'What made you smile today?',
  "What's weighing on your mind right now?",
  'Describe one small win from today.',
  'What are you grateful for in this moment?',
  'If your emotions had a color today, what would it be?',
  'What would you tell your past self right now?',
  'What do you need to let go of?',
  'Describe your ideal version of tomorrow.',
];

/* ───────────────────────── sub-components ───────────────────────── */

function EmptyState({ onNew }) {
  return (
    <div className="flex flex-col items-center justify-center py-20 gap-6 text-center">
      <div className="relative">
        <div className="w-28 h-28 rounded-[32px] bg-gradient-to-br from-amber-100 to-orange-100 flex items-center justify-center text-5xl shadow-lg">
          📓
        </div>
        <div className="absolute -bottom-2 -right-2 w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-md border border-gray-100">
          <span className="text-lg">✨</span>
        </div>
      </div>
      <div>
        <p className="text-2xl font-serif font-black text-[#0D1B2A] mb-2">Your journal awaits</p>
        <p className="text-sm font-medium text-[#0D1B2A]/40 max-w-sm">
          Every great story starts with a first sentence. Pour your thoughts, feelings, and dreams here — this is your safe space.
        </p>
      </div>
      <button
        onClick={onNew}
        className="px-8 py-4 bg-[#0D1B2A] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl hover:-translate-y-0.5 active:scale-95 cursor-pointer"
      >
        Write First Entry ✨
      </button>
    </div>
  );
}

function StatsBar({ entries }) {
  const total = entries.length;
  const totalWords = entries.reduce((s, e) => s + wordCount(e.text), 0);
  const moodCounts = entries.reduce((acc, e) => {
    acc[e.mood] = (acc[e.mood] || 0) + 1;
    return acc;
  }, {});
  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0];

  const stats = [
    { label: 'Entries', value: total, icon: 'FiBookOpen', color: 'bg-blue-50 text-blue-500' },
    { label: 'Words Written', value: totalWords.toLocaleString(), icon: 'FiEdit3', color: 'bg-amber-50 text-amber-500' },
    { label: 'Top Mood', value: topMood ? `${topMood[0]} ${getMoodMeta(topMood[0]).label}` : '—', icon: 'FiSmile', color: 'bg-emerald-50 text-emerald-500' },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 mb-8">
      {stats.map((s, i) => {
        const Icon = FiIcons[s.icon];
        return (
          <div key={i} className="bg-white/60 backdrop-blur-xl border border-white rounded-[24px] p-5 shadow-sm flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${s.color} shrink-0`}>
              <Icon size={18} />
            </div>
            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-widest text-[#0D1B2A]/40 mb-0.5">{s.label}</div>
              <div className="text-lg font-black text-[#0D1B2A] truncate">{s.value}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function JournalCard({ entry, onEdit, onDelete, isDeleting }) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const moodMeta = getMoodMeta(entry.mood);

  return (
    <div
      className={`bg-white/60 backdrop-blur-xl border border-white rounded-[32px] overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5 group ${isDeleting ? 'opacity-40 scale-95 pointer-events-none' : ''}`}
    >
      {/* Card top bar */}
      <div className={`h-1.5 w-full ${moodMeta.bg.replace('bg-', 'bg-gradient-to-r from-')} bg-gradient-to-r`}
        style={{ background: `linear-gradient(90deg, ${moodMeta.color}44, ${moodMeta.color})` }}
      />

      <div className="p-7">
        {/* Header row */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex-1 min-w-0">
            {entry.title && (
              <h3 className="text-lg font-black text-[#0D1B2A] mb-1 leading-tight truncate">{entry.title}</h3>
            )}
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-black ${moodMeta.bg} ${moodMeta.text}`}>
                <span>{entry.mood}</span>
                <span>{moodMeta.label}</span>
              </span>
              <span className="text-[11px] font-semibold text-[#0D1B2A]/40 flex items-center gap-1">
                <FiIcons.FiCalendar size={10} />
                {formatDate(entry.date)}
              </span>
              <span className="text-[11px] font-semibold text-[#0D1B2A]/40 flex items-center gap-1">
                <FiIcons.FiClock size={10} />
                {formatTime(entry.date)}
              </span>
              {entry.updatedAt && (
                <span className="text-[10px] font-medium text-[#0D1B2A]/30 italic">edited</span>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
            <button
              onClick={() => onEdit(entry)}
              className="p-2 rounded-xl hover:bg-blue-50 text-[#0D1B2A]/40 hover:text-blue-500 transition-all cursor-pointer"
              title="Edit"
            >
              <FiIcons.FiEdit3 size={15} />
            </button>
            {showDeleteConfirm ? (
              <div className="flex items-center gap-1 bg-red-50 rounded-xl px-2 py-1">
                <span className="text-[10px] font-black text-red-500">Sure?</span>
                <button
                  onClick={() => { onDelete(entry._id); setShowDeleteConfirm(false); }}
                  className="p-1 rounded-lg hover:bg-red-100 text-red-500 cursor-pointer"
                >
                  <FiIcons.FiCheck size={13} />
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="p-1 rounded-lg hover:bg-gray-100 text-[#0D1B2A]/40 cursor-pointer"
                >
                  <FiIcons.FiX size={13} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="p-2 rounded-xl hover:bg-red-50 text-[#0D1B2A]/40 hover:text-red-400 transition-all cursor-pointer"
                title="Delete"
              >
                <FiIcons.FiTrash2 size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Body */}
        <p className="text-sm font-medium text-[#0D1B2A]/70 leading-relaxed line-clamp-4 mb-4 whitespace-pre-line">
          {entry.text}
        </p>

        {/* Footer */}
        <div className="flex items-center gap-4 text-[11px] font-bold text-[#0D1B2A]/30">
          <span className="flex items-center gap-1"><FiIcons.FiAlignLeft size={11} />{wordCount(entry.text)} words</span>
          <span className="flex items-center gap-1"><FiIcons.FiBook size={11} />{readingTime(entry.text)} min read</span>
        </div>
      </div>
    </div>
  );
}

function JournalEditor({ entry, onSave, onClose, isSaving }) {
  const [title, setTitle] = useState(entry?.title || '');
  const [text, setText] = useState(entry?.text || '');
  const [mood, setMood] = useState(entry?.mood || '😊');
  const [promptIdx] = useState(() => Math.floor(Math.random() * PROMPTS.length));
  const textareaRef = useRef(null);
  const isEdit = !!entry?._id;

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    onSave({ title, text, mood, ...(isEdit ? { id: entry._id } : {}) });
  };

  const selectedMoodMeta = getMoodMeta(mood);

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#0D1B2A]/50 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Coloured top bar */}
        <div
          className="h-2 w-full shrink-0"
          style={{ background: `linear-gradient(90deg, ${selectedMoodMeta.color}44, ${selectedMoodMeta.color})` }}
        />

        <div className="p-8 md:p-10 overflow-y-auto flex-1">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-serif font-black text-[#0D1B2A]">
                {isEdit ? 'Edit Entry' : "Today's Journal"}
              </h2>
              <p className="text-xs font-black uppercase tracking-widest text-[#0D1B2A]/30 mt-0.5">
                {isEdit ? 'Update your thoughts' : new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full hover:bg-gray-100 flex items-center justify-center text-[#0D1B2A]/40 hover:text-[#0D1B2A] transition-all cursor-pointer"
            >
              <FiIcons.FiX size={20} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Mood selector */}
            <div>
              <div className="text-[10px] font-black uppercase tracking-widest text-[#0D1B2A]/40 mb-3">
                How are you feeling?
              </div>
              <div className="flex flex-wrap gap-2">
                {MOODS.map((m) => (
                  <button
                    key={m.emoji}
                    type="button"
                    onClick={() => setMood(m.emoji)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black transition-all cursor-pointer border-2 ${
                      mood === m.emoji
                        ? `${m.bg} ${m.text} border-current shadow-sm scale-105`
                        : 'bg-gray-50 text-[#0D1B2A]/50 border-transparent hover:border-gray-200'
                    }`}
                  >
                    <span className="text-base">{m.emoji}</span>
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Title */}
            <div>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Give your entry a title (optional)..."
                className="w-full bg-gray-50 rounded-2xl px-5 py-3.5 text-base font-bold text-[#0D1B2A] placeholder:text-[#0D1B2A]/25 outline-none focus:ring-2 focus:ring-blue-100 transition-all"
                maxLength={100}
              />
            </div>

            {/* Writing prompt */}
            {!isEdit && (
              <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 border border-amber-100 rounded-2xl">
                <span className="text-lg mt-0.5">💡</span>
                <p className="text-sm font-semibold text-amber-700 leading-snug italic">
                  Prompt: {PROMPTS[promptIdx]}
                </p>
              </div>
            )}

            {/* Textarea */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="The sky is yours... write freely."
                rows={10}
                className="w-full bg-gray-50 rounded-3xl p-6 text-[15px] font-medium text-[#0D1B2A] placeholder:text-[#0D1B2A]/25 outline-none focus:ring-2 focus:ring-blue-100 transition-all resize-none leading-relaxed"
              />
              <div className="absolute bottom-4 right-5 text-[11px] font-black text-[#0D1B2A]/25">
                {wordCount(text)} words
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={!text.trim() || isSaving}
              className="w-full py-4 bg-[#0D1B2A] text-white rounded-2xl font-black text-sm uppercase tracking-[0.25em] hover:bg-black shadow-xl transition-all active:scale-[0.98] disabled:opacity-40 cursor-pointer flex items-center justify-center gap-2"
            >
              {isSaving ? (
                <><FiIcons.FiLoader size={16} className="animate-spin" /> Saving…</>
              ) : isEdit ? (
                <><FiIcons.FiCheck size={16} /> Update Entry</>
              ) : (
                <>Save & Shine ✨</>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

/* ───────────────────────── main component ───────────────────────── */

export default function Journal({ user, onUpdate }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState(null);
  const [search, setSearch] = useState('');
  const [filterMood, setFilterMood] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');
  const [toast, setToast] = useState(null);
  const [xpPops, setXpPops] = useState([]);
  const xpPopId = React.useRef(0);

  const spawnXPPop = (label) => {
    const id = xpPopId.current++;
    setXpPops(prev => [...prev, { id, label }]);
    setTimeout(() => setXpPops(prev => prev.filter(p => p.id !== id)), 2000);
  };

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  /* fetch */
  const fetchEntries = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(API, { headers: { Authorization: `Bearer ${token()}` } });
      if (res.ok) {
        const data = await res.json();
        setEntries(data.journal || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEntries(); }, [fetchEntries]);

  /* create / update */
  const handleSave = async ({ title, text, mood, id }) => {
    setIsSaving(true);
    try {
      const isEdit = !!id;
      const url = isEdit ? `${API}/${id}` : API;
      const method = isEdit ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token()}` },
        body: JSON.stringify({ title, text, mood }),
      });
      if (res.ok) {
        const data = await res.json();
        setEntries(data.journal || []);
        setEditorOpen(false);
        setEditingEntry(null);
        if (!isEdit) {
          showToast('Journal saved ✨ +200 XP!');
          spawnXPPop('+200 XP 📓');
          // sync user xp/level and journal to localStorage + parent
          const u = JSON.parse(localStorage.getItem('user') || '{}');
          u.journal = data.journal;
          if (data.xp !== undefined) {
            u.xp = data.xp; u.level = data.level;
          }
          localStorage.setItem('user', JSON.stringify(u));
          if (onUpdate) onUpdate(u);
        } else {
          showToast('Entry updated 📝');
          const u = JSON.parse(localStorage.getItem('user') || '{}');
          u.journal = data.journal;
          localStorage.setItem('user', JSON.stringify(u));
          if (onUpdate) onUpdate(u);
        }
      } else {
        showToast('Failed to save entry', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  /* delete single */
  const handleDelete = async (id) => {
    setDeletingId(id);
    try {
      const res = await fetch(`${API}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token()}` },
      });
      if (res.ok) {
        const data = await res.json();
        setEntries(data.journal || []);
        showToast('Entry deleted 🗑️');
        
        // sync to parent
        const u = JSON.parse(localStorage.getItem('user') || '{}');
        u.journal = data.journal;
        localStorage.setItem('user', JSON.stringify(u));
        if (onUpdate) onUpdate(u);
      } else {
        showToast('Failed to delete', 'error');
      }
    } catch (err) {
      showToast('Network error', 'error');
    } finally {
      setDeletingId(null);
    }
  };

  const openNewEditor = () => { setEditingEntry(null); setEditorOpen(true); };
  const openEditEditor = (entry) => { setEditingEntry(entry); setEditorOpen(true); };

  /* filtering + sorting */
  const filtered = entries
    .filter(e => {
      const matchSearch =
        search.trim() === '' ||
        e.text.toLowerCase().includes(search.toLowerCase()) ||
        (e.title || '').toLowerCase().includes(search.toLowerCase());
      const matchMood = filterMood === 'all' || e.mood === filterMood;
      return matchSearch && matchMood;
    })
    .sort((a, b) =>
      sortOrder === 'newest'
        ? new Date(b.date) - new Date(a.date)
        : new Date(a.date) - new Date(b.date)
    );

  const firstName = user?.fullName?.split(' ')[0] || 'Friend';

  return (
    <div className="max-w-3xl mx-auto pb-16 relative">
      {/* XP pop animation */}
      <style>{`
        @keyframes journalXPFloat {
          0%   { transform: translate(-50%, 0);     opacity: 0; scale: 0.5; }
          15%  { transform: translate(-50%, -30px);  opacity: 1; scale: 1.3; }
          75%  { transform: translate(-50%, -90px);  opacity: 1; scale: 1; }
          100% { transform: translate(-50%, -140px); opacity: 0; scale: 0.85; }
        }
        .journal-xp-float { animation: journalXPFloat 2s ease-out forwards; }
      `}</style>
      {xpPops.map(p => (
        <div key={p.id} className="journal-xp-float absolute top-16 left-1/2 pointer-events-none z-[400] whitespace-nowrap">
          <div className="px-6 py-3 bg-gradient-to-r from-amber-400 to-orange-500 text-white font-black text-2xl rounded-full shadow-2xl border-4 border-white/50">
            {p.label}
          </div>
        </div>
      ))}

      {/* Toast */}
      {toast && (
        <div className={`fixed top-6 right-6 z-[300] flex items-center gap-3 px-5 py-3.5 rounded-2xl shadow-2xl text-sm font-black transition-all duration-300 ${
          toast.type === 'error' ? 'bg-red-500 text-white' : 'bg-[#0D1B2A] text-white'
        }`}>
          {toast.type === 'error' ? <FiIcons.FiAlertCircle size={16} /> : <FiIcons.FiCheckCircle size={16} />}
          {toast.msg}
        </div>
      )}

      {/* Editor modal */}
      {editorOpen && (
        <JournalEditor
          entry={editingEntry}
          onSave={handleSave}
          onClose={() => { setEditorOpen(false); setEditingEntry(null); }}
          isSaving={isSaving}
        />
      )}

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8">
        <div>
          <h1 className="text-4xl font-serif font-black tracking-tight mb-1">My Journal</h1>
          <p className="text-xs font-black uppercase tracking-widest text-[#0D1B2A]/40">
            Your private thoughts, {firstName} · {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
          </p>
        </div>
        <button
          onClick={openNewEditor}
          className="flex items-center gap-2 px-6 py-3.5 bg-[#0D1B2A] text-white rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-xl hover:-translate-y-0.5 active:scale-95 cursor-pointer shrink-0"
        >
          <FiIcons.FiPlus size={16} />
          New Entry
        </button>
      </header>

      {/* Stats */}
      {entries.length > 0 && <StatsBar entries={entries} />}

      {/* Search + filters */}
      {entries.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Search */}
          <div className="relative flex-1 min-w-[180px]">
            <FiIcons.FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#0D1B2A]/30" size={16} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search entries…"
              className="w-full bg-white/60 backdrop-blur-md border border-white rounded-2xl pl-11 pr-4 py-3 text-sm font-medium text-[#0D1B2A] placeholder:text-[#0D1B2A]/30 outline-none focus:ring-2 focus:ring-blue-100 transition-all shadow-sm"
            />
          </div>

          {/* Mood filter */}
          <select
            value={filterMood}
            onChange={(e) => setFilterMood(e.target.value)}
            className="bg-white/60 backdrop-blur-md border border-white rounded-2xl px-4 py-3 text-sm font-black text-[#0D1B2A]/70 outline-none focus:ring-2 focus:ring-blue-100 shadow-sm cursor-pointer"
          >
            <option value="all">All Moods</option>
            {MOODS.map(m => <option key={m.emoji} value={m.emoji}>{m.emoji} {m.label}</option>)}
          </select>

          {/* Sort */}
          <button
            onClick={() => setSortOrder(o => o === 'newest' ? 'oldest' : 'newest')}
            className="flex items-center gap-2 bg-white/60 backdrop-blur-md border border-white rounded-2xl px-4 py-3 text-sm font-black text-[#0D1B2A]/70 hover:bg-white transition-all shadow-sm cursor-pointer"
          >
            <FiIcons.FiList size={14} />
            {sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}
          </button>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-24 gap-3 text-[#0D1B2A]/40">
          <FiIcons.FiLoader size={20} className="animate-spin" />
          <span className="text-sm font-medium">Loading your journal…</span>
        </div>
      ) : entries.length === 0 ? (
        <EmptyState onNew={openNewEditor} />
      ) : filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl">🔍</div>
          <div>
            <p className="text-lg font-bold text-[#0D1B2A]/70 mb-1">No entries found</p>
            <p className="text-xs font-medium text-[#0D1B2A]/40">Try a different search or mood filter.</p>
          </div>
          <button
            onClick={() => { setSearch(''); setFilterMood('all'); }}
            className="text-sm font-black text-blue-500 hover:underline cursor-pointer"
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className="space-y-5">
          {filtered.map(entry => (
            <JournalCard
              key={entry._id}
              entry={entry}
              onEdit={openEditEditor}
              onDelete={handleDelete}
              isDeleting={deletingId === entry._id}
            />
          ))}
        </div>
      )}
    </div>
  );
}
