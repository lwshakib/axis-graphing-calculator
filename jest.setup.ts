import "@testing-library/jest-dom";

// Framer-motion props that should be filtered out from DOM elements
const MOTION_PROPS = new Set([
  "initial",
  "animate",
  "exit",
  "transition",
  "variants",
  "whileHover",
  "whileInView",
  "viewport",
]);

// Mock framer-motion
jest.mock("framer-motion", () => {
  const actual = jest.requireActual("framer-motion");
  const mockMotion = (tagName: string) => {
    const Component = ({ children, ...props }: Record<string, unknown>) => {
      // Filter out framer-motion specific props to avoid warnings
      const filtered: Record<string, unknown> = {};
      for (const key of Object.keys(props)) {
        if (!MOTION_PROPS.has(key)) {
          filtered[key] = props[key];
        }
      }
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      return require("react").createElement(tagName, filtered, children);
    };
    Component.displayName = `motion.${tagName}`;
    return Component;
  };

  return {
    ...actual,
    motion: new Proxy(
      {},
      {
        get: (_target, tagName: string) => mockMotion(tagName),
      },
    ),
    AnimatePresence: ({ children }: Record<string, unknown>) => children,
    useScroll: () => ({
      scrollYProgress: {
        get: () => 0,
        onChange: jest.fn(),
        on: jest.fn(),
      },
    }),
    useTransform: () => 0,
    useSpring: () => 0,
    useReducedMotion: () => false,
  };
});

// Mock ResizeObserver
global.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
};
