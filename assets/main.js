// Progressive enhancements only. All workshop content is present in index.html.
const menuButton = document.querySelector('.menu-toggle');
const navigation = document.querySelector('#main-nav');
if (menuButton && navigation) {
  menuButton.hidden = false;
  const closeMenu = () => {
    menuButton.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
  };
  menuButton.addEventListener('click', () => {
    const isOpen = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(isOpen));
    navigation.classList.toggle('is-open', isOpen);
  });
  navigation.addEventListener('click', event => {
    if (event.target.closest('a')) closeMenu();
  });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') {
      closeMenu();
      menuButton.focus();
    }
  });
  document.addEventListener('click', event => {
    if (!event.target.closest('.nav-bar')) closeMenu();
  });
  window.matchMedia('(min-width: 1001px)').addEventListener('change', closeMenu);
}

const filters = document.querySelector('.session-filters');
if (filters) {
  filters.hidden = false;
  filters.addEventListener('click', event => {
    const button = event.target.closest('[data-filter]');
    if (!button) return;
    const period = button.dataset.filter;
    filters.querySelectorAll('button').forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    let count = 0;
    document.querySelectorAll('.schedule-row').forEach(row => {
      row.hidden = period !== 'all' && row.dataset.period !== period;
      if (!row.hidden) count++;
    });
    document.querySelector('#schedule-status').textContent = `${button.textContent}: ${count} sessions shown.`;
  });
}

if ('IntersectionObserver' in window) {
  const links = [...document.querySelectorAll('#main-nav a')];
  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      links.forEach(link => {
        if (link.hash === `#${entry.target.id}`) link.setAttribute('aria-current', 'location');
        else link.removeAttribute('aria-current');
      });
    });
  }, { rootMargin: '-12% 0px -65% 0px', threshold: 0 });
  links.forEach(link => {
    const section = document.querySelector(link.hash);
    if (section) observer.observe(section);
  });
  observer.observe(document.querySelector('.hero'));
}

// Animate cards once as they enter. Content is never hidden in the stylesheet,
// so a disabled script or an unsupported browser leaves a fully readable page.
const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)');
if ('IntersectionObserver' in window && !motionPreference.matches) {
  const animations = new Set();
  const revealObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      revealObserver.unobserve(entry.target);
      if (motionPreference.matches) return;
      const siblings = [...entry.target.parentElement.children];
      const delay = entry.target.matches('.topic,.speaker,.organizer')
        ? Math.min(siblings.indexOf(entry.target) % 4 * 60, 180) : 0;
      const animation = entry.target.animate([
        { opacity: .2, transform: 'translateY(28px)', filter: 'blur(5px)' },
        { opacity: 1, transform: 'translateY(0)', filter: 'blur(0)' },
      ], { duration: 800, delay, easing: 'cubic-bezier(.2,.7,.2,1)' });
      animations.add(animation);
      animation.finished.then(() => animations.delete(animation)).catch(() => {});
    });
  }, { threshold: .08, rootMargin: '0px 0px -28px 0px' });
  document.querySelectorAll('.topic,.speaker,.organizer,.section-heading,.date-card,.directions')
    .forEach(element => revealObserver.observe(element));
  motionPreference.addEventListener('change', event => {
    if (!event.matches) return;
    revealObserver.disconnect();
    animations.forEach(animation => animation.cancel());
    animations.clear();
  });
}

// Pointer-responsive highlights and depth apply to decorative surfaces only.
// The scientific SVGs and the reading columns stay still.
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('.art-figure,.nav-bar,.topic,.speaker,.organizer').forEach(surface => {
    let frame = 0;
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      surface.style.removeProperty('--spot-x');
      surface.style.removeProperty('--spot-y');
      surface.style.removeProperty('--tilt-x');
      surface.style.removeProperty('--tilt-y');
    };
    surface.addEventListener('pointermove', event => {
      if (motionPreference.matches) return;
      cancelAnimationFrame(frame);
      const { clientX, clientY } = event;
      frame = requestAnimationFrame(() => {
        const rect = surface.getBoundingClientRect();
        const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
        const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));
        surface.style.setProperty('--spot-x', `${x * 100}%`);
        surface.style.setProperty('--spot-y', `${y * 100}%`);
        if (surface.classList.contains('art-figure')) {
          surface.style.setProperty('--tilt-x', `${(0.5 - y) * 8}deg`);
          surface.style.setProperty('--tilt-y', `${(x - 0.5) * 10}deg`);
        }
        frame = 0;
      });
    }, { passive: true });
    surface.addEventListener('pointerleave', reset);
    motionPreference.addEventListener('change', event => { if (event.matches) reset(); });
  });
}
