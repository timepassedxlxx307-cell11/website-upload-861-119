
document.addEventListener('DOMContentLoaded', () => {
  const menuButton = document.querySelector('[data-menu-button]');
  const mobileNav = document.querySelector('[data-mobile-nav]');
  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', () => {
      mobileNav.classList.toggle('is-open');
    });
  }

  document.querySelectorAll('[data-hero-slider]').forEach((slider) => {
    const slides = Array.from(slider.querySelectorAll('[data-hero-slide]'));
    const dots = Array.from(slider.querySelectorAll('[data-hero-dot]'));
    if (slides.length === 0) {
      return;
    }
    let active = 0;
    const show = (index) => {
      active = (index + slides.length) % slides.length;
      slides.forEach((slide, slideIndex) => {
        slide.classList.toggle('is-active', slideIndex === active);
      });
      dots.forEach((dot, dotIndex) => {
        dot.classList.toggle('is-active', dotIndex === active);
      });
    };
    dots.forEach((dot, index) => {
      dot.addEventListener('click', () => show(index));
    });
    window.setInterval(() => show(active + 1), 5200);
  });

  document.querySelectorAll('[data-filter-panel]').forEach((panel) => {
    const scope = panel.parentElement || document;
    const input = panel.querySelector('[data-search-input]');
    const category = panel.querySelector('[data-filter-category]');
    const region = panel.querySelector('[data-filter-region]');
    const year = panel.querySelector('[data-filter-year]');
    const cards = Array.from(scope.querySelectorAll('[data-search-card]'));
    const apply = () => {
      const query = (input?.value || '').trim().toLowerCase();
      const categoryValue = category?.value || '';
      const regionValue = region?.value || '';
      const yearValue = year?.value || '';
      cards.forEach((card) => {
        const text = [
          card.dataset.title,
          card.dataset.category,
          card.dataset.region,
          card.dataset.year,
          card.dataset.type,
          card.textContent
        ].join(' ').toLowerCase();
        const okQuery = !query || text.includes(query);
        const okCategory = !categoryValue || card.dataset.category === categoryValue;
        const okRegion = !regionValue || (card.dataset.region || '').includes(regionValue);
        const okYear = !yearValue || card.dataset.year === yearValue;
        card.classList.toggle('is-filter-hidden', !(okQuery && okCategory && okRegion && okYear));
      });
    };
    [input, category, region, year].forEach((element) => {
      if (element) {
        element.addEventListener('input', apply);
        element.addEventListener('change', apply);
      }
    });
  });
});
