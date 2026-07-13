import { useState, useMemo } from 'react';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { MessageCircle, Search, Send, ChevronDown, Pin, PinOff, ThumbsUp } from 'lucide-react';

interface Reply {
  id: string;
  author: string;
  avatar: string;
  content: string;
  createdAt: string;
  isInstructor: boolean;
}

interface Question {
  id: string;
  student: string;
  avatar: string;
  courseName: string;
  title: string;
  content: string;
  createdAt: string;
  isPinned: boolean;
  upvotes: number;
  replies: Reply[];
}

const MOCK_QUESTIONS: Question[] = [
  {
    id: 'q1',
    student: 'Alice Johnson',
    avatar: 'https://i.pravatar.cc/40?img=1',
    courseName: 'Full-Stack Web BootCamp',
    title: 'What is the difference between useCallback and useMemo?',
    content: 'I understand both hooks are for optimization, but when should I use one over the other? Can you provide a practical example?',
    createdAt: new Date(Date.now() - 2 * 3600000).toISOString(),
    isPinned: true,
    upvotes: 12,
    replies: [
      { id: 'r1', author: 'Bob Smith', avatar: 'https://i.pravatar.cc/40?img=2', content: 'useCallback memoizes a function, useMemo memoizes a value. Use useCallback when passing callbacks to child components that use React.memo.', createdAt: new Date(Date.now() - 1 * 3600000).toISOString(), isInstructor: false },
    ],
  },
  {
    id: 'q2',
    student: 'David Lee',
    avatar: 'https://i.pravatar.cc/40?img=4',
    courseName: 'UI/UX Figma BootCamp',
    title: 'How to create an auto-layout that adapts to content?',
    content: "I'm trying to build a card component in Figma that resizes vertically based on text content. What are the correct auto-layout settings?",
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
    isPinned: false,
    upvotes: 7,
    replies: [],
  },
  {
    id: 'q3',
    student: 'Emma Davis',
    avatar: 'https://i.pravatar.cc/40?img=5',
    courseName: 'Full-Stack Web BootCamp',
    title: 'Getting CORS error when connecting to backend',
    content: 'I set up my Express server and React frontend, but when making API calls I get a CORS error. How do I fix this?',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
    isPinned: false,
    upvotes: 15,
    replies: [],
  },
];

export default function Community() {
  const [questions, setQuestions] = useState<Question[]>(MOCK_QUESTIONS);
  const [search, setSearch] = useState('');
  const [courseFilter, setCourseFilter] = useState('all');
  const [expanded, setExpanded] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<Record<string, string>>({});

  const uniqueCourses = [...new Set(MOCK_QUESTIONS.map(q => q.courseName))];

  const filtered = useMemo(() => {
    return [...questions]
      .sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
      .filter(q => {
        if (search && !q.title.toLowerCase().includes(search.toLowerCase()) && !q.student.toLowerCase().includes(search.toLowerCase())) return false;
        if (courseFilter !== 'all' && q.courseName !== courseFilter) return false;
        return true;
      });
  }, [questions, search, courseFilter]);

  const togglePin = (id: string) => {
    setQuestions(prev => prev.map(q => q.id === id ? { ...q, isPinned: !q.isPinned } : q));
  };

  const submitReply = (questionId: string) => {
    const text = replyText[questionId]?.trim();
    if (!text) return;
    const reply: Reply = {
      id: Date.now().toString(),
      author: 'You (Instructor)',
      avatar: 'https://i.pravatar.cc/40?img=10',
      content: text,
      createdAt: new Date().toISOString(),
      isInstructor: true,
    };
    setQuestions(prev => prev.map(q => q.id === questionId ? { ...q, replies: [...q.replies, reply] } : q));
    setReplyText(prev => ({ ...prev, [questionId]: '' }));
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Q&A Community</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">Answer student questions and keep your community engaged.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Questions', value: questions.length },
          { label: 'Awaiting Reply', value: questions.filter(q => q.replies.length === 0).length },
          { label: 'Pinned', value: questions.filter(q => q.isPinned).length },
        ].map(stat => (
          <Card key={stat.label} className="p-5 border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm text-center">
            <p className="text-2xl font-extrabold text-zinc-900 dark:text-white">{stat.value}</p>
            <p className="text-xs text-zinc-400 mt-1">{stat.label}</p>
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
            placeholder="Search questions..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition"
          />
        </div>
        <select
          value={courseFilter}
          onChange={e => setCourseFilter(e.target.value)}
          className="py-2.5 px-3.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-sm text-zinc-700 dark:text-zinc-300 outline-none focus:border-violet-500"
        >
          <option value="all">All Courses</option>
          {uniqueCourses.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      {/* Questions List */}
      {filtered.length === 0 ? (
        <Card className="border border-dashed border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-2xl p-16 text-center">
          <MessageCircle className="w-10 h-10 text-zinc-300 mx-auto mb-3" />
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">No questions found</p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filtered.map(q => (
            <Card key={q.id} className={`border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-900 rounded-xl shadow-sm transition ${q.isPinned ? 'border-l-4 border-l-violet-500' : ''}`}>
              <div className="p-6">
                <div className="flex items-start gap-4">
                  <img src={q.avatar} alt="" className="w-10 h-10 rounded-full flex-shrink-0 ring-2 ring-white dark:ring-zinc-900" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <h3 className="font-bold text-zinc-900 dark:text-white">{q.title}</h3>
                        <p className="text-xs text-zinc-400 mt-0.5">{q.student} · {q.courseName} · {formatDate(q.createdAt)}</p>
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        {q.isPinned && <Badge variant="neutral" className="text-[10px] rounded px-2 py-0.5 bg-violet-50 dark:bg-violet-950/50 text-violet-600">Pinned</Badge>}
                        {q.replies.length === 0 && <Badge variant="outline" className="text-[10px] rounded px-2 py-0.5">Needs Reply</Badge>}
                        <button onClick={() => togglePin(q.id)} className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-400 hover:text-violet-500 transition" title={q.isPinned ? 'Unpin' : 'Pin'}>
                          {q.isPinned ? <PinOff className="w-4 h-4" /> : <Pin className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">{q.content}</p>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1 text-xs text-zinc-400">
                        <ThumbsUp className="w-3.5 h-3.5" />{q.upvotes} upvotes
                      </div>
                      <div className="flex items-center gap-1 text-xs text-zinc-400">
                        <MessageCircle className="w-3.5 h-3.5" />{q.replies.length} {q.replies.length === 1 ? 'reply' : 'replies'}
                      </div>
                      <button
                        onClick={() => setExpanded(expanded === q.id ? null : q.id)}
                        className="flex items-center gap-1 text-xs text-violet-600 hover:text-violet-700 font-semibold transition"
                      >
                        {expanded === q.id ? 'Collapse' : 'View & Reply'}
                        <ChevronDown className={`w-3.5 h-3.5 transition-transform ${expanded === q.id ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Replies */}
                {expanded === q.id && (
                  <div className="mt-5 ml-14 space-y-4">
                    {q.replies.map(reply => (
                      <div key={reply.id} className={`flex items-start gap-3 p-3 rounded-xl ${reply.isInstructor ? 'bg-violet-50 dark:bg-violet-950/30 border border-violet-100 dark:border-violet-900/50' : 'bg-zinc-50 dark:bg-zinc-900'}`}>
                        <img src={reply.avatar} alt="" className="w-8 h-8 rounded-full flex-shrink-0" />
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <p className="text-xs font-bold text-zinc-900 dark:text-white">{reply.author}</p>
                            {reply.isInstructor && <Badge variant="neutral" className="text-[9px] rounded px-1.5 py-0.5 bg-violet-100 dark:bg-violet-900/40 text-violet-600">Instructor</Badge>}
                            <span className="text-[10px] text-zinc-400">{formatDate(reply.createdAt)}</span>
                          </div>
                          <p className="text-sm text-zinc-700 dark:text-zinc-300">{reply.content}</p>
                        </div>
                      </div>
                    ))}

                    {/* Reply Input */}
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-violet-100 dark:bg-violet-950 flex items-center justify-center text-violet-700 dark:text-violet-400 font-bold text-xs flex-shrink-0">JD</div>
                      <div className="flex-1 flex items-center gap-2">
                        <input
                          value={replyText[q.id] || ''}
                          onChange={e => setReplyText(prev => ({ ...prev, [q.id]: e.target.value }))}
                          onKeyDown={e => { if (e.key === 'Enter') submitReply(q.id); }}
                          placeholder="Write a reply as instructor..."
                          className="flex-1 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm text-zinc-900 dark:text-white placeholder:text-zinc-400 outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10 transition"
                        />
                        <Button size="sm" onClick={() => submitReply(q.id)} className="bg-violet-600 hover:bg-violet-700 text-white rounded-xl px-3 h-9">
                          <Send className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
