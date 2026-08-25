(function () {
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  const hero = document.querySelector(".hero");
  const video = document.querySelector(".hero__flower");
  const subtitle = document.querySelector('[data-anim="subtitle"]');
  const titleLines = gsap.utils.toArray('[data-anim="title-line"]');
  const highlightMask = document.querySelector(".hero__highlight-mask");
  const titleIcon = document.querySelector('[data-anim="title-icon"]');
  const features = gsap.utils.toArray('[data-anim="feature"]');

  if (prefersReducedMotion) {
    gsap.set(hero, { scale: 0.9, borderRadius: 40 });
    gsap.set([subtitle, ...titleLines, ...features], { opacity: 1, y: 0 });
    gsap.set(titleIcon, { opacity: 1, scale: 1 });
    gsap.set(highlightMask, { width: "100%" });
  } else {
    const tlFrame = gsap.timeline({ defaults: { ease: "power2.out" } });

    tlFrame.to(hero, {
      scale: 0.9,
      borderRadius: 40,
      duration: 1.3,
      delay: 0.5,
      ease: "power3.out",
    });

    const playTextSequence = () => {
      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });

      tl.to(subtitle, { opacity: 1, y: 0, duration: 0.4 })
        .to(
          titleLines,
          { opacity: 1, y: 0, duration: 0.45, stagger: 0.15 },
          "-=0.1"
        )
        .to(
          highlightMask,
          { width: "100%", duration: 0.5, ease: "power2.inOut" },
          "+=0.05"
        )
        .to(titleIcon, {
          opacity: 1,
          scale: 1,
          duration: 0.35,
          ease: "back.out(1.7)",
        })
        .to(
          features,
          { opacity: 1, y: 0, duration: 0.4, stagger: 0.18 },
          "+=0.15"
        );
    };

    // Start the text 2s before the background video finishes playing.
    // Falls back to a timer if the video can't play (blocked autoplay,
    // load error, etc.) so the page never gets stuck empty.
    const LEAD_TIME = 2;

    if (video) {
      let started = false;
      const startOnce = () => {
        if (started) return;
        started = true;
        playTextSequence();
      };

      const scheduleFromDuration = (duration) => {
        if (!isFinite(duration) || duration <= 0) {
          startOnce();
          return;
        }
        const delayMs = Math.max(0, duration - LEAD_TIME) * 1000;
        setTimeout(startOnce, delayMs);
      };

      if (video.readyState >= 1 && video.duration) {
        scheduleFromDuration(video.duration);
      } else {
        video.addEventListener(
          "loadedmetadata",
          () => scheduleFromDuration(video.duration),
          { once: true }
        );
      }

      video.addEventListener("ended", startOnce, { once: true });
      video.addEventListener("error", startOnce, { once: true });
      setTimeout(startOnce, 12000);
    } else {
      playTextSequence();
    }
  }

  // Manually replay each feature's lordicon animation on hover, since
  // hover state alone doesn't guarantee a fresh play if the icon already
  // finished a prior loop/state.
  document.querySelectorAll(".hero__feature").forEach((item) => {
    const icon = item.querySelector("lord-icon");
    if (!icon) return;

    item.addEventListener("mouseenter", () => {
      const player = icon.playerInstance;
      if (player && typeof player.playFromBeginning === "function") {
        player.playFromBeginning();
      }
    });
  });
})();
