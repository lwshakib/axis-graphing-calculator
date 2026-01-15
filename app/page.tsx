"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import { 
  Calculator, 
  LayoutGrid, 
  FunctionSquare, 
  ArrowRight, 
  Zap, 
  Box,
  Layers,
  MousePointer2,
  Share2,
  FileCode,
  Github,
  Twitter,
  Linkedin,
  Mail,
  Play
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const features = [
  {
    title: "Graphing Calculator",
    description: "Visualize complex equations with our high-performance interactive graphing engine. Support for implicit, parametric, and polar equations.",
    href: "/graph",
    icon: LayoutGrid,
    color: "bg-blue-500",
    gradient: "from-blue-500/20 to-blue-600/20",
  },
  {
    title: "3D Plotting",
    description: "Visualize vectors and complex surfaces in a full 3D environment. Explore multivariate calculus like never before.",
    icon: Box,
    href: "/3d",
    color: "bg-emerald-500",
    gradient: "from-emerald-500/20 to-emerald-600/20",
  },
  {
    title: "Scientific Calculator",
    description: "Advanced mathematical functions including trigonometry, logs, and complex operations with high precision.",
    href: "/scientific",
    icon: FunctionSquare,
    color: "bg-indigo-500",
    gradient: "from-indigo-500/20 to-indigo-600/20",
  },
  {
    title: "Normal Calculator",
    description: "A sleek, distraction-free tool for your everyday calculations and quick math. Simple, fast, and reliable.",
    href: "/calculator",
    icon: Calculator,
    color: "bg-amber-500",
    gradient: "from-amber-500/20 to-amber-600/20",
  },
];

const steps = [
  {
    title: "Enter Equation",
    description: "Type or use our math keyboard to input your mathematical expressions effortlessly.",
    icon: FileCode,
  },
  {
    title: "Visualize",
    description: "Instantly see your math come to life with our high-precision rendering engine.",
    icon: Layers,
  },
  {
    title: "Analyze & Share",
    description: "Export your graphs, share with colleagues, or save them for your research project.",
    icon: Share2,
  },
];

const stats = [
  { label: "Precision", value: "99.9%" },
  { label: "Functions", value: "500+" },
  { label: "Users", value: "10k+" },
  { label: "Calculations", value: "1M+" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/10 transition-colors duration-500">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 md:pt-40 md:pb-48 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-gradient-to-b from-primary/10 to-transparent pointer-events-none -z-10" />
        <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full -z-10 animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/10 blur-[120px] rounded-full -z-10 animate-pulse delay-700" />

        <div className="container mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-bold mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Zap size={14} className="fill-current" />
            <span className="tracking-widest uppercase">The Future of Mathematics</span>
          </div>

          <h1 className="text-6xl md:text-8xl font-black tracking-tight mb-8 animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 leading-[1.1]">
            Mathematics, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-blue-600 to-emerald-500">
              Redefined.
            </span>
          </h1>
          
          <p className="max-w-3xl mx-auto text-xl md:text-2xl text-muted-foreground mb-12 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200 leading-relaxed font-medium">
            AXIS is the professional suite of mathematical tools engineered for 
            precision, built for speed, and designed for clarity.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-10 duration-700 delay-300">
            <Button size="lg" className="h-16 px-10 text-xl rounded-2xl font-bold group shadow-2xl shadow-primary/30 transition-all hover:scale-105" asChild>
              <Link href="/graph">
                Start Graphing
                <ArrowRight size={22} className="ml-2 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-16 px-10 text-xl rounded-2xl font-bold border-2 backdrop-blur-sm bg-background/50 hover:bg-background/80 transition-all hover:scale-105" asChild>
              <Link href="/3d">
                Explore 3D
                <Box size={22} className="ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-y bg-zinc-50/50 dark:bg-zinc-900/10">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="text-4xl md:text-5xl font-black text-primary mb-2 transition-transform group-hover:scale-110 duration-300">{stat.value}</div>
                <div className="text-sm uppercase tracking-widest font-bold text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Grid Section */}
      <section className="py-32 relative overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row items-end justify-between mb-16 gap-6">
            <div className="max-w-2xl">
              <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Powerful Tools for Every Use Case</h2>
              <p className="text-lg text-muted-foreground font-medium">From simple arithmetic to complex 3D plotting, AXIS provides a comprehensive toolkit for all your mathematical needs.</p>
            </div>
            <Link href="/scientific" className="flex items-center gap-2 text-primary font-bold hover:underline">
              View All Tools <ArrowRight size={20} />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <Link 
                  key={feature.href} 
                  href={feature.href}
                  className="group relative p-8 rounded-[2.5rem] bg-background border border-border hover:border-primary/50 transition-all duration-500 hover:shadow-3xl hover:shadow-primary/10 hover:-translate-y-2 overflow-hidden flex flex-col h-full"
                >
                  <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-500", feature.gradient)} />
                  
                  <div className={cn("w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-xl mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500", feature.color)}>
                    <Icon size={32} />
                  </div>
                  
                  <h3 className="text-2xl font-bold mb-4 relative z-10 group-hover:text-primary transition-colors">{feature.title}</h3>
                  <p className="text-muted-foreground relative z-10 mb-8 flex-grow leading-relaxed font-medium">{feature.description}</p>
                  
                  <div className="flex items-center text-primary font-bold text-sm group-hover:translate-x-2 transition-transform relative z-10 font-mono tracking-tighter uppercase">
                    Launch Tool <ArrowRight size={16} className="ml-2" />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-32 bg-zinc-50 dark:bg-zinc-950/50">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-20">
            <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Streamlined Workflow</h2>
            <p className="text-lg text-muted-foreground font-medium">Focus on the math, we'll handle the heavy lifting. Our intuitive interface makes exploration effortless.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
            {/* Connector Line (Desktop) */}
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2 -z-10" />

            {steps.map((step, i) => (
              <div key={i} className="flex flex-col items-center text-center group">
                <div className="w-20 h-20 rounded-full bg-background border-4 border-zinc-100 dark:border-zinc-900 flex items-center justify-center mb-8 shadow-xl relative z-10 transition-all group-hover:scale-110 group-hover:border-primary/50">
                  <step.icon size={36} className="text-primary" />
                  <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-primary text-primary-foreground text-xs font-bold flex items-center justify-center border-2 border-background">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-2xl font-bold mb-4">{step.title}</h3>
                <p className="text-muted-foreground font-medium leading-relaxed max-w-xs">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Video/Interaction Teaser */}
      <section className="py-32 overflow-hidden">
        <div className="container mx-auto px-6">
          <div className="rounded-[3rem] bg-zinc-900 text-white p-12 md:p-24 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-primary/20 to-transparent pointer-events-none" />
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
              <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-white text-xs font-bold mb-6">
                  <Play size={12} fill="white" />
                  <span>INTERACTIVE EXPLORATION</span>
                </div>
                <h2 className="text-4xl md:text-6xl font-black mb-8 leading-tight tracking-tight">Experience Math in High Definition.</h2>
                <ul className="space-y-6 mb-10">
                  <li className="flex items-center gap-4 text-lg text-zinc-400">
                    <div className="w-6 h-6 rounded-full bg-emerald-500/20 text-emerald-500 flex items-center justify-center shrink-0"><Zap size={14} fill="currentColor" /></div>
                    <span>Real-time rendering at 60 FPS</span>
                  </li>
                  <li className="flex items-center gap-4 text-lg text-zinc-400">
                    <div className="w-6 h-6 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0"><MousePointer2 size={14} fill="currentColor" /></div>
                    <span>Intuitive gestures and pan/zoom</span>
                  </li>
                  <li className="flex items-center gap-4 text-lg text-zinc-400">
                    <div className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center shrink-0"><Layers size={14} fill="currentColor" /></div>
                    <span>Overlay multiple functions effortlessly</span>
                  </li>
                </ul>
                <Button size="lg" className="h-16 px-10 text-xl rounded-2xl font-black bg-white text-zinc-900 hover:bg-zinc-200" asChild>
                  <Link href="/graph">Try Now</Link>
                </Button>
              </div>
              <div className="relative aspect-square md:aspect-video rounded-3xl overflow-hidden shadow-2xl bg-zinc-800 border-4 border-zinc-700/50 group-hover:scale-[1.02] transition-transform duration-500">
                {/* Mock UI for Graph */}
                <div className="absolute inset-0 flex items-center justify-center opacity-40">
                  <div className="w-full h-0.5 bg-zinc-600 absolute" />
                  <div className="h-full w-0.5 bg-zinc-600 absolute" />
                  <svg viewBox="0 0 100 100" className="w-3/4 text-primary fill-none stroke-[2]">
                    <path d="M0,50 Q25,10 50,50 T100,50" className="animate-pulse" />
                    <path d="M0,70 Q25,30 50,70 T100,70" className="stroke-blue-500 animate-pulse delay-700" />
                  </svg>
                </div>
                <div className="absolute top-4 left-4 p-4 bg-zinc-900/80 backdrop-blur-md rounded-xl border border-white/10 w-48 font-mono text-xs">
                  <div className="text-zinc-500 mb-2">y = sin(x)</div>
                  <div className="text-zinc-500">y = cos(x) + 2</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust / Brands Section */}
      <section className="py-24 border-t">
        <div className="container mx-auto px-6">
          <p className="text-center text-sm font-bold tracking-widest text-muted-foreground uppercase mb-16 underline decoration-primary/30 underline-offset-8">Trusted by Researchers Worldwide</p>
          <div className="flex flex-wrap justify-center gap-12 md:gap-32 opacity-30 grayscale hover:opacity-100 transition-opacity duration-700">
            <div className="flex items-center gap-2 font-black italic text-2xl tracking-tighter">STANFORD</div>
            <div className="flex items-center gap-2 font-black italic text-2xl tracking-tighter">MIT</div>
            <div className="flex items-center gap-2 font-black italic text-2xl tracking-tighter">HARVARD</div>
            <div className="flex items-center gap-2 font-black italic text-2xl tracking-tighter">OXFORD</div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-24 pb-12 border-t bg-zinc-50/50 dark:bg-zinc-950/50">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-20">
            <div className="space-y-6">
              <Logo iconClassName="w-8 h-8" textClassName="text-2xl" />
              <p className="text-muted-foreground font-medium leading-relaxed max-w-xs">
                Empowering the world through mathematical precision and elegant visualization tools.
              </p>
              <div className="flex gap-4">
                <Link href="#" className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                  <Twitter size={18} />
                </Link>
                <Link href="#" className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                  <Github size={18} />
                </Link>
                <Link href="#" className="w-10 h-10 rounded-full border flex items-center justify-center hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all">
                  <Linkedin size={18} />
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-black text-sm uppercase tracking-widest mb-8">Projects</h4>
              <ul className="space-y-4 text-sm font-bold text-muted-foreground">
                <li><Link href="/graph" className="hover:text-primary transition-colors flex items-center gap-2"><ArrowRight size={12} /> Graphing Calculator</Link></li>
                <li><Link href="/3d" className="hover:text-primary transition-colors flex items-center gap-2"><ArrowRight size={12} /> 3D Plotter</Link></li>
                <li><Link href="/scientific" className="hover:text-primary transition-colors flex items-center gap-2"><ArrowRight size={12} /> Scientific Tool</Link></li>
                <li><Link href="/calculator" className="hover:text-primary transition-colors flex items-center gap-2"><ArrowRight size={12} /> Basic Calculator</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-sm uppercase tracking-widest mb-8">Resources</h4>
              <ul className="space-y-4 text-sm font-bold text-muted-foreground">
                <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2"><ArrowRight size={12} /> Documentation</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2"><ArrowRight size={12} /> API Reference</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2"><ArrowRight size={12} /> Keyboard Shortcuts</Link></li>
                <li><Link href="#" className="hover:text-primary transition-colors flex items-center gap-2"><ArrowRight size={12} /> Math Library</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-black text-sm uppercase tracking-widest mb-8">Newsletter</h4>
              <p className="text-sm font-medium text-muted-foreground mb-6">Stay updated with our latest releases and mathematical insights.</p>
              <div className="flex gap-2">
                <input 
                  type="email" 
                  placeholder="Enter your email" 
                  className="bg-background border rounded-lg px-4 py-2 text-sm w-full outline-none focus:ring-2 focus:ring-primary/20"
                />
                <Button size="sm" className="h-10 px-4 rounded-lg">
                  <Mail size={16} />
                </Button>
              </div>
            </div>
          </div>
          
          <div className="pt-12 border-t flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-sm font-bold text-muted-foreground tracking-tight">
              © 2026 AXIS Labs International. All rights reserved.
            </div>
            <div className="flex gap-8 text-xs font-black uppercase tracking-widest text-muted-foreground">
              <Link href="#" className="hover:text-primary transition-colors">Privacy</Link>
              <Link href="#" className="hover:text-primary transition-colors">Terms</Link>
              <Link href="#" className="hover:text-primary transition-colors">Cookies</Link>
              <Link href="#" className="hover:text-primary transition-colors">Security</Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
