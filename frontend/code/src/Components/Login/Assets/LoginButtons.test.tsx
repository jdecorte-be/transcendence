import { render, screen } from "@testing-library/react";
import { Button } from "./Button";
import { GithubButton } from "./GithubButton";

describe("Button", () => {
  it("renders the 42 login button svg", () => {
    const { container } = render(<Button />);
    expect(container.querySelector("svg")).toBeInTheDocument();
  });
});

describe("GithubButton", () => {
  it("renders the GitHub login call to action", () => {
    render(<GithubButton />);
    expect(screen.getByText("Continue with GitHub")).toBeInTheDocument();
  });
});
