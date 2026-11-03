import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { SafetyNetWorkspace } from "@/features/safetynet/SafetyNetWorkspace";

function renderWorkspace(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="*" element={<SafetyNetWorkspace />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("SafetyNet workspace", () => {
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

  it("provides fifty masked transaction examples", () => {
    renderWorkspace("/intelligence/TRT-2026-7821");

    expect(screen.getByRole("heading", { name: "Channel distribution" })).toBeInTheDocument();
    const table = screen.getByRole("table", { name: "" });
    expect(within(table).getAllByRole("row")).toHaveLength(51);
    expect(within(table).getAllByText(/414720••••••/)).toHaveLength(50);
  });
});