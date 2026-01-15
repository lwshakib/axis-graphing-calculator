"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { 
  Calculator, 
  LayoutGrid, 
  FunctionSquare, 
  ArrowRight, 
  Zap, 
  Shield, 
  Globe 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Graphing Calculator",
    description: "Visualize complex equations with our high-performance interactive graphing engine.",
    href: "/graph",
    icon: LayoutGrid,
    color: "bg-blue-500",
    gradient: "from-blue-500/20 to-blue-600/20",
  },
  {
    title: "Normal Calculator",
    description: "A sleek, distraction-free tool for your everyday calculations and quick math.",
    href: "/calculator",
    icon: Calculator,
    color: "bg-emerald-500",
    gradient: "from-emerald-500/20 to-emerald-600/20",
  },
  {
    title: "Scientific Calculator",
    description: "Advanced mathematical functions including trigonometry, logs, and complex operations.",
    href: "/scientific",
    icon: FunctionSquare,
    color: "bg-indigo-500",
    gradient: "from-indigo-500/20 to-indigo-600/20",
  },
  {
    title: "3D Plotting",
    description: "Visualize vectors and complex surfaces in a full 3D environment.",
    icon: LayoutGrid,
    href: "/3d",
    color: "bg-emerald-500",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10">
      {/* Hero Section */}
      <section className="relative pt-20 pb-20 md:pt-32 md:pb-32 overflow-hidden">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-gradient-to-b from-primary/5 to-transparent pointer-events-none -z-10" />
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full -z-10 animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full -z-10 animate-pulse delay-700" />

        <div className="container mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            <Zap size={14} className="fill-current" />
            <span>POWERED BY ANTIGRAVITY AI</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-6 animate-in fade-in slide-in-from-bottom-6 duration-1000 delay-100">
            Mathematics, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-emerald-500">
              Redefined.
            </span>
          </h1>
          
          <p className="max-w-2xl mx-auto text-xl text-muted-foreground mb-10 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
            AXIS is the ultimate suite of mathematical tools designed for students, 
            engineers, and researchers. Precision meets elegance.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-300">
            <Button size="lg" className="h-14 px-8 text-lg rounded-full font-bold group shadow-xl shadow-primary/20" asChild>
              <Link href="/graph">
                Start Graphing
                <ArrowRight size={20} className="ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-full font-bold border-2" asChild>
              <Link href="/scientific">Explore Tools</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Tools Section */}
      <section className="py-20 bg-zinc-50 dark:bg-zinc-950/50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Link 
                  key={feature.href} 
                  href={feature.href}
                  className="group relative p-8 rounded-[2rem] bg-background border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-2 overflow-hidden"
                >
                  {/* Hover Gradient Overlay */}
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", feature.gradient)} />
                  
                  <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-lg mb-6 group-hover:scale-110 transition-transform duration-500", feature.color)}>
                    <Icon size={28} />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-3 relative z-10">{feature.title}</h3>
                  <p className="text-muted-foreground relative z-10">{feature.description}</p>
                  
                  <div className="mt-8 flex items-center text-primary font-bold text-sm group-hover:translate-x-2 transition-transform relative z-10 font-mono">
                    OPEN TOOL <ArrowRight size={16} className="ml-2" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* Social Proof / Features */}
      <section className="py-20 border-t">
        <div className="container mx-auto px-6">
          <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-50 grayscale">
            <div className="flex items-center gap-2 font-black italic text-xl">STANFORD</div>
            <div className="flex items-center gap-2 font-black italic text-xl">MIT</div>
            <div className="flex items-center gap-2 font-black italic text-xl">HARVARD</div>
            <div className="flex items-center gap-2 font-black italic text-xl">OXFORD</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 border-t">
        <div className="container mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-8">
          <Logo iconClassName="w-6 h-6" textClassName="text-lg" />
          <div className="flex gap-8 text-sm text-muted-foreground font-medium">
            <Link href="#" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-primary transition-colors">Documentation</Link>
            <Link href="#" className="hover:text-primary transition-colors">Support</Link>
          </div>
          <div className="text-sm text-muted-foreground">
            © 2026 AXIS Labs. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
