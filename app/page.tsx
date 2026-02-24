"use client";

import Link from "next/link";
import { Logo } from "@/components/logo";
import {
  Calculator,
  LayoutGrid,
  FunctionSquare,
  ArrowRight,
  Box,
  Github,
  Twitter,
  Linkedin,
  Sparkles,
  Command,
  Cloud,
  Cpu,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

const features = [
  {
    title: "Graphing Workspace",
    description:
      "High-performance interactive engine supporting function plotting, derivatives, and infinite exploration.",
    href: "/graph",
    icon: LayoutGrid,
    variant: "blue",
  },
  {
    title: "3D Mapping",
    description:
      "Visualize multivariate calculus and vector fields. Plot complex surfaces with dynamic lighting.",
    icon: Box,
    href: "/3d",
    variant: "teal",
  },
  {
    title: "Scientific Suite",
    description:
      "Natural math input with support for matrices, symbolic simplification, and numerical integration.",
    href: "/scientific",
    icon: FunctionSquare,
    variant: "purple",
  },
  {
    title: "Standard Calc",
    description:
      "A sleek, tactile interface for rapid daily calculations. Balanced for speed and focus.",
    href: "/calculator",
    icon: Calculator,
    variant: "orange",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1] as const,
    },
  },
};

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const opacity = useTransform(scrollYProgress, [0, 0.15], [1, 0]);
  const y = useTransform(scrollYProgress, [0, 0.15], [0, -20]);

  return (
    <div
      ref={containerRef}
      className="min-h-screen bg-background text-foreground transition-colors duration-500 overflow-x-hidden"
    >
      {/* Hero Section */}
      <section className="relative h-[95vh] flex items-center justify-center pt-20 overflow-hidden">
        {/* Minimalist Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(var(--primary-rgb),0.03),transparent_70%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.05)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.05)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)]" />
        </div>

        <motion.div
          style={{ opacity, y }}
          className="container relative z-10 mx-auto px-6"
        >
          <div className="max-w-3xl mx-auto text-center space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
            >
              <Badge
                variant="secondary"
                className="px-4 py-1.5 rounded-full bg-primary/5 text-primary border-primary/10 font-medium tracking-wide"
              >
                <Sparkles size={14} className="mr-2 inline-block" />
                Studio Grade Mathematics
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight leading-[1.05] text-balance"
            >
              Precise.{" "}
              <span className="text-muted-foreground/40">Effortless.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
              className="max-w-xl mx-auto text-lg md:text-xl text-muted-foreground leading-relaxed font-normal"
            >
              AXIS is the professional suite of mathematical tools engineered
              for high-fidelity visualization and symbolic mastery.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
            >
              <Button
                size="lg"
                className="h-14 px-8 rounded-full font-semibold text-base gap-2 group shadow-lg shadow-primary/10 hover:shadow-primary/20 transition-all active:scale-95"
                asChild
              >
                <Link href="/graph">
                  Enter Workspace
                  <ArrowRight
                    size={18}
                    className="transition-transform group-hover:translate-x-1"
                  />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="ghost"
                className="h-14 px-8 rounded-full font-semibold text-base border border-transparent hover:border-border transition-all active:scale-95"
                asChild
              >
                <Link href="/dashboard">My Sessions</Link>
              </Button>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 1 }}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-3"
        >
          <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-muted-foreground/40 text-center">
            Explore AXIS
          </span>
          <div className="w-[1px] h-10 bg-gradient-to-b from-border to-transparent" />
        </motion.div>
      </section>

      {/* Trust Line - More Minimal */}
      <section className="py-12 border-y border-border/40 bg-muted/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { label: "Float Precision", value: "64-bit" },
              { label: "Render Lag", value: "< 1.2ms" },
              { label: "Visual Fidelity", value: "4K UHD" },
              { label: "Sync Speed", value: "Instant" },
            ].map((stat, i) => (
              <div key={i} className="text-center group">
                <div className="text-2xl md:text-3xl font-semibold tracking-tight mb-0.5 group-hover:text-primary transition-colors">
                  {stat.value}
                </div>
                <div className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground/40">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-32 bg-background">
        <div className="container mx-auto px-6">
          <div className="max-w-2xl mb-24">
            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight leading-none">
              Engineered for Mastery.
            </h2>
            <p className="text-lg text-muted-foreground font-normal leading-relaxed">
              Combining symbolic computation with high-performance graphics to
              create the ultimate playground for mathematical exploration.
            </p>
          </div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature) => (
              <motion.div key={feature.title} variants={itemVariants}>
                <Link href={feature.href} className="block group h-full">
                  <Card className="h-full border-border/40 bg-card/50 hover:bg-accent/30 hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 rounded-3xl overflow-hidden">
                    <CardHeader className="pb-4">
                      <div
                        className={cn(
                          "w-12 h-12 rounded-2xl flex items-center justify-center mb-4 transition-all duration-300 group-hover:scale-110",
                          feature.variant === "blue" &&
                            "bg-blue-500/10 text-blue-500",
                          feature.variant === "teal" &&
                            "bg-emerald-500/10 text-emerald-500",
                          feature.variant === "purple" &&
                            "bg-purple-500/10 text-purple-500",
                          feature.variant === "orange" &&
                            "bg-orange-500/10 text-orange-500",
                        )}
                      >
                        <feature.icon size={24} />
                      </div>
                      <CardTitle className="text-xl font-bold tracking-tight">
                        {feature.title}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription className="text-base text-muted-foreground leading-relaxed font-normal">
                        {feature.description}
                      </CardDescription>
                      <div className="mt-6 flex items-center text-xs font-bold uppercase tracking-wider text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-[-10px] group-hover:translate-x-0">
                        Launch <ArrowRight size={14} className="ml-2" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Workflow Visualization - Simplified & Minimal */}
      <section className="py-32 relative overflow-hidden bg-muted/20">
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-12">
              <h2 className="text-3xl md:text-5xl font-bold tracking-tight leading-[1.1]">
                Workflow at the <br />
                <span className="text-primary italic">speed of thought.</span>
              </h2>

              <div className="space-y-10">
                {[
                  {
                    icon: Command,
                    title: "Natural Input",
                    desc: "Industry-standard LaTeX engine for natural mathematical notation.",
                  },
                  {
                    icon: Cpu,
                    title: "WASM Core",
                    desc: "Computational core running at native speeds using WebAssembly.",
                  },
                  {
                    icon: Cloud,
                    title: "Cloud Sync",
                    desc: "Sessions synchronized in real-time across all your devices.",
                  },
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="shrink-0 w-12 h-12 rounded-2xl bg-background border border-border flex items-center justify-center text-primary group-hover:border-primary/40 transition-colors shadow-sm">
                      <item.icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-lg mb-1.5 tracking-tight">
                        {item.title}
                      </h4>
                      <p className="text-muted-foreground text-base leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
              viewport={{ once: true }}
              className="relative aspect-[4/3] rounded-[2.5rem] overflow-hidden border border-border/50 bg-background shadow-2xl"
            >
              <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(128,128,128,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(128,128,128,0.03)_1px,transparent_1px)] bg-[size:32px_32px]" />
              <div className="absolute inset-0 flex items-center justify-center p-12">
                <svg
                  viewBox="0 0 100 100"
                  className="w-full h-full text-primary/40"
                >
                  <motion.path
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    transition={{ duration: 2.5, ease: "easeInOut" }}
                    d="M0,50 Q25,10 50,50 T100,50"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <motion.path
                    initial={{ pathLength: 0 }}
                    whileInView={{ pathLength: 1 }}
                    transition={{
                      duration: 2.5,
                      delay: 0.5,
                      ease: "easeInOut",
                    }}
                    d="M0,70 Q25,30 50,70 T100,70"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="0.75"
                    className="opacity-50"
                  />
                </svg>
              </div>
              <div className="absolute bottom-8 left-8 right-8 p-5 rounded-2xl border border-border/40 bg-background/80 backdrop-blur-md shadow-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                  <div className="space-y-0.5">
                    <span className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground block">
                      Sampling
                    </span>
                    <span className="text-xs font-mono font-medium">
                      1.2e-16 @ 64bit
                    </span>
                  </div>
                </div>
                <Activity size={16} className="text-muted-foreground/30" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final CTA / Minimal Footer Top */}
      <section className="py-32 border-t border-border/40">
        <div className="container mx-auto px-6 text-center max-w-2xl">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-8">
            Ready to explore?
          </h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              size="lg"
              className="h-14 px-10 rounded-full font-bold text-base"
              asChild
            >
              <Link href="/graph">Start Graphing</Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-10 rounded-full font-bold text-base border-border/60"
              asChild
            >
              <Link href="/(auth)/register">Create Account</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer - Professional & Minimal */}
      <footer className="py-20 border-t border-border/40 bg-background/50 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-start gap-12 mb-20">
            <div className="space-y-6">
              <Logo iconClassName="w-10 h-10" textClassName="text-3xl" />
              <p className="max-w-xs text-base text-muted-foreground leading-relaxed">
                Reimagining tools of discovery for the next generation of
                scientific explorers.
              </p>
              <div className="flex gap-4">
                {[Twitter, Github, Linkedin].map((Icon, i) => (
                  <Link
                    key={i}
                    href="#"
                    className="w-10 h-10 rounded-full border border-border flex items-center justify-center hover:bg-muted transition-all active:scale-90"
                  >
                    <Icon size={18} />
                  </Link>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-16">
              <div className="space-y-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">
                  Ecosystem
                </h4>
                <ul className="space-y-4">
                  {["Graph", "3D Plotter", "Scientific", "Calculator"].map(
                    (item) => (
                      <li key={item}>
                        <Link
                          href={`/${item.toLowerCase().replace(" ", "")}`}
                          className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                        >
                          {item}
                        </Link>
                      </li>
                    ),
                  )}
                </ul>
              </div>
              <div className="space-y-6">
                <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground/50">
                  Resources
                </h4>
                <ul className="space-y-4">
                  {["Docs", "Release", "Community", "Privacy"].map((item) => (
                    <li key={item}>
                      <Link
                        href="#"
                        className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {item}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          <div className="pt-8 border-t border-border/20 flex flex-col sm:flex-row justify-between items-center gap-6">
            <p className="text-xs text-muted-foreground font-medium">
              © 2026 AXIS Labs. Compiled with precision.
            </p>
            <div className="flex gap-8">
              {["Privacy", "Terms", "Status"].map((item) => (
                <Link
                  key={item}
                  href="#"
                  className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/40 hover:text-primary transition-colors"
                >
                  {item}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
