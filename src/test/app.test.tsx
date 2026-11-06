import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "@/App";

/** Opens the app at a path, the way a visitor following a link would. */
function renderAt(path: string, language: "en" | "fa" = "en") {
  window.localStorage.setItem("settings.language", JSON.stringify(language));
  window.history.replaceState(null, "", path);
  return render(<App />);
}

const joinedIds = () => JSON.parse(window.localStorage.getItem("communities.joined") ?? "null") as string[] | null;

describe("the app", () => {
  it("opens the home page with the footer links", async () => {
    renderAt("/");
    expect(await screen.findByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute("href", "/about");
  });

  it("opens a community straight from its clean URL", async () => {
    renderAt("/community/python-pros");
    expect(await screen.findByRole("heading", { level: 1, name: /python/i })).toBeInTheDocument();
    expect(document.title).toMatch(/python/i);
  });

  it("shows the 404 page for an unknown address", async () => {
    renderAt("/no-such-page");
    expect(await screen.findByText("Page not found")).toBeInTheDocument();
  });

  it("joins and leaves a community, and remembers it", async () => {
    const user = userEvent.setup();
    renderAt("/community/python-pros");

    const join = (await screen.findAllByRole("button", { name: "Join" })).find((button) => button.hasAttribute("aria-pressed"))!;
    await user.click(join);
    await waitFor(() => expect(joinedIds()).toContain("python-pros"));

    const leave = screen.getAllByRole("button", { name: "Leave" }).find((button) => button.hasAttribute("aria-pressed"))!;
    expect(leave).toHaveAttribute("aria-pressed", "true");
    await user.click(leave);
    await waitFor(() => expect(joinedIds()).not.toContain("python-pros"));
  });

  it("checks the contact form before sending", async () => {
    const user = userEvent.setup();
    renderAt("/contact");

    await user.click(await screen.findByRole("button", { name: "Send message" }));
    expect(await screen.findByText("Please enter your name.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Write at least 10 characters.")).toBeInTheDocument();
  });

  it("switches the whole page to right-to-left for Persian", async () => {
    renderAt("/", "fa");
    await screen.findByRole("heading", { level: 1 });
    expect(document.documentElement).toHaveAttribute("lang", "fa");
    expect(document.documentElement).toHaveAttribute("dir", "rtl");
    expect(screen.getByRole("link", { name: "درباره‌ی ما" })).toHaveAttribute("href", "/about");
  });
});
