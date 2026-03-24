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

export function seedIfEmpty() {
  if (!kv.get("projects")) kv.put("projects", JSON.stringify(DEFAULT_PROJECTS));
  if (!kv.get("experience")) kv.put("experience", JSON.stringify(DEFAULT_EXPERIENCE));
  if (!kv.get("about")) kv.put("about", JSON.stringify(DEFAULT_ABOUT));
  if (!kv.get("messages")) kv.put("messages", JSON.stringify([]));
}
