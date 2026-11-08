import { describe, expect, it } from "vitest";
import { cleanup, render, screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "@/App";
import { createMemoryServer, type MemoryServer } from "@/lib/backend/memory";
import type { Backend } from "@/lib/backend/types";

/** Opens the app at a path, the way a visitor following a link would. */
function renderAt(path: string, { language = "en", backend }: { language?: "en" | "fa"; backend?: Backend } = {}) {
  window.localStorage.setItem("settings.language", JSON.stringify(language));
  window.history.replaceState(null, "", path);
  return render(<App backend={backend ?? createMemoryServer().connect()} />);
}

/** A browser that is already signed in to an account on the server. */
async function signedInBrowser(server: MemoryServer, name = "Sara", email = "sara@example.com") {
  const browser = server.connect();
  await browser.signUp({ displayName: name, email, password: "correct-horse" });
  return browser;
}

/** The Join/Leave button in the community banner (it is a toggle, unlike the cards' links). */
const membershipButton = async (name: string) =>
  (await screen.findAllByRole("button", { name })).find((button) => button.hasAttribute("aria-pressed"))!;

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

  it("checks the contact form before sending", async () => {
    const user = userEvent.setup();
    renderAt("/contact");

    await user.click(await screen.findByRole("button", { name: "Send message" }));
    expect(await screen.findByText("Please enter your name.")).toBeInTheDocument();
    expect(screen.getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(screen.getByText("Write at least 10 characters.")).toBeInTheDocument();
  });

  it("switches the whole page to right-to-left for Persian", async () => {
    renderAt("/", { language: "fa" });
    await screen.findByRole("heading", { level: 1 });
    expect(document.documentElement).toHaveAttribute("lang", "fa");
    expect(document.documentElement).toHaveAttribute("dir", "rtl");
    expect(screen.getByRole("link", { name: "درباره‌ی ما" })).toHaveAttribute("href", "/about");
  });
});

describe("accounts and communities on the server", () => {
  it("asks a visitor to sign up before joining, then joins and leaves on the server", async () => {
    const user = userEvent.setup();
    const server = createMemoryServer();
    renderAt("/community/python-pros", { backend: server.connect() });

    await user.click(await membershipButton("Join"));
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByText(/^Sign in to join .*Python Pros.*\.$/)).toBeInTheDocument();

    await user.click(within(dialog).getByRole("button", { name: "Create account" }));
    await user.type(within(dialog).getByLabelText("Display name"), "Sara");
    await user.type(within(dialog).getByLabelText("Email"), "sara@example.com");
    await user.type(within(dialog).getByLabelText("Password"), "correct-horse");
    await user.click(within(dialog).getByRole("button", { name: "Create account" }));

    // The join the visitor asked for happens right after signing up.
    await waitFor(() => expect(server.memberships).toEqual([expect.objectContaining({ communityId: "python-pros" })]));
    expect(await membershipButton("Leave")).toHaveAttribute("aria-pressed", "true");

    await user.click(await membershipButton("Leave"));
    await waitFor(() => expect(server.memberships).toEqual([]));
    expect(await membershipButton("Join")).toHaveAttribute("aria-pressed", "false");
  });

  it("checks the sign-up form before sending it", async () => {
    const user = userEvent.setup();
    renderAt("/community/python-pros");

    await user.click(await membershipButton("Join"));
    const dialog = await screen.findByRole("dialog");
    await user.click(within(dialog).getByRole("button", { name: "Create account" }));
    await user.type(within(dialog).getByLabelText("Password"), "short");
    await user.click(within(dialog).getByRole("button", { name: "Create account" }));

    expect(within(dialog).getByText("Display name is required.")).toBeInTheDocument();
    expect(within(dialog).getByText("Enter a valid email address.")).toBeInTheDocument();
    expect(within(dialog).getByText("Use at least 8 characters.")).toBeInTheDocument();
    expect(within(dialog).getByLabelText("Display name")).toHaveFocus();
  });

  it("says so when the password is wrong", async () => {
    const user = userEvent.setup();
    const server = createMemoryServer();
    (await signedInBrowser(server)).signOut();
    renderAt("/community/python-pros", { backend: server.connect() });

    await user.click(await membershipButton("Join"));
    const dialog = await screen.findByRole("dialog");
    await user.type(within(dialog).getByLabelText("Email"), "sara@example.com");
    await user.type(within(dialog).getByLabelText("Password"), "wrong-password");
    await user.click(within(dialog).getByRole("button", { name: "Sign in" }));

    expect(await within(dialog).findByRole("alert")).toHaveTextContent("Wrong email or password.");
    expect(server.memberships).toEqual([]);
  });

  it("shows a community created in one browser to everyone else", async () => {
    const user = userEvent.setup();
    const server = createMemoryServer();
    renderAt("/", { backend: await signedInBrowser(server) });

    await user.click((await screen.findAllByRole("button", { name: "Create a community" }))[0]);
    const dialog = await screen.findByRole("dialog");
    await user.type(within(dialog).getByLabelText(/^Name/), "Tehran Game Devs");
    await user.type(within(dialog).getByLabelText(/^Description/), "Indie game makers in Tehran meet here.");
    await user.click(within(dialog).getByRole("button", { name: "Create community" }));

    // The creator lands on the new page, as its owner and first member.
    expect(await screen.findByRole("heading", { level: 1, name: "Tehran Game Devs" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Delete" })).toBeInTheDocument();
    expect(server.communities[0]).toMatchObject({ id: "tehran-game-devs", members: 1 });

    // Another browser, signed out, sees it too, without the owner's Delete button.
    cleanup();
    renderAt("/community/tehran-game-devs", { backend: server.connect() });
    expect(await screen.findByRole("heading", { level: 1, name: "Tehran Game Devs" })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Delete" })).not.toBeInTheDocument();
  });

  it("saves profile changes on the account", async () => {
    const user = userEvent.setup();
    const server = createMemoryServer();
    const browser = await signedInBrowser(server);
    renderAt("/", { backend: browser });

    await user.click((await screen.findAllByRole("button", { name: "Edit profile" }))[0]);
    const dialog = await screen.findByRole("dialog");
    expect(within(dialog).getByLabelText("Email")).toHaveValue("sara@example.com");
    const name = within(dialog).getByLabelText("Display name");
    await user.clear(name);
    await user.type(name, "Sara K.");
    await user.click(within(dialog).getByRole("button", { name: "Save" }));

    await waitFor(() => expect(browser.currentAccount()?.displayName).toBe("Sara K."));
    expect(await screen.findAllByText("Sara K.")).not.toHaveLength(0);
  });

  it("keeps the built-in communities browsable while the server is down", async () => {
    const user = userEvent.setup();
    const server = createMemoryServer();
    server.offline = true;
    renderAt("/", { backend: server.connect() });

    expect(await screen.findByText(/Couldn't reach the server/)).toBeInTheDocument();
    expect(screen.getAllByText("Gaming Zone").length).toBeGreaterThan(0);

    server.offline = false;
    await user.click(screen.getByRole("button", { name: "Try again" }));
    await waitFor(() => expect(screen.queryByText(/Couldn't reach the server/)).not.toBeInTheDocument());
  });
});
