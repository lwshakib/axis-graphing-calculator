# Contributing to AXIS Graphing Calculator

First off, thank you for considering contributing to AXIS! It's people like you who make AXIS such a great tool for the mathematical community.

## 🌈 Development Workflow

1. **Fork & Clone**: Fork the repository and clone it to your local machine.
2. **Branching**: Create a branch for your feature or bugfix: `git checkout -b feature/amazing-feature` or `git checkout -b fix/asymptote-rendering`.
3. **Draft**: Implement your changes. Ensure you follow the project's aesthetic and functional standards.
4. **Style**: AXIS favors a "Designed for Mastery" look—sharp corners, minimal fluff, and high-performance rendering.
5. **Commit**: Use descriptive commit messages. We follow the conventional commits format (e.g., `feat:`, `fix:`, `style:`, `refactor:`).
6. **PR**: Push to your fork and submit a Pull Request.

## 🛠 Project Structure

- `/app`: Next.js App Router pages and layouts.
- `/components`: Reusable UI components.
  - `/ui`: Base primitive components.
- `/lib`: Helper functions, math parsers, and authentication logic.
- `/prisma`: Database schema and migrations.
- `/public`: Static assets and icons.

## 🎨 Coding Standards

- **TypeScript**: Always use TypeScript. Avoid `any` where possible.
- **Styling**: Use Tailwind CSS. Favor variables from `globals.css` for brand consistency.
- **Performance**: Mathematical rendering should be optimized. For 2D canvas, use adaptive sampling. For 3D, keep the vertex count reasonable.
- **Icons**: Use `lucide-react` for all iconography.

## 🧪 Testing

Before submitting a PR, please ensure:
- The project builds successfully: `npm run build` or `bun run build`.
- No linting errors exist.
- New features are tested against high-scale zooming and complex mathematical expressions.

## 🐞 Reporting Issues

- Use the provided **Bug Report** template for technical issues.
- Use the **Feature Request** template for suggestions.
- Provide mathematical expressions or screenshots to demonstrate edge cases.

## 📄 License

By contributing, you agree that your contributions will be licensed under its MIT License.

Happy Coding! 📐
