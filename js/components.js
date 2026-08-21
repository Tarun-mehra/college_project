(() => {
  "use strict";

  const loader = document.currentScript;
  const root = loader?.dataset.root || "";

  const refreshStylesheet = () => {
    const stylesheet = document.querySelector("link[href$='style.css']");
    if (stylesheet) stylesheet.href = `${root}style.css?v=navbar-3`;
  };

  const loadComponent = async (selector, file) => {
    const target = document.querySelector(selector);
    if (!target) return;
    const response = await fetch(`${root}components/${file}`);
    if (!response.ok) throw new Error(`Unable to load ${file}`);
    target.outerHTML = await response.text();
  };

  const initializeComponents = async () => {
    refreshStylesheet();
    await Promise.all([
      loadComponent("[data-component='navbar']", "navbar.html"),
      loadComponent("[data-component='footer']", "footer.html"),
    ]);

    document.querySelectorAll("[data-root-link]").forEach((link) => {
      link.href = `${root}${link.getAttribute("href")}`;
    });
    document.querySelectorAll("[data-root-src]").forEach((image) => {
      image.src = `${root}${image.dataset.rootSrc}`;
    });

    const navigationScript = document.createElement("script");
    navigationScript.src = `${root}script.js`;
    document.body.append(navigationScript);
  };

  initializeComponents().catch((error) => console.error(error));
})();
