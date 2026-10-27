import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { MemoryPage } from "@/features/memory/MemoryPage";

describe("MemoryPage", () => {
  it("filters history and preserves event links and evidence", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/memory"]}>
        <MemoryPage />
      </MemoryRouter>,
    );

    expect(screen.getByText("4 of 4 records")).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText("Filter by severity"), "Critical");

    expect(screen.getByText("1 of 4 records")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "TRT-2024-087" })).toHaveAttribute(
      "href",
      "/events/TRT-2024-087",
    );

    await user.selectOptions(screen.getByLabelText("Filter by severity"), "");
    const eventRow = screen.getByRole("row", { name: /TRT-2025-892/ });
    await user.click(within(eventRow).getByText("2 items"));

    expect(within(eventRow).getByText("EVD-892-01")).toBeInTheDocument();
    expect(within(eventRow).getByText("Velocity comparison")).toBeInTheDocument();

    await user.type(screen.getByRole("searchbox", { name: "Search history" }), "TRT-2025-892");
    expect(screen.getByText("1 of 4 records")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Clear filters" }));
    expect(screen.getByText("4 of 4 records")).toBeInTheDocument();
  });
});