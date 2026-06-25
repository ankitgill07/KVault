export interface Lesson {
  id: string;
  title: string;
  duration: string;
  completed?: boolean;
  preview?: boolean;
}

export interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Review {
  id: string;
  name: string;
  avatar: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Course {
  id: string;
  slug: string;
  title: string;
  instructor: string;
  instructorRole: string;
  instructorAvatar: string;
  instructorBio: string;
  instructorSocials: { twitter?: string; github?: string; website?: string };
  category: string;
  rating: number;
  reviewsCount: number;
  duration: string;
  lessonsCount: number;
  price: number;
  originalPrice: number;
  description: string;
  gradient: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  skills: string[];
  requirements: string[];
  whatYouWillLearn: string[];
  lastUpdated: string;
  language: string;
  studentsCount: number;
  chapters: Chapter[];
  reviews: Review[];
  progress?: number;
  lastAccessed?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  iconName: string;
  gradient: string;
  count: number;
}

export const CATEGORIES: Category[] = [
  { id: 'frontend', name: 'Frontend Development', slug: 'frontend-development', iconName: 'Layout', gradient: 'from-[#7C3AED] to-[#6366F1]', count: 12 },
  { id: 'backend', name: 'Backend Development', slug: 'backend-development', iconName: 'Server', gradient: 'from-[#3B82F6] to-[#06B6D4]', count: 8 },
  { id: 'fullstack', name: 'Full Stack', slug: 'full-stack', iconName: 'Cpu', gradient: 'from-[#EC4899] to-[#8B5CF6]', count: 15 },
  { id: 'mobile', name: 'Mobile Development', slug: 'mobile-development', iconName: 'Smartphone', gradient: 'from-[#F59E0B] to-[#EF4444]', count: 6 },
  { id: 'ai-ml', name: 'AI & Machine Learning', slug: 'ai-machine-learning', iconName: 'Brain', gradient: 'from-[#10B981] to-[#3B82F6]', count: 10 },
  { id: 'data-science', name: 'Data Science', slug: 'data-science', iconName: 'BarChart2', gradient: 'from-[#8B5CF6] to-[#EC4899]', count: 7 },
  { id: 'cloud', name: 'Cloud Computing', slug: 'cloud-computing', iconName: 'Cloud', gradient: 'from-[#06B6D4] to-[#3B82F6]', count: 9 },
  { id: 'devops', name: 'DevOps', slug: 'devops', iconName: 'GitBranch', gradient: 'from-[#EF4444] to-[#F59E0B]', count: 8 },
  { id: 'ui-ux', name: 'UI/UX Design', slug: 'ui-ux-design', iconName: 'Palette', gradient: 'from-[#EC4899] to-[#F59E0B]', count: 11 },
  { id: 'security', name: 'Cyber Security', slug: 'cyber-security', iconName: 'ShieldAlert', gradient: 'from-[#111827] to-[#6B7280]', count: 5 }
];

export const COURSES: Course[] = [
  {
    id: 'fe-pro',
    slug: 'advanced-react-architecture',
    title: 'Advanced React Architecture & Design Patterns',
    instructor: 'Sarah Jenkins',
    instructorRole: 'Principal Frontend Engineer',
    instructorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150',
    instructorBio: 'Sarah is an industry-recognized frontend developer who specializes in building massive single page applications and structuring high-performance design systems.',
    instructorSocials: { twitter: 'https://twitter.com/sarahcodes', github: 'https://github.com/sarahjenkins', website: 'https://sarah.dev' },
    category: 'Frontend Development',
    rating: 4.92,
    reviewsCount: 124,
    duration: '22h 45m',
    lessonsCount: 42,
    price: 149,
    originalPrice: 299,
    description: 'Master advanced state management, render optimization, custom hooks architectures, and build enterprise-grade React design systems.',
    gradient: 'linear-gradient(135deg, #7C3AED 0%, #6366F1 100%)',
    difficulty: 'Advanced',
    skills: ['React', 'TypeScript', 'Zustand', 'Design Systems', 'Performance'],
    requirements: [
      'Solid understanding of HTML, CSS, and basic JavaScript',
      'Familiarity with standard React concepts (useState, useEffect, standard props)',
      'A code editor like VS Code installed on your machine'
    ],
    whatYouWillLearn: [
      'Build real project architectures with folder scaling patterns',
      'Master industry concepts like state machines, selectors, and context rules',
      'Create production-grade UI systems with CSS variables and Tailwind',
      'Gain practical experience optimizing render pipelines and measuring web vitals'
    ],
    lastUpdated: 'June 2026',
    language: 'English',
    studentsCount: 1420,
    chapters: [
      {
        id: 'fe-ch-1',
        title: 'Core Architecture and Folder Structures',
        lessons: [
          { id: 'fe-les-1', title: 'Introduction to Enterprise React Design', duration: '12:05', completed: true, preview: true },
          { id: 'fe-les-2', title: 'Monolithic vs. Micro-frontend Layouts', duration: '18:40', completed: true, preview: true },
          { id: 'fe-les-3', title: 'Optimizing Workspace Configurations', duration: '15:20', completed: false }
        ]
      },
      {
        id: 'fe-ch-2',
        title: 'Advanced State Machines and Context',
        lessons: [
          { id: 'fe-les-4', title: 'Re-evaluating React Context Anti-Patterns', duration: '22:15', completed: false },
          { id: 'fe-les-5', title: 'State Orchestration with Zustand', duration: '28:10', completed: false }
        ]
      }
    ],
    reviews: [
      { id: 'rev-1', name: 'Vikram Mehta', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100', rating: 5, comment: 'Absolutely incredible curriculum. The section on Zustand selector optimizations alone saved our production app from constant rendering lags!', date: 'May 12, 2026' },
      { id: 'rev-2', name: 'Emily Watson', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', rating: 4.8, comment: 'Well detailed, very fast-paced, and hits on real-world patterns instead of basic examples.', date: 'June 2, 2026' }
    ],
    progress: 40,
    lastAccessed: 'Monolithic vs. Micro-frontend Layouts'
  },
  {
    id: 'ai-eng',
    slug: 'ai-engineering-llm',
    title: 'AI Engineering: Large Language Models in Practice',
    instructor: 'Dr. Alex Rivera',
    instructorRole: 'AI Research Director',
    instructorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
    instructorBio: 'Dr. Rivera is an AI researcher who has published over 30 academic papers on prompt alignment, transformer fine-tuning, and agentic workflows.',
    instructorSocials: { twitter: 'https://twitter.com/dr_rivera', github: 'https://github.com/alexrivera' },
    category: 'AI & Machine Learning',
    rating: 4.85,
    reviewsCount: 88,
    duration: '18h 15m',
    lessonsCount: 30,
    price: 199,
    originalPrice: 399,
    description: 'Learn to build agentic pipelines, implement RAG (Retrieval-Augmented Generation), fine-tune models, and deploy production AI services.',
    gradient: 'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)',
    difficulty: 'Intermediate',
    skills: ['Python', 'OpenAI API', 'LangChain', 'VectorDBs', 'Prompt Engineering'],
    requirements: [
      'Basic intermediate competency in Python scripting',
      'An OpenAI developer key or equivalent LLM endpoint access',
      'Basic understanding of APIs and JSON processing'
    ],
    whatYouWillLearn: [
      'Master prompt engineering structures and custom parameters rules',
      'Implement Vector databases (Pinecone, Chroma) for contextual indexing',
      'Build agentic pipeline graphs with automatic self-correction',
      'Deploy models as API endpoints using FastAPI and container structures'
    ],
    lastUpdated: 'May 2026',
    language: 'English',
    studentsCount: 840,
    chapters: [
      {
        id: 'ai-ch-1',
        title: 'Foundations of Agentic Systems',
        lessons: [
          { id: 'ai-les-1', title: 'Welcome to AI Engineering', duration: '10:15', completed: true, preview: true },
          { id: 'ai-les-2', title: 'Building your first LangChain Agent', duration: '25:40', completed: false },
          { id: 'ai-les-3', title: 'Understanding Vector Embeddings', duration: '19:50', completed: false }
        ]
      }
    ],
    reviews: [
      { id: 'rev-3', name: 'Aaron Paul', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100', rating: 5, comment: 'Dr. Rivera teaches AI engineering from first principles. Highly practical setups and Vector db integrations.', date: 'June 10, 2026' }
    ],
    progress: 33,
    lastAccessed: 'Welcome to AI Engineering'
  },
  {
    id: 'fs-stripe',
    slug: 'stripe-saas-integration',
    title: 'Stripe-Grade SaaS Integration & System Design',
    instructor: 'Marc Veras',
    instructorRole: 'SaaS Consultant & Ex-Stripe Developer',
    instructorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
    instructorBio: 'Marc spent 4 years building infrastructure billing systems at Stripe. He now consults SaaS start-ups on system designs and ledger strategies.',
    instructorSocials: { github: 'https://github.com/mveras', website: 'https://verasbilling.io' },
    category: 'Full Stack',
    rating: 4.95,
    reviewsCount: 215,
    duration: '31h 10m',
    lessonsCount: 64,
    price: 249,
    originalPrice: 499,
    description: 'Deconstruct Stripe architecture. Build bulletproof billing engines, idempotent APIs, database replication, and webhooks architectures.',
    gradient: 'linear-gradient(135deg, #EC4899 0%, #8B5CF6 100%)',
    difficulty: 'Advanced',
    skills: ['Node.js', 'PostgreSQL', 'Stripe', 'Redis', 'System Design'],
    requirements: [
      'Strong Node.js core coding knowledge',
      'Familiarity with SQL database querying principles',
      'Knowledge of standard REST APIs and express endpoints'
    ],
    whatYouWillLearn: [
      'Deconstruct real Stripe architecture principles (idempotency, log ledgers)',
      'Design reliable database models for billing cycles and active limits',
      'Secure webhooks queues with redis and background validation jobs',
      'Build customer subscription portals with React hooks and Stripe API'
    ],
    lastUpdated: 'April 2026',
    language: 'English',
    studentsCount: 3100,
    chapters: [
      {
        id: 'fs-ch-1',
        title: 'Designing Robust Billing Pipelines',
        lessons: [
          { id: 'fs-les-1', title: 'Introduction to SaaS Scaling Mechanics', duration: '14:32', completed: true, preview: true },
          { id: 'fs-les-2', title: 'Designing Subscription Database Models', duration: '32:10', completed: true, preview: false },
          { id: 'fs-les-3', title: 'Handling Webhooks Idempotency Like a Pro', duration: '28:45', completed: true, preview: false }
        ]
      },
      {
        id: 'fs-ch-2',
        title: 'Distributed Systems & Ledger Auditing',
        lessons: [
          { id: 'fs-les-4', title: 'Double-entry Bookkeeping for SaaS Databases', duration: '24:50', completed: false },
          { id: 'fs-les-5', title: 'Designing Fault-Tolerant Webhook Receivers', duration: '30:15', completed: false }
        ]
      }
    ],
    reviews: [
      { id: 'rev-4', name: 'Jason Bateman', avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100', rating: 5, comment: 'Simply the best SaaS architectural course available online. The webhooks reliability blueprint alone is worth ten times the price.', date: 'May 1, 2026' }
    ],
    progress: 60,
    lastAccessed: 'Handling Webhooks Idempotency Like a Pro'
  },
  {
    id: 'ui-design',
    slug: 'visual-design-apple',
    title: 'Visual Design Mastery: Apple-Level Aesthetics',
    instructor: 'Elena Rostova',
    instructorRole: 'Senior Product Designer',
    instructorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
    instructorBio: 'Elena is a digital product designer famous for her high-end templates and minimal mobile UI layouts, influenced by Apple and Stripe design models.',
    instructorSocials: { twitter: 'https://twitter.com/elenadesigns', website: 'https://elena.co' },
    category: 'UI/UX Design',
    rating: 4.92,
    reviewsCount: 154,
    duration: '14h 20m',
    lessonsCount: 25,
    price: 99,
    originalPrice: 199,
    description: 'Learn the secrets of typography, spacing, whitespace, glassmorphism, dynamic grids, and interactions that feel Apple-level premium.',
    gradient: 'linear-gradient(135deg, #EC4899 0%, #F59E0B 100%)',
    difficulty: 'Beginner',
    skills: ['Figma', 'Visual Hierarchy', 'Typography', 'Prototyping', 'UI Motion'],
    requirements: [
      'A free Figma account and a web browser',
      'No background design skills are required'
    ],
    whatYouWillLearn: [
      'Master typographic grids and spacing systems (Comfortable padding, visual rhythm)',
      'Build glassmorphism UI layouts with rich shadows and gradients',
      'Integrate micro-animations that make digital interfaces feel responsive',
      'Design comprehensive responsive desktop panels and mobile structures'
    ],
    lastUpdated: 'June 2026',
    language: 'English',
    studentsCount: 2010,
    chapters: [
      {
        id: 'ui-ch-1',
        title: 'The Principles of Spatial Design',
        lessons: [
          { id: 'ui-les-1', title: 'Understanding White Space & Breathing Room', duration: '15:10', completed: false, preview: true },
          { id: 'ui-les-2', title: 'Typography Hierarchies for SaaS Panels', duration: '21:05', completed: false, preview: true }
        ]
      }
    ],
    reviews: [
      { id: 'rev-5', name: 'Laura Miller', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100', rating: 4.9, comment: 'Elena teaches visual balance in a way that is incredibly intuitive. My layout designs immediately improved.', date: 'June 18, 2026' }
    ]
  },
  {
    id: 'cloud-kube',
    slug: 'high-availability-kubernetes',
    title: 'Cloud Orchestration: High-Availability Kubernetes',
    instructor: 'Vikram Mehta',
    instructorRole: 'DevOps Architect',
    instructorAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150',
    instructorBio: 'Vikram is a Cloud Solutions engineer managing over 400 micro-service pods across AWS clusters. He holds 3 Kubernetes certifications.',
    instructorSocials: { github: 'https://github.com/vmehta', twitter: 'https://twitter.com/vmehta_cloud' },
    category: 'Cloud Computing',
    rating: 4.78,
    reviewsCount: 64,
    duration: '28h 50m',
    lessonsCount: 50,
    price: 189,
    originalPrice: 349,
    description: 'Configure raw Kubernetes clusters on cloud infrastructure, build custom operators, deploy service meshes, and establish GitOps workflows.',
    gradient: 'linear-gradient(135deg, #06B6D4 0%, #3B82F6 100%)',
    difficulty: 'Advanced',
    skills: ['Kubernetes', 'AWS', 'Docker', 'Terraform', 'ArgoCD'],
    requirements: [
      'Solid command of terminal shell scripts and basic Linux commands',
      'An active AWS developer account (Free tier is applicable)',
      'Basic understanding of containers and docker structures'
    ],
    whatYouWillLearn: [
      'Set up High-Availability clusters using Terraform templates',
      'Orchestrate pods, configurations, secrets, and local volumes',
      'Establish automatic deployments using ArgoCD and GitOps workflows',
      'Debug live cluster logs, traffic balances, and pod node scaling'
    ],
    lastUpdated: 'March 2026',
    language: 'English',
    studentsCount: 710,
    chapters: [
      {
        id: 'cloud-ch-1',
        title: 'Bare-Metal & Managed Orchestrations',
        lessons: [
          { id: 'cloud-les-1', title: 'Intro to High-Availability Topology', duration: '18:12', completed: false, preview: true },
          { id: 'cloud-les-2', title: 'Setting Up EKS Clusters with Terraform', duration: '27:44', completed: false }
        ]
      }
    ],
    reviews: [
      { id: 'rev-6', name: 'Bruce Wayne', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100', rating: 4.8, comment: 'Vikram explains Kubernetes clustering concepts in a highly professional, direct manner. Very helpful diagrams.', date: 'May 20, 2026' }
    ]
  },
  {
    id: 'cyber-sec',
    slug: 'zero-trust-saas',
    title: 'Zero Trust Architectures for Modern SaaS',
    instructor: 'Christian Black',
    instructorRole: 'Cybersecurity Advisor',
    instructorAvatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150',
    instructorBio: 'Christian is an independent security audit specialist who reviews identity systems and authentication strategies for global financial tech enterprises.',
    instructorSocials: { website: 'https://blacksecurity.io' },
    category: 'Cyber Security',
    rating: 4.88,
    reviewsCount: 42,
    duration: '16h 30m',
    lessonsCount: 28,
    price: 159,
    originalPrice: 299,
    description: 'Implement secure identity management, token-based APIs, network segmentations, encryption at rest/in transit, and vulnerability scanning.',
    gradient: 'linear-gradient(135deg, #111827 0%, #6B7280 100%)',
    difficulty: 'Intermediate',
    skills: ['OAuth2', 'OIDC', 'JSON Web Tokens', 'Network Isolation', 'Penetration Testing'],
    requirements: [
      'Basic intermediate understanding of web backend architectures',
      'Knowledge of OAuth or OIDC flows is recommended but not mandatory'
    ],
    whatYouWillLearn: [
      'Implement identity pipelines secure against session hijack risks',
      'Design role hierarchies and token-level authorization grids',
      'Encrypt database fields and secure transits between servers',
      'Conduct automated vulnerability scans and pen testing tasks'
    ],
    lastUpdated: 'April 2026',
    language: 'English',
    studentsCount: 450,
    chapters: [
      {
        id: 'sec-ch-1',
        title: 'Authentication Infrastructure',
        lessons: [
          { id: 'sec-les-1', title: 'The Anatomy of Zero-Trust Security', duration: '12:40', completed: false, preview: true },
          { id: 'sec-les-2', title: 'OAuth Flow and Identity Providers Integration', duration: '24:15', completed: false }
        ]
      }
    ],
    reviews: [
      { id: 'rev-7', name: 'Diana Prince', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100', rating: 5, comment: 'Excellent security outlines. Essential knowledge if you are designing SaaS systems handling sensitive customer transaction records.', date: 'May 30, 2026' }
    ]
  }
];

export interface LearningPath {
  id: string;
  title: string;
  duration: string;
  coursesCount: number;
  skills: string[];
  gradient: string;
  roadmap: string[];
}

export const LEARNING_PATHS: LearningPath[] = [
  {
    id: 'path-fe',
    title: 'Frontend Engineer',
    duration: '4-6 Months',
    coursesCount: 5,
    skills: ['React', 'TypeScript', 'Tailwind', 'Next.js', 'Web Perf'],
    gradient: 'from-[#7C3AED] to-[#6366F1]',
    roadmap: ['Web Fundamentals', 'Advanced React', 'Design Systems', 'Performance Optimization']
  },
  {
    id: 'path-fs',
    title: 'Full Stack Developer',
    duration: '6-8 Months',
    coursesCount: 8,
    skills: ['React', 'Node.js', 'PostgreSQL', 'System Design', 'Redis'],
    gradient: 'from-[#EC4899] to-[#8B5CF6]',
    roadmap: ['Database Architectures', 'REST & GraphQL APIs', 'Caching Layers', 'SaaS Scaling Patterns']
  },
  {
    id: 'path-ai',
    title: 'AI Engineer',
    duration: '3-5 Months',
    coursesCount: 4,
    skills: ['Python', 'LLM Architectures', 'LangChain', 'VectorDBs'],
    gradient: 'from-[#10B981] to-[#3B82F6]',
    roadmap: ['Python Basics', 'Model Integration APIs', 'Retrieval-Augmented Systems', 'Autonomous Agents']
  },
  {
    id: 'path-ui',
    title: 'UI/UX Designer',
    duration: '3-4 Months',
    coursesCount: 4,
    skills: ['Figma', 'Design Systems', 'UX Research', 'Visual Aesthetics'],
    gradient: 'from-[#EC4899] to-[#F59E0B]',
    roadmap: ['Layout & Grids', 'Typography Mastery', 'Micro-interactions', 'Apple Spatial Design Guide']
  },
  {
    id: 'path-cloud',
    title: 'Cloud Engineer',
    duration: '5-7 Months',
    coursesCount: 6,
    skills: ['AWS', 'Kubernetes', 'Docker', 'Terraform', 'GitOps'],
    gradient: 'from-[#06B6D4] to-[#3B82F6]',
    roadmap: ['Linux & Docker fundamentals', 'Infrastructure-as-Code', 'K8s Clusters Orchestration', 'CI/CD Pipelines']
  }
];
