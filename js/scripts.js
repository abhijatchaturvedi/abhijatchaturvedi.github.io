const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const themeToggle = document.querySelector(".theme-toggle");
const year = document.querySelector("#current-year");
const themeIcon = themeToggle?.querySelector("i");
const prefersDark = window.matchMedia("(prefers-color-scheme: dark)");

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
