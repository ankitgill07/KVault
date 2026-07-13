import { useState, useMemo, useEffect } from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Users, Search, Eye, Mail, Download, Trash2, X } from 'lucide-react';
import { courseService } from '../../services/courseService';
import type { Course } from '../../api/courseApi';

interface MockStudent {
  id: string;
  name: string;
  email: string;
  avatar: string;
  course: string;
  courseId: string;
  progress: number;
  enrolledAt: string;
  lastActive: string;
  status: 'Completed' | 'In Progress' | 'Not Started';
}

// Generate students from courses for demo
function generateStudents(courses: Course[]): MockStudent[] {
  const names = ['Alice Johnson', 'Bob Smith', 'Carol White', 'David Lee', 'Emma Davis', 'Frank Brown', 'Grace Kim', 'Henry Zhang'];
  return courses.flatMap((c, ci) =>
    names.slice(0, 3 + ci).map((name, i) => ({
      id: `${c._id}-${i}`,
      name,
      email: `${name.toLowerCase().replace(' ', '.')}@email.com`,
      avatar: `https://i.pravatar.cc/40?img=${(ci * 5 + i + 1) % 70}`,
      course: c.title,
      courseId: c._id,
      progress: Math.round(Math.random() * 100),
      enrolledAt: new Date(Date.now() - Math.random() * 90 * 24 * 3600 * 1000).toISOString(),
      lastActive: new Date(Date.now() - Math.random() * 7 * 24 * 3600 * 1000).toISOString(),
      status: (['Completed', 'In Progress', 'Not Started'] as const)[Math.floor(Math.random() * 3)],
    }))
  );
}

const statusVariant: Record<string, 'success' | 'secondary' | 'neutral'> = {
  Completed: 'success',
  'In Progress': 'secondary',
  'Not Started': 'neutral',
};

export default function Students() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [students, setStudents] = useState<MockStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewStudent, setViewStudent] = useState<MockStudent | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await courseService.getMyCourses();
        if (data) {
          setCourses(data);
          setStudents(generateStudents(data));
        }
      } catch (err) {
        console.error('Students fetch error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = useMemo(() =>
    students.filter(s => {
      if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.email.toLowerCase().includes(search.toLowerCase())) return false;
      if (courseFilter && s.courseId !== courseFilter) return false;
      if (statusFilter && s.status !== statusFilter) return false;
      return true;
    }),
    [students, search, courseFilter, statusFilter]
  );

  const handleRemove = (id: string) => {
    setStudents(prev => prev.filter(s => s.id !== id));
  };

  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Students</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">View and manage students enrolled in your courses.</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', value: students.length },
          { label: 'Active (In Progress)', value: students.filter(s => s.status === 'In Progress').length },
          { label: 'Completed', value: students.filter(s => s.status === 'Completed').length },
          { label: 'Avg. Progress', value: `${Math.round(students.reduce((s, x) => s + x.progress, 0) / (students.length || 1))}%` },
        ].map(stat => (
          <Card key={stat.label} className="p-5 border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1">{stat.label}</p>
            <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">{stat.value}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition"
          />
        </div>
        <select
          value={courseFilter}
          onChange={e => setCourseFilter(e.target.value)}
          className="py-2.5 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-700 dark:text-zinc-300 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
        >
          <option value="">All Courses</option>
          {courses.map(c => <option key={c._id} value={c._id}>{c.title}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          className="py-2.5 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-700 dark:text-zinc-300 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
        >
          <option value="">All Status</option>
          <option value="Completed">Completed</option>
          <option value="In Progress">In Progress</option>
          <option value="Not Started">Not Started</option>
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[1,2,3,4].map(i => <div key={i} className="h-16 rounded-xl bg-zinc-100 dark:bg-zinc-800 animate-pulse" />)}
        </div>
      ) : filtered.length === 0 ? (
        <Card className="border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-16 text-center">
          <Users className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No students found</p>
          <p className="text-xs text-zinc-400 mt-1">Try adjusting your filters</p>
        </Card>
      ) : (
        <Card className="border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-zinc-50 dark:bg-zinc-800/40 border-b border-zinc-100 dark:border-zinc-800">
                  <th className="text-left px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Student</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Course</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Progress</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Status</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Enrolled</th>
                  <th className="text-left px-4 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Last Active</th>
                  <th className="text-right px-5 py-3 text-xs font-semibold text-zinc-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                {filtered.map(student => (
                  <tr key={student.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30 transition group">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <img src={student.avatar} alt="" className="w-9 h-9 rounded-full ring-2 ring-white dark:ring-zinc-900" />
                        <div>
                          <p className="font-semibold text-sm text-zinc-800 dark:text-zinc-200">{student.name}</p>
                          <p className="text-[11px] text-zinc-400">{student.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-xs text-zinc-600 dark:text-zinc-400 max-w-[160px] truncate">{student.course}</td>
                    <td className="px-4 py-4 w-36">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-1.5 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${student.progress === 100 ? 'bg-emerald-500' : 'bg-violet-500'}`}
                            style={{ width: `${student.progress}%` }}
                          />
                        </div>
                        <span className="text-[11px] font-bold text-zinc-500 w-9 text-right">{student.progress}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <Badge variant={statusVariant[student.status]} className="text-[10px] rounded px-2 py-0.5">{student.status}</Badge>
                    </td>
                    <td className="px-4 py-4 text-xs text-zinc-500 dark:text-zinc-400">{formatDate(student.enrolledAt)}</td>
                    <td className="px-4 py-4 text-xs text-zinc-500 dark:text-zinc-400">{formatDate(student.lastActive)}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button onClick={() => setViewStudent(student)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 transition" title="View"><Eye className="w-4 h-4" /></button>
                        <button onClick={() => alert(`Message sent to ${student.name}`)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 transition" title="Message"><Mail className="w-4 h-4" /></button>
                        <button onClick={() => handleRemove(student.id)} className="p-1.5 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg text-zinc-400 hover:text-red-500 transition" title="Remove"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Student Detail Drawer */}
      {viewStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-end">
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setViewStudent(null)} />
          <div className="relative z-10 w-full max-w-md h-full bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl p-8 overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-lg font-extrabold text-zinc-900 dark:text-white">Student Details</h2>
              <button onClick={() => setViewStudent(null)} className="p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl text-zinc-400 transition"><X className="w-5 h-5" /></button>
            </div>
            <div className="flex items-center gap-4 mb-8">
              <img src={viewStudent.avatar} alt="" className="w-16 h-16 rounded-2xl ring-4 ring-zinc-100 dark:ring-zinc-900" />
              <div>
                <h3 className="font-extrabold text-zinc-900 dark:text-white">{viewStudent.name}</h3>
                <p className="text-sm text-zinc-500">{viewStudent.email}</p>
                <Badge variant={statusVariant[viewStudent.status]} className="text-[10px] rounded px-2 py-0.5 mt-1">{viewStudent.status}</Badge>
              </div>
            </div>
            <div className="space-y-5">
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
                <p className="text-xs text-zinc-400 mb-2">Course Progress</p>
                <div className="flex items-center gap-3">
                  <div className="flex-1 h-2 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${viewStudent.progress === 100 ? 'bg-emerald-500' : 'bg-violet-500'}`} style={{ width: `${viewStudent.progress}%` }} />
                  </div>
                  <span className="text-lg font-extrabold text-zinc-900 dark:text-white">{viewStudent.progress}%</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
                  <p className="text-xs text-zinc-400 mb-1">Enrolled</p>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{formatDate(viewStudent.enrolledAt)}</p>
                </div>
                <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
                  <p className="text-xs text-zinc-400 mb-1">Last Active</p>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200">{formatDate(viewStudent.lastActive)}</p>
                </div>
              </div>
              <div className="p-4 bg-zinc-50 dark:bg-zinc-900 rounded-xl">
                <p className="text-xs text-zinc-400 mb-1">Enrolled Course</p>
                <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200">{viewStudent.course}</p>
              </div>
              <div className="flex gap-3">
                <Button className="flex-1 bg-violet-600 hover:bg-violet-700 text-white rounded-xl gap-2" onClick={() => alert(`Message sent to ${viewStudent.name}`)}>
                  <Mail className="w-4 h-4" /> Send Message
                </Button>
                <Button variant="outline" className="flex-1 border-zinc-200 dark:border-zinc-800 rounded-xl gap-2" onClick={() => alert('Downloading report...')}>
                  <Download className="w-4 h-4" /> Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
