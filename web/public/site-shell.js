document.documentElement.classList.add("shell-js");

const navigationToggle = document.querySelector(".nav-toggle");
const primaryNavigation = document.querySelector(".primary-nav");

function setNavigationOpen(open) {
  if (!(navigationToggle instanceof HTMLButtonElement) || !(primaryNavigation instanceof HTMLElement)) return;
  navigationToggle.setAttribute("aria-expanded", String(open));
  navigationToggle.setAttribute("aria-label", open ? "Luk menu" : "Åbn menu");
  primaryNavigation.classList.toggle("is-open", open);
}

if (navigationToggle instanceof HTMLButtonElement && primaryNavigation instanceof HTMLElement) {
  navigationToggle.addEventListener("click", () => {
    setNavigationOpen(navigationToggle.getAttribute("aria-expanded") !== "true");
  });
  primaryNavigation.addEventListener("click", (event) => {
    if (event.target instanceof Element && event.target.closest("a")) setNavigationOpen(false);
  });
  document.addEventListener("click", (event) => {
    if (navigationToggle.getAttribute("aria-expanded") !== "true") return;
    if (event.target instanceof Node && navigationToggle.closest(".site-header")?.contains(event.target)) return;
    setNavigationOpen(false);
  });
  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape" || navigationToggle.getAttribute("aria-expanded") !== "true") return;
    setNavigationOpen(false);
    navigationToggle.focus();
  });
  matchMedia("(min-width: 961px)").addEventListener("change", () => setNavigationOpen(false));
}

const analyticsHostname = "job-agent.dk";
const analyticsOrigin = "https://umami.mikkelkrogsholm.dk";
const analyticsWebsiteId = "21fd36d8-1cd9-4071-817a-d20fde71de9b";

if (window.location.hostname === analyticsHostname) {
  const analyticsScript = document.createElement("script");
  analyticsScript.async = true;
  analyticsScript.src = `${analyticsOrigin}/script.js`;
  analyticsScript.dataset.websiteId = analyticsWebsiteId;
  analyticsScript.dataset.domains = analyticsHostname;
  analyticsScript.dataset.doNotTrack = "true";
  document.head.append(analyticsScript);

  const track = (eventName, data) => window.umami?.track(eventName, data);

  document.addEventListener("click", (event) => {
    const target = event.target instanceof Element ? event.target : null;
    const copyButton = target?.closest("[data-copy], .prompt-copy");
    if (copyButton instanceof HTMLElement) {
      const value = copyButton.dataset.copy ?? "";
      if (value.startsWith("codex mcp add")) {
        track("mcp_command_copy", { client: "codex" });
      } else if (value.startsWith("claude mcp add")) {
        track("mcp_command_copy", { client: "claude-code" });
      } else if (value === "https://job-agent.dk/mcp") {
        track("mcp_endpoint_copy");
      } else {
        track("prompt_copy");
      }
      return;
    }

    const link = target?.closest("a[href]");
    if (!(link instanceof HTMLAnchorElement)) return;
    const destination = new URL(link.href, window.location.href);
    if (destination.origin !== window.location.origin) return;

    if (destination.pathname.endsWith(".md")) {
      track("markdown_open", { path: destination.pathname });
    } else if (window.location.pathname === "/" && destination.pathname === "/forloeb/") {
      track("journey_start", { placement: link.closest("header") ? "header" : "page" });
    } else if (destination.pathname.startsWith("/forloeb/") && destination.pathname !== "/forloeb/") {
      track("journey_step_open", { path: destination.pathname });
    } else if (destination.pathname.startsWith("/platforme/") && destination.pathname !== "/platforme/") {
      track("platform_guide_open", { path: destination.pathname });
    }
  });
}

const shellRevealItems = document.querySelectorAll(
  "[data-shell-reveal], [data-component-reveal]",
);
const shellReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

if (shellReducedMotion || !("IntersectionObserver" in window)) {
  shellRevealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const shellObserver = new IntersectionObserver(
    (entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      }
    },
    { threshold: 0.12, rootMargin: "0px 0px -6%" },
  );
  shellRevealItems.forEach((item) => shellObserver.observe(item));
}
