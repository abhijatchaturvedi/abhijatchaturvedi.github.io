/**
 * The signature AskVote cursor: a precise inner dot, a lagging ring that
 * changes shape over interactive elements, and an ambient spotlight that
 * follows the pointer. One requestAnimationFrame loop, no React - just DOM.
 * Fine-pointer, hover-capable devices only; respects prefers-reduced-motion.
 */
(function () {
    const canHover = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!canHover || reducedMotion) {
        return;
    }

    const BUTTON_TARGETS = 'a[href], button, .button, [role="button"], summary';
    const CARD_TARGETS = ".info-card, .timeline-card, .work-item, .repo-card, .profile-panel, .contact-card, .stats-grid div";

    const layer = document.createElement("div");
    layer.setAttribute("aria-hidden", "true");

    const spot = document.createElement("div");
    spot.className = "cursor-spot";

    const ring = document.createElement("div");
    ring.className = "cursor-ring";
    ring.dataset.mode = "idle";
    ring.dataset.down = "false";
    const ringBody = document.createElement("div");
    ringBody.className = "cursor-ring-body";
    ring.appendChild(ringBody);

    const dot = document.createElement("div");
    dot.className = "cursor-dot";

    layer.append(spot, ring, dot);
    document.body.appendChild(layer);
    document.documentElement.classList.add("custom-cursor");

    const state = { rx: -200, ry: -200, dx: -200, dy: -200, sx: -200, sy: -200, raf: 0, shown: false };

    const show = () => {
        if (state.shown) return;
        state.shown = true;
        ring.style.opacity = "1";
        dot.style.opacity = "1";
        spot.style.opacity = "1";
    };
    const hide = () => {
        state.shown = false;
        ring.style.opacity = "0";
        dot.style.opacity = "0";
        spot.style.opacity = "0";
    };

    let px = -200;
    let py = -200;

    const frame = () => {
        state.rx += (px - state.rx) * 0.17;
        state.ry += (py - state.ry) * 0.17;
        state.dx += (px - state.dx) * 0.62;
        state.dy += (py - state.dy) * 0.62;
        state.sx += (px - state.sx) * 0.07;
        state.sy += (py - state.sy) * 0.07;

        ring.style.transform = `translate3d(${state.rx}px, ${state.ry}px, 0)`;
        dot.style.transform = `translate3d(${state.dx}px, ${state.dy}px, 0)`;
        spot.style.transform = `translate3d(${state.sx}px, ${state.sy}px, 0)`;

        const settled =
            Math.abs(px - state.rx) < 0.1 && Math.abs(py - state.ry) < 0.1 && Math.abs(px - state.dx) < 0.1 && Math.abs(px - state.sx) < 0.3 && Math.abs(py - state.sy) < 0.3;
        state.raf = settled ? 0 : requestAnimationFrame(frame);
    };
    const kick = () => {
        if (!state.raf) state.raf = requestAnimationFrame(frame);
    };

    const onMove = (e) => {
        if (e.pointerType === "touch") return;
        px = e.clientX;
        py = e.clientY;
        if (!state.shown) {
            state.rx = state.dx = state.sx = px;
            state.ry = state.dy = state.sy = py;
            show();
        }
        kick();
    };

    const onOver = (e) => {
        const target = e.target;
        if (!target || !target.closest) return;
        if (target.closest(BUTTON_TARGETS)) {
            ring.dataset.mode = "button";
        } else if (target.closest(CARD_TARGETS)) {
            ring.dataset.mode = "card";
        } else {
            ring.dataset.mode = "idle";
        }
    };

    const onDown = (e) => {
        if (e.pointerType === "touch") return;
        ring.dataset.down = "true";
        const r = document.createElement("div");
        r.className = "cursor-ripple";
        r.style.left = `${e.clientX}px`;
        r.style.top = `${e.clientY}px`;
        document.body.appendChild(r);
        setTimeout(() => r.remove(), 650);
    };
    const onUp = () => {
        ring.dataset.down = "false";
    };
    const onVisibility = () => {
        if (document.hidden) hide();
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerover", onOver, { passive: true });
    window.addEventListener("pointerdown", onDown, { passive: true });
    window.addEventListener("pointerup", onUp, { passive: true });
    document.documentElement.addEventListener("mouseleave", hide);
    document.addEventListener("visibilitychange", onVisibility);
})();
