import { useQuery } from "@tanstack/react-query";
import { FadeIn } from "@/components/FadeIn";
import { ArrowRight, Calendar } from "lucide-react";
import { apiFetch } from "@/lib/api";
import { Link } from "wouter";

interface BlogPost {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  date: string;
}

export default function Blog() {
  const { data: posts = [] } = useQuery<BlogPost[]>({
    queryKey: ["blog"],
    queryFn: () => apiFetch<BlogPost[]>("/blog"),
    placeholderData: [],
  });

  return (
    <section id="blog" className="py-16 md:py-24 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            Latest <span className="text-gradient">Blog</span>
          </h2>
          <div className="w-24 h-1.5 bg-primary mx-auto rounded-full mb-8" />
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Thoughts, tutorials, and insights on design and creativity.
          </p>
        </FadeIn>

        {posts.length === 0 ? (
          <FadeIn className="text-center py-8">
            <p className="text-muted-foreground">No blog posts yet. Check back soon!</p>
          </FadeIn>
        ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {posts.map((post, i) => (
            <FadeIn key={post.id} delay={(i % 3 + 1) * 100}>
              <Link
                href={`/blog/${post.id}`}
                className="group block bg-card rounded-3xl overflow-hidden border border-border shadow-sm hover:shadow-2xl hover:border-primary/30 hover:-translate-y-2 transition-all duration-300"
              >
                {post.imageUrl ? (
                  <div className="aspect-[16/9] overflow-hidden">
                    <img
                      src={post.imageUrl}
                      alt={post.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>
                ) : (
                  <div className="aspect-[16/9] bg-gradient-to-br from-primary/20 to-orange-400/10" />
                )}
                <div className="p-6">
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                    <Calendar className="w-4 h-4" />
                    <span>{post.date}</span>
                  </div>
                  <h3 className="text-xl font-bold text-foreground mb-2 group-hover:text-primary transition-colors line-clamp-2">
                    {post.title}
                  </h3>
                  <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
                    {post.description}
                  </p>
                  <span className="inline-flex items-center gap-1.5 text-primary font-medium text-sm group-hover:gap-2.5 transition-all">
                    Read More <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            </FadeIn>
          ))}
        </div>
        )}
      </div>
    </section>
  );
}
