const title = document.querySelector("#project-title");
const setText = (selector, value) => {
  document.querySelector(selector).textContent = value ?? "";
};

async function renderProject() {
  const slug = new URLSearchParams(window.location.search).get("slug");
  const response = await fetch("data/projects.json");
  if (!response.ok) throw new Error("Could not load project data.");
  const projects = await response.json();
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
  const viewport = document.querySelector("#gallery-viewport");
  const controls = document.querySelector("#gallery-controls");
  const images = Array.isArray(project.images) ? project.images : [];
  let lightboxIndex = 0;
  const lightbox = document.querySelector("#image-lightbox");
  const lightboxImage = document.querySelector("#lightbox-image");
  const showLightboxImage = (index) => {
    lightboxIndex = (index + images.length) % images.length;
    lightboxImage.src = images[lightboxIndex].src;
    lightboxImage.alt = images[lightboxIndex].alt || `${project.name} screenshot ${lightboxIndex + 1}`;
    document.querySelector("#lightbox-count").textContent = `${lightboxIndex + 1} / ${images.length}`;
  };
  const openLightbox = (index, sourceImage) => {
    showLightboxImage(index);
    lightbox.showModal();
    const target = lightboxImage;
    const source = sourceImage.getBoundingClientRect();
    requestAnimationFrame(() => {
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
  lightbox.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft") showLightboxImage(lightboxIndex - 1);
    if (event.key === "ArrowRight") showLightboxImage(lightboxIndex + 1);
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
  for (const [label, url] of [["Visit website", project.links.live], ["GitHub repository", project.links.github]]) {
    if (!url) continue;
    const link = document.createElement("a");
    link.href = url;
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = `${label} ↗`;
    links.append(link);
  }
}

renderProject().catch(() => {
  title.textContent = "Could not load this project";
});
