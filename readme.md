# RK Arya College Website

A responsive static website for R.K. Arya College, Nawanshahr. The page keeps
the existing maroon, gold, and editorial typography branding while separating
document structure, presentation, and behavior.

## File Structure

```text
index.html       Semantic page markup and content
style.css        Design tokens, components, animations, and responsive rules
script.js        Navigation, scroll reveal, sliders, and gallery behavior
assets/          Images, icons, documents, and videos
components/      Reusable HTML fragments used by secondary pages
pages/           Secondary site pages
docs/            Architecture and component documentation
```

## Development

Open `index.html` directly in a browser, or serve the folder with any static
HTTP server. The page loads Tailwind's browser build and Google Fonts from
their respective CDNs.

## JavaScript Components

- Navigation dropdowns and nested menus
- IntersectionObserver-based section reveals
- Maharishi Dayanand portrait slider
- Campus image gallery with controls and autoplay

Repeated visual patterns such as course cards, feature cards, timeline items,
and leadership cards are represented as semantic HTML articles and styled by
their reusable component classes.
