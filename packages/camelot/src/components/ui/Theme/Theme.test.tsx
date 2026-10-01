import { render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { THEME_STORAGE_KEY, themeScriptFor } from "../../../lib/themeScript";
import { ThemeProvider, useTheme } from "./Theme";

function Preference() {
  return <span>{useTheme().preference}</span>;
}

afterEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute("data-theme");
});

describe("ThemeProvider", () => {
  it("falls back to its defaultPreference when nothing is stored", () => {
    render(
      <ThemeProvider defaultPreference="dark">
        <Preference />
      </ThemeProvider>,
    );
    expect(screen.getByText("dark")).toBeTruthy();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });

  it("prefers a stored choice over its default", () => {
    localStorage.setItem(THEME_STORAGE_KEY, "light");
    render(
      <ThemeProvider defaultPreference="dark">
        <Preference />
      </ThemeProvider>,
    );
    expect(screen.getByText("light")).toBeTruthy();
  });
});

describe("themeScriptFor", () => {
  it("applies its fallback before first paint when nothing is stored", () => {
    new Function(themeScriptFor("dark"))();
    expect(document.documentElement.getAttribute("data-theme")).toBe("dark");
  });
});
