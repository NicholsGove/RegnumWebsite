/* ============================================================
   Regnum Personia — site interactions
   No dependencies. Every widget is optional: each initialiser
   bails out quietly if its markup isn't on the page.
   ============================================================ */
(function () {
  'use strict';

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));

  /* ---------- Theme ---------- */
  function initTheme() {
    const KEY = 'rp-theme';
    let saved = null;
    try { saved = localStorage.getItem(KEY); } catch (e) {}
    const sysDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    document.documentElement.setAttribute('data-theme', saved || (sysDark ? 'dark' : 'light'));
    $$('.theme-toggle').forEach(btn => btn.addEventListener('click', () => {
      const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      try { localStorage.setItem(KEY, next); } catch (e) {}
    }));
  }

  /* ---------- Nav ---------- */
  function initNav() {
    const nav = $('.nav'), links = $('.nav-links'), burger = $('.burger'), bar = $('.scrollbar');
    if (burger && links) {
      burger.addEventListener('click', () => {
        const open = links.classList.toggle('open');
        burger.setAttribute('aria-expanded', String(open));
      });
      $$('a', links).forEach(a => a.addEventListener('click', () => {
        links.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }));
    }
    const onScroll = () => {
      const y = window.scrollY || document.documentElement.scrollTop;
      if (nav) nav.classList.toggle('is-stuck', y > 8);
      if (bar) {
        const h = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
      }
      const top = $('.totop');
      if (top) top.classList.toggle('show', y > 620);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    const top = $('.totop');
    if (top) top.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
  }

  /* ---------- Scroll reveal ---------- */
  function initReveal() {
    const els = $$('[data-reveal]');
    if (!els.length) return;
    if (!('IntersectionObserver' in window)) { els.forEach(e => e.classList.add('in')); return; }
    const io = new IntersectionObserver((entries) => {
      entries.forEach(en => {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });
    els.forEach(e => io.observe(e));

    // Safety net: anything still hidden after a few seconds (odd scroll
    // containers, print preview, full-page capture) is shown anyway.
    setTimeout(() => els.forEach(e => e.classList.add('in')), 4000);
    window.addEventListener('beforeprint', () => els.forEach(e => e.classList.add('in')));
  }

  /* ---------- Count-up numbers ---------- */
  function initCounters() {
    const els = $$('[data-count]');
    if (!els.length || !('IntersectionObserver' in window)) {
      els.forEach(e => { e.textContent = e.dataset.count; });
      return;
    }
    const run = (el) => {
      const target = parseFloat(el.dataset.count);
      const dec = (el.dataset.count.split('.')[1] || '').length;
      const dur = 1500;
      const t0 = performance.now();
      const tick = (t) => {
        const p = Math.min((t - t0) / dur, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = (target * eased).toFixed(dec);
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    };
    const io = new IntersectionObserver((es) => es.forEach(en => {
      if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
    }), { threshold: 0.5 });
    els.forEach(e => io.observe(e));
  }

  /* ---------- Image slots ---------- */
  /* Each slot shows its dashed brief until the real file exists.
     Drop the named file into assets/img/ and it appears automatically. */
  function initSlots() {
    $$('.imgslot').forEach(slot => {
      const img = $('img', slot);
      if (!img) return;
      const show = () => { if (img.naturalWidth > 1) slot.classList.add('is-loaded'); };
      if (img.complete) show();
      img.addEventListener('load', show);
      img.addEventListener('error', () => slot.classList.remove('is-loaded'));
    });
  }

  /* ---------- Tabs ---------- */
  function initTabs() {
    $$('[data-tabs]').forEach(group => {
      const tabs = $$('.tab', group);
      // Panes may live in a different section from the tab strip, so look
      // in the scope named by data-panes if given, otherwise the whole page.
      const scope = group.dataset.panes ? $(group.dataset.panes) : document;
      const panes = $$('.tabpane', scope || document);
      tabs.forEach(tab => tab.addEventListener('click', () => {
        tabs.forEach(t => { t.classList.remove('active'); t.setAttribute('aria-selected', 'false'); });
        tab.classList.add('active');
        tab.setAttribute('aria-selected', 'true');
        panes.forEach(p => p.classList.toggle('active', p.dataset.pane === tab.dataset.tab));
      }));
    });
  }

  /* ---------- Accordion ---------- */
  function initAcc() {
    $$('.acc-q').forEach(q => q.addEventListener('click', () => {
      const item = q.closest('.acc-item');
      const body = $('.acc-a', item);
      const open = item.classList.contains('open');
      const group = item.closest('.acc');
      if (group && !group.hasAttribute('data-multi')) {
        $$('.acc-item.open', group).forEach(o => {
          o.classList.remove('open');
          $('.acc-a', o).style.maxHeight = null;
          $('.acc-q', o).setAttribute('aria-expanded', 'false');
        });
      }
      if (!open) {
        item.classList.add('open');
        body.style.maxHeight = body.scrollHeight + 'px';
        q.setAttribute('aria-expanded', 'true');
      }
    }));
    window.addEventListener('resize', () => {
      $$('.acc-item.open .acc-a').forEach(b => { b.style.maxHeight = b.scrollHeight + 'px'; });
    });
  }

  /* ---------- Stepper ---------- */
  function initStepper() {
    $$('.stepper').forEach(st => {
      const steps = $$('.step', st), panels = $$('.step-panel', st);
      const go = (i) => {
        steps.forEach((s, n) => {
          s.classList.toggle('active', n === i);
          s.classList.toggle('done', n < i);
          s.setAttribute('aria-selected', String(n === i));
        });
        panels.forEach((p, n) => p.classList.toggle('active', n === i));
      };
      steps.forEach((s, i) => {
        s.addEventListener('click', () => go(i));
        s.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(i); }
        });
      });
      $$('[data-step-next]', st).forEach(b => b.addEventListener('click', () => {
        const cur = steps.findIndex(s => s.classList.contains('active'));
        go(Math.min(cur + 1, steps.length - 1));
        st.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }));
      go(0);
    });
  }

  /* ---------- Ask-the-data demo ---------- */
  /* Illustrative sample data — shows the shape of an answer, not live figures. */
  const ANSWERS = {
    q1: {
      t: '14 items',
      s: 'expire within the next 30 days across your two storerooms. Nine are still fast-moving, so the suggestion is to redistribute rather than write off.',
      m: ['scope: all facilities', 'window: 30 days', 'source: batch + expiry table']
    },
    q2: {
      t: 'R 48 200',
      s: 'is sitting in stock that has not moved in 90 days. Amoxicillin 500mg and three consumable lines account for most of it.',
      m: ['metric: idle stock value', 'window: 90 days', 'source: movement ledger']
    },
    q3: {
      t: 'Tuesday & Friday',
      s: 'are the peak dispensing days. Order cut-offs land badly against them — moving the weekly order to Monday morning smooths the shortfall.',
      m: ['metric: dispense volume', 'window: 12 weeks', 'source: activity log']
    },
    q4: {
      t: '6 lines at risk',
      s: 'will fall below reorder level before the next delivery window, based on the current consumption trend rather than a fixed minimum.',
      m: ['model: adaptive forecast', 'horizon: 14 days', 'confidence: medium-high']
    },
    q5: {
      t: 'Clinic B, +18%',
      s: 'spends more per patient visit on consumables than the other sites. Most of the gap is in dressings and gloves.',
      m: ['comparison: per-facility', 'window: this quarter', 'source: finance + activity']
    }
  };

  function initAsk() {
    const box = $('#askAnswer');
    if (!box) return;
    const title = $('.answer-t', box), sub = $('.answer-s', box), meta = $('.answer-m', box);
    let timer = null;

    const render = (key) => {
      const a = ANSWERS[key];
      if (!a) return;
      clearTimeout(timer);
      title.textContent = '';
      title.classList.add('typing');
      sub.style.opacity = '0';
      meta.innerHTML = '';
      let i = 0;
      const type = () => {
        title.textContent = a.t.slice(0, ++i);
        if (i < a.t.length) { timer = setTimeout(type, 45); }
        else {
          title.classList.remove('typing');
          sub.textContent = a.s;
          sub.style.transition = 'opacity .4s';
          sub.style.opacity = '1';
          meta.innerHTML = a.m.map(x => '<span class="tag">' + x + '</span>').join('');
        }
      };
      type();
    };

    $$('.qchip').forEach(chip => chip.addEventListener('click', () => {
      $$('.qchip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      render(chip.dataset.q);
    }));

    const first = $('.qchip');
    if (first) {
      if ('IntersectionObserver' in window) {
        const io = new IntersectionObserver((es) => es.forEach(en => {
          if (en.isIntersecting) { first.click(); io.disconnect(); }
        }), { threshold: 0.4 });
        io.observe(box);
      } else { first.click(); }
    }
  }

  /* ---------- Expiry / stock simulator ---------- */
  function initSim() {
    const wrap = $('#sim');
    if (!wrap) return;
    const demand = $('#simDemand', wrap);
    const lead   = $('#simLead', wrap);
    const bars   = $$('.bar', wrap);
    const out    = { risk: $('#simRisk'), waste: $('#simWaste'), cover: $('#simCover') };

    const draw = () => {
      const d = parseInt(demand.value, 10);   // 40..180 % of baseline
      const l = parseInt(lead.value, 10);     // 1..21 days
      $('#simDemandV').textContent = d + '%';
      $('#simLeadV').textContent = l + ' days';

      // A simple illustrative model: stock burn-down over 8 weeks.
      let stock = 100;
      const burn = d / 100 * 11;
      let risky = 0;
      bars.forEach((bar, i) => {
        stock = Math.max(2, stock - burn + (i === 3 ? 42 : 0)); // one delivery mid-window
        const buffer = burn * (l / 7);
        const pct = Math.max(4, Math.min(100, stock));
        bar.style.height = pct + '%';
        bar.classList.remove('risk', 'crit');
        if (stock < buffer) { bar.classList.add('crit'); risky++; }
        else if (stock < buffer * 1.6) { bar.classList.add('risk'); risky++; }
      });

      const cover = Math.max(1, Math.round(100 / burn));
      const waste = Math.max(0, Math.round((100 - d) * 0.42));
      out.risk.textContent = risky;
      out.cover.textContent = cover + 'd';
      out.waste.textContent = waste + '%';
    };

    [demand, lead].forEach(el => el.addEventListener('input', draw));
    draw();
  }

  /* ---------- Roadmap filter ---------- */
  function initRoadmap() {
    const bar = $('#rmFilter');
    if (!bar) return;
    $$('.tab', bar).forEach(t => t.addEventListener('click', () => {
      $$('.tab', bar).forEach(x => x.classList.remove('active'));
      t.classList.add('active');
      const f = t.dataset.filter;
      $$('.tl-item').forEach(item => {
        item.classList.toggle('hide', f !== 'all' && item.dataset.status !== f);
      });
    }));
  }

  /* ---------- Toast ---------- */
  function toast(msg) {
    let el = $('#toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      el.className = 'toast';
      el.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg><span></span>';
      document.body.appendChild(el);
    }
    $('span', el).textContent = msg;
    el.classList.add('show');
    clearTimeout(el._t);
    el._t = setTimeout(() => el.classList.remove('show'), 4200);
  }

  /* ---------- Modal ---------- */
  function initModal() {
    const modal = $('#waitlist');
    if (!modal) return;
    const open = () => { modal.classList.add('open'); document.body.style.overflow = 'hidden'; const f = $('input', modal); if (f) setTimeout(() => f.focus(), 260); };
    const close = () => { modal.classList.remove('open'); document.body.style.overflow = ''; };
    $$('[data-open-waitlist]').forEach(b => b.addEventListener('click', (e) => { e.preventDefault(); open(); }));
    $$('[data-close-modal]', modal).forEach(b => b.addEventListener('click', close));
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && modal.classList.contains('open')) close(); });
    modal._close = close;
  }

  /* ---------- Forms ---------- */
  /* No backend is wired up yet — these validate and confirm locally.
     Point the form at your endpoint (or a service like Formspree) to go live. */
  function initForms() {
    $$('form[data-validate]').forEach(form => {
      const fields = $$('.field', form);
      const check = (field) => {
        const input = $('input, select, textarea', field);
        if (!input) return true;
        const msg = $('.msg', field);
        let error = '';
        const v = (input.value || '').trim();
        if (input.required && !v) error = 'This one is required.';
        else if (input.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) error = 'That email address looks off.';
        else if (input.dataset.min && v.length < +input.dataset.min) error = 'A little more detail, please (' + input.dataset.min + '+ characters).';
        field.classList.toggle('err', !!error);
        field.classList.toggle('ok', !error && !!v);
        if (msg) msg.textContent = error;
        return !error;
      };
      fields.forEach(f => {
        const input = $('input, select, textarea', f);
        if (!input) return;
        input.addEventListener('blur', () => check(f));
        input.addEventListener('input', () => { if (f.classList.contains('err')) check(f); });
      });
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        const ok = fields.map(check).every(Boolean);
        if (!ok) {
          const bad = $('.field.err', form);
          if (bad) { bad.scrollIntoView({ behavior: 'smooth', block: 'center' }); const i = $('input, select, textarea', bad); if (i) i.focus(); }
          return;
        }
        const btn = $('button[type=submit]', form);
        const label = btn ? btn.textContent : '';
        if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
        setTimeout(() => {
          if (btn) { btn.disabled = false; btn.textContent = label; }
          form.reset();
          fields.forEach(f => f.classList.remove('ok', 'err'));
          toast(form.dataset.done || 'Thanks — we’ll be in touch shortly.');
          const modal = form.closest('.modal');
          if (modal && modal._close) modal._close();
        }, 900);
      });
    });
  }

  /* ---------- Year ---------- */
  function initYear() { $$('[data-year]').forEach(e => { e.textContent = new Date().getFullYear(); }); }

  /* ---------- Boot ---------- */
  function boot() {
    initTheme(); initNav(); initReveal(); initCounters(); initSlots();
    initTabs(); initAcc(); initStepper(); initAsk(); initSim();
    initRoadmap(); initModal(); initForms(); initYear();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
