import { render, screen } from "@testing-library/react";
import { Logo } from "../../components/logo";

describe("Logo Component", () => {
  it("renders the logo text AXIS by default", () => {
    render(<Logo />);
    expect(screen.getByText("AXIS")).toBeInTheDocument();
  });

  it("does not render text when showText is false", () => {
    render(<Logo showText={false} />);
    expect(screen.queryByText("AXIS")).not.toBeInTheDocument();
  });

  it("applies custom class names to text", () => {
    render(<Logo textClassName="custom-text-class" />);
    const textElement = screen.getByText("AXIS");
    expect(textElement).toHaveClass("custom-text-class");
  });

  it("renders the SVG icon", () => {
    const { container } = render(<Logo />);
    const svgElement = container.querySelector("svg");
    expect(svgElement).toBeInTheDocument();
  });
});
