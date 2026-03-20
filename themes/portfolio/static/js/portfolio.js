(function () {
  'use strict';

  /* Nav scroll */
  const nav = document.getElementById('nav');
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 40);
  }, { passive: true });

  /* Mobile menu */
  const burger = document.getElementById('nav-burger');
  const navRight = document.querySelector('.nav-right');
  if (burger && navRight) {
    burger.addEventListener('click', () => {
      const open = navRight.classList.toggle('open');
      burger.setAttribute('aria-expanded', open);
      document.body.style.overflow = open ? 'hidden' : '';
      const spans = burger.querySelectorAll('span');
      if (open) {
        spans[0].style.cssText = 'transform:translateY(3.5px) rotate(45deg)';
        spans[1].style.cssText = 'transform:translateY(-3.5px) rotate(-45deg)';
      } else {
        spans[0].style.cssText = '';
        spans[1].style.cssText = '';
      }
    });
    navRight.querySelectorAll('a').forEach(a => {
      a.addEventListener('click', () => {
        navRight.classList.remove('open');
        document.body.style.overflow = '';
        burger.querySelectorAll('span').forEach(s => s.style.cssText = '');
      });
    });
  }

  /* Reveal on scroll */
  const ro = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('visible'); ro.unobserve(e.target); }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
  document.querySelectorAll('.reveal').forEach(el => ro.observe(el));

  /* Hero grid: random cell highlights */
  const cells = document.querySelectorAll('.hero-cell');
  if (cells.length) {
    setInterval(() => {
      const i = Math.floor(Math.random() * cells.length);
      cells[i].style.background = 'rgba(201,168,76,0.06)';
      setTimeout(() => cells[i].style.background = '', 600);
    }, 180);
  }

  /* Smooth anchor scroll */
  document.querySelectorAll('a[href^="#"]').forEach(a => {
    a.addEventListener('click', e => {
      const t = document.querySelector(a.getAttribute('href'));
      if (t) { e.preventDefault(); t.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
    });
  });

})();
