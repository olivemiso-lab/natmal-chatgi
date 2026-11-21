// 낱말 다지기 (수업 뒤 퀴즈). 글의 개념어로 문제를 자동으로 만든다: 빈칸 문장 · 뜻→낱말 · 마지막에 짝 맞추기.
// 점수·시간 제한 없음. 틀리면 바로 뜻 카드를 보여 주고 "다시 볼 낱말"로 모은다. 결과는 <글id>-drill 로 저장.
(function () {
  var $ = function (s) { return document.querySelector(s); };
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function mname(m) { return (window.MASCOT_INFO[m] || {}).name || ''; }

  // ---------- 문제 만들기 ----------
  function build(unit, text) {
    var words = Object.keys(text.words);
    var pool = [];
    unit.texts.forEach(function (t) { Object.keys(t.words).forEach(function (w) { if (pool.indexOf(w) < 0) pool.push(w); }); });
    var sents = window.parseText(text.body).map(function (s) { return s.text; });
    var items = shuffle(words).slice(0, 6).map(function (w, i) {
      var others = shuffle(pool.filter(function (x) { return x !== w; })).slice(0, 3);
      var choices = shuffle([w].concat(others));
      var sent = sents.filter(function (s) { return s.indexOf(w) >= 0; })[0];
      var useBlank = (i % 2 === 0 && sent) || !text.words[w].def;
      if (useBlank) {
        var src = sent || text.words[w].ex;
        return { type: 'blank', word: w, prompt: src.replace(w, '(        )'), choices: choices, answer: choices.indexOf(w) };
      }
      return { type: 'def', word: w, prompt: text.words[w].def, choices: choices, answer: choices.indexOf(w) };
    });
    var pairs = shuffle(words).slice(0, 4).map(function (w) { return { word: w, def: text.words[w].def }; });
    return { items: items, pairs: pairs };
  }

  // ---------- 진행 ----------
  var D = null;
  function show(id) { document.querySelectorAll('.screen').forEach(function (e) { e.classList.add('hidden'); }); $('#' + id).classList.remove('hidden'); window.scrollTo(0, 0); }
  function setMascot(el, name, cls) { el.innerHTML = ''; el.appendChild(window.mascotEl(name, cls)); }
  function cheer(sel) { var m = $(sel + ' .mascot'); if (m) { m.classList.remove('cheer'); void m.offsetWidth; m.classList.add('cheer'); } }
  function wiggle(sel) { var m = $(sel + ' .mascot'); if (m) { m.classList.remove('wiggle'); void m.offsetWidth; m.classList.add('wiggle'); } }

  window.Drill = {
    start: function (ctx) { // ctx: { unit, text, code, num, preview }
      var q = build(ctx.unit, ctx.text);
      D = { ctx: ctx, items: q.items, pairs: q.pairs, i: 0, results: {}, misses: 0, firstTry: true };
      $('#d-title').textContent = ctx.text.title;
      renderItem();
      show('s-drill');
    }
  };

  var GOOD = ['딩동댕!', '바로 그거야!', '오, 정확해!', '잘 다졌어!'];
  var OOPS = ['괜찮아, 뜻을 다시 보자.', '아깝다! 한 번 더 볼까?', '이 낱말은 이따 또 만나자.'];

  function renderItem() {
    var it = D.items[D.i], t = D.ctx.text;
    setMascot($('#m-drill'), t.mascot, 'sm');
    $('#d-step').textContent = (D.i + 1) + ' / ' + (D.items.length + 1);
    $('#d-bubble').textContent = it.type === 'blank' ? '빈칸에 들어갈 낱말을 골라 봐.' : '이 뜻을 가진 낱말은 뭘까?';
    $('#d-prompt').className = 'question ' + (it.type === 'blank' ? 'blank' : 'defq');
    $('#d-prompt').textContent = it.prompt;
    $('#d-card').classList.add('hidden');
    $('#d-next').classList.add('hidden');
    var box = $('#d-choices'); box.innerHTML = '';
    D.firstTry = true;
    it.choices.forEach(function (c, idx) {
      var b = document.createElement('button'); b.innerHTML = '<span class="n">' + (idx + 1) + '</span><span>' + c + '</span>';
      b.onclick = function () { pick(idx, b); };
      box.appendChild(b);
    });
  }
  function pick(idx, btn) {
    var it = D.items[D.i], t = D.ctx.text, box = $('#d-choices');
    if (box.classList.contains('locked')) return;
    if (idx === it.answer) {
      box.classList.add('locked'); btn.classList.add('right');
      if (!(it.word in D.results)) D.results[it.word] = D.firstTry;
      $('#d-bubble').textContent = GOOD[Math.floor(Math.random() * GOOD.length)];
      cheer('#m-drill');
      $('#d-next').classList.remove('hidden');
      $('#d-next').textContent = D.i === D.items.length - 1 ? '짝 맞추기로' : '다음 문제';
    } else {
      btn.classList.add('wrong'); btn.disabled = true;
      D.firstTry = false; D.results[it.word] = false;
      $('#d-bubble').textContent = OOPS[Math.floor(Math.random() * OOPS.length)];
      wiggle('#m-drill');
      var w = t.words[it.word];
      $('#d-card').innerHTML = '<div class="w">' + it.word + '</div><div class="def">' + w.def + '</div><div class="ex">예) ' + w.ex + '</div>';
      $('#d-card').classList.remove('hidden');
    }
  }
  $('#d-next').onclick = function () {
    $('#d-choices').classList.remove('locked');
    if (D.i < D.items.length - 1) { D.i++; renderItem(); } else renderMatch();
  };

  // ---------- 짝 맞추기 ----------
  var M = null;
  function renderMatch() {
    var t = D.ctx.text;
    setMascot($('#m-match'), t.mascot, 'sm');
    $('#match-bubble').textContent = '카드를 두 장씩 뒤집어 낱말과 뜻을 짝지어 봐.';
    var cards = [];
    D.pairs.forEach(function (p, i) { cards.push({ k: i, kind: 'w', txt: p.word }); cards.push({ k: i, kind: 'd', txt: p.def }); });
    cards = shuffle(cards);
    M = { open: [], left: D.pairs.length, busy: false };
    var grid = $('#match-grid'); grid.innerHTML = '';
    cards.forEach(function (c) {
      var el = document.createElement('button'); el.className = 'mcard ' + c.kind;
      el.innerHTML = '<span class="face front">?</span><span class="face back">' + c.txt + '</span>';
      el.onclick = function () { flip(el, c); };
      grid.appendChild(el);
    });
    show('s-match');
  }
  function flip(el, c) {
    if (M.busy || el.classList.contains('up') || el.classList.contains('done')) return;
    el.classList.add('up'); M.open.push({ el: el, c: c });
    if (M.open.length < 2) return;
    var a = M.open[0], b = M.open[1]; M.open = [];
    if (a.c.k === b.c.k && a.c.kind !== b.c.kind) {
      a.el.classList.add('done'); b.el.classList.add('done'); M.left--;
      $('#match-bubble').textContent = GOOD[Math.floor(Math.random() * GOOD.length)]; cheer('#m-match');
      if (M.left === 0) setTimeout(finish, 600);
    } else {
      M.busy = true; M.misses++; D.misses++;
      setTimeout(function () { a.el.classList.remove('up'); b.el.classList.remove('up'); M.busy = false; }, 800);
    }
  }

  // ---------- 마무리 ----------
  function finish() {
    var ctx = D.ctx, t = ctx.text;
    var words = Object.keys(D.results);
    var good = words.filter(function (w) { return D.results[w]; }), again = words.filter(function (w) { return !D.results[w]; });
    if (!ctx.preview) window.Store.saveRecord(ctx.code, t.id + '-drill', ctx.num, { num: ctx.num, textId: t.id, unitId: ctx.unit.id, results: D.results, misses: D.misses, at: Date.now() });
    setMascot($('#m-ddone'), t.mascot, 'lg cheer');
    $('#ddone-bubble').textContent = mname(t.mascot) + ': ' + (again.length ? '오늘 ' + words.length + '개를 다졌어. 다시 볼 낱말도 챙겨 두자!' : '와, 다 바로 맞혔어! 낱말이 네 것이 됐네.');
    $('#ddone-good').innerHTML = good.map(function (w) { return '<span class="chip">' + w + ' ✓</span>'; }).join('');
    $('#ddone-again').innerHTML = again.length ? '<div class="muted center">다시 볼 낱말</div>' + again.map(function (w) { return '<span class="chip ask">' + w + '</span>'; }).join('') : '';
    if (window.confetti) window.confetti();
    show('s-ddone');
  }
  $('#ddone-btn').onclick = function () { if (D.ctx.preview) location.href = 'teacher.html?unit=' + D.ctx.unit.id; else location.reload(); };
  $('#back-drill').onclick = function () { if (D && D.ctx.preview) location.href = 'teacher.html?unit=' + D.ctx.unit.id; else location.reload(); };
})();
