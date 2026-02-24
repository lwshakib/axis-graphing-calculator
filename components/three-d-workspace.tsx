"use client";

/**
 * ThreeDWorkspace Component: A high-performance 3D visualization environment.
 * Powered by Three.js to render vectors and mathematical surfaces in 3D.
 * Features customizable vectors, surface plotting with symbolic parsing,
 * and persistent session saving.
 *
 * Note: Our coordinate system follows common mathematical conventions (Z-Up),
 * while Three.js uses Y-Up. The rendering engine handles this transformation.
 */

import React, { useState, useEffect, useRef } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Eye,
  EyeOff,
  Keyboard,
  Edit3,
} from "lucide-react";
import { compileMath } from "@/lib/math-parser";
import { useTheme } from "next-themes";
import { MathKeyboard } from "@/components/math-keyboard";
import { SaveSessionButton } from "@/components/save-session-button";
import { useRouter } from "next/navigation";

// --- Types & Interfaces ---

/** Represents a 3D vector with components and visual properties. */
interface Vector3D {
  id: string;
  x: string;
  y: string;
  z: string; // Vertical component in math-space
  color: string;
  visible: boolean;
  label: string;
}

/** Represents a mathematical surface defined by a function z = f(x, y). */
interface Surface3D {
  id: string;
  equation: string; // Symbolic expression (e.g., "sin(x) * cos(y)")
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

export function ThreeDWorkspace({
  initialData,
  sessionId,
}: ThreeDWorkspaceProps) {
  // --- UI & Domain State ---
  const containerRef = useRef<HTMLDivElement>(null);

  /** List of vectors plotted in the scene. */
  const [vectors, setVectors] = useState<Vector3D[]>(
    initialData?.vectors || [
      {
        id: "1",
        x: "1",
        y: "1",
        z: "1",
        color: "#4f46e5",
        visible: true,
        label: "v1",
      },
    ],
  );

  /** List of surfaces defined by equations. */
  const [surfaces, setSurfaces] = useState<Surface3D[]>(
    initialData?.surfaces || [
      {
        id: "s1",
        equation: "sin(x) * cos(y)",
        color: "#10b981",
        visible: true,
      },
    ],
  );

  /** Title for the current 3D mapping session. */
  const [title, setTitle] = useState(initialData?.title || "Untitled 3D Map");

  /** Controls the visibility of the control sidebar. */
  const [sidebarOpen, setSidebarOpen] = useState(true);

  /** Stores the database ID of the current session post-save. */
  const [currentSessionId, setCurrentSessionId] = useState<string | undefined>(
    sessionId,
  );

  const router = useRouter();

  // --- Three.js Engine References ---
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const controlsRef = useRef<OrbitControls | null>(null);

  /** Reusable group node that holds all dynamic math objects for easy bulk management. */
  const objectsGroupRef = useRef<THREE.Group | null>(null);
  const gridHelperRef = useRef<THREE.GridHelper | null>(null);
  const zAxisLineRef = useRef<THREE.Line | null>(null);

  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // --- Input & Keyboard State ---
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  /** Tracks which field in the sidebar currently has focus to direct keyboard input. */
  const [activeInput, setActiveInput] = useState<{
    type: "vector" | "surface";
    id: string;
    field?: keyof Vector3D;
  } | null>(null);

  /**
   * Effect: Initialize Three.js Engine.
   * Runs once on mount to set up the scene, camera, renderer, and base lights.
   * Implements OrbitControls for scene navigation.
   */
  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;

    // 1. Scene Setup
    const scene = new THREE.Scene();
    sceneRef.current = scene;

    // 2. Camera: Perspective view with standard 75deg FOV
    const camera = new THREE.PerspectiveCamera(
      75,
      container.clientWidth / container.clientHeight,
      0.1,
      1000,
    );
    camera.position.set(5, 5, 5); // Default isometric-like positioning
    cameraRef.current = camera;

    // 3. Renderer: High-performance WebGL with Alpha transparency and Antialiasing
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    container.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // 4. Controls: Smooth pan/rotate/zoom using mouse/touch
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true; // Adds a polished inertia feeling to movement
    controls.dampingFactor = 0.05;
    controlsRef.current = controls;

    // 5. Dynamic Objects Group: Holds the math objects for easy clearing/re-rendering
    const objectsGroup = new THREE.Group();
    scene.add(objectsGroup);
    objectsGroupRef.current = objectsGroup;

    // 6. Helpers & Axis: Floor grid (X-Y plane) and colored axis indicators
    const gridHelper = new THREE.GridHelper(
      20,
      20,
      isDark ? 0x334155 : 0xcbd5e1,
      isDark ? 0x1e293b : 0xe2e8f0,
    );
    scene.add(gridHelper);
    gridHelperRef.current = gridHelper;

    const axesHelper = new THREE.AxesHelper(5); // Red (X), Green (Y/Up in Three.js), Blue (Z)
    scene.add(axesHelper);

    // Custom Vertical Line to represent the math Z-axis
    const zMaterial = new THREE.LineBasicMaterial({
      color: isDark ? 0x64748b : 0x94a3b8,
    });
    const zPoints = [new THREE.Vector3(0, -5, 0), new THREE.Vector3(0, 5, 0)];
    const zGeometry = new THREE.BufferGeometry().setFromPoints(zPoints);
    const zAxisLine = new THREE.Line(zGeometry, zMaterial);
    scene.add(zAxisLine);
    zAxisLineRef.current = zAxisLine;

    // 7. Lighting: Soft ambient light + directional point light for depth perception
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);
    const pointLight = new THREE.PointLight(0xffffff, 1);
    pointLight.position.set(10, 10, 10);
    scene.add(pointLight);

    // 8. Animation/Render Loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // 9. Resize Handler: Keeps the aspect ratio consistent when window size changes
    const handleResize = () => {
      if (!containerRef.current) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // Cleanup: Dispose of renderer and geometries on unmount
    return () => {
      window.removeEventListener("resize", handleResize);
      renderer.dispose();
      if (container) {
        try {
          container.removeChild(renderer.domElement);
        } catch {
          /* Ignored */
        }
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Effect: React to Theme Changes.
   * Updates Three.js helper colors dynamically when shifting between Light/Dark modes.
   */
  useEffect(() => {
    if (gridHelperRef.current) {
      const gh = gridHelperRef.current;
      const newGrid = new THREE.GridHelper(
        20,
        20,
        isDark ? 0x334155 : 0xcbd5e1,
        isDark ? 0x1e293b : 0xe2e8f0,
      );
      sceneRef.current?.remove(gh);
      sceneRef.current?.add(newGrid);
      gridHelperRef.current = newGrid;
    }
    if (zAxisLineRef.current) {
      (zAxisLineRef.current.material as THREE.LineBasicMaterial).color.set(
        isDark ? 0x64748b : 0x94a3b8,
      );
    }
  }, [isDark]);

  /**
   * Effect: Domain Objects Rendering.
   * Recreates all vectors and mathematical surfaces whenever the data changes.
   * Handles the math-space to Three.js-space coordinate transformation.
   */
  useEffect(() => {
    if (!objectsGroupRef.current) return;
    const group = objectsGroupRef.current;

    /** Bulk Cleanup: Dispose and remove previous frames to prevent memory leaks */
    while (group.children.length > 0) {
      const child = group.children[0] as THREE.Mesh | THREE.Line;
      if (child.geometry) child.geometry.dispose();
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((child as any).material) (child as any).material.dispose();
      group.remove(child);
    }

    // --- Render Vectors ---
    vectors.forEach((v) => {
      if (!v.visible) return;

      const x = parseFloat(v.x) || 0;
      const y = parseFloat(v.y) || 0;
      const z = parseFloat(v.z) || 0;

      /**
       * Coordinate Mapping (Z-Up Assumption):
       * Math(X) -> Three(X)
       * Math(Y) -> Three(-Z)  // Depth axis
       * Math(Z) -> Three(Y)   // Height axis
       */

      // Vector Head (Visualized as a Sphere)
      const sphereGeom = new THREE.SphereGeometry(0.1, 16, 16);
      const sphereMat = new THREE.MeshPhongMaterial({ color: v.color });
      const sphere = new THREE.Mesh(sphereGeom, sphereMat);
      sphere.position.set(x, z, -y);
      group.add(sphere);

      // Vector Stem (Visualized as a semi-transparent Line)
      const linePoints = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(x, z, -y),
      ];
      const lineGeom = new THREE.BufferGeometry().setFromPoints(linePoints);
      const lineMat = new THREE.LineBasicMaterial({
        color: v.color,
        opacity: 0.5,
        transparent: true,
      });
      const line = new THREE.Line(lineGeom, lineMat);
      group.add(line);
    });

    // --- Render Surfaces (Calculated Meshes) ---
    surfaces.forEach((s) => {
      if (!s.visible || !s.equation) return;

      try {
        // Compile the equation once for the surface mesh
        const fn = compileMath(s.equation);
        const segments = 60; // Grid resolution (higher = smoother, slower)
        const range = 10; // Size of the plane in math units

        /**
         * Generate a PlaneGeometry then manually set the vertical displacement
         * (z-attribute) for every vertex based on the math function result.
         */
        const geometry = new THREE.PlaneGeometry(
          range * 2,
          range * 2,
          segments,
          segments,
        );
        const material = new THREE.MeshPhongMaterial({
          color: s.color,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.8,
          wireframe: false,
        });

        const vertices = geometry.attributes.position.array;
        /** Iterate through vertices: position array is [x, y, z, x, y, z, ...] */
        for (let i = 0; i < vertices.length; i += 3) {
          const vx = vertices[i];
          const vy = vertices[i + 1];
          // Evaluate z = f(x, y)
          const zValue = fn({ x: vx, y: vy });

          // Apply displacement (PlaneGeometry uses the 3rd index for depth by default)
          vertices[i + 2] = zValue;
        }

        // Notify Three.js that vertices moved and normals need recalculating for lighting
        geometry.attributes.position.needsUpdate = true;
        geometry.computeVertexNormals();

        const mesh = new THREE.Mesh(geometry, material);
        // Rotate the plane to align with the math coordinate system
        mesh.rotation.x = -Math.PI / 2;
        group.add(mesh);

        /** Sub-Effect: Add a faint wireframe overlay to improve structural visibility */
        const wireframe = new THREE.WireframeGeometry(geometry);
        const line = new THREE.LineSegments(wireframe);
        line.material = new THREE.LineBasicMaterial({
          color: 0x000000,
          opacity: 0.05,
          transparent: true,
        });
        line.rotation.x = -Math.PI / 2;
        group.add(line);
      } catch {
        // Silently catch evaluation errors during active typing
      }
    });
  }, [vectors, surfaces]);

  // --- Handlers: List Management ---

  const addVector = () => {
    setVectors([
      ...vectors,
      {
        id: Math.random().toString(36).substr(2, 9),
        x: "0",
        y: "0",
        z: "0",
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
        visible: true,
        label: `v${vectors.length + 1}`,
      },
    ]);
  };

  const addSurface = () => {
    setSurfaces([
      ...surfaces,
      {
        id: Math.random().toString(36).substr(2, 9),
        equation: "sin(sqrt(x^2+y^2))",
        color: `hsl(${Math.random() * 360}, 70%, 50%)`,
        visible: true,
      },
    ]);
  };

  /** Updates attributes of a vector, ensuring type safety for field indexing. */
  const updateVector = (
    id: string,
    field: keyof Vector3D,
    value: string | boolean,
  ) => {
    setVectors(
      vectors.map((v) => (v.id === id ? { ...v, [field]: value } : v)),
    );
  };

  /** Updates attributes of a surface. */
  const updateSurface = (
    id: string,
    field: keyof Surface3D,
    value: string | boolean,
  ) => {
    setSurfaces(
      surfaces.map((s) => (s.id === id ? { ...s, [field]: value } : s)),
    );
  };

  const removeVector = (id: string) =>
    setVectors(vectors.filter((v) => v.id !== id));
  const removeSurface = (id: string) =>
    setSurfaces(surfaces.filter((s) => s.id !== id));

  /** Integrates with the custom MathKeyboard to handle special keys and auto-parentheses. */
  const handleKeyboardInput = (val: string) => {
    if (!activeInput) return;

    if (activeInput.type === "vector" && activeInput.field) {
      setVectors((prev) =>
        prev.map((v) => {
          if (v.id === activeInput.id) {
            const currentVal = v[activeInput.field!] as string;
            if (val === "backspace")
              return { ...v, [activeInput.field!]: currentVal.slice(0, -1) };
            if (val === "clear") return { ...v, [activeInput.field!]: "" };
            return { ...v, [activeInput.field!]: currentVal + val };
          }
          return v;
        }),
      );
    } else if (activeInput.type === "surface") {
      setSurfaces((prev) =>
        prev.map((s) => {
          if (s.id === activeInput.id) {
            if (val === "backspace")
              return { ...s, equation: s.equation.slice(0, -1) };
            if (val === "clear") return { ...s, equation: "" };

            // Auto-parenthesize common trigonometric and math functions
            const isFunc = [
              "sin",
              "cos",
              "tan",
              "sqrt",
              "log",
              "ln",
              "abs",
            ].includes(val);
            const insert = isFunc ? `${val}(` : val;
            return { ...s, equation: s.equation + insert };
          }
          return s;
        }),
      );
    }
  };

  return (
    <div className="flex h-[calc(100vh-64px)] w-full bg-background overflow-hidden font-sans text-foreground transition-colors duration-300">
      {/* --- Sidebar Panel --- */}
      <div
        className={cn(
          "h-full bg-background border-r border-slate-200 dark:border-slate-800 transition-all duration-300 ease-in-out flex flex-col shadow-xl z-20",
          sidebarOpen ? "w-80" : "w-0 -ml-1 overflow-hidden",
        )}
      >
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-background">
          <div className="flex items-center gap-2 truncate pr-2">
            <Edit3 size={18} className="text-primary flex-shrink-0" />
            <span className="font-black text-sm tracking-tight truncate">
              {title}
            </span>
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
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="rounded-full h-8 w-8"
            >
              <ChevronLeft size={20} />
            </Button>
          </div>
        </div>

        {/* Dynamic List Container */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6 custom-scrollbar">
          {/* Managed Vectors List */}
          <section>
            <div className="flex items-center justify-between mb-3 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
              <span>Vectors</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={addVector}
                className="h-6 w-6 text-indigo-600 dark:text-indigo-400"
              >
                <Plus size={16} />
              </Button>
            </div>
            <div className="space-y-3">
              {vectors.map((v) => (
                <div
                  key={v.id}
                  className="p-4 bg-transparent border border-border rounded-2xl space-y-3 group transition-all duration-300 relative overflow-hidden focus-within:ring-2 focus-within:ring-indigo-500/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full relative overflow-hidden ring-2 ring-white/10 shadow-md transition-all hover:scale-110 group/color"
                        style={{ backgroundColor: v.color }}
                      >
                        <input
                          type="color"
                          value={v.color}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-crosshair scale-150"
                          onChange={(e) =>
                            updateVector(v.id, "color", e.target.value)
                          }
                        />
                      </div>
                      <input
                        className="bg-transparent border-none font-bold text-sm w-16 outline-none rounded-none"
                        value={v.label}
                        onChange={(e) =>
                          updateVector(v.id, "label", e.target.value)
                        }
                        onFocus={() =>
                          setActiveInput({
                            type: "vector",
                            id: v.id,
                            field: "label",
                          })
                        }
                      />
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() =>
                          updateVector(v.id, "visible", !v.visible)
                        }
                        className={cn(
                          "p-1.5 rounded-lg transition-colors",
                          v.visible
                            ? "text-indigo-600"
                            : "text-muted-foreground",
                        )}
                      >
                        {v.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button
                        onClick={() => removeVector(v.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {["x", "y", "z"].map((axis) => (
                      <div key={axis} className="space-y-1">
                        <label className="text-[10px] uppercase font-bold text-muted-foreground/60 block text-center">
                          {axis}
                        </label>
                        <Input
                          value={v[axis as keyof Vector3D] as string}
                          onChange={(e) =>
                            updateVector(
                              v.id,
                              axis as keyof Vector3D,
                              e.target.value,
                            )
                          }
                          onFocus={() =>
                            setActiveInput({
                              type: "vector",
                              id: v.id,
                              field: axis as keyof Vector3D,
                            })
                          }
                          className="h-8 text-center bg-transparent border-none shadow-none rounded-none font-mono text-xs"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Managed Surfaces List */}
          <section>
            <div className="flex items-center justify-between mb-3 text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest px-1">
              <span>Surfaces</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={addSurface}
                className="h-6 w-6 text-emerald-600 dark:text-emerald-400"
              >
                <Plus size={16} />
              </Button>
            </div>
            <div className="space-y-3">
              {surfaces.map((s) => (
                <div
                  key={s.id}
                  className="p-4 bg-transparent border border-border rounded-2xl space-y-3 group transition-all focus-within:ring-2 focus-within:ring-emerald-500/20"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full relative overflow-hidden ring-2 ring-white/10 shadow-md transition-all hover:scale-110 group/color"
                        style={{ backgroundColor: s.color }}
                      >
                        <input
                          type="color"
                          value={s.color}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-crosshair scale-150"
                          onChange={(e) =>
                            updateSurface(s.id, "color", e.target.value)
                          }
                        />
                      </div>
                      <span className="text-sm font-bold">Surface Profile</span>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all">
                      <button
                        onClick={() =>
                          updateSurface(s.id, "visible", !s.visible)
                        }
                        className={cn(
                          "p-1.5 rounded-lg transition-colors",
                          s.visible
                            ? "text-emerald-600"
                            : "text-muted-foreground",
                        )}
                      >
                        {s.visible ? <Eye size={16} /> : <EyeOff size={16} />}
                      </button>
                      <button
                        onClick={() => removeSurface(s.id)}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-600 transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-muted-foreground/60 italic pl-1">
                      z = f(x, y)
                    </label>
                    <Input
                      value={s.equation}
                      onChange={(e) =>
                        updateSurface(s.id, "equation", e.target.value)
                      }
                      onFocus={() =>
                        setActiveInput({ type: "surface", id: s.id })
                      }
                      className="h-8 font-mono text-sm bg-transparent border-none shadow-none rounded-none placeholder:text-muted-foreground/30"
                      placeholder="e.g. sin(x) * cos(y)"
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* --- Sidebar Footer Actions --- */}
        <div className="p-4 border-t border-border bg-background flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className={cn(
              "h-10 px-4 grow gap-2 rounded-xl transition-all font-bold",
              keyboardOpen
                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                : "",
            )}
            onClick={() => setKeyboardOpen(!keyboardOpen)}
          >
            <Keyboard size={18} />
            <span className="text-xs uppercase">Math Keys</span>
          </Button>
          <Button
            variant="outline"
            className="gap-2 rounded-xl h-10 border-border/50 text-muted-foreground hover:text-foreground"
            onClick={() => {
              setVectors([
                {
                  id: "1",
                  x: "1",
                  y: "1",
                  z: "1",
                  color: "#4f46e5",
                  visible: true,
                  label: "v1",
                },
              ]);
              setSurfaces([]);
            }}
          >
            <RotateCcw size={16} /> Reset
          </Button>
        </div>
      </div>

      <MathKeyboard
        isOpen={keyboardOpen}
        onClose={() => setKeyboardOpen(false)}
        onInput={handleKeyboardInput}
      />

      {/* --- Primary Stage Area --- */}
      <div className="flex-1 h-full relative group">
        <div
          ref={containerRef}
          className="w-full h-full cursor-grab active:cursor-grabbing"
        />

        {/* Toggle Sidebar Trigger */}
        <div className="absolute top-6 left-6 flex items-center gap-2">
          {!sidebarOpen && (
            <Button
              size="icon"
              onClick={() => setSidebarOpen(true)}
              className="bg-background/80 backdrop-blur-xl shadow-xl border border-border/50 rounded-full h-10 w-10 hover:bg-accent transition-all duration-300"
            >
              <ChevronRight size={20} className="text-primary" />
            </Button>
          )}
        </div>

        {/* 3D Coordinate Reference Legend */}
        <div className="absolute bottom-6 right-6 p-5 bg-background/80 backdrop-blur-xl rounded-2xl shadow-xl border border-border/50 space-y-3 opacity-60 group-hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-3 text-xs font-black uppercase tracking-tighter">
            <div className="w-8 h-1.5 bg-red-500 rounded-full shadow-sm" />
            <span className="text-muted-foreground">X Axis</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-black uppercase tracking-tighter">
            <div className="w-8 h-1.5 bg-green-500 rounded-full shadow-sm" />
            <span className="text-muted-foreground">Z (Math-Up)</span>
          </div>
          <div className="flex items-center gap-3 text-xs font-black uppercase tracking-tighter">
            <div className="w-8 h-1.5 bg-blue-500 rounded-full shadow-sm" />
            <span className="text-muted-foreground">Y Axis</span>
          </div>
        </div>
      </div>
    </div>
  );
}
