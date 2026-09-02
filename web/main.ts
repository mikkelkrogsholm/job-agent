import "./styles.css";
import { gsap } from "gsap";

document.documentElement.classList.add("js");

const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

if (!reduceMotion.matches) {
  const entrance = gsap.timeline({ defaults: { ease: "power3.out" } });

  entrance
    .from("[data-reveal='copy']", { y: 22, opacity: 0, duration: 0.7, stagger: 0.08 })
    .from("[data-reveal='line']", { yPercent: 110, opacity: 0, duration: 0.9, stagger: 0.11 }, "-=0.72")
    .from("[data-float-card]", { x: 46, y: 24, opacity: 0, scale: 0.94, duration: 0.75, stagger: 0.09 }, "-=0.62")
    .from("[data-conversation-card]", { y: 45, opacity: 0, scale: 0.96, duration: 0.88 }, "-=0.62");

  const stage = document.querySelector<HTMLElement>(".hero-stage");
  const conversation = document.querySelector<HTMLElement>("[data-conversation-card]");
  const floatingCards = gsap.utils.toArray<HTMLElement>("[data-float-card]");

  if (stage && conversation && window.matchMedia("(pointer: fine)").matches) {
    const moveX = gsap.quickTo(conversation, "x", { duration: 0.8, ease: "power3.out" });
    const moveY = gsap.quickTo(conversation, "y", { duration: 0.8, ease: "power3.out" });

    stage.addEventListener("pointermove", (event) => {
      const bounds = stage.getBoundingClientRect();
      const x = (event.clientX - bounds.left) / bounds.width - 0.5;
      const y = (event.clientY - bounds.top) / bounds.height - 0.5;
      moveX(x * 14);
      moveY(y * 10);
      floatingCards.forEach((card, index) => {
        gsap.to(card, {
          x: x * (5 + index * 2),
          y: y * (4 + index),
          duration: 0.9,
          ease: "power3.out",
          overwrite: "auto",
        });
      });
    });

    stage.addEventListener("pointerleave", () => {
      moveX(0);
      moveY(0);
      gsap.to(floatingCards, { x: 0, y: 0, duration: 0.9, ease: "power3.out" });
    });
  }
}

const tabButtons = Array.from(document.querySelectorAll<HTMLButtonElement>("[role='tab']"));
const guidePanels = Array.from(document.querySelectorAll<HTMLElement>("[role='tabpanel']"));

function selectGuide(tab: HTMLButtonElement, moveFocus = false): void {
  const panelId = tab.getAttribute("aria-controls");
  if (!panelId) return;

  tabButtons.forEach((button) => {
    const selected = button === tab;
    button.setAttribute("aria-selected", String(selected));
    button.tabIndex = selected ? 0 : -1;
  });
  guidePanels.forEach((panel) => {
    panel.hidden = panel.id !== panelId;
  });
  if (moveFocus) tab.focus();
}

tabButtons.forEach((tab, index) => {
  tab.addEventListener("click", () => selectGuide(tab));
  tab.addEventListener("keydown", (event) => {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const direction = event.key === "ArrowRight" ? 1 : -1;
    const nextIndex = (index + direction + tabButtons.length) % tabButtons.length;
    const nextTab = tabButtons[nextIndex];
    if (nextTab) selectGuide(nextTab, true);
  });
});

const initialTab = tabButtons.find((tab) => tab.getAttribute("aria-selected") === "true");
if (initialTab) selectGuide(initialTab);

document.querySelectorAll<HTMLAnchorElement>('a[href="#claude-guide"], a[href="#chatgpt-guide"]').forEach((link) => {
  link.addEventListener("click", () => {
    const id = link.hash.slice(1);
    const matchingTab = tabButtons.find((tab) => tab.getAttribute("aria-controls") === id);
    if (matchingTab) selectGuide(matchingTab);
  });
});

document.querySelectorAll<HTMLButtonElement>("[data-copy]").forEach((button) => {
  button.addEventListener("click", async () => {
    const value = button.dataset.copy;
    const label = button.querySelector<HTMLElement>("[data-copy-label]");
    if (!value || !label) return;
    const original = label.textContent ?? "Kopiér";

    try {
      await navigator.clipboard.writeText(value);
      label.textContent = "Kopieret ✓";
    } catch {
      label.textContent = "Kunne ikke kopiere";
    }

    window.setTimeout(() => {
      label.textContent = original;
    }, 1800);
  });
});

const revealItems = document.querySelectorAll<HTMLElement>("[data-scroll-reveal]");

if (reduceMotion.matches || !("IntersectionObserver" in window)) {
  revealItems.forEach((item) => item.classList.add("is-visible"));
} else {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -8%", threshold: 0.12 },
  );
  revealItems.forEach((item) => revealObserver.observe(item));
}
