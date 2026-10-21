import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { trackScroll50, trackScroll90 } from "@/lib/analytics";
import { ScrollDepthTracker } from "./ScrollDepthTracker";

const hooks = vi.hoisted(() => ({ pathname: "/", effects: [] as (() => void | (() => void))[] }));
vi.mock("next/navigation", () => ({ usePathname: () => hooks.pathname }));
vi.mock("react", () => ({
  useRef: (current: boolean) => ({ current }),
  useEffect: (effect: () => void | (() => void)) => hooks.effects.push(effect),
}));
vi.mock("@/lib/analytics", () => ({ trackScroll50: vi.fn(), trackScroll90: vi.fn() }));

describe("scroll depth lifecycle", () => {
  let onScroll: () => void;
  let browser: { scrollY: number; addEventListener: ReturnType<typeof vi.fn>; removeEventListener: ReturnType<typeof vi.fn> };
  beforeEach(() => {
    hooks.pathname = "/";
    hooks.effects = [];
    browser = { scrollY: 0, addEventListener: vi.fn((_event, listener) => { onScroll = listener; }), removeEventListener: vi.fn() };
    vi.stubGlobal("window", browser);
    vi.stubGlobal("document", { title: "Public page", documentElement: { scrollHeight: 2000, clientHeight: 1000 } });
  });
  afterEach(() => vi.unstubAllGlobals());

  it("emits each threshold only once and removes the listener on route exit", () => {
    ScrollDepthTracker();
    const cleanup = hooks.effects[0]();
    browser.scrollY = 500;
    onScroll(); onScroll();
    expect(trackScroll50).toHaveBeenCalledTimes(1);
    expect(trackScroll90).not.toHaveBeenCalled();
    browser.scrollY = 950;
    onScroll(); onScroll();
    expect(trackScroll50).toHaveBeenCalledTimes(1);
    expect(trackScroll90).toHaveBeenCalledTimes(1);
    expect(trackScroll90).toHaveBeenCalledWith({ pagePath: "/", pageTitle: "Public page" });
    if (cleanup) cleanup();
    expect(browser.removeEventListener).toHaveBeenCalledWith("scroll", onScroll);
    hooks.pathname = "/services";
    browser.scrollY = 0;
    ScrollDepthTracker(); hooks.effects[1]();
    browser.scrollY = 950;
    onScroll();
    expect(trackScroll50).toHaveBeenCalledTimes(2);
    expect(trackScroll90).toHaveBeenLastCalledWith({ pagePath: "/services", pageTitle: "Public page" });
  });

  it("does not count an unscrollable page as fully read", () => {
    vi.stubGlobal("document", { title: "Short page", documentElement: { scrollHeight: 1000, clientHeight: 1000 } });
    ScrollDepthTracker(); hooks.effects[0]();
    onScroll();
    expect(trackScroll50).not.toHaveBeenCalled();
    expect(trackScroll90).not.toHaveBeenCalled();
  });
});
