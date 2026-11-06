import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup, configure } from "@testing-library/react";

// Pages are lazy-loaded; the first visit to each one compiles it, which can take a few seconds.
configure({ asyncUtilTimeout: 10_000 });

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  // A storage event with no key makes usePersistentState drop its in-memory copies too.
  window.dispatchEvent(new StorageEvent("storage", { key: null }));
  window.history.replaceState(null, "", "/");
});

// Browser APIs the layout uses that jsdom doesn't have.
if (!window.matchMedia) {
  window.matchMedia = (query: string) =>
    ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }) as MediaQueryList;
}

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
window.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;
window.scrollTo = () => {};
Element.prototype.scrollTo ??= () => {};
Element.prototype.scrollIntoView ??= () => {};
