# Alejandro's Portfolio

A personal developer portfolio showcasing projects across web development, Android apps, Windows desktop software, and game development. The site includes a home page, an about page, and a project catalogue with individual project pages.

## Stack

- HTML
- CSS
- Vanilla JavaScript
- JSON project data

No framework or build step is required.

## Run locally

From the repository root, start Python's built-in static server:

```bash
python -m http.server 8000
```

Then open [http://localhost:8000](http://localhost:8000).

## Add a project

Add an object to the array in [`projects/data/projects.json`](projects/data/projects.json). The site reads project content from this file.

Project entries use these fields:

- `slug`: URL identifier used by the project detail page.
- `featured`: whether the project appears among the featured projects.
- `name`, `category`, `year`, `shortDescription`, `description`, and `status`: project copy and details.
- `homeImage`: image used on the home page (when applicable).
- `compactImage` and `compactImageAlt`: optional logo image and alt text for compact project cards.
- `images`: screenshots for the project page, as objects with `src` and descriptive `alt` values.
- `technologies`: array of tools and technologies used.
- `links`: URLs such as `live`, `github`, and `download`; use an empty string when a link does not apply.

Keep image paths relative to the JSON file's usage in the site, following the existing project entries. Use descriptive alt text for every image.

## Image convention

- Prefer JPG or WebP for screenshots and photos.
- Prepare images at about 1600 px wide and keep each file under 300 KB where practical.
- Use clear, consistent filenames and store each project's assets in its folder under `images/`.
- Update the corresponding paths in `projects/data/projects.json` whenever an image is added or renamed.

## Deploy with GitHub Pages

The portfolio is published through GitHub Pages from the repository's `main` branch and root folder. In the repository, open **Settings → Pages**, select **Deploy from a branch**, choose `main` and `/(root)`, then save. GitHub Pages publishes updates after they are pushed to the selected branch.
