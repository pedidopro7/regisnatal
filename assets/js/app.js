'use strict';
/* =========================================================
   REGIS MOTTA — interações e animações
   ========================================================= */
const $ = (s, root = document) => root.querySelector(s);
const $$ = (s, root = document) => [...root.querySelectorAll(s)];
const html = document.documentElement;
const CONFIG = Object.assign({ whatsapp: '', instagram: '' }, window.REGIS_CONFIG || {});
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
const isMobile = () => innerWidth <= 820;
const hasGsap = !!(window.gsap && window.ScrollTrigger);
const motionOK = hasGsap && !reducedMotion.matches;

window.__regisReady = true;
if (!motionOK) html.classList.remove('has-motion');
if (!motionOK) html.classList.add('no-motion');

/* ---------- rolagem suave ---------- */
let lenis = null;
if (motionOK) {
  gsap.registerPlugin(ScrollTrigger);
  if (window.Lenis) {
    lenis = new Lenis({ lerp: 0.085, wheelMultiplier: 1, smoothWheel: true });
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(t => lenis.raf(t * 1000));
    gsap.ticker.lagSmoothing(0);
  }
}
function scrollToTarget(target) {
  if (!target) return;
  if (lenis) lenis.scrollTo(target, { offset: target.id === 'inicio' ? 0 : -70, duration: 1.6, easing: t => 1 - Math.pow(1 - t, 4) });
  else target.scrollIntoView({ behavior: reducedMotion.matches ? 'auto' : 'smooth' });
}
$$('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
  const id = a.getAttribute('href');
  if (id.length < 2) return;
  const target = $(id);
  if (!target) return;
  e.preventDefault();
  closeMenu();
  scrollToTarget(target);
  if (id !== '#inicio') history.replaceState(null, '', id);
}));

/* ---------- menu ---------- */
const header = $('#header');
const menu = $('#menu');
const nav = $('#nav');
function closeMenu() {
  if (!nav.classList.contains('open')) return;
  nav.classList.remove('open');
  menu.setAttribute('aria-expanded', 'false');
  menu.setAttribute('aria-label', 'Abrir menu');
  lenis && lenis.start();
}
menu.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  menu.setAttribute('aria-expanded', String(open));
  menu.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
  if (lenis) open ? lenis.stop() : lenis.start();
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });

/* ---------- cabeçalho + progresso ---------- */
const progress = $('.progress i');
let lastY = scrollY;
function onScroll() {
  const y = scrollY;
  header.classList.toggle('scrolled', y > 80);
  const goingDown = y > lastY;
  header.classList.toggle('hide', goingDown && y > 700 && !nav.classList.contains('open'));
  lastY = y;
  const max = document.documentElement.scrollHeight - innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();
$('#year').textContent = new Date().getFullYear();

/* ---------- luzes da árvore ---------- */
const points = [[48,23],[53,29],[46,36],[62,38],[38,43],[53,48],[66,50],[35,55],[48,60],[62,62],[27,66],[41,71],[56,74],[73,73],[31,79],[51,83],[67,84],[46,52],[59,32],[36,63],[69,67],[50,42]];
const fairy = $('.fairy-lights');
points.forEach(([x, y], i) => {
  const dot = document.createElement('i');
  dot.style.cssText = `left:${x}%;top:${y}%;animation-delay:${-(i % 7) * .65}s;animation-duration:${2 + (i % 4) * .7}s`;
  fairy.append(dot);
});

const hero = $('.hero');
let lightsOn = true;
const lights = $('#lights');
lights.addEventListener('click', () => {
  const off = hero.classList.toggle('lights-off');
  lightsOn = !off;
  lights.setAttribute('aria-pressed', String(!off));
  $('#light-label').textContent = off ? 'Acenda o seu Natal' : 'O Natal está aceso';
  if (!off && soundOn) playBell(1046.5, audioContext.currentTime, .15);
  if (!off && motionOK) {
    gsap.fromTo('.fairy-lights i', { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: .6, stagger: { each: .03, from: 'random' }, ease: 'back.out(3)', clearProps: 'transform,opacity' });
  }
});

/* ---------- partículas douradas (reagem ao cursor) ---------- */
const canvas = $('#sparkles');
const ctx = canvas.getContext('2d');
let cw = 0, ch = 0, frame = 0, particles = [], heroVisible = true;
const mouse = { x: -9999, y: -9999 };
function resizeCanvas() {
  const r = hero.getBoundingClientRect();
  cw = r.width; ch = r.height;
  const dpr = Math.min(devicePixelRatio || 1, 1.75);
  canvas.width = cw * dpr; canvas.height = ch * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const n = cw < 760 ? 34 : 80;
  particles = Array.from({ length: n }, () => ({
    x: Math.random() * cw, y: Math.random() * ch,
    r: Math.random() * 1.3 + .3, s: Math.random() * .35 + .12,
    phase: Math.random() * Math.PI * 2, vx: 0, vy: 0,
    glint: Math.random() < .12
  }));
}
function drawGlint(x, y, size, alpha) {
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.moveTo(x, y - size); ctx.quadraticCurveTo(x, y, x + size, y);
  ctx.quadraticCurveTo(x, y, x, y + size); ctx.quadraticCurveTo(x, y, x - size, y);
  ctx.quadraticCurveTo(x, y, x, y - size); ctx.fill();
}
function animate(time) {
  frame = 0;
  if (reducedMotion.matches || !heroVisible || document.hidden) return;
  ctx.clearRect(0, 0, cw, ch);
  const dim = lightsOn ? 1 : .25;
  ctx.fillStyle = '#f5d9a2';
  for (const p of particles) {
    const dx = p.x - mouse.x, dy = p.y - mouse.y, d2 = dx * dx + dy * dy;
    if (d2 < 16000) { const f = (1 - d2 / 16000) * .9; const d = Math.sqrt(d2) || 1; p.vx += dx / d * f; p.vy += dy / d * f; }
    p.vx *= .92; p.vy *= .92;
    p.y += -p.s + p.vy;
    p.x += Math.sin(time / 4200 + p.phase) * .18 + p.vx;
    if (p.y < -10) { p.y = ch + 10; p.x = Math.random() * cw; }
    if (p.x < -10) p.x = cw + 10; if (p.x > cw + 10) p.x = -10;
    const a = (.16 + Math.abs(Math.sin(time / 2000 + p.phase)) * .55) * dim;
    if (p.glint) drawGlint(p.x, p.y, p.r * 3.2, a);
    else { ctx.globalAlpha = a; ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill(); }
  }
  frame = requestAnimationFrame(animate);
}
function resumeParticles() { if (!frame && !reducedMotion.matches && heroVisible && !document.hidden) frame = requestAnimationFrame(animate); }
if (ctx) {
  resizeCanvas();
  let rt; addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(resizeCanvas, 150); });
  new IntersectionObserver(e => { heroVisible = e[0].isIntersecting; resumeParticles(); }).observe(hero);
  hero.addEventListener('pointermove', e => { const r = hero.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
  hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
  resumeParticles();
  reducedMotion.addEventListener?.('change', resumeParticles);
}

/* ---------- cursor personalizado ---------- */
const cursor = $('.cursor');
if (motionOK && finePointer.matches) {
  html.classList.add('has-cursor');
  const dot = $('.cursor-dot'), ring = $('.cursor-ring'), label = $('.cursor-label');
  const dx = gsap.quickTo(dot, 'x', { duration: .12, ease: 'power3' }), dy = gsap.quickTo(dot, 'y', { duration: .12, ease: 'power3' });
  const rx = gsap.quickTo(ring, 'x', { duration: .5, ease: 'power3' }), ry = gsap.quickTo(ring, 'y', { duration: .5, ease: 'power3' });
  addEventListener('pointermove', e => { dx(e.clientX); dy(e.clientY); rx(e.clientX); ry(e.clientY); cursor.classList.remove('is-hidden'); });
  document.addEventListener('pointerleave', () => cursor.classList.add('is-hidden'));
  document.addEventListener('pointerover', e => {
    const view = e.target.closest('[data-cursor]');
    const link = e.target.closest('a, button, summary, label, select, input, textarea');
    cursor.classList.toggle('is-view', !!view);
    cursor.classList.toggle('is-link', !view && !!link);
    if (view) label.textContent = view.dataset.cursor;
  });
}

/* ---------- botões magnéticos ---------- */
if (motionOK && finePointer.matches) {
  $$('.magnetic').forEach(el => {
    const xTo = gsap.quickTo(el, 'x', { duration: .6, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: .6, ease: 'power3' });
    el.addEventListener('pointermove', e => {
      const r = el.getBoundingClientRect();
      xTo((e.clientX - r.left - r.width / 2) * .3);
      yTo((e.clientY - r.top - r.height / 2) * .4);
    });
    el.addEventListener('pointerleave', () => { gsap.to(el, { x: 0, y: 0, duration: 1, ease: 'elastic.out(1,.35)' }); });
  });
}

/* ---------- acordeões suaves (serviços + FAQ) ---------- */
const svImages = $$('.sv');
const svNum = $('#sv-num');
function showServiceImage(i) {
  if (!svImages.length || i < 0) return;
  svImages.forEach((img, k) => img.classList.toggle('active', k === i));
  svNum.textContent = String(i + 1).padStart(2, '0');
}
function setupAccordion(container, exclusive) {
  const items = $$('details', container);
  items.forEach((d, i) => {
    const summary = $('summary', d), body = $('.d-body', d);
    if (container.classList.contains('service-list')) {
      summary.addEventListener('pointerenter', () => finePointer.matches && showServiceImage(i));
    }
    summary.addEventListener('click', e => {
      if (!motionOK) { if (!d.open && exclusive) items.forEach(o => o !== d && (o.open = false)); if (!d.open) showServiceImage(container.classList.contains('service-list') ? i : -1); return; }
      e.preventDefault();
      if (d.open) {
        gsap.to(body, { height: 0, opacity: 0, duration: .6, ease: 'power3.inOut', onComplete: () => { d.open = false; gsap.set(body, { clearProps: 'height,opacity' }); ScrollTrigger.refresh(); } });
      } else {
        if (exclusive) items.forEach(o => { if (o !== d && o.open) { const b = $('.d-body', o); gsap.to(b, { height: 0, opacity: 0, duration: .6, ease: 'power3.inOut', onComplete: () => { o.open = false; gsap.set(b, { clearProps: 'height,opacity' }); } }); } });
        d.open = true;
        gsap.fromTo(body, { height: 0, opacity: 0 }, { height: 'auto', opacity: 1, duration: .8, ease: 'power3.out', onComplete: () => { gsap.set(body, { clearProps: 'height' }); ScrollTrigger.refresh(); } });
        if (container.classList.contains('service-list')) showServiceImage(i);
      }
    });
  });
}
setupAccordion($('.service-list'), true);
setupAccordion($('.faq-list'), true);

/* ---------- portfólio: filtros ---------- */
const filterInk = $('.filter-ink');
function moveInk(btn) {
  if (!filterInk || !btn) return;
  const pr = btn.parentElement.getBoundingClientRect(), r = btn.getBoundingClientRect();
  filterInk.style.width = r.width + 'px';
  filterInk.style.transform = `translateX(${r.left - pr.left + btn.parentElement.scrollLeft}px)`;
}
moveInk($('.filters .active'));
addEventListener('resize', () => moveInk($('.filters .active')));
document.fonts && document.fonts.ready.then(() => moveInk($('.filters .active')));
$$('[data-filter]').forEach(button => button.addEventListener('click', () => {
  $$('[data-filter]').forEach(b => { const s = b === button; b.classList.toggle('active', s); b.setAttribute('aria-pressed', String(s)); });
  moveInk(button);
  const f = button.dataset.filter;
  const cards = $$('.project');
  const apply = () => {
    let count = 0; const shown = [];
    cards.forEach(card => { const v = f === 'all' || card.dataset.category === f; card.hidden = !v; if (v) { count++; shown.push(card); } });
    $('.project-grid').classList.toggle('filtered', f !== 'all');
    $('#filter-status').textContent = `${count} projetos exibidos.`;
    if (motionOK) {
      gsap.set(shown.map(c => $('.project-image', c)), { clipPath: 'inset(0% 0% 0% 0%)' });
      gsap.set(shown.map(c => $('.project-meta', c)), { opacity: 1, y: 0 });
      gsap.fromTo(shown, { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: .9, stagger: .08, ease: 'expo.out', clearProps: 'opacity,transform' });
      ScrollTrigger.refresh();
    }
  };
  if (motionOK) gsap.to('.project:not([hidden])', { opacity: 0, y: 20, duration: .3, stagger: .03, ease: 'power2.in', onComplete: apply });
  else apply();
}));

/* ---------- galeria ---------- */
const projects = [
  { image: 'arvore-03.webp', title: 'Aconchego em cada luz', description: 'Ramos vermelhos, laços e pontos de luz compõem uma árvore cheia de textura. Um Natal que convida a ficar um pouco mais.', alt: 'Árvore natalina com ramos vermelhos, laços e luzes douradas' },
  { image: 'arvore-02.webp', title: 'Clássico que surpreende', description: 'Vermelho em diferentes texturas, esferas claras e brilho na medida. Uma composição clássica, rica em detalhes.', alt: 'Árvore de Natal em vermelho, branco e tons metálicos' },
  { image: 'guirlanda-01.webp', title: 'O primeiro abraço', description: 'O laço vermelho anuncia a chegada do Natal. Luzes delicadas e elementos natalinos transformam a porta em um gesto de boas-vindas.', alt: 'Guirlanda natalina iluminada sobre porta de madeira' },
  { image: 'detalhe-01.webp', title: 'Encanto em outra altura', description: 'A decoração também acontece acima do olhar. Ramos e esferas vermelhas se integram ao lustre, ampliando a atmosfera natalina.', alt: 'Lustre com enfeites e bolas vermelhas suspensas' },
  { image: 'arvore-04.webp', title: 'Presença que encanta', description: 'Um grande laço, contrastes de verde e vermelho e esferas claras. Uma composição vertical que transforma a percepção do ambiente.', alt: 'Árvore com grande laço vermelho e bolas brancas' },
  { image: 'arvore-01.webp', title: 'A alegria de estar junto', description: 'Presentes, personagens e uma árvore em vermelho. Uma cena que traz de volta a alegria de esperar pelo Natal.', alt: 'Árvore vermelha com presentes e personagens natalinos' }
];
let currentProject = 0;
const gallery = $('#gallery');
const gImg = $('#gallery-image');
function showProject(index, animate = true) {
  currentProject = (index + projects.length) % projects.length;
  const p = projects[currentProject];
  const n = String(currentProject + 1).padStart(2, '0');
  const set = () => {
    gImg.src = 'assets/img/' + p.image; gImg.alt = p.alt;
    $('#gallery-title').textContent = p.title;
    $('#gallery-description').textContent = p.description;
    $('#gallery-count').textContent = `${n} / 06 — PORTFÓLIO REGIS MOTTA`;
    $('#gallery-big').textContent = n;
    requestAnimationFrame(() => gImg.classList.remove('swap'));
    if (motionOK) gsap.fromTo(['#gallery-count', '#gallery-title', '#gallery-description'], { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: .7, stagger: .06, ease: 'expo.out' });
  };
  if (animate && motionOK) { gImg.classList.add('swap'); setTimeout(set, 280); } else set();
}
$$('.project').forEach(b => b.addEventListener('click', () => {
  showProject(Number(b.dataset.index), false);
  gallery.showModal();
  document.body.classList.add('modal-open');
  lenis && lenis.stop();
}));
const closeGallery = () => gallery.close();
$('.dialog-close').addEventListener('click', closeGallery);
gallery.addEventListener('close', () => { document.body.classList.remove('modal-open'); lenis && lenis.start(); });
gallery.addEventListener('click', e => {
  if (e.target !== gallery) return;
  const r = gallery.getBoundingClientRect();
  if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) closeGallery();
});
$('#previous').addEventListener('click', () => showProject(currentProject - 1));
$('#following').addEventListener('click', () => showProject(currentProject + 1));
gallery.addEventListener('keydown', e => {
  if (e.key === 'ArrowRight') { e.preventDefault(); showProject(currentProject + 1); }
  if (e.key === 'ArrowLeft') { e.preventDefault(); showProject(currentProject - 1); }
});
let touchX = null;
gallery.addEventListener('touchstart', e => { touchX = e.touches[0].clientX; }, { passive: true });
gallery.addEventListener('touchend', e => {
  if (touchX === null) return;
  const d = e.changedTouches[0].clientX - touchX;
  if (Math.abs(d) > 50) showProject(currentProject + (d < 0 ? 1 : -1));
  touchX = null;
});
$('#gallery-cta').addEventListener('click', e => { e.preventDefault(); closeGallery(); setTimeout(() => scrollToTarget($('#seu-natal')), 30); });

/* ---------- formulário ---------- */
const form = $('#quote');
const hasWhats = /^\d{10,15}$/.test(String(CONFIG.whatsapp || '').replace(/\D/g, '')) && String(CONFIG.whatsapp).replace(/\D/g, '').length >= 10;
const whatsNumber = String(CONFIG.whatsapp || '').replace(/\D/g, '');
if (hasWhats) $('#step2-note').textContent = 'Seu resumo será preparado aqui. Você confere tudo antes de enviar pelo WhatsApp.';
if (CONFIG.instagram) { const ig = $('#instagram'); ig.href = CONFIG.instagram; ig.hidden = false; }
function setStep(step) {
  $('#step1').hidden = step !== 1;
  $('#step2').hidden = step !== 2;
  $('#quote-result').hidden = true;
  $('#step-label').textContent = step === 1 ? '01 / 02' : '02 / 02';
  $('#form-bar').style.width = step === 1 ? '50%' : '100%';
  $$('input,textarea', $('#step2')).forEach(el => el.disabled = step !== 2);
  if (step === 2) $('input[name="name"]').focus({ preventScroll: true });
  if (motionOK) gsap.fromTo(step === 1 ? '#step1' : '#step2', { opacity: 0, x: step === 1 ? -24 : 24 }, { opacity: 1, x: 0, duration: .6, ease: 'expo.out', clearProps: 'all' });
}
$('#next').addEventListener('click', () => setStep(2));
$('#back').addEventListener('click', () => setStep(1));
$('#edit').addEventListener('click', () => setStep(2));
form.addEventListener('submit', e => {
  e.preventDefault();
  const d = new FormData(form);
  const name = String(d.get('name') || '').trim(), city = String(d.get('city') || '').trim();
  if (!name || !city) {
    const input = !name ? $('input[name="name"]') : $('input[name="city"]');
    input.setCustomValidity('Preencha este campo.'); input.reportValidity();
    input.addEventListener('input', () => input.setCustomValidity(''), { once: true });
    return;
  }
  const msg = String(d.get('message') || '').trim();
  const summary = `Olá, Regis! Meu nome é ${name}.\nGostaria de conversar sobre o meu Natal.\n\nEspaço: ${d.get('space')}\nServiço: ${d.get('service')}\nCidade / bairro: ${city}${msg ? '\nMinha ideia: ' + msg : ''}`;
  $('#summary').value = summary;
  $('#step2').hidden = true;
  $('#quote-result').hidden = false;
  $('#step-label').textContent = 'SEU RESUMO';
  const wa = $('#whatsapp');
  if (hasWhats) {
    wa.href = `https://wa.me/${whatsNumber}?text=${encodeURIComponent(summary)}`;
    wa.hidden = false;
    $('#copy-status').textContent = 'Toque em “Enviar pelo WhatsApp” para abrir a conversa com o resumo pronto.';
  }
  if (motionOK) gsap.fromTo('#quote-result > *', { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: .7, stagger: .05, ease: 'expo.out' });
  $('#copy').focus({ preventScroll: true });
});
$('#copy').addEventListener('click', async () => {
  try {
    if (!navigator.clipboard) throw new Error('indisponível');
    await navigator.clipboard.writeText($('#summary').value);
    $('#copy-status').textContent = hasWhats
      ? 'Resumo copiado. Você também pode enviar direto pelo WhatsApp.'
      : 'Resumo copiado. Guarde para compartilhar quando o contato do ateliê estiver disponível. O pedido não foi enviado.';
  } catch {
    $('#summary').focus(); $('#summary').select();
    $('#copy-status').textContent = 'Selecione e copie o texto acima. O pedido ainda não foi enviado.';
  }
});

/* ---------- som (Noite Feliz, domínio público, em sinos sintetizados) ---------- */
let audioContext, soundOn = false, melodyTimer = null;
const activeOscillators = new Set();
const melody = [[67,1.5],[69,.5],[67,1],[64,3],[67,1.5],[69,.5],[67,1],[64,3],[74,2],[74,1],[71,3],[72,2],[72,1],[67,3],[69,2],[69,1],[72,1.5],[71,.5],[69,1],[67,1.5],[69,.5],[67,1],[64,3],[69,2],[69,1],[72,1.5],[71,.5],[69,1],[67,1.5],[69,.5],[67,1],[64,3]];
function playBell(freq, time, volume = .07) {
  if (!audioContext) return;
  for (const [ratio, level] of [[1, 1], [2, .15], [3.01, .05]]) {
    const osc = audioContext.createOscillator(), gain = audioContext.createGain();
    osc.type = 'sine'; osc.frequency.value = freq * ratio;
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume * level, time + .015);
    gain.gain.exponentialRampToValueAtTime(.0001, time + 2.5);
    osc.connect(gain); gain.connect(audioContext.destination);
    activeOscillators.add(osc); osc.onended = () => activeOscillators.delete(osc);
    osc.start(time); osc.stop(time + 2.6);
  }
}
function scheduleMelody() {
  if (!soundOn) return;
  let t = audioContext.currentTime + .2;
  for (const [note, beats] of melody) { playBell(440 * Math.pow(2, (note - 69) / 12), t); t += beats * .58; }
  melodyTimer = setTimeout(scheduleMelody, (t - audioContext.currentTime + 3) * 1000);
}
async function toggleSound() {
  const Ctx = window.AudioContext || window.webkitAudioContext;
  if (!Ctx) { $('#sound-label').textContent = 'Som indisponível'; return; }
  try {
    if (!audioContext) audioContext = new Ctx();
    if (soundOn) {
      soundOn = false; clearTimeout(melodyTimer);
      for (const o of activeOscillators) { try { o.stop(); } catch {} }
      activeOscillators.clear(); await audioContext.suspend();
    } else { await audioContext.resume(); soundOn = true; scheduleMelody(); }
    $('#sound').setAttribute('aria-pressed', String(soundOn));
    $('#sound-label').textContent = soundOn ? 'Pausar som' : 'Ativar som';
  } catch { $('#sound-label').textContent = 'Som indisponível'; }
}
$('#sound').addEventListener('click', toggleSound);
document.addEventListener('visibilitychange', () => { if (document.hidden && soundOn) toggleSound(); if (!document.hidden) resumeParticles(); });

/* =========================================================
   COREOGRAFIA (somente com GSAP e movimento permitido)
   ========================================================= */
const loader = $('.loader');
if (!motionOK) {
  loader.classList.add('done');
} else {
  runChoreography();
}

function splitWords(el) {
  const walk = node => {
    [...node.childNodes].forEach(n => {
      if (n.nodeType === 3) {
        const frag = document.createDocumentFragment();
        n.textContent.split(/(\s+)/).forEach(part => {
          if (!part) return;
          if (/^\s+$/.test(part)) frag.append(part);
          else { const s = document.createElement('span'); s.className = 'w'; s.textContent = part; frag.append(s); }
        });
        n.replaceWith(frag);
      } else if (n.nodeType === 1 && n.tagName !== 'BR') walk(n);
    });
  };
  walk(el);
  return $$('.w', el);
}

function runChoreography() {
  const ease = 'expo.out';

  /* abertura */
  lenis && lenis.stop();
  scrollTo(0, 0);
  const counter = { v: 0 };
  const num = $('#loader-num');
  const intro = gsap.timeline({ delay: .15 });
  intro
    .to(counter, { v: 100, duration: 1.7, ease: 'power2.inOut', onUpdate: () => { num.textContent = String(Math.round(counter.v)).padStart(2, '0'); } })
    .to('.loader-inner', { opacity: 0, y: -30, duration: .5, ease: 'power2.in' }, '-=.1')
    .to('.loader-panel--top', { yPercent: -100, duration: 1.1, ease: 'expo.inOut' }, '-=.15')
    .to('.loader-panel--bottom', { yPercent: 100, duration: 1.1, ease: 'expo.inOut' }, '<')
    .add(() => { loader.classList.add('done'); lenis && lenis.start(); }, '-=.2')
    .add(heroIn(), '-=.85');

  function heroIn() {
    const tl = gsap.timeline();
    tl.fromTo('.hero-photo', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' })
      .fromTo('.hero-photo > img', { scale: 1.35 }, { scale: 1, duration: 2.2, ease }, '<')
      .fromTo('.arch-outline', { opacity: 0, scale: .92 }, { opacity: 1, scale: 1, duration: 1.6, ease }, '<.4')
      .to('h1 .ln > span', { y: 0, duration: 1.4, stagger: .12, ease }, '<.1')
      .from('.hero-eyebrow, .hero-description, .hero-actions, .hero-signature', { opacity: 0, y: 26, duration: 1.2, stagger: .1, ease }, '<.3')
      .from('.orbit-star', { scale: 0, rotate: -180, opacity: 0, duration: 1.4, stagger: .15, ease: 'back.out(1.7)' }, '<.2')
      .from('.seal', { scale: .4, opacity: 0, rotate: -90, duration: 1.4, ease }, '<.1')
      .from('.light-switch, .photo-caption, .hero-bottom', { opacity: 0, y: 16, duration: 1, stagger: .08, ease }, '<.2');
    return tl;
  }

  /* hero: parallax de rolagem e de cursor */
  gsap.to('.hero-photo > img', { yPercent: 12, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero-copy', { yPercent: -18, opacity: .2, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  gsap.to('.hero-visual', { yPercent: -8, ease: 'none', scrollTrigger: { trigger: hero, start: 'top top', end: 'bottom top', scrub: true } });
  if (finePointer.matches) {
    const vis = $('.hero-photo'), star = $$('.orbit-star');
    const px = gsap.quickTo(vis, 'x', { duration: 1.2, ease: 'power3' }), py = gsap.quickTo(vis, 'y', { duration: 1.2, ease: 'power3' });
    const sx = gsap.quickTo(star, 'x', { duration: 1.6, ease: 'power3' }), sy = gsap.quickTo(star, 'y', { duration: 1.6, ease: 'power3' });
    const gx = gsap.quickTo('.hero-glow', 'x', { duration: 2, ease: 'power3' }), gy = gsap.quickTo('.hero-glow', 'y', { duration: 2, ease: 'power3' });
    hero.addEventListener('pointermove', e => {
      const nx = e.clientX / innerWidth - .5, ny = e.clientY / innerHeight - .5;
      px(nx * 14); py(ny * 14); sx(nx * -34); sy(ny * -34); gx(nx * 120); gy(ny * 120);
    });
  }

  /* faixa reage à velocidade da rolagem */
  const track = $('.ribbon-track');
  let mx = 0, dir = 1;
  gsap.ticker.add(() => {
    const v = lenis ? lenis.velocity : 0;
    if (v > .3) dir = 1; else if (v < -.3) dir = -1;
    mx -= (0.045 + Math.min(Math.abs(v) * .03, 1.2)) * dir;
    if (mx <= -50) mx += 50; if (mx > 0) mx -= 50;
    track.style.transform = `translate3d(${mx}%,0,0)`;
  });

  /* revelações genéricas */
  ScrollTrigger.batch('.reveal', {
    start: 'top 90%', once: true,
    onEnter: batch => gsap.to(batch, { opacity: 1, y: 0, duration: 1.2, stagger: .09, ease, overwrite: true })
  });
  $$('.split').forEach(h => {
    gsap.to($$('.ln > span', h), { y: 0, duration: 1.3, stagger: .1, ease, scrollTrigger: { trigger: h, start: 'top 88%', once: true } });
  });

  /* intro: palavras acendem na rolagem */
  const title = $('[data-fill]');
  const words = splitWords(title);
  gsap.set(words, { opacity: .14 });
  gsap.to(words, { opacity: 1, stagger: .12, ease: 'none', scrollTrigger: { trigger: title, start: 'top 80%', end: 'bottom 45%', scrub: true } });

  /* parallax por data-speed */
  $$('[data-speed]').forEach(el => {
    const sp = parseFloat(el.dataset.speed);
    gsap.to(el, { yPercent: sp * 100, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: true } });
  });
  $$('.intro-collage img').forEach(img => gsap.fromTo(img, { yPercent: -12 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: img.parentElement, start: 'top bottom', end: 'bottom top', scrub: true } }));
  gsap.fromTo('.intro-collage figure', { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, stagger: .2, ease: 'expo.inOut', scrollTrigger: { trigger: '.intro-collage', start: 'top 85%', once: true } });

  /* portfólio */
  $$('.project').forEach(card => {
    const box = $('.project-image', card), img = $('img', box), meta = $('.project-meta', card);
    const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 88%', once: true } });
    tl.fromTo(box, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.5, ease: 'expo.inOut' })
      .from(img, { scale: 1.3, duration: 2, ease }, '<')
      .to(meta, { opacity: 1, y: 0, duration: 1, ease }, '<.6');
    gsap.fromTo(img, { yPercent: -12 }, { yPercent: 0, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: true } });
  });

  /* interlúdio: imagem se expande dentro da tipografia */
  const mm = gsap.matchMedia();
  mm.add({ mobile: '(max-width: 820px)', desktop: '(min-width: 821px)' }, c => {
    const start = c.conditions.mobile ? 'inset(30% 24% 30% 24% round 999px 999px 0px 0px)' : 'inset(22% 39% 22% 39% round 999px 999px 0px 0px)';
    gsap.set('.interlude-words', { opacity: 1 });
    gsap.set('.interlude-final', { opacity: 0, y: 50 });
    gsap.set('.interlude-kicker', { color: '#3a0f19' });
    const tl = gsap.timeline({ scrollTrigger: { trigger: '.interlude-stage', start: 'top top', end: '+=170%', pin: true, scrub: 1, anticipatePin: 1 } });
    tl.fromTo('.interlude-media', { clipPath: start }, { clipPath: 'inset(0% 0% 0% 0% round 0px 0px 0px 0px)', ease: 'power2.inOut', duration: 1 }, 0)
      .fromTo('.interlude-media img', { scale: 1.45 }, { scale: 1, ease: 'power2.inOut', duration: 1 }, 0)
      .to('.iw-l', { xPercent: c.conditions.mobile ? -120 : -70, opacity: 0, ease: 'power2.in', duration: .7 }, 0)
      .to('.iw-r', { xPercent: c.conditions.mobile ? 120 : 70, opacity: 0, ease: 'power2.in', duration: .7 }, 0)
      .to('.interlude-kicker', { color: '#d9b977', duration: .4 }, .3)
      .to('.interlude-final', { opacity: 1, y: 0, ease: 'power3.out', duration: .45 }, .75)
      .fromTo('.large-star', { scale: 0, rotate: -90 }, { scale: 1, rotate: 0, ease: 'back.out(2)', duration: .3 }, .9);
    return () => gsap.set(['.interlude-words', '.interlude-final', '.interlude-kicker', '.interlude-media'], { clearProps: 'all' });
  });

  /* sobre */
  $$('.reveal-clip').forEach(el => {
    gsap.timeline({ scrollTrigger: { trigger: el, start: 'top 85%', once: true } })
      .fromTo(el, { clipPath: 'inset(100% 0% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.6, ease: 'expo.inOut' })
      .from($('img', el), { scale: 1.3, duration: 2.2, ease }, '<');
  });
  const years = $('#years');
  const yc = { v: 0 };
  years.textContent = '0';
  gsap.to(yc, { v: Number(years.dataset.to), duration: 2.2, ease: 'power3.out', scrollTrigger: { trigger: '.experience', start: 'top 92%', once: true }, onUpdate: () => { years.textContent = Math.round(yc.v); } });
  gsap.from('.experience', { xPercent: -30, opacity: 0, duration: 1.2, ease, scrollTrigger: { trigger: '.experience', start: 'top 92%', once: true } });
  gsap.fromTo('.signature span', { clipPath: 'inset(0% 100% 0% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 2, ease: 'power2.inOut', scrollTrigger: { trigger: '.signature', start: 'top 88%', once: true } });

  /* processo */
  mm.add({ mobile: '(max-width: 820px)', desktop: '(min-width: 821px)' }, c => {
    const prop = c.conditions.mobile ? 'scaleY' : 'scaleX';
    gsap.fromTo('.steps-line i', { [prop]: 0 }, { [prop]: 1, ease: 'none', scrollTrigger: { trigger: '.steps', start: 'top 80%', end: c.conditions.mobile ? 'bottom 60%' : 'top 30%', scrub: true } });
  });
  gsap.from('.steps article', { opacity: 0, y: 60, duration: 1.3, stagger: .15, ease, scrollTrigger: { trigger: '.steps', start: 'top 82%', once: true } });

  /* contato: brilho segue o cursor */
  const contact = $('.contact');
  if (finePointer.matches) {
    const gx = gsap.quickTo('.contact-glow', 'x', { duration: 1.4, ease: 'power3' }), gy = gsap.quickTo('.contact-glow', 'y', { duration: 1.4, ease: 'power3' });
    contact.addEventListener('pointermove', e => { const r = contact.getBoundingClientRect(); gx(e.clientX - r.left); gy(e.clientY - r.top); });
  }

  /* rodapé */
  gsap.to('.footer-mark span', { y: 0, duration: 1.6, ease, scrollTrigger: { trigger: '.footer-mark', start: 'top 95%', once: true } });

  addEventListener('load', () => ScrollTrigger.refresh());
  document.fonts && document.fonts.ready.then(() => ScrollTrigger.refresh());
}
