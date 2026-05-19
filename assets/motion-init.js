/**
 * Инициализация AOS и Swiper (отзывы — колода карт)
 */
(() => {
  let reviewsSwiper = null;

  function initSwiper() {
    const swiperEl = document.querySelector(".reviews-swiper");
    if (!swiperEl || typeof Swiper === "undefined") return;

    if (reviewsSwiper) {
      reviewsSwiper.destroy(true, true);
      reviewsSwiper = null;
    }

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    reviewsSwiper = new Swiper(".reviews-swiper", {
      loop: true,
      speed: reduced ? 0 : 700,
      slidesPerView: 1,
      spaceBetween: 20,
      centeredSlides: true,
      pagination: { el: ".swiper-pagination", clickable: true },
      navigation: {
        nextEl: ".swiper-button-next",
        prevEl: ".swiper-button-prev",
      },
      effect: reduced ? "slide" : "cards",
      grabCursor: true,
      cardsEffect: {
        slideShadows: true,
        rotate: true,
        perSlideRotate: 8,
        perSlideOffset: 12,
      },
    });
  }

  function initMotion() {
    if (typeof AOS !== "undefined") {
      AOS.init({
        duration: 900,
        easing: "ease-out-cubic",
        once: true,
        offset: 100,
      });
    }
    initSwiper();
  }

  document.addEventListener("site-content-applied", () => {
    initSwiper();
    if (typeof AOS !== "undefined") AOS.refresh();
    if (typeof window.initCatalogOrbit === "function") {
      /* no-op */
    }
    if (typeof window.renderPopular === "function") {
      /* app handles via wire */
    }
    document.dispatchEvent(new CustomEvent("site-content-ready"));
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initMotion);
  } else {
    initMotion();
  }
})();
