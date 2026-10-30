(() => {
  document.documentElement.classList.add('js');
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#main-nav');
  if (menu && nav) {
    menu.hidden = false;
    const close = () => { nav.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); };
    menu.addEventListener('click', () => {
      const open = menu.getAttribute('aria-expanded') !== 'true';
      menu.setAttribute('aria-expanded', String(open));
      nav.classList.toggle('is-open', open);
    });
    nav.addEventListener('click', event => { if (event.target.closest('a')) close(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && nav.classList.contains('is-open')) { close(); menu.focus(); } });
    document.addEventListener('click', event => { if (!event.target.closest('.site-header')) close(); });
    window.matchMedia('(min-width: 801px)').addEventListener('change', close);
    if ('IntersectionObserver' in window) {
      const links = [...nav.querySelectorAll('a')];
      const observer = new IntersectionObserver(entries => {
        for (const entry of entries) if (entry.isIntersecting) {
          links.forEach(link => link.removeAttribute('aria-current'));
          links.find(link => link.hash === '#' + entry.target.id)?.setAttribute('aria-current', 'location');
        }
      }, { rootMargin: '-15% 0px -65% 0px', threshold: 0 });
      links.forEach(link => { const section = document.querySelector(link.hash); if (section) observer.observe(section); });
    }
  }
  document.querySelectorAll('[data-copy]').forEach(button => {
    button.hidden = false;
    button.addEventListener('click', async () => {
      const status = button.parentElement.nextElementSibling;
      try {
        await navigator.clipboard.writeText(button.dataset.copy);
        status.textContent = 'Article type copied.';
        button.textContent = 'Copied';
        setTimeout(() => { button.textContent = 'Copy'; }, 2200);
      } catch {
        const selection = window.getSelection();
        const range = document.createRange();
        range.selectNodeContents(button.previousElementSibling);
        selection.removeAllRanges();
        selection.addRange(range);
        status.textContent = 'Text selected. Use your device’s copy command.';
      }
    });
  });
})();
