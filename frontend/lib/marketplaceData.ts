export interface Ustaad {
  id: string;
  name: string;
  initials: string;
  avatarGradient: string;
  title: string;
  level: "Top Rated Ustaad" | "Level 2 Ustaad" | "Rising Star";
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  city: string;
  mode: "Online" | "In-Person" | "Both";
  verified: boolean;
  matchPercent: number;
  education: string;
  languages: string[];
  bio: string;
  responseTime: string;
  completionRate: string;
  joinedYear: number;
  totalStudents: number;
  totalSessions: number;
}

export interface GigPackage {
  name: "Basic" | "Standard" | "Premium";
  title: string;
  description: string;
  price: number;
  durationMinutes: number;
  sessionsCount: number;
  deliveryDays: number;
  features: string[];
}

export interface GigReview {
  id: string;
  studentName: string;
  studentCity: string;
  studentInitials: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Gig {
  id: string;
  slug: string;
  title: string;
  category: "STEM" | "Programming" | "Languages" | "Test Prep" | "Commerce & Business" | "Arts & Humanities";
  subject: string;
  ustaadId: string;
  ustaad: Ustaad;
  coverGradient: string;
  badge?: string;
  startingPrice: number;
  matchPercent: number;
  overview: string;
  learningOutcomes: string[];
  syllabus: { title: string; detail: string }[];
  prerequisites: string[];
  packages: {
    basic: GigPackage;
    standard: GigPackage;
    premium: GigPackage;
  };
  faqs: { question: string; answer: string }[];
  reviews: GigReview[];
}

export const USTAADS: Record<string, Ustaad> = {
  "ustaad-1": {
    id: "ustaad-1",
    name: "Dr. Ahmed Khan",
    initials: "AK",
    avatarGradient: "from-[#14213D] to-[#1E3A8A]",
    title: "Senior Cambridge O/A-Level Mathematics & Physics Specialist",
    level: "Top Rated Ustaad",
    rating: 4.96,
    reviewCount: 148,
    hourlyRate: 2000,
    city: "Lahore",
    mode: "Both",
    verified: true,
    matchPercent: 97,
    education: "Ph.D. in Applied Physics (LUMS) · Ex-Aitchison College Faculty",
    languages: ["English (Fluent)", "Urdu (Native)", "Punjabi"],
    bio: "Passionate educator with 12+ years of specialized experience helping O/A Level students score A* grades in Cambridge & Edexcel. I combine graphical intuitions, real past paper dissecting, and concept diagnostics to ensure no topic remains confusing.",
    responseTime: "Under 1 hour",
    completionRate: "99.4%",
    joinedYear: 2022,
    totalStudents: 380,
    totalSessions: 2150,
  },
  "ustaad-2": {
    id: "ustaad-2",
    name: "Sara Ahmed",
    initials: "SA",
    avatarGradient: "from-[#B5651D] to-[#D97706]",
    title: "Certified IELTS Master Coach (Band 8.5) & Corporate English Trainer",
    level: "Top Rated Ustaad",
    rating: 4.94,
    reviewCount: 112,
    hourlyRate: 1800,
    city: "Karachi",
    mode: "Online",
    verified: true,
    matchPercent: 95,
    education: "M.A. English Literature & CELTA Certified (British Council Partner)",
    languages: ["English (Bilingual)", "Urdu (Native)"],
    bio: "Over 8 years helping students, doctors, and professionals clear IELTS Academic and General Training with Bands 7.5 to 8.5. My methodology targets examiner rubric criteria: lexical resource, task achievement, fluency, and grammatical accuracy.",
    responseTime: "30 minutes",
    completionRate: "100%",
    joinedYear: 2023,
    totalStudents: 290,
    totalSessions: 1420,
  },
  "ustaad-3": {
    id: "ustaad-3",
    name: "Hamza Malik",
    initials: "HM",
    avatarGradient: "from-[#3A5A40] to-[#10B981]",
    title: "Full-Stack Software Engineer & Python / Web Development Mentor",
    level: "Level 2 Ustaad",
    rating: 4.91,
    reviewCount: 84,
    hourlyRate: 2500,
    city: "Islamabad",
    mode: "Both",
    verified: true,
    matchPercent: 94,
    education: "B.S. Computer Science (FAST NUCES) · Senior Engineer at Silicon Valley Startup",
    languages: ["English (Fluent)", "Urdu (Native)"],
    bio: "Software architect with 7 years of real-world production experience. I don't just teach code syntax; I teach problem-solving, clean architecture, Git, Next.js, FastAPI, and data structures to help learners land international remote tech jobs.",
    responseTime: "Under 2 hours",
    completionRate: "98.7%",
    joinedYear: 2023,
    totalStudents: 165,
    totalSessions: 890,
  },
  "ustaad-4": {
    id: "ustaad-4",
    name: "Zainab Fatima",
    initials: "ZF",
    avatarGradient: "from-[#6366F1] to-[#8B5CF6]",
    title: "Pre-Medical MDCAT & F.Sc Biology Specialist",
    level: "Top Rated Ustaad",
    rating: 4.98,
    reviewCount: 165,
    hourlyRate: 1600,
    city: "Lahore",
    mode: "Online",
    verified: true,
    matchPercent: 98,
    education: "M.B.B.S (King Edward Medical University) · MDCAT Top 50 Position Holder",
    languages: ["English (Fluent)", "Urdu (Native)"],
    bio: "Doctor and veteran MDCAT educator. Having secured top ranks myself, I teach high-yield mnemonics, quick MCQ elimination tactics, and deep conceptual clarity in Human Physiology, Genetics, and Biochemistry.",
    responseTime: "1 hour",
    completionRate: "99.1%",
    joinedYear: 2022,
    totalStudents: 410,
    totalSessions: 2600,
  },
  "ustaad-5": {
    id: "ustaad-5",
    name: "Bilal Tariq",
    initials: "BT",
    avatarGradient: "from-[#0284C7] to-[#2563EB]",
    title: "ACCA Member & Cambridge Accounting / Economics Lecturer",
    level: "Level 2 Ustaad",
    rating: 4.88,
    reviewCount: 62,
    hourlyRate: 1500,
    city: "Karachi",
    mode: "Both",
    verified: true,
    matchPercent: 91,
    education: "ACCA Affiliate · B.Sc Applied Accounting (Oxford Brookes)",
    languages: ["English (Fluent)", "Urdu (Native)"],
    bio: "Chartered accountant teaching financial accounting, managerial cost accounting, and macroeconomics. Making balance sheets, double-entry systems, and financial ratios crystal clear through real case studies from the Pakistan Stock Exchange.",
    responseTime: "Under 3 hours",
    completionRate: "97.5%",
    joinedYear: 2023,
    totalStudents: 130,
    totalSessions: 610,
  },
  "ustaad-6": {
    id: "ustaad-6",
    name: "Qari Usman Al-Azhari",
    initials: "QU",
    avatarGradient: "from-[#0F766E] to-[#14B8A6]",
    title: "Certified Tajweed & Classical Arabic Instructor (Al-Azhar Certified)",
    level: "Rising Star",
    rating: 5.0,
    reviewCount: 47,
    hourlyRate: 1200,
    city: "Islamabad",
    mode: "Online",
    verified: true,
    matchPercent: 96,
    education: "Degree in Quranic Sciences (Al-Azhar University, Cairo) · Ijazah Holder",
    languages: ["Arabic (Native-level)", "Urdu (Native)", "English"],
    bio: "Learn correct Makharij, Tajweed rules, and foundational Quranic Arabic with patience and structured vocal exercises. Suitable for beginners, children, and advanced memorizers (Hifz revision).",
    responseTime: "Under 1 hour",
    completionRate: "100%",
    joinedYear: 2024,
    totalStudents: 95,
    totalSessions: 520,
  },
};

export const GIGS: Gig[] = [
  {
    id: "gig-1",
    slug: "cambridge-o-level-physics-crash-course",
    title: "I will master Cambridge O/A-Level Physics with Past Papers & Problem Solving",
    category: "STEM",
    subject: "Physics",
    ustaadId: "ustaad-1",
    ustaad: USTAADS["ustaad-1"],
    coverGradient: "from-[#14213D] via-[#1E293B] to-[#3B82F6]",
    badge: "Bestseller",
    startingPrice: 2000,
    matchPercent: 97,
    overview:
      "Struggling with Kinematics, Electromagnetism, or Space Physics? Join this intensive, exam-focused tutoring package designed specifically for Cambridge (CIE) 5054 & 9702 syllabus. We break down the most difficult Paper 1 & Paper 2 past questions and build rock-solid conceptual intuitions.",
    learningOutcomes: [
      "Deep conceptual mastery of Cambridge O/A-Level Physics syllabus",
      "Examiner-approved answering techniques for 4-mark and 6-mark questions",
      "Paper 1 MCQ elimination tricks that save 15+ minutes",
      "Custom formula sheet, revision notes, and marked past paper feedback",
    ],
    syllabus: [
      {
        title: "Module 1: General & Thermal Physics",
        detail: "Forces, dynamics, kinematics graphs, moments, thermal capacities and kinetic particle model.",
      },
      {
        title: "Module 2: Waves, Light & Sound",
        detail: "Wave properties, refraction index, ray diagrams, electromagnetic spectrum, and ultrasound.",
      },
      {
        title: "Module 3: Electricity & Electromagnetism",
        detail: "Ohm's law, potential dividers, Fleming's rules, induction, transformers, and logic gates.",
      },
      {
        title: "Module 4: Nuclear, Space & Past Papers",
        detail: "Radioactivity decay equations, half-life graphs, stellar evolution, and 5 years CIE past papers.",
      },
    ],
    prerequisites: [
      "O-Level / IGCSE or A-Level student enrolled or preparing for exams",
      "Notebook and scientific calculator ready for class",
    ],
    packages: {
      basic: {
        name: "Basic",
        title: "Concept Diagnostic & 1 Topic Focus",
        description: "One 60-minute intensive 1-on-1 session covering any single difficult topic with curated past paper questions.",
        price: 2000,
        durationMinutes: 60,
        sessionsCount: 1,
        deliveryDays: 1,
        features: [
          "1-on-1 live session (60 mins)",
          "PDF class notes & formulas",
          "Topical past papers worksheet",
          "Session recording",
        ],
      },
      standard: {
        name: "Standard",
        title: "Unit Mastery Bundle (4 Sessions)",
        description: "Four 60-minute sessions covering an entire syllabus unit (e.g. Electromagnetism or Mechanics) with homework review.",
        price: 7500,
        durationMinutes: 240,
        sessionsCount: 4,
        deliveryDays: 14,
        features: [
          "4 live 1-on-1 sessions (60 mins each)",
          "Comprehensive unit formula pack",
          "Homework check & individual feedback",
          "Dedicated WhatsApp Q&A support",
          "Session recordings included",
        ],
      },
      premium: {
        name: "Premium",
        title: "Complete Exam Sprint (10 Sessions + Mocks)",
        description: "Ten 60-minute sessions covering all high-weightage topics + 2 full graded mock exams with examiner rubrics.",
        price: 18000,
        durationMinutes: 600,
        sessionsCount: 10,
        deliveryDays: 30,
        features: [
          "10 intensive 1-on-1 live classes",
          "Complete O/A-Level summary notes",
          "2 Full Mock Exams (Paper 1 & Paper 2) graded",
          "Unlimited 24/7 WhatsApp voice note Q&A",
          "Personalized performance tracking sheet",
        ],
      },
    },
    faqs: [
      {
        question: "How do the online classes take place?",
        answer: "Classes are conducted via Zoom or Google Meet with a digital drawing tablet and interactive virtual whiteboard so you can see live derivations and diagrams.",
      },
      {
        question: "Can I choose between physical or online?",
        answer: "Yes, Dr. Ahmed offers in-person tutoring in DHA/Gulberg Lahore and online sessions for students all across Pakistan and the Gulf.",
      },
      {
        question: "What if I need to reschedule?",
        answer: "Rescheduling is free if requested at least 6 hours before the scheduled lesson.",
      },
    ],
    reviews: [
      {
        id: "rev-1",
        studentName: "Hamza R.",
        studentCity: "Lahore",
        studentInitials: "HR",
        rating: 5,
        date: "2 weeks ago",
        comment: "Dr. Ahmed turned around my Physics grade from a C to an A* in mock exams. His explanation of electromagnetic induction and potential dividers is unmatched.",
      },
      {
        id: "rev-2",
        studentName: "Ayesha N.",
        studentCity: "Karachi",
        studentInitials: "AN",
        rating: 5,
        date: "1 month ago",
        comment: "Extremely patient and structured. He pinpointed exactly where I was losing marks in Paper 2 explanation questions. Highly recommended!",
      },
    ],
  },
  {
    id: "gig-2",
    slug: "ielts-band-8-masterclass-speaking-writing",
    title: "I will coach you for IELTS Band 8+ with Intensive Speaking & Essay Correction",
    category: "Languages",
    subject: "IELTS & English",
    ustaadId: "ustaad-2",
    ustaad: USTAADS["ustaad-2"],
    coverGradient: "from-[#B5651D] via-[#92400E] to-[#F59E0B]",
    badge: "Top Rated",
    startingPrice: 1800,
    matchPercent: 95,
    overview:
      "Aiming for Canadian PR, UK PLAB, or scholarships requiring Band 7.5 to 8.5? Get direct coaching from a British Council certified IELTS trainer. Get real-time speaking simulation with immediate feedback and line-by-line Task 1 & Task 2 writing assessments.",
    learningOutcomes: [
      "Master IELTS Writing Task 2 structure to consistently hit Band 8+",
      "Eliminate hesitations and filler words in IELTS Speaking Part 1, 2, and 3",
      "Learn high-yield academic collocations and complex sentence patterns",
      "Accurate assessment using official British Council & IDP rubrics",
    ],
    syllabus: [
      {
        title: "Session 1: Writing Task 2 Mastery",
        detail: "Thesis statements, paragraph coherence, counter-arguments, and topic-specific vocabulary.",
      },
      {
        title: "Session 2: Speaking Fluency & Confidence",
        detail: "Mock interview with voice recording analysis, lexical range evaluation, and pronunciation tips.",
      },
      {
        title: "Session 3: Writing Task 1 Data Analytics",
        detail: "Line graphs, bar charts, process diagrams, maps, and overview drafting for 9-band scores.",
      },
      {
        title: "Session 4: Listening & Reading Speed Hacks",
        detail: "Skimming, scanning, keyword paraphrasing, and tackling True/False/Not Given traps.",
      },
    ],
    prerequisites: ["Basic conversational English fluency (Intermediate level or above)"],
    packages: {
      basic: {
        name: "Basic",
        title: "1 Mock Speaking Interview + 1 Essay Evaluation",
        description: "One 45-minute live speaking test simulation + detailed written feedback on one Task 2 essay.",
        price: 1800,
        durationMinutes: 45,
        sessionsCount: 1,
        deliveryDays: 1,
        features: [
          "1 Live Mock Speaking test (Part 1, 2, 3)",
          "1 Writing Task 2 line-by-line correction",
          "Estimated band score calculation",
          "Actionable error checklist",
        ],
      },
      standard: {
        name: "Standard",
        title: "Complete 4-Session IELTS Booster",
        description: "Four 60-minute sessions focused on Writing and Speaking + 4 essays graded with corrections.",
        price: 6500,
        durationMinutes: 240,
        sessionsCount: 4,
        deliveryDays: 10,
        features: [
          "4 Live 60-minute classes",
          "4 Essays evaluated line-by-line",
          "Band 8+ Collocations & Vocabulary PDF",
          "Audio recordings of speaking drills",
          "WhatsApp voice note drills",
        ],
      },
      premium: {
        name: "Premium",
        title: "Comprehensive Band 8.5 Masterclass (8 Sessions)",
        description: "Full preparation covering all 4 modules (Listening, Reading, Writing, Speaking) with 8 essays and 3 full mocks.",
        price: 13000,
        durationMinutes: 480,
        sessionsCount: 8,
        deliveryDays: 25,
        features: [
          "8 live 1-on-1 training sessions",
          "8 Essays graded with model band 9 answers",
          "3 Full mock exams with predicted band",
          "Cambridge IELTS 14-19 answer explanations",
          "24/7 direct mentor access until test day",
        ],
      },
    },
    faqs: [
      {
        question: "Is this suitable for both Academic and General Training?",
        answer: "Yes, both formats are comprehensively supported, tailored to your immigration or study visa requirements.",
      },
      {
        question: "How fast will my essays be corrected?",
        answer: "Essays are returned with detailed track-changes and band score breakdowns within 24 hours.",
      },
    ],
    reviews: [
      {
        id: "rev-3",
        studentName: "Dr. Usman S.",
        studentCity: "Islamabad",
        studentInitials: "US",
        rating: 5,
        date: "3 weeks ago",
        comment: "I needed a 7.5 in each section for GMC registration. Sara Madam's writing feedback was the exact game-changer. Scored an overall 8.5!",
      },
    ],
  },
  {
    id: "gig-3",
    slug: "modern-full-stack-python-react-mentorship",
    title: "I will mentor you in Modern Full-Stack Python, FastAPI & React from Scratch",
    category: "Programming",
    subject: "Python & React",
    ustaadId: "ustaad-3",
    ustaad: USTAADS["ustaad-3"],
    coverGradient: "from-[#3A5A40] via-[#065F46] to-[#10B981]",
    badge: "Hot & New",
    startingPrice: 2500,
    matchPercent: 94,
    overview:
      "Tired of tutorial hell? Build real, portfolio-grade web applications with a senior software engineer. We cover modern Python 3.12, asynchronous programming, FastAPI REST APIs, PostgreSQL, React/Next.js, Tailwind CSS, and cloud deployment.",
    learningOutcomes: [
      "Build and deploy full-stack production-ready web apps from scratch",
      "Master async Python, Pydantic schemas, and SQLAlchemy ORM",
      "Build modern React frontends with TypeScript, Tailwind CSS, and state management",
      "Learn industry Git workflows, API authentication (JWT), and Docker",
    ],
    syllabus: [
      {
        title: "Week 1: Modern Python & Backend Architecture",
        detail: "Type hints, OOP, dataclasses, FastAPI setup, and Pydantic validation.",
      },
      {
        title: "Week 2: Database Systems & ORMs",
        detail: "PostgreSQL schema design, migrations with Alembic, indexes, and queries.",
      },
      {
        title: "Week 3: Next.js 14 & React Fundamentals",
        detail: "Server components, client components, API routes, and Tailwind styling.",
      },
      {
        title: "Week 4: Authentication, Security & Deployment",
        detail: "JWT tokens, password hashing, Docker containerization, and AWS/Render hosting.",
      },
    ],
    prerequisites: ["A laptop with internet connection", "Enthusiasm to code; no prior degree required"],
    packages: {
      basic: {
        name: "Basic",
        title: "Code Review & 1-on-1 Debugging Session",
        description: "One 60-minute live screen-share session to fix bugs, review your architecture, or learn any key topic.",
        price: 2500,
        durationMinutes: 60,
        sessionsCount: 1,
        deliveryDays: 1,
        features: [
          "60 mins live coding & screen share",
          "Architecture and security review",
          "GitHub Pull Request review",
          "Session recording",
        ],
      },
      standard: {
        name: "Standard",
        title: "4-Session Project Accelerator",
        description: "Four 75-minute sessions building an end-to-end full-stack project (FastAPI + Next.js).",
        price: 9000,
        durationMinutes: 300,
        sessionsCount: 4,
        deliveryDays: 14,
        features: [
          "4 sessions (75 mins each)",
          "Step-by-step codebase walkthrough",
          "Git repository starter templates",
          "Direct code reviews on GitHub",
          "Slack/Discord channel support",
        ],
      },
      premium: {
        name: "Premium",
        title: "Full-Stack Career Mentorship (8 Sessions + Portfolio)",
        description: "Comprehensive 8-week mentorship including a production SaaS project, resume review, and mock technical interview.",
        price: 17500,
        durationMinutes: 600,
        sessionsCount: 8,
        deliveryDays: 30,
        features: [
          "8 intensive 75-min sessions",
          "Complete SaaS project deployed to production",
          "Mock technical coding interview",
          "CV / LinkedIn review for remote tech jobs",
          "Lifelong access to starter templates",
        ],
      },
    },
    faqs: [
      {
        question: "Is this suitable for absolute beginners?",
        answer: "Yes! We start with foundational Python concepts and quickly progress to real projects.",
      },
      {
        question: "Do you help with job placements?",
        answer: "I provide resume tailoring, LinkedIn optimization, and mock technical interview prep for remote and local software companies.",
      },
    ],
    reviews: [
      {
        id: "rev-4",
        studentName: "Ali Raza",
        studentCity: "Rawalpindi",
        studentInitials: "AR",
        rating: 5,
        date: "3 weeks ago",
        comment: "Hamza bhai is the real deal. In just 4 sessions, we built an entire authentication system with FastAPI and Next.js. Clear, practical, zero fluff.",
      },
    ],
  },
  {
    id: "gig-4",
    slug: "mdcat-biology-conceptual-mastery",
    title: "I will prepare you for MDCAT Biology with High-Yield Mnemonics & Past Papers",
    category: "Test Prep",
    subject: "Biology & MDCAT",
    ustaadId: "ustaad-4",
    ustaad: USTAADS["ustaad-4"],
    coverGradient: "from-[#6366F1] via-[#4F46E5] to-[#8B5CF6]",
    badge: "Top Rated",
    startingPrice: 1600,
    matchPercent: 98,
    overview:
      "MDCAT Biology carries the highest weightage in the exam. Learn from a King Edward Medical University doctor who scored in the top 50. Master high-yield topics, cell biology, genetics, and nervous coordination with proven visual mnemonics and rapid MCQ drills.",
    learningOutcomes: [
      "Master PMDC syllabus with zero conceptual blindspots",
      "Solve 200+ tricky past paper MCQs with 95%+ accuracy",
      "Retain complex terminology using proprietary visual mnemonics",
      "Learn time-management strategies to complete Biology in 35 minutes",
    ],
    syllabus: [
      {
        title: "Unit 1: Cell Biology & Biomolecules",
        detail: "Enzyme kinetics, carbohydrates, proteins, nucleic acids, and cell organelles.",
      },
      {
        title: "Unit 2: Human Physiology & Coordination",
        detail: "Nervous coordination, endocrine glands, cardiac cycle, and digestion mechanisms.",
      },
      {
        title: "Unit 3: Genetics & Evolution",
        detail: "Mendelian genetics, sex linkage, DNA replication, and evolutionary theories.",
      },
    ],
    prerequisites: ["F.Sc Pre-Medical or A-Level Biology students aiming for Medical Colleges"],
    packages: {
      basic: {
        name: "Basic",
        title: "High-Yield Chapter Deep-Dive (60 mins)",
        description: "1-on-1 session covering any single complex chapter with 50 high-yield MCQs.",
        price: 1600,
        durationMinutes: 60,
        sessionsCount: 1,
        deliveryDays: 1,
        features: ["60 mins live class", "50 Chapter MCQs with explanations", "High-yield PDF notes"],
      },
      standard: {
        name: "Standard",
        title: "5-Session High-Weightage Pack",
        description: "Five comprehensive sessions covering the top 5 highest-weightage PMDC chapters.",
        price: 7000,
        durationMinutes: 300,
        sessionsCount: 5,
        deliveryDays: 15,
        features: [
          "5 live sessions (60 mins each)",
          "250+ Curated MDCAT questions",
          "Mnemonics cheat sheets",
          "WhatsApp voice query support",
        ],
      },
      premium: {
        name: "Premium",
        title: "Complete MDCAT Biology Crash Pack (12 Sessions)",
        description: "Complete syllabus coverage with 3 full-length timed mock tests and personalized error analysis.",
        price: 15500,
        durationMinutes: 720,
        sessionsCount: 12,
        deliveryDays: 30,
        features: [
          "12 live classes",
          "3 full-length timed PMDC mock tests",
          "Personalized weakness diagnostic",
          "24/7 access to Dr. Zainab via WhatsApp",
          "Exam hall psychological coaching",
        ],
      },
    },
    faqs: [
      {
        question: "Does this follow the latest PMDC syllabus?",
        answer: "Yes, fully updated according to the latest national curriculum and provincial textbook nuances.",
      },
    ],
    reviews: [
      {
        id: "rev-5",
        studentName: "Maham Tariq",
        studentCity: "Multan",
        studentInitials: "MT",
        rating: 5,
        date: "2 weeks ago",
        comment: "Dr. Zainab's genetics mnemonics made what used to take me 3 hours of rote learning click in 20 minutes. Secured 68/68 in my Biology mock!",
      },
    ],
  },
  {
    id: "gig-5",
    slug: "cambridge-o-a-level-mathematics-syllabus-d",
    title: "I will teach O/A-Level Mathematics Syllabus D with Step-by-Step Clarity",
    category: "STEM",
    subject: "Mathematics",
    ustaadId: "ustaad-1",
    ustaad: USTAADS["ustaad-1"],
    coverGradient: "from-[#0F172A] via-[#1E293B] to-[#475569]",
    badge: "Popular",
    startingPrice: 2000,
    matchPercent: 96,
    overview:
      "Transform your relationship with Mathematics. From basic algebraic fractions and coordinate geometry to trigonometric equations and calculus, we break down problems so that every step makes intuitive sense.",
    learningOutcomes: [
      "Master Cambridge 4024 & 9709 syllabus topics with ease",
      "Eliminate algebraic calculation slips and sign errors",
      "Solve coordinate geometry and vectors questions step-by-step",
      "Boost your exam confidence with timed past paper practice",
    ],
    syllabus: [
      { title: "Part 1: Algebra & Quadratics", detail: "Factoring, inequalities, indices, and functions." },
      { title: "Part 2: Geometry & Trigonometry", detail: "Circle theorems, bearings, sine/cosine rules." },
      { title: "Part 3: Vectors, Matrices & Probability", detail: "Column vectors, transformations, probability trees." },
    ],
    prerequisites: ["Cambridge or Matric Mathematics syllabus student"],
    packages: {
      basic: {
        name: "Basic",
        title: "1-on-1 Topic Rescue (60 mins)",
        description: "Clear doubts in any specific chapter (e.g. Circle Theorems, Probability, or Differentiation).",
        price: 2000,
        durationMinutes: 60,
        sessionsCount: 1,
        deliveryDays: 1,
        features: ["60 mins live class", "Solved step-by-step worksheet", "Recording of lesson"],
      },
      standard: {
        name: "Standard",
        title: "Algebra & Geometry Mastery (4 Sessions)",
        description: "Four comprehensive 60-minute classes covering core high-weightage sections with homework.",
        price: 7500,
        durationMinutes: 240,
        sessionsCount: 4,
        deliveryDays: 14,
        features: ["4 live sessions", "Curated past papers 2018-2024", "Formula sheets", "WhatsApp support"],
      },
      premium: {
        name: "Premium",
        title: "Full Exam Prep & Past Paper Marathon (10 Sessions)",
        description: "Comprehensive syllabus overhaul + 5 years of past papers solved together.",
        price: 17500,
        durationMinutes: 600,
        sessionsCount: 10,
        deliveryDays: 30,
        features: ["10 live sessions", "5 Years CIE past papers solved", "Graded mock paper", "Direct mentor access"],
      },
    },
    faqs: [
      {
        question: "Do you cover both Paper 1 and Paper 2?",
        answer: "Yes, non-calculator mental maths techniques for Paper 1 and calculator efficiency for Paper 2.",
      },
    ],
    reviews: [
      {
        id: "rev-6",
        studentName: "Saad K.",
        studentCity: "Lahore",
        studentInitials: "SK",
        rating: 5,
        date: "1 month ago",
        comment: "Maths used to give me anxiety. After just 5 sessions with Dr. Ahmed, I actually look forward to solving past papers.",
      },
    ],
  },
  {
    id: "gig-6",
    slug: "tajweed-and-quranic-arabic-for-beginners",
    title: "I will teach you Quran Recitation with Tajweed & Foundational Arabic",
    category: "Arts & Humanities",
    subject: "Tajweed & Arabic",
    ustaadId: "ustaad-6",
    ustaad: USTAADS["ustaad-6"],
    coverGradient: "from-[#0F766E] via-[#047857] to-[#10B981]",
    badge: "Highly Rated",
    startingPrice: 1200,
    matchPercent: 96,
    overview:
      "Learn to recite the Holy Quran with correct articulation points (Makharij) and Tajweed rules under the guidance of an Al-Azhar certified Qari. Suitable for all age groups, from young children to adults.",
    learningOutcomes: [
      "Master correct pronunciation of Arabic letters from throat and tongue",
      "Apply rules of Ghunnah, Ikhfa, Idgham, and Qalqalah accurately",
      "Understand the basic vocabulary and meaning of frequently recited Surahs",
    ],
    syllabus: [
      { title: "Stage 1: Makharij & Letter Sounds", detail: "Accurate articulation points of heavy and light letters." },
      { title: "Stage 2: Core Tajweed Rules", detail: "Rules of Noon Sakin, Meem Sakin, and Madd durations." },
      { title: "Stage 3: Fluent Recitation Practice", detail: "Word-by-word guided recitation of Juz Amma." },
    ],
    prerequisites: ["No prior knowledge required. Absolute beginners welcome!"],
    packages: {
      basic: {
        name: "Basic",
        title: "1 Tajweed Assessment & Vocal Correction",
        description: "45-minute lesson assessing pronunciation and identifying key rules to improve.",
        price: 1200,
        durationMinutes: 45,
        sessionsCount: 1,
        deliveryDays: 1,
        features: ["45 mins live session", "Pronunciation diagnostic report", "Audio exercises"],
      },
      standard: {
        name: "Standard",
        title: "Monthly 8-Session Tajweed Foundation",
        description: "8 sessions (2 per week) covering the complete Noorani Qaida / Tajweed fundamentals.",
        price: 7000,
        durationMinutes: 360,
        sessionsCount: 8,
        deliveryDays: 30,
        features: ["8 live 1-on-1 classes", "Daily practice voice notes", "Tajweed rules summary chart"],
      },
      premium: {
        name: "Premium",
        title: "Intensive 16-Session Fluency & Memorization",
        description: "16 sessions (4 per week) with individual Hifz and Tajweed mastery.",
        price: 13000,
        durationMinutes: 720,
        sessionsCount: 16,
        deliveryDays: 30,
        features: ["16 live classes", "Surah memorization tracking", "Daily feedback", "Ijazah prep guidance"],
      },
    },
    faqs: [
      {
        question: "Can kids take these classes?",
        answer: "Yes, Qari Usman has extensive experience teaching children aged 6+ with great patience and gentle encouragement.",
      },
    ],
    reviews: [
      {
        id: "rev-7",
        studentName: "Farhan A.",
        studentCity: "Karachi",
        studentInitials: "FA",
        rating: 5,
        date: "1 month ago",
        comment: "My 8-year-old son has improved his recitation tremendously in just one month. The teacher is very kind and punctual.",
      },
    ],
  },
];

export function getAllGigs(): Gig[] {
  return GIGS;
}

export function getGigById(id: string): Gig | undefined {
  return GIGS.find((g) => g.id === id || g.slug === id);
}

export function getUstaadById(id: string): Ustaad | undefined {
  return USTAADS[id];
}

export function getGigsByUstaad(ustaadId: string): Gig[] {
  return GIGS.filter((g) => g.ustaadId === ustaadId);
}

export const POPULAR_SUBJECTS = [
  "All",
  "Mathematics",
  "Physics",
  "Python & React",
  "IELTS & English",
  "Biology & MDCAT",
  "Tajweed & Arabic",
];

export const CITIES = ["All Cities", "Lahore", "Karachi", "Islamabad", "Online Only"];
