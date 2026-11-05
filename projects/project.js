const title = document.querySelector("#project-title");
const setText = (selector, value) => {
  document.querySelector(selector).textContent = value ?? "";
};

async function renderProject() {
  const slug = new URLSearchParams(window.location.search).get("slug");
  const response = await fetch("data/projects.json");
  if (!response.ok) throw new Error("Could not load project data.");
  const projects = await response.json();
  if (!slug) {
    renderCatalog(projects);
    return;
  }
  const project = projects.find((item) => item.slug === slug);

  if (!project) {
    title.textContent = "Project not found";
    document.querySelector("#project-detail").setAttribute("aria-label", "Project not found");
    return;
  }

  document.title = `${project.name} — Alejandro`;
  document.querySelector('meta[name="description"]').content = project.shortDescription;
  setText("#project-category", project.category);
  setText("#project-title", project.name);
  setText("#project-description", project.shortDescription);
  setText("#project-long-description", project.description);
  setText("#project-status", project.status);
  setText("#project-year", project.year);
  const gallery = document.querySelector("#project-gallery");
  gallery.classList.toggle("project-gallery--traytasks", project.slug === "traytasks");
  gallery.classList.toggle("project-gallery--todo-app", project.slug === "todo-app");
  gallery.classList.toggle("project-gallery--simon-says", project.slug === "simon-says");
  const viewport = document.querySelector("#gallery-viewport");
  const controls = document.querySelector("#gallery-controls");
  const images = Array.isArray(project.images) ? project.images : [];
  let lightboxIndex = 0;
  const lightbox = document.querySelector("#image-lightbox");
  lightbox.setAttribute("role", "dialog");
  lightbox.setAttribute("aria-modal", "true");
  const lightboxImage = document.querySelector("#lightbox-image");
  let lightboxOpener = null;
  const showLightboxImage = (index) => {
    lightboxIndex = (index + images.length) % images.length;
    lightboxImage.src = images[lightboxIndex].src;
    lightboxImage.alt = images[lightboxIndex].alt || `${project.name} screenshot ${lightboxIndex + 1}`;
    document.querySelector("#lightbox-count").textContent = `${lightboxIndex + 1} / ${images.length}`;
  };
  const openLightbox = (index, sourceImage) => {
    lightboxOpener = sourceImage;
    showLightboxImage(index);
    lightbox.showModal();
    const target = lightboxImage;
    const source = sourceImage.getBoundingClientRect();
    requestAnimationFrame(() => {
      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        lightbox.classList.add("is-expanded");
        return;
      }
      const end = target.getBoundingClientRect();
      const dx = source.left + source.width / 2 - (end.left + end.width / 2);
      const dy = source.top + source.height / 2 - (end.top + end.height / 2);
      const sx = source.width / end.width;
      const sy = source.height / end.height;
      target.animate([
        { transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`, borderRadius: "22px", opacity: .8 },
        { transform: "translate(0, 0) scale(1, 1)", borderRadius: "18px", opacity: 1 }
      ], { duration: 560, easing: "cubic-bezier(.2,.75,.25,1)" });
      lightbox.classList.add("is-expanded");
    });
  };
  if (images.length) {
    gallery.hidden = false;
    const track = document.createElement("div");
    track.className = "gallery-track";
    track.append(...images.map((image, index) => {
      const frame = document.createElement("figure");
      frame.className = "gallery-frame";
      const img = document.createElement("img");
      img.src = image.src;
      img.alt = image.alt || `${project.name} screenshot ${index + 1}`;
      img.loading = index ? "lazy" : "eager";
      img.decoding = "async";
      img.tabIndex = 0;
      img.setAttribute("role", "button");
      img.setAttribute("aria-label", `Open enlarged image ${index + 1}`);
      img.addEventListener("click", () => openLightbox(index, img));
      img.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); openLightbox(index, img); } });
      frame.append(img);
      return frame;
    }));
    if (images.length > 1) {
      [...track.children].slice(0, 2).forEach((frame, offset) => {
        const clone = frame.cloneNode(true);
        const cloneIndex = offset;
        const cloneImage = clone.querySelector("img");
        cloneImage.addEventListener("click", () => openLightbox(cloneIndex, cloneImage));
        track.append(clone);
      });
    }
    viewport.replaceChildren(track);
    if (images.length > 1) {
      controls.hidden = false;
      viewport.classList.add("is-carousel");
      viewport.append(controls);
      document.querySelector("#gallery-position").textContent = "";
      const slides = [...track.children];
      let current = 0;
      const show = (index) => {
        current = index;
        const step = slides[0].getBoundingClientRect().width + 16;
        track.style.transform = `translateX(-${current * step}px)`;
      };
      track.addEventListener("transitionend", () => {
        if (current >= images.length) {
          track.style.transition = "none";
          current = 0;
          track.style.transform = "translateX(0)";
          requestAnimationFrame(() => { track.style.transition = ""; });
        }
      });
      document.querySelector("#gallery-prev").addEventListener("click", () => {
        if (current === 0) {
          const step = slides[0].getBoundingClientRect().width + 16;
          track.style.transition = "none";
          current = images.length;
          track.style.transform = `translateX(-${current * step}px)`;
          requestAnimationFrame(() => requestAnimationFrame(() => { track.style.transition = ""; show(current - 1); }));
        } else show(current - 1);
      });
      document.querySelector("#gallery-next").addEventListener("click", () => show(current + 1));
      show(0);
      window.setInterval(() => show(current + 1), 2000);
    }
  }

  document.querySelector("#lightbox-close").addEventListener("click", () => lightbox.close());
  document.querySelector("#lightbox-prev").addEventListener("click", () => showLightboxImage(lightboxIndex - 1));
  document.querySelector("#lightbox-next").addEventListener("click", () => showLightboxImage(lightboxIndex + 1));
  lightbox.addEventListener("click", (event) => { if (event.target === lightbox) lightbox.close(); });
  lightbox.addEventListener("close", () => {
    lightbox.classList.remove("is-expanded");
    lightboxOpener?.focus({ preventScroll: true });
    lightboxOpener = null;
  });
  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "Escape") {
      event.preventDefault();
      lightbox.close();
    }
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      showLightboxImage(lightboxIndex - 1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      showLightboxImage(lightboxIndex + 1);
    }
  });
  let touchStartX = 0;
  lightbox.addEventListener("touchstart", (event) => { touchStartX = event.changedTouches[0].screenX; }, { passive: true });
  lightbox.addEventListener("touchend", (event) => {
    const deltaX = event.changedTouches[0].screenX - touchStartX;
    if (Math.abs(deltaX) > 45) showLightboxImage(lightboxIndex + (deltaX < 0 ? 1 : -1));
  }, { passive: true });

  const technologies = document.querySelector("#project-technologies");
  technologies.replaceChildren(...project.technologies.map((technology) => {
    const item = document.createElement("li");
    item.textContent = technology;
    return item;
  }));

  const links = document.querySelector("#project-links");
  links.replaceChildren();
  const downloadLabel = project.technologies.includes("Android") ? "Download for Android" : "Download for Windows";
  for (const [label, url] of [["Visit website", project.links.live], [downloadLabel, project.links.download], ["GitHub repository", project.links.github]]) {
    if (!url) continue;
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = `${label} ↗`;
    links.append(link);
  }
}

function renderCatalog(projects) {
  document.title = "Projects — Alejandro";
  document.querySelector("#project-detail").hidden = true;
  const catalog = document.querySelector("#project-catalog");
  catalog.hidden = false;
  const primary = catalog.querySelector("#catalog-featured");
  const secondary = catalog.querySelector("#catalog-secondary");
  const makeCard = (project, compact = false) => {
    const card = document.createElement("a");
    card.className = `project-card project-card--home${compact ? " project-card--compact" : ""}`;
    card.href = `projects.html?slug=${encodeURIComponent(project.slug)}`;
    const preview = document.createElement("div");
    preview.className = "project-preview project-preview--image";
    const images = Array.isArray(project.images) ? project.images : [];
    const cover = project.homeImage
      ? images.find((image) => image.src === project.homeImage) ?? { src: project.homeImage }
      : images[0];
    if (cover) {
      const image = document.createElement("img");
      image.className = "home-project-image is-visible";
      const smallScreen = window.matchMedia("(max-width: 1024px)");
      const setCardImage = () => {
        const useCompactImage = compact && project.compactImage && smallScreen.matches;
        image.src = useCompactImage ? project.compactImage : cover.src;
        image.alt = useCompactImage
          ? (project.compactImageAlt ?? `${project.name} logo`)
          : (cover.alt ?? `${project.name} screenshot`);
      };
      setCardImage();
      if (compact && project.compactImage) {
        smallScreen.addEventListener("change", setCardImage);
      }
      image.loading = "lazy";
      image.decoding = "async";
      preview.append(image);
    }
    const info = document.createElement("div");
    info.className = "project-info";
    const copy = document.createElement("div");
    const name = document.createElement("h3");
    name.textContent = project.name;
    const description = document.createElement("p");
    description.className = "project-description";
    description.textContent = project.shortDescription;
    copy.append(name, description);
    const meta = document.createElement("div");
    meta.className = "project-meta";
    const category = document.createElement("span");
    category.textContent = project.category;
    const year = document.createElement("span");
    year.textContent = project.year;
    const arrow = document.createElement("span");
    arrow.className = "project-arrow";
    arrow.textContent = "↗";
    meta.append(category, year, arrow);
    info.append(copy, meta);
    card.append(preview, info);
    return card;
  };
  primary.replaceChildren(...projects.filter((project) => project.featured !== false).map((project) => makeCard(project)));
  secondary.replaceChildren(...projects.filter((project) => project.featured === false).map((project) => makeCard(project, true)));
  catalog.querySelector(".catalog-more").hidden = secondary.childElementCount === 0;
}

renderProject().catch(() => {
  title.textContent = "Could not load this project";
});
