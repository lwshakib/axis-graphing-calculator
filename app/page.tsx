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
  Play,
  Sparkles
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const features = [
  {
    title: "Graphing Workspace",
    description: "High-performance interactive engine supporting function plotting, derivatives, and infinite exploration with pixel-perfect precision.",
    href: "/graph",
    icon: LayoutGrid,
    color: "bg-blue-600",
    gradient: "from-blue-600/20 to-blue-700/20",
  },
  {
    title: "3D Mapping",
    description: "Visualize multivariate calculus and vector fields. Plot complex surfaces in a high-fidelity 3D environment with dynamic lighting.",
    icon: Box,
    href: "/3d",
    color: "bg-[#47CEAC]",
    gradient: "from-[#47CEAC]/20 to-[#36BB9A]/20",
  },
  {
    title: "Scientific Suite",
    description: "Natural math input (MathLive) with support for matrices, symbolic simplification, numerical integration, and symbolic derivatives.",
    href: "/scientific",
    icon: FunctionSquare,
    color: "bg-purple-600",
    gradient: "from-purple-600/20 to-purple-700/20",
  },
  {
    title: "Standard Calc",
    description: "A sleek, tactile interface for rapid daily calculations. Perfectly balanced for speed and focused mathematical work.",
    href: "/calculator",
    icon: Calculator,
    color: "bg-orange-600",
    gradient: "from-orange-600/20 to-orange-700/20",
  },
];

const steps = [
  {
    title: "Define Equations",
    description: "Use our dedicated MathKeyboard or physical inputs to define complex expressions with natural notation.",
    icon: FileCode,
  },
  {
    title: "Interact & Solve",
    description: "Explore your math through infinite zooming, surface rotation, or symbolic simplification tools.",
    icon: Layers,
  },
  {
    title: "Sync & Manage",
    description: "Your work is automatically saved. Access all your sessions from the centralized dashboard across any device.",
    icon: Share2,
  },
];

const stats = [
  { label: "Float Precision", value: "64-bit" },
  { label: "Math Functions", value: "100+" },
  { label: "Render Lag", value: "< 2ms" },
  { label: "Refresh Rate", value: "120Hz" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-[#47CEAC]/20 transition-colors duration-500 overflow-x-hidden">
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 md:pt-48 md:pb-64 overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[1000px] bg-gradient-to-b from-[#47CEAC]/5 to-transparent pointer-events-none -z-10" />
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-[#47CEAC]/5 blur-[150px] rounded-full -z-10 animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-500/5 blur-[150px] rounded-full -z-10 animate-pulse delay-1000" />

        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-[#47CEAC]/10 border border-[#47CEAC]/20 text-[#47CEAC] text-xs font-black mb-10"
          >
            <Sparkles size={14} className="fill-current" />
            <span className="tracking-[0.2em] uppercase text-[10px]">High Grade Mathematical Studio</span>
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-6xl md:text-9xl font-black tracking-tighter mb-10 leading-[0.95]"
          >
            Mathematics, <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#47CEAC] via-[#36BB9A] to-blue-500">
              Redefined.
            </span>
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="max-w-3xl mx-auto text-xl md:text-2xl text-muted-foreground mb-16 leading-relaxed font-medium"
          >
            AXIS is the professional suite of mathematical tools engineered for 
            precision, built for speed, and designed for cloud-native collaboration.
          </motion.p>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-6"
          >
            <Button size="lg" className="h-20 px-12 text-2xl rounded-3xl font-black group shadow-2xl shadow-[#47CEAC]/30 transition-all hover:scale-105 active:scale-95 bg-[#47CEAC] hover:bg-[#36BB9A] text-white overflow-hidden relative" asChild>
              <Link href="/graph">
                <span className="relative z-10 flex items-center">
                  Start Graphing
                  <ArrowRight size={24} className="ml-3 transition-transform group-hover:translate-x-1" />
                </span>
                <div className="absolute inset-0 bg-white/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-20 px-12 text-2xl rounded-3xl font-black border-2 backdrop-blur-md bg-background/50 hover:bg-background/80 transition-all hover:scale-105 active:scale-95 border-border/50" asChild>
              <Link href="/dashboard">
                My Sessions
                <Layers size={24} className="ml-3" />
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y bg-muted/30 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
            {stats.map((stat, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="text-center group"
              >
                <div className="text-5xl md:text-6xl font-black text-[#47CEAC] mb-2 transition-all group-hover:scale-110 duration-500 drop-shadow-sm tracking-tight">{stat.value}</div>
                <div className="text-[10px] uppercase tracking-[0.35em] font-black text-muted-foreground/60">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Tools Grid Section */}
      <section className="py-40 relative">
        <div className="container mx-auto px-6 text-center md:text-left">
          <div className="flex flex-col md:flex-row items-center md:items-end justify-between mb-24 gap-8">
            <div className="max-w-2xl text-center md:text-left mx-auto md:mx-0">
              <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-none">Designed for Mastery</h2>
              <p className="text-xl text-muted-foreground font-medium md:max-w-xl">From symbolic arithmetic to high-fidelity 3D plotting, AXIS provides a comprehensive toolkit for professional mathematical workflows.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, idx) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.href}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: idx * 0.1 }}
                >
                  <Link 
                    href={feature.href}
                    className="group relative p-10 rounded-[3rem] bg-card/40 border border-border/50 hover:border-[#47CEAC]/50 transition-all duration-700 hover:shadow-[0_32px_64px_-16px_rgba(71,206,172,0.15)] hover:-translate-y-4 overflow-hidden flex flex-col h-full backdrop-blur-xl"
                  >
                    <div className={cn("absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-10 transition-opacity duration-700", feature.gradient)} />
                    
                    <div className={cn("w-16 h-16 rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl mb-10 group-hover:scale-110 group-hover:rotate-6 transition-all duration-700", feature.color)}>
                      <Icon size={30} />
                    </div>
                    
                    <h3 className="text-2xl font-black mb-6 relative z-10 group-hover:text-[#47CEAC] transition-colors tracking-tight">{feature.title}</h3>
                    <p className="text-base text-muted-foreground relative z-10 mb-10 flex-grow leading-relaxed font-medium">{feature.description}</p>
                    
                    <div className="flex items-center text-[#47CEAC] font-black text-[10px] group-hover:translate-x-3 transition-all relative z-10 tracking-[0.25em] uppercase">
                      Open Tool <ArrowRight size={18} className="ml-3" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="py-40 bg-muted/5 relative">
        <div className="container mx-auto px-6">
          <div className="text-center max-w-3xl mx-auto mb-28">
            <h2 className="text-5xl md:text-7xl font-black mb-8 tracking-tighter leading-none">The Mathematical Advantage</h2>
            <p className="text-xl text-muted-foreground font-medium">Built for engineers, scientists, and students who demand clarity and zero friction in their exploration.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative">
            <div className="hidden md:block absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-border to-transparent -translate-y-1/2 -z-10" />

            {steps.map((step, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="w-24 h-24 rounded-[2.5rem] bg-card border-2 border-border flex items-center justify-center mb-10 shadow-2xl relative z-10 transition-all group-hover:scale-110 group-hover:border-[#47CEAC]/50 group-hover:-rotate-6">
                  <step.icon size={42} className="text-[#47CEAC]" />
                  <div className="absolute -top-3 -right-3 w-10 h-10 rounded-2xl bg-[#47CEAC] text-white text-[10px] font-black flex items-center justify-center border-4 border-background shadow-lg">
                    {i + 1}
                  </div>
                </div>
                <h3 className="text-2xl font-black mb-6 tracking-tight">{step.title}</h3>
                <p className="text-base text-muted-foreground font-medium leading-relaxed max-w-xs">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Video/Interaction Teaser */}
      <section className="py-40">
        <div className="container mx-auto px-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            className="rounded-[4rem] bg-card border border-border text-foreground p-16 md:p-32 relative overflow-hidden group shadow-2xl transition-colors duration-700"
          >
            <div className="absolute top-0 right-0 w-[60%] h-full bg-gradient-to-l from-[#47CEAC]/5 to-transparent pointer-events-none" />
            <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
              <div>
                <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-muted dark:bg-[#47CEAC]/10 text-muted-foreground dark:text-[#47CEAC] text-[10px] font-black mb-10 border border-border">
                  <Play size={14} fill="currentColor" />
                  <span className="tracking-[0.25em] uppercase">Interactive Engine</span>
                </div>
                <h2 className="text-5xl md:text-8xl font-black mb-10 leading-[0.9] tracking-tighter">Pixel Perfect <br /> Visualization.</h2>
                <ul className="space-y-8 mb-12">
                  <li className="flex items-center gap-6 text-xl text-muted-foreground font-medium">
                    <div className="w-8 h-8 rounded-full bg-[#47CEAC]/20 text-[#47CEAC] flex items-center justify-center shrink-0 shadow-lg"><Zap size={18} fill="currentColor" /></div>
                    <span>Instant rendering with adaptive sampling</span>
                  </li>
                  <li className="flex items-center gap-6 text-xl text-muted-foreground font-medium">
                    <div className="w-8 h-8 rounded-full bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0 shadow-lg"><MousePointer2 size={18} fill="currentColor" /></div>
                    <span>Fluid multi-axis orbit controls</span>
                  </li>
                  <li className="flex items-center gap-6 text-xl text-muted-foreground font-medium">
                    <div className="w-8 h-8 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center shrink-0 shadow-lg"><Layers size={18} fill="currentColor" /></div>
                    <span>Cloud-synced session management</span>
                  </li>
                </ul>
                <Button size="lg" className="h-20 px-12 text-2xl rounded-3xl font-black bg-primary text-primary-foreground hover:bg-primary/90 dark:bg-[#47CEAC] dark:text-white dark:hover:bg-[#36BB9A] shadow-2xl transition-all active:scale-95 border-none" asChild>
                  <Link href="/graph">Launch AXIS Free</Link>
                </Button>
              </div>
              <div className="relative aspect-square md:aspect-video rounded-[3rem] overflow-hidden shadow-2xl bg-muted dark:bg-zinc-950 border border-border transition-all duration-1000 ease-out">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808005_1px,transparent_1px),linear-gradient(to_bottom,#80808005_1px,transparent_1px)] bg-[size:32px_32px]" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="w-[85%] h-[85%] text-[#47CEAC] fill-none stroke-[1.5]">
                    <motion.path 
                      initial={{ pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: 1 }}
                      transition={{ duration: 3, ease: "easeInOut" }}
                      d="M0,50 Q25,10 50,50 T100,50" 
                      className="drop-shadow-[0_0_10px_rgba(71,206,172,0.5)]"
                    />
                    <motion.path 
                      initial={{ pathLength: 0, opacity: 0 }}
                      whileInView={{ pathLength: 1, opacity: 0.4 }}
                      transition={{ duration: 3, ease: "easeInOut" }}
                      d="M0,70 Q25,30 50,70 T100,70" 
                      className="stroke-blue-500" 
                    />
                  </svg>
                </div>
                <div className="absolute top-8 left-8 p-6 bg-background/80 dark:bg-black/40 backdrop-blur-2xl rounded-[2rem] border border-border w-64 shadow-2xl group-hover:translate-x-2 transition-transform duration-700">
                  <div className="text-[#47CEAC] mb-3 font-black text-sm tracking-tighter">f(x) = sin(x)</div>
                  <div className="text-muted-foreground font-bold text-[10px] uppercase tracking-[0.2em] leading-none">High Fidelity Render</div>
                </div>
                {/* Visual Glow */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#47CEAC]/10 blur-[100px] rounded-full pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="pt-40 pb-20 border-t bg-muted/5 relative overflow-hidden">
        <div className="absolute bottom-0 left-0 w-full h-[500px] bg-gradient-to-t from-[#47CEAC]/5 to-transparent pointer-events-none" />
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-20 mb-32">
            <div className="space-y-10">
              <Logo iconClassName="w-12 h-12" textClassName="text-4xl" />
              <p className="text-xl text-muted-foreground font-medium leading-relaxed max-w-xs">
                Empowering the world through mathematical precision and elegant visualization tools.
              </p>
              <div className="flex gap-6">
                {[Twitter, Github, Linkedin].map((Icon, i) => (
                  <Link key={i} href="#" className="w-14 h-14 rounded-2xl border flex items-center justify-center hover:bg-[#47CEAC] hover:text-white hover:border-[#47CEAC] transition-all group active:scale-95 shadow-lg">
                    <Icon size={24} className="transition-transform group-hover:scale-110" />
                  </Link>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-black text-xs uppercase tracking-[0.3em] mb-10 text-muted-foreground/60">Projects</h4>
              <ul className="space-y-6 text-lg font-black tracking-tight">
                {[
                  { name: "Graphing Workspace", href: "/graph" },
                  { name: "3D Plotter", href: "/3d" },
                  { name: "Scientific Tool", href: "/scientific" },
                  { name: "Basic Calculator", href: "/calculator" }
                ].map((item, i) => (
                  <li key={i}>
                    <Link href={item.href} className="hover:text-[#47CEAC] transition-all flex items-center gap-3 group">
                      <div className="w-2 h-2 rounded-full bg-[#47CEAC] opacity-0 group-hover:opacity-100 transition-opacity" />
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-black text-xs uppercase tracking-[0.3em] mb-10 text-muted-foreground/60">Account</h4>
              <ul className="space-y-6 text-lg font-black tracking-tight">
                {[
                  { name: "My Dashboard", href: "/dashboard" },
                  { name: "Saved Sessions", href: "/dashboard" },
                  { name: "Tool Settings", href: "/graph" },
                  { name: "Cloud Sync", href: "/dashboard" }
                ].map((item, i) => (
                  <li key={i}>
                    <Link href={item.href} className="hover:text-[#47CEAC] transition-all flex items-center gap-3 group">
                       <div className="w-2 h-2 rounded-full bg-[#47CEAC] opacity-0 group-hover:opacity-100 transition-opacity" />
                       {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="font-black text-xs uppercase tracking-[0.3em] mb-10 text-muted-foreground/60">Newsletter</h4>
              <p className="text-lg font-medium text-muted-foreground mb-8">Stay updated with our latest releases and mathematical insights.</p>
              <div className="space-y-4">
                <div className="relative group">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-[#47CEAC] transition-colors" size={20} />
                  <input 
                    type="email" 
                    placeholder="Enter your email" 
                    className="bg-card border h-20 pl-16 pr-6 rounded-[1.75rem] text-lg w-full outline-none focus:ring-4 focus:ring-[#47CEAC]/20 transition-all font-bold"
                  />
                </div>
                <Button className="w-full h-20 rounded-[1.75rem] text-xl font-black bg-[#47CEAC] hover:bg-[#36BB9A] shadow-xl shadow-[#47CEAC]/20 active:scale-95 transition-all">
                  Subscribe Now
                </Button>
              </div>
            </div>
          </div>
          
          <div className="pt-16 border-t border-border/10 flex flex-col md:flex-row items-center justify-between gap-10 text-center md:text-left">
            <div className="text-lg font-black text-muted-foreground/60 tracking-tight">
              © 2026 AXIS Labs International. <br className="md:hidden" /> Crafted with Precision.
            </div>
            <div className="flex flex-wrap justify-center gap-10 text-sm font-black uppercase tracking-[0.2em] text-muted-foreground/40">
              {["Privacy", "Terms", "Cookies", "Security"].map((item) => (
                <Link key={item} href="#" className="hover:text-[#47CEAC] transition-colors">{item}</Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
