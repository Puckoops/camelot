import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import {
  Chip,
  ChoiceGroup,
  Field,
  formatIsoDate,
  initials,
  Input,
  parseIso,
  SegmentedControl,
  Table,
  TBody,
  Th,
  THead,
  toIso,
} from "../index";

describe("Chip", () => {
  it("keeps its glyph beside the label so the state reads without colour", () => {
    const { container } = render(<Chip tone="red" glyph="triangle">Overdue</Chip>);
    expect(screen.getByText("Overdue")).toBeTruthy();
    expect(container.querySelector("svg")).not.toBeNull();
  });
});

describe("SegmentedControl", () => {
  it("moves the selection with the arrow keys and wraps around", () => {
    const onChange = vi.fn();
    render(
      <SegmentedControl
        aria-label="View"
        defaultValue="agenda"
        onValueChange={onChange}
        options={[
          { value: "month", label: "Month" },
          { value: "week", label: "Week" },
          { value: "agenda", label: "Agenda" },
        ]}
      />,
    );
    fireEvent.keyDown(screen.getByRole("radiogroup"), { key: "ArrowRight" });
    expect(onChange).toHaveBeenLastCalledWith("month");
    expect(screen.getByRole("radio", { name: "Month" }).getAttribute("aria-checked")).toBe("true");
  });
});

describe("ChoiceGroup", () => {
  it("marks exactly the clicked option as checked", () => {
    render(
      <ChoiceGroup
        aria-label="Priority"
        options={[
          { value: "1", label: "P1" },
          { value: "2", label: "P2" },
        ]}
      />,
    );
    fireEvent.click(screen.getByRole("radio", { name: "P2" }));
    expect(screen.getByRole("radio", { name: "P2" }).getAttribute("aria-checked")).toBe("true");
    expect(screen.getByRole("radio", { name: "P1" }).getAttribute("aria-checked")).toBe("false");
  });
});

describe("Field", () => {
  it("labels its control and points it at the error", () => {
    render(
      <Field label="Client name" error="Enter a name">
        <Input />
      </Field>,
    );
    const input = screen.getByLabelText("Client name");
    expect(input.getAttribute("aria-invalid")).toBe("true");
    const describedBy = input.getAttribute("aria-describedby");
    expect(describedBy && document.getElementById(describedBy)?.textContent).toBe("Enter a name");
  });
});

describe("Table", () => {
  it("keeps the header when filtered to nothing", () => {
    render(
      <Table isEmpty empty={<p>Nothing matches these filters.</p>}>
        <THead>
          <tr>
            <Th>File</Th>
          </tr>
        </THead>
        <TBody />
      </Table>,
    );
    expect(screen.getByRole("columnheader", { name: "File" })).toBeTruthy();
    expect(screen.getByText("Nothing matches these filters.")).toBeTruthy();
  });
});

describe("helpers", () => {
  it("builds initials from one or more names", () => {
    expect(initials("Annika Revell")).toBe("AR");
    expect(initials("Priya Nandakumar Rao")).toBe("PR");
    expect(initials("Tom")).toBe("TO");
  });

  it("round-trips ISO dates without touching the timezone", () => {
    expect(parseIso("2026-09-30")).toEqual({ y: 2026, m: 8, d: 30 });
    expect(toIso(2026, 8, 30)).toBe("2026-09-30");
    expect(formatIsoDate("2026-09-30")).toBe("30 Sep 2026");
    expect(formatIsoDate("2026-10-02", false)).toBe("02 Oct");
  });
});
