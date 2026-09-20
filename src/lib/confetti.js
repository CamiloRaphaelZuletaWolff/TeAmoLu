import confetti from "canvas-confetti";
let heart;
export function celebrate(event) {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  heart ||= confetti.shapeFromPath({
    path: "M0 10 C0 0 10 0 10 8 C10 0 20 0 20 10 C20 16 10 23 10 23 C10 23 0 16 0 10Z",
  });
  const rect = event?.currentTarget?.getBoundingClientRect();
  confetti({
    particleCount: 65,
    spread: 85,
    startVelocity: 28,
    scalar: 1.4,
    shapes: [heart],
    colors: ["#e0446f", "#ff7ba9", "#ffc2d6", "#e9c9a3"],
    origin: {
      x: event?.clientX
        ? event.clientX / innerWidth
        : rect
          ? (rect.left + rect.width / 2) / innerWidth
          : 0.5,
      y: event?.clientY
        ? event.clientY / innerHeight
        : rect
          ? (rect.top + rect.height / 2) / innerHeight
          : 0.65,
    },
    disableForReducedMotion: true,
  });
}
