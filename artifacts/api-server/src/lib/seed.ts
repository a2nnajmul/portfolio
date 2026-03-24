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

function calcReadTime(content: string): string {
  const words = content.trim().split(/\s+/).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min read`;
}

const DEFAULT_BLOG = [
  {
    id: "demo-1",
    title: "The Art of Minimalist Logo Design",
    description: "Discover the principles behind creating clean, memorable logos that stand the test of time. Less is more when it comes to brand identity.",
    content: "## Why Minimalism Works\n\nIn a world overflowing with visual noise, minimalist logos cut through the clutter. They are instantly recognizable, easily reproducible across media, and timeless in their appeal.\n\n## Core Principles\n\n- Simplicity: Remove everything that doesn't serve the message\n- Versatility: A great logo works at any size, in any color\n- Memorability: Simple shapes are easier to recall\n- Timelessness: Avoid trendy elements that will date quickly\n\n## The Design Process\n\nStart with research. Understand the brand's values, audience, and competition. Sketch dozens of concepts on paper before touching any software. The best logos often come from the simplest ideas.\n\n## Famous Examples\n\nThink about Nike's swoosh, Apple's apple, or FedEx's hidden arrow. These logos succeed because they distill complex brand stories into simple, powerful symbols.\n\n## Tips for Beginners\n\nDon't be afraid of white space. Let your design breathe. Test your logo in black and white first — if it works without color, it will work anywhere. Always design in vector format for scalability.",
    imageUrl: "https://images.unsplash.com/photo-1626785774573-4b799315345d?w=800&q=80",
    date: "2026-03-20",
    tags: ["Logo Design", "Branding", "Minimalism"],
    featured: true,
    createdAt: "2026-03-20T10:00:00Z",
    readTime: "",
  },
  {
    id: "demo-2",
    title: "Color Theory for Graphic Designers",
    description: "Understanding color psychology and how to create harmonious palettes that evoke the right emotions in your audience.",
    content: "## The Power of Color\n\nColor is one of the most powerful tools in a designer's arsenal. It can evoke emotions, create hierarchy, and guide the viewer's eye through a composition.\n\n## Understanding the Color Wheel\n\nThe color wheel is your best friend. Learn the relationships between colors:\n\n- Complementary: Colors opposite each other create high contrast\n- Analogous: Colors next to each other create harmony\n- Triadic: Three evenly spaced colors create vibrant combinations\n\n## Color Psychology\n\nDifferent colors evoke different feelings:\n\n- Red: Energy, passion, urgency\n- Blue: Trust, calm, professionalism\n- Green: Growth, nature, health\n- Orange: Creativity, enthusiasm, warmth\n- Purple: Luxury, creativity, wisdom\n\n## Building a Palette\n\nStart with one primary color that represents the brand. Add a secondary color for contrast. Include neutral tones for balance. Most effective palettes use 3-5 colors total.\n\n## Tools I Recommend\n\nAdobe Color, Coolors, and Colour Lovers are excellent resources for generating and testing color palettes. Always test your colors for accessibility — ensure sufficient contrast for readability.",
    imageUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?w=800&q=80",
    date: "2026-03-15",
    tags: ["Color Theory", "Design Basics", "Graphic Design"],
    featured: false,
    createdAt: "2026-03-15T14:00:00Z",
    readTime: "",
  },
  {
    id: "demo-3",
    title: "Getting Started with UI/UX Design",
    description: "A beginner-friendly guide to understanding user interface and user experience design fundamentals.",
    content: "## What is UI/UX Design?\n\nUI (User Interface) design focuses on the visual elements users interact with. UX (User Experience) design ensures those interactions are intuitive and enjoyable. Together, they create digital products people love to use.\n\n## The UX Design Process\n\n### 1. Research\nUnderstand your users through interviews, surveys, and competitor analysis. Create user personas that represent your target audience.\n\n### 2. Wireframing\nSketch low-fidelity layouts to establish structure and flow. Tools like Figma and Balsamiq make this process efficient.\n\n### 3. Prototyping\nBuild interactive mockups that simulate the final product. Test these with real users to identify pain points early.\n\n### 4. Visual Design\nApply color, typography, and imagery to bring wireframes to life. Maintain consistency with a design system.\n\n## Essential UI Principles\n\n- Consistency: Use the same patterns throughout\n- Hierarchy: Guide the eye with size, color, and spacing\n- Feedback: Let users know their actions were received\n- Accessibility: Design for everyone, including users with disabilities\n\n## My Favorite Tools\n\nFigma is my go-to for UI design. It's collaborative, web-based, and has an incredible community of plugins and resources.",
    imageUrl: "https://images.unsplash.com/photo-1561070791-2526d30994b5?w=800&q=80",
    date: "2026-03-10",
    tags: ["UI/UX", "Design", "Figma"],
    featured: false,
    createdAt: "2026-03-10T09:00:00Z",
    readTime: "",
  },
  {
    id: "demo-4",
    title: "Typography Tips Every Designer Should Know",
    description: "Master the art of typography with these essential tips for choosing, pairing, and using fonts effectively in your designs.",
    content: "## Why Typography Matters\n\nTypography is the backbone of design. It communicates mood, establishes hierarchy, and affects readability. Poor typography can ruin even the most beautiful layout.\n\n## Choosing the Right Font\n\nConsider the context:\n\n- Serif fonts (Times, Georgia): Traditional, trustworthy, elegant\n- Sans-serif fonts (Helvetica, Inter): Modern, clean, versatile\n- Display fonts: Headlines only, never body text\n- Monospace fonts: Code, technical content\n\n## Font Pairing Rules\n\n- Pair a serif with a sans-serif for contrast\n- Use fonts from the same family for subtle variation\n- Limit yourself to 2-3 fonts per project\n- Ensure sufficient contrast between heading and body fonts\n\n## Hierarchy and Sizing\n\nUse a type scale for consistency. Popular scales include 1.25 (minor third) and 1.333 (perfect fourth). This creates harmonious size relationships between headings, subheadings, and body text.\n\n## Spacing Matters\n\n- Line height: 1.5-1.75 for body text\n- Letter spacing: Slightly increase for uppercase text\n- Paragraph spacing: Use margin, not double line breaks\n\n## Pro Tips\n\nAlways left-align body text (centered text is hard to read in blocks). Use proper quotation marks and dashes. Test your typography at different screen sizes.",
    imageUrl: "https://images.unsplash.com/photo-1524578271613-d550eacf6090?w=800&q=80",
    date: "2026-03-05",
    tags: ["Typography", "Design Basics", "Fonts"],
    featured: false,
    createdAt: "2026-03-05T11:00:00Z",
    readTime: "",
  },
  {
    id: "demo-5",
    title: "Creating Stunning Social Media Graphics",
    description: "Learn how to design eye-catching social media posts that drive engagement and build your brand presence online.",
    content: "## Why Social Media Design Matters\n\nSocial media is visual-first. Posts with compelling graphics get significantly more engagement than text-only content. As a designer, this is where you can make an immediate impact.\n\n## Platform-Specific Sizes\n\nEach platform has optimal dimensions:\n\n- Instagram Post: 1080x1080px (square) or 1080x1350px (portrait)\n- Instagram Story: 1080x1920px\n- Facebook Post: 1200x630px\n- Twitter/X: 1600x900px\n- LinkedIn: 1200x627px\n\n## Design Principles for Social\n\n- Bold headlines: People scroll fast, grab their attention\n- Limited text: Keep copy concise and impactful\n- Brand consistency: Use your brand colors and fonts\n- High contrast: Ensure readability on mobile screens\n\n## Content Ideas\n\n- Behind-the-scenes of your design process\n- Before/after design transformations\n- Tips and quick tutorials\n- Client testimonials with designed backgrounds\n- Color palette inspiration posts\n\n## Tools for Quick Creation\n\nCanva is excellent for quick social media graphics. For more control, use Adobe Photoshop or Illustrator. Create templates you can reuse to maintain consistency across posts.\n\n## Batch Creating Content\n\nDesign a week's worth of content in one session. Create a template system with consistent layouts, then swap out content. This saves time and maintains visual cohesion.",
    imageUrl: "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=800&q=80",
    date: "2026-02-28",
    tags: ["Social Media", "Marketing", "Graphic Design"],
    featured: false,
    createdAt: "2026-02-28T16:00:00Z",
    readTime: "",
  },
  {
    id: "demo-6",
    title: "From Concept to Client: My Design Workflow",
    description: "A behind-the-scenes look at how I approach design projects from initial brief to final delivery.",
    content: "## My Design Process\n\nEvery successful design project follows a structured process. Here's how I approach each project from start to finish.\n\n## Step 1: Discovery\n\nBefore opening any design software, I spend time understanding the client's needs:\n\n- What problem does this design solve?\n- Who is the target audience?\n- What are the brand guidelines?\n- What does success look like?\n\n## Step 2: Research & Inspiration\n\nI browse Dribbble, Behance, and Pinterest for inspiration. I analyze competitors to understand the visual landscape. I create mood boards to align with the client on direction.\n\n## Step 3: Sketching\n\nI always start with pen and paper. Quick sketches help explore ideas rapidly without the constraints of software. I typically generate 20-30 rough concepts before narrowing down.\n\n## Step 4: Digital Execution\n\nUsing Adobe Illustrator for vector work and Photoshop for raster graphics, I bring the strongest concepts to life. I usually present 2-3 polished options to the client.\n\n## Step 5: Feedback & Revision\n\nClient feedback is crucial. I typically allow for 2-3 rounds of revisions. Clear communication here saves time and ensures satisfaction.\n\n## Step 6: Final Delivery\n\nI deliver files in multiple formats (AI, PDF, PNG, SVG) with a brand guidelines document. This ensures the client can use the designs consistently across all platforms.\n\n## Key Takeaway\n\nThe design itself is only part of the job. Communication, organization, and process management are equally important for delivering great work.",
    imageUrl: "https://images.unsplash.com/photo-1558655146-9f40138edfeb?w=800&q=80",
    date: "2026-02-20",
    tags: ["Workflow", "Freelance", "Design Process"],
    featured: true,
    createdAt: "2026-02-20T08:00:00Z",
    readTime: "",
  },
].map(post => ({ ...post, readTime: calcReadTime(post.content) }));

const DEFAULT_ADS = { enabled: false, headScript: "", adSlots: [] };

const DEFAULT_CONTACT = {
  heading: "Get In Touch",
  email: "a2nnajmul@gmail.com",
  phone: "(+880) 1793908183",
  location: "Panchua, Kapasia, 1743\nDhaka, Bangladesh",
  formHeading: "Send Me a Message",
};

export function seedIfEmpty() {
  if (!kv.get("projects")) kv.put("projects", JSON.stringify(DEFAULT_PROJECTS));
  if (!kv.get("experience")) kv.put("experience", JSON.stringify(DEFAULT_EXPERIENCE));
  if (!kv.get("about")) kv.put("about", JSON.stringify(DEFAULT_ABOUT));
  if (!kv.get("messages")) kv.put("messages", JSON.stringify([]));
  if (!kv.get("blog")) kv.put("blog", JSON.stringify(DEFAULT_BLOG));
  if (!kv.get("content:hero")) kv.put("content:hero", JSON.stringify(DEFAULT_HERO));
  if (!kv.get("content:skills")) kv.put("content:skills", JSON.stringify(DEFAULT_SKILLS));
  if (!kv.get("content:about-tabs")) kv.put("content:about-tabs", JSON.stringify(DEFAULT_ABOUT_TABS));
  if (!kv.get("content:contact")) kv.put("content:contact", JSON.stringify(DEFAULT_CONTACT));
  if (!kv.get("settings:ads")) kv.put("settings:ads", JSON.stringify(DEFAULT_ADS));
}
