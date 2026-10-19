/* ============================================================
   Regnum Personia: site interactions
   No dependencies. Every widget is optional: each initialiser
   bails out quietly if its markup isn't on the page.
   ============================================================ */
document.documentElement.classList.add('js');
(function () {
  'use strict';

  const $  = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const reduced = () => window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

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

  /* ---------- Nav (mobile "Menu" toggle) ---------- */
  function initNav() {
    const btn = $('.menu-btn'), nav = $('.service-nav');
    if (!btn || !nav) return;
    btn.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      btn.setAttribute('aria-expanded', String(open));
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && nav.classList.contains('open')) {
        nav.classList.remove('open'); btn.setAttribute('aria-expanded', 'false'); btn.focus();
      }
    });
  }

  /* ---------- Evidence stamps ---------- */
  /* A stamp presses onto its record when the record comes into view.
     The hero stamp lands shortly after the page settles. */
  function initStamps() {
    const stamps = $$('[data-stamp]');
    if (!stamps.length) return;
    const press = (el) => el.classList.add('is-in');
    if (reduced() || !('IntersectionObserver' in window)) { stamps.forEach(press); return; }
    const io = new IntersectionObserver((entries) => entries.forEach(en => {
      if (!en.isIntersecting) return;
      io.unobserve(en.target);
      // Stamps visible on arrival wait for the page transition to finish; later ones press at once.
      const early = performance.now() < 1600;
      const delay = early ? Math.max(700, parseInt(en.target.dataset.stampDelay || '0', 10)) : 120;
      setTimeout(() => press(en.target), delay);
    }), { threshold: 0.6 });
    stamps.forEach(s => io.observe(s));
    window.addEventListener('beforeprint', () => stamps.forEach(press));
  }

  /* ---------- Count-up numbers ---------- */
  function initCounters() {
    const els = $$('[data-count]');
    if (!els.length || reduced() || !('IntersectionObserver' in window)) {
      els.forEach(e => { e.textContent = e.dataset.count; });
      return;
    }
    const run = (el) => {
      const target = parseFloat(el.dataset.count);
      const dec = (el.dataset.count.split('.')[1] || '').length;
      const dur = 900;
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
      t: 'P 48 200',
      s: 'is sitting in stock that has not moved in 90 days. Amoxicillin 500mg and three consumable lines account for most of it.',
      m: ['metric: idle stock value', 'window: 90 days', 'source: movement ledger']
    },
    q3: {
      t: 'Tuesday & Friday',
      s: 'are the peak dispensing days. Order cut-offs land badly against them, so moving the weekly order to Monday morning smooths the shortfall.',
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

  /* ---------- Modal (demo request) ---------- */
  function initModal() {
    const modal = $('#waitlist');
    if (!modal) return;
    let lastFocus = null;
    const focusables = () => $$('a[href], button:not([disabled]), input, select, textarea', modal).filter(el => el.offsetParent !== null);
    const open = () => {
      lastFocus = document.activeElement;
      modal.hidden = false;
      requestAnimationFrame(() => modal.classList.add('open'));
      document.body.style.overflow = 'hidden';
      const f = $('input', modal); if (f) setTimeout(() => f.focus(), 60);
    };
    const close = () => {
      modal.classList.remove('open');
      document.body.style.overflow = '';
      setTimeout(() => { modal.hidden = true; }, reduced() ? 0 : 240);
      if (lastFocus && lastFocus.focus) lastFocus.focus();
    };
    $$('[data-open-waitlist]').forEach(b => b.addEventListener('click', (e) => { e.preventDefault(); open(); }));
    $$('[data-close-modal]', modal).forEach(b => b.addEventListener('click', close));
    modal.addEventListener('click', (e) => { if (e.target === modal) close(); });
    document.addEventListener('keydown', (e) => {
      if (modal.hidden) return;
      if (e.key === 'Escape') { close(); return; }
      if (e.key === 'Tab') {
        const f = focusables(); if (!f.length) return;
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    });
    modal._close = close;
  }

  /* ---------- Forms ---------- */
  /* Where website form submissions go.
     Both forms (the Contact page form and the "Request a demo" pop-up) post to the
     `submit` function in the Regnum Personia Supabase project. It checks the form,
     stores it in the `submissions` table and, once email is set up, emails it on.
     Read and manage everything at /inbox.html.

     If the backend cannot be reached at all (no internet, outage), the visitor's own
     email app opens with the message pre-filled to CONTACT_EMAIL, so nothing is lost. */
  const FORMS_ENDPOINT = 'https://omflbomtvrvctsvlhgzw.supabase.co/functions/v1/submit';
  const CONTACT_EMAIL = 'kevin.lengwadibe@regnumpesonia.com';

  const FIELD_LABELS = {
    name: 'Name', email: 'Email', org: 'Facility', topic: 'Topic',
    sites: 'Sites', message: 'Message'
  };

  function formSubject(form, data) {
    if (data.get('topic')) return 'Website enquiry: ' + data.get('topic');
    if (form.closest('.modal')) return 'Demo request from the Regnum Personia website';
    return 'Message from the Regnum Personia website';
  }

  function formBody(data) {
    const lines = [];
    data.forEach((value, key) => {
      if (!FIELD_LABELS[key] || !String(value).trim()) return;
      lines.push(FIELD_LABELS[key] + ': ' + value);
    });
    return lines.join('\n');
  }

  /* Last resort: hand the message to the visitor's mail client. */
  function mailtoFallback(form, data) {
    window.location.href = 'mailto:' + CONTACT_EMAIL +
      '?subject=' + encodeURIComponent(formSubject(form, data)) +
      '&body=' + encodeURIComponent(formBody(data));
  }

  /* A rejection the visitor can fix (bad field, rate limit) */
  class FormProblem extends Error {
    constructor(message, fieldErrors) { super(message); this.fieldErrors = fieldErrors || null; }
  }

  async function sendForm(form) {
    const data = new FormData(form);
    const payload = {
      kind: form.closest('.modal') ? 'demo' : 'contact',
      name: data.get('name') || '',
      email: data.get('email') || '',
      org: data.get('org') || '',
      topic: data.get('topic') || '',
      sites: data.get('sites') || '',
      message: data.get('message') || '',
      company_website: data.get('company_website') || '',
      elapsed_ms: Date.now() - (form._startedAt || Date.now()),
      page: location.pathname
    };
    let res;
    try {
      res = await fetch(FORMS_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (networkError) {
      console.error('Backend unreachable, falling back to email:', networkError);
      mailtoFallback(form, data);
      return 'mailto';
    }
    let json = {};
    try { json = await res.json(); } catch (_) { /* non-JSON body */ }
    if (res.ok && json.ok) return 'sent';
    if (res.status === 422 || res.status === 429) throw new FormProblem(json.error || 'Please check the highlighted fields.', json.errors);
    if (res.status >= 500 || res.status === 404) { mailtoFallback(form, data); return 'mailto'; }
    throw new Error(json.error || ('Form backend responded ' + res.status));
  }

  function initForms() {
    $$('form[data-validate]').forEach(form => {
      const fields = $$('.field', form);
      // Bots fill this hidden field; people never see it.
      if (!$('[name="company_website"]', form)) {
        const hp = document.createElement('div');
        hp.className = 'hp';
        hp.setAttribute('aria-hidden', 'true');
        hp.innerHTML = '<label>Company website <input name="company_website" type="text" tabindex="-1" autocomplete="off"></label>';
        form.appendChild(hp);
      }
      const start = () => { if (!form._startedAt) form._startedAt = Date.now(); };
      form.addEventListener('focusin', start);
      form.addEventListener('pointerdown', start);

      const setError = (field, error) => {
        const msg = $('.msg', field);
        field.classList.toggle('err', !!error);
        if (msg) msg.textContent = error || '';
      };
      const check = (field) => {
        const input = $('input, select, textarea', field);
        if (!input) return true;
        let error = '';
        const v = (input.value || '').trim();
        if (input.required && !v) error = 'This one is required.';
        else if (input.type === 'email' && v && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v)) error = 'That email address looks off.';
        else if (input.dataset.min && v.length < +input.dataset.min) error = 'A little more detail, please (' + input.dataset.min + '+ characters).';
        setError(field, error);
        field.classList.toggle('ok', !error && !!v);
        return !error;
      };
      fields.forEach(f => {
        const input = $('input, select, textarea', f);
        if (!input) return;
        input.addEventListener('blur', () => check(f));
        input.addEventListener('input', () => { if (f.classList.contains('err')) check(f); });
      });
      form.addEventListener('submit', async (e) => {
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
        try {
          const outcome = await sendForm(form);
          form.reset();
          form._startedAt = 0;
          fields.forEach(f => f.classList.remove('ok', 'err'));
          if (outcome === 'mailto') {
            toast('Our form is unavailable, so your email app is opening instead. Press send there and it reaches us.');
          } else {
            toast(form.dataset.done || 'Thank you. We will be in touch shortly.');
          }
          const modal = form.closest('.modal');
          if (modal && modal._close) modal._close();
        } catch (err) {
          if (err instanceof FormProblem) {
            if (err.fieldErrors) {
              Object.entries(err.fieldErrors).forEach(([name, text]) => {
                const input = $('[name="' + name + '"]', form);
                const field = input && input.closest('.field');
                if (field) setError(field, text);
              });
              const bad = $('.field.err', form);
              if (bad) { const i = $('input, select, textarea', bad); if (i) i.focus(); }
            }
            toast(err.message);
          } else {
            console.error('Form submission failed:', err);
            toast('That did not send. Please email ' + CONTACT_EMAIL + ' directly.');
          }
        } finally {
          if (btn) { btn.disabled = false; btn.textContent = label; }
        }
      });
    });
  }

  /* ---------- Year ---------- */
  function initYear() { $$('[data-year]').forEach(e => { e.textContent = new Date().getFullYear(); }); }

  /* ---------- Boot ---------- */
  function boot() {
    initTheme(); initNav(); initStamps(); initCounters(); initSlots();
    initTabs(); initAcc(); initStepper(); initAsk(); initSim();
    initRoadmap(); initModal(); initForms(); initYear();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
