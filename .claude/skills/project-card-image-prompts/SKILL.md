---
name: project-card-image-prompts
description: Generate Gemini image-generation prompts for a new "Selected projects" card on this portfolio site, matching the visual style already used for the other project cards. Use whenever a new project entry is added to index.html and needs a cover image.
---

# Project card image prompts

This site's "Selected projects" section (`index.html`, `#projects`) shows one card per
project. Each card gets a cover image generated with Gemini. This skill produces a
prompt for a new project that looks consistent with the rest of the set.

## Steps

1. Read the new project's card in `index.html` (title, date range, employer, description,
   `card-tags`) to understand its domain and the concrete thing that was built.
2. Read `css/styles.css` and pull the current palette values so the prompt stays correct
   even if the theme changes later:
   - light mode `--bg`, `--primary`, `--accent` (near the top of the file, `:root`)
   - dark mode equivalents (`:root[data-theme="dark"]`)
3. Check the media aspect ratio the card will crop to — look at `.repo-card-media` (or
   whatever class the project cards use for images) for the `height` it's cropped to
   with `object-fit: cover`, so the prompt requests a matching wide landscape ratio
   (currently ~1200x630).
4. Build the prompt from two parts:

   **Shared style prefix** (reuse verbatim for every project so the set stays cohesive):

   > Minimalist flat-design tech illustration, isometric or geometric composition, wide
   > landscape format (1200x630), clean vector-art look, muted teal (`<light --primary>`)
   > and warm burnt-orange (`<light --accent>`) accents on a soft cream (`<light --bg>`)
   > background, subtle abstract grid/circuit-line texture, generous negative space, no
   > text, no logos, no watermarks, no photorealistic human faces.

   Swap in the actual hex values read in step 2 — don't hardcode the ones in this file,
   they may have changed.

   **Per-project line**: one sentence describing an abstract visual metaphor for what the
   project actually does — not a literal screenshot or UI mockup. Favor: transformations
   (before/after, low-res to high-res), networks/graphs (recommendation, chatbot,
   connections), or dashboards/gauges (analytics, scoring). Ground it in the project's
   actual tags/description, e.g.:
   - a CV/image model → depict an image transforming through a process (pixelation
     resolving to detail, a mismatched object being color/light-matched into a scene)
   - an LLM/agent system → depict nodes/arrows organizing or connecting items
   - a recommendation/decision system → depict a branching tree or a central item
     radiating connections to similar items
   - a chatbot → depict a chat-bubble/bot icon connected to the thing it helps with
   - a dashboard/analytics project → depict abstract charts, gauges, or a map with data
     points

5. Output the full prompt (prefix + per-project line) as one paragraph, ready to paste
   into Gemini. If asked for multiple new projects at once, produce one full prompt per
   project, each self-contained (don't make the user cross-reference a shared prefix
   from a different message).

## Notes

- Keep every prompt in the same style family — that's what makes the six-plus cards read
  as one designed set instead of six unrelated images.
- If the palette or card aspect ratio in the CSS has changed since this skill was written,
  trust the CSS over anything cached in this file or in prior conversations.
