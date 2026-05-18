const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const themeToggle = document.querySelector(".theme-toggle");
const year = document.querySelector("#current-year");
const themeIcon = themeToggle?.querySelector("i");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
const repoList = document.querySelector("#github-repo-list");
const repoStatus = document.querySelector("#github-repo-status");

const applyTheme = (theme) => {
    document.documentElement.dataset.theme = theme;

    if (!themeToggle || !themeIcon) {
        return;
    }

    const isDark = theme === "dark";
    themeToggle.setAttribute("aria-label", isDark ? "Switch to light mode" : "Switch to dark mode");
    themeIcon.className = isDark ? "fas fa-sun" : "fas fa-moon";
};

const savedTheme = localStorage.getItem("theme");
applyTheme(savedTheme || (prefersDark.matches ? "dark" : "light"));

if (year) {
    year.textContent = new Date().getFullYear();
}

if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
        const isOpen = navLinks.classList.toggle("open");
        document.body.classList.toggle("nav-open", isOpen);
        navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            navLinks.classList.remove("open");
            document.body.classList.remove("nav-open");
            navToggle.setAttribute("aria-expanded", "false");
        });
    });
}

if (themeToggle) {
    themeToggle.addEventListener("click", () => {
        const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
        localStorage.setItem("theme", nextTheme);
        applyTheme(nextTheme);
    });
}

prefersDark.addEventListener("change", (event) => {
    if (!localStorage.getItem("theme")) {
        applyTheme(event.matches ? "dark" : "light");
    }
});

const sections = Array.from(document.querySelectorAll("main section[id]"));
const navItems = Array.from(document.querySelectorAll(".nav-links a"));

if ("IntersectionObserver" in window && sections.length && navItems.length) {
    const observer = new IntersectionObserver(
        (entries) => {
            entries.forEach((entry) => {
                if (!entry.isIntersecting) {
                    return;
                }

                navItems.forEach((item) => {
                    item.classList.toggle("active", item.getAttribute("href") === `#${entry.target.id}`);
                });
            });
        },
        {
            rootMargin: "-30% 0px -55% 0px",
            threshold: 0,
        }
    );

    sections.forEach((section) => observer.observe(section));
}

const formatUpdatedDate = (dateString) =>
    new Intl.DateTimeFormat("en", {
        month: "short",
        day: "numeric",
        year: "numeric",
    }).format(new Date(dateString));

const getLanguageColor = (language) => {
    const colors = {
        JavaScript: "#f1e05a",
        TypeScript: "#3178c6",
        Python: "#3572a5",
        HTML: "#e34c26",
        CSS: "#563d7c",
        Jupyter: "#da5b0b",
        Java: "#b07219",
        Shell: "#89e051",
        "C++": "#f34b7d",
    };

    return colors[language] || "var(--accent)";
};

const createRepoCard = (repo) => {
    const article = document.createElement("article");
    article.className = "repo-card";

    const description = repo.description || "Public repository by Abhijat Chaturvedi.";
    const language = repo.language || "Code";

    const title = document.createElement("h3");
    const link = document.createElement("a");
    link.href = repo.html_url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = repo.name;

    const icon = document.createElement("i");
    icon.className = "fab fa-github";
    icon.setAttribute("aria-hidden", "true");

    title.append(link, icon);

    const descriptionElement = document.createElement("p");
    descriptionElement.className = "repo-description";
    descriptionElement.textContent = description;

    const meta = document.createElement("div");
    meta.className = "repo-meta";

    const languageElement = document.createElement("span");
    const languageDot = document.createElement("span");
    languageDot.className = "language-dot";
    languageDot.style.background = getLanguageColor(language);
    languageElement.append(languageDot, document.createTextNode(language));

    const starsElement = document.createElement("span");
    starsElement.innerHTML = '<i class="fas fa-star" aria-hidden="true"></i>';
    starsElement.append(document.createTextNode(repo.stargazers_count));

    const forksElement = document.createElement("span");
    forksElement.innerHTML = '<i class="fas fa-code-branch" aria-hidden="true"></i>';
    forksElement.append(document.createTextNode(repo.forks_count));

    const updatedElement = document.createElement("span");
    updatedElement.innerHTML = '<i class="fas fa-clock" aria-hidden="true"></i>';
    updatedElement.append(document.createTextNode(formatUpdatedDate(repo.updated_at)));

    meta.append(languageElement, starsElement, forksElement, updatedElement);
    article.append(title, descriptionElement, meta);

    return article;
};

const loadGitHubRepos = async () => {
    if (!repoList || !repoStatus) {
        return;
    }

    try {
        const response = await fetch("https://api.github.com/users/abhijatchaturvedi/repos?sort=updated&per_page=100", {
            headers: {
                Accept: "application/vnd.github+json",
            },
        });

        if (!response.ok) {
            throw new Error(`GitHub API returned ${response.status}`);
        }

        const repos = await response.json();
        const visibleRepos = repos
            .filter((repo) => !repo.fork && !repo.archived)
            .sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))
            .slice(0, 6);

        repoList.replaceChildren();

        if (!visibleRepos.length) {
            repoStatus.textContent = "No public repositories found.";
            repoList.innerHTML = '<p class="repo-empty">No public repositories are available to display right now.</p>';
            return;
        }

        visibleRepos.forEach((repo) => repoList.appendChild(createRepoCard(repo)));
        repoStatus.textContent = `Showing ${visibleRepos.length} recently updated public repositories.`;
    } catch (error) {
        repoStatus.textContent = "Unable to load repositories from GitHub right now.";
        repoList.innerHTML = '<p class="repo-empty">GitHub projects could not be fetched. Use the GitHub link above to view repositories directly.</p>';
    }
};

loadGitHubRepos();
