/* ================================================================
   calculator.js  —  Preventivo interattivo
   Reads window.CALC_DATA + window.CALC_META set by preventivo.html
   ================================================================ */
(function () {
  'use strict';

  var data = window.CALC_DATA || [];
  var meta = window.CALC_META || {};

  /* ── State ───────────────────────────────────────────────── */
  var state = {};
  data.forEach(function (item) {
    state[item.id] = {
      checked: !!(item.required || item.recommended),
      qty: 1
    };
  });

  /* ── Helpers ─────────────────────────────────────────────── */
  function fmt(n) {
    return n.toLocaleString('it-IT');
  }

  function getBreakdown() {
    return data
      .filter(function (item) { return state[item.id].checked; })
      .map(function (item) {
        var qty = item.perUnit ? state[item.id].qty : 1;
        return {
          name:      item.name,
          price:     item.price * qty,
          qty:       qty,
          perUnit:   !!item.perUnit,
          unitLabel: item.unitLabel || '',
          unitPrice: item.price
        };
      });
  }

  function getTotal() {
    return getBreakdown().reduce(function (acc, i) { return acc + i.price; }, 0);
  }

  function buildText() {
    var d = new Date().toLocaleDateString('it-IT', {
      day: 'numeric', month: 'long', year: 'numeric'
    });
    var lines = ['Preventivo \u2014 ' + (meta.fullName || ''), d, ''];
    getBreakdown().forEach(function (item) {
      var label = item.name;
      if (item.perUnit && item.qty > 1) {
        label += ' \u00d7' + item.qty + ' ' + item.unitLabel;
      }
      lines.push('  \u2022 ' + label + ': \u20ac' + fmt(item.price));
    });
    lines.push('');
    lines.push('TOTALE: \u20ac' + fmt(getTotal()));
    lines.push('(IVA non inclusa \u00b7 preventivo indicativo)');
    return lines.join('\n');
  }

  /* ── Render ──────────────────────────────────────────────── */
  function render() {
    renderItems();
    renderTotal();
  }

  function renderItems() {
    var container = document.getElementById('calc-items');
    if (!container) return;

    var groups = [
      { key: 'base',    label: 'Pacchetto Base' },
      { key: 'addon',   label: 'Componenti Aggiuntive' },
      { key: 'premium', label: 'Funzionalit\u00e0 Avanzate' }
    ];

    var html = '';

    groups.forEach(function (g) {
      var items = data.filter(function (item) {
        return (item.category || 'addon') === g.key;
      });
      if (!items.length) return;

      html += '<div class="calc-group calc-group--' + g.key + '">';
      html += '<div class="calc-group-label">' + g.label + '</div>';

      items.forEach(function (item) {
        var s       = state[item.id];
        var active  = s.checked ? ' calc-item--active' : '';
        var premium = (g.key === 'premium') ? ' calc-item--premium' : '';
        var reqAttr = item.required ? ' data-required="true"' : '';

        /* badges */
        var badges = '';
        if (item.required)    badges += '<span class="calc-badge calc-badge--included">Incluso</span>';
        if (item.recommended) badges += '<span class="calc-badge calc-badge--recommended">Consigliato</span>';
        if (g.key === 'premium') badges += '<span class="calc-badge calc-badge--premium">Avanzato</span>';

        /* check control */
        var checkHtml;
        if (item.required) {
          checkHtml = '<div class="calc-check-fixed">'
            + '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor"'
            + ' stroke-width="3" stroke-linecap="round" stroke-linejoin="round">'
            + '<polyline points="20 6 9 17 4 12"/></svg></div>';
        } else {
          checkHtml = '<label class="calc-checkbox-wrap">'
            + '<input type="checkbox" data-id="' + item.id + '"'
            + (s.checked ? ' checked' : '') + '>'
            + '<span class="calc-checkmark"></span></label>';
        }

        /* price */
        var priceHtml = item.perUnit
          ? '<span class="calc-unit-price">\u20ac' + item.price
            + '<span class="calc-per-unit">/' + (item.unitLabel || '') + '</span></span>'
          : '<span class="calc-price-val">\u20ac' + item.price + '</span>';

        /* stepper — only shown when the item is checked */
        var stepperHtml = '';
        if (item.perUnit && s.checked) {
          stepperHtml = '<div class="calc-stepper">'
            + '<button class="calc-stepper-btn" data-id="' + item.id
            + '" data-action="dec" aria-label="Diminuisci">\u2212</button>'
            + '<span class="calc-stepper-val">' + s.qty + '</span>'
            + '<button class="calc-stepper-btn" data-id="' + item.id
            + '" data-action="inc" aria-label="Aumenta">+</button>'
            + '</div>';
        }

        html += '<div class="calc-item' + active + premium + '"'
          + reqAttr + ' data-id="' + item.id + '">'
          + '<div class="calc-item-l">'
          + checkHtml
          + '<div class="calc-item-info">'
          + '<div class="calc-item-name">' + item.name + badges + '</div>'
          + '<div class="calc-item-desc">' + item.desc + '</div>'
          + '</div>'
          + '</div>'
          + '<div class="calc-item-r">'
          + stepperHtml
          + priceHtml
          + '</div>'
          + '</div>';
      });

      html += '</div>'; /* end group */
    });

    container.innerHTML = html;
    bindEvents();
  }

  function renderTotal() {
    var totalEl = document.getElementById('calc-total');
    var bdEl    = document.getElementById('calc-breakdown');
    if (totalEl) totalEl.textContent = '\u20ac ' + fmt(getTotal());
    if (bdEl) {
      var rows = getBreakdown().map(function (item) {
        var label = item.name;
        if (item.perUnit && item.qty > 1) {
          label += ' \u00d7' + item.qty + ' ' + item.unitLabel;
        }
        return '<div class="calc-bd-row">'
          + '<span>' + label + '</span>'
          + '<span>\u20ac' + fmt(item.price) + '</span>'
          + '</div>';
      });
      bdEl.innerHTML = rows.join('');
    }
  }

  /* ── Events ──────────────────────────────────────────────── */
  function bindEvents() {
    /* checkboxes */
    document.querySelectorAll('.calc-checkbox-wrap input').forEach(function (cb) {
      cb.addEventListener('change', function () {
        state[this.dataset.id].checked = this.checked;
        render();
      });
    });

    /* steppers */
    document.querySelectorAll('.calc-stepper-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var id  = this.dataset.id;
        var act = this.dataset.action;
        if (act === 'inc') state[id].qty = Math.min(10, state[id].qty + 1);
        if (act === 'dec') state[id].qty = Math.max(1,  state[id].qty - 1);
        render();
      });
    });

    /* clicking anywhere on a non-required row toggles it */
    document.querySelectorAll('.calc-item:not([data-required])').forEach(function (row) {
      row.addEventListener('click', function (e) {
        if (e.target.closest('.calc-stepper'))       return;
        if (e.target.closest('.calc-checkbox-wrap')) return;
        var cb = this.querySelector('input[type="checkbox"]');
        if (cb) {
          cb.checked = !cb.checked;
          cb.dispatchEvent(new Event('change'));
        }
      });
    });
  }

  /* ── PDF ─────────────────────────────────────────────────── */
  var btnPdf  = document.getElementById('btn-pdf');
  var btnWa   = document.getElementById('btn-whatsapp');
  var btnMail = document.getElementById('btn-mail');

  if (btnPdf) {
    btnPdf.addEventListener('click', function () {
      var jsPDF = window.jspdf && window.jspdf.jsPDF;
      if (!jsPDF) { alert('Libreria PDF non disponibile.'); return; }

      var doc  = new jsPDF({ unit: 'mm', format: 'a4' });
      var W    = 210;
      var gold = [201, 168, 76];
      var ink  = [10,  10,  15];
      var mute = [107, 107, 122];

      /* ── dark header bar ── */
      doc.setFillColor(ink[0], ink[1], ink[2]);
      doc.rect(0, 0, W, 32, 'F');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(15);
      doc.setTextColor(255, 255, 255);
      doc.text((meta.fullName || '') + ' \u2014 Preventivo', 14, 19);

      var d = new Date().toLocaleDateString('it-IT', {
        day: 'numeric', month: 'long', year: 'numeric'
      });
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(gold[0], gold[1], gold[2]);
      doc.text(d, W - 14, 19, { align: 'right' });

      /* ── gold rule ── */
      doc.setDrawColor(gold[0], gold[1], gold[2]);
      doc.setLineWidth(0.6);
      doc.line(14, 40, W - 14, 40);

      /* ── column headers ── */
      var y = 50;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(mute[0], mute[1], mute[2]);
      doc.text('SERVIZIO', 14, y);
      doc.text('IMPORTO', W - 14, y, { align: 'right' });
      y += 8;

      /* ── item rows ── */
      getBreakdown().forEach(function (item) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(11);
        doc.setTextColor(ink[0], ink[1], ink[2]);
        var label = item.name;
        if (item.perUnit && item.qty > 1) {
          label += '  \u00d7' + item.qty + ' ' + item.unitLabel;
        }
        doc.text(label, 14, y);
        doc.setFont('helvetica', 'bold');
        doc.text('\u20ac' + fmt(item.price), W - 14, y, { align: 'right' });
        doc.setDrawColor(218, 218, 218);
        doc.setLineWidth(0.2);
        doc.line(14, y + 3.5, W - 14, y + 3.5);
        y += 12;
      });

      /* ── total box ── */
      y += 4;
      doc.setFillColor(247, 247, 245);
      doc.rect(12, y - 5, W - 24, 18, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(ink[0], ink[1], ink[2]);
      doc.text('TOTALE', 18, y + 5.5);
      doc.setFontSize(14);
      doc.setTextColor(gold[0], gold[1], gold[2]);
      doc.text('\u20ac' + fmt(getTotal()), W - 18, y + 5.5, { align: 'right' });

      /* ── note ── */
      y += 26;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(mute[0], mute[1], mute[2]);
      doc.text(
        'IVA non inclusa \u00b7 Preventivo indicativo \u00b7 Valido 30 giorni',
        14, y
      );

      /* ── footer bar ── */
      doc.setFillColor(ink[0], ink[1], ink[2]);
      doc.rect(0, 277, W, 20, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(180, 180, 180);
      doc.text(meta.email || '', 14, 288);

      var fname = 'preventivo-'
        + (meta.fullName || 'web').toLowerCase().replace(/\s+/g, '-')
        + '.pdf';
      doc.save(fname);
    });
  }

  /* ── WhatsApp ────────────────────────────────────────────── */
  if (btnWa) {
    btnWa.addEventListener('click', function () {
      var url = 'https://wa.me/' + (meta.whatsapp || '')
        + '?text=' + encodeURIComponent(buildText());
      window.open(url, '_blank');
    });
  }

  /* ── Email ───────────────────────────────────────────────── */
  if (btnMail) {
    btnMail.addEventListener('click', function () {
      var sub  = encodeURIComponent('Preventivo sito web');
      var body = encodeURIComponent(buildText());
      window.location.href =
        'mailto:' + (meta.email || '') + '?subject=' + sub + '&body=' + body;
    });
  }

  /* ── Init ────────────────────────────────────────────────── */
  render();

}());
