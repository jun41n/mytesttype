(function () {
  "use strict";

  var CONTAINER_ID = "container-12cdf4ce15fbd319a5a65c7f165496a7";
  var SCRIPT_URL =
    "https://pl29040556.effectivecpmnetwork.com/12cdf4ce15fbd319a5a65c7f165496a7/invoke.js";
  var WRAPPER_ID = "gwansang-loading-widget";
  var observer;

  function isGwansangLoadingScreen() {
    if (window.location.pathname !== "/gwansang") return null;

    var logo = document.querySelector('img[src="/gwansang.png"]');
    if (!logo) return null;

    var screen = logo.closest('div[style*="min-height: 75vh"]');
    if (!screen || !screen.querySelector(".rounded-full.overflow-hidden")) {
      return null;
    }

    return screen;
  }

  function removeAd() {
    var wrapper = document.getElementById(WRAPPER_ID);
    if (wrapper) wrapper.remove();

    var script = document.querySelector('script[src="' + SCRIPT_URL + '"]');
    if (script) script.remove();
  }

  function mountAd() {
    var screen = isGwansangLoadingScreen();

    if (!screen) {
      removeAd();
      return;
    }

    if (document.getElementById(WRAPPER_ID)) return;

    var wrapper = document.createElement("div");
    wrapper.id = WRAPPER_ID;
    wrapper.setAttribute("aria-label", "Advertisement");
    wrapper.style.width = "100%";
    wrapper.style.maxWidth = "360px";
    wrapper.style.minHeight = "100px";
    wrapper.style.margin = "28px auto 0";
    wrapper.style.overflow = "hidden";

    var container = document.createElement("div");
    container.id = CONTAINER_ID;
    container.style.width = "100%";
    container.style.minHeight = "100px";
    wrapper.appendChild(container);
    screen.appendChild(wrapper);

    var oldScript = document.querySelector('script[src="' + SCRIPT_URL + '"]');
    if (oldScript) oldScript.remove();

    var script = document.createElement("script");
    script.src = SCRIPT_URL;
    script.async = true;
    script.setAttribute("data-cfasync", "false");
    document.head.appendChild(script);
  }

  function start() {
    mountAd();
    observer = new MutationObserver(mountAd);
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
    removeAd();
  });
})();
