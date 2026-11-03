import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { PortalLanding } from "@/features/pages/PortalLanding";
import { SafetyNetWorkspace } from "@/features/safetynet/SafetyNetWorkspace";

function CurrentPath() {
  return <output data-testid="current-path">{useLocation().pathname}</output>;
}

function renderWorkspace(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="*" element={<><SafetyNetWorkspace /><CurrentPath /></>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("SafetyNet workspace", () => {
  it("offers Workshop Meetings and BRD Docs from the landing page", () => {
    render(
      <MemoryRouter initialEntries={["/"]}>
        <PortalLanding />
      </MemoryRouter>,
    );

    expect(screen.getByRole("link", { name: /Workshop Meetings/ })).toHaveAttribute("href", "/workshop");
    expect(screen.getByRole("link", { name: /BRD Docs/ })).toHaveAttribute("href", "/brd/trt/TRT-2026-7821");
  });

  it("shows command center metrics and persistent Copilot prompts", () => {
    renderWorkspace("/dashboard");

    expect(screen.getByRole("heading", { name: "TRT Command Center" })).toBeInTheDocument();
    expect(screen.getByText("Open TRTs").parentElement).toHaveTextContent("27");
    expect(screen.getByRole("complementary", { name: "AI Copilot panel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Why is this classified as BIN Attack?" })).toBeInTheDocument();
  });

  it("filters the queue by merchant and opens the selected incident", async () => {
    const user = userEvent.setup();
    renderWorkspace("/queue");

    const search = screen.getByPlaceholderText("Search ICA, merchant, TRT ID...");
    await user.type(search, "Ticketmaster");
    expect(screen.getAllByRole("row")).toHaveLength(4);

    await user.clear(search);
    const incidentRow = screen.getByRole("row", { name: /TRT-2026-7824/ });
    await user.click(incidentRow);
    expect(await screen.findByRole("heading", { name: "TRT-2026-7824" })).toBeInTheDocument();
    expect(screen.getByText("ANZ Australia")).toBeInTheDocument();
  });

  it("returns contextual answers to suggested prompts", async () => {
    const user = userEvent.setup();
    renderWorkspace("/dashboard");

    await user.click(screen.getByRole("button", { name: "Show strongest fraud indicators" }));
    expect(screen.getByText(/repeated cryptogram values, PAN repetition/)).toBeInTheDocument();
  });

  it("requires analyst notes before recording a recommendation", () => {
    renderWorkspace("/recommendations/TRT-2026-7821");

    fireEvent.click(screen.getByRole("button", { name: "Submit investigation" }));
    expect(screen.getByLabelText("Analyst notes Required")).toBeRequired();
  });

  it("searches, filters, and paginates masked transaction examples", async () => {
    const user = userEvent.setup();
    renderWorkspace("/intelligence/TRT-2026-7821");

    expect(screen.getByRole("heading", { name: "Channel distribution" })).toBeInTheDocument();
    expect(screen.getAllByText("Amazon")[0]).toBeInTheDocument();
    expect(screen.getByText("Geo Anomaly").parentElement).toHaveTextContent("Low");
    expect(screen.getByText("Geo Anomaly").parentElement).toHaveTextContent("Not Found");
    const table = screen.getByRole("table", { name: "Raw transaction data" });
    expect(within(table).getAllByRole("row")).toHaveLength(11);
    expect(within(table).getAllByText(/414720••••••/)).toHaveLength(10);

    await user.click(screen.getByRole("button", { name: "Transaction page 2" }));
    expect(screen.getByText("11–20").parentElement).toHaveTextContent("11–20 of 50");

    await user.type(screen.getByLabelText("Search transactions"), "Ticketmaster");
    expect(within(table).getAllByRole("row")).toHaveLength(8);
    expect(within(table).getAllByText("Ticketmaster")).toHaveLength(7);

    await user.clear(screen.getByLabelText("Search transactions"));
    await user.selectOptions(screen.getByLabelText("Filter by Country"), "India");
    expect(screen.getByText("1–9").parentElement).toHaveTextContent("Showing 1–9 of 9");
  });
});