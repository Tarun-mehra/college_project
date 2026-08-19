# Components

Reusable HTML components are stored in the `components/` directory.

## Header

File:

`components/header.html`

Purpose:

Contains the main website header and institutional branding.

The header should be reused across pages instead of being duplicated.

## Navbar

File:

`components/navbar.html`

Purpose:

Contains the primary website navigation.

Responsibilities may include:

- Main navigation links
- Dropdown menus
- Mobile navigation
- Navigation states

## Breadcrumb

File:

`components/breadcrumb.html`

Purpose:

Displays the user's current location within the website hierarchy.

Example:

Home → About → Administration

## Footer

File:

`components/footer.html`

Purpose:

Contains the global website footer.

It may contain:

- College information
- Useful links
- Contact information
- Social links
- Copyright information

## Component Rules

Before creating a new component:

1. Check whether an existing component can be reused.
2. Keep each component focused on one responsibility.
3. Avoid putting page-specific content into global components.
4. Avoid duplicating component markup inside pages.
5. Keep component styling inside the appropriate CSS component or layout file.
