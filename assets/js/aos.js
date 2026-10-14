/* -------------------------------------------------------------------------- */
/* Lightweight AOS-compatible scroll animation engine                        */
/* -------------------------------------------------------------------------- */

(function (window, document) {
  "use strict";

  const selector = "[data-aos]";
  const reducedMotionQuery = window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)")
    : { matches: false };
  const defaults = {
    offset: 120,
    once: true,
    duration: 800,
    easing: "cubic-bezier(0.22, 1, 0.36, 1)",
  };

  let settings = { ...defaults };
  let observer;
  let cleanupFallback = () => {};
  let cleanupPageEnd = () => {};
  let initialized = false;

  const getNumber = (element, attribute, fallback) => {
    const value = Number(element.dataset[attribute]);
    return Number.isFinite(value) ? value : fallback;
  };

  const prepare = (elements) => {
    elements.forEach((element) => {
      const duration = getNumber(element, "aosDuration", settings.duration);
      const delay = getNumber(element, "aosDelay", 0);
      const easing = element.dataset.aosEasing || settings.easing;

      element.style.setProperty("--aos-duration", `${duration}ms`);
      element.style.setProperty("--aos-delay", `${delay}ms`);
      element.style.setProperty("--aos-easing", easing);
      element.classList.add("aos-init");
    });
  };

  const reveal = (element) => {
    element.classList.add("aos-animate");
  };

  const hide = (element) => {
    if (!settings.once) {
      element.classList.remove("aos-animate");
    }
  };

  const isVisible = (element) => {
    const { top, bottom } = element.getBoundingClientRect();
    const viewportHeight =
      window.innerHeight || document.documentElement.clientHeight;

    return top <= viewportHeight - settings.offset && bottom >= 0;
  };

  const revealVisible = (elements) => {
    elements.forEach((element) => {
      if (isVisible(element)) {
        reveal(element);
      }
    });
  };

  const bindScrollFallback = (elements) => {
    let ticking = false;

    const update = () => {
      if (ticking) {
        return;
      }

      ticking = true;
      const frame =
        window.requestAnimationFrame ||
        ((callback) => window.setTimeout(callback, 16));
      frame(() => {
        elements.forEach((element) => {
          if (!settings.once || !element.classList.contains("aos-animate")) {
            isVisible(element) ? reveal(element) : hide(element);
          }
        });
        ticking = false;
      });
    };

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();

    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  };

  const observe = (elements) => {
    cleanupFallback();
    cleanupPageEnd();
    observer?.disconnect();
    revealVisible(elements);

    if (reducedMotionQuery.matches) {
      elements.forEach(reveal);
      return;
    }

    const revealVisibleAtPageEnd = () => {
      const viewportHeight =
        window.innerHeight || document.documentElement.clientHeight;
      const reachedPageEnd =
        window.scrollY + viewportHeight >= document.documentElement.scrollHeight;

      if (!reachedPageEnd) {
        return;
      }

      elements.forEach((element) => {
        const { top, bottom } = element.getBoundingClientRect();
        if (top <= viewportHeight && bottom >= 0) {
          reveal(element);
        }
      });
    };

    window.addEventListener("scroll", revealVisibleAtPageEnd, {
      passive: true,
    });
    cleanupPageEnd = () =>
      window.removeEventListener("scroll", revealVisibleAtPageEnd);
    revealVisibleAtPageEnd();

    if (!("IntersectionObserver" in window)) {
      cleanupFallback = bindScrollFallback(elements);
      return;
    }

    observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            reveal(entry.target);
            if (settings.once) observer.unobserve(entry.target);
          } else {
            hide(entry.target);
          }
        });
      },
      {
        rootMargin: `0px 0px -${settings.offset}px 0px`,
        threshold: 0.12,
      },
    );

    elements.forEach((element) => observer.observe(element));
  };

  const refresh = () => {
    const elements = Array.from(document.querySelectorAll(selector));
    prepare(elements);
    observe(elements);
  };

  const init = (options = {}) => {
    if (initialized) {
      return;
    }

    settings = { ...defaults, ...options };
    initialized = true;
    refresh();
  };

  window.AOS = { init, refresh, refreshHard: refresh };

  const start = () => init({ offset: 100, once: true, duration: 800 });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }
})(window, document);
