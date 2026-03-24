import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { ArrowLeft, Calendar } from "lucide-react";
import { apiFetch } from "@/lib/api";
import Navbar from "@/components/sections/Navbar";
import Footer from "@/components/sections/Footer";

interface BlogPostData {
  id: string;
  title: string;
  description: string;
  content: string;
  imageUrl: string;
  date: string;
}

export default function BlogPost() {
  const params = useParams<{ id: string }>();

  const { data: post, isLoading, isError } = useQuery<BlogPostData>({
    queryKey: ["blog", params.id],
    queryFn: () => apiFetch<BlogPostData>(`/blog/${params.id}`),
    enabled: !!params.id,
  });

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

              <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                <Calendar className="w-4 h-4" />
                <span>{post.date}</span>
              </div>

              <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-4 leading-tight">
                {post.title}
              </h1>

              {post.description && (
                <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
                  {post.description}
                </p>
              )}

              <div className="w-full h-px bg-border mb-8" />

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
            </article>
          )}
        </div>
      </div>

      <Footer />
    </main>
  );
}
