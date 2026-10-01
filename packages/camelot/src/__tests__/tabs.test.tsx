import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../index";

function ProjectTabs({ onValueChange, variant }: { onValueChange?: (v: string) => void; variant?: "underline" | "segmented" }) {
  return (
    <Tabs defaultValue="overview" onValueChange={onValueChange} variant={variant}>
      <TabsList aria-label="Project">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="tasks" count={12}>
          Tasks
        </TabsTrigger>
        <TabsTrigger value="files" disabled>
          Files
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview">Brief and budget</TabsContent>
      <TabsContent value="tasks">Twelve open tasks</TabsContent>
      <TabsContent value="files">Contracts</TabsContent>
    </Tabs>
  );
}

describe("Tabs", () => {
  it("shows only the chosen section and switches on press", () => {
    const onValueChange = vi.fn();
    render(<ProjectTabs onValueChange={onValueChange} />);
    expect(screen.getByRole("tabpanel").textContent).toBe("Brief and budget");

    fireEvent.mouseDown(screen.getByRole("tab", { name: /Tasks/ }), { button: 0 });
    expect(onValueChange).toHaveBeenLastCalledWith("tasks");
    expect(screen.getByRole("tab", { name: /Tasks/ }).getAttribute("aria-selected")).toBe("true");
    expect(screen.getByRole("tab", { name: "Overview" }).getAttribute("aria-selected")).toBe("false");
    expect(screen.getByRole("tabpanel").textContent).toBe("Twelve open tasks");
  });

  it("moves between tabs with the arrow keys and skips a disabled tab", async () => {
    render(<ProjectTabs variant="segmented" />);
    const overview = screen.getByRole("tab", { name: "Overview" });
    const tasks = screen.getByRole("tab", { name: /Tasks/ });
    overview.focus();
    fireEvent.keyDown(overview, { key: "ArrowRight" });
    await waitFor(() => expect(document.activeElement).toBe(tasks));
    expect(screen.getByRole("tabpanel").textContent).toBe("Twelve open tasks");

    fireEvent.keyDown(tasks, { key: "ArrowRight" });
    await waitFor(() => expect(document.activeElement).toBe(overview));
    expect(screen.getByRole("tabpanel").textContent).toBe("Brief and budget");
  });

  it("puts the count beside the label", () => {
    render(<ProjectTabs />);
    expect(screen.getByRole("tab", { name: /Tasks/ }).textContent).toBe("Tasks12");
  });
});
