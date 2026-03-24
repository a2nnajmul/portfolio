import { Facebook, Twitter, Instagram, Mail, ArrowUp } from "lucide-react";

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-foreground text-background py-12 md:py-16 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12 border-b border-background/10 pb-12">
          
          <div className="lg:col-span-2">
            <span className="font-display font-bold text-3xl tracking-tight mb-4 inline-block">
              Najmul A<span className="text-primary">.</span>
            </span>
            <p className="text-background/70 max-w-md mb-6 text-lg">
              A creative Graphic Designer passionate about crafting memorable brand identities, logo designs, and modern UI/UX experiences.
            </p>
            <div className="flex items-center gap-4">
              {[
                { icon: Facebook, href: "https://facebook.com/a2nnajmul" },
                { icon: Twitter, href: "https://twitter.com/a2nnajmul" },
                { icon: Instagram, href: "https://instagram.com/a2nnajmul" },
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center text-background hover:bg-primary hover:text-white transition-colors"
                >
                  <social.icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 font-display">Quick Links</h4>
            <ul className="space-y-3 text-background/70">
              {['Home', 'About', 'Skills', 'Portfolio', 'Contact'].map(link => (
                <li key={link}>
                  <button 
                    onClick={() => {
                      document.getElementById(link.toLowerCase())?.scrollIntoView({ behavior: 'smooth' });
                    }}
                    className="hover:text-primary transition-colors"
                  >
                    {link}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-lg font-bold mb-6 font-display">Contact Info</h4>
            <ul className="space-y-3 text-background/70">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-primary" />
                <a href="mailto:a2nnajmul@gmail.com" className="hover:text-white transition-colors">a2nnajmul@gmail.com</a>
              </li>
              <li>
                <span className="block mb-1 opacity-60 text-sm">Location:</span>
                Panchua, Kapasia, 1743<br />Dhaka, Bangladesh
              </li>
            </ul>
          </div>

        </div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-background/50 text-sm">
            &copy; {new Date().getFullYear()} Najmul Alam. All rights reserved.
          </p>
          
          <button 
            onClick={scrollToTop}
            className="w-10 h-10 rounded-full bg-background/10 flex items-center justify-center text-background hover:bg-primary hover:text-white transition-colors"
            aria-label="Scroll to top"
          >
            <ArrowUp className="w-4 h-4" />
          </button>
        </div>

      </div>
    </footer>
  );
}
