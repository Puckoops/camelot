import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Switch } from "../index";

describe("Switch", () => {
  it("toggles on press and reports the new state", () => {
    const onCheckedChange = vi.fn();
    render(<Switch label="Email me when a task is overdue" onCheckedChange={onCheckedChange} />);
    const control = screen.getByRole("switch", { name: "Email me when a task is overdue" });
    expect(control.getAttribute("aria-checked")).toBe("false");

    fireEvent.click(control);
    expect(control.getAttribute("aria-checked")).toBe("true");
    expect(onCheckedChange).toHaveBeenLastCalledWith(true);

    fireEvent.click(control);
    expect(control.getAttribute("aria-checked")).toBe("false");
    expect(onCheckedChange).toHaveBeenLastCalledWith(false);
  });

  it("toggles from its label and links the description", () => {
    render(<Switch label="Public link" description="Anyone with the link can view the files." />);
    fireEvent.click(screen.getByText("Public link"));
    const control = screen.getByRole("switch", { name: "Public link" });
    expect(control.getAttribute("aria-checked")).toBe("true");
    const describedBy = control.getAttribute("aria-describedby");
    expect(describedBy && document.getElementById(describedBy)?.textContent).toBe("Anyone with the link can view the files.");
  });

  it("follows a controlled value and ignores presses while disabled", () => {
    function Controlled() {
      const [on, setOn] = useState(true);
      return (
        <>
          <Switch aria-label="Auto-archive" checked={on} onCheckedChange={setOn} />
          <Switch aria-label="Locked" disabled />
        </>
      );
    }
    render(<Controlled />);
    const auto = screen.getByRole("switch", { name: "Auto-archive" });
    expect(auto.getAttribute("aria-checked")).toBe("true");
    fireEvent.click(auto);
    expect(auto.getAttribute("aria-checked")).toBe("false");

    const locked = screen.getByRole("switch", { name: "Locked" });
    fireEvent.click(locked);
    expect(locked.getAttribute("aria-checked")).toBe("false");
  });
});
