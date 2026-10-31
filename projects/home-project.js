async function renderFeaturedProject() {
  const response = await fetch("projects/data/projects.json");
  if (!response.ok) return;
  const projects = await response.json();
  const project = projects.find((item) => item.slug === "recetario");
  if (!project) return;

  const card = document.querySelector("#featured-project");
  card.href = `projects/projects.html?slug=${encodeURIComponent(project.slug)}`;
  card.querySelectorAll("[data-project]").forEach((element) => {
    const key = element.dataset.project;
    if (key === "number") return;
    element.textContent = project[key] ?? "";
  });
}

renderFeaturedProject();
