import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { ActionReviewPage } from "@/features/actions/ActionReviewPage";

describe("ActionReviewPage", () => {
  it("requires action details and records a local analyst decision", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/events/TRT-2025-892/actions"]}>
        <Routes>
          <Route path="/events/:eventId/actions" element={<ActionReviewPage />} />
        </Routes>
      </MemoryRouter>,
    );

    const saveDraft = screen.getByRole("button", { name: "Save draft" });
    expect(saveDraft).toBeDisabled();

    await user.click(screen.getByLabelText("Block"));
    await user.type(screen.getByLabelText("Analyst rationale *"), "Review the event evidence.");
    expect(saveDraft).toBeDisabled();

    await user.selectOptions(screen.getByLabelText("Duration"), "24 hours");
    expect(saveDraft).toBeEnabled();
    await user.click(saveDraft);
    expect(screen.getByText("Draft saved in this workspace.")).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText("Analyst decision"), "Approved");
    await user.click(screen.getByRole("button", { name: "Record decision" }));

    expect(screen.getByText("Analyst decision recorded in this workspace.")).toBeInTheDocument();
    expect(screen.getByText("Approved", { selector: "strong" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Download action packet" })).toBeEnabled();
  });
});