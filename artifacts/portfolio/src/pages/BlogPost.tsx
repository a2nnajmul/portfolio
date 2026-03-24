import { useEffect, useRef, useId } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, Calendar, Clock, Tag, ArrowRight } from "lucide-react";
import { apiFetch } from "@/lib/api";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";
import CommentSection from "@/components/CommentSection";

interface BlogPostData {
  id: string;
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  date: string;
  tags?: string[];
  featured?: boolean;
  readTime?: string;
}

interface AdSlot {
  id: string;
  label: string;
  position: string;
  adUnitCode: string;
}

interface AdsSettings {
  enabled: boolean;
  headScript: string;
  adSlots: AdSlot[];
}

function useAdHeadScript(headScript: string | undefined, enabled: boolean | undefined) {
  const injectedRef = useRef(false);
  useEffect(() => {
    if (injectedRef.current || !enabled || !headScript) return;
    const existing = document.querySelector('script[data-ad-head="true"]');
    if (existing) { injectedRef.current = true; return; }
    const temp = document.createElement("div");
    temp.innerHTML = headScript;
    const scripts = temp.querySelectorAll("script");
    scripts.forEach((src) => {
      const s = document.createElement("script");
      Array.from(src.attributes).forEach((attr) => s.setAttribute(attr.name, attr.value));
      s.textContent = src.textContent;
      s.setAttribute("data-ad-head", "true");
      document.head.appendChild(s);
    });
    injectedRef.current = true;
  }, [headScript, enabled]);
}

function AdSlot({ adUnitCode }: { adUnitCode: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const slotId = useId();

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const scripts = container.querySelectorAll("script");
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      Array.from(oldScript.attributes).forEach((attr) => newScript.setAttribute(attr.name, attr.value));
      newScript.textContent = oldScript.textContent;
      oldScript.parentNode?.replaceChild(newScript, oldScript);
    });
  }, [adUnitCode, slotId]);

  return (
    <div className="my-8 flex justify-center">
      <div
        ref={containerRef}
        className="w-full max-w-[728px] min-h-[90px] bg-muted/30 rounded-xl overflow-hidden flex items-center justify-center"
        dangerouslySetInnerHTML={{ __html: adUnitCode }}
      />
    </div>
  );
}

export default function BlogPost() {
  const params = useParams<{ id: string }>();

  const { data: post, isLoading, isError } = useQuery<BlogPostData>({
    queryKey: ["blog", params.id],
    queryFn: () => apiFetch<BlogPostData>(`/blog/${params.id}`),
    enabled: !!params.id,
  });

  const { data: allPosts = [] } = useQuery<BlogPostData[]>({
    queryKey: ["blog"],
    queryFn: () => apiFetch<BlogPostData[]>("/blog"),
  });

  const { data: adsSettings } = useQuery<AdsSettings>({
    queryKey: ["ads-settings"],
    queryFn: () => apiFetch<AdsSettings>("/settings/ads"),
  });

  useAdHeadScript(adsSettings?.headScript, adsSettings?.enabled);

  const showAds = adsSettings?.enabled && adsSettings?.adSlots && adsSettings.adSlots.length > 0;
  const slotsForPosition = (pos: string) =>
    (adsSettings?.adSlots || []).filter((s) => s.position === pos && s.adUnitCode);

  const recommended = allPosts
    .filter((p) => p.id !== params.id)
    .slice(0, 3);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [params.id]);

  return (
    <main className="relative min-h-screen bg-background">
      <Navbar />

      <div className="pt-28 pb-16 md:pb-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors mb-8 group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back to Home
          </Link>

          {isLoading && (
            <div className="text-center py-16">
              <p className="text-muted-foreground">Loading…</p>
            </div>
          )}

          {isError && (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold text-foreground mb-4">Post not found</h2>
              <p className="text-muted-foreground mb-6">This blog post doesn't exist or has been removed.</p>
              <Link href="/" className="text-primary hover:underline">Go back home</Link>
            </div>
          )}

          {post && (
            <>
              <article>
                {post.imageUrl && (
                  <div className="aspect-[2/1] rounded-3xl overflow-hidden mb-8">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                <div className="flex flex-wrap items-center gap-4 text-muted-foreground text-sm mb-4">
                  <span className="inline-flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {post.date}
                  </span>
                  {post.readTime && (
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      {post.readTime}
                    </span>
                  )}
                </div>

                <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4 leading-tight">
                  {post.title}
                </h1>

                {post.tags && post.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {post.tags.map((tag) => (
                      <span key={tag} className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                        <Tag className="w-3 h-3" />
                        {tag}
                      </span>
                    ))}
                  </div>
                )}

                {post.description && (
                  <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                    {post.description}
                  </p>
                )}

                <div className="w-full h-px bg-border mb-8" />

                {showAds && slotsForPosition("after-header").map((s) => (
                  <AdSlot key={s.id} adUnitCode={s.adUnitCode} />
                ))}

                <div className="prose prose-lg dark:prose-invert max-w-none prose-headings:font-display prose-a:text-primary prose-img:rounded-2xl">
                  {post.content.split("\n").map((paragraph, i) => {
                    const trimmed = paragraph.trim();
                    if (!trimmed) return <br key={i} />;
                    if (trimmed.startsWith("# ")) return <h1 key={i} className="text-3xl font-bold text-foreground mt-8 mb-4">{trimmed.slice(2)}</h1>;
                    if (trimmed.startsWith("## ")) return <h2 key={i} className="text-2xl font-bold text-foreground mt-6 mb-3">{trimmed.slice(3)}</h2>;
                    if (trimmed.startsWith("### ")) return <h3 key={i} className="text-xl font-bold text-foreground mt-5 mb-2">{trimmed.slice(4)}</h3>;
                    if (trimmed.startsWith("- ")) return <li key={i} className="text-foreground/80 leading-relaxed ml-4">{trimmed.slice(2)}</li>;
                    return <p key={i} className="text-foreground/80 leading-relaxed mb-4">{trimmed}</p>;
                  })}
                </div>

                {showAds && slotsForPosition("mid-content").map((s) => (
                  <AdSlot key={s.id} adUnitCode={s.adUnitCode} />
                ))}
              </article>

              {showAds && slotsForPosition("before-recommended").map((s) => (
                <AdSlot key={s.id} adUnitCode={s.adUnitCode} />
              ))}

              <CommentSection postId={params.id!} />

              {recommended.length > 0 && (
                <div className="mt-16 pt-12 border-t border-border">
                  <h2 className="text-2xl md:text-3xl font-display font-bold text-foreground mb-8">
                    Recommended <span className="text-gradient">Posts</span>
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {recommended.map((rec) => (
                      <Link
                        key={rec.id}
                        href={`/blog/${rec.id}`}
                        className="group block bg-card rounded-2xl overflow-hidden border border-border shadow-sm hover:shadow-xl hover:border-primary/30 hover:-translate-y-1 transition-all duration-300"
                      >
                        {rec.imageUrl ? (
                          <div className="aspect-[16/9] overflow-hidden">
                            <img
                              src={rec.imageUrl}
                              alt={rec.title}
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                          </div>
                        ) : (
                          <div className="aspect-[16/9] bg-gradient-to-br from-primary/20 to-orange-400/10" />
                        )}
                        <div className="p-4">
                          <div className="flex items-center gap-2 text-muted-foreground text-xs mb-2">
                            <Calendar className="w-3 h-3" />
                            <span>{rec.date}</span>
                            {rec.readTime && (
                              <>
                                <span className="text-border">|</span>
                                <span>{rec.readTime}</span>
                              </>
                            )}
                          </div>
                          <h3 className="font-bold text-foreground text-sm mb-2 group-hover:text-primary transition-colors line-clamp-2">
                            {rec.title}
                          </h3>
                          <span className="inline-flex items-center gap-1 text-primary font-medium text-xs group-hover:gap-2 transition-all">
                            Read More <ArrowRight className="w-3 h-3" />
                          </span>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
