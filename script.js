const content = document.querySelector("#content");
const wheel = document.querySelector("#projectWheel");

let projects = [];
let currentProject = null;

/* ------------------------------
   PATHS
------------------------------ */

function projectJsonPath(slug) {
  return `projects/${encodeURIComponent(slug)}/project.json`;
}

function projectImagePath(slug, filename) {
  return `projects/${encodeURIComponent(slug)}/${encodeURIComponent(filename)}`;
}

/* ------------------------------
   LOAD PROJECT INDEX
------------------------------ */

async function loadProjects() {
  try {
    const response = await fetch("projects/index.json", {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error("Could not load projects/index.json");
    }

    const order = await response.json();

    if (!Array.isArray(order)) {
      throw new Error("projects/index.json is not a valid list.");
    }

    const loadedProjects = [];

    for (const slug of order) {
      try {
        const projectResponse = await fetch(projectJsonPath(slug), {
          cache: "no-store",
        });

        if (!projectResponse.ok) {
          console.warn(`Could not load ${slug}`);

          continue;
        }

        const project = await projectResponse.json();

        project.slug = slug;

        loadedProjects.push(project);
      } catch (error) {
        console.warn(`Error loading ${slug}:`, error);
      }
    }

    projects = loadedProjects;

    buildWheel();

    if (projects.length) {
      showLanding(false);
    } else {
      content.innerHTML = `
        <div class="error">
          No projects have been added yet.
        </div>
      `;
    }
  } catch (error) {
    console.error(error);

    content.innerHTML = `
      <div class="error">
        Could not load the project index.<br><br>

        Make sure you are viewing the website
        through Live Server or GitHub Pages rather
        than opening index.html directly from Finder.
      </div>
    `;
  }
}

/* ------------------------------
   BUILD RIGHT WHEEL
------------------------------ */

function buildWheel() {
  wheel.innerHTML = "";

  projects.forEach((project, index) => {
    if (!project.thumbnail) {
      return;
    }

    const button = document.createElement("button");

    button.className = "wheel-project";
    button.type = "button";
    button.dataset.project = index;
    button.title = project.title;

    const image = document.createElement("img");

    image.src = projectImagePath(project.slug, project.thumbnail);

    image.alt = project.title;
    image.loading = "lazy";
    image.draggable = false;

    button.appendChild(image);

    button.addEventListener("click", () => {
      showProject(index);
    });

    wheel.appendChild(button);
  });
}

/* ------------------------------
   SHOW PROJECT
------------------------------ */

const IMAGE_LIMIT = 6;

function imagesHtml(project) {
  const list = project.ordered || [];
  const shown = project.expanded ? list : list.slice(0, IMAGE_LIMIT);

  return shown
    .map(
      (filename) => `
        <div class="project-image" tabindex="0">
          <img
            src="${projectImagePath(project.slug, filename)}"
            alt="${escapeHtml(project.title)}"
            loading="lazy"
          >
        </div>
      `,
    )
    .join("");
}

function showProject(index, animate = true) {
  const project = projects[index];

  if (!project) {
    return;
  }

  currentProject = index;
  setLanding(false);

  const render = () => {
    const list = [...(project.images || [])];
    const thumbAt = list.indexOf(project.thumbnail);

    if (thumbAt !== -1) {
      list.splice(thumbAt, 1);
      list.splice(Math.min(index, IMAGE_LIMIT - 1, list.length), 0, project.thumbnail);
    }

    project.ordered = list;

    project.expanded = false;
    const images = imagesHtml(project);
    const hasMore = list.length > IMAGE_LIMIT;

    const credits = (project.credits || [])
      .map(
        (credit) => `
          <div class="credit">
            <span class="credit-role">
              ${escapeHtml(credit.role)}
            </span>

            <span class="credit-name">
              ${escapeHtml(credit.name)}
            </span>
          </div>
        `,
      )
      .join("");

    const description = project.description
      ? `
          <p class="project-description">
            ${escapeHtml(project.description)}
          </p>
        `
      : "";

    content.innerHTML = `
      <article class="project-view">


        <div class="project-images">
          ${images}
        </div>

        <header class="project-heading">
          <h1 class="project-title">
            ${escapeHtml(project.title)}
          </h1>

          <p class="project-category">
            ${escapeHtml(project.category || "")}
          </p>

          ${
            hasMore
              ? `<button class="more-button" type="button" aria-label="Show more images">
                  <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M2 6 L10 14 L18 6" /></svg>
                </button>`
              : ""
          }
        </header>

        ${
          description || credits
            ? `
              <div class="divider"></div>

              ${description}

              ${
                credits
                  ? `
                    <div class="credits">
                      ${credits}
                    </div>
                  `
                  : ""
              }
            `
            : ""
        }

      </article>
    `;
  };

  if (animate) {
    changeContent(render);
  } else {
    render();
  }

  updateActiveProject(index);
}

/* ------------------------------
   ACTIVE THUMBNAIL
------------------------------ */

function updateActiveProject(index) {
  const buttons = document.querySelectorAll(".wheel-project");

  buttons.forEach((button) => {
    button.classList.remove("active");
  });

  const active = document.querySelector(`.wheel-project[data-project="${index}"]`);

  if (!active) {
    return;
  }

  active.classList.add("active");

  active.scrollIntoView({
    behavior: "smooth",
    block: "center",
    inline: "center",
  });
}

/* ------------------------------
   CROSSFADE
------------------------------ */

function changeContent(callback) {
  if (document.startViewTransition) {
    document.startViewTransition(callback);
  } else {
    callback();
  }
}

/* ------------------------------
   LEFT SIDE PAGES
------------------------------ */

function showInfo() {
  setLanding(false);

  changeContent(() => {
    content.innerHTML = `
      <section class="text-page">
        <p class="text-lead">
          Tobias Aronsen is a colorist based in Oslo, Norway, working
          across commercial and narrative projects.
        </p>

        <dl class="text-list">
          <div class="text-row">
            <dt>Role</dt>
            <dd>Colorist</dd>
          </div>

          <div class="text-row">
            <dt>Based</dt>
            <dd>Oslo, Norway</dd>
          </div>

          <div class="text-row">
            <dt>Work</dt>
            <dd>Commercial<br>Narrative</dd>
          </div>

          <div class="text-row">
            <dt>Contact</dt>
            <dd><a href="mailto:mail@tobiasaronsen.com">mail@tobiasaronsen.com</a></dd>
          </div>

          <div class="text-row">
            <dt>Instagram</dt>
            <dd><a href="#" target="_blank" rel="noopener">@tobiasaronsen</a></dd>
          </div>

          <div class="text-row">
            <dt>Vimeo</dt>
            <dd><a href="#" target="_blank" rel="noopener">vimeo.com/tobiasaronsen</a></dd>
          </div>
        </dl>
      </section>
    `;
  });

  clearActiveProject();
}

function showHome() {
  showLanding();
}

function showLanding(animate = true) {
  const render = () => {
    content.innerHTML = `
      <div class="landing-grid">
        ${projects
          .map(
            (project, index) => `
              <button class="project-card" type="button" data-project="${index}">
                <div class="card-media">
                  <img
                    src="${projectImagePath(project.slug, project.thumbnail || (project.images || [])[0])}"
                    alt="${escapeHtml(project.title)}"
                    loading="lazy"
                  >

                <div class="card-meta">
                  <span>${escapeHtml(project.title)}</span>
                  <span class="card-category">${escapeHtml(project.category || "")}</span>
                </div>
                </div>
              </button>
            `,
          )
          .join("")}
      </div>
    `;
  };

  if (animate) {
    changeContent(render);
  } else {
    render();
  }

  currentProject = null;
  setLanding(true);
  clearActiveProject();
}

/* ------------------------------
   LIGHTBOX
------------------------------ */

const lightbox = document.createElement("div");
lightbox.className = "lightbox";
lightbox.innerHTML = `
  <button class="lightbox-btn lightbox-prev" type="button" aria-label="Previous">
    <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M13 2 L5 10 L13 18" /></svg>
  </button>
  <img alt="">
  <button class="lightbox-btn lightbox-next" type="button" aria-label="Next">
    <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M7 2 L15 10 L7 18" /></svg>
  </button>
  <div class="lightbox-count"></div>
`;
document.body.appendChild(lightbox);

let lightboxIndex = 0;

function lightboxImages() {
  const project = projects[currentProject];
  return project ? project.ordered || project.images || [] : [];
}

function openLightbox(index) {
  lightboxIndex = index;
  updateLightbox();
  lightbox.classList.add("open");
  document.body.classList.add("lightbox-open");
}

function updateLightbox() {
  const images = lightboxImages();
  lightbox.querySelector("img").src = projectImagePath(projects[currentProject].slug, images[lightboxIndex]);
  lightbox.querySelector(".lightbox-count").textContent = `${lightboxIndex + 1} / ${images.length}`;
}

function stepLightbox(delta) {
  const count = lightboxImages().length;
  lightboxIndex = (lightboxIndex + delta + count) % count;
  updateLightbox();
}

function closeLightbox() {
  lightbox.classList.remove("open");
  document.body.classList.remove("lightbox-open");
}

function setLanding(isLanding) {
  document.body.classList.toggle("on-landing", isLanding);
}

document.querySelector("#corner").addEventListener("click", () => {
  if (lightbox.classList.contains("open")) closeLightbox();
  else if (!document.body.classList.contains("on-landing")) showLanding();
});

lightbox.addEventListener("click", (event) => {
  if (event.target.closest(".lightbox-prev")) return stepLightbox(-1);
  if (event.target.closest(".lightbox-next")) return stepLightbox(1);
  closeLightbox();
});

function gridItems() {
  return [...content.querySelectorAll(".project-card, .project-image")];
}

function moveFocus(key) {
  const items = gridItems();
  if (!items.length) return;

  const current = items.indexOf(document.activeElement);
  if (current === -1) return items[0].focus();

  const grid = items[0].parentElement;
  const cols = getComputedStyle(grid).gridTemplateColumns.split(" ").length;
  const step = { ArrowLeft: -1, ArrowRight: 1, ArrowUp: -cols, ArrowDown: cols }[key];
  const next = current + step;

  if (next >= 0 && next < items.length) items[next].focus();
}

function cycleProject(delta) {
  if (!projects.length) return;

  if (document.body.classList.contains("on-landing")) {
    const items = gridItems();
    const current = items.indexOf(document.activeElement);
    items[(current + delta + items.length) % items.length].focus();
  } else if (currentProject !== null) {
    showProject((currentProject + delta + projects.length) % projects.length);
  }
}

document.addEventListener("keydown", (event) => {
  if (event.metaKey || event.ctrlKey || event.altKey) return;

  const open = lightbox.classList.contains("open");

  if (event.key === "Escape") {
    if (open) closeLightbox();
    else showLanding();
    return;
  }

  if (open) {
    if (event.key === "ArrowLeft") stepLightbox(-1);
    if (event.key === "ArrowRight") stepLightbox(1);
    if (event.key === "Tab") event.preventDefault();
    return;
  }

  if (event.key === "Tab") {
    if (!document.querySelector(".project-card, .project-view")) return;
    event.preventDefault();
    cycleProject(event.shiftKey ? -1 : 1);
    return;
  }

  if (event.key.startsWith("Arrow") && gridItems().length) {
    event.preventDefault();
    moveFocus(event.key);
    return;
  }

  if (event.key === "Enter") {
    const focused = document.activeElement;
    if (focused && focused.classList.contains("project-image")) {
      event.preventDefault();
      openLightbox(gridItems().indexOf(focused));
    }
  }
});

content.addEventListener("click", (event) => {
  const card = event.target.closest(".project-card");
  if (card) return showProject(Number(card.dataset.project));

  const more = event.target.closest(".more-button");
  if (more) {
    const project = projects[currentProject];
    project.expanded = !project.expanded;
    more.classList.toggle("open", project.expanded);
    content.querySelector(".project-images").innerHTML = imagesHtml(project);
    return;
  }

  const image = event.target.closest(".project-image");
  if (image) {
    openLightbox(gridItems().indexOf(image));
  }
});

function clearActiveProject() {
  document.querySelectorAll(".wheel-project").forEach((button) => {
    button.classList.remove("active");
  });
}

/* ------------------------------
   LEFT NAV
------------------------------ */

document.querySelectorAll("[data-page]").forEach((button) => {
  button.addEventListener("click", () => {
    const page = button.dataset.page;

    if (page === "home") {
      showHome();
    }

    if (page === "info") {
      showInfo();
    }

  });
});

/* ------------------------------
   BASIC HTML SAFETY
------------------------------ */

function escapeHtml(value) {
  const element = document.createElement("div");

  element.textContent = value ?? "";

  return element.innerHTML;
}

/* ------------------------------
   START
------------------------------ */

loadProjects();
