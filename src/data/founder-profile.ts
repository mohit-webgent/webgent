export interface ProjectItem {
  id: string;
  name: string;
  category: string;
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
  badge: "FOUNDER / WEBGENT",
  headline: "The Developer Behind the Work.",
  roleTitle: "Software Developer · Webgent",
  subTitle: "Founder of Webgent | Software Developer at DBA Lounge",
  identities: [
    "Founder of Webgent",
    "Software Developer at DBA Lounge",
    "React Developer",
    "Frontend Developer",
    "MERN Stack Developer",
  ],
  location: "Gurugram / Noida, India",
  email: "mohitvermag75@gmail.com",
  portfolioUrl: "https://vermamohit.in/",
  githubUrl: "https://github.com/mohitvermag",
  linkedinUrl: "https://linkedin.com/in/webmohitverma",

  introParagraphs: [
    "I’m Mohit Verma, a software developer focused on building responsive digital experiences, production-ready web interfaces and practical web applications. Through Webgent, I work on turning business requirements into thoughtfully designed websites and software products.",
    "My background combines computer science education, hands-on development experience, production project work and continued learning across modern web technologies.",
  ],

  // -------------------------------------------------------------------------
  // Current Professional Experience
  // -------------------------------------------------------------------------
  currentRole: {
    company: "DBA Lounge",
    role: "Software Developer",
    location: "Gurugram, India",
    period: "Present",
    description:
      "Working as a Software Developer and continuing to advance my technical capabilities through professional production development. Focused on engineering dependable frontend solutions, collaborative sprints, and scalable web architectures.",
    note: "Employment details and approved project work are maintained in compliance with company confidentiality standards.",
    editablePlaceholder:
      "Future approved details on specific responsibilities, technical stacks, and production milestones will be updated here.",
  },

  // -------------------------------------------------------------------------
  // Previous Professional Experience (Internships)
  // -------------------------------------------------------------------------
  previousExperience: [
    {
      company: "Diamond Ore Consulting",
      role: "MERN Stack Developer",
      type: "Internship" as const,
      location: "Noida, India",
      period: "September 2025 – April 2026",
      highlights: [
        "Developed responsive frontend interfaces using React.js and Tailwind CSS for production applications.",
        "Worked on a headless CMS solution using Strapi and REST APIs.",
        "Built reusable UI components including buttons, cards, modals and forms.",
        "Contributed to responsive design and cross-device compatibility.",
        "Worked with collaborative development workflows.",
      ],
    },
    {
      company: "TrayiStats AI Technologies",
      role: "Full Stack Developer",
      type: "Internship" as const,
      location: "Noida, India",
      period: "January 2025 – July 2025",
      highlights: [
        "Developed responsive React.js frontend pages.",
        "Built REST API endpoints using Node.js and Express.js.",
        "Worked with MySQL databases, query optimization and indexing.",
        "Participated in code reviews and sprint planning.",
        "Used Jira as part of the development workflow.",
      ],
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
      achievement: "Secured 1st Rank in MCA batch",
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
        "JavaScript (ES6+)",
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
        "Role-Based Access Control",
        "Razorpay Integration",
        "SMTP Email Integration",
      ],
    },
    {
      categoryKey: "databases" as const,
      title: "Databases & Storage",
      description: "Structuring relational and document data for fast querying and integrity.",
      skills: ["MongoDB", "MySQL"],
    },
    {
      categoryKey: "tools" as const,
      title: "Tools & Workflow",
      description: "Managing collaborative pipelines, API testing, and deployment targets.",
      skills: ["Git", "GitHub", "Postman", "Strapi CMS", "Jira", "Vercel", "Render"],
    },
    {
      categoryKey: "learning" as const,
      title: "Currently Learning & Expanding",
      description: "Continuously deepening skills across modern full-stack web platforms.",
      skills: [
        "Next.js (App Router)",
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
      id: "institutional-platform",
      name: "Institutional Management Platform",
      category: "Education & Role Dashboards",
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
      isLive: false, // marked as past production deployment per live check
      statusLabel: "Past Production Deployment",
    },
    {
      id: "edayaa-jewellery",
      name: "Jewellery E-Commerce Platform",
      category: "E-Commerce & Digital Storefront",
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
      isLive: false, // marked as e-commerce deployment
      statusLabel: "E-Commerce Deployment",
    },
    {
      id: "bird-outsourcing",
      name: "Business Services Platform",
      category: "Corporate Business Solutions",
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
