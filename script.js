const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

function setTheme(next) {
  document.documentElement.dataset.theme = next;
  try {
    localStorage.setItem("theme", next);
  } catch {}
}

function getInitialTheme() {
  try {
    const stored = localStorage.getItem("theme");
    if (stored === "dark" || stored === "light") return stored;
  } catch {}
  return null;
}

function smoothScrollTo(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: "smooth", block: "start" });
}

function initHeaderActions() {
  $$("[data-action='scrollToWork']").forEach((btn) =>
    btn.addEventListener("click", () => smoothScrollTo("work")),
  );
}

function initYear() {
  const year = String(new Date().getFullYear());
  $$("[data-field='year']").forEach((el) => (el.textContent = year));
}

function initFilters() {
  const chips = $$("[data-filter]");
  const cards = $$(".card[data-tags]");

  function apply(filter) {
    cards.forEach((card) => {
      const tags = (card.getAttribute("data-tags") || "")
        .split(/\s+/)
        .filter(Boolean);
      const show = filter === "all" ? true : tags.includes(filter);
      card.hidden = !show;
    });
  }

  chips.forEach((chip) => {
    chip.addEventListener("click", () => {
      chips.forEach((c) => {
        c.classList.toggle("is-active", c === chip);
        c.setAttribute("aria-selected", c === chip ? "true" : "false");
      });
      apply(chip.dataset.filter || "all");
    });
  });
}

function initCopyButtons() {
  $$("[data-action='copyContact'][data-copy]").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = btn.getAttribute("data-copy") || "";
      if (!text) return;
      const original = btn.textContent;
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = "已复制";
      } catch {
        btn.textContent = "复制失败";
      } finally {
        window.setTimeout(() => (btn.textContent = original), 1200);
      }
    });
  });
}

function initThemeToggle() {
  const btn = $("[data-action='toggleTheme']");
  if (!btn) return;

  const initial = getInitialTheme();
  if (initial) setTheme(initial);

  btn.addEventListener("click", () => {
    const current = document.documentElement.dataset.theme;
    const next = current === "dark" ? "light" : "dark";
    setTheme(next);
  });
}

function initFeaturedCarousel() {
  const featured = document.querySelector("img[data-featured]");
  if (!(featured instanceof HTMLImageElement)) return;
  if (window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches) return;

  const sources = [
    "./assets/01.jpg",
    "./assets/02.jpg",
    "./assets/03.jpg",
    "./assets/04.jpg",
    "./assets/05.jpg",
    "./assets/06.jpg",
    "./assets/07.jpg",
    "./assets/08.JPG",
    "./assets/09.jpg",
    "./assets/10.jpg",
    "./assets/11.jpg",
    "./assets/12.jpg",
    "./assets/13.jpg",
    "./assets/14.jpg",
    "./assets/15.jpg",
    "./assets/16.jpg",
    "./assets/17.jpeg",
  ];
  let i = Math.max(0, sources.indexOf(featured.getAttribute("src") || ""));
  let timer = null;
  let paused = false;

  function preload(src) {
    const img = new Image();
    img.src = src;
  }

  function tick() {
    if (paused) return;
    i = (i + 1) % sources.length;
    const next = sources[i];
    preload(next);
    featured.classList.add("is-fading");
    window.setTimeout(() => {
      featured.src = next;
      featured.classList.remove("is-fading");
    }, 220);
  }

  timer = window.setInterval(tick, 3800);

  const pause = () => (paused = true);
  const resume = () => (paused = false);
  featured.addEventListener("mouseenter", pause);
  featured.addEventListener("mouseleave", resume);
  featured.addEventListener("focus", pause);
  featured.addEventListener("blur", resume);
  document.addEventListener("visibilitychange", () => {
    paused = document.hidden ? true : paused;
  });

  window.addEventListener("beforeunload", () => {
    if (timer) window.clearInterval(timer);
  });
}

function initStats() {
  const cards = $$(".card[data-tags]");
  const tagSet = new Set();
  cards.forEach((card) => {
    const tags = (card.getAttribute("data-tags") || "")
      .split(/\s+/)
      .filter(Boolean);
    tags.forEach((t) => tagSet.add(t.toLowerCase()));
  });
  const seriesEl = $("[data-field='seriesCount']");
  if (seriesEl) seriesEl.textContent = String(tagSet.size || "");
  const photosEl = $("[data-field='photoCount']");
  if (photosEl) photosEl.textContent = String(cards.length || "");
}

function initLightbox() {
  const dialog = $("[data-lightbox-dialog]");
  if (!(dialog instanceof HTMLDialogElement)) return;

  const imgEl = $(".lightbox-img", dialog);
  const titleEl = $(".lightbox-title", dialog);
  const subEl = $(".lightbox-sub", dialog);
  const gearEl = $(".lightbox-gear", dialog);
  const noteEl = $(".lightbox-note", dialog);

  const cards = $$(".card");
  const items = cards
    .map((card) => {
      const btn = $("[data-lightbox]", card);
      const img = $("img", btn || card);
      const title = $(".card-title", card)?.textContent?.trim() || "";
      const sub = $(".card-sub", card)?.textContent?.trim() || "";
      const src = img?.getAttribute("src") || "";
      const alt = img?.getAttribute("alt") || "";
      const gear = card.getAttribute("data-gear") || "";
      const note = card.getAttribute("data-note") || "";
      return { card, btn, img, src, alt, title, sub, gear, note };
    })
    .filter((x) => x.btn && x.src);

  let currentIndex = 0;

  function openAt(index) {
    const visibleItems = items.filter((x) => !x.card.hidden);
    const bounded = Math.max(0, Math.min(index, visibleItems.length - 1));
    const item = visibleItems[bounded];
    if (!item) return;

    currentIndex = bounded;
    if (imgEl) {
      imgEl.src = item.src;
      imgEl.alt = item.alt || item.title || "作品";
    }
    if (titleEl) titleEl.textContent = item.title || "作品";
    if (subEl) subEl.textContent = item.sub || "";
    if (gearEl) gearEl.textContent = item.gear || "";
    if (noteEl) noteEl.textContent = item.note || "";

    if (!dialog.open) dialog.showModal();
  }

  function move(delta) {
    const visibleItems = items.filter((x) => !x.card.hidden);
    if (visibleItems.length === 0) return;
    const next = (currentIndex + delta + visibleItems.length) % visibleItems.length;
    openAt(next);
  }

  items.forEach((item) => {
    item.btn.addEventListener("click", () => {
      const visibleItems = items.filter((x) => !x.card.hidden);
      const idx = visibleItems.findIndex((x) => x.card === item.card);
      openAt(Math.max(0, idx));
    });
  });

  dialog.addEventListener("click", (e) => {
    const target = e.target;
    if (target === dialog) dialog.close();
  });

  $("[data-action='closeLightbox']", dialog)?.addEventListener("click", () => dialog.close());
  $("[data-action='prev']", dialog)?.addEventListener("click", () => move(-1));
  $("[data-action='next']", dialog)?.addEventListener("click", () => move(1));

  window.addEventListener("keydown", (e) => {
    if (!dialog.open) return;
    if (e.key === "Escape") dialog.close();
    if (e.key === "ArrowLeft") move(-1);
    if (e.key === "ArrowRight") move(1);
  });
}

initYear();
initHeaderActions();
initStats();
initFilters();
initCopyButtons();
initThemeToggle();
initFeaturedCarousel();
initLightbox();

