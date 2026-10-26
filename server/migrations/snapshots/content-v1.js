// Frozen copy of shared/default-content.js as originally seeded (v1).
// Migrations compare the database against it so they never overwrite content edited in the admin panel.
// Do not edit.

// Portfolio content migrated from the original hard-coded components
// (src/Constants/index.js, AboutMeLeft, Technologies, Footer, …).
// Used to seed the database on first run and as an offline fallback for the site.

const ABOUT = [
  "Hi there! I'm Mohammad Munna Mia, a passionate and dedicated Computer Science and Engineering graduate from Bangladesh. I have completed my bachelor's degree in Computer Science and Engineering from IUBAT - International University of Business Agriculture and Technology. I specialize in MERN-stack web development with a strong focus on delivering efficient, scalable, and user-friendly solutions.",
  "Over the past year, I've been deeply immersed in the MERN stack—mastering technologies like React, Next.js, Node.js, Express.js, and MongoDB. I thrive on building intuitive and maintainable systems that not only meet user needs but are also easy for other developers to work with.",
  "As an emerging QA Automation Engineer, I'm now channeling my development expertise into Software Quality Assurance and Automation Testing. My goal is to ensure applications are both idiot-proof and production-ready from the ground up. I believe in building quality into software, not testing it in later.",
  "Beyond my academic journey, I'm constantly exploring emerging technologies and pushing my boundaries to stay ahead in this ever-evolving tech landscape. I love collaborating with my team, staying updated with modern technologies, and integrating AI-driven automation into development workflows to make systems more reliable and efficient.",
];

export const DEFAULT_PROFILE = {
  name: "Mohammad Munna Mia",
  brand: "Mohammad Munna",
  role: "Developer & QA Enthusiast",
  seniority: "Junior",
  availableForWork: true,
  headline: "Code. Test. Deploy. Repeat.",
  rotatingLines: [
    "Crafting idiot-proof web apps.",
    "Bringing ideas to life—one component at a time.",
    "Let's build something awesome.",
    "Still here? Check out my projects and GitHub—go on, fast!",
  ],
  heroTech: [
    "React",
    "Next.js",
    "Node.js",
    "Express.js",
    "MongoDB",
    "TypeScript",
    "Tailwind CSS",
    "Firebase",
    "Selenium",
    "Appium",
    "Postman",
    "Jira",
  ],
  about: ABOUT.join("\n\n"),
  specialties: [
    "MERN Stack Development",
    "Front-End Development",
    "QA Automation",
    "Manual Testing",
    "API Testing",
  ],
  tools: ["React", "Next.js", "Node.js", "MongoDB", "Selenium", "Postman", "Jira"],
  qaSkills: [
    "Selenium",
    "Appium",
    "Postman",
    "Jira",
    "TestNG",
    "Manual Testing",
    "Automation Testing",
    "API Testing",
    "DataBase Testing",
    "Bug Tracking",
    "Test Planning",
    "CI/CD",
  ],
  devSkills: [
    "React",
    "Next.js",
    "Node.js",
    "Express",
    "JavaScript",
    "TypeScript",
    "C",
    "C++",
    "Java",
    "TailwindCSS",
    "SQL",
    "HTML",
    "MongoDB",
    "Firebase",
    "GitHub",
  ],
  email: "mohammadmunnamia0@gmail.com",
  phone: "+8801858201032",
  location: "Uttara, Dhaka, Bangladesh",
  resumeUrl: "https://drive.google.com/file/d/1F11P65OI81F9DqFuJTvXXsygMeNDsqd7/view?usp=sharing",
  ctaTitle: "Have a question or want to work together? Let's build something awesome.",
  ctaButtonLabel: "Let's Connect",
  siteTitle: "Mohammad Munna — Developer & QA Enthusiast",
  siteDescription:
    "Portfolio of Mohammad Munna Mia — MERN-stack developer and QA automation enthusiast from Bangladesh, building efficient, scalable and user-friendly web applications.",
};

export const DEFAULT_SECTIONS = [
  {
    key: "work",
    navLabel: "Projects",
    eyebrow: "Selected Work",
    title: "A Glance at My Projects",
    subtitle: "Explore my collection of web development and QA automation projects",
    image: "/images/portraits/portrait-charcoal.webp",
    ctaLabel: "Let's Discuss a Project",
  },
  {
    key: "about",
    navLabel: "About",
    eyebrow: "About",
    title: "Meet Munna",
    subtitle: "",
    image: "/images/portraits/portrait-gradient.webp",
    ctaLabel: "",
  },
  {
    key: "certifications",
    navLabel: "",
    eyebrow: "",
    title: "Training & Certifications",
    subtitle: "",
    image: "",
    ctaLabel: "View Certificate",
  },
  {
    key: "experience",
    navLabel: "Experience",
    eyebrow: "Experience",
    title: "Experience & Education",
    subtitle: "",
    image: "/images/portraits/portrait-black.webp",
    ctaLabel: "",
  },
  {
    key: "skills",
    navLabel: "Skills",
    eyebrow: "What I Do",
    title: "Skills & Expertise",
    subtitle:
      "I specialize in MERN-stack web development with a strong focus on delivering efficient, scalable, and user-friendly solutions.",
    image: "",
    ctaLabel: "Let's Connect",
  },
  {
    key: "sqa",
    navLabel: "SQA",
    eyebrow: "Quality Assurance",
    title: "SQA Projects",
    subtitle: "I believe in building quality into software, not testing it in later.",
    image: "/images/portraits/portrait-gray.webp",
    ctaLabel: "View GitHub",
  },
  { key: "stats", navLabel: "", eyebrow: "", title: "What I've Achieved", subtitle: "", image: "", ctaLabel: "" },
  {
    key: "testimonials",
    navLabel: "",
    eyebrow: "Review",
    title: "What People Say",
    subtitle: "",
    image: "",
    ctaLabel: "",
  },
  {
    key: "faq",
    navLabel: "",
    eyebrow: "FAQ's",
    title: "Answers",
    subtitle: "Find answers to common questions about my work, skills and availability.",
    image: "/images/projects/shopease.webp",
    ctaLabel: "",
  },
  {
    key: "contact",
    navLabel: "Contact",
    eyebrow: "Contact",
    title: "Get in Touch",
    subtitle: "Have a question or want to work together? Feel free to contact me!",
    image: "",
    ctaLabel: "Send Message",
  },
];

export const DEFAULT_PROJECTS = [
  {
    title: "ShopEase",
    tagline: "Full-Featured E-commerce Platform",
    category: "fullstack",
    image: "/images/projects/shopease.webp",
    description:
      "ShopEase is a full-featured e-commerce app built with Next.js, Node.js, and Stripe, featuring JWT auth, an admin panel, and a responsive design for a secure, seamless shopping experience.\n\nThe ShopEase backend uses Node.js, Express, MongoDB, and JWT to handle secure auth, product & order management, and Stripe payments with reliable, real-time performance.",
    technologies: [
      "Next.js",
      "React.js",
      "Node.js",
      "Express.js",
      "MongoDB",
      "Stripe",
      "JWT",
      "TailwindCSS",
      "REST API",
      "Admin Panel",
    ],
    liveUrl: "https://shopease-frontend-blond.vercel.app/",
    repoUrl: "https://github.com/mohammadmunnamia0/shopease_frontend.git",
    serverRepoUrl: "https://github.com/mohammadmunnamia0/shopease_backend.git",
    featured: true,
  },
  {
    title: "Blood Bridge Foundation",
    tagline: "Life-Saving Blood Donation Web App",
    category: "fullstack",
    image: "/images/projects/blood-bridge.webp",
    description:
      "Built a secure and user-centric full-stack blood donation platform using the MERN stack. Features include hospital and organization directories, donor registration, blood request system with validation, and a public request dashboard. Implemented secure access to donor info via modal authentication and used Firebase for auth and database management.",
    technologies: [
      "React.js",
      "Firebase",
      "Node.js",
      "Express.js",
      "MongoDB",
      "TailwindCSS",
      "React Router",
      "Framer Motion",
      "SweetAlert2",
      "JWT",
      "Localstorage",
    ],
    liveUrl: "https://blood-bridge-foundation.vercel.app/",
    repoUrl: "https://github.com/mohammadmunnamia0/BloodBridge-Foundation.git",
    serverRepoUrl: "",
    featured: true,
  },
  {
    title: "Smart-Star School",
    tagline: "Real Life Preliminary School Web Project",
    category: "frontend",
    image: "/images/projects/smartstar-school.webp",
    description:
      "Solo project built with React, Tailwind CSS, JavaScript, Web3Form and Framer Motion.\n\nSmartStar School is a colorful, kid-friendly educational website built to make early learning fun and engaging. I developed it using React for interactivity, Tailwind CSS for clean design, and Framer Motion for smooth animations. It's fully responsive, playful, and built with young users in mind.",
    technologies: ["HTML", "CSS", "Tailwind", "React.js", "Node.js", "Web3Form", "Framer Motion"],
    liveUrl: "https://smart-start-school-wgkf.vercel.app/",
    repoUrl: "https://github.com/mohammadmunnamia0/SmartStart-School.git",
    serverRepoUrl: "",
    featured: true,
  },
  {
    title: "HexTech",
    tagline: "Portfolio Web Project – Team Collaboration",
    category: "fullstack",
    image: "/images/projects/hextech.webp",
    description:
      "Developed a MERN stack portfolio app using Next.js for SEO and performance. Collaborated in a team to integrate AOS, GSAP, and Framer Motion for smooth animations. Added dynamic email with Nodemailer, interactive maps, sliders, and responsive UI with TailwindCSS.",
    technologies: [
      "HTML",
      "CSS",
      "Tailwind",
      "Next.js",
      "Firebase",
      "Node.js",
      "Nodemailer",
      "GSAP",
      "Framer Motion",
      "MongoDB",
    ],
    liveUrl: "https://hex-tech-project-b88o.vercel.app/",
    repoUrl: "https://github.com/mohammadmunnamia0/HexTech-Project",
    serverRepoUrl: "",
    featured: true,
  },
  {
    title: "LoneOrbit",
    tagline: "Full-Stack Development Project",
    category: "fullstack",
    image: "/images/projects/loneorbit.webp",
    description:
      "A marketplace built with React and Tailwind, allowing employers to manage jobs and bids, while bidders can place and track bids. Features include secure login, private routes, real-time updates, and optional bid deadlines.",
    technologies: ["HTML", "CSS", "Tailwind", "React", "Firebase", "Node.js", "Axios", "MongoDB"],
    liveUrl: "https://loneorbit-96b7e.web.app/",
    repoUrl: "https://github.com/mohammadmunnamia0/LoneOrbit0.1-Client",
    serverRepoUrl: "https://github.com/mohammadmunnamia0/LoneOrbit0.1-Server",
    featured: true,
  },
  {
    title: "Dev-Challenges",
    tagline: "API-Based Web Project",
    category: "frontend",
    image: "/images/projects/dev-challenges.webp",
    description:
      "A dynamic web project that fetches real-time data from an external API. Users can browse, read, and bookmark content, with the ability to manage and delete bookmarks. The site is interactive, responsive, and built with modern web development practices for a smooth experience.",
    technologies: ["HTML", "CSS", "JavaScript", "Node.js", "Firebase"],
    liveUrl: "https://dev-challenges-o6bw.vercel.app/",
    repoUrl: "https://github.com/mohammadmunnamia0/devChallenges",
    serverRepoUrl: "",
    featured: true,
  },
  {
    title: "Quick Quiz",
    tagline: "Interactive Quiz Platform",
    category: "frontend",
    image: "/images/projects/quick-quiz.webp",
    description:
      "An interactive quiz platform with real-time answers, a countdown timer, answer preview, and a result summary showing scores and comparisons. It features a user-friendly, responsive interface.",
    technologies: ["HTML", "CSS", "JavaScript", "React", "Node.js"],
    liveUrl: "https://quick-quiz01.netlify.app/",
    repoUrl: "https://github.com/mohammadmunnamia0/Quick-Quiz",
    serverRepoUrl: "",
    featured: true,
  },
  {
    title: "Portfolio Website",
    tagline: "Personal Portfolio",
    category: "frontend",
    image: "/images/projects/portfolio.webp",
    description:
      "A personal portfolio website to showcase projects, experience, and skills. Features include responsive design and smooth navigation.",
    technologies: ["HTML", "CSS", "JavaScript", "React", "Node.js"],
    liveUrl: "https://port-folio01-ten.vercel.app/",
    repoUrl: "https://github.com/mohammadmunnamia0/PortFolio0.1",
    serverRepoUrl: "",
    featured: true,
  },
];

const BROWSERS = ["Chrome", "Firefox", "Edge"];

export const DEFAULT_SQA_PROJECTS = [
  {
    title: "E-commerce Automation",
    type: "Automation",
    icon: "cart",
    summary: "",
    framework: "Selenium WebDriver with Page Object Model (POM)",
    methodology: "",
    testingType: "Functional, UI, and Automation Testing",
    reportingTool: "HTMLTestRunner (HTML Reports)",
    browsers: BROWSERS,
    repoUrl: "https://github.com/mohammadmunnamia0/e-commerce-automation.git",
  },
  {
    title: "Login Functionality Automation",
    type: "Automation",
    icon: "lock",
    summary: "",
    framework: "Selenium WebDriver with Java",
    methodology: "",
    testingType: "Functional & UI Testing",
    reportingTool: "TestNG Reports",
    browsers: BROWSERS,
    repoUrl: "https://github.com/mohammadmunnamia0/selenium-with-java.git",
  },
  {
    title: "POM Framework - Login Functionality Automation",
    type: "Automation",
    icon: "lock",
    summary: "",
    framework: "Selenium WebDriver with Java",
    methodology: "",
    testingType: "Functional & UI Testing",
    reportingTool: "TestNG Reports",
    browsers: BROWSERS,
    repoUrl: "https://github.com/mohammadmunnamia0/Automation-POM-Framework-Testing.git",
  },
  {
    title: "Online Banking Website",
    type: "Manual",
    icon: "bank",
    summary: "",
    framework: "",
    methodology: "Agile",
    testingType: "Functional & UI Testing",
    reportingTool: "Excel, MS Word",
    browsers: BROWSERS,
    repoUrl: "https://github.com/mohammadmunnamia0/Manual-Testing-for-a-Banking-Website.git",
  },
  {
    title: "Login Functionality",
    type: "Manual",
    icon: "lock",
    summary: "",
    framework: "",
    methodology: "Manual Testing",
    testingType: "Functional & UI Testing",
    reportingTool: "Excel Spreadsheet",
    browsers: BROWSERS,
    repoUrl: "https://github.com/mohammadmunnamia0/TestCAse-openCart.git",
  },
];

export const DEFAULT_EXPERIENCE = [
  {
    role: "Junior Front-End Developer (MERN Stack)",
    company: "Edistys",
    companyUrl: "",
    period: "June 2025 – Present",
    location: "Remote",
    employmentType: "Full-time",
    icon: "code",
    description:
      "Collaborating with the development team to build and maintain scalable web applications using React.js, Node.js, MongoDB, and Express.js. Implementing responsive, accessible, and performance-optimized interfaces with Tailwind CSS and modern JavaScript (ES6+). Conducting unit testing and manual testing on UI components for cross-browser compatibility. Participating in code reviews, debugging, and version control via Git & GitHub. Working closely with QA engineers to identify, reproduce, and resolve defects to improve software stability.",
  },
  {
    role: "Web Developer (Front-End)",
    company: "genZsoft.Cloud",
    companyUrl: "",
    period: "April 2025 – May 2025",
    location: "Remote",
    employmentType: "Part-time",
    icon: "monitor",
    description:
      "Designed and developed reusable UI components with React.js and Next.js. Improved performance and SEO via Lighthouse audits and optimization. Reported and tracked frontend bugs to aid early defect detection. Collaborated with designers for consistent UI/UX across all devices.",
  },
  {
    role: "MERN Stack Developer Intern",
    company: "Solutya Pvt. Ltd.",
    companyUrl: "",
    period: "January 2025 – March 2025",
    location: "Dhaka, Bangladesh",
    employmentType: "On-site",
    icon: "server",
    description:
      "Gained practical experience in full-stack development using the MERN stack. Built and integrated RESTful APIs with frontend components. Conducted functional and integration testing for system verification. Participated in Agile/Scrum sprints and documented test cases and issues. Strengthened understanding of software quality and deployment pipelines.",
  },
  {
    role: "Senior Mentor (Volunteering)",
    company: "Shopnojoyee Academy Care",
    companyUrl: "",
    period: "January 2021 – March 2025 · 4 yrs 3 mos",
    location: "Remote",
    employmentType: "Volunteer",
    icon: "users",
    description:
      "Mentored both HSC and SSC batch students with a focus on academic guidance and personal development in the tech field. Provided insights into modern technologies and career paths, and conducted engaging sessions on programming, development, and mathematics. Delivered lessons via Zoom and Google Meet, offered one-on-one support, and helped learners build a strong foundational knowledge for their exams. Focused on enhancing subject understanding, exam preparation, and student motivation through structured lesson planning and consistent support.",
  },
];

export const DEFAULT_EDUCATION = [
  {
    degree: "Bachelor of Science in Computer Science and Engineering",
    institution: "International University of Business Agriculture and Technology (IUBAT)",
    period: "2021 - Present",
    details: "Active member of the Programming Club. Participated in several Group work and Team collaboration.",
  },
  {
    degree: "Higher Secondary Certificate (HSC)",
    institution: "Nawab Habibullah Model School & College",
    period: "2018 - 2020",
    details: "Completed with distinction in Science group. Participated in several extracurricular activities.",
  },
];

export const DEFAULT_CERTIFICATIONS = [
  {
    title: "Manual & Automation Software Testing",
    issuer: "Edge Bangladesh",
    issued: "",
    icon: "graduation-cap",
    url: "https://drive.google.com/file/d/14sGysmqanKmNNEf1aGxr_AXzOwLF3MtO/view",
  },
  {
    title: "SQA Crash Course",
    issuer: "Online Course",
    issued: "",
    icon: "flask",
    url: "https://drive.google.com/file/d/188H84Rg1QCyaBgR1hkGsPMpPYwS_B_Dn/view",
  },
  {
    title: "SQA Career Launchpad for Beginners",
    issuer: "Online Course",
    issued: "",
    icon: "rocket",
    url: "https://drive.google.com/file/d/14cDeLEITntZ4WGmLd6N9vgWFtW0K85L0/view",
  },
  {
    title: "Full Stack Web Development Course",
    issuer: "Bootcamp",
    issued: "",
    icon: "monitor",
    url: "https://drive.google.com/file/d/1MDMVBM0wDx-lOF00mOitxKVJO644w0qO/view",
  },
  {
    title: "Public Speaking and Presentation",
    issuer: "Professional Development",
    issued: "",
    icon: "mic",
    url: "https://10minuteschool.com/certificate/678557cecb866/",
  },
];

export const DEFAULT_SKILLS = [
  {
    title: "Frontend Technologies",
    kind: "development",
    icon: "monitor",
    items: [
      "React.js",
      "Next.js",
      "HTML5",
      "CSS3",
      "JavaScript (ES6+)",
      "TypeScript",
      "Tailwind CSS",
      "Context API",
      "Framer Motion",
    ],
  },
  {
    title: "Backend Technologies",
    kind: "development",
    icon: "server",
    items: ["Node.js", "Express.js", "RESTful APIs", "Authentication & Authorization"],
  },
  { title: "Database", kind: "development", icon: "database", items: ["MongoDB", "Firebase", "SQL"] },
  {
    title: "Tools",
    kind: "development",
    icon: "wrench",
    items: ["Git", "GitHub", "VS Code", "Figma", "Postman", "Vite", "Netlify", "Vercel"],
  },
  {
    title: "Programming Languages",
    kind: "development",
    icon: "code",
    items: ["JavaScript", "TypeScript", "Python", "C/C++", "Java"],
  },
  { title: "SQA Tools", kind: "qa", icon: "clipboard", items: ["TestRail", "Jira", "Postman", "Firebase"] },
  {
    title: "SQA Technologies",
    kind: "qa",
    icon: "bot",
    items: ["Selenium WebDriver", "Appium", "WebdriverIO", "API Testing", "TestNG"],
  },
  {
    title: "Knowledge Areas",
    kind: "qa",
    icon: "bug",
    items: [
      "Test Automation",
      "Manual Testing",
      "Test Cases & Bug Reporting",
      "Testing Methodologies",
      "SDLC & STLC",
      "Agile Methodology",
    ],
  },
  {
    title: "Soft Skills",
    kind: "other",
    icon: "users",
    items: ["Problem-Solving", "Teamwork", "Communication", "Quick Learner", "Leadership"],
  },
  { title: "Additional Expertise", kind: "other", icon: "zap", items: ["Debugging", "GitHub", "CI/CD"] },
  {
    title: "Relevant Coursework",
    kind: "other",
    icon: "book",
    items: ["Software Engineering", "Data Structures", "Algorithms", "Database Management"],
  },
];

export const DEFAULT_STATS = [
  { value: "1+", label: "Years of Experience" },
  { value: "5+", label: "Own Projects Completed" },
  { value: "6+", label: "Organization Projects Completed" },
  { value: "5+", label: "Certificates Earned" },
];

export const DEFAULT_SOCIALS = [
  {
    platform: "linkedin",
    label: "LinkedIn",
    url: "https://www.linkedin.com/in/md-munna-mia-340225219/",
    showInHero: true,
  },
  { platform: "github", label: "GitHub", url: "https://github.com/mohammadmunnamia0", showInHero: true },
  { platform: "x", label: "X (Twitter)", url: "https://x.com/munna_mohamma", showInHero: false },
  {
    platform: "instagram",
    label: "Instagram",
    url: "https://www.instagram.com/muhammad01munna/",
    showInHero: false,
  },
  {
    platform: "facebook",
    label: "Facebook",
    url: "https://www.facebook.com/mohammad.munna.68163/",
    showInHero: false,
  },
];

// Answers are drawn from the profile, experience and skills above.
export const DEFAULT_FAQS = [
  {
    question: "What do you specialize in?",
    answer:
      "MERN-stack web development — React, Next.js, Node.js, Express.js and MongoDB — combined with software quality assurance: manual testing, API testing and automation testing with Selenium WebDriver and TestNG.",
  },
  {
    question: "Are you available for new opportunities?",
    answer:
      "Yes. I'm currently a Junior Front-End Developer (MERN Stack) at Edistys and I'm open to new roles, freelance projects and collaborations.",
  },
  {
    question: "Which testing tools do you use?",
    answer:
      "Selenium WebDriver, Appium, WebdriverIO, TestNG and Postman for testing, with Jira and TestRail for test management and bug tracking.",
  },
  {
    question: "Do you work remotely?",
    answer:
      "Yes. I've worked remotely with Edistys and genZsoft.Cloud, and on-site in Dhaka with Solutya. I'm based in Uttara, Dhaka, Bangladesh.",
  },
  {
    question: "How can I reach you?",
    answer:
      "Use the contact form on this page, email me at mohammadmunnamia0@gmail.com, or connect with me on LinkedIn.",
  },
];

export const DEFAULT_TESTIMONIALS = [];

export const DEFAULT_COLLECTIONS = {
  sections: DEFAULT_SECTIONS,
  projects: DEFAULT_PROJECTS,
  sqaProjects: DEFAULT_SQA_PROJECTS,
  experience: DEFAULT_EXPERIENCE,
  education: DEFAULT_EDUCATION,
  certifications: DEFAULT_CERTIFICATIONS,
  skills: DEFAULT_SKILLS,
  stats: DEFAULT_STATS,
  socials: DEFAULT_SOCIALS,
  faqs: DEFAULT_FAQS,
  testimonials: DEFAULT_TESTIMONIALS,
};

/** Shape returned by GET /api/content — also the offline fallback for the public site. */
export const DEFAULT_CONTENT = {
  profile: DEFAULT_PROFILE,
  ...Object.fromEntries(
    Object.entries(DEFAULT_COLLECTIONS).map(([name, items]) => [
      name,
      items.map((item, index) => ({ id: `${name}-${index}`, ...item })),
    ])
  ),
};
