"use client";

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Plus, X, Settings, RotateCcw, ChevronLeft, ChevronRight, Keyboard, Save, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { compileMath } from '@/lib/math-parser';

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

export default function GraphPage() {
  const [equations, setEquations] = useState<Equation[]>([
    { id: '1', expression: 'x^2', color: COLORS[0], visible: true },
    { id: '2', expression: 'sin(x)', color: COLORS[1], visible: true },
    { id: '3', expression: '', color: COLORS[2], visible: true },
  ]);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Viewport state
  const [viewport, setViewport] = useState({
    x: 0,
    y: 0,
    zoom: 40, // pixels per unit
  });

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

  // --- Graph Rendering Logic ---
  
  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = canvas.width;
    const height = canvas.height;
    const { x: centerX, y: centerY, zoom } = viewport;

    // Clear background
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);

    // Calculate grid step
    // We want a step that's roughly 50-100 pixels apart
    const targetSpacing = 80;
    const baseLog = Math.log10(targetSpacing / zoom);
    const exponent = Math.floor(baseLog);
    const fractional = baseLog - exponent;
    
    let step = Math.pow(10, exponent);
    let subStep = step / 5;
    
    // Smooth transitions between 1, 2, 5, 10
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

    // Draw Grid
    const drawGridLines = (s: number, color: string, lineWidth: number) => {
      ctx.strokeStyle = color;
      ctx.lineWidth = lineWidth;
      ctx.beginPath();

      // Vertical lines
      const firstX = Math.floor((-width / 2 + centerX * zoom) / (s * zoom)) * s;
      for (let gx = firstX; gx * zoom < width / 2 + centerX * zoom + s * zoom; gx += s) {
        const sx = width / 2 + (gx - centerX) * zoom;
        ctx.moveTo(sx, 0);
        ctx.lineTo(sx, height);
      }

      // Horizontal lines
      const firstY = Math.floor((-height / 2 - centerY * zoom) / (s * zoom)) * s;
      for (let gy = firstY; gy * zoom < height / 2 - centerY * zoom + s * zoom; gy += s) {
        const sy = height / 2 - (gy + centerY) * zoom;
        ctx.moveTo(0, sy);
        ctx.lineTo(width, sy);
      }
      ctx.stroke();
    };

    // Subgrid
    drawGridLines(subStep, '#f0f0f0', 1);
    // Main grid
    drawGridLines(step, '#e0e0e0', 1.5);

    // Draw Axes
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // X axis
    ctx.moveTo(0, screenCenterY);
    ctx.lineTo(width, screenCenterY);
    // Y axis
    ctx.moveTo(screenCenterX, 0);
    ctx.lineTo(screenCenterX, height);
    ctx.stroke();

    // Draw Labels
    ctx.fillStyle = '#666666';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';

    // X Labels
    const firstLabelX = Math.floor((-width / 2 + centerX * zoom) / (step * zoom)) * step;
    for (let lx = firstLabelX; lx * zoom < width / 2 + centerX * zoom + step * zoom; lx += step) {
        if (Math.abs(lx) < step / 100) continue; // Skip 0
        const sx = width / 2 + (lx - centerX) * zoom;
        ctx.fillText(lx.toLocaleString(undefined, { maximumSignificantDigits: 4 }), sx, screenCenterY + 5);
    }

    // Y Labels
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    const firstLabelY = Math.floor((-height / 2 - centerY * zoom) / (step * zoom)) * step;
    for (let ly = firstLabelY; ly * zoom < height / 2 - centerY * zoom + step * zoom; ly += step) {
        if (Math.abs(ly) < step / 100) continue; // Skip 0
        const sy = height / 2 - (ly + centerY) * zoom;
        ctx.fillText(ly.toLocaleString(undefined, { maximumSignificantDigits: 4 }), screenCenterX - 5, sy);
    }

    // --- Draw Equations ---
    equations.forEach(eq => {
      if (!eq.visible || !eq.expression) return;
      
      ctx.strokeStyle = eq.color;
      ctx.lineWidth = 2.5;
      ctx.beginPath();

      try {
        const f = compileMath(eq.expression);
        let first = true;

        for (let sx = 0; sx < width; sx++) {
          const x = (sx - width / 2) / zoom + centerX;
          const y = f({ x });
          
          if (typeof y === 'number' && !isNaN(y) && isFinite(y)) {
            const sy = height / 2 - (y + centerY) * zoom;
            if (first) {
              ctx.moveTo(sx, sy);
              first = false;
            } else {
              ctx.lineTo(sx, sy);
            }
          } else {
            first = true;
          }
        }
        ctx.stroke();
      } catch (err) {
        // Silent error for invalid expression
      }
    });

  }, [viewport, equations]);

  // Handle Resize
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

  // Handle Mouse Interaction
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
    const zoomSpeed = 0.001;
    const delta = -e.deltaY;
    const factor = Math.pow(1.1, delta / 100);
    
    setViewport(v => {
        const newZoom = Math.max(0.1, Math.min(v.zoom * factor, 1000000));
        return { ...v, zoom: newZoom };
    });
  };

  useEffect(() => {
    draw();
  }, [draw]);

  return (
    <div className="flex h-[calc(100vh-64px)] w-full bg-[#f9f9f9] overflow-hidden font-sans text-slate-900">
      {/* Main Content */}
      <main className="flex w-full relative flex-1">
        {/* Sidebar */}
        <div className={cn(
          "h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex flex-col shadow-xl z-20",
          "fixed md:relative", // Overlay on mobile
          sidebarOpen ? "w-[320px] md:w-[380px] translate-x-0" : "w-0 -translate-x-full md:translate-x-0 md:-ml-1 overflow-hidden"
        )}>
          {/* Sidebar Toolbar */}
          <div className="flex items-center justify-between p-3 border-b border-gray-100 bg-gray-50/50">
            <div className="flex gap-1">
               <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600">
                  <Plus size={18} />
               </Button>
               <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-600" onClick={() => {
                  setViewport({ x: 0, y: 0, zoom: 40 });
               }}>
                  <RotateCcw size={18} />
               </Button>
            </div>
            <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400">
                   <Settings size={18} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400" onClick={() => setSidebarOpen(false)}>
                   <ChevronLeft size={20} />
                </Button>
            </div>
          </div>

          {/* Equation List */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-0">
            {equations.map((eq, index) => (
              <div 
                key={eq.id} 
                className={cn(
                  "group flex items-start gap-3 p-4 border-b border-gray-100 hover:bg-blue-50/30 transition-colors relative",
                  index === 0 && "bg-blue-50/50 after:absolute after:left-0 after:top-0 after:bottom-0 after:w-1 after:bg-blue-600"
                )}
              >
                <div className="text-xs text-gray-400 w-4 pt-2 font-medium">{index + 1}</div>
                <div 
                  className={cn(
                    "w-8 h-8 rounded-full border-2 flex-shrink-0 cursor-pointer mt-1 flex items-center justify-center transition-all",
                    eq.visible ? "bg-opacity-100 scale-100" : "bg-opacity-0 scale-90 border-dashed"
                  )}
                  style={{ 
                    backgroundColor: eq.visible ? eq.color : 'transparent',
                    borderColor: eq.color 
                  }}
                  onClick={() => toggleVisibility(eq.id)}
                >
                  {eq.visible && <div className="w-2 h-2 rounded-full bg-white shadow-sm" />}
                </div>
                <div className="flex-1 min-w-0">
                  <Input
                    value={eq.expression}
                    onChange={(e) => updateEquation(eq.id, e.target.value)}
                    placeholder="Type an equation"
                    className="border-none bg-transparent focus-visible:ring-0 text-lg p-0 h-auto font-mono placeholder:text-gray-300"
                  />
                </div>
                <Button 
                   variant="ghost" 
                   size="icon" 
                   className="h-8 w-8 text-gray-300 opacity-0 group-hover:opacity-100 hover:text-gray-600 transition-all"
                   onClick={() => removeEquation(eq.id)}
                >
                  <X size={16} />
                </Button>
              </div>
            ))}
            <div 
              className="p-4 border-b border-gray-100 cursor-text text-gray-300 hover:bg-gray-50 transition-colors h-24"
              onClick={addEquation}
            >
              Click to add more...
            </div>
          </div>
          
          {/* Footer branding */}
          <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50/50">
             <div className="flex items-center gap-1 opacity-40 grayscale group hover:grayscale-0 hover:opacity-100 transition-all cursor-default">
                <span className="text-[10px] font-bold tracking-tight">powered by</span>
                <span className="text-xs font-bold">desmos</span>
             </div>
             <div className="flex gap-2 text-gray-400">
                <Keyboard size={16} />
                <ChevronLeft size={16} className="-mr-1 rotate-180" />
             </div>
          </div>
        </div>

        {/* Sidebar Toggle Button (when closed) */}
        {!sidebarOpen && (
          <Button 
            variant="outline" 
            size="icon" 
            className="absolute left-4 top-4 z-20 h-10 w-10 bg-white shadow-lg border-gray-200"
            onClick={() => setSidebarOpen(true)}
          >
            <ChevronRight size={24} />
          </Button>
        )}

        {/* Graph Area */}
        <div 
          ref={containerRef}
          className="flex-1 h-full bg-white relative cursor-crosshair overflow-hidden"
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
          
          {/* Graph Controls overlay */}
          <div className="absolute right-4 top-4 flex flex-col gap-2">
            <div className="flex flex-col bg-white rounded-md shadow-lg border border-gray-200 overflow-hidden">
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none border-b border-gray-100" onClick={() => {
                   setViewport(v => ({ ...v, zoom: v.zoom * 1.2 }));
                }}>
                   <Plus size={20} className="text-gray-600" />
                </Button>
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-none" onClick={() => {
                   setViewport(v => ({ ...v, zoom: v.zoom / 1.2 }));
                }}>
                   <div className="w-3 h-[2px] bg-gray-600 rounded-full" />
                </Button>
            </div>
            
             <Button variant="outline" size="icon" className="h-10 w-10 bg-white shadow-lg border-gray-200">
                <Settings size={20} className="text-gray-600" />
             </Button>
          </div>
        </div>
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #cbd5e1;
        }
      `}</style>
    </div>
  );
}
