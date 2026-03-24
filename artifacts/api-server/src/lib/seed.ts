import { kv } from "./kv.js";

const DEFAULT_PROJECTS = [
  { id: "1", title: "Brand Identity", category: "Branding", description: "Logo and brand identity system for a local business.", imageUrl: "", link: "", gradient: "from-orange-400 to-rose-500", featured: true },
  { id: "2", title: "Mobile UI Design", category: "UI/UX", description: "User interface design for a mobile productivity app.", imageUrl: "", link: "", gradient: "from-blue-500 to-indigo-600", featured: false },
  { id: "3", title: "Creative Flyer", category: "Graphic Design", description: "Event promotional flyer with modern typography.", imageUrl: "", link: "", gradient: "from-emerald-400 to-cyan-500", featured: false },
  { id: "4", title: "Logo Design", category: "Branding", description: "Minimalist logo design for a tech startup.", imageUrl: "", link: "", gradient: "from-purple-500 to-fuchsia-600", featured: false },
  { id: "5", title: "Social Media Post", category: "Marketing", description: "Engaging social media graphics for Instagram campaigns.", imageUrl: "", link: "", gradient: "from-pink-500 to-rose-500", featured: false },
  { id: "6", title: "T-Shirt Design", category: "Merchandise", description: "Custom apparel design with bold graphic elements.", imageUrl: "", link: "", gradient: "from-amber-400 to-orange-500", featured: false },
];

const DEFAULT_EXPERIENCE = [
  { id: "1", company: "Facebook", role: "Ads Marketing", year: "Since 2015", description: "Specialized in social media advertising, campaign management, and content promotion targeting specific demographics to maximize engagement and ROI." },
  { id: "2", company: "YouTube", role: "Web Solution", year: "Since 2015", description: "Provided video content creation strategies and web solution consulting to optimize channel growth and digital presence." },
];

const DEFAULT_ABOUT = {
  bio: "I am a creative Graphic Designer and a curious student from Bangladesh. I love creating modern and clean designs, tackling challenges, and exploring new technologies. I specialize in logo design, UI/UX, and brand identity.",
};

const DEFAULT_HERO = {
  name: "Najmul Alam",
  greeting: "Hi, I'm",
  title: "Student & Graphic Designer",
  buttonPrimary: "Download CV",
  buttonSecondary: "View Work",
};

const DEFAULT_SKILLS = {
  core: [
    { id: "1", name: "Graphic Design", icon: "Palette", description: "Logo design, branding, flyers, social media" },
    { id: "2", name: "UI/UX Design", icon: "Layout", description: "Modern interfaces, wireframes, prototypes" },
    { id: "3", name: "Adobe Illustrator", icon: "PenTool", description: "Vector graphics, illustrations, icons" },
    { id: "4", name: "Adobe Photoshop", icon: "Image", description: "Photo editing, manipulation, compositing" },
  ],
  technical: [
    "Windows OS", "Microsoft Word", "Microsoft Excel", "Microsoft PowerPoint",
    "Google Workspace", "Canva", "Figma",
  ],
};

const DEFAULT_ABOUT_TABS = {
  education: [
    { id: "1", title: "SSC (Science)", institution: "Local High School", year: "2020", description: "Completed secondary education with science major." },
  ],
  languages: [
    { id: "1", name: "Bengali", level: "Native" },
    { id: "2", name: "English", level: "Intermediate" },
    { id: "3", name: "Hindi", level: "Basic" },
  ],
  extraCurricular: [
    { id: "1", activity: "Freelance Graphic Design", description: "Creating designs for local and international clients." },
  ],
};

export function seedIfEmpty() {
  if (!kv.get("projects")) kv.put("projects", JSON.stringify(DEFAULT_PROJECTS));
  if (!kv.get("experience")) kv.put("experience", JSON.stringify(DEFAULT_EXPERIENCE));
  if (!kv.get("about")) kv.put("about", JSON.stringify(DEFAULT_ABOUT));
  if (!kv.get("messages")) kv.put("messages", JSON.stringify([]));
  if (!kv.get("blog")) kv.put("blog", JSON.stringify([]));
  if (!kv.get("content:hero")) kv.put("content:hero", JSON.stringify(DEFAULT_HERO));
  if (!kv.get("content:skills")) kv.put("content:skills", JSON.stringify(DEFAULT_SKILLS));
  if (!kv.get("content:about-tabs")) kv.put("content:about-tabs", JSON.stringify(DEFAULT_ABOUT_TABS));
}
