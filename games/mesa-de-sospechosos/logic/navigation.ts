type NavigationTarget = Pick<Window, "history" | "location" | "addEventListener" | "removeEventListener">;
const MARKER = "__mesaDeSospechososExitGuard";

// The duplicate entry is the same URL and retains Next's router state. Back first
// lands there, so it can be confirmed before the in-memory game is unmounted.
export function createExitGuard(target: NavigationTarget, requestExit: () => void) {
  const href = target.location.href;
  let active = true;
  let disposed = false;

  function protectCurrentPage() {
    target.history.pushState({ ...target.history.state, [MARKER]: true }, "", href);
  }

  function dispose() {
    target.removeEventListener("popstate", onPopState, true);
    disposed = true;
  }

  function onPopState(event: Event) {
    if (disposed) return;
    // Run in capture phase before Next handles the route transition.
    event.stopImmediatePropagation();
    if (active) {
      protectCurrentPage();
      requestExit();
    } else {
      // A completed case needs no prompt; skip the same-URL protective entry.
      dispose();
      target.history.go(-1);
    }
  }

  // Reuse our entry on remount (including React Strict Mode) instead of growing
  // the history stack every time a case starts.
  if (!target.history.state?.[MARKER]) protectCurrentPage();
  target.addEventListener("popstate", onPopState, true);

  return {
    setActive(value: boolean) { active = value; },
    confirmBack() {
      dispose();
      target.history.go(-2);
    },
    dispose,
  };
}

export type ExitGuard = ReturnType<typeof createExitGuard>;
