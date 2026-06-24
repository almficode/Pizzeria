/* ═══════════════════════════════════════════
   PIZZERIA GIGI — script.js
═══════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {

  /* ── Navbar scroll ── */
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  }, { passive: true });

  /* ── Mobile menu ── */
  const burger    = document.getElementById('navBurger');
  const mobileNav = document.getElementById('navMobile');
  const closeBtn  = document.createElement('span');
  closeBtn.className = 'nav-close';
  closeBtn.innerHTML = '&times;';
  mobileNav.appendChild(closeBtn);
  const openMenu  = () => mobileNav.classList.add('open');
  const closeMenu = () => mobileNav.classList.remove('open');
  burger.addEventListener('click', openMenu);
  closeBtn.addEventListener('click', closeMenu);
  mobileNav.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  /* ── IntersectionObserver — reveal-up, reveal-right ── */
  const revealEls = document.querySelectorAll('.reveal-up, .reveal-right');
  const revObs = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        revObs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealEls.forEach(el => revObs.observe(el));

  /* ── Hero parallax ── */
  const heroBrand = document.getElementById('heroBrand');
  const heroBg    = document.getElementById('heroBg');
  const heroEl    = document.getElementById('hero');

  function tickHeroParallax() {
    const y      = window.scrollY;
    const heroH  = heroEl ? heroEl.offsetHeight : window.innerHeight;
    const capped = Math.min(y, heroH);
    if (heroBrand) heroBrand.style.transform = `translateY(${-capped * 0.38}px)`;
    if (heroBg)    heroBg.style.transform    = `translateY(${capped * 0.22}px)`;
  }

  /* ── About — 3D tilt on mousemove ── */
  const about3DCard = document.getElementById('about3DCard');
  if (about3DCard) {
    about3DCard.addEventListener('mousemove', (e) => {
      const rect = about3DCard.getBoundingClientRect();
      const x    = (e.clientX - rect.left) / rect.width  - 0.5;
      const y    = (e.clientY - rect.top)  / rect.height - 0.5;
      about3DCard.style.transition = 'none';
      about3DCard.style.transform  = `perspective(1000px) rotateY(${x * 16}deg) rotateX(${-y * 12}deg) translateY(-6px)`;
      const main  = about3DCard.querySelector('.about-img-main');
      const float = about3DCard.querySelector('.about-img-float');
      const badge = about3DCard.querySelector('.about-3d-badge');
      if (main)  main.style.transform  = `translateZ(0px) translate(${x * -8}px, ${y * -8}px)`;
      if (float) float.style.transform = `translateZ(20px) translate(${x * 12}px, ${y * 12}px)`;
      if (badge) badge.style.transform = `translateZ(40px) translate(${x * 20}px, ${y * -10}px)`;
    });
    about3DCard.addEventListener('mouseleave', () => {
      about3DCard.style.transition = 'transform 0.7s cubic-bezier(0.16,1,0.3,1)';
      about3DCard.style.transform  = 'perspective(1000px) rotateY(0) rotateX(0) translateY(0)';
      const main  = about3DCard.querySelector('.about-img-main');
      const float = about3DCard.querySelector('.about-img-float');
      const badge = about3DCard.querySelector('.about-3d-badge');
      if (main)  main.style.transform  = 'translateZ(0px)';
      if (float) float.style.transform = 'translateZ(20px)';
      if (badge) badge.style.transform = 'translateZ(40px)';
    });
  }

  /* ══════════════════════════════════════════════════
     GALERÍA SCATTER
     Las 4 fotos arrancan apiladas en el centro y se
     abren hacia sus esquinas conforme avanza el scroll
     a través del wrapper de 300vh.
     El texto aparece en el centro conforme se abren.
  ══════════════════════════════════════════════════ */
  const galeriaWrapper = document.getElementById('galeriaWrapper');
  const galeriaSection = document.getElementById('galeria');
  const galeriaStory   = document.getElementById('galeriaStory');
  const gItem1 = document.getElementById('gItem1');
  const gItem2 = document.getElementById('gItem2');
  const gItem3 = document.getElementById('gItem3');
  const gItem4 = document.getElementById('gItem4');

  function tickGaleriaScatter() {
    if (!galeriaWrapper || !galeriaSection) return;

    /* En móvil muy pequeño: todo visible sin animación */
    if (window.innerWidth < 480) {
      [gItem1, gItem2, gItem3, gItem4].forEach(item => {
        if (item) { item.style.opacity = '1'; item.style.transform = ''; }
      });
      if (galeriaStory) { galeriaStory.style.opacity = '1'; galeriaStory.style.transform = 'translate(-50%,-50%)'; }
      return;
    }

    /* Cuánto hemos scrolleado dentro del wrapper */
    const wrapperTop  = galeriaWrapper.getBoundingClientRect().top;
    const wrapperH    = galeriaWrapper.offsetHeight;
    const winH        = window.innerHeight;
    const scrolled    = -wrapperTop;                        /* 0 al llegar, positivo al bajar */
    const scrollRange = wrapperH - winH;                    /* rango total disponible */
    const progress    = Math.max(0, Math.min(1, scrolled / scrollRange));

    /* Easing cúbico suave */
    const eased = 1 - Math.pow(1 - progress, 2.5);

    /* Dimensiones del contenedor sticky */
    const W = galeriaSection.offsetWidth;
    const H = galeriaSection.offsetHeight;

    /* Tamaño de cada ítem (coincide con el CSS: 30% × 36%) */
    const itemW = W * 0.30;
    const itemH = H * 0.36;
    const gapX  = W * 0.03;
    const gapY  = H * 0.03;

    /* Centro geométrico del contenedor (donde deben arrancar todos) */
    const centerLeft = W / 2 - itemW / 2;
    const centerTop  = H / 2 - itemH / 2;

    /* Posición de esquina de g-item-1 (top-left) según CSS */
    const corner1X = gapX;          /* left: 3% */
    const corner1Y = gapY;          /* top: 3%  */

    /* Desplazamiento máximo desde la esquina hasta el centro */
    const maxDx = centerLeft - corner1X;   /* positivo: mover a la derecha */
    const maxDy = centerTop  - corner1Y;   /* positivo: mover hacia abajo  */

    /* Desplazamiento actual (decrece de max→0 conforme progress 0→1) */
    const dx = maxDx * (1 - eased);
    const dy = maxDy * (1 - eased);

    /* Aplicar transforms — cada esquina se mueve en su dirección */
    if (gItem1) gItem1.style.transform = `translate( ${dx}px,  ${dy}px)`;   /* top-left     */
    if (gItem2) gItem2.style.transform = `translate(${-dx}px,  ${dy}px)`;   /* top-right    */
    if (gItem3) gItem3.style.transform = `translate( ${dx}px, ${-dy}px)`;   /* bottom-left  */
    if (gItem4) gItem4.style.transform = `translate(${-dx}px, ${-dy}px)`;   /* bottom-right */

    /* Opacidad: aparecen rápido al inicio del scroll */
    const opacity = Math.min(1, progress * 4);
    [gItem1, gItem2, gItem3, gItem4].forEach(item => {
      if (item) item.style.opacity = String(opacity);
    });

    /* Historia central: aparece cuando las fotos ya están bastante abiertas (progress > 0.55) */
    if (galeriaStory) {
      const storyP = Math.max(0, (progress - 0.55) / 0.45);
      const storyE = 1 - Math.pow(1 - storyP, 2);
      galeriaStory.style.opacity   = String(storyE);
      /* Mantener el translate CSS base y añadir solo una pequeña subida */
      galeriaStory.style.transform = `translate(-50%, calc(-50% + ${(1 - storyE) * 18}px))`;
    }
  }

  function formatGalleryLabel(src) {
    const name = src.split('/').pop().replace(/\.[^.]+$/, '');
    return name
      .replace(/[-_]+/g, ' ')
      .replace(/\b\w/g, c => c.toUpperCase())
      .trim();
  }

  async function fetchGaleriaFolderImages() {
    try {
      const response = await fetch('Galeria/list.json', { cache: 'no-store' });
      if (!response.ok) throw new Error('No se pudo cargar galeria/list.json');
      const data = await response.json();
      const images = Array.isArray(data)
        ? data
        : data && Array.isArray(data.images)
          ? data.images
          : [];
      const normalized = images
        .map(path => String(path || '').trim())
        .filter(path => /\.(jpe?g|png|webp|gif|svg)$/i.test(path))
        .map(path => path.startsWith('galeria/') ? path : 'galeria/' + path)
        .filter((value, index, self) => self.indexOf(value) === index);
      if (normalized.length > 0) return normalized;
    } catch (error) {
      console.warn('No se pudo cargar galeria/list.json:', error);
    }

    return [
      'Galeria/pizza-1.svg',
      'Galeria/pizza-2.svg',
      'Galeria/pizza-3.svg',
      'Galeria/pizza-4.svg'
    ];
  }

  async function populateGaleriaFromFolder() {
    const images = await fetchGaleriaFolderImages();
    if (!images.length) return;

    const scatterItems = [gItem1, gItem2, gItem3, gItem4];
    scatterItems.forEach((item, index) => {
      if (!item) return;
      const img = item.querySelector('img');
      const label = item.querySelector('.galeria-item-label');
      if (images[index]) {
        img.src = images[index];
        img.alt = formatGalleryLabel(images[index]);
        if (label) label.textContent = formatGalleryLabel(images[index]);
        item.style.display = '';
      } else {
        item.style.display = 'none';
      }
    });

    const overlayGrid = document.getElementById('galeriaOverlayGrid');
    if (!overlayGrid) return;
    overlayGrid.innerHTML = '';

    const columns = 4;
    const durations = [32, 44, 26, 38];
    for (let column = 0; column < columns; column += 1) {
      const col = document.createElement('div');
      col.className = 'galeria-overlay-col';
      const inner = document.createElement('div');
      inner.className = 'galeria-col-inner ' + (column % 2 === 0 ? 'galeria-col--up' : 'galeria-col--down');
      inner.style.animationDuration = `${durations[column]}s`;

      const slice = images.filter((_, idx) => idx % columns === column);
      if (!slice.length) {
        slice.push(images[column % images.length]);
      }

      slice.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = formatGalleryLabel(src);
        inner.appendChild(img);
      });

      slice.forEach(src => {
        const img = document.createElement('img');
        img.src = src;
        img.alt = formatGalleryLabel(src);
        inner.appendChild(img);
      });

      col.appendChild(inner);
      overlayGrid.appendChild(col);
    }
  }

  populateGaleriaFromFolder();

  /* ── rAF loop unificado ── */
  let rafPending = false;
  function onScroll() {
    if (!rafPending) {
      rafPending = true;
      requestAnimationFrame(() => {
        tickHeroParallax();
        tickGaleriaScatter();
        rafPending = false;
      });
    }
  }

  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', () => tickGaleriaScatter(), { passive: true });
  tickHeroParallax();
  tickGaleriaScatter();

  /* ── Carta carousel — drag to scroll ── */
  const carousel = document.getElementById('cartaCarousel');
  if (carousel) {
    let isDown = false, startX, scrollLeft, hasDragged;
    carousel.addEventListener('mousedown', e => {
      isDown = true; hasDragged = false;
      startX = e.pageX - carousel.offsetLeft;
      scrollLeft = carousel.scrollLeft;
      carousel.classList.add('is-dragging');
    });
    carousel.addEventListener('mouseleave', () => { isDown = false; carousel.classList.remove('is-dragging'); });
    carousel.addEventListener('mouseup',    () => { isDown = false; carousel.classList.remove('is-dragging'); });
    carousel.addEventListener('mousemove', e => {
      if (!isDown) return;
      e.preventDefault();
      const x    = e.pageX - carousel.offsetLeft;
      const walk = (x - startX) * 1.6;
      if (Math.abs(walk) > 5) hasDragged = true;
      carousel.scrollLeft = scrollLeft - walk;
    });
    let touchStartX, touchScrollLeft;
    carousel.addEventListener('touchstart', e => {
      touchStartX = e.touches[0].pageX;
      touchScrollLeft = carousel.scrollLeft;
    }, { passive: true });
    carousel.addEventListener('touchmove', e => {
      carousel.scrollLeft = touchScrollLeft + (touchStartX - e.touches[0].pageX);
    }, { passive: true });
    carousel.addEventListener('click', e => {
      if (hasDragged) return;
      const card = e.target.closest('.carta-card');
      if (!card) return;
      openCartaModal(card);
    });
  }

  /* ── Modal carta card ── */
  const modal      = document.getElementById('cartaModal');
  const modalBg    = document.getElementById('cartaModalBg');
  const modalClose = document.getElementById('cartaModalClose');
  const modalImg   = document.getElementById('cartaModalImg');
  const modalCat   = document.getElementById('cartaModalCat');
  const modalName  = document.getElementById('cartaModalName');
  const modalDesc  = document.getElementById('cartaModalDesc');
  const modalPrice = document.getElementById('cartaModalPrice');

  function openCartaModal(card) {
    if (!modal) return;
    modalImg.src           = card.dataset.img   || '';
    modalImg.alt           = card.dataset.name  || '';
    modalCat.textContent   = card.dataset.cat   || '';
    modalName.textContent  = card.dataset.name  || '';
    modalDesc.textContent  = card.dataset.desc  || '';
    modalPrice.textContent = card.dataset.price || '';
    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  }
  function closeCartaModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  if (modalBg)    modalBg.addEventListener('click', closeCartaModal);
  if (modalClose) modalClose.addEventListener('click', closeCartaModal);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeCartaModal(); });

  /* ── Smooth anchor links ── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
      const href = anchor.getAttribute('href');
      if (href === '#' || anchor.classList.contains('galeria-open-link')) return;
      let target;
      try { target = document.querySelector(href); } catch(_) { return; }
      if (target) {
        e.preventDefault();
        const top = target.getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    });
  });

});
