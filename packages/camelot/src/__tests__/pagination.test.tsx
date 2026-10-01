import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Pagination, paginationRange } from "../index";

describe("paginationRange", () => {
  it("lists every page when they all fit", () => {
    expect(paginationRange(1, 1)).toEqual([1]);
    expect(paginationRange(2, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(paginationRange(4, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
  });

  it("collapses the far side into an ellipsis near either end", () => {
    expect(paginationRange(1, 12)).toEqual([1, 2, 3, 4, 5, "end-ellipsis", 12]);
    expect(paginationRange(12, 12)).toEqual([1, "start-ellipsis", 8, 9, 10, 11, 12]);
  });

  it("keeps the current page between its siblings in the middle", () => {
    expect(paginationRange(6, 12)).toEqual([1, "start-ellipsis", 5, 6, 7, "end-ellipsis", 12]);
  });

  it("keeps the same length as the page moves so the control never shifts", () => {
    const lengths = Array.from({ length: 20 }, (_, i) => paginationRange(i + 1, 20).length);
    expect(new Set(lengths)).toEqual(new Set([7]));
  });

  it("clamps out-of-range pages and handles an empty list", () => {
    expect(paginationRange(40, 5)).toEqual([1, 2, 3, 4, 5]);
    expect(paginationRange(0, 3)).toEqual([1, 2, 3]);
    expect(paginationRange(1, 0)).toEqual([]);
  });

  it("widens with more siblings and boundaries", () => {
    expect(paginationRange(10, 20, 2, 2)).toEqual([1, 2, "start-ellipsis", 8, 9, 10, 11, 12, "end-ellipsis", 19, 20]);
  });
});

describe("Pagination", () => {
  it("marks the current page and reports the page that was clicked", () => {
    const onPageChange = vi.fn();
    render(<Pagination page={3} pageCount={12} onPageChange={onPageChange} />);
    expect(screen.getByRole("button", { name: "Page 3" }).getAttribute("aria-current")).toBe("page");
    fireEvent.click(screen.getByRole("button", { name: "Page 4" }));
    expect(onPageChange).toHaveBeenLastCalledWith(4);
  });

  it("steps with the arrows and does not report the page it is already on", () => {
    const onPageChange = vi.fn();
    render(<Pagination page={3} pageCount={12} onPageChange={onPageChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenLastCalledWith(4);
    fireEvent.click(screen.getByRole("button", { name: "Previous page" }));
    expect(onPageChange).toHaveBeenLastCalledWith(2);
    fireEvent.click(screen.getByRole("button", { name: "Page 3" }));
    expect(onPageChange).toHaveBeenCalledTimes(2);
  });

  it("disables Previous on the first page and Next on the last", () => {
    const { rerender } = render(<Pagination page={1} pageCount={4} onPageChange={() => {}} />);
    expect((screen.getByRole("button", { name: "Previous page" }) as HTMLButtonElement).disabled).toBe(true);
    expect((screen.getByRole("button", { name: "Next page" }) as HTMLButtonElement).disabled).toBe(false);
    rerender(<Pagination page={4} pageCount={4} onPageChange={() => {}} />);
    expect((screen.getByRole("button", { name: "Next page" }) as HTMLButtonElement).disabled).toBe(true);
  });

  it("reads page and count in the compact and arrows variants", () => {
    const onPageChange = vi.fn();
    const { rerender } = render(<Pagination variant="compact" page={3} pageCount={12} onPageChange={onPageChange} />);
    expect(screen.getByRole("navigation").textContent).toContain("3 / 12");
    expect(screen.getByRole("navigation").textContent).toContain("Page 3 of 12");
    fireEvent.click(screen.getByRole("button", { name: "Next page" }));
    expect(onPageChange).toHaveBeenLastCalledWith(4);

    rerender(<Pagination variant="arrows" page={12} pageCount={12} onPageChange={onPageChange} />);
    expect(screen.getByRole("navigation").textContent).toContain("Page 12 of 12");
    expect((screen.getByRole("button", { name: "Next" }) as HTMLButtonElement).disabled).toBe(true);
    fireEvent.click(screen.getByRole("button", { name: "Previous" }));
    expect(onPageChange).toHaveBeenLastCalledWith(11);
  });
});
