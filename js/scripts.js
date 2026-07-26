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
const devtoPostList = document.querySelector("#devto-post-list");
const devtoPostStatus = document.querySelector("#devto-post-status");

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

const createCardMedia = (src, alt) => {
    if (!src) {
        return null;
    }

    const img = document.createElement("img");
    img.className = "repo-card-media";
    img.src = src;
    img.alt = alt;
    img.loading = "lazy";
    img.addEventListener("error", () => img.remove(), { once: true });
    return img;
};

const extractFirstImage = (html) => {
    const template = document.createElement("template");
    template.innerHTML = html || "";
    return template.content.querySelector("img")?.src || "";
};

const createRepoCard = (repo) => {
    const article = document.createElement("article");
    article.className = "repo-card";

    const media = createCardMedia(`https://opengraph.githubassets.com/1/${repo.full_name}`, repo.name);
    if (media) {
        article.append(media);
    }

    const body = document.createElement("div");
    body.className = "repo-card-body";

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
    body.append(title, descriptionElement, meta);
    article.append(body);

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
            .filter((repo) => !repo.fork && !repo.archived && !["abhijatchaturvedi.github.io", "abhijatchaturvedi"].includes(repo.name))
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

    const imageUrl = post.thumbnail || extractFirstImage(post.content);
    const media = createCardMedia(imageUrl, post.title);
    if (media) {
        article.append(media);
    }

    const body = document.createElement("div");
    body.className = "repo-card-body";

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
    body.append(title, description, meta);
    article.append(body);

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

const createDevtoCard = (post) => {
    const article = document.createElement("article");
    article.className = "repo-card";

    const media = createCardMedia(post.cover_image || post.social_image, post.title);
    if (media) {
        article.append(media);
    }

    const body = document.createElement("div");
    body.className = "repo-card-body";

    const title = document.createElement("h3");
    const link = document.createElement("a");
    link.href = post.url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = post.title;

    const icon = document.createElement("i");
    icon.className = "fab fa-dev";
    icon.setAttribute("aria-hidden", "true");

    title.append(link, icon);

    const description = document.createElement("p");
    description.className = "repo-description";
    const summary = (post.description || "").replace(/\s+/g, " ").trim();
    description.textContent = summary.length > 160 ? `${summary.slice(0, 157)}...` : summary || "Read this technical article on dev.to.";

    const meta = document.createElement("div");
    meta.className = "repo-meta";

    const date = document.createElement("span");
    date.innerHTML = '<i class="fas fa-calendar-alt" aria-hidden="true"></i>';
    date.append(document.createTextNode(formatUpdatedDate(post.published_at)));

    const reactions = document.createElement("span");
    reactions.innerHTML = '<i class="fas fa-heart" aria-hidden="true"></i>';
    reactions.append(document.createTextNode(post.positive_reactions_count));

    const comments = document.createElement("span");
    comments.innerHTML = '<i class="fas fa-comment" aria-hidden="true"></i>';
    comments.append(document.createTextNode(post.comments_count));

    meta.append(date, reactions, comments);
    body.append(title, description, meta);
    article.append(body);

    return article;
};

const loadDevtoPosts = async () => {
    if (!devtoPostList || !devtoPostStatus) {
        return;
    }

    try {
        const response = await fetch("data/devto-posts.json", { cache: "no-store" });

        if (!response.ok) {
            throw new Error(`devto-posts.json returned ${response.status}`);
        }

        const posts = await response.json();

        if (!Array.isArray(posts)) {
            throw new Error("dev.to API response was not valid");
        }

        devtoPostList.replaceChildren();

        if (!posts.length) {
            devtoPostStatus.textContent = "New technical articles are on the way.";
            devtoPostList.innerHTML = '<p class="repo-empty">No dev.to articles are published yet. Check back soon or follow along on dev.to.</p>';
            return;
        }

        posts.forEach((post) => devtoPostList.appendChild(createDevtoCard(post)));
        devtoPostStatus.textContent = `Showing ${posts.length} latest technical articles from dev.to.`;
    } catch (error) {
        devtoPostStatus.textContent = "Unable to load dev.to articles right now.";
        devtoPostList.innerHTML = '<p class="repo-empty">Dev.to articles could not be fetched. Use the dev.to link above to view them directly.</p>';
    }
};

loadDevtoPosts();
