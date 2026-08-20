import { renderHook } from "@testing-library/react";
import { classNames, onEnterOrSpace, useDocumentTitle } from "./helpers";

describe("classNames", () => {
  it("joins truthy class names together", () => {
    expect(classNames("a", "b", "c")).toBe("a b c");
  });

  it("drops falsy values", () => {
    expect(classNames("a", undefined, false, 0, "b")).toBe("a b");
  });

  it("lets tailwind-merge resolve conflicting utility classes", () => {
    expect(classNames("p-2", "p-4")).toBe("p-4");
  });
});

describe("onEnterOrSpace", () => {
  it("calls the handler and prevents default on Enter", () => {
    const handler = jest.fn();
    const preventDefault = jest.fn();
    const listener = onEnterOrSpace(handler);

    listener({ key: "Enter", preventDefault } as unknown as React.KeyboardEvent);

    expect(handler).toHaveBeenCalledTimes(1);
    expect(preventDefault).toHaveBeenCalledTimes(1);
  });

  it("calls the handler on Space", () => {
    const handler = jest.fn();
    const preventDefault = jest.fn();
    const listener = onEnterOrSpace(handler);

    listener({ key: " ", preventDefault } as unknown as React.KeyboardEvent);

    expect(handler).toHaveBeenCalledTimes(1);
  });

  it("ignores other keys", () => {
    const handler = jest.fn();
    const preventDefault = jest.fn();
    const listener = onEnterOrSpace(handler);

    listener({ key: "Tab", preventDefault } as unknown as React.KeyboardEvent);

    expect(handler).not.toHaveBeenCalled();
    expect(preventDefault).not.toHaveBeenCalled();
  });
});

describe("useDocumentTitle", () => {
  it("sets the document title with the site suffix", () => {
    renderHook(() => useDocumentTitle("Profile"));
    expect(document.title).toBe("Profile · Transcendence");
  });

  it("falls back to the site name when no title is given", () => {
    renderHook(() => useDocumentTitle(""));
    expect(document.title).toBe("Transcendence");
  });
});
