async function renderProjects() {
  const response = await fetch("projects/data/projects.json");
  if (!response.ok) return;
  const projects = await response.json();
  const list = document.querySelector("#project-list");
  list.replaceChildren(...projects.map((project, index) => {
    const card = document.createElement("a");
    card.className = "project-card project-card--home";
    card.href = `projects/projects.html?slug=${encodeURIComponent(project.slug)}`;
    const preview = document.createElement("div");
    preview.className = "project-preview project-preview--image";
    const images = project.images ?? [];
    const cover = project.homeImage
      ? images.find((image) => image.src === project.homeImage) ?? { src: project.homeImage }
      : images[0];
    if (cover) {
      const image = document.createElement("img");
      image.className = "home-project-image is-visible";
      image.src = `projects/${cover.src}`;
      image.alt = cover.alt ?? `${project.name} screenshot`;
      image.loading = "lazy";
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
  }));
}

renderProjects();
