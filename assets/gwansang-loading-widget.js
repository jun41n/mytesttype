(function () {
  "use strict";

  var observer;
  var banner;
  var originalParent;
  var originalNextSibling;
  var savedStyle;

  function getLoadingScreen() {
    if (!/^\/gwansang\/?$/.test(window.location.pathname)) return null;

    var logo = document.querySelector('img[src="/gwansang.png"]');
    if (!logo) return null;

    var screen = logo.closest('div[style*="min-height: 75vh"]');
    if (!screen || !screen.querySelector(".rounded-full.overflow-hidden")) {
      return null;
    }

    return screen;
  }

  function getBanner() {
    var candidates = document.querySelectorAll(
      'div[aria-label="Advertisement"]',
    );

    for (var i = 0; i < candidates.length; i += 1) {
      if (candidates[i].querySelector('iframe, script[src*="highperformanceformat"]')) {
        return candidates[i];
      }
    }

    return null;
  }

  function moveIntoLoadingScreen(screen) {
    if (!banner) {
      banner = getBanner();
      if (!banner) return;

      originalParent = banner.parentNode;
      originalNextSibling = banner.nextSibling;
      savedStyle = banner.getAttribute("style");
    }

    if (banner.parentNode !== screen) {
      screen.appendChild(banner);
    }

    banner.style.position = "relative";
    banner.style.left = "auto";
    banner.style.bottom = "auto";
    banner.style.transform = "none";
    banner.style.zIndex = "10";
    banner.style.margin = "30px auto 0";
    banner.style.width = "320px";
    banner.style.flexShrink = "0";
  }

  function restoreBanner() {
    if (!banner || !originalParent) return;

    if (originalNextSibling && originalNextSibling.parentNode === originalParent) {
      originalParent.insertBefore(banner, originalNextSibling);
    } else {
      originalParent.appendChild(banner);
    }

    if (savedStyle === null) {
      banner.removeAttribute("style");
    } else {
      banner.setAttribute("style", savedStyle);
    }
  }

  function syncBannerPosition() {
    var screen = getLoadingScreen();
    if (screen) {
      moveIntoLoadingScreen(screen);
    } else {
      restoreBanner();
    }
  }

  function start() {
    syncBannerPosition();
    observer = new MutationObserver(syncBannerPosition);
    observer.observe(document.getElementById("root"), {
      childList: true,
      subtree: true,
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start, { once: true });
  } else {
    start();
  }

  window.addEventListener("pagehide", function () {
    if (observer) observer.disconnect();
    restoreBanner();
  });
})();
