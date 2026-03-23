import { useState } from "react";
import { toast } from "sonner";
import { FadeIn } from "@/components/FadeIn";
import { MapPin, Phone, Mail, Send, Loader2, CheckCircle2, AlertCircle, X } from "lucide-react";

type StatusType = "success" | "error" | null;

export default function Contact() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState<StatusType>(null);
  const [statusMessage, setStatusMessage] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
    hp: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.hp) return;

    setIsSubmitting(true);
    setStatus(null);
    setStatusMessage("");

    let succeeded = false;
    let errMsg = "";

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          message: formData.message,
        }),
      });

      if (response.ok) {
        succeeded = true;
      } else {
        const data = await response.json().catch(() => ({})) as Record<string, unknown>;
        errMsg = (data.error as string) || "Failed to send message. Please try again.";
      }
    } catch {
      errMsg = "Network error. Please check your connection and try again.";
    } finally {
      setIsSubmitting(false);
    }

    if (succeeded) {
      setFormData({ name: "", email: "", message: "", hp: "" });
      setStatus("success");
      setStatusMessage("Message sent! I'll get back to you soon.");
      toast.success("Message sent!", {
        description: "I'll get back to you soon.",
      });
    } else {
      setStatus("error");
      setStatusMessage(errMsg);
      toast.error("Failed to send message", {
        description: errMsg,
      });
    }
  };

  return (
    <section id="contact" className="py-24 bg-secondary/50 relative overflow-hidden">
      <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/3 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <FadeIn className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-display font-bold text-foreground mb-4">
            Contact <span className="text-gradient">Me</span>
          </h2>
          <div className="w-24 h-1.5 bg-primary mx-auto rounded-full mb-8" />
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Have a project in mind or want to discuss opportunities? Feel free to reach out.
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-8 items-start">

          {/* Contact Info */}
          <FadeIn className="lg:col-span-2 space-y-6">
            <div className="bg-card rounded-3xl p-8 border border-border shadow-lg">
              <h3 className="text-2xl font-bold text-foreground mb-8">Get In Touch</h3>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Email</p>
                    <a href="mailto:a2nnajmul@gmail.com" className="text-foreground hover:text-primary transition-colors font-medium text-lg">
                      a2nnajmul@gmail.com
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Phone</p>
                    <a href="tel:+8801793908183" className="text-foreground hover:text-primary transition-colors font-medium text-lg">
                      (+880) 1793908183
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <MapPin className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground mb-1">Location</p>
                    <p className="text-foreground font-medium text-lg">
                      Panchua, Kapasia, 1743<br />Dhaka, Bangladesh
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </FadeIn>

          {/* Contact Form */}
          <FadeIn delay={200} className="lg:col-span-3">
            <div className="bg-card rounded-3xl p-8 md:p-10 border border-border shadow-lg">
              <h3 className="text-2xl font-bold text-foreground mb-8">Send Me a Message</h3>

              {/* Status Banner — always mounted, visibility controlled by status */}
              <div
                role="status"
                aria-live="polite"
                aria-atomic="true"
              >
                {status === "success" && (
                  <div
                    role="alert"
                    aria-label="Message sent successfully"
                    className="flex items-start gap-3 p-4 mb-6 rounded-xl border bg-green-50 border-green-200 text-green-800 dark:bg-green-950/40 dark:border-green-800 dark:text-green-300 text-sm font-medium"
                  >
                    <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
                    <span className="flex-1">{statusMessage}</span>
                    <button
                      type="button"
                      onClick={() => { setStatus(null); setStatusMessage(""); }}
                      className="ml-auto opacity-60 hover:opacity-100 transition-opacity"
                      aria-label="Dismiss"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
                {status === "error" && (
                  <div
                    role="alert"
                    aria-label="Error sending message"
                    className="flex items-start gap-3 p-4 mb-6 rounded-xl border bg-red-50 border-red-200 text-red-800 dark:bg-red-950/40 dark:border-red-800 dark:text-red-300 text-sm font-medium"
                  >
                    <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                    <span className="flex-1">{statusMessage}</span>
                    <button
                      type="button"
                      onClick={() => { setStatus(null); setStatusMessage(""); }}
                      className="ml-auto opacity-60 hover:opacity-100 transition-opacity"
                      aria-label="Dismiss"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Honeypot field - visually hidden */}
                <div style={{ display: "none" }} aria-hidden="true">
                  <label htmlFor="hp">Leave this field blank</label>
                  <input
                    type="text"
                    id="hp"
                    name="hp"
                    value={formData.hp}
                    onChange={handleChange}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-sm font-medium text-foreground">Your Name</label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                      placeholder="John Doe"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="email" className="text-sm font-medium text-foreground">Your Email</label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200"
                      placeholder="john@example.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="message" className="text-sm font-medium text-foreground">Your Message</label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl bg-background border-2 border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary focus:ring-4 focus:ring-primary/10 transition-all duration-200 resize-none"
                    placeholder="Tell me about your project..."
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-8 py-4 rounded-xl font-semibold bg-gradient-to-r from-primary to-[#ea580c] text-white shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:-translate-y-1 active:translate-y-0 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none transition-all duration-300 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send Message
                      <Send className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </FadeIn>

        </div>
      </div>
    </section>
  );
}
