"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, X, Settings, RotateCcw, ChevronLeft, ChevronRight, Keyboard, Save, LogIn, Trash2, Edit3, Loader2, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { compileMath } from '@/lib/math-parser';
import { useTheme } from "next-themes";
import { MathKeyboard } from '@/components/math-keyboard';
import { SaveSessionButton } from '@/components/save-session-button';
import { useRouter } from 'next/navigation';

// --- Types ---
interface Equation {
  id: string;
  expression: string;
  color: string;
  visible: boolean;
}

const COLORS = [
  '#2d70b3', // Blue
  '#c74440', // Red
  '#388c46', // Green
  '#6042a6', // Purple
  '#fa7e19', // Orange
];

interface GraphWorkspaceProps {
  initialData?: {
    equations: Equation[];
    viewport: { x: number; y: number; zoom: number };
    title: string;
  };
  sessionId?: string;
}

export function GraphWorkspace({ initialData, sessionId }: GraphWorkspaceProps) {
  const [equations, setEquations] = useState<Equation[]>(
    initialData?.equations || [
      { id: '1', expression: 'x^2', color: COLORS[0], visible: true },
      { id: '2', expression: 'sin(x)', color: COLORS[1], visible: true },
      { id: '3', expression: '', color: COLORS[2], visible: true },
    ]
  );
  const [viewport, setViewport] = useState(
    initialData?.viewport || { x: 0, y: 0, zoom: 40 }
  );
  const [title, setTitle] = useState(initialData?.title || "Untitled Graph");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(sessionId);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const router = useRouter();
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [activeEquationId, setActiveEquationId] = useState<string | null>(null);

  const addEquation = () => {
    const nextColor = COLORS[equations.length % COLORS.length];
    setEquations([...equations, { 
      id: Math.random().toString(36).substr(2, 9), 
      expression: '', 
      color: nextColor, 
      visible: true 
    }]);
  };

  const updateEquation = (id: string, expression: string) => {
    setEquations(equations.map(eq => eq.id === id ? { ...eq, expression } : eq));
  };

  const updateEquationColor = (id: string, color: string) => {
    setEquations(equations.map(eq => eq.id === id ? { ...eq, color } : eq));
  };

  const removeEquation = (id: string) => {
    if (equations.length > 1) {
      setEquations(equations.filter(eq => eq.id !== id));
    } else {
      setEquations(equations.map(eq => eq.id === id ? { ...eq, expression: '' } : eq));
    }
  };

  const toggleVisibility = (id: string) => {
    setEquations(equations.map(eq => eq.id === id ? { ...eq, visible: !eq.visible } : eq));
  };

  const handleKeyboardInput = (val: string) => {
    if (!activeEquationId) return;
    
    setEquations(prev => prev.map(eq => {
      if (eq.id === activeEquationId) {
        if (val === 'backspace') return { ...eq, expression: eq.expression.slice(0, -1) };
        if (val === 'clear') return { ...eq, expression: '' };
        if (val === '=') return eq; 
        
        const isFunc = ['sin', 'cos', 'tan', 'sqrt', 'log', 'ln', 'abs'].includes(val);
        const insert = isFunc ? `${val}(` : val;
        return { ...eq, expression: eq.expression + insert };
      }
      return eq;
    }));
  };

  // --- Graph Rendering Logic ---
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const { x: centerX, y: centerY, zoom } = viewport;

    ctx.clearRect(0, 0, width, height);

    const targetSpacing = 80;
    const baseLog = Math.log10(targetSpacing / zoom);
    const exponent = Math.floor(baseLog);
    const fractional = baseLog - exponent;
    
    let step = Math.pow(10, exponent);
    let subStep = step / 5;
    
    if (fractional > Math.log10(5)) {
        step *= 10;
        subStep = step / 5;
    } else if (fractional > Math.log10(2)) {
        step *= 5;
        subStep = step / 5;
    } else if (fractional > Math.log10(1)) {
        step *= 2;
        subStep = step / 4;
    }

    const screenCenterX = width / 2 - centerX * zoom;
    const screenCenterY = height / 2 + centerY * zoom;

    const drawGridLines = (s: number, color: string, lineWidth: number) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();

      const firstX = Math.floor((-width / 2 + centerX * zoom) / (s * zoom)) * s;
      for (let gx = firstX; gx * zoom < width / 2 + centerX * zoom + s * zoom; gx += s) {
        const sx = width / 2 + (gx - centerX) * zoom;
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, height);
      }

      const firstY = Math.floor((-height / 2 + centerY * zoom) / (s * zoom)) * s;
      for (let gy = firstY; (gy - centerY) * zoom < height / 2 + s * zoom; gy += s) {
        const sy = height / 2 + (centerY - gy) * zoom;
        ctx.moveTo(0, sy);
        ctx.lineTo(width, sy);
      }
      ctx.stroke();
    };

    drawGridLines(subStep, isDark ? '#1e293b' : '#f0f0f0', 1);
    drawGridLines(step, isDark ? '#334155' : '#e0e0e0', 1.5);

    ctx.strokeStyle = isDark ? '#94a3b8' : '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, screenCenterY);
    ctx.lineTo(width, screenCenterY);
    ctx.moveTo(screenCenterX, 0);
    ctx.lineTo(screenCenterX, height);
    ctx.stroke();

    ctx.fillStyle = isDark ? '#94a3b8' : '#666666';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    const firstLabelX = Math.floor((-width / 2 + centerX * zoom) / (step * zoom)) * step;
    for (let lx = firstLabelX; lx * zoom < width / 2 + centerX * zoom + step * zoom; lx += step) {
        if (Math.abs(lx) < step / 100) continue; 
        const sx = width / 2 + (lx - centerX) * zoom;
        ctx.fillText(lx.toLocaleString(undefined, { maximumSignificantDigits: 4 }), sx, screenCenterY + 5);
    }

    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const firstLabelY = Math.floor((-height / 2 + centerY * zoom) / (step * zoom)) * step;
    for (let ly = firstLabelY; (ly - centerY) * zoom < height / 2 + step * zoom; ly += step) {
        if (Math.abs(ly) < step / 100) continue; 
        const sy = height / 2 + (centerY - ly) * zoom;
        ctx.fillText(ly.toLocaleString(undefined, { maximumSignificantDigits: 4 }), screenCenterX - 5, sy);
    }

    equations.forEach(eq => {
      if (!eq.visible || !eq.expression) return;
      
      ctx.strokeStyle = eq.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      try {
        const f = compileMath(eq.expression);
        let first = true;
        let prevX: number | null = null;
        let prevYValue: number | null = null;
        let prevSy: number | null = null;

        // Sampling improvement: 
        // We evaluate more points per pixel if the slope is high to ensure we reach the screen edge.
        for (let sx = 0; sx < width; sx++) {
          const x = (sx - width / 2) / zoom + centerX;
          
          // Adaptive sampling: evaluate 3 points per pixel
          const subSamples = 3;
          for (let s = 0; s < subSamples; s++) {
            const currentX = x + (s / subSamples) / zoom;
            const yValue = f({ x: currentX });
            
            if (typeof yValue === 'number' && !isNaN(yValue) && isFinite(yValue)) {
              const sy = height / 2 + (centerY - yValue) * zoom;
              
              // Break line if we cross an asymptote (sign flip + huge jump)
              if (prevYValue !== null && prevSy !== null) {
                const jump = Math.abs(sy - prevSy);
                const signFlip = (yValue > 0 && prevYValue < 0) || (yValue < 0 && prevYValue > 0);
                if (signFlip && jump > height) {
                  first = true;
                }
              }

              if (first) {
                ctx.moveTo(sx + s/subSamples, sy);
                first = false;
              } else {
                ctx.lineTo(sx + s/subSamples, sy);
              }
              prevSy = sy;
              prevYValue = yValue;
            } else {
              first = true;
              prevSy = null;
              prevYValue = null;
            }
          }
        }
        ctx.stroke();
      } catch (err) {
      }
    });
  }, [viewport, equations, isDark]);

  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current && canvasRef.current) {
        canvasRef.current.width = containerRef.current.clientWidth;
        canvasRef.current.height = containerRef.current.clientHeight;
        draw();
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize();
    return () => window.removeEventListener('resize', handleResize);
  }, [draw]);

  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  const onMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    setViewport(v => ({
      ...v,
      x: v.x - dx / v.zoom,
      y: v.y + dy / v.zoom,
    }));
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const onMouseUp = () => {
    isDragging.current = false;
  };

  const onWheel = (e: React.WheelEvent) => {
    const delta = -e.deltaY;
    const factor = Math.pow(1.1, delta / 100);
    setViewport(v => {
        const newZoom = Math.max(1e-12, Math.min(v.zoom * factor, 1e12));
        return { ...v, zoom: newZoom };
    });
  };

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div className="flex h-[calc(100vh-64px)] w-full bg-background overflow-hidden font-sans text-foreground transition-colors duration-300">
      <main className="flex w-full relative flex-1">
        <div className={cn(
          "h-full bg-background border-r border-gray-200 dark:border-slate-800 transition-all duration-300 ease-in-out flex flex-col shadow-xl z-20",
          "fixed md:relative", 
          sidebarOpen ? "w-[320px] md:w-[380px] translate-x-0" : "w-0 -translate-x-full md:translate-x-0 md:-ml-1 overflow-hidden"
        )}>
          {/* Sidebar Toolbar */}
          <div className="flex items-center justify-between p-3 border-b border-border bg-background transition-colors duration-300">
            <div className="flex items-center gap-2 px-2">
              <Edit3 size={16} className="text-primary" />
              <span className="text-sm font-black tracking-tight truncate max-w-[150px]">{title}</span>
            </div>
            <div className="flex gap-1">
                <SaveSessionButton 
                  type="graph" 
                  data={{ equations, viewport }} 
                  currentSessionId={currentSessionId}
                  onSaveSuccess={(id, newTitle) => {
                    setCurrentSessionId(id);
                    setTitle(newTitle);
                    router.replace(`/graph/${id}`);
                  }}
                />
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400" onClick={() => setSidebarOpen(false)}>
                   <ChevronLeft size={20} />
                </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-2 px-4 bg-muted/30 border-b border-border">
             <Button variant="ghost" size="sm" className="h-7 px-2 text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground gap-1" onClick={() => {
                  setViewport({ x: 0, y: 0, zoom: 40 });
             }}>
                <RotateCcw size={12} /> Reset View
             </Button>
          </div>

          {/* Equation List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
            {equations.map((eq, index) => (
              <div 
                key={eq.id} 
                className={cn(
                  "group flex items-start gap-3 p-4 border-b border-border bg-transparent transition-all relative overflow-hidden focus-within:bg-accent/20",
                  activeEquationId === eq.id && "before:absolute before:left-0 before:top-0 before:bottom-0 before:w-1 before:bg-primary shadow-[inset_4px_0_0_0_var(--primary)]"
                )}
              >
                <div className="text-xs text-gray-400 w-4 pt-2 font-medium">{index + 1}</div>
                <div 
                  className={cn(
                    "w-8 h-8 rounded-full border-2 flex-shrink-0 cursor-pointer mt-1 flex items-center justify-center transition-all relative group/color",
                    eq.visible ? "bg-opacity-100 scale-100 shadow-lg" : "bg-opacity-0 scale-90 border-dashed"
                  )}
                  style={{ 
                    backgroundColor: eq.visible ? eq.color : 'transparent',
                    borderColor: eq.color,
                    boxShadow: eq.visible ? `0 0 15px ${eq.color}44` : 'none'
                  }}
                  onClick={() => toggleVisibility(eq.id)}
                >
                  {eq.visible && <div className="w-2.5 h-2.5 rounded-full bg-white shadow-sm" />}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/color:opacity-100 transition-opacity">
                    <div className="w-full h-full relative">
                      <input 
                        type="color" 
                        value={eq.color}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-crosshair scale-150"
                        onClick={(e) => e.stopPropagation()} // Prevent click from propagating to parent div (visibility toggle)
                        onChange={(e) => updateEquationColor(eq.id, e.target.value)}
                      />
                    </div>
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <Input
                    value={eq.expression}
                    onChange={(e) => updateEquation(eq.id, e.target.value)}
                    onFocus={() => setActiveEquationId(eq.id)}
                    placeholder="Type an equation"
                    className="border-none bg-transparent shadow-none focus-visible:ring-0 text-lg p-0 h-auto font-mono placeholder:text-muted-foreground/30 transition-all rounded-none"
                  />
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-all">
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className={cn(
                      "h-8 w-8 transition-all",
                      eq.visible ? "text-primary" : "text-muted-foreground"
                    )}
                    onClick={() => toggleVisibility(eq.id)}
                  >
                    {eq.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-8 w-8 text-gray-300 hover:text-destructive transition-all"
                    onClick={() => removeEquation(eq.id)}
                  >
                    <X size={16} />
                  </Button>
                </div>
              </div>
            ))}
            <div 
              className="p-4 border-b border-border cursor-text text-muted-foreground/40 hover:text-muted-foreground transition-all duration-300 bg-transparent h-24 text-sm font-medium italic flex items-center justify-center border-dashed group"
              onClick={addEquation}
            >
              <div className="flex flex-col items-center gap-2 group-hover:scale-105 transition-transform">
                <Plus size={20} />
                <span>Add Equation</span>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t border-border flex justify-between items-center bg-background">
             <div className="flex items-center gap-3 w-full">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className={cn(
                    "h-10 grow gap-2 rounded-xl transition-all duration-300 border-border/50 font-bold",
                    keyboardOpen ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20" : "bg-background hover:bg-accent"
                  )} 
                  onClick={() => setKeyboardOpen(!keyboardOpen)}
                >
                  <Keyboard size={18} />
                  <span className="text-xs uppercase tracking-wider">Show Keyboard</span>
                </Button>
             </div>
          </div>
        </div>

        <MathKeyboard 
          isOpen={keyboardOpen} 
          onClose={() => setKeyboardOpen(false)} 
          onInput={handleKeyboardInput}
        />

        {!sidebarOpen && (
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute left-6 top-6 z-20 h-10 w-10 bg-background/80 backdrop-blur-xl shadow-xl border-border/50 hover:bg-accent transition-all duration-300 rounded-full"
            onClick={() => setSidebarOpen(true)}
          >
            <ChevronRight size={24} className="text-primary" />
          </Button>
        )}

        <div 
          ref={containerRef}
          className={cn(
            "flex-1 h-full bg-background relative overflow-hidden transition-colors duration-300 cursor-grab active:cursor-grabbing"
          )}
          onMouseDown={onMouseDown}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onWheel={onWheel}
        >
          <canvas 
            ref={canvasRef}
            className="w-full h-full"
          />
          
          <div className="absolute right-6 top-6 flex flex-col gap-3">
            <div className="flex flex-col bg-background/80 backdrop-blur-xl rounded-2xl shadow-xl border border-border/50 overflow-hidden transition-all duration-300">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-12 w-12 rounded-none border-b border-border/50 hover:bg-primary/10 hover:text-primary transition-colors" 
                  onClick={() => {
                   setViewport(v => ({ ...v, zoom: v.zoom * 1.2 }));
                }}>
                   <Plus size={22} />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-12 w-12 rounded-none hover:bg-primary/10 hover:text-primary transition-colors" 
                  onClick={() => {
                   setViewport(v => ({ ...v, zoom: v.zoom / 1.2 }));
                }}>
                   <div className="w-4 h-[2px] bg-current rounded-full" />
                </Button>
            </div>
          </div>
        </div>
      </main>

    </div>
  );
}
