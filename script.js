// Wait for DOM to load before running
document.addEventListener('DOMContentLoaded', () => {
  // ===== NAVBAR =====
  const navLinksContainer = document.querySelector('#nav-links');
  const overlay = document.querySelector('.overlay');

  if (!navLinksContainer) {
    console.error('ERROR: #nav-links not found!');
    return; // Stop if navbar container missing
  }

  const navItems = document.querySelectorAll('#nav-links > .nav-item'); // Direct children only
  const allSubmenus = document.querySelectorAll('#nav-links .submenu');

  const toggleClass = (el, className) => el.classList.toggle(className);
  const addClass = (el, className) => el.classList.add(className);
  const removeClass = (el, className) => el.classList.remove(className);
  const hasClass = (el, className) => el.classList.contains(className);

  const hideAllSubmenus = () => allSubmenus.forEach(s => addClass(s, 'hidden'));

  const showSubmenu = (submenu) => {
    removeClass(submenu, 'hidden');
    if (overlay) removeClass(overlay, 'hidden');
  };

  const hideSubmenu = (submenu) => {
    addClass(submenu, 'hidden');
    if (overlay) addClass(overlay, 'hidden');
  };

  const closeOtherSubmenus = (currentItem) => {
    navItems.forEach(item => {
      if (item !== currentItem) {
        item.querySelectorAll('.submenu').forEach(s => addClass(s, 'hidden'));
      }
    });
  };

  const handleMainNavClick = (e) => {
    const btn = e.target.closest('.nav-main');
    if (!btn) return;

    const item = btn.closest('.nav-item');
    const submenu = item?.querySelector('.submenu');
    if (!submenu) return;

    e.preventDefault();
    closeOtherSubmenus(item);

    const isHidden = hasClass(submenu, 'hidden');
    isHidden ? showSubmenu(submenu) : hideSubmenu(submenu);
  };

  const handleNestedSubmenuClick = (e) => {
    const subMain = e.target.closest('.submenu-main');
    if (!subMain) return;

    const nested = subMain.parentElement?.querySelector('.nested');
    if (!nested) return;

    toggleClass(nested, 'hidden');
    e.stopPropagation();
  };

  const handleOutsideClick = (e) => {
    if (!e.target.closest('#nav-links')) {
      hideAllSubmenus();
      if (overlay) addClass(overlay, 'hidden');
    }
  };

  // Attach listeners
  navLinksContainer.addEventListener('click', handleMainNavClick);
  navLinksContainer.addEventListener('click', handleNestedSubmenuClick);
  document.addEventListener('click', handleOutsideClick);

  if (overlay) addClass(overlay, 'hidden');

  console.log('✓ Navigation initialized');

  // ===== IMAGE CAROUSEL =====
  const images = document.querySelectorAll('.hero-img');

  if (images.length === 0) {
    console.error('ERROR: .hero-img images not found!');
    return;
  }

  let current = 0;
  images[current].classList.add('active');

  setInterval(() => {
    images[current].classList.remove('active');
    current = (current + 1) % images.length;
    images[current].classList.add('active');
    console.log(`Image switched to: ${current + 1}/${images.length}`);
  }, 5000);

  console.log('✓ Carousel initialized with', images.length, 'images');
});
