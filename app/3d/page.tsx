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
  Trash2
} from "lucide-react";
import { compileMath } from "@/lib/math-parser";

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
  equation: string; // z = f(x, y)
  color: string;
  visible: boolean;
}

export default function ThreeDPlotterPage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [vectors, setVectors] = useState<Vector3D[]>([
    { id: '1', x: '1', y: '1', z: '1', color: '#4f46e5', visible: true, label: 'v1' }
  ]);
  const [surfaces, setSurfaces] = useState<Surface3D[]>([
    { id: 's1', equation: 'sin(x) * cos(y)', color: '#10b981', visible: true }
  ]);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  // Three.js Scene Refs
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);
  const objectsGroupRef = useRef<THREE.Group | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    // --- Scene Setup ---
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
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

    // Groups
    const objectsGroup = new THREE.Group();
    scene.add(objectsGroup);
    objectsGroupRef.current = objectsGroup;

    // --- Helpers ---
    // Grid (XY Plane)
    const gridHelper = new THREE.GridHelper(10, 10, 0xcbd5e1, 0xe2e8f0);
    scene.add(gridHelper);

    // Axes
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

    // Z-Axis Line (Vertical)
    const zMaterial = new THREE.LineBasicMaterial({ color: 0x94a3b8 });
    const zPoints = [new THREE.Vector3(0, -5, 0), new THREE.Vector3(0, 5, 0)];
    const zGeometry = new THREE.BufferGeometry().setFromPoints(zPoints);
    const zAxisLine = new THREE.Line(zGeometry, zMaterial);
    scene.add(zAxisLine);

    // Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // --- Animation Loop ---
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // Resize Handler
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
      if (containerRef.current) containerRef.current.removeChild(renderer.domElement);
    };
  }, []);

  // Update objects when vectors/surfaces change
  useEffect(() => {
    if (!objectsGroupRef.current) return;
    const group = objectsGroupRef.current;
    
    // Clear previous
    while(group.children.length > 0){ 
        const child = group.children[0] as any;
        if(child.geometry) child.geometry.dispose();
        if(child.material) child.material.dispose();
        group.remove(child); 
    }

    // --- Plot Vectors ---
    vectors.forEach(v => {
      if (!v.visible) return;
      const x = parseFloat(v.x) || 0;
      const y = parseFloat(v.y) || 0;
      const z = parseFloat(v.z) || 0;

      // Point (Sphere)
      const sphereGeom = new THREE.SphereGeometry(0.1, 16, 16);
      const sphereMat = new THREE.MeshPhongMaterial({ color: v.color });
      const sphere = new THREE.Mesh(sphereGeom, sphereMat);
      sphere.position.set(x, z, -y); // Note mapping: Three.js uses Y as up, we use Z
      group.add(sphere);

      // Line from origin
      const linePoints = [new THREE.Vector3(0, 0, 0), new THREE.Vector3(x, z, -y)];
      const lineGeom = new THREE.BufferGeometry().setFromPoints(linePoints);
      const lineMat = new THREE.LineBasicMaterial({ color: v.color, opacity: 0.5, transparent: true });
      const line = new THREE.Line(lineGeom, lineMat);
      group.add(line);
    });

    // --- Plot Surfaces ---
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
          const y = vertices[i + 1]; // Internal Y is Math Y (becomes Three.js -Z)
          const zValue = fn({ x: x, y: y }); // z = f(x, y)
          vertices[i + 2] = zValue; // Displace Z (becomes Three.js Y up)
        }
        
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();
        const mesh = new THREE.Mesh(geometry, material);
        mesh.rotation.x = -Math.PI / 2; // Lie flat on XZ plane
        group.add(mesh);

        // Add wireframe for better visualization
        const wireframe = new THREE.WireframeGeometry(geometry);
        const line = new THREE.LineSegments(wireframe);
        line.material = new THREE.LineBasicMaterial({ color: 0x000000, opacity: 0.1, transparent: true });
        line.rotation.x = -Math.PI / 2;
        group.add(line);

      } catch (e) {
        console.error("Surface compilation error:", e);
      }
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

  return (
    <div className="flex h-[calc(100vh-64px)] w-full bg-slate-50 overflow-hidden font-sans text-slate-900">
      {/* Sidebar */}
      <div className={cn(
        "h-full bg-white border-r border-slate-200 transition-all duration-300 ease-in-out flex flex-col shadow-xl z-10",
        sidebarOpen ? "w-80" : "w-0 -ml-1 overflow-hidden"
      )}>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h2 className="font-bold text-slate-800 flex items-center gap-2">
            <Box size={20} className="text-indigo-600" />
            3D Grapher
          </h2>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)} className="rounded-full">
            <ChevronLeft size={20} />
          </Button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {/* Vectors Section */}
          <section>
            <div className="flex items-center justify-between mb-3 text-xs font-black text-slate-400 uppercase tracking-widest">
              <span>Vectors (i, j, k)</span>
              <Button variant="ghost" size="icon" onClick={addVector} className="h-6 w-6 text-indigo-600">
                <Plus size={16} />
              </Button>
            </div>
            <div className="space-y-3">
              {vectors.map(v => (
                <div key={v.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full cursor-pointer shadow-sm" 
                        style={{ backgroundColor: v.color }} 
                      />
                      <input 
                        className="bg-transparent border-none font-bold text-sm w-12 outline-none" 
                        value={v.label} 
                        onChange={(e) => updateVector(v.id, 'label', e.target.value)}
                      />
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => updateVector(v.id, 'visible', !v.visible)} className="text-slate-400 hover:text-indigo-600">
                        {v.visible ? <Maximize2 size={14} /> : <Settings size={14} />}
                      </button>
                      <button onClick={() => removeVector(v.id)} className="text-slate-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 pl-1">X</label>
                      <Input value={v.x} onChange={(e) => updateVector(v.id, 'x', e.target.value)} className="h-8 text-center" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 pl-1">Y</label>
                      <Input value={v.y} onChange={(e) => updateVector(v.id, 'y', e.target.value)} className="h-8 text-center" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-slate-400 pl-1">Z</label>
                      <Input value={v.z} onChange={(e) => updateVector(v.id, 'z', e.target.value)} className="h-8 text-center" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Surfaces Section */}
          <section>
            <div className="flex items-center justify-between mb-3 text-xs font-black text-slate-400 uppercase tracking-widest">
              <span>Surfaces (z = f(x,y))</span>
              <Button variant="ghost" size="icon" onClick={addSurface} className="h-6 w-6 text-emerald-600">
                <Plus size={16} />
              </Button>
            </div>
            <div className="space-y-3">
              {surfaces.map(s => (
                <div key={s.id} className="p-3 bg-slate-50 border border-slate-200 rounded-xl space-y-3 group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-3 h-3 rounded-full shadow-sm" 
                        style={{ backgroundColor: s.color }} 
                      />
                      <span className="text-sm font-bold text-slate-700">Surface</span>
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => updateSurface(s.id, 'visible', !s.visible)} className="text-slate-400 hover:text-emerald-600">
                        {s.visible ? <Maximize2 size={14} /> : <Settings size={14} />}
                      </button>
                      <button onClick={() => removeSurface(s.id)} className="text-slate-400 hover:text-red-600">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-400 pl-1">z =</label>
                    <Input value={s.equation} onChange={(e) => updateSurface(s.id, 'equation', e.target.value)} className="h-8 font-mono text-sm" />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="p-4 border-t border-slate-100 bg-slate-50">
          <Button variant="outline" className="w-full gap-2 rounded-xl" onClick={() => {
            setVectors([{ id: '1', x: '1', y: '1', z: '1', color: '#4f46e5', visible: true, label: 'v1' }]);
            setSurfaces([]);
          }}>
            <RotateCcw size={16} /> Reset Scene
          </Button>
        </div>
      </div>

      {/* Main Scene Area */}
      <div className="flex-1 relative">
        <div ref={containerRef} className="w-full h-full cursor-move" />

        {/* Floating Controls */}
        <div className="absolute top-6 left-6 flex items-center gap-2">
          {!sidebarOpen && (
            <Button size="icon" onClick={() => setSidebarOpen(true)} className="bg-white/80 backdrop-blur shadow-lg border border-slate-200 hover:bg-white text-slate-800 rounded-full h-10 w-10">
              <ChevronRight size={20} />
            </Button>
          )}
          <div className="bg-white/80 backdrop-blur px-4 py-2 rounded-2xl shadow-lg border border-slate-200 flex items-center gap-4 text-xs font-bold text-slate-500">
            <span className="flex items-center gap-1.5"><Move size={14} /> Drag to Rotate</span>
            <div className="w-px h-4 bg-slate-200" />
            <span className="flex items-center gap-1.5"><Maximize2 size={14} /> Scroll to Zoom</span>
          </div>
        </div>

        {/* Legend */}
        <div className="absolute bottom-6 right-6 p-4 bg-white/80 backdrop-blur rounded-2xl shadow-lg border border-slate-200 space-y-2">
          <div className="flex items-center gap-3 text-xs font-bold">
            <div className="w-8 h-1 bg-red-500 rounded-full" />
            <span className="text-slate-600">X - Axis (Red)</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold">
            <div className="w-8 h-1 bg-green-500 rounded-full" />
            <span className="text-slate-600">Z - Axis (Up/Green)</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-bold">
            <div className="w-8 h-1 bg-blue-500 rounded-full" />
            <span className="text-slate-600">Y - Axis (Blue)</span>
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
