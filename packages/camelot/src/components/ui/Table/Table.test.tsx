import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Table, TBody, Td, Tr } from "./Table";

function row(onClick?: () => void) {
  render(
    <Table>
      <TBody>
        <Tr interactive onClick={onClick}>
          <Td>Brand system</Td>
          <Td>
            <button type="button">Download</button>
          </Td>
        </Tr>
      </TBody>
    </Table>,
  );
  return screen.getByText("Brand system").closest("tr")!;
}

describe("Tr", () => {
  it("opens an interactive row with Enter or Space", () => {
    const open = vi.fn();
    const tr = row(open);
    expect(tr.tabIndex).toBe(0);
    fireEvent.keyDown(tr, { key: "Enter" });
    fireEvent.keyDown(tr, { key: " " });
    expect(open).toHaveBeenCalledTimes(2);
  });

  it("leaves keys pressed on a control inside the row to that control", () => {
    const open = vi.fn();
    row(open);
    fireEvent.keyDown(screen.getByRole("button", { name: "Download" }), { key: "Enter" });
    expect(open).not.toHaveBeenCalled();
  });

  it("stays out of the tab order without a click handler", () => {
    expect(row().hasAttribute("tabindex")).toBe(false);
  });
});
