(() => {
  const body = document.body;
  const preference = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const toggle = document.querySelector('.motion-toggle');
  const animations = new Set();
  const resets = [];
  let savedPause = false;
  try { savedPause = localStorage.getItem('pivai-pause-motion') === 'true'; } catch { /* Storage may be disabled. */ }
  const paused = () => preference.matches || savedPause;
  const updatePreference = () => {
    body.classList.toggle('motion-paused', paused());
    if (paused()) {
      animations.forEach(animation => animation.cancel());
      animations.clear();
      resets.forEach(reset => reset());
    }
    if (toggle) {
      toggle.hidden = false;
      toggle.disabled = preference.matches;
      toggle.setAttribute('aria-pressed', String(paused()));
      toggle.textContent = preference.matches ? 'Reduced motion' : savedPause ? 'Resume motion ▷' : 'Pause motion Ⅱ';
      toggle.title = preference.matches ? 'Following your device’s reduced-motion preference' : 'Control decorative page animations';
    }
  };
  updatePreference();
  body.classList.add('motion-ready');
  preference.addEventListener('change', updatePreference);
  toggle?.addEventListener('click', () => {
    savedPause = !savedPause;
    try { localStorage.setItem('pivai-pause-motion', String(savedPause)); } catch { /* Preference still applies in this page. */ }
    updatePreference();
  });

  const hero = document.querySelector('.hero');
  let heroVisible = false;
  const updateAmbient = () => body.classList.toggle('hero-is-visible', heroVisible && !document.hidden);
  if (hero && 'IntersectionObserver' in window) {
    new IntersectionObserver(entries => {
      heroVisible = entries[0].isIntersecting;
      updateAmbient();
    }, {threshold: 0}).observe(hero);
  }
  document.addEventListener('visibilitychange', updateAmbient);

  // One short entry per element. Content is never hidden before observer setup.
  if ('IntersectionObserver' in window && Element.prototype.animate) {
    const reveal = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        reveal.unobserve(entry.target);
        if (paused()) return;
        const siblings = [...entry.target.parentElement.children];
        const stagger = entry.target.matches('.topic,.editor,.date-item') ? Math.max(0, siblings.indexOf(entry.target) % 3) * 55 : 0;
        const animation = entry.target.animate([
          {opacity: .45, transform: `translateY(${body.classList.contains('theme-blue') ? 12 : 22}px)`},
          {opacity: 1, transform: 'translateY(0)'}
        ], {duration: body.classList.contains('theme-warm') ? 750 : 650, delay: stagger, easing:'cubic-bezier(.2,.7,.2,1)'});
        animations.add(animation);
        animation.finished.then(() => animations.delete(animation)).catch(() => animations.delete(animation));
      });
    }, {threshold:.08, rootMargin:'0px 0px -20px 0px'});
    document.querySelectorAll('.section-heading,.topic,.editor,.date-item,.issue-details').forEach(el => reveal.observe(el));
  }

  // Pointer lighting and optical depth never move text, buttons, or image identities.
  document.querySelectorAll('[data-depth],.topic').forEach(surface => {
    let frame = 0;
    const reset = () => {
      cancelAnimationFrame(frame);
      frame = 0;
      ['--spot-x','--spot-y','--tilt-x','--tilt-y'].forEach(key => surface.style.removeProperty(key));
    };
    resets.push(reset);
    surface.addEventListener('pointermove', event => {
      if (paused() || !pointer.matches) return;
      cancelAnimationFrame(frame);
      const {clientX,clientY} = event;
      frame = requestAnimationFrame(() => {
        const rect = surface.getBoundingClientRect();
        const x = Math.min(1,Math.max(0,(clientX - rect.left) / rect.width));
        const y = Math.min(1,Math.max(0,(clientY - rect.top) / rect.height));
        surface.style.setProperty('--spot-x', `${x * 100}%`);
        surface.style.setProperty('--spot-y', `${y * 100}%`);
        if (surface.hasAttribute('data-depth')) {
          surface.style.setProperty('--tilt-x', `${(.5 - y) * 5}deg`);
          surface.style.setProperty('--tilt-y', `${(x - .5) * 6}deg`);
        }
        frame = 0;
      });
    }, {passive:true});
    surface.addEventListener('pointerleave', reset);
    pointer.addEventListener('change', reset);
  });
  if (hero && body.classList.contains('theme-mint')) {
    let frame = 0;
    const reset = () => { cancelAnimationFrame(frame); hero.style.removeProperty('--look-x'); hero.style.removeProperty('--look-y'); };
    resets.push(reset);
    hero.addEventListener('pointermove', event => {
      if (paused() || !pointer.matches) return;
      cancelAnimationFrame(frame);
      const {clientX,clientY} = event;
      frame = requestAnimationFrame(() => {
        const rect = hero.getBoundingClientRect();
        hero.style.setProperty('--look-x', `${((clientX-rect.left)/rect.width-.5)*3}px`);
        hero.style.setProperty('--look-y', `${((clientY-rect.top)/rect.height-.5)*3}px`);
      });
    }, {passive:true});
    hero.addEventListener('pointerleave', reset);
  }
  const progress = document.querySelector('.reading-progress');
  if (progress) {
    let scheduled = false;
    const updateProgress = () => {
      const max = document.documentElement.scrollHeight - innerHeight;
      progress.style.setProperty('--read-progress', String(max > 0 ? Math.min(1,Math.max(0,scrollY/max)) : 0));
      scheduled = false;
    };
    addEventListener('scroll', () => { if (!scheduled) { scheduled=true; requestAnimationFrame(updateProgress); } }, {passive:true});
    addEventListener('resize', updateProgress, {passive:true});
    updateProgress();
  }
})();
