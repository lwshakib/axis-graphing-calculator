"use client";

import React, { useEffect, useState } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter, notFound } from "next/navigation";
import {
  History,
  Search,
  Trash2,
  ExternalLink,
  Calculator,
  LineChart,
  Box,
  Binary,
  MoreVertical,
  Plus,
  Loader2,
  Calendar,
  Layers,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { format } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

interface SavedSession {
  id: string;
  title: string;
  type: string;
  updatedAt: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data: any;
}

const typeIcons: Record<string, React.ReactNode> = {
  graph: <LineChart className="text-blue-500" size={20} />,
  calculator: <Calculator className="text-emerald-500" size={20} />,
  scientific: <Binary className="text-purple-500" size={20} />,
  "3d": <Box className="text-orange-500" size={20} />,
};

const typeColors: Record<string, string> = {
  graph: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
  calculator:
    "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
  scientific:
    "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  "3d": "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20",
};

export default function DashboardPage() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();
  const [sessions, setSessions] = useState<SavedSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!isPending && !session) {
      notFound();
    }
  }, [session, isPending]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/sessions");
      if (res.ok) {
        const data = await res.json();
        setSessions(data);
      }
    } catch {
      toast.error("Failed to load sessions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchSessions();
    }
  }, [session]);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/sessions/${id}`, { method: "DELETE" });
      if (res.ok) {
        setSessions(sessions.filter((s) => s.id !== id));
        toast.success("Session deleted");
      } else {
        throw new Error();
      }
    } catch {
      toast.error("Failed to delete session");
    }
  };

  const filteredSessions = sessions.filter((s) => {
    const matchesSearch = s.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === "all" || s.type === activeTab;
    return matchesSearch && matchesTab;
  });

  // Handle loading state
  if (isPending) {
    return (
      <div className="flex h-[80vh] w-full items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={40} />
      </div>
    );
  }

  // If not pending and no session, the useEffect will trigger notFound()
  if (!session) return null;

  return (
    <div className="container max-w-7xl mx-auto px-4 py-12 md:py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col gap-8"
      >
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl md:text-5xl font-black tracking-tight">
              My Sessions
            </h1>
            <p className="text-muted-foreground text-lg font-medium">
              Manage and organize your mathematical explorations.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Button
              className="rounded-xl h-12 px-6 font-bold bg-[#47CEAC] hover:bg-[#36BB9A] text-white shadow-lg shadow-[#47CEAC]/20 transition-all hover:scale-105"
              onClick={() => router.push("/graph")}
            >
              <Plus className="mr-2" size={20} />
              New Graph
            </Button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:max-w-md group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 group-focus-within:text-primary transition-colors"
              size={20}
            />
            <Input
              placeholder="Search sessions..."
              className="pl-12 h-14 rounded-xl bg-muted/30 border-none focus-visible:ring-2 focus-visible:ring-[#47CEAC]/30 text-lg font-medium"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <Tabs
            defaultValue="all"
            onValueChange={setActiveTab}
            className="w-full md:w-auto"
          >
            <TabsList className="bg-muted/50 p-1 rounded-xl h-14">
              <TabsTrigger
                value="all"
                className="rounded-lg px-6 h-12 data-[state=active]:bg-background data-[state=active]:shadow-lg font-bold"
              >
                All
              </TabsTrigger>
              <TabsTrigger
                value="graph"
                className="rounded-lg px-6 h-12 data-[state=active]:bg-background data-[state=active]:shadow-lg font-bold"
              >
                2D Graph
              </TabsTrigger>
              <TabsTrigger
                value="3d"
                className="rounded-lg px-6 h-12 data-[state=active]:bg-background data-[state=active]:shadow-lg font-bold"
              >
                3D Plotter
              </TabsTrigger>
              <TabsTrigger
                value="calculator"
                className="rounded-lg px-6 h-12 data-[state=active]:bg-background data-[state=active]:shadow-lg font-bold"
              >
                Calc
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div
                key={i}
                className="h-64 rounded-2xl bg-muted/30 animate-pulse border border-border/10"
              />
            ))}
          </div>
        ) : filteredSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <AnimatePresence mode="popLayout">
              {filteredSessions.map((session, index) => (
                <motion.div
                  key={session.id}
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="group relative overflow-hidden rounded-2xl border border-border/10 bg-card/30 backdrop-blur-xl hover:bg-card/50 transition-all hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1">
                    <CardHeader className="p-6 pb-2">
                      <div className="flex items-start justify-between mb-2">
                        <div
                          className={`flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${typeColors[session.type] || "bg-muted text-muted-foreground"}`}
                        >
                          {typeIcons[session.type] || <History size={14} />}
                          {session.type}
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="rounded-full h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical size={16} />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="end"
                            className="rounded-xl p-2"
                          >
                            <DropdownMenuItem
                              className="rounded-xl cursor-pointer text-destructive focus:bg-destructive/10"
                              onClick={() => handleDelete(session.id)}
                            >
                              <Trash2 size={16} className="mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <CardTitle className="text-2xl font-black truncate group-hover:text-[#47CEAC] transition-colors">
                        {session.title}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 font-medium">
                        <Calendar size={14} />
                        {format(new Date(session.updatedAt), "MMM d, yyyy")}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="p-6 pt-4">
                      <div className="aspect-[16/10] rounded-2xl bg-muted/50 flex flex-col items-center justify-center border border-border/5 group-hover:border-primary/20 transition-all overflow-hidden relative">
                        {/* Visual placeholder for the session type */}
                        <div className="opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500 transform">
                          {React.cloneElement(
                            typeIcons[session.type] as React.ReactElement<
                              Record<string, unknown>
                            >,
                            { size: 100 },
                          )}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-card/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                          <span className="text-xs font-black uppercase tracking-widest text-[#47CEAC]">
                            View Details
                          </span>
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className="p-6 pt-0">
                      <Button
                        className="w-full rounded-xl h-12 font-bold flex gap-2 group/btn relative overflow-hidden"
                        variant="secondary"
                        onClick={() =>
                          router.push(`/${session.type}/${session.id}`)
                        }
                      >
                        <ExternalLink size={18} className="relative z-10" />
                        <span className="relative z-10">Open Session</span>
                        <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                      </Button>
                    </CardFooter>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-4 border-2 border-dashed border-border/10 rounded-2xl bg-muted/5">
            <div className="h-20 w-20 rounded-full bg-muted/20 flex items-center justify-center">
              <Layers className="text-muted-foreground/30" size={40} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold">No sessions found</h3>
              <p className="text-muted-foreground">
                {searchQuery
                  ? "Try a different search term."
                  : "Start exploring to save your first session."}
              </p>
            </div>
            {!searchQuery && (
              <Button
                variant="outline"
                className="mt-2 rounded-xl"
                onClick={() => router.push("/graph")}
              >
                Create your first session
              </Button>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
}
