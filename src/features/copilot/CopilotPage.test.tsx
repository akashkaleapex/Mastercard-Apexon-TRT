import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it } from "vitest";
import { CopilotPage } from "@/features/copilot/CopilotPage";

describe("CopilotPage", () => {
  it("shows event-linked evidence and bounds unsupported questions", async () => {
    const user = userEvent.setup();

    render(
      <MemoryRouter initialEntries={["/events/TRT-2025-892/copilot"]}>
        <Routes>
          <Route path="/events/:eventId/copilot" element={<CopilotPage />} />
        </Routes>
      </MemoryRouter>,
    );

    await user.click(screen.getByRole("button", {
      name: "How does transaction velocity compare with the reference?",
    }));
    expect(screen.getByText(/A reference series is available for this event/)).toBeInTheDocument();
    await user.click(screen.getByText("Evidence · 1"));
    expect(screen.getByText("Velocity comparison")).toBeInTheDocument();

    await user.type(screen.getByLabelText("Ask about this event"), "What is the weather tomorrow?");
    await user.click(screen.getByRole("button", { name: "Send message" }));
    expect(screen.getByText(/I can answer questions about this event/)).toBeInTheDocument();

    const assistantMessages = document.querySelectorAll(".message-assistant");
    expect(assistantMessages).toHaveLength(2);
    expect(within(assistantMessages[1] as HTMLElement).queryByText(/Evidence ·/)).not.toBeInTheDocument();
  });
});