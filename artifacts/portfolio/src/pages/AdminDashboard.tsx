import { useState, useEffect, type FormEvent } from "react";
import { adminFetch } from "@/lib/api";
import {
  LogOut, FolderOpen, Briefcase, User, Mail,
  Plus, Pencil, Trash2, Save, X, ChevronUp, ChevronDown,
} from "lucide-react";

type Tab = "projects" | "experience" | "about" | "messages";

interface Project {
  id: string; title: string; category: string; description: string;
  imageUrl: string; link: string; gradient: string; featured: boolean;
}
interface Experience {
  id: string; company: string; role: string; year: string; description: string;
}
interface About { bio: string; }
interface Message {
  id: string; name: string; email: string; message: string; createdAt: string;
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

interface Props { onLogout: () => void; }

export default function AdminDashboard({ onLogout }: Props) {
  const [tab, setTab] = useState<Tab>("projects");

  const tabs: { id: Tab; label: string; icon: typeof FolderOpen }[] = [
    { id: "projects", label: "Projects", icon: FolderOpen },
    { id: "experience", label: "Experience", icon: Briefcase },
    { id: "about", label: "About", icon: User },
    { id: "messages", label: "Messages", icon: Mail },
  ];

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-card border-b border-border px-4 sm:px-6 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-3">
          <span className="text-lg font-bold text-foreground">Najmul<span className="text-primary">.</span></span>
          <span className="text-muted-foreground text-sm hidden sm:inline">Admin Dashboard</span>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition"
        >
          <LogOut className="w-4 h-4" />
          Logout
        </button>
      </header>

      <div className="flex flex-col sm:flex-row">
        <nav className="sm:w-56 bg-card border-b sm:border-b-0 sm:border-r border-border sm:min-h-[calc(100vh-65px)]">
          <ul className="flex sm:flex-col overflow-x-auto sm:overflow-visible p-2 gap-1">
            {tabs.map((t) => (
              <li key={t.id} className="flex-shrink-0">
                <button
                  onClick={() => setTab(t.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition whitespace-nowrap ${
                    tab === t.id
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <t.icon className="w-4 h-4 flex-shrink-0" />
                  {t.label}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {tab === "projects" && <ProjectsTab />}
          {tab === "experience" && <ExperienceTab />}
          {tab === "about" && <AboutTab />}
          {tab === "messages" && <MessagesTab />}
        </main>
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

  function addItem() {
    setItems((prev) => [...prev, { id: crypto.randomUUID(), ...EMPTY_EXP }]);
  }

  function updateItem(id: string, field: keyof Experience, value: string) {
    setItems((prev) => prev.map((i) => i.id === id ? { ...i, [field]: value } : i));
  }

  function removeItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

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
      setAbout(updated);
      setSaved(true);
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

  return (
    <div>
      <h2 className="text-2xl font-bold text-foreground mb-6">Messages ({messages.length})</h2>
      {error && <p role="alert" className="mb-4 text-sm text-destructive bg-destructive/10 px-4 py-2 rounded-lg">{error}</p>}
      {loading ? <p className="text-muted-foreground">Loading…</p> : messages.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-12 text-center">
          <Mail className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">No messages yet</p>
        </div>
      ) : (
        <div className="space-y-4">
          {messages.map((m) => (
            <div key={m.id} className="bg-card border border-border rounded-2xl p-6">
              <div className="flex items-start justify-between gap-4 mb-3">
                <div>
                  <p className="font-bold text-foreground">{m.name}</p>
                  <p className="text-sm text-primary">{m.email}</p>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  <p className="text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleDateString()}</p>
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
