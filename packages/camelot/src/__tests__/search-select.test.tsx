import { fireEvent, render, screen, within } from "@testing-library/react";
import { useState } from "react";
import { describe, expect, it, vi } from "vitest";
import { Field, SearchSelect, type SearchSelectOption } from "../index";
import { filterOptions } from "../components/ui/SearchSelect/SearchSelect";

const clients: SearchSelectOption[] = [
  { value: "brightwater", label: "Brightwater Foods", meta: "BWF" },
  { value: "nordvik", label: "Nordvik Atelier", meta: "NVA", keywords: ["annika@nordvikatelier.com"] },
  { value: "purslane", label: "Purslane Studio", meta: "PUR" },
  { value: "north", label: "Northgate Café", meta: "NGC" },
  { value: "halden", label: "Halden & Moss", meta: "HAM", disabled: true },
];

const open = () => fireEvent.click(screen.getByRole("combobox", { name: "Client" }));
const search = () => screen.getByRole("combobox", { name: "Search clients" });
const optionNames = () => within(screen.getByRole("listbox")).getAllByRole("option").map((o) => o.textContent);

function ClientField({ onValueChange }: { onValueChange?: (v: string) => void }) {
  const [value, setValue] = useState<string | null>(null);
  return (
    <Field label="Client">
      <SearchSelect
        options={clients}
        value={value}
        onValueChange={(v) => {
          setValue(v);
          onValueChange?.(v);
        }}
        placeholder="Select client"
        searchPlaceholder="Search clients"
      />
    </Field>
  );
}

describe("filterOptions", () => {
  it("ranks label starts, then word starts, then matches anywhere, then keywords", () => {
    expect(filterOptions(clients, "nor").map((o) => o.value)).toEqual(["nordvik", "north"]);
    expect(filterOptions(clients, "studio").map((o) => o.value)).toEqual(["purslane"]);
    expect(filterOptions(clients, "ate").map((o) => o.value)).toEqual(["nordvik", "brightwater", "north"]);
    expect(filterOptions(clients, "annika").map((o) => o.value)).toEqual(["nordvik"]);
  });

  it("ignores case and accents", () => {
    expect(filterOptions(clients, "CAFE").map((o) => o.value)).toEqual(["north"]);
  });
});

describe("SearchSelect", () => {
  it("opens from the field label's control and filters as you type", () => {
    render(<ClientField />);
    open();
    expect(document.activeElement).toBe(search());
    expect(optionNames()).toHaveLength(5);

    fireEvent.change(search(), { target: { value: "bright" } });
    expect(optionNames()).toEqual(["Brightwater FoodsBWF"]);
  });

  it("picks the highlighted option with the arrow keys and Enter", () => {
    const onValueChange = vi.fn();
    render(<ClientField onValueChange={onValueChange} />);
    open();
    fireEvent.change(search(), { target: { value: "nor" } });
    fireEvent.keyDown(search(), { key: "ArrowDown" });
    expect(search().getAttribute("aria-activedescendant")).toBe(within(screen.getByRole("listbox")).getAllByRole("option")[1]!.id);
    fireEvent.keyDown(search(), { key: "Enter" });

    expect(onValueChange).toHaveBeenLastCalledWith("north");
    expect(screen.queryByRole("listbox")).toBeNull();
    expect(screen.getByRole("combobox", { name: "Client" }).textContent).toBe("Northgate Café");
  });

  it("skips disabled options and wraps around", () => {
    const onValueChange = vi.fn();
    render(<ClientField onValueChange={onValueChange} />);
    open();
    fireEvent.keyDown(search(), { key: "ArrowUp" });
    fireEvent.keyDown(search(), { key: "Enter" });
    expect(onValueChange).toHaveBeenLastCalledWith("north");
  });

  it("says so when nothing matches, and Enter does nothing", () => {
    const onValueChange = vi.fn();
    render(<ClientField onValueChange={onValueChange} />);
    open();
    fireEvent.change(search(), { target: { value: "zebra" } });
    expect(screen.getByRole("status").textContent).toBe("Nothing matches “zebra”.");
    fireEvent.keyDown(search(), { key: "Enter" });
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("opens from the keyboard and seeds the search with the typed letter", () => {
    render(<ClientField />);
    const trigger = screen.getByRole("combobox", { name: "Client" });
    fireEvent.keyDown(trigger, { key: "p" });
    expect((search() as HTMLInputElement).value).toBe("p");
    expect(optionNames()).toEqual(["Purslane StudioPUR"]);
  });

  it("selects with a click and shows the choice in the trigger", () => {
    render(<ClientField />);
    open();
    fireEvent.click(screen.getByRole("option", { name: /Purslane Studio/ }));
    expect(screen.getByRole("combobox", { name: "Client" }).textContent).toBe("Purslane Studio");
    open();
    expect(screen.getByRole("option", { name: /Purslane Studio/ }).getAttribute("aria-selected")).toBe("true");
  });
});
