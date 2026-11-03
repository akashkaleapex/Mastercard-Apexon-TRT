import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { BRDWorkspace } from "@/features/brd/BRDWorkspace";
import { WorkshopMeetings } from "@/features/workshop/WorkshopMeetings";

function renderBRD(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes><Route path="*" element={<BRDWorkspace />} /></Routes>
    </MemoryRouter>,
  );
}

describe("BRD SafetyNet application", () => {
  it("renders its own dashboard and persistent Copilot", () => {
    renderBRD("/brd/dashboard");

    expect(screen.getByRole("heading", { name: "TRT Dashboard" })).toBeInTheDocument();
    expect(screen.getByText("Active TRTs").parentElement).toHaveTextContent("27");
    expect(screen.getByRole("complementary", { name: "SafetyNet Investigation Copilot" })).toBeInTheDocument();
  });

  it("opens and closes the responsive Copilot panel", async () => {
    const user = userEvent.setup();
    renderBRD("/brd/dashboard");
    const launcher = screen.getByRole("button", { name: "SafetyNet Copilot" });

    await user.click(launcher);
    expect(launcher).toHaveAttribute("aria-expanded", "true");
    await user.click(screen.getByRole("button", { name: "Close Copilot panel" }));
    expect(launcher).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("button", { name: "Reopen Copilot panel" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Reopen Copilot panel" }));
    expect(screen.queryByRole("button", { name: "Reopen Copilot panel" })).not.toBeInTheDocument();
    expect(screen.getByRole("complementary", { name: "SafetyNet Investigation Copilot" })).toHaveAttribute("aria-hidden", "false");
  });

  it("opens the TRT investigation as the BRD entry route", () => {
    renderBRD("/brd");

    expect(screen.getByRole("heading", { name: "TRT-2026-7821" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");
  });

  it("opens mobile navigation and closes it after selecting an investigation tab", async () => {
    const user = userEvent.setup();
    renderBRD("/brd");

    await user.click(screen.getByRole("button", { name: "Open navigation" }));
    expect(screen.getByRole("button", { name: "Close navigation" })).toHaveAttribute("aria-expanded", "true");
    await user.click(screen.getByRole("button", { name: "Evidence" }));

    expect(screen.getByRole("button", { name: "Open navigation" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("tab", { name: "Evidence" })).toHaveAttribute("aria-selected", "true");
  });

  it("expands a transaction row into traceable sample details by keyboard", async () => {
    const user = userEvent.setup();
    renderBRD("/brd/trt/TRT-2026-7821");
    await user.click(screen.getByRole("tab", { name: "Evidence" }));

    const table = screen.getByRole("table", { name: "Raw transaction grid" });
    const transaction = within(table).getAllByRole("row")[1];
    transaction.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByText("Sample record details")).toBeInTheDocument();
    expect(screen.getByText(/Synthetic transaction sample/)).toBeInTheDocument();
    expect(transaction).toHaveAttribute("aria-expanded", "true");
  });

  it("shows Copilot evidence and opens it in the current investigation", async () => {
    const user = userEvent.setup();
    renderBRD("/brd/dashboard");

    await user.click(screen.getByRole("button", { name: "Show strongest indicators." }));
    expect(screen.getByText(/Ticketmaster share \(82%\) conflicts with the displayed transaction aggregate/)).toBeInTheDocument();
    expect(screen.getByText("Transaction Volume Trend")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Inspect in workspace" }));

    expect(screen.getByRole("tab", { name: "Evidence" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("heading", { name: "Raw Transaction Grid" })).toBeInTheDocument();
  });

  it("opens the investigation from Copilot context and answers the starter question", async () => {
    const user = userEvent.setup();
    renderBRD("/brd/dashboard");

    await user.click(screen.getByRole("button", { name: "Open investigation TRT-2026-7821" }));
    expect(screen.getByRole("heading", { name: "TRT-2026-7821" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Why is this BIN Attack?" }));

    expect(screen.getByText("Why this was flagged")).toBeInTheDocument();
    expect(screen.getByText(/velocity 380% above baseline/)).toBeInTheDocument();
    expect(screen.getByText(/transaction rows are synthetic/)).toBeInTheDocument();
  });

  it("scrolls Copilot to the top when a suggested question is selected", async () => {
    const user = userEvent.setup();
    renderBRD("/brd/trt/TRT-2026-7821");
    const content = screen.getByRole("region", { name: "Copilot investigation content" });
    content.scrollTop = 240;

    await user.click(screen.getByRole("button", { name: "Show similar incidents." }));

    expect(content.scrollTop).toBe(0);
    expect(screen.getByText("Historical comparison")).toBeInTheDocument();
  });

  it("exports the filtered transaction grid as a CSV download", async () => {
    const user = userEvent.setup();
    renderBRD("/brd/trt/TRT-2026-7821");
    await user.click(screen.getByRole("tab", { name: "Evidence" }));

    const createObjectURL = vi.fn((blob: Blob) => {
      expect(blob.type).toBe("text/csv;charset=utf-8");
      return "blob:transactions";
    });
    const revokeObjectURL = vi.fn();
    vi.stubGlobal("URL", { createObjectURL, revokeObjectURL });
    const downloadClick = vi.spyOn(HTMLAnchorElement.prototype, "click").mockImplementation(() => undefined);

    try {
      await user.click(screen.getByRole("button", { name: "Export CSV" }));
      expect(createObjectURL).toHaveBeenCalledOnce();
      expect(revokeObjectURL).toHaveBeenCalledWith("blob:transactions");
      expect(downloadClick).toHaveBeenCalledOnce();
      const csvBlob = createObjectURL.mock.calls[0][0];
      expect(await csvBlob.text()).toContain("Timestamp");
    } finally {
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    }
  });

  it("filters the separate TRT queue", async () => {
    const user = userEvent.setup();
    renderBRD("/brd/queue");

    await user.selectOptions(screen.getByLabelText("Pattern"), "BIN Attack");
    expect(screen.getByRole("row", { name: /TRT-2026-7821/ })).toBeInTheDocument();
    expect(screen.getByRole("row", { name: /TRT-2026-7822/ })).toBeInTheDocument();
    expect(screen.queryByRole("row", { name: /TRT-2026-7823/ })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Created from"), { target: { value: "2026-10-30" } });
    expect(screen.queryByRole("row", { name: /TRT-2026-7821/ })).not.toBeInTheDocument();
  });

  it("provides overview, evidence, historical, and recommendation tabs", async () => {
    const user = userEvent.setup();
    renderBRD("/brd/trt/TRT-2026-7821");

    expect(screen.getByRole("heading", { name: "Likely Fraudulent BIN Attack" })).toBeInTheDocument();
    expect(screen.getByText("51 PANs responsible for 67% of traffic")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Evidence" }));
    expect(screen.getByRole("heading", { name: "Raw Transaction Grid" })).toBeInTheDocument();
    const table = screen.getByRole("table", { name: "Raw transaction grid" });
    expect(within(table).getAllByRole("row")).toHaveLength(11);
    expect(screen.getByText(/50 of 50 masked transactions/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Columns" }));
    const cryptogramColumn = screen.getByRole("checkbox", { name: "Cryptogram" });
    expect(cryptogramColumn).toBeChecked();
    await user.click(cryptogramColumn);
    expect(within(table).queryByRole("columnheader", { name: "Cryptogram" })).not.toBeInTheDocument();
    await user.click(cryptogramColumn);
    expect(within(table).getByRole("columnheader", { name: "Cryptogram" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Transaction page 2" }));
    expect(screen.getByText("11–20").parentElement).toHaveTextContent("11–20 of 50");
    await user.type(screen.getByLabelText("Search transactions"), "Ticketmaster");
    expect(screen.getByText(/20 of 50 masked transactions/)).toBeInTheDocument();
    expect(within(table).getAllByText("Ticketmaster")).toHaveLength(10);
    await user.clear(screen.getByLabelText("Search transactions"));
    await user.selectOptions(screen.getByLabelText("Filter Country"), "India");
    expect(screen.getByText(/25 of 50 masked transactions/)).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Historical Context" }));
    expect(screen.getByRole("heading", { name: "Case Comparisons" })).toBeInTheDocument();
    expect(screen.getAllByText("TRT-2025-1234")).toHaveLength(2);

    await user.click(screen.getByRole("tab", { name: "Recommendation" }));
    expect(screen.getByRole("heading", { name: "Continue SafetyNet Blocking" })).toBeInTheDocument();
    expect(screen.getByLabelText("Analyst Notes")).toBeInTheDocument();
  });

  it("requires a selected decision and analyst notes before recording", async () => {
    const user = userEvent.setup();
    renderBRD("/brd/trt/TRT-2026-7821");
    await user.click(screen.getByRole("tab", { name: "Recommendation" }));

    const approve = screen.getByRole("radio", { name: "Approve Recommendation" });
    expect(approve).not.toBeChecked();
    await user.click(screen.getByRole("button", { name: "Record Decision" }));
    expect(screen.getByRole("status")).toHaveTextContent("Select a decision before recording.");

    await user.click(approve);
    expect(approve).toBeChecked();
    await user.click(screen.getByRole("button", { name: "Record Decision" }));
    expect(screen.getByRole("status")).toHaveTextContent("Add analyst notes before recording this decision.");

    await user.type(screen.getByLabelText("Analyst Notes"), "Reviewed the listed supporting evidence.");
    await user.click(screen.getByRole("button", { name: "Record Decision" }));
    expect(screen.getByRole("status")).toHaveTextContent("Approve Recommendation recorded in the POC workspace.");
  });

  it("keeps Workshop Meetings on a separate route component", () => {
    render(<MemoryRouter initialEntries={["/workshop"]}><WorkshopMeetings /></MemoryRouter>);

    expect(screen.getByRole("heading", { name: "Workshop workspace" })).toBeInTheDocument();
    expect(screen.queryByRole("complementary", { name: "SafetyNet Investigation Copilot" })).not.toBeInTheDocument();
  });
});