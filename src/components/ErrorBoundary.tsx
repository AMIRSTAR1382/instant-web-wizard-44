import { Component, type ErrorInfo, type ReactNode } from "react";
import { AlertTriangle } from "lucide-react";

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
}

// Class components can't use hooks, so the two languages are inlined here.
const text = {
  en: { title: "Something went wrong", body: "This part of the page couldn't be shown. Reloading usually fixes it.", reload: "Reload page" },
  fa: { title: "مشکلی پیش آمد", body: "این بخش از صفحه نمایش داده نشد. معمولاً با بارگذاری دوباره درست می‌شود.", reload: "بارگذاری دوباره" },
};

/** Shows a friendly message instead of a blank screen when a page crashes. */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError(): ErrorBoundaryState {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Page crashed:", error, info.componentStack);
    // After a new version is uploaded, the old page files are gone. A visitor who still has
    // the previous version open gets a "failed to load module" error: reload once to fix it.
    const isStaleBuild = /dynamically imported module|Importing a module script failed|Loading chunk/i.test(error.message);
    try {
      if (isStaleBuild && !sessionStorage.getItem("reloadedForNewVersion")) {
        sessionStorage.setItem("reloadedForNewVersion", "1");
        window.location.reload();
      }
    } catch {
      // sessionStorage blocked: the reload button below still works.
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;
    const copy = document.documentElement.lang === "fa" ? text.fa : text.en;
    return (
      <div role="alert" className="flex min-h-[50vh] flex-col items-center justify-center gap-3 px-4 text-center">
        <AlertTriangle className="h-10 w-10 text-destructive" aria-hidden="true" />
        <h1 className="text-xl font-bold">{copy.title}</h1>
        <p className="max-w-sm text-sm text-muted-foreground">{copy.body}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          {copy.reload}
        </button>
      </div>
    );
  }
}
