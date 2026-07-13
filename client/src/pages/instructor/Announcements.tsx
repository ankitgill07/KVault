import { useState, useEffect } from 'react';
import { courseService } from '../../services/courseService';
import type { Course } from '../../api/courseApi';
import { Card } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Plus, Search, Megaphone, Edit, Trash2, Calendar, Send, X, Clock } from 'lucide-react';

interface Announcement {
  id: string;
  title: string;
  content: string;
  courseId: string;
  courseName: string;
  scheduledAt: string | null;
  createdAt: string;
  status: 'sent' | 'scheduled' | 'draft';
}

const SEED_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'a1',
    title: 'New Q4 Curriculum Update Released',
    content: 'We have just released new lessons on advanced React patterns. Check the curriculum tab to get started.',
    courseId: '',
    courseName: 'All Courses',
    scheduledAt: null,
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
    status: 'sent',
  },
  {
    id: 'a2',
    title: 'Live Q&A Session Next Friday',
    content: 'Join us for a live Q&A session where we will discuss project challenges and best practices.',
    courseId: '',
    courseName: 'All Courses',
    scheduledAt: new Date(Date.now() + 7 * 24 * 3600 * 1000).toISOString(),
    createdAt: new Date(Date.now() - 1 * 24 * 3600 * 1000).toISOString(),
    status: 'scheduled',
  },
];

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const statusVariant: Record<string, 'success' | 'secondary' | 'neutral'> = {
  sent: 'success',
  scheduled: 'secondary',
  draft: 'neutral',
};

export default function Announcements() {
  const [announcements, setAnnouncements] = useState<Announcement[]>(SEED_ANNOUNCEMENTS);
  const [courses, setCourses] = useState<Course[]>([]);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [form, setForm] = useState({ title: '', content: '', courseId: '', scheduledAt: '' });

  useEffect(() => {
    courseService.getMyCourses().then(data => { if (data) setCourses(data); });
  }, []);

  const filtered = announcements.filter(a =>
    !search || a.title.toLowerCase().includes(search.toLowerCase()) || a.content.toLowerCase().includes(search.toLowerCase())
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ title: '', content: '', courseId: '', scheduledAt: '' });
    setShowModal(true);
  };

  const openEdit = (a: Announcement) => {
    setEditing(a);
    setForm({ title: a.title, content: a.content, courseId: a.courseId, scheduledAt: a.scheduledAt || '' });
    setShowModal(true);
  };

  const handleSubmit = () => {
    if (!form.title.trim() || !form.content.trim()) return;
    const course = courses.find(c => c._id === form.courseId);
    if (editing) {
      setAnnouncements(prev => prev.map(a => a.id === editing.id
        ? { ...a, ...form, courseName: course?.title || 'All Courses', status: form.scheduledAt ? 'scheduled' : 'sent' }
        : a
      ));
    } else {
      const newAnn: Announcement = {
        id: Date.now().toString(),
        title: form.title,
        content: form.content,
        courseId: form.courseId,
        courseName: course?.title || 'All Courses',
        scheduledAt: form.scheduledAt || null,
        createdAt: new Date().toISOString(),
        status: form.scheduledAt ? 'scheduled' : 'sent',
      };
      setAnnouncements(prev => [newAnn, ...prev]);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this announcement?')) return;
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Announcements</h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">Send updates and news to your enrolled students.</p>
        </div>
        <Button onClick={openCreate} className="flex items-center gap-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl shadow-md">
          <Plus className="w-4 h-4" /> New Announcement
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Sent', value: announcements.filter(a => a.status === 'sent').length },
          { label: 'Scheduled', value: announcements.filter(a => a.status === 'scheduled').length },
          { label: 'All Time', value: announcements.length },
        ].map(stat => (
          <Card key={stat.label} className="p-5 border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm text-center">
            <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-zinc-400 mt-1">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search announcements..."
          className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition"
        />
      </div>

      {/* Announcement List */}
      {filtered.length === 0 ? (
        <Card className="border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-16 text-center">
          <Megaphone className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No announcements yet</p>
          <p className="text-xs text-zinc-400 mt-1">Click "New Announcement" to get started</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map(ann => (
            <Card key={ann.id} className="p-6 border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h3 className="font-bold text-zinc-900 dark:text-white">{ann.title}</h3>
                    <Badge variant={statusVariant[ann.status]} className="text-[10px] rounded px-2 py-0.5 capitalize">{ann.status}</Badge>
                  </div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3 line-clamp-2">{ann.content}</p>
                  <div className="flex items-center gap-4 text-xs text-zinc-400">
                    <span className="flex items-center gap-1"><Megaphone className="w-3 h-3" />{ann.courseName}</span>
                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatDate(ann.createdAt)}</span>
                    {ann.scheduledAt && (
                      <span className="flex items-center gap-1 text-amber-500"><Calendar className="w-3 h-3" />Scheduled: {formatDate(ann.scheduledAt)}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(ann)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition">
                    <Edit className="w-4 h-4" />
                  </button>
                  <button onClick={() => handleDelete(ann.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-zinc-400 hover:text-red-500 transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative z-10 w-full max-w-lg bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">{editing ? 'Edit' : 'New'} Announcement</h2>
              <button onClick={() => setShowModal(false)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl text-zinc-400 transition"><X className="w-5 h-5" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 block">Title *</label>
                <input
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  placeholder="Announcement title..."
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 block">Content *</label>
                <textarea
                  value={form.content}
                  onChange={e => setForm(f => ({ ...f, content: e.target.value }))}
                  placeholder="Write your announcement..."
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition resize-none"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 block">Target Course</label>
                <select
                  value={form.courseId}
                  onChange={e => setForm(f => ({ ...f, courseId: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-700 dark:text-zinc-300 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                >
                  <option value="">All Courses</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 block">Schedule (optional)</label>
                <input
                  type="datetime-local"
                  value={form.scheduledAt}
                  onChange={e => setForm(f => ({ ...f, scheduledAt: e.target.value }))}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-700 dark:text-zinc-300 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={handleSubmit} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-2">
                  <Send className="w-4 h-4" /> {editing ? 'Update' : 'Send'} Announcement
                </Button>
                <Button variant="outline" onClick={() => setShowModal(false)} className="border-zinc-200 dark:border-zinc-800 rounded-xl">Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
