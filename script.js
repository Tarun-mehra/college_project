/* =========================================================
   RK ARYA COLLEGE | PAGE INTERACTIONS
   ========================================================= */

(() => {
  "use strict";

  // --- DOM Utilities ---

  const toggleVisibility = (element, shouldHide) => {
    if (element) element.classList.toggle("hidden", shouldHide);
  };

  const getFocusableSubmenus = (navigationLinks) =>
    navigationLinks.querySelectorAll(".submenu");

  // --- Navigation ---

  /** Controls desktop dropdowns, nested NAAC links, and outside-click closing. */
  const initializeNavigation = () => {
    const navigationLinks = document.querySelector("#nav-links");
    const navigationOverlay = document.querySelector(".overlay");
    const menuToggle = document.querySelector("#nav-toggle");

    if (!navigationLinks) return;

    const submenus = getFocusableSubmenus(navigationLinks);
    const navigationItems =
      navigationLinks.querySelectorAll(":scope > .nav-item");

    const closeAllSubmenus = () => {
      submenus.forEach((submenu) => toggleVisibility(submenu, true));
      toggleVisibility(navigationOverlay, true);
    };

    const closeMobileMenu = () => {
      navigationLinks.classList.remove("is-open");
      menuToggle?.setAttribute("aria-expanded", "false");
      menuToggle?.setAttribute("aria-label", "Open menu");
    };

    const openSubmenu = (submenu, parentItem) => {
      navigationItems.forEach((item) => {
        if (item !== parentItem) {
          item.querySelectorAll(".submenu").forEach((nestedMenu) => {
            toggleVisibility(nestedMenu, true);
          });
        }
      });
      toggleVisibility(submenu, false);
      toggleVisibility(navigationOverlay, false);
    };

    navigationLinks.addEventListener("click", (event) => {
      const nestedToggle = event.target.closest(".submenu-main");
      if (nestedToggle) {
        const nestedMenu = nestedToggle.parentElement?.querySelector(".nested");
        if (nestedMenu) {
          event.stopPropagation();
          toggleVisibility(
            nestedMenu,
            !nestedMenu.classList.contains("hidden"),
          );
        }
        return;
      }

      const mainToggle = event.target.closest(".nav-main");
      if (!mainToggle) return;

      const parentItem = mainToggle.closest(".nav-item");
      const submenu = parentItem?.querySelector(":scope > .submenu");
      if (!submenu) return;

      event.preventDefault();
      const shouldOpen = submenu.classList.contains("hidden");
      shouldOpen ? openSubmenu(submenu, parentItem) : closeAllSubmenus();
    });

    document.addEventListener("click", (event) => {
      if (
        !event.target.closest("#nav-links") &&
        !event.target.closest("#nav-toggle")
      ) {
        closeAllSubmenus();
        closeMobileMenu();
      }
    });

    navigationOverlay?.addEventListener("click", () => {
      closeAllSubmenus();
      closeMobileMenu();
    });

    menuToggle?.addEventListener("click", () => {
      const isExpanded = menuToggle.getAttribute("aria-expanded") === "true";
      menuToggle.setAttribute("aria-expanded", String(!isExpanded));
      menuToggle.setAttribute(
        "aria-label",
        isExpanded ? "Open menu" : "Close menu",
      );
      navigationLinks.classList.toggle("is-open", !isExpanded);
    });
  };

  // --- Scroll Reveal ---

  /** Adds the visible state as animated sections enter the viewport. */
  const initializeScrollReveal = () => {
    const revealElements = document.querySelectorAll(
      ".about-reveal, .value-card, .timeline-item, .leadership-reveal, .leadership-card",
    );

    if (!("IntersectionObserver" in window)) {
      revealElements.forEach((element) => element.classList.add("is-visible"));
      return;
    }

    const revealObserver = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -60px 0px" },
    );

    revealElements.forEach((element) => revealObserver.observe(element));
  };

  // --- Image Sliders ---

  /** Rotates the historical portrait images on a five-second interval. */
  const initializeHistorySlider = () => {
    const historyImages = document.querySelectorAll(".about-history-image");
    if (historyImages.length < 2) return;

    let activeImageIndex = 0;
    historyImages[activeImageIndex].classList.add("is-active");

    window.setInterval(() => {
      historyImages[activeImageIndex].classList.remove("is-active");
      activeImageIndex = (activeImageIndex + 1) % historyImages.length;
      historyImages[activeImageIndex].classList.add("is-active");
    }, 5000);
  };

  // --- College Gallery ---

  /** Connects thumbnails and previous/next controls to the main campus image. */
  const initializeCollegeGallery = () => {
    const mainImage = document.querySelector("#college-main-image");
    const thumbnails = [...document.querySelectorAll(".college-thumbnail")];
    const previousButton = document.querySelector("[data-gallery-prev]");
    const nextButton = document.querySelector("[data-gallery-next]");
    const gallery = document.querySelector(".college-gallery");

    if (!mainImage || thumbnails.length === 0) return;

    let activeImageIndex = 0;
    let slideTimer;

    const selectImage = (requestedIndex) => {
      activeImageIndex =
        (requestedIndex + thumbnails.length) % thumbnails.length;
      const selectedThumbnail = thumbnails[activeImageIndex];
      const selectedImagePath = selectedThumbnail.dataset.galleryImage;

      mainImage.style.opacity = "0";
      window.setTimeout(() => {
        mainImage.src = selectedImagePath;
        mainImage.style.opacity = "1";
      }, 250);

      thumbnails.forEach((thumbnail, index) => {
        thumbnail.classList.toggle("is-active", index === activeImageIndex);
      });
    };

    const startSlideshow = () => {
      window.clearInterval(slideTimer);
      slideTimer = window.setInterval(
        () => selectImage(activeImageIndex + 1),
        6000,
      );
    };

    thumbnails.forEach((thumbnail, index) => {
      thumbnail.addEventListener("click", () => selectImage(index));
    });
    previousButton?.addEventListener("click", () =>
      selectImage(activeImageIndex - 1),
    );
    nextButton?.addEventListener("click", () =>
      selectImage(activeImageIndex + 1),
    );
    gallery?.addEventListener("mouseenter", () =>
      window.clearInterval(slideTimer),
    );
    gallery?.addEventListener("mouseleave", startSlideshow);

    selectImage(0);
    startSlideshow();
  };

  // --- Application Bootstrap ---

  const initializePage = () => {
    initializeNavigation();
    initializeScrollReveal();
    initializeHistorySlider();
    initializeCollegeGallery();
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initializePage, {
      once: true,
    });
  } else {
    initializePage();
  }
})();
