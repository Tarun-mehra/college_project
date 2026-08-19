# Project Architecture

## Overview

This project is a frontend website for R.K. Arya College.

The project uses:
- HTML for structure and content
- CSS for styling
- JavaScript for interactions
- Local assets for images, documents, icons and videos
- Reusable HTML components
- Documentation for project architecture and development rules

## Directory Structure

### assets/
Contains images, documents, icons and videos.

### components/
Contains reusable HTML components such as header, navbar, footer and breadcrumbs.

### css/
Contains the organized CSS architecture.

### docs/
Contains project documentation.

### js/
Contains JavaScript functionality.

### pages/
Contains internal website pages organized by section.

### index.html
Main homepage.

## CSS Architecture

The CSS system is organized into:

- foundation — reset, variables, base styles and typography
- layout — containers, grids, header and footer
- components — reusable UI components
- sections — page-section-specific styles
- utilities — helper and accessibility classes
- vendors — third-party CSS

`css/main.css` is the main CSS entry point.

## JavaScript Architecture

JavaScript is organized by responsibility:

- `components.js` — reusable HTML component handling
- `navigation.js` — navigation and menu interactions
- `forms.js` — form functionality

## Development Rules

- Reuse existing components before creating new ones.
- Use existing CSS variables instead of hard-coded design values.
- Avoid inline CSS.
- Avoid unnecessary `!important`.
- Keep page-specific styles separate from global styles.
- Keep JavaScript organized by responsibility.
- Do not duplicate content or components.
- Keep filenames descriptive and consistent.
