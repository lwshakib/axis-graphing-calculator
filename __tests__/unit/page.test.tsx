import "@testing-library/jest-dom";
import { render, screen } from "@testing-library/react";
import Page from "../../app/page";

describe("Home Page", () => {
  it("renders the hero section with branding text", () => {
    render(<Page />);

    const branding = screen.getByText(/Studio Grade Mathematics/i);
    expect(branding).toBeInTheDocument();
  });

  it("renders the main heading", () => {
    render(<Page />);

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent(/Precise/i);
  });

  it("renders feature sections", () => {
    render(<Page />);

    expect(screen.getByText(/Graphing Workspace/i)).toBeInTheDocument();
    expect(screen.getByText(/3D Mapping/i)).toBeInTheDocument();
    expect(screen.getByText(/Scientific Suite/i)).toBeInTheDocument();
    expect(screen.getByText(/Standard Calc/i)).toBeInTheDocument();
  });
});
