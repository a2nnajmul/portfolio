import { useState, useEffect, type FormEvent } from "react";
import { adminFetch } from "@/lib/api";
import {
  LogOut, FolderOpen, Briefcase, User, Mail,
  Plus, Pencil, Trash2, Save, X, ChevronUp, ChevronDown,
  LayoutDashboard, FileText, FileDown, Palette, Settings, Menu,
  Eye, EyeOff, ExternalLink, Lock, Star, Tag, Megaphone,
} from "lucide-react";

type Tab = "dashboard" | "blog" | "cv" | "content" | "projects" | "experience" | "about" | "messages" | "settings";

interface Project {
  id: string; title: string; category: string; description: string;
  imageUrl: string; link: string; gradient: string; featured: boolean;
}
interface Experience {
  id: string; company: string; role: string; year: string; description: string;
}
interface About { bio: string; }
interface Message {
  id: string; name: string; email: string; message: string; createdAt: string; read?: boolean;
}
interface BlogPost {
  id: string; title: string; description: string; content: string;
  imageUrl: string; date: string; createdAt: string;
  tags?: string[]; featured?: boolean; readTime?: string;
}

const GRADIENTS = [
  "from-orange-400 to-rose-500", "from-blue-500 to-indigo-600",
  "from-emerald-400 to-cyan-500", "from-purple-500 to-fuchsia-600",
  "from-pink-500 to-rose-500", "from-amber-400 to-orange-500",
  "from-teal-400 to-green-500", "from-sky-400 to-blue-500",
];

const EMPTY_PROJECT: Omit<Project, "id"> = {
  title: "", category: "", description: "", imageUrl: "", link: "", gradient: GRADIENTS[0], featured: false,
};
const EMPTY_EXP: Omit<Experience, "id"> = {
  company: "", role: "", year: "", description: "",
};

const SIDEBAR_ITEMS: { id: Tab; label: string; icon: typeof LayoutDashboard; group?: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "blog", label: "Blog", icon: FileText, group: "Content" },
  { id: "cv", label: "CV Manager", icon: FileDown },
  { id: "content", label: "Content Editor", icon: Palette },
  { id: "projects", label: "Projects", icon: FolderOpen, group: "Manage" },
  { id: "experience", label: "Experience", icon: Briefcase },
  { id: "about", label: "About", icon: User },
  { id: "messages", label: "Messages", icon: Mail, group: "System" },
  { id: "settings", label: "Settings", icon: Settings },
];

interface Props { onLogout: () => void; }

export default function AdminDashboard({ onLogout }: Props) {
  const [tab, setTab] = useState<Tab>("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);

  function navigate(t: Tab) {
    setTab(t);
    setSidebarOpen(false);
  }

  let lastGroup = "";

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 -ml-2 rounded-lg hover:bg-muted transition"
          >
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-lg font-bold text-foreground">Najmul A<span className="text-primary">.</span></span>
          <span className="text-muted-foreground text-sm hidden sm:inline">Admin Dashboard</span>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition"
        >
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </header>

      <div className="flex">
        {sidebarOpen && (
          <div
            className="fixed inset-0 bg-black/40 z-20 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <nav className={`
          fixed md:sticky top-[65px] left-0 h-[calc(100vh-65px)] w-64 bg-card border-r border-border z-20
          overflow-y-auto transition-transform duration-200
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"} md:translate-x-0
        `}>
          <ul className="p-3 space-y-1">
            {SIDEBAR_ITEMS.map((item) => {
              const showGroup = item.group && item.group !== lastGroup;
              if (item.group) lastGroup = item.group;
              return (
                <li key={item.id}>
                  {showGroup && (
                    <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-3 pt-4 pb-1">
                      {item.group}
                    </p>
                  )}
                  <button
                    onClick={() => navigate(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                      tab === item.id
                        ? "bg-primary/10 text-primary"
                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    }`}
                  >
                    <item.icon className="w-4 h-4 flex-shrink-0" />
                    {item.label}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0">
          {tab === "dashboard" && <DashboardTab />}
          {tab === "blog" && <BlogTab />}
          {tab === "cv" && <CVTab />}
          {tab === "content" && <ContentTab />}
          {tab === "projects" && <ProjectsTab />}
          {tab === "experience" && <ExperienceTab />}
          {tab === "about" && <AboutTab />}
          {tab === "messages" && <MessagesTab />}
          {tab === "settings" && <SettingsTab />}
        </main>
      </div>
    </div>
  );
}

function DashboardTab() {
  const [stats, setStats] = useState({ posts: 0, unread: 0, projects: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      adminFetch<BlogPost[]>("/admin/blog").catch(() => []),
      adminFetch<Message[]>("/admin/messages").catch(() => []),
      adminFetch<Project[]>("/admin/projects").catch(() => []),
    ]).then(([blog, messages, projects]) => {
      setStats({
        posts: blog.length,
        unread: messages.filter((m) => !m.read).length,
        projects: projects.length,
      });
    }).finally(() => setLoading(false));
  }, []);

  const cards = [
    { label: "Blog Posts", value: stats.posts, icon: FileText, color: "text-blue-500 bg-blue-500/10" },
    { label: "Unread Messages", value: stats.unread, icon: Mail, color: "text-orange-500 bg-orange-500/10" },
    { label: "Projects", value: stats.projects, icon: FolderOpen, color: "text-emerald-500 bg-emerald-500/10" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Dashboard Overview</h2>
      {loading ? <p className="text-muted-foreground">Loading…</p> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((c) => (
            <div key={c.label} className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">{c.label}</span>
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${c.color}`}>
                  <c.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-3xl font-bold text-foreground">{c.value}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function BlogTab() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<BlogPost | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", content: "", imageUrl: "", date: "", tags: "" as string, featured: false });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch<BlogPost[]>("/admin/blog").then(setPosts).catch(() => setError("Failed to load")).finally(() => setLoading(false));
  }, []);

  function startCreate() {
    setForm({ title: "", description: "", content: "", imageUrl: "", date: new Date().toISOString().split("T")[0], tags: "", featured: false });
    setEditing(null); setCreating(true); setError("");
  }
  function startEdit(p: BlogPost) {
    setForm({ title: p.title, description: p.description, content: p.content, imageUrl: p.imageUrl, date: p.date, tags: (p.tags ?? []).join(", "), featured: p.featured ?? false });
    setEditing(p); setCreating(false); setError("");
  }
  function cancel() { setCreating(false); setEditing(null); setError(""); }

  function estimateReadTime(text: string): string {
    const words = text.trim().split(/\s+/).length;
    const mins = Math.max(1, Math.ceil(words / 200));
    return `${mins} min read`;
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required"); return; }
    setSaving(true); setError("");
    const payload = {
      title: form.title,
      description: form.description,
      content: form.content,
      imageUrl: form.imageUrl,
      date: form.date,
      tags: form.tags.split(",").map((t) => t.trim()).filter(Boolean),
      featured: form.featured,
    };
    try {
      if (editing) {
        const updated = await adminFetch<BlogPost>(`/admin/blog/${editing.id}`, { method: "PUT", body: JSON.stringify(payload) });
        setPosts((prev) => prev.map((p) => p.id === updated.id ? updated : p));
      } else {
        const created = await adminFetch<BlogPost>("/admin/blog", { method: "POST", body: JSON.stringify(payload) });
        setPosts((prev) => [created, ...prev]);
      }
      cancel();
    } catch { setError("Save failed"); }
    finally { setSaving(false); }
  }

  async function del(id: string) {
    if (!confirm("Delete this blog post?")) return;
    await adminFetch(`/admin/blog/${id}`, { method: "DELETE" });
    setPosts((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Blog Posts</h2>
        <button onClick={startCreate} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition">
          <Plus className="w-4 h-4" /> New Post
        </button>
      </div>

      {error && <p role="alert" className="mb-4 text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">{error}</p>}

      {(creating || editing) && (
        <div className="mb-8 bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold text-foreground mb-4">{creating ? "New Blog Post" : "Edit Blog Post"}</h3>
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <Field label="Title *" value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} />
            <Field label="Date" value={form.date} onChange={(v) => setForm((f) => ({ ...f, date: v }))} placeholder="YYYY-MM-DD" />
            <div className="sm:col-span-2">
              <Field label="Description" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} multiline />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-foreground mb-1.5">Content</label>
              <textarea
                value={form.content}
                onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                rows={12}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition resize-y font-mono text-sm"
                placeholder="Write your blog post content here..."
              />
              <div className="mt-2 flex items-center justify-between">
                <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span><code className="bg-muted px-1.5 py-0.5 rounded"># Heading</code></span>
                  <span><code className="bg-muted px-1.5 py-0.5 rounded">## Subheading</code></span>
                  <span><code className="bg-muted px-1.5 py-0.5 rounded">### Section</code></span>
                  <span><code className="bg-muted px-1.5 py-0.5 rounded">- List item</code></span>
                  <span>Empty line = paragraph break</span>
                </div>
                {form.content.trim() && (
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-4">{estimateReadTime(form.content)}</span>
                )}
              </div>
            </div>
            <Field label="Tags" value={form.tags} onChange={(v) => setForm((f) => ({ ...f, tags: v }))} placeholder="Design, Branding, Tips (comma-separated)" />
            <Field label="Image URL" value={form.imageUrl} onChange={(v) => setForm((f) => ({ ...f, imageUrl: v }))} placeholder="https://…" />
            <div className="sm:col-span-2">
              <label className="flex items-center gap-3 cursor-pointer">
                <div
                  onClick={() => setForm((f) => ({ ...f, featured: !f.featured }))}
                  className={`relative w-11 h-6 rounded-full transition-colors ${form.featured ? "bg-primary" : "bg-muted"}`}
                >
                  <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${form.featured ? "translate-x-5" : ""}`} />
                </div>
                <span className="text-sm font-medium text-foreground flex items-center gap-2">
                  <Star className={`w-4 h-4 ${form.featured ? "text-primary fill-primary" : "text-muted-foreground"}`} />
                  Featured Post
                </span>
              </label>
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-60 transition">
                <Save className="w-4 h-4" />{saving ? "Saving…" : "Save"}
              </button>
              <button type="button" onClick={cancel} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-muted transition">
                <X className="w-4 h-4" />Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? <p className="text-muted-foreground">Loading…</p> : posts.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No blog posts yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {posts.map((p) => (
            <div key={p.id} className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    {p.featured && <Star className="w-4 h-4 text-primary fill-primary flex-shrink-0" />}
                    <h3 className="font-bold text-foreground text-lg truncate">{p.title}</h3>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <span>{p.date}</span>
                    {p.readTime && <span>{p.readTime}</span>}
                  </div>
                </div>
                <div className="flex gap-2 flex-shrink-0">
                  <button onClick={() => startEdit(p)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition">
                    <Pencil className="w-3 h-3" />Edit
                  </button>
                  <button onClick={() => del(p.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive text-xs font-medium hover:bg-destructive/10 transition">
                    <Trash2 className="w-3 h-3" />Delete
                  </button>
                </div>
              </div>
              <p className="text-muted-foreground text-sm line-clamp-2 mb-2">{p.description}</p>
              {p.tags && p.tags.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {p.tags.map((tag) => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs">
                      <Tag className="w-2.5 h-2.5" />{tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function CVTab() {
  const [url, setUrl] = useState("");
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch<{ url: string }>("/admin/cv")
      .then((d) => { setUrl(d.url); setInput(d.url); })
      .catch(() => setError("Failed to load"))
      .finally(() => setLoading(false));
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true); setError(""); setSaved(false);
    try {
      const updated = await adminFetch<{ url: string }>("/admin/cv", { method: "PUT", body: JSON.stringify({ url: input }) });
      setUrl(updated.url);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { setError("Save failed"); }
    finally { setSaving(false); }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-foreground mb-6">CV Manager</h2>
      {error && <p role="alert" className="mb-4 text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">{error}</p>}
      {loading ? <p className="text-muted-foreground">Loading…</p> : (
        <div className="bg-card border border-border rounded-2xl p-6 space-y-4">
          {url && (
            <div className="flex items-center gap-3 p-3 bg-muted/50 rounded-xl">
              <FileDown className="w-5 h-5 text-primary flex-shrink-0" />
              <span className="text-sm text-foreground truncate flex-1">{url}</span>
              <a href={url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-primary hover:underline flex-shrink-0">
                <ExternalLink className="w-3 h-3" />Preview
              </a>
            </div>
          )}
          <form onSubmit={save} className="space-y-4">
            <Field label="CV File URL" value={input} onChange={setInput} placeholder="https://example.com/cv.pdf" />
            <div className="flex items-center gap-4">
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-60 transition">
                <Save className="w-4 h-4" />{saving ? "Saving…" : "Update CV"}
              </button>
              {saved && <span className="text-sm text-green-600 dark:text-green-400">Updated!</span>}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

type ContentSubTab = "hero" | "skills" | "about-tabs";

function ContentTab() {
  const [subTab, setSubTab] = useState<ContentSubTab>("hero");

  const subTabs: { id: ContentSubTab; label: string }[] = [
    { id: "hero", label: "Hero" },
    { id: "skills", label: "Skills" },
    { id: "about-tabs", label: "About Tabs" },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Content Editor</h2>
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {subTabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition ${
              subTab === t.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {subTab === "hero" && <HeroEditor />}
      {subTab === "skills" && <SkillsEditor />}
      {subTab === "about-tabs" && <AboutTabsEditor />}
    </div>
  );
}

interface HeroContent {
  name: string; greeting: string; title: string; buttonPrimary: string; buttonSecondary: string;
}

function HeroEditor() {
  const [data, setData] = useState<HeroContent>({ name: "", greeting: "", title: "", buttonPrimary: "", buttonSecondary: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch<HeroContent>("/admin/content/hero").then(setData).catch(() => setError("Failed to load")).finally(() => setLoading(false));
  }, []);

  async function save(e: FormEvent) {
    e.preventDefault();
    setSaving(true); setError(""); setSaved(false);
    try {
      const updated = await adminFetch<HeroContent>("/admin/content/hero", { method: "PUT", body: JSON.stringify(data) });
      setData(updated); setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { setError("Save failed"); }
    finally { setSaving(false); }
  }

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div className="max-w-2xl">
      {error && <p role="alert" className="mb-4 text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">{error}</p>}
      <form onSubmit={save} className="bg-card border border-border rounded-2xl p-6 space-y-4">
        <Field label="Greeting" value={data.greeting} onChange={(v) => setData((d) => ({ ...d, greeting: v }))} placeholder="Hi, I'm" />
        <Field label="Name" value={data.name} onChange={(v) => setData((d) => ({ ...d, name: v }))} />
        <Field label="Title / Subtitle" value={data.title} onChange={(v) => setData((d) => ({ ...d, title: v }))} placeholder="Student & Graphic Designer" />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Primary Button" value={data.buttonPrimary} onChange={(v) => setData((d) => ({ ...d, buttonPrimary: v }))} />
          <Field label="Secondary Button" value={data.buttonSecondary} onChange={(v) => setData((d) => ({ ...d, buttonSecondary: v }))} />
        </div>
        <div className="flex items-center gap-4 pt-2">
          <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-60 transition">
            <Save className="w-4 h-4" />{saving ? "Saving…" : "Save"}
          </button>
          {saved && <span className="text-sm text-green-600 dark:text-green-400">Saved!</span>}
        </div>
      </form>
    </div>
  );
}

interface SkillItem { id: string; name: string; icon: string; description: string; }
interface SkillsContent { core: SkillItem[]; technical: string[]; }

function SkillsEditor() {
  const [data, setData] = useState<SkillsContent>({ core: [], technical: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [newTech, setNewTech] = useState("");

  useEffect(() => {
    adminFetch<SkillsContent>("/admin/content/skills").then(setData).catch(() => setError("Failed to load")).finally(() => setLoading(false));
  }, []);

  function addCore() {
    setData((d) => ({ ...d, core: [...d.core, { id: crypto.randomUUID(), name: "", icon: "Star", description: "" }] }));
  }
  function updateCore(id: string, field: keyof SkillItem, value: string) {
    setData((d) => ({ ...d, core: d.core.map((s) => s.id === id ? { ...s, [field]: value } : s) }));
  }
  function removeCore(id: string) {
    setData((d) => ({ ...d, core: d.core.filter((s) => s.id !== id) }));
  }
  function moveCore(id: string, dir: "up" | "down") {
    setData((d) => {
      const idx = d.core.findIndex((s) => s.id === id);
      if (dir === "up" && idx === 0) return d;
      if (dir === "down" && idx === d.core.length - 1) return d;
      const next = [...d.core];
      const swapIdx = dir === "up" ? idx - 1 : idx + 1;
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return { ...d, core: next };
    });
  }
  function moveTech(idx: number, dir: "up" | "down") {
    setData((d) => {
      if (dir === "up" && idx === 0) return d;
      if (dir === "down" && idx === d.technical.length - 1) return d;
      const next = [...d.technical];
      const swapIdx = dir === "up" ? idx - 1 : idx + 1;
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return { ...d, technical: next };
    });
  }
  function addTech() {
    if (!newTech.trim()) return;
    setData((d) => ({ ...d, technical: [...d.technical, newTech.trim()] }));
    setNewTech("");
  }
  function removeTech(idx: number) {
    setData((d) => ({ ...d, technical: d.technical.filter((_, i) => i !== idx) }));
  }

  async function save() {
    setSaving(true); setError(""); setSaved(false);
    try {
      const updated = await adminFetch<SkillsContent>("/admin/content/skills", { method: "PUT", body: JSON.stringify(data) });
      setData(updated); setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { setError("Save failed"); }
    finally { setSaving(false); }
  }

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div>
      {error && <p role="alert" className="mb-4 text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">{error}</p>}

      <h3 className="font-semibold text-foreground mb-4">Core Skills</h3>
      <div className="space-y-4 mb-6">
        {data.core.map((s, i) => (
          <div key={s.id} className="bg-card border border-border rounded-2xl p-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">#{i + 1}</span>
              <div className="flex gap-2">
                <button onClick={() => moveCore(s.id, "up")} disabled={i === 0} className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 transition"><ChevronUp className="w-4 h-4" /></button>
                <button onClick={() => moveCore(s.id, "down")} disabled={i === data.core.length - 1} className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 transition"><ChevronDown className="w-4 h-4" /></button>
                <button onClick={() => removeCore(s.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition"><Trash2 className="w-4 h-4" /></button>
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Field label="Name" value={s.name} onChange={(v) => updateCore(s.id, "name", v)} />
              <Field label="Icon" value={s.icon} onChange={(v) => updateCore(s.id, "icon", v)} placeholder="Palette, Layout, PenTool…" />
              <Field label="Description" value={s.description} onChange={(v) => updateCore(s.id, "description", v)} />
            </div>
          </div>
        ))}
        <button onClick={addCore} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition">
          <Plus className="w-4 h-4" />Add Core Skill
        </button>
      </div>

      <h3 className="font-semibold text-foreground mb-4">Technical & Office Skills</h3>
      <div className="flex flex-wrap gap-2 mb-3">
        {data.technical.map((t, i) => (
          <span key={i} className="inline-flex items-center gap-1 px-3 py-1.5 bg-muted rounded-full text-sm">
            <button onClick={() => moveTech(i, "up")} disabled={i === 0} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ChevronUp className="w-3 h-3" /></button>
            {t}
            <button onClick={() => moveTech(i, "down")} disabled={i === data.technical.length - 1} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ChevronDown className="w-3 h-3" /></button>
            <button onClick={() => removeTech(i)} className="text-muted-foreground hover:text-destructive ml-0.5">
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2 mb-6">
        <input
          type="text"
          value={newTech}
          onChange={(e) => setNewTech(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTech())}
          placeholder="Add skill…"
          className="flex-1 px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
        />
        <button onClick={addTech} className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition">Add</button>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={save} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-60 transition">
          <Save className="w-4 h-4" />{saving ? "Saving…" : "Save All Skills"}
        </button>
        {saved && <span className="text-sm text-green-600 dark:text-green-400">Saved!</span>}
      </div>
    </div>
  );
}

interface EducationItem { id: string; title: string; institution: string; year: string; description: string; }
interface LanguageItem { id: string; name: string; level: string; }
interface ExtraCurricularItem { id: string; activity: string; description: string; }
interface AboutTabsContent {
  education: EducationItem[];
  languages: LanguageItem[];
  extraCurricular: ExtraCurricularItem[];
}

function AboutTabsEditor() {
  const [data, setData] = useState<AboutTabsContent>({ education: [], languages: [], extraCurricular: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch<AboutTabsContent>("/admin/content/about-tabs").then(setData).catch(() => setError("Failed to load")).finally(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true); setError(""); setSaved(false);
    try {
      const updated = await adminFetch<AboutTabsContent>("/admin/content/about-tabs", { method: "PUT", body: JSON.stringify(data) });
      setData(updated); setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { setError("Save failed"); }
    finally { setSaving(false); }
  }

  if (loading) return <p className="text-muted-foreground">Loading…</p>;

  return (
    <div>
      {error && <p role="alert" className="mb-4 text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">{error}</p>}

      <h3 className="font-semibold text-foreground mb-4">Education & Training</h3>
      <div className="space-y-3 mb-4">
        {data.education.map((e) => (
          <div key={e.id} className="bg-card border border-border rounded-2xl p-4 grid gap-3 sm:grid-cols-3">
            <Field label="Title" value={e.title} onChange={(v) => setData((d) => ({ ...d, education: d.education.map((x) => x.id === e.id ? { ...x, title: v } : x) }))} />
            <Field label="Institution" value={e.institution} onChange={(v) => setData((d) => ({ ...d, education: d.education.map((x) => x.id === e.id ? { ...x, institution: v } : x) }))} />
            <Field label="Year" value={e.year} onChange={(v) => setData((d) => ({ ...d, education: d.education.map((x) => x.id === e.id ? { ...x, year: v } : x) }))} />
            <div className="sm:col-span-3">
              <Field label="Description" value={e.description} onChange={(v) => setData((d) => ({ ...d, education: d.education.map((x) => x.id === e.id ? { ...x, description: v } : x) }))} />
            </div>
            <button onClick={() => setData((d) => ({ ...d, education: d.education.filter((x) => x.id !== e.id) }))} className="text-xs text-destructive hover:underline flex items-center gap-1"><Trash2 className="w-3 h-3" />Remove</button>
          </div>
        ))}
        <button onClick={() => setData((d) => ({ ...d, education: [...d.education, { id: crypto.randomUUID(), title: "", institution: "", year: "", description: "" }] }))} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition">
          <Plus className="w-4 h-4" />Add Education
        </button>
      </div>

      <h3 className="font-semibold text-foreground mb-4 mt-8">Languages</h3>
      <div className="space-y-3 mb-4">
        {data.languages.map((l) => (
          <div key={l.id} className="bg-card border border-border rounded-2xl p-4 flex gap-3 items-end">
            <div className="flex-1"><Field label="Language" value={l.name} onChange={(v) => setData((d) => ({ ...d, languages: d.languages.map((x) => x.id === l.id ? { ...x, name: v } : x) }))} /></div>
            <div className="flex-1"><Field label="Level" value={l.level} onChange={(v) => setData((d) => ({ ...d, languages: d.languages.map((x) => x.id === l.id ? { ...x, level: v } : x) }))} /></div>
            <button onClick={() => setData((d) => ({ ...d, languages: d.languages.filter((x) => x.id !== l.id) }))} className="p-2 text-destructive hover:bg-destructive/10 rounded-lg mb-0.5"><Trash2 className="w-4 h-4" /></button>
          </div>
        ))}
        <button onClick={() => setData((d) => ({ ...d, languages: [...d.languages, { id: crypto.randomUUID(), name: "", level: "" }] }))} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition">
          <Plus className="w-4 h-4" />Add Language
        </button>
      </div>

      <h3 className="font-semibold text-foreground mb-4 mt-8">Extra-Curricular</h3>
      <div className="space-y-3 mb-6">
        {data.extraCurricular.map((ec) => (
          <div key={ec.id} className="bg-card border border-border rounded-2xl p-4 grid gap-3 sm:grid-cols-2">
            <Field label="Activity" value={ec.activity} onChange={(v) => setData((d) => ({ ...d, extraCurricular: d.extraCurricular.map((x) => x.id === ec.id ? { ...x, activity: v } : x) }))} />
            <Field label="Description" value={ec.description} onChange={(v) => setData((d) => ({ ...d, extraCurricular: d.extraCurricular.map((x) => x.id === ec.id ? { ...x, description: v } : x) }))} />
            <button onClick={() => setData((d) => ({ ...d, extraCurricular: d.extraCurricular.filter((x) => x.id !== ec.id) }))} className="text-xs text-destructive hover:underline flex items-center gap-1"><Trash2 className="w-3 h-3" />Remove</button>
          </div>
        ))}
        <button onClick={() => setData((d) => ({ ...d, extraCurricular: [...d.extraCurricular, { id: crypto.randomUUID(), activity: "", description: "" }] }))} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition">
          <Plus className="w-4 h-4" />Add Activity
        </button>
      </div>

      <div className="flex items-center gap-4">
        <button onClick={save} disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-60 transition">
          <Save className="w-4 h-4" />{saving ? "Saving…" : "Save All"}
        </button>
        {saved && <span className="text-sm text-green-600 dark:text-green-400">Saved!</span>}
      </div>
    </div>
  );
}

function ProjectsTab() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Project | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<Omit<Project, "id">>(EMPTY_PROJECT);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch<Project[]>("/admin/projects").then(setProjects).catch(() => setError("Failed to load projects")).finally(() => setLoading(false));
  }, []);

  function startCreate() { setForm(EMPTY_PROJECT); setEditing(null); setCreating(true); setError(""); }
  function startEdit(p: Project) { const { id: _id, ...rest } = p; setForm(rest); setEditing(p); setCreating(false); setError(""); }
  function cancel() { setCreating(false); setEditing(null); setError(""); }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!form.title.trim()) { setError("Title is required"); return; }
    setSaving(true); setError("");
    try {
      if (editing) {
        const updated = await adminFetch<Project>(`/admin/projects/${editing.id}`, { method: "PUT", body: JSON.stringify(form) });
        setProjects((prev) => prev.map((p) => p.id === updated.id ? updated : p));
      } else {
        const created = await adminFetch<Project>("/admin/projects", { method: "POST", body: JSON.stringify(form) });
        setProjects((prev) => [...prev, created]);
      }
      cancel();
    } catch { setError("Save failed"); }
    finally { setSaving(false); }
  }

  async function del(id: string) {
    if (!confirm("Delete this project?")) return;
    await adminFetch(`/admin/projects/${id}`, { method: "DELETE" });
    setProjects((prev) => prev.filter((p) => p.id !== id));
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Projects</h2>
        <button onClick={startCreate} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 transition">
          <Plus className="w-4 h-4" /> Add Project
        </button>
      </div>

      {error && <p role="alert" className="mb-4 text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">{error}</p>}

      {(creating || editing) && (
        <div className="mb-8 bg-card border border-border rounded-2xl p-6">
          <h3 className="font-semibold text-foreground mb-4">{creating ? "New Project" : "Edit Project"}</h3>
          <form onSubmit={save} className="grid gap-4 sm:grid-cols-2">
            <Field label="Title *" value={form.title} onChange={(v) => setForm((f) => ({ ...f, title: v }))} />
            <Field label="Category" value={form.category} onChange={(v) => setForm((f) => ({ ...f, category: v }))} />
            <div className="sm:col-span-2">
              <Field label="Description" value={form.description} onChange={(v) => setForm((f) => ({ ...f, description: v }))} multiline />
            </div>
            <Field label="Image URL" value={form.imageUrl} onChange={(v) => setForm((f) => ({ ...f, imageUrl: v }))} placeholder="https://…" />
            <Field label="Project Link" value={form.link} onChange={(v) => setForm((f) => ({ ...f, link: v }))} placeholder="https://…" />
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Gradient</label>
              <select
                value={form.gradient}
                onChange={(e) => setForm((f) => ({ ...f, gradient: e.target.value }))}
                className="w-full px-3 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
              >
                {GRADIENTS.map((g) => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-3 pt-6">
              <input type="checkbox" id="featured" checked={form.featured} onChange={(e) => setForm((f) => ({ ...f, featured: e.target.checked }))} className="w-4 h-4 accent-primary" />
              <label htmlFor="featured" className="text-sm font-medium text-foreground">Featured</label>
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-2">
              <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-60 transition">
                <Save className="w-4 h-4" />{saving ? "Saving…" : "Save"}
              </button>
              <button type="button" onClick={cancel} className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-foreground font-medium text-sm hover:bg-muted transition">
                <X className="w-4 h-4" />Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? <p className="text-muted-foreground">Loading…</p> : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((p) => (
            <div key={p.id} className="bg-card border border-border rounded-2xl overflow-hidden">
              <div className={`h-20 bg-gradient-to-br ${p.gradient} relative`}>
                {p.featured && <span className="absolute top-2 left-2 text-[10px] font-bold bg-white/20 backdrop-blur text-white px-2 py-0.5 rounded-full">Featured</span>}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-1">
                  <h3 className="font-bold text-foreground leading-tight">{p.title}</h3>
                  <span className="text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full whitespace-nowrap">{p.category}</span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 mb-3">{p.description}</p>
                <div className="flex gap-2">
                  <button onClick={() => startEdit(p)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition">
                    <Pencil className="w-3 h-3" />Edit
                  </button>
                  <button onClick={() => del(p.id)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-destructive/30 text-destructive text-xs font-medium hover:bg-destructive/10 transition">
                    <Trash2 className="w-3 h-3" />Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ExperienceTab() {
  const [items, setItems] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch<Experience[]>("/admin/experience").then(setItems).catch(() => setError("Failed to load")).finally(() => setLoading(false));
  }, []);

  function addItem() { setItems((prev) => [...prev, { id: crypto.randomUUID(), ...EMPTY_EXP }]); }
  function updateItem(id: string, field: keyof Experience, value: string) { setItems((prev) => prev.map((i) => i.id === id ? { ...i, [field]: value } : i)); }
  function removeItem(id: string) { setItems((prev) => prev.filter((i) => i.id !== id)); }

  function moveItem(id: string, dir: "up" | "down") {
    setItems((prev) => {
      const idx = prev.findIndex((i) => i.id === id);
      if (dir === "up" && idx === 0) return prev;
      if (dir === "down" && idx === prev.length - 1) return prev;
      const next = [...prev];
      const swapIdx = dir === "up" ? idx - 1 : idx + 1;
      [next[idx], next[swapIdx]] = [next[swapIdx], next[idx]];
      return next;
    });
  }

  async function save() {
    setSaving(true); setError("");
    try {
      const saved = await adminFetch<Experience[]>("/admin/experience", { method: "PUT", body: JSON.stringify(items) });
      setItems(saved);
    } catch { setError("Save failed"); }
    finally { setSaving(false); }
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-foreground">Experience</h2>
        <div className="flex gap-3">
          <button onClick={addItem} className="flex items-center gap-2 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition">
            <Plus className="w-4 h-4" />Add
          </button>
          <button onClick={save} disabled={saving} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition">
            <Save className="w-4 h-4" />{saving ? "Saving…" : "Save All"}
          </button>
        </div>
      </div>

      {error && <p role="alert" className="mb-4 text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">{error}</p>}

      {loading ? <p className="text-muted-foreground">Loading…</p> : (
        <div className="space-y-4">
          {items.map((item, i) => (
            <div key={item.id} className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium text-muted-foreground">#{i + 1}</span>
                <div className="flex gap-2">
                  <button onClick={() => moveItem(item.id, "up")} disabled={i === 0} className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 transition"><ChevronUp className="w-4 h-4" /></button>
                  <button onClick={() => moveItem(item.id, "down")} disabled={i === items.length - 1} className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 transition"><ChevronDown className="w-4 h-4" /></button>
                  <button onClick={() => removeItem(item.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Field label="Company" value={item.company} onChange={(v) => updateItem(item.id, "company", v)} />
                <Field label="Role" value={item.role} onChange={(v) => updateItem(item.id, "role", v)} />
                <Field label="Year" value={item.year} onChange={(v) => updateItem(item.id, "year", v)} placeholder="Since 2020" />
                <div className="sm:col-span-3">
                  <Field label="Description" value={item.description} onChange={(v) => updateItem(item.id, "description", v)} multiline />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function AboutTab() {
  const [about, setAbout] = useState<About>({ bio: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch<About>("/admin/about").then(setAbout).catch(() => setError("Failed to load")).finally(() => setLoading(false));
  }, []);

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSaving(true); setError(""); setSaved(false);
    try {
      const updated = await adminFetch<About>("/admin/about", { method: "PUT", body: JSON.stringify(about) });
      setAbout(updated); setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch { setError("Save failed"); }
    finally { setSaving(false); }
  }

  return (
    <div className="max-w-2xl">
      <h2 className="text-2xl font-bold text-foreground mb-6">About</h2>
      {error && <p role="alert" className="mb-4 text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">{error}</p>}
      {loading ? <p className="text-muted-foreground">Loading…</p> : (
        <form onSubmit={handleSave} className="bg-card border border-border rounded-2xl p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Bio text</label>
            <textarea
              value={about.bio}
              onChange={(e) => setAbout({ bio: e.target.value })}
              rows={6}
              maxLength={2000}
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y"
            />
            <p className="text-xs text-muted-foreground mt-1 text-right">{about.bio.length}/2000</p>
          </div>
          <div className="flex items-center gap-4">
            <button type="submit" disabled={saving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-60 transition">
              <Save className="w-4 h-4" />{saving ? "Saving…" : "Save"}
            </button>
            {saved && <span className="text-sm text-green-600 dark:text-green-400">Saved!</span>}
          </div>
        </form>
      )}
    </div>
  );
}

function MessagesTab() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    adminFetch<Message[]>("/admin/messages").then(setMessages).catch(() => setError("Failed to load")).finally(() => setLoading(false));
  }, []);

  async function del(id: string) {
    if (!confirm("Delete this message?")) return;
    await adminFetch(`/admin/messages/${id}`, { method: "DELETE" });
    setMessages((prev) => prev.filter((m) => m.id !== id));
  }

  async function toggleRead(id: string) {
    try {
      const updated = await adminFetch<Message>(`/admin/messages/${id}/read`, { method: "PUT", body: JSON.stringify({}) });
      setMessages((prev) => prev.map((m) => m.id === id ? updated : m));
    } catch { /* silent */ }
  }

  const unreadCount = messages.filter((m) => !m.read).length;

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-1">Messages ({messages.length})</h2>
      {unreadCount > 0 && <p className="text-sm text-primary mb-6">{unreadCount} unread</p>}
      {!unreadCount && <div className="mb-6" />}
      {error && <p role="alert" className="mb-4 text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">{error}</p>}
      {loading ? <p className="text-muted-foreground">Loading…</p> : messages.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Mail className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No messages yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className={`bg-card border rounded-2xl p-6 ${!m.read ? "border-primary/30 bg-primary/[0.02]" : "border-border"}`}>
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className={`text-foreground ${!m.read ? "font-bold" : "font-medium"}`}>{m.name}</p>
                    {!m.read && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />}
                  </div>
                  <p className="text-sm text-primary">{m.email}</p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <p className="text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleDateString()}</p>
                  <button onClick={() => toggleRead(m.id)} className="p-1.5 rounded-lg hover:bg-muted transition" title={m.read ? "Mark unread" : "Mark read"}>
                    {m.read ? <EyeOff className="w-4 h-4 text-muted-foreground" /> : <Eye className="w-4 h-4 text-primary" />}
                  </button>
                  <button onClick={() => del(m.id)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-destructive transition">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{m.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SettingsTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const [adsEnabled, setAdsEnabled] = useState(false);
  const [headScript, setHeadScript] = useState("");
  const [adUnitCode, setAdUnitCode] = useState("");
  const [adsSaving, setAdsSaving] = useState(false);
  const [adsError, setAdsError] = useState("");
  const [adsSaved, setAdsSaved] = useState(false);
  const [adsLoading, setAdsLoading] = useState(true);

  useEffect(() => {
    adminFetch<{ enabled: boolean; headScript: string; adUnitCode: string }>("/admin/settings/ads")
      .then((d) => { setAdsEnabled(d.enabled); setHeadScript(d.headScript); setAdUnitCode(d.adUnitCode); })
      .catch(() => {})
      .finally(() => setAdsLoading(false));
  }, []);

  async function saveAds(e: FormEvent) {
    e.preventDefault();
    setAdsSaving(true); setAdsError(""); setAdsSaved(false);
    try {
      const updated = await adminFetch<{ enabled: boolean; headScript: string; adUnitCode: string }>(
        "/admin/settings/ads",
        { method: "PUT", body: JSON.stringify({ enabled: adsEnabled, headScript, adUnitCode }) }
      );
      setAdsEnabled(updated.enabled);
      setHeadScript(updated.headScript);
      setAdUnitCode(updated.adUnitCode);
      setAdsSaved(true);
      setTimeout(() => setAdsSaved(false), 3000);
    } catch { setAdsError("Failed to save ad settings"); }
    finally { setAdsSaving(false); }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(""); setSuccess(false);

    if (newPassword.length < 6) { setError("New password must be at least 6 characters"); return; }
    if (newPassword !== confirmPassword) { setError("Passwords do not match"); return; }

    setSaving(true);
    try {
      const { apiUrl, adminHeaders } = await import("@/lib/api");
      const res = await fetch(apiUrl("/admin/password"), {
        method: "PUT",
        headers: adminHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      const data = await res.json() as { success?: boolean; token?: string; error?: string };
      if (!res.ok) {
        setError(res.status === 401 ? "Current password is incorrect" : (data.error || "Failed to change password"));
        return;
      }
      if (data.token) {
        localStorage.setItem("admin_token", data.token);
      }
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
      setSuccess(true);
      setTimeout(() => setSuccess(false), 5000);
    } catch {
      setError("Failed to change password");
    }
    finally { setSaving(false); }
  }

  return (
    <div className="max-w-2xl space-y-8">
      <h2 className="text-2xl font-bold text-foreground">Settings</h2>

      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center">
            <Megaphone className="w-5 h-5 text-orange-500" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Ad Management</h3>
            <p className="text-xs text-muted-foreground">Paste your Google AdSense code here. Ads will appear automatically on all blog posts.</p>
          </div>
        </div>

        {adsLoading ? <p className="text-muted-foreground text-sm">Loading…</p> : (
          <form onSubmit={saveAds} className="space-y-5">
            <div className="flex items-center gap-3">
              <div
                onClick={() => setAdsEnabled(!adsEnabled)}
                className={`relative w-11 h-6 rounded-full transition-colors cursor-pointer ${adsEnabled ? "bg-primary" : "bg-muted"}`}
              >
                <div className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform ${adsEnabled ? "translate-x-5" : ""}`} />
              </div>
              <span className="text-sm font-medium text-foreground">{adsEnabled ? "Ads Enabled" : "Ads Disabled"}</span>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">AdSense Head Script</label>
              <textarea
                value={headScript}
                onChange={(e) => setHeadScript(e.target.value)}
                rows={3}
                placeholder={'<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXX" crossorigin="anonymous"></script>'}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition resize-y font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground mt-1">The AdSense script tag from your Google AdSense account. This loads the ad library.</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">Ad Unit Code</label>
              <textarea
                value={adUnitCode}
                onChange={(e) => setAdUnitCode(e.target.value)}
                rows={4}
                placeholder={'<ins class="adsbygoogle"\n  style="display:block"\n  data-ad-client="ca-pub-XXXXXX"\n  data-ad-slot="YYYYYYY"\n  data-ad-format="auto"></ins>\n<script>(adsbygoogle = window.adsbygoogle || []).push({});</script>'}
                className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition resize-y font-mono text-xs"
              />
              <p className="text-xs text-muted-foreground mt-1">The ad unit HTML block. This will be inserted into blog posts automatically.</p>
            </div>

            <div className="bg-muted/50 rounded-xl p-4 text-xs text-muted-foreground space-y-1">
              <p className="font-medium text-foreground text-sm">Ad Placement Preview</p>
              <p>Ads will appear in two positions on each blog post:</p>
              <p>1. After the post header (title, tags, description)</p>
              <p>2. Before the recommended posts section</p>
            </div>

            {adsError && <p role="alert" className="text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">{adsError}</p>}

            <div className="flex items-center gap-4">
              <button type="submit" disabled={adsSaving} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-60 transition">
                <Save className="w-4 h-4" />{adsSaving ? "Saving…" : "Save Ad Settings"}
              </button>
              {adsSaved && <span className="text-sm text-green-600 dark:text-green-400">Saved!</span>}
            </div>
          </form>
        )}
      </div>

      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Lock className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Change Password</h3>
            <p className="text-xs text-muted-foreground">Update your admin login password</p>
          </div>
        </div>

        {error && <p role="alert" className="mb-4 text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">{error}</p>}
        {success && <p className="mb-4 text-sm text-green-600 dark:text-green-400 bg-green-500/10 px-4 py-2 rounded-lg">Password changed successfully!</p>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Current Password</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">New Password</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              className="w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition"
            />
            <p className="text-xs text-muted-foreground mt-1">Minimum 6 characters</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">Confirm New Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
              className={`w-full px-4 py-2.5 rounded-xl border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition ${
                confirmPassword && confirmPassword !== newPassword ? "border-destructive" : "border-border"
              }`}
            />
            {confirmPassword && confirmPassword !== newPassword && (
              <p className="text-xs text-destructive mt-1">Passwords do not match</p>
            )}
          </div>
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-medium text-sm hover:bg-primary/90 disabled:opacity-60 transition"
          >
            <Save className="w-4 h-4" />{saving ? "Changing…" : "Change Password"}
          </button>
        </form>
      </div>
    </div>
  );
}

interface FieldProps {
  label: string; value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  placeholder?: string;
}

function Field({ label, value, onChange, multiline, placeholder }: FieldProps) {
  const cls = "w-full px-4 py-2.5 rounded-xl border border-border bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition";
  return (
    <div>
      <label className="block text-sm font-medium text-foreground mb-1.5">{label}</label>
      {multiline
        ? <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} placeholder={placeholder} className={`${cls} resize-y`} />
        : <input type="text" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className={cls} />
      }
    </div>
  );
}
