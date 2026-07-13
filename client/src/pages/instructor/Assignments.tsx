import { useState, useMemo } from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { ClipboardList, Search, Check, X, MessageSquare, Calendar, FileText } from 'lucide-react';

interface Assignment {
  id: string;
  title: string;
  courseName: string;
  dueDate: string;
  totalSubmissions: number;
  pendingGrade: number;
}

interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle: string;
  studentName: string;
  studentAvatar: string;
  submittedAt: string;
  status: 'pending' | 'graded' | 'rejected';
  score: number | null;
  feedback: string;
  fileUrl?: string;
}

const MOCK_ASSIGNMENTS: Assignment[] = [
  { id: 'as1', title: 'Build a React Component Library', courseName: 'Full-Stack Web BootCamp', dueDate: '2025-07-15', totalSubmissions: 12, pendingGrade: 4 },
  { id: 'as2', title: 'Design System Case Study', courseName: 'UI/UX Figma BootCamp', dueDate: '2025-07-20', totalSubmissions: 8, pendingGrade: 2 },
];

const MOCK_SUBMISSIONS: Submission[] = [
  { id: 's1', assignmentId: 'as1', assignmentTitle: 'Build a React Component Library', studentName: 'Alice Johnson', studentAvatar: 'https://i.pravatar.cc/40?img=1', submittedAt: new Date(Date.now() - 2 * 3600000).toISOString(), status: 'pending', score: null, feedback: '' },
  { id: 's2', assignmentId: 'as1', assignmentTitle: 'Build a React Component Library', studentName: 'Bob Smith', studentAvatar: 'https://i.pravatar.cc/40?img=2', submittedAt: new Date(Date.now() - 5 * 3600000).toISOString(), status: 'pending', score: null, feedback: '' },
  { id: 's3', assignmentId: 'as2', assignmentTitle: 'Design System Case Study', studentName: 'Carol White', studentAvatar: 'https://i.pravatar.cc/40?img=3', submittedAt: new Date(Date.now() - 1 * 86400000).toISOString(), status: 'graded', score: 88, feedback: 'Great color system choice!' },
  { id: 's4', assignmentId: 'as1', assignmentTitle: 'Build a React Component Library', studentName: 'David Lee', studentAvatar: 'https://i.pravatar.cc/40?img=4', submittedAt: new Date(Date.now() - 2 * 86400000).toISOString(), status: 'graded', score: 95, feedback: 'Excellent work!' },
  { id: 's5', assignmentId: 'as2', assignmentTitle: 'Design System Case Study', studentName: 'Emma Davis', studentAvatar: 'https://i.pravatar.cc/40?img=5', submittedAt: new Date(Date.now() - 3 * 86400000).toISOString(), status: 'pending', score: null, feedback: '' },
];

const statusVariant: Record<string, 'success' | 'secondary' | 'neutral'> = {
  graded: 'success', pending: 'secondary', rejected: 'neutral',
};

export default function Assignments() {
  const [submissions, setSubmissions] = useState<Submission[]>(MOCK_SUBMISSIONS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [assignmentFilter, setAssignmentFilter] = useState('all');
  const [grading, setGrading] = useState<Submission | null>(null);
  const [gradeForm, setGradeForm] = useState({ score: '', feedback: '' });

  const filtered = useMemo(() =>
    submissions.filter(s => {
      if (search && !s.studentName.toLowerCase().includes(search.toLowerCase()) && !s.assignmentTitle.toLowerCase().includes(search.toLowerCase())) return false;
      if (statusFilter !== 'all' && s.status !== statusFilter) return false;
      if (assignmentFilter !== 'all' && s.assignmentId !== assignmentFilter) return false;
      return true;
    }),
    [submissions, search, statusFilter, assignmentFilter]
  );

  const handleGrade = () => {
    if (!grading || !gradeForm.score) return;
    setSubmissions(prev => prev.map(s => s.id === grading.id
      ? { ...s, status: 'graded', score: Number(gradeForm.score), feedback: gradeForm.feedback }
      : s
    ));
    setGrading(null);
    setGradeForm({ score: '', feedback: '' });
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Assignments</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Review and grade student submissions across your courses.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Assignments', value: MOCK_ASSIGNMENTS.length },
          { label: 'Submissions', value: submissions.length },
          { label: 'Pending Grade', value: submissions.filter(s => s.status === 'pending').length },
          { label: 'Avg. Score', value: (() => { const graded = submissions.filter(s => s.score !== null); return graded.length ? `${Math.round(graded.reduce((s,x) => s + (x.score||0), 0) / graded.length)}%` : 'N/A'; })() },
        ].map(stat => (
          <Card key={stat.label} className="p-5 border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm text-center">
            <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-zinc-400 mt-1">{stat.label}</p>
          </Card>
        ))}
      </div>

      {/* Assignment Overview Cards */}
      <div>
        <h2 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-3">Assignments Overview</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {MOCK_ASSIGNMENTS.map(as => (
            <Card key={as.id} className="p-5 border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm">
              <div className="flex items-start gap-3">
                <div className="p-2.5 bg-violet-50 dark:bg-violet-950/50 rounded-xl"><FileText className="w-5 h-5 text-violet-600" /></div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white truncate">{as.title}</h3>
                  <p className="text-xs text-zinc-400 mt-0.5">{as.courseName}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-zinc-400">
                    <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />Due: {formatDate(as.dueDate)}</span>
                    <span>{as.totalSubmissions} submitted</span>
                    {as.pendingGrade > 0 && <span className="text-amber-500 font-semibold">{as.pendingGrade} pending</span>}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search submissions..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition"
          />
        </div>
        <select
          value={assignmentFilter}
          onChange={e => setAssignmentFilter(e.target.value)}
          className="py-2.5 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-700 dark:text-zinc-300 outline-none focus:border-violet-500"
        >
          <option value="all">All Assignments</option>
          {MOCK_ASSIGNMENTS.map(a => <option key={a.id} value={a.id}>{a.title}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="py-2.5 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-700 dark:text-zinc-300 outline-none focus:border-violet-500"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="graded">Graded</option>
        </select>
      </div>

      {/* Submissions Table */}
      {filtered.length === 0 ? (
        <Card className="border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-16 text-center">
          <ClipboardList className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No submissions found</p>
        </Card>
      ) : (
        <Card className="border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Student</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Assignment</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Submitted</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Score</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filtered.map(sub => (
                  <tr key={sub.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={sub.studentAvatar} alt="" className="w-8 h-8 rounded-full" />
                        <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">{sub.studentName}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-zinc-600 dark:text-zinc-400 max-w-[180px] truncate">{sub.assignmentTitle}</td>
                    <td className="px-4 py-4 text-xs text-zinc-500">{formatDate(sub.submittedAt)}</td>
                    <td className="px-4 py-4">
                      <Badge variant={statusVariant[sub.status]} className="text-[10px] rounded px-2 py-0.5 capitalize">{sub.status}</Badge>
                    </td>
                    <td className="px-4 py-4 text-sm font-bold text-zinc-800 dark:text-zinc-200">
                      {sub.score !== null ? `${sub.score}/100` : '—'}
                    </td>
                    <td className="px-5 py-4 text-right">
                      {sub.status === 'pending' ? (
                        <Button size="sm" onClick={() => { setGrading(sub); setGradeForm({ score: '', feedback: '' }); }} className="text-xs rounded-lg h-8 bg-violet-600 hover:bg-violet-700 text-white">
                          <Check className="w-3 h-3 mr-1" /> Grade
                        </Button>
                      ) : (
                        <button onClick={() => { setGrading(sub); setGradeForm({ score: String(sub.score || ''), feedback: sub.feedback }); }} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-zinc-700 transition">
                          <MessageSquare className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Grading Modal */}
      {grading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setGrading(null)} />
          <div className="relative z-10 w-full max-w-md bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 p-8 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">Grade Submission</h2>
              <button onClick={() => setGrading(null)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 rounded-xl text-zinc-400 transition"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex items-center gap-3 mb-6 p-3 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
              <img src={grading.studentAvatar} alt="" className="w-10 h-10 rounded-full" />
              <div>
                <p className="font-bold text-sm text-zinc-900 dark:text-white">{grading.studentName}</p>
                <p className="text-xs text-zinc-400">{grading.assignmentTitle}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 block">Score (out of 100) *</label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={gradeForm.score}
                  onChange={e => setGradeForm(f => ({ ...f, score: e.target.value }))}
                  placeholder="e.g. 85"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-1.5 block">Feedback</label>
                <textarea
                  value={gradeForm.feedback}
                  onChange={e => setGradeForm(f => ({ ...f, feedback: e.target.value }))}
                  placeholder="Write feedback for the student..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition resize-none"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <Button onClick={handleGrade} className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-2">
                  <Check className="w-4 h-4" /> Submit Grade
                </Button>
                <Button variant="outline" onClick={() => setGrading(null)} className="border-zinc-200 dark:border-zinc-800 rounded-xl">Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
