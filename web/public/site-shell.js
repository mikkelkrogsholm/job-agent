document.documentElement.classList.add("shell-js");

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
