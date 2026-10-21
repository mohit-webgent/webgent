
export interface ProjectItem {
  id: string;
  name: string;
  category: string;
  projectType: "Client Project" | "Selected Project" | "Professional Experience";
  description: string;
  myContribution: string[];
  techStack: string[];
  liveUrl: string;
  isLive: boolean;
  statusLabel: string;
}

export interface ExperienceItem {
  company: string;
  role: string;
  type: "Full-Time" | "Internship";
  location: string;
  period: string;
  description?: string;
  highlights: string[];
  isCurrent?: boolean;
}

export interface EducationItem {
  degree: string;
  field?: string;
  institution: string;
  university: string;
  period: string;
  achievement?: string;
}

export interface SkillCategory {
  title: string;
  description: string;
  skills: string[];
  categoryKey: "frontend" | "backend" | "databases" | "tools" | "learning";
}

export interface ApproachStep {
  step: string;
  title: string;
  description: string;
}

export interface WorkingPrinciple {
  title: string;
  description: string;
}

// ---------------------------------------------------------------------------
// Founder Profile Data — Mohit Verma
// ---------------------------------------------------------------------------
export const FOUNDER_PROFILE = {
  name: "Mohit Verma",
  badge: "ABOUT / THE PERSON BEHIND WEBGENT",
  headline: "Building digital experiences. Engineering real-world solutions.",
  roleTitle: "Software Developer at DBA Lounge · Founder of Webgent Studio",
  subTitle: "Software Developer at DBA Lounge | Founder & Developer at Webgent Studio",
  avatarUrl: "/images/mohit-verma.jpeg",
  identities: [
    "Software Developer at DBA Lounge",
    "Founder & Developer at Webgent Studio",
    "Frontend & React Engineer",
    "MERN Stack Developer",
  ],
  location: "Gurugram / Noida, India",
  email: "mohitvermag75@gmail.com",
  portfolioUrl: "https://vermamohit.in/",
  githubUrl: "https://github.com/mohitvermag",
  linkedinUrl: "https://linkedin.com/in/webmohitverma",

  introParagraphs: [
    "I'm Mohit Verma, a software developer focused on building responsive web interfaces and practical web applications. Alongside my professional role at DBA Lounge, I run Webgent Studio, where I work on independent web projects and digital experiences for businesses.",
    "My background combines formal computer science education (MCA), hands-on full-stack development, production project work, and continued learning across modern web technologies.",
  ],

  // -------------------------------------------------------------------------
  // Two Professional Tracks (Crystal Clear Separation)
  // -------------------------------------------------------------------------
  currentRole: {
    company: "DBA Lounge",
    role: "Software Developer",
    location: "Gurugram, India",
    period: "Present",
    label: "FULL-TIME ROLE",
    title: "Software Developer at DBA Lounge",
    description:
      "Working within a professional software development environment, contributing to production projects, collaborating with teams, and continuing to strengthen my engineering skills.",
    highlights: [
      "Architecting responsive frontend interfaces and design systems using React.js.",
      "Engineering scalable, production-ready web interfaces with modern component patterns.",
      "Collaborating across agile sprints and production deployments.",
      "Focusing on high-performance render cycles and accessible web standards.",
    ],
    techStack: ["React.js", "TypeScript", "Next.js", "Tailwind CSS", "REST APIs", "Git"],
    note: "Employment details and approved project work are maintained in compliance with company confidentiality standards.",
  },

  studioRole: {
    venture: "Webgent Studio",
    role: "Founder & Developer",
    focus: "Web Development & Digital Solutions",
    location: "Gurugram / Noida, India",
    period: "Active",
    label: "PERSONAL VENTURE",
    title: "Founder & Developer at Webgent Studio",
    description:
      "Building an independent web development studio focused on responsive business websites, modern web applications, and practical digital solutions tailored to client requirements.",
    highlights: [
      "Custom responsive websites and web application development for businesses and clients.",
      "Modular frontend component architecture and intuitive user interfaces.",
      "End-to-end project execution: planning, UI development, API integrations, and deployment.",
    ],
    services: [
      "Business Websites & Landing Pages",
      "React Frontend Applications",
      "E-Commerce & Digital Storefronts",
      "Custom Web Applications",
    ],
  },

  // -------------------------------------------------------------------------
  // Previous Professional Experience (Internships)
  // -------------------------------------------------------------------------
  previousExperience: [
    {
      company: "Diamond Ore Consulting",
      role: "MERN Stack Developer Intern",
      type: "Internship" as const,
      location: "Noida, India",
      period: "September 2025 – April 2026",
      description:
        "Developed responsive frontend interfaces using React.js and Tailwind CSS, worked on a headless CMS solution using Strapi, and built reusable UI component libraries.",
      highlights: [
        "Developed responsive frontend interfaces using React.js and Tailwind CSS for production applications.",
        "Worked on a headless CMS solution using Strapi and REST APIs.",
        "Built reusable UI components including buttons, cards, modals and forms.",
        "Contributed to responsive design and cross-device compatibility.",
        "Collaborated in sprint workflows and version control pipelines.",
      ],
      techStack: ["React.js", "Tailwind CSS", "Strapi CMS", "REST APIs", "JavaScript"],
    },
    {
      company: "TrayiStats AI Technologies",
      role: "Full Stack Developer Intern",
      type: "Internship" as const,
      location: "Noida, India",
      period: "January 2025 – July 2025",
      description:
        "Built responsive React.js frontend pages, developed Node.js and Express.js REST API endpoints, and worked with MySQL query optimization.",
      highlights: [
        "Developed responsive React.js frontend pages.",
        "Built REST API endpoints using Node.js and Express.js.",
        "Worked with MySQL databases, query optimization and indexing.",
        "Participated in code reviews and sprint planning.",
        "Used Jira as part of the development workflow.",
      ],
      techStack: ["React.js", "Node.js", "Express.js", "MySQL", "Jira", "REST APIs"],
    },
  ],

  // -------------------------------------------------------------------------
  // Education & Academic Achievements
  // -------------------------------------------------------------------------
  education: [
    {
      degree: "Master of Computer Applications (MCA)",
      institution: "HIMT College, Noida",
      university: "Dr. A.P.J. Abdul Kalam Technical University (AKTU)",
      period: "2022 – 2024",
    },
    {
      degree: "Bachelor of Science — Computer Science",
      institution: "IIMT College, Noida",
      university: "Chaudhary Charan Singh University (CCSU)",
      period: "2019 – 2022",
    },
  ],

  // -------------------------------------------------------------------------
  // Technical Expertise
  // -------------------------------------------------------------------------
  skills: [
    {
      categoryKey: "frontend" as const,
      title: "Frontend Development",
      description: "Crafting fluid, accessible, high-performance interfaces and design systems.",
      skills: [
        "React.js",
        "JavaScript",
        "HTML5",
        "CSS3",
        "Tailwind CSS",
        "Bootstrap",
        "Redux Toolkit",
        "Material UI",
      ],
    },
    {
      categoryKey: "backend" as const,
      title: "Backend Development",
      description: "Developing robust application programming interfaces and secure authentication flows.",
      skills: [
        "Node.js",
        "Express.js",
        "REST APIs",
        "JWT Authentication",
      ],
    },
    {
      categoryKey: "databases" as const,
      title: "Databases",
      description: "Structuring relational and document data for querying, performance, and integrity.",
      skills: ["MongoDB", "MySQL"],
    },
    {
      categoryKey: "tools" as const,
      title: "Tools & Workflow",
      description: "Managing collaborative pipelines, API testing, and deployment targets.",
      skills: ["Git", "GitHub", "Postman", "Jira", "Vercel", "Render", "Strapi CMS"],
    },
    {
      categoryKey: "learning" as const,
      title: "Currently Exploring",
      description: "Continuously deepening technical capabilities across modern full-stack web platforms.",
      skills: [
        "Next.js App Router",
        "Advanced Full-Stack Architecture",
        "Modern Cloud Application Development",
      ],
    },
  ],

  // -------------------------------------------------------------------------
  // Selected Projects
  // -------------------------------------------------------------------------
  projects: [
    {
      id: "bird-outsourcing",
      name: "Bird Outsourcing",
      category: "Corporate Business Solutions",
      projectType: "Client Project" as const,
      description:
        "A responsive corporate business website engineered to communicate global outsourcing and enterprise services.",
      myContribution: [
        "Developed the responsive React.js and Tailwind CSS frontend application.",
        "Built a modular, reusable UI component library.",
        "Designed accessible, cross-browser compatible layouts.",
        "Structured performant static and dynamic service content sections.",
      ],
      techStack: ["React.js", "Tailwind CSS", "Component Library", "Cross-Browser UI"],
      liveUrl: "https://birdoutsourcing.com/",
      isLive: true,
      statusLabel: "Live Production Site",
    },
    {
      id: "edayaa-jewellery",
      name: "Edayaa Jewellery Platform",
      category: "E-Commerce & Digital Storefront",
      projectType: "Client Project" as const,
      description:
        "A modern e-commerce shopping experience tailored for fine jewellery collections with responsive product catalogs.",
      myContribution: [
        "Constructed a mobile-first responsive frontend architecture.",
        "Developed product catalog listing, filtering, and detailed product showcase views.",
        "Built interactive shopping cart and checkout user interface.",
        "Implemented client-side state management using Redux Toolkit.",
        "Configured persistent shopping cart storage across user sessions.",
      ],
      techStack: ["React.js", "Redux Toolkit", "Tailwind CSS", "REST APIs"],
      liveUrl: "https://edayaajewellery.com/",
      isLive: false,
      statusLabel: "E-Commerce Deployment",
    },
    {
      id: "institutional-platform",
      name: "Institutional Management Platform",
      category: "Education & Role Dashboards",
      projectType: "Selected Project" as const,
      description:
        "A comprehensive web platform featuring role-specific dashboards for administrators, teachers, and students.",
      myContribution: [
        "Engineered responsive React.js user interfaces across mobile and desktop.",
        "Built dedicated role-specific dashboard workflows.",
        "Implemented JWT authentication with role-based access control (RBAC).",
        "Configured student attendance tracking and records management.",
        "Integrated SMTP email notifications for automated communications.",
        "Implemented Razorpay payment gateway integration.",
        "Optimized frontend render performance and asset loading.",
      ],
      techStack: ["React.js", "Node.js", "JWT", "REST APIs", "Razorpay", "Tailwind CSS"],
      liveUrl: "https://studies.mentorworld.in/",
      isLive: false,
      statusLabel: "Past Production Deployment",
    },
  ],

  // -------------------------------------------------------------------------
  // Development Approach
  // -------------------------------------------------------------------------
  developmentApproach: [
    {
      step: "01",
      title: "Understand",
      description: "Understand the business, users, requirements and desired outcome.",
    },
    {
      step: "02",
      title: "Plan",
      description: "Define the scope, core features, technology choices and delivery milestones.",
    },
    {
      step: "03",
      title: "Build",
      description: "Develop the UI, backend and integrations according to the agreed scope.",
    },
    {
      step: "04",
      title: "Test & Deliver",
      description:
        "Test the agreed functionality, resolve identified bugs, deploy and provide the agreed handover documentation.",
    },
  ],

  // -------------------------------------------------------------------------
  // What I Can Help Clients Build
  // -------------------------------------------------------------------------
  servicesOffered: [
    { title: "Business Websites", href: "/pricing" },
    { title: "Landing Pages", href: "/pricing" },
    { title: "Portfolio Websites", href: "/pricing" },
    { title: "E-Commerce Websites", href: "/pricing" },
    { title: "React-Based Frontend Applications", href: "/pricing" },
    { title: "Full-Stack Web Applications", href: "/pricing" },
    { title: "Admin Dashboards", href: "/pricing" },
    { title: "REST API Integrations", href: "/pricing" },
    { title: "Authentication & Authorization (JWT/RBAC)", href: "/pricing" },
    { title: "Payment Gateway Integrations", href: "/pricing" },
    { title: "Email & Notification Systems", href: "/pricing" },
    { title: "Custom Feature Development", href: "/pricing" },
  ],

  // -------------------------------------------------------------------------
  // Personal Working Principles
  // -------------------------------------------------------------------------
  workingPrinciples: [
    {
      title: "Clear Communication",
      description: "Direct, transparent project updates and realistic milestone expectations at every step.",
    },
    {
      title: "Responsive & Accessible UI",
      description: "Interfaces built with responsive layout discipline across mobile, tablet, and widescreen monitors.",
    },
    {
      title: "Maintainable Components",
      description: "Clean, modular code structures that can be easily extended and maintained over time.",
    },
    {
      title: "Honest Scope & Pricing",
      description: "Transparent feature budgeting with zero hidden charges or unagreed surprises.",
    },
    {
      title: "Practical Problem-Solving",
      description: "Selecting the right technical tools for the business requirement rather than over-engineering.",
    },
    {
      title: "Testing & Documentation",
      description: "Thorough functional verification before handover, accompanied by clear setup documentation.",
    },
    {
      title: "Continued Technical Learning",
      description: "Constantly expanding skills in modern frameworks, full-stack patterns, and modern web standards.",
    },
  ],
};
