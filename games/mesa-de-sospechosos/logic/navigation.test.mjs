import assert from "node:assert/strict";
import test from "node:test";
import * as navigation from "./navigation.ts";

// A small history implementation: go changes the current entry and emits popstate,
// while pushState truncates Forward entries, as a browser does. No framework mock.
function browserHistory() {
  const events = new EventTarget();
  const entries = [
    { href: "https://game.test/intro", state: { tree: "intro" } },
    { href: "https://game.test/play", state: { tree: "playing", next: true } },
  ];
  let index = 1;
  const history = {
    get state() { return entries[index].state; },
    pushState(state, _title, href) {
      entries.splice(index + 1);
      entries.push({ state, href });
      index++;
    },
    go(delta) {
      const next = index + delta;
      if (next < 0 || next >= entries.length) return;
      index = next;
      events.dispatchEvent(new Event("popstate"));
    },
  };
  return {
    history,
    location: { get href() { return entries[index].href; } },
    addEventListener: events.addEventListener.bind(events),
    removeEventListener: events.removeEventListener.bind(events),
    get entries() { return entries; },
  };
}

test("Back on an active case asks to leave while preserving its URL and router state", () => {
  const browser = browserHistory();
  let requests = 0;
  const guard = navigation.createExitGuard?.(browser, () => requests++);
  assert.ok(guard, "the navigation guard is installed");
  browser.history.go(-1);
  assert.equal(requests, 1);
  assert.equal(browser.location.href, "https://game.test/play");
  assert.equal(browser.history.state.tree, "playing");
  assert.equal(browser.history.state.next, true);
  // Cancel does not navigate or remount. Repeated Back opens the same confirmation.
  browser.history.go(-1);
  assert.equal(requests, 2);
  assert.equal(browser.location.href, "https://game.test/play");
  assert.equal(browser.entries.length, 3, "cancelling does not grow the history stack");
  guard.dispose();
});

test("confirming Back reaches the previous page without reopening the prompt", () => {
  const browser = browserHistory();
  let requests = 0;
  const guard = navigation.createExitGuard?.(browser, () => requests++);
  assert.ok(guard);
  browser.history.go(-1);
  guard.confirmBack();
  assert.equal(browser.location.href, "https://game.test/intro");
  assert.equal(requests, 1);
});

test("finished cases skip the protective entry and leave without prompting", () => {
  const browser = browserHistory();
  let requests = 0;
  const guard = navigation.createExitGuard?.(browser, () => requests++);
  assert.ok(guard);
  guard.setActive(false);
  browser.history.go(-1);
  assert.equal(browser.location.href, "https://game.test/intro");
  assert.equal(requests, 0);
});

test("rematches reuse one protective entry and disposing restores normal navigation", () => {
  const browser = browserHistory();
  let requests = 0;
  const guard = navigation.createExitGuard?.(browser, () => requests++);
  assert.ok(guard);
  guard.setActive(false);
  guard.setActive(true);
  assert.equal(browser.entries.length, 3);
  browser.history.go(-1);
  assert.equal(requests, 1);
  guard.dispose();
  guard.dispose();
  const remounted = navigation.createExitGuard(browser, () => requests++);
  assert.equal(browser.entries.length, 3, "remounts reuse the existing protective entry");
  remounted.dispose();
  browser.history.go(-1);
  assert.equal(requests, 1);
  assert.equal(browser.history.state.tree, "playing");
});
