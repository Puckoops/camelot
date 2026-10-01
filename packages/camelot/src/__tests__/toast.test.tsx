import { act, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Toaster, toast } from "../index";

describe("Toaster", () => {
  it("shows each toast once while two Toasters are mounted, and hands over when the first unmounts", () => {
    const first = render(<Toaster />);
    render(<Toaster />);
    act(() => toast.success("Invoice sent", "Invoice 2046 · Purslane Studio"));
    expect(screen.getAllByText("Invoice sent")).toHaveLength(1);

    first.unmount();
    expect(screen.getAllByText("Invoice sent")).toHaveLength(1);
  });
});
