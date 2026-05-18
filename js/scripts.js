const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const themeToggle = document.querySelector(".theme-toggle");
const year = document.querySelector("#current-year");
const themeIcon = themeToggle?.querySelector("i");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");
const repoList = document.querySelector("#github-repo-list");
const repoStatus = document.querySelector("#github-repo-status");
const mediumPostList = document.querySelector("#medium-post-list");
const mediumPostStatus = document.querySelector("#medium-post-status");

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
            .filter((repo) => !repo.fork && !repo.archived && repo.name !== "abhijatchaturvedi.github.io")
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

const stripHtml = (html) => {
    const template = document.createElement("template");
    template.innerHTML = html || "";
    return template.content.textContent.trim();
};

const createMediumCard = (post) => {
    const article = document.createElement("article");
    article.className = "repo-card";

    const title = document.createElement("h3");
    const link = document.createElement("a");
    link.href = post.link;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = post.title;

    const icon = document.createElement("i");
    icon.className = "fab fa-medium-m";
    icon.setAttribute("aria-hidden", "true");

    title.append(link, icon);

    const description = document.createElement("p");
    description.className = "repo-description";
    const summary = stripHtml(post.description).replace(/\s+/g, " ");
    description.textContent = summary.length > 160 ? `${summary.slice(0, 157)}...` : summary || "Read this literary piece on Medium.";

    const meta = document.createElement("div");
    meta.className = "repo-meta";

    const date = document.createElement("span");
    date.innerHTML = '<i class="fas fa-calendar-alt" aria-hidden="true"></i>';
    date.append(document.createTextNode(formatUpdatedDate(post.pubDate)));

    const source = document.createElement("span");
    source.innerHTML = '<i class="fab fa-medium-m" aria-hidden="true"></i>';
    source.append(document.createTextNode("Medium"));

    meta.append(date, source);
    article.append(title, description, meta);

    return article;
};

const loadMediumPosts = async () => {
    if (!mediumPostList || !mediumPostStatus) {
        return;
    }

    const feedUrl = encodeURIComponent("https://abhijatchaturvedi.medium.com/feed");
    const apiUrl = `https://api.rss2json.com/v1/api.json?rss_url=${feedUrl}`;

    try {
        const response = await fetch(apiUrl);

        if (!response.ok) {
            throw new Error(`Medium feed returned ${response.status}`);
        }

        const feed = await response.json();

        if (feed.status !== "ok" || !Array.isArray(feed.items)) {
            throw new Error("Medium feed response was not valid");
        }

        const posts = feed.items.slice(0, 6);
        mediumPostList.replaceChildren();

        if (!posts.length) {
            mediumPostStatus.textContent = "No Medium literary pieces found.";
            mediumPostList.innerHTML = '<p class="repo-empty">No Medium literary pieces are available to display right now.</p>';
            return;
        }

        posts.forEach((post) => mediumPostList.appendChild(createMediumCard(post)));
        mediumPostStatus.textContent = `Showing ${posts.length} latest literary pieces from Medium.`;
    } catch (error) {
        mediumPostStatus.textContent = "Unable to load Medium literary pieces right now.";
        mediumPostList.innerHTML = '<p class="repo-empty">Medium writing could not be fetched. Use the Medium link above to view posts directly.</p>';
    }
};

loadMediumPosts();
