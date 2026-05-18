const navToggle = document.querySelector(".nav-toggle");
const navLinks = document.querySelector(".nav-links");
const year = document.querySelector("#current-year");

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
