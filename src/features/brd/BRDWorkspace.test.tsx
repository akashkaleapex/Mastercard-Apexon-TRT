import { fireEvent, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import { BRDWorkspace } from "@/features/brd/BRDWorkspace";
import { trtCases } from "@/features/brd/data";

function renderBRD(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes><Route path="*" element={<BRDWorkspace />} /></Routes>
    </MemoryRouter>,
  );
}

const occCount = trtCases.filter((item) => item.source === "OCC ticket").length;
const nextManualId = `TRT-2026-${Math.max(...trtCases.map((item) => Number(item.id.slice(-4)))) + 1}`;
const queueRows = () => within(screen.getByRole("table", { name: "TRT cases" })).getAllByRole("row").slice(1);

describe("BRD SafetyNet application", () => {
  it("renders its own dashboard", () => {
    renderBRD("/dashboard");

    expect(screen.getByRole("heading", { name: "TRT Dashboard" })).toBeInTheDocument();
    expect(screen.queryByText(/confidence/i)).not.toBeInTheDocument();
  });

  it("filters the dashboard by attack type, defaulting to BIN Attack", async () => {
    const user = userEvent.setup();
    renderBRD("/dashboard");
    const attack = screen.getByLabelText("Attack type");
    const activeOf = (pattern?: string) => trtCases.filter((item) => (!pattern || item.pattern === pattern) && item.status !== "Decision Recorded");
    const highRiskIds = () => within(screen.getByRole("table", { name: "High risk TRTs" })).getAllByRole("row").slice(1).map((row) => within(row).getAllByRole("cell")[0].textContent);

    expect(attack).toHaveValue("BIN Attack");
    expect([...attack.querySelectorAll("option")].map((option) => option.textContent)).toEqual(["All attacks", ...new Set(trtCases.map((item) => item.pattern))]);
    expect(screen.getByText("Active TRTs").parentElement).toHaveTextContent(String(activeOf("BIN Attack").length));
    expect(highRiskIds()).toEqual(activeOf("BIN Attack").filter((item) => item.severity === "High").map((item) => item.id));
    expect(screen.getByRole("heading", { name: "Status Distribution" })).toBeInTheDocument();
    expect(screen.getByText("TRT-2026-7821 · Investigation timeline")).toBeInTheDocument();

    await user.selectOptions(attack, "Velocity Attack");
    expect(screen.getByText("Active TRTs").parentElement).toHaveTextContent(String(activeOf("Velocity Attack").length));
    expect(highRiskIds()).toEqual(["TRT-2026-7827"]);
    expect(screen.getByText("Latest Velocity Attack cases received")).toBeInTheDocument();
    expect(screen.getByText("TRT-2026-7827 received")).toBeInTheDocument();

    await user.selectOptions(attack, "All attacks");
    expect(screen.getByText("Active TRTs").parentElement).toHaveTextContent(String(activeOf().length));
    expect(screen.getByRole("heading", { name: "Pattern Distribution" })).toBeInTheDocument();

    await user.selectOptions(attack, "Merchant Attack");
    await user.click(screen.getByRole("button", { name: /Open TRT Queue/ }));
    expect(screen.getByLabelText("Pattern")).toHaveValue("Merchant Attack");
    expect(queueRows().map((row) => within(row).getAllByRole("cell")[0].textContent)).toEqual(["TRT-2026-7824"]);
  });

  it("opens the TRT investigation as the BRD entry route", () => {
    renderBRD("/trt/TRT-2026-7821");

    expect(screen.getByRole("heading", { name: "TRT-2026-7821" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Advisory only")).toBeInTheDocument();
  });

  it("opens mobile navigation and closes it after selecting an investigation tab", async () => {
    const user = userEvent.setup();
    renderBRD("/trt/TRT-2026-7821");

    await user.click(screen.getByRole("button", { name: "Open navigation" }));
    expect(screen.getByRole("button", { name: "Close navigation" })).toHaveAttribute("aria-expanded", "true");
    await user.click(screen.getByRole("button", { name: "Evidence" }));

    expect(screen.getByRole("button", { name: "Open navigation" })).toHaveAttribute("aria-expanded", "false");
    expect(screen.getByRole("tab", { name: "Evidence" })).toHaveAttribute("aria-selected", "true");
  });

  it("expands a transaction row into traceable sample details by keyboard", async () => {
    const user = userEvent.setup();
    renderBRD("/trt/TRT-2026-7821");
    await user.click(screen.getByRole("tab", { name: "Evidence" }));

    const table = screen.getByRole("table", { name: "Raw transaction grid" });
    const transaction = within(table).getAllByRole("row")[1];
    transaction.focus();
    await user.keyboard("{Enter}");

    expect(screen.getByText("Sample record details")).toBeInTheDocument();
    expect(screen.getByText(/Synthetic transaction sample/)).toBeInTheDocument();
    expect(transaction).toHaveAttribute("aria-expanded", "true");
  });

  it("exports the filtered transaction grid as a CSV download", async () => {
    const user = userEvent.setup();
    renderBRD("/trt/TRT-2026-7821");
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
      const csv = await createObjectURL.mock.calls[0][0].text();
      expect(csv).toContain("Timestamp");
      expect(csv).toContain("Decline Source");
    } finally {
      vi.restoreAllMocks();
      vi.unstubAllGlobals();
    }
  });

  it("filters the separate TRT queue", async () => {
    const user = userEvent.setup();
    renderBRD("/queue");

    await user.selectOptions(screen.getByLabelText("Pattern"), "BIN Attack");
    expect(screen.getByRole("row", { name: /TRT-2026-7821/ })).toBeInTheDocument();
    expect(screen.getByRole("row", { name: /TRT-2026-7822/ })).toBeInTheDocument();
    expect(screen.queryByRole("row", { name: /TRT-2026-7823/ })).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Created from"), { target: { value: "2026-10-30" } });
    expect(screen.queryByRole("row", { name: /TRT-2026-7821/ })).not.toBeInTheDocument();
  });

  it("shows queue metrics, the added columns and the queue view filter", async () => {
    const user = userEvent.setup();
    renderBRD("/queue");

    expect(queueRows()).toHaveLength(trtCases.length);
    expect(screen.getByText("Open Cases").parentElement).toHaveTextContent(String(trtCases.filter((item) => !["Decision Recorded", "Linked"].includes(item.status)).length));
    expect(screen.getByText("Manual (OCC)").parentElement).toHaveTextContent(String(occCount));
    for (const column of ["Source", "Signal vs Prior Day", "Severity", "Input Check", "Assistant View"]) {
      expect(screen.getByRole("columnheader", { name: column })).toBeInTheDocument();
    }
    await user.selectOptions(screen.getByLabelText("Queue view"), "warnings");
    expect(queueRows()).toHaveLength(trtCases.filter((item) => item.inputCheck !== "OK").length);
    await user.selectOptions(screen.getByLabelText("Severity"), "Medium");
    expect(queueRows()).toHaveLength(0);
  });

  it("searches by BIN from the header and opens an exact TRT ID", async () => {
    const user = userEvent.setup();
    renderBRD("/dashboard");
    const search = screen.getByRole("searchbox", { name: "Search cases" });

    await user.type(search, "414720{Enter}");
    expect(queueRows().map((row) => within(row).getAllByRole("cell")[0].textContent)).toEqual(["TRT-2026-7821", "TRT-2026-7826"]);
    await user.clear(search);
    await user.type(search, "trt-2026-7823{Enter}");
    expect(screen.getByRole("heading", { name: "TRT-2026-7823" })).toBeInTheDocument();
  });

  it("validates and adds a manual OCC case", async () => {
    const user = userEvent.setup();
    renderBRD("/queue");
    await user.click(screen.getByRole("button", { name: "Add manual case" }));
    const form = screen.getByRole("form", { name: "Add manual case" });

    await user.type(within(form).getByLabelText("Issuer"), "Harbour Bank Ireland");
    await user.type(within(form).getByLabelText("ICA"), "77");
    await user.type(within(form).getByLabelText("Customer Concern"), "Genuine customers declined since 09:00 UTC");
    await user.click(within(form).getByRole("button", { name: "Add to Queue" }));
    expect(screen.getByRole("alert")).toHaveTextContent("ICA must be 4 digits.");

    await user.type(within(form).getByLabelText("ICA"), "12");
    await user.type(within(form).getByLabelText("BIN"), "512345");
    await user.click(within(form).getByRole("button", { name: "Add to Queue" }));
    expect(queueRows()).toHaveLength(trtCases.length + 1);
    expect(queueRows()[0]).toHaveTextContent(nextManualId);
    expect(queueRows()[0]).toHaveTextContent("OCC ticket");
    expect(screen.getByText("Manual (OCC)").parentElement).toHaveTextContent(String(occCount + 1));
  });

  it("provides overview, evidence, historical, and recommendation tabs", async () => {
    const user = userEvent.setup();
    renderBRD("/trt/TRT-2026-7821");

    expect(screen.getByRole("heading", { name: "Pattern Consistent With a BIN Attack · Requires Analyst Review" })).toBeInTheDocument();
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
    await user.type(screen.getByLabelText("Search transactions"), "StageGate");
    expect(screen.getByText(/20 of 50 masked transactions/)).toBeInTheDocument();
    expect(within(table).getAllByText("StageGate Tickets")).toHaveLength(10);
    await user.clear(screen.getByLabelText("Search transactions"));
    await user.selectOptions(screen.getByLabelText("Filter Country"), "India");
    expect(screen.getByText(/25 of 50 masked transactions/)).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Historical Context" }));
    expect(screen.getByRole("heading", { name: "Case Comparisons" })).toBeInTheDocument();
    expect(screen.getAllByText("TRT-2025-1234")).toHaveLength(2);

    await user.click(screen.getByRole("tab", { name: "Recommendation" }));
    expect(screen.getByRole("heading", { name: "Keep the SafetyNet control in place" })).toBeInTheDocument();
    expect(screen.getByLabelText(/Analyst Notes/)).toBeInTheDocument();
  });

  it("adds intake checks, facts and gaps to the overview and logs window, scope and corrections", async () => {
    const user = userEvent.setup();
    renderBRD("/trt/TRT-2026-7821");

    expect(screen.getByText("Ready · 2 non-blocking warnings")).toBeInTheDocument();
    const mapping = screen.getByRole("table", { name: "Pattern-to-data mapping" });
    expect(within(mapping).getAllByText("Mapped")).toHaveLength(6);
    expect(within(mapping).getAllByText("Partial")).toHaveLength(3);
    expect(within(screen.getByRole("region", { name: "Key fraud signals" })).getAllByRole("article")).toHaveLength(8);
    expect(screen.queryByRole("table", { name: "Pattern attribute match" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Extend +15 min" }));
    expect(screen.getByText(/07:45–12:00 UTC/)).toBeInTheDocument();
    await user.click(screen.getByRole("radio", { name: /Indus Financial Group/ }));
    await user.click(screen.getByRole("button", { name: "Request CID Approval" }));
    expect(screen.getByText(/Approval requested/)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /Flag a correction/ }));
    await user.selectOptions(screen.getByLabelText("Signal"), "Merchant Share Mismatch");
    await user.type(screen.getByLabelText("What is wrong"), "Share should use the contributor query");
    await user.click(screen.getByRole("button", { name: "Log Correction" }));
    expect(screen.getByText(/Correction flagged .*contributor query/)).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Evidence" }));
    expect(screen.getByText(/Window change requested/)).toBeInTheDocument();
    expect(within(screen.getByRole("table", { name: "Decline codes in window" })).getByText("8,912")).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Top contributors" })).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Recommendation" }));
    const audit = screen.getByRole("table", { name: "Audit trail" });
    expect(within(audit).getByText("Extraction window changed")).toBeInTheDocument();
    expect(within(audit).getByText("CID scope approval requested")).toBeInTheDocument();
    expect(within(audit).getByText("Correction flagged")).toBeInTheDocument();
  });

  it("links the repeat trigger and lists outcome examples in historical context", async () => {
    const user = userEvent.setup();
    renderBRD("/trt/TRT-2026-7821");
    await user.click(screen.getByRole("tab", { name: "Historical Context" }));

    expect(within(screen.getByRole("table", { name: "Other explanations checked" })).getByText("Not checked")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Outcome Examples" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Declines come from the issuer, not SafetyNet" })).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Link as Repeat" }));
    expect(screen.getByRole("button", { name: "Linked as Repeat" })).toHaveAttribute("aria-pressed", "true");

    await user.click(screen.getByRole("link", { name: /TRT Queue/ }));
    expect(screen.getByRole("row", { name: /TRT-2026-7826/ })).toHaveTextContent("Linked to 7821");
    expect(screen.getByText("Possible Repeats").parentElement).toHaveTextContent("0");
  });

  it("records an advisory decision, resets on change and writes the audit trail", async () => {
    const user = userEvent.setup();
    renderBRD("/trt/TRT-2026-7821");
    await user.click(screen.getByRole("tab", { name: "Recommendation" }));

    expect(screen.getByText(/does not block, whitelist, create UDT requests, change rules or contact customers/)).toBeInTheDocument();
    expect(screen.queryByText(/Suggested threshold/)).not.toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /keep control, consider a block request/ })).toBeChecked();
    expect(screen.getByRole("radio", { name: "Accept" })).toBeChecked();
    expect((screen.getByLabelText(/Analyst Notes/) as HTMLTextAreaElement).value).toContain("Cryptogram replay on BIN 414720");

    await user.click(screen.getByRole("radio", { name: /Seek customer validation/ }));
    expect(screen.getByText(/the L1 team contacts the issuer/)).toBeInTheDocument();
    await user.click(screen.getByRole("checkbox", { name: "Pattern match" }));
    expect(screen.getByRole("checkbox", { name: "Pattern match" })).toBeChecked();

    await user.clear(screen.getByLabelText(/Analyst Notes/));
    await user.click(screen.getByRole("button", { name: "Record Decision" }));
    expect(screen.getByRole("status")).toHaveTextContent("Add analyst notes before recording this decision.");

    await user.type(screen.getByLabelText(/Analyst Notes/), "Ask the issuer to validate the 51 PANs first.");
    await user.click(screen.getByRole("button", { name: "Record Decision" }));
    expect(screen.getByText(/Decision recorded in the PoC evaluation log/)).toBeInTheDocument();
    expect(screen.getByText("Decision Recorded")).toBeInTheDocument();

    await user.click(screen.getByRole("radio", { name: "Amend" }));
    expect(screen.queryByText(/Decision recorded in the PoC evaluation log/)).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Record Decision" }));

    const audit = screen.getByRole("table", { name: "Audit trail" });
    expect(within(audit).getAllByText("Analyst decision recorded")).toHaveLength(2);
    expect(within(audit).getByText(/amended · next step: Seek customer validation/)).toBeInTheDocument();
    expect(within(audit).getAllByText(/corrections: pattern match/)).toHaveLength(2);
    expect(within(audit).queryByText("Pending")).not.toBeInTheDocument();
    expect(screen.getByRole("table", { name: "SME benchmark comparison" })).toBeInTheDocument();
    expect(screen.getByText("Pass threshold")).toBeInTheDocument();

    await user.click(screen.getByRole("link", { name: /TRT Queue/ }));
    expect(screen.getByRole("row", { name: /TRT-2026-7821/ })).toHaveTextContent("Decision Recorded");
  });

  it("copies the UDT summary without submitting anything", async () => {
    const user = userEvent.setup();
    Object.defineProperty(window, "isSecureContext", { configurable: true, value: true });
    renderBRD("/trt/TRT-2026-7821");
    try {
      await user.click(screen.getByRole("tab", { name: "Recommendation" }));
      await user.click(screen.getByRole("button", { name: "Copy summary for UDT request" }));
      expect(await screen.findByText("Summary copied. Nothing was submitted.")).toBeInTheDocument();
      const copied = await navigator.clipboard.readText();
      expect(copied).toContain("TRT-2026-7821 · Indus Commercial Bank India (ICA 3305) · BIN 414720");
      expect(copied).toContain("Not a confirmed fraud finding");
    } finally {
      Object.defineProperty(window, "isSecureContext", { configurable: true, value: false });
    }
  });

  it("uses synthetic issuers and merchants only", () => {
    renderBRD("/queue");
    expect(document.body.textContent).not.toMatch(/Citibank|HSBC|Ticketmaster|Spotify|Netflix|Worldpay|Adyen/);
  });
});
