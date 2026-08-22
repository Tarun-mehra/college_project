(() => {
  "use strict";

  if (typeof window.Lenis !== "function") return;

  const initLenis = () => {
    const lenis = new window.Lenis({
      lerp: 0.1,
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      smoothTouch: false,
    });

    const raf = (time) => {
      lenis.raf(time);
      window.requestAnimationFrame(raf);
    };

    window.requestAnimationFrame(raf);
  };

  // Wait for DOM and stylesheets to be fully loaded
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initLenis);
  } else {
    initLenis();
  }
})();
