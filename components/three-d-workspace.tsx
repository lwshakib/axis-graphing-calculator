"use client";

import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Plus, 
  X, 
  Settings, 
  RotateCcw, 
  ChevronLeft, 
  ChevronRight, 
  Box,
  Move,
  Maximize2,
  Trash2,
  Eye,
  EyeOff,
  Keyboard,
  Edit3
} from "lucide-react";
import { compileMath } from "@/lib/math-parser";
import { useTheme } from "next-themes";
import { MathKeyboard } from "@/components/math-keyboard";
import { SaveSessionButton } from "@/components/save-session-button";
import { useRouter } from "next/navigation";

// --- Types ---
interface Vector3D {
  id: string;
  x: string;
  y: string;
  z: string;
  color: string;
  visible: boolean;
  label: string;
}

interface Surface3D {
  id: string;
  equation: string; 
  color: string;
  visible: boolean;
}

interface ThreeDWorkspaceProps {
  initialData?: {
    vectors: Vector3D[];
    surfaces: Surface3D[];
    title: string;
  };
  sessionId?: string;
}

export function ThreeDWorkspace({ initialData, sessionId }: ThreeDWorkspaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [vectors, setVectors] = useState<Vector3D[]>(
    initialData?.vectors || [
      { id: '1', x: '1', y: '1', z: '1', color: '#4f46e5', visible: true, label: 'v1' }
    ]
  );
  const [surfaces, setSurfaces] = useState<Surface3D[]>(
    initialData?.surfaces || [
      { id: 's1', equation: 'sin(x) * cos(y)', color: '#10b981', visible: true }
    ]
  );
  const [title, setTitle] = useState(initialData?.title || "Untitled 3D Map");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(sessionId);
  const router = useRouter();

  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const objectsGroupRef = useRef<THREE.Group | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const zAxisLineRef = useRef<THREE.Line | null>(null);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [keyboardOpen, setKeyboardOpen] = useState(false);
  const [activeInput, setActiveInput] = useState<{ type: 'vector' | 'surface', id: string, field?: keyof Vector3D } | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const scene = new THREE.Scene();
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.1, 1000);
    camera.position.set(5, 5, 5);
    cameraRef.current = camera;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controlsRef.current = controls;

    const objectsGroup = new THREE.Group();
    scene.add(objectsGroup);
    objectsGroupRef.current = objectsGroup;

    const gridHelper = new THREE.GridHelper(10, 10, isDark ? 0x334155 : 0xcbd5e1, isDark ? 0x1e293b : 0xe2e8f0);
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    const zMaterial = new THREE.LineBasicMaterial({ color: isDark ? 0x64748b : 0x94a3b8 });
    const zPoints = [new THREE.Vector3(0, -5, 0), new THREE.Vector3(0, 5, 0)];
    const zGeometry = new THREE.BufferGeometry().setFromPoints(zPoints);
    const zAxisLine = new THREE.Line(zGeometry, zMaterial);
    scene.add(zAxisLine);
    zAxisLineRef.current = zAxisLine;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = containerRef.current.clientWidth / containerRef.current.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (containerRef.current) {
        try {
          containerRef.current.removeChild(renderer.domElement);
        } catch(e){}
      }
    };
  }, []);

  useEffect(() => {
    if (gridHelperRef.current) {
        const gh = gridHelperRef.current;
        const newGrid = new THREE.GridHelper(10, 10, isDark ? 0x334155 : 0xcbd5e1, isDark ? 0x1e293b : 0xe2e8f0);
        sceneRef.current?.remove(gh);
        sceneRef.current?.add(newGrid);
        gridHelperRef.current = newGrid;
    }
    if (zAxisLineRef.current) {
        (zAxisLineRef.current.material as THREE.LineBasicMaterial).color.set(isDark ? 0x64748b : 0x94a3b8);
    }
  }, [isDark]);

  useEffect(() => {
    if (!objectsGroupRef.current) return;
    const group = objectsGroupRef.current;
    
    while(group.children.length > 0){ 
        const child = group.children[0] as any;
        if(child.geometry) child.geometry.dispose();
        if(child.material) child.material.dispose();
        group.remove(child); 
    }

    vectors.forEach(v => {
      if (!v.visible) return;
      const x = parseFloat(v.x) || 0;
      const y = parseFloat(v.y) || 0;
      const z = parseFloat(v.z) || 0;

      const sphereGeom = new THREE.SphereGeometry(0.1, 16, 16);
      const sphereMat = new THREE.MeshPhongMaterial({ color: v.color });
      const sphere = new THREE.Mesh(sphereGeom, sphereMat);
      sphere.position.set(x, z, -y);
      group.add(sphere);

      const linePoints = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(x, z, -y)];
      const lineGeom = new THREE.BufferGeometry().setFromPoints(linePoints);
      const lineMat = new THREE.LineBasicMaterial({ color: v.color, opacity: 0.5, transparent: true });
      const line = new THREE.Line(lineGeom, lineMat);
      group.add(line);
    });

    surfaces.forEach(s => {
      if (!s.visible || !s.equation) return;
      
      try {
        const fn = compileMath(s.equation);
        const segments = 40;
        const range = 5;
        const geometry = new THREE.PlaneGeometry(range * 2, range * 2, segments, segments);
        const material = new THREE.MeshPhongMaterial({ 
          color: s.color, 
          side: THREE.DoubleSide, 
          transparent: true, 
          opacity: 0.7,
          wireframe: false 
        });

        const vertices = geometry.attributes.position.array;
        for (let i = 0; i < vertices.length; i += 3) {
          const x = vertices[i];
          const y = vertices[i + 1];
          const zValue = fn({ x: x, y: y });
          vertices[i + 2] = zValue;
        }
        
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2;
        group.add(mesh);

        const wireframe = new THREE.WireframeGeometry(geometry);
        const line = new THREE.LineSegments(wireframe);
        line.material = new THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.1, transparent: true });
        line.rotation.x = -Math.PI / 2;
        group.add(line);

      } catch (e) {}
    });

  }, [vectors, surfaces]);

  const addVector = () => {
    setVectors([...vectors, {
      id: Math.random().toString(36).substr(2, 9),
      x: '0', y: '0', z: '0',
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      visible: true,
      label: `v${vectors.length + 1}`
    }]);
  };

  const addSurface = () => {
    setSurfaces([...surfaces, {
      id: Math.random().toString(36).substr(2, 9),
      equation: 'sin(sqrt(x^2+y^2))',
      color: `hsl(${Math.random() * 360}, 70%, 50%)`,
      visible: true
    }]);
  };

  const updateVector = (id: string, field: keyof Vector3D, value: any) => {
    setVectors(vectors.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const updateSurface = (id: string, field: keyof Surface3D, value: any) => {
    setSurfaces(surfaces.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const removeVector = (id: string) => {
    setVectors(vectors.filter(v => v.id !== id));
  };

  const removeSurface = (id: string) => {
    setSurfaces(surfaces.filter(s => s.id !== id));
  };

  const handleKeyboardInput = (val: string) => {
    if (!activeInput) return;

    if (activeInput.type === 'vector' && activeInput.field) {
      setVectors(prev => prev.map(v => {
        if (v.id === activeInput.id) {
          const currentVal = (v[activeInput.field!] as string);
          if (val === 'backspace') return { ...v, [activeInput.field!]: currentVal.slice(0, -1) };
          if (val === 'clear') return { ...v, [activeInput.field!]: '' };
          return { ...v, [activeInput.field!]: currentVal + val };
        }
        return v;
      }));
    } else if (activeInput.type === 'surface') {
      setSurfaces(prev => prev.map(s => {
        if (s.id === activeInput.id) {
          if (val === 'backspace') return { ...s, equation: s.equation.slice(0, -1) };
          if (val === 'clear') return { ...s, equation: '' };
          const isFunc = ['sin', 'cos', 'tan', 'sqrt', 'log', 'ln', 'abs'].includes(val);
          const insert = isFunc ? `${val}(` : val;
          return { ...s, equation: s.equation + insert };
        }
        return s;
      }));
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full bg-background overflow-hidden font-sans text-foreground transition-colors duration-300">
      <div className={cn(
        "h-full bg-background border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out flex flex-col shadow-xl z-20",
        sidebarOpen ? "w-80" : "w-0 -ml-1 overflow-hidden"
      )}>
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-background">
          <div className="flex items-center gap-2 truncate pr-2">
            <Edit3 size={18} className="text-primary flex-shrink-0" />
            <h2 className="font-black text-sm tracking-tight truncate">{title}</h2>
          </div>
          <div className="flex items-center gap-1">
            <SaveSessionButton 
              type="3d" 
              data={{ vectors, surfaces }} 
              currentSessionId={currentSessionId}
              onSaveSuccess={(id, newTitle) => {
                setCurrentSessionId(id);
                setTitle(newTitle);
                router.replace(`/3d/${id}`);
              }}
            />
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="rounded-full h-8 w-8">
              <ChevronLeft size={20} />
            </Button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          <section>
            <div className="flex items-center justify-between mb-3 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              <span>Vectors</span>
              <Button variant="ghost" size="icon" onClick={addVector} className="h-6 w-6 text-indigo-600 dark:text-indigo-400">
                <Plus size={16} />
              </Button>
            </div>
            <div className="space-y-3">
              {vectors.map(v => (
                <div key={v.id} className="p-4 bg-transparent border border-border rounded-2xl space-y-3 group transition-all duration-300 relative overflow-hidden">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full cursor-pointer shadow-md transition-all hover:scale-110 relative group/color" style={{ backgroundColor: v.color }}>
                         <input type="color" value={v.color} className="absolute inset-0 w-full h-full opacity-0 cursor-crosshair" onChange={(e) => updateVector(v.id, 'color', e.target.value)} />
                      </div>
                      <input className="bg-transparent border-none font-bold text-sm w-16 outline-none" value={v.label} onChange={(e) => updateVector(v.id, 'label', e.target.value)} onFocus={() => setActiveInput({ type: 'vector', id: v.id, field: 'label' })} />
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => updateVector(v.id, 'visible', !v.visible)} className={cn("p-1.5 rounded-lg", v.visible ? "text-indigo-600" : "text-muted-foreground")}>
                        {v.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button onClick={() => removeVector(v.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground/60">X</label>
                      <Input value={v.x} onChange={(e) => updateVector(v.id, 'x', e.target.value)} onFocus={() => setActiveInput({ type: 'vector', id: v.id, field: 'x' })} className="h-8 text-center bg-transparent border-none shadow-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground/60">Y</label>
                      <Input value={v.y} onChange={(e) => updateVector(v.id, 'y', e.target.value)} onFocus={() => setActiveInput({ type: 'vector', id: v.id, field: 'y' })} className="h-8 text-center bg-transparent border-none shadow-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-muted-foreground/60">Z</label>
                      <Input value={v.z} onChange={(e) => updateVector(v.id, 'z', e.target.value)} onFocus={() => setActiveInput({ type: 'vector', id: v.id, field: 'z' })} className="h-8 text-center bg-transparent border-none shadow-none" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center justify-between mb-3 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">
              <span>Surfaces</span>
              <Button variant="ghost" size="icon" onClick={addSurface} className="h-6 w-6 text-emerald-600 dark:text-emerald-400">
                <Plus size={16} />
              </Button>
            </div>
            <div className="space-y-3">
              {surfaces.map(s => (
                <div key={s.id} className="p-4 bg-transparent border border-border rounded-2xl space-y-3 group Transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-4 h-4 rounded-full" style={{ backgroundColor: s.color }}>
                         <input type="color" value={s.color} className="absolute inset-0 w-full h-full opacity-0 cursor-crosshair" onChange={(e) => updateSurface(s.id, 'color', e.target.value)} />
                      </div>
                      <span className="text-sm font-bold">Surface</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 Transition-all">
                      <button onClick={() => updateSurface(s.id, 'visible', !s.visible)} className={cn("p-1.5 rounded-lg", s.visible ? "text-emerald-600" : "text-muted-foreground")}>
                        {s.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button onClick={() => removeSurface(s.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground/60">z =</label>
                    <Input value={s.equation} onChange={(e) => updateSurface(s.id, 'equation', e.target.value)} onFocus={() => setActiveInput({ type: 'surface', id: s.id })} className="h-8 font-mono text-sm bg-transparent border-none shadow-none" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="p-4 border-t border-border bg-background flex gap-2">
          <Button variant="outline" size="sm" className={cn("h-10 px-4 grow gap-2 rounded-xl", keyboardOpen ? "bg-primary text-primary-foreground" : "")} onClick={() => setKeyboardOpen(!keyboardOpen)}>
            <Keyboard size={18} />
            <span className="text-xs font-black uppercase">Keyboard</span>
          </Button>
          <Button variant="outline" className="gap-2 rounded-xl h-10" onClick={() => {
            setVectors([{ id: '1', x: '1', y: '1', z: '1', color: '#4f46e5', visible: true, label: 'v1' }]);
            setSurfaces([]);
          }}>
            <RotateCcw size={16} /> Reset
          </Button>
        </div>
      </div>

      <MathKeyboard isOpen={keyboardOpen} onClose={() => setKeyboardOpen(false)} onInput={handleKeyboardInput} />

      <div className="flex-1 h-full relative">
        <div ref={containerRef} className="w-full h-full cursor-move" />
        <div className="absolute top-6 left-6 flex items-center gap-2">
          {!sidebarOpen && (
            <Button size="icon" onClick={() => setSidebarOpen(true)} className="bg-background shadow-lg border border-border rounded-full h-10 w-10">
              <ChevronRight size={20} />
            </Button>
          )}
        </div>
        <div className="absolute bottom-6 right-6 p-5 bg-background/80 backdrop-blur-xl rounded-2xl shadow-xl border border-border/50 space-y-3">
          <div className="flex items-center gap-3 text-xs font-bold">
            <div className="w-8 h-1.5 bg-red-500 rounded-full" />
            <span className="text-muted-foreground">X (Red)</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold">
            <div className="w-8 h-1.5 bg-green-500 rounded-full" />
            <span className="text-muted-foreground">Z (Up/Green)</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold">
            <div className="w-8 h-1.5 bg-blue-500 rounded-full" />
            <span className="text-muted-foreground">Y (Blue)</span>
          </div>
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e2e8f0; border-radius: 10px; }
        .dark .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; }
      `}</style>
    </div>
  );
}
