(function () {
  var $ = function (s) { return document.querySelector(s); };
  var S = { code: '', num: 0, text: null, unit: null, tapped: [], tts: 0, answers: [], preview: false, size: 30 };
  var qs = new URLSearchParams(location.search);

  function show(id) {
    document.querySelectorAll('.screen').forEach(function (e) { e.classList.add('hidden'); });
    $('#' + id).classList.remove('hidden');
    window.scrollTo(0, 0);
  }
  function setMascot(el, name, cls) { el.innerHTML = ''; el.appendChild(window.mascotEl(name, cls)); }
  function mname(m) { return (window.MASCOT_INFO[m] || {}).name || ''; }

  // ---------- 입장 ----------
  function initEnter(unitMeta) {
    var m = unitMeta ? unitMeta.mascot : 'rabbit';
    setMascot($('#m-enter'), m, 'bounce');
    if (unitMeta) {
      $('#enter-unit').textContent = window.unitLabel(unitMeta);
      $('#enter-bubble').innerHTML = '안녕! 나는 <b>' + mname(m) + '</b>야. 선생님이 알려 준 반 코드와 내 번호를 눌러 줘.';
    }
    var grid = $('#numgrid'); grid.innerHTML = '';
    for (var i = 1; i <= S.size; i++) {
      var b = document.createElement('button'); b.textContent = i; b.dataset.n = i;
      b.onclick = function () { grid.querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); }); this.classList.add('on'); S.num = +this.dataset.n; check(); };
      grid.appendChild(b);
    }
    $('#code').oninput = check;
    $('#code').value = localStorage.getItem('munhae_last_code') || '';
    function check() { $('#go').disabled = !($('#code').value.trim().length >= 3 && S.num > 0); }
    check();
    $('#go').onclick = function () {
      S.code = window.normCode($('#code').value);
      localStorage.setItem('munhae_last_code', S.code);
      $('#go').disabled = true;
      window.Store.getClass(S.code).then(function (c) {
        if (!c) { $('#go').disabled = false; return say('반 코드를 다시 확인해 주세요.'); }
        var openId = c.openTextId || c.openDrillId;
        if (!openId) { $('#go').disabled = false; return say('선생님이 아직 연습을 열지 않았어요. 조금만 기다려요.'); }
        return window.loadUnit(window.unitOfText(openId)).then(function () {
          var f = window.findText(openId);
          $('#go').disabled = false;
          if (!f) return say('연습 글을 찾을 수 없어요.');
          S.unit = f.unit;
          if (c.openTextId) start(f.unit, f.text);
          else window.Drill.start({ unit: f.unit, text: f.text, code: S.code, num: S.num, preview: false });
        });
      }).catch(function () { $('#go').disabled = false; say('연결이 잘 안 돼요. 다시 눌러 주세요.'); });
    };
  }
  function say(msg) { var b = $('#enter-msg'); b.textContent = msg; b.classList.remove('hidden'); }

  // ---------- 읽기 ----------
  var parsed;
  function start(u, t) {
    S.unit = u; S.text = t; S.tapped = []; S.tts = 0; S.answers = [];
    parsed = window.parseText(t.body);
    var cws = Object.keys(t.words).sort(function (a, b) { return b.length - a.length; });
    parsed.forEach(function (s) { s.tokens.forEach(function (tk) {
      if (tk.concept) return;
      var hit = cws.filter(function (cw) { return tk.text.indexOf(cw) === 0; })[0];
      if (hit) tk.key = hit;
    }); });
    setMascot($('#m-read'), t.mascot, 'sm');
    $('#read-bubble').innerHTML = (t.intro ? t.intro + ' ' : '') + '읽다가 <b>모르는 낱말</b>이 나오면 눌러 줘. 몇 개든 괜찮아.';
    $('#read-title').textContent = t.title;
    var box = $('#reading'); box.innerHTML = '';
    parsed.forEach(function (sent) {
      var p = document.createElement('span'); p.className = 'sent';
      var sp = document.createElement('button'); sp.className = 'speak noprint'; sp.textContent = '🔊'; sp.setAttribute('aria-label', '문장 읽어 주기');
      sp.onclick = function () { speak(sent.text, p, sp); };
      p.appendChild(sp);
      sent.tokens.forEach(function (tk) {
        var w = document.createElement('span'); w.className = 'word'; w.textContent = tk.text + (tk.tail || '');
        w.dataset.key = tk.key;
        w.onclick = function () {
          var i = S.tapped.indexOf(tk.key);
          if (i >= 0) { S.tapped.splice(i, 1); w.classList.remove('on'); } else { S.tapped.push(tk.key); w.classList.add('on'); react(tk.key); }
          updateCount();
        };
        p.appendChild(w); p.appendChild(document.createTextNode(' '));
      });
      box.appendChild(p);
    });
    updateCount();
    show('s-read');
  }
  var LINES = ['좋아! 모르는 건 누르면 돼.', '오, 그 낱말 궁금했구나!', '잘했어. 찾아내는 게 진짜 공부야.', '하나 더 찾았네!', '모르는 걸 아는 게 멋진 거야.', '누르기만 해도 반은 배운 거야.'];
  var reactT = null;
  function react(key) {
    var b = $('#read-bubble'), m = $('#m-read .mascot');
    b.textContent = LINES[Math.floor(Math.random() * LINES.length)];
    b.classList.remove('pop'); void b.offsetWidth; b.classList.add('pop');
    if (m) { m.classList.remove('wiggle'); void m.offsetWidth; m.classList.add('wiggle'); }
    clearTimeout(reactT);
    reactT = setTimeout(function () { b.innerHTML = '또 모르는 낱말이 있으면 눌러 줘. 누른 낱말은 이따가 같이 볼게.'; }, 2200);
  }
  window.confetti = confetti;
  function confetti() {
    var box = $('#confetti'); if (!box) return; box.innerHTML = '';
    var colors = ['#ffd166', '#ff8fab', '#8fd3ff', '#b5e48c', '#cdb4ff'];
    for (var i = 0; i < 40; i++) {
      var c = document.createElement('i');
      c.style.left = Math.random() * 100 + '%'; c.style.background = colors[i % colors.length];
      c.style.animationDelay = (Math.random() * .8) + 's'; c.style.animationDuration = (2 + Math.random() * 1.5) + 's';
      c.style.transform = 'rotate(' + Math.random() * 360 + 'deg)';
      box.appendChild(c);
    }
    setTimeout(function () { box.innerHTML = ''; }, 4500);
  }
  function updateCount() {
    $('#tapcount').textContent = S.tapped.length ? '누른 낱말 ' + S.tapped.length + '개' : '모르는 낱말이 있으면 눌러 보세요';
  }
  var speaking = null;
  function speak(txt, sentEl, btn) {
    if (!('speechSynthesis' in window)) { btn.textContent = '✕'; return; }
    speechSynthesis.cancel();
    if (speaking && speaking.btn === btn) { speaking = null; btn.classList.remove('playing'); sentEl.classList.remove('reading-now'); return; }
    document.querySelectorAll('.speak.playing').forEach(function (b) { b.classList.remove('playing'); });
    document.querySelectorAll('.sent.reading-now').forEach(function (b) { b.classList.remove('reading-now'); });
    var u = new SpeechSynthesisUtterance(txt); u.lang = 'ko-KR'; u.rate = 0.85;
    var v = speechSynthesis.getVoices().filter(function (x) { return /ko/i.test(x.lang); })[0]; if (v) u.voice = v;
    u.onend = u.onerror = function () { btn.classList.remove('playing'); sentEl.classList.remove('reading-now'); speaking = null; };
    speaking = { btn: btn }; btn.classList.add('playing'); sentEl.classList.add('reading-now'); S.tts++;
    speechSynthesis.speak(u);
  }

  // ---------- 뜻 확인 ----------
  var cards = [], ci = 0;
  function toWords() {
    if (window.speechSynthesis) speechSynthesis.cancel();
    var t = S.text;
    cards = S.tapped.map(function (k) {
      var w = t.words[k];
      var ctx = parsed.filter(function (s) { return s.tokens.some(function (tk) { return tk.key === k; }); })[0];
      return { key: k, def: w ? w.def : null, ex: w ? w.ex : null, ctx: ctx ? ctx.text : '' };
    });
    ci = 0;
    setMascot($('#m-words'), t.mascot, 'sm');
    if (!cards.length) { $('#words-bubble').textContent = '다 아는 낱말이었군요! 그럼 질문으로 가 볼까요?'; $('#card').innerHTML = ''; $('#dots').innerHTML = ''; $('#card-nav').classList.add('hidden'); }
    else { $('#words-bubble').textContent = '누른 낱말을 하나씩 볼게요.'; $('#card-nav').classList.remove('hidden'); renderCard(); }
    show('s-words');
  }
  function renderCard() {
    var c = cards[ci]; var el = $('#card'); el.className = 'card pop' + (c.def ? '' : ' ask');
    var ctx = c.ctx.replace(c.key, '<mark>' + c.key + '</mark>');
    el.innerHTML = '<div class="w">' + c.key + '</div>' +
      (c.def ? '<div class="def">' + c.def + '</div><div class="ex">예) ' + c.ex + '</div><div class="ctx">글에서: ' + ctx + '</div>'
             : '<div class="def">이 낱말은 선생님께 물어볼 낱말로 적어 둘게요.</div><div class="ctx">글에서: ' + ctx + '</div>');
    $('#dots').innerHTML = cards.map(function (_, i) { return '<i class="' + (i === ci ? 'on' : '') + '"></i>'; }).join('');
    $('#prev').disabled = ci === 0;
    $('#next').textContent = ci === cards.length - 1 ? '질문으로' : '다음 낱말';
  }
  $('#prev').onclick = function () { if (ci > 0) { ci--; renderCard(); } };
  $('#next').onclick = function () { if (ci < cards.length - 1) { ci++; renderCard(); } else toQuiz(); };
  $('#words-skip').onclick = toQuiz;

  // ---------- 질문 ----------
  var qi = 0;
  function toQuiz() { qi = 0; S.answers = []; renderQ(); show('s-quiz'); }
  function renderQ() {
    var t = S.text, q = t.questions[qi];
    setMascot($('#m-quiz'), t.mascot, 'sm');
    $('#q-step').textContent = (qi + 1) + ' / ' + t.questions.length;
    $('#question').textContent = q.q;
    var box = $('#choices'); box.innerHTML = '';
    q.choices.forEach(function (c, i) {
      var b = document.createElement('button'); b.innerHTML = '<span class="n">' + (i + 1) + '</span><span>' + c + '</span>';
      b.onclick = function () { box.querySelectorAll('button').forEach(function (x) { x.classList.remove('on'); }); b.classList.add('on'); S.answers[qi] = i; $('#q-next').disabled = false; };
      box.appendChild(b);
    });
    $('#q-next').disabled = true;
    $('#q-next').textContent = qi === t.questions.length - 1 ? '다 했어요' : '다음 질문';
  }
  $('#q-next').onclick = function () { if (qi < S.text.questions.length - 1) { qi++; renderQ(); } else finish(); };

  // ---------- 마무리 ----------
  function finish() {
    var t = S.text;
    var rec = {
      num: S.num, textId: t.id, unitId: S.unit.id, tapped: S.tapped.slice(),
      unknown: S.tapped.filter(function (k) { return !t.words[k]; }),
      answers: S.answers.slice(),
      correct: t.questions.map(function (q, i) { return S.answers[i] === q.answer; }),
      tts: S.tts, at: Date.now()
    };
    if (!S.preview) window.Store.saveRecord(S.code, t.id, S.num, rec);
    setMascot($('#m-done'), t.mascot, 'lg cheer');
    var n = S.tapped.length;
    $('#done-bubble').textContent = n ? mname(t.mascot) + ': 와, 오늘 ' + n + '개나 찾았어!' : mname(t.mascot) + ': 끝까지 읽었구나, 멋져!';
    confetti();
    $('#done-msg').textContent = n ? '모르는 낱말 ' + n + '개를 잘 찾아냈어요!' : '글을 끝까지 읽고 질문까지 했어요!';
    $('#done-sub').textContent = n ? '모르는 걸 찾아내는 게 공부의 시작이에요.' : '다음에 모르는 낱말이 나오면 꼭 눌러 보세요.';
    $('#done-chips').innerHTML = S.tapped.map(function (k) { return '<span class="chip' + (t.words[k] ? '' : ' ask') + '">' + k + '</span>'; }).join('');
    show('s-done');
  }
  var teacherUrl = 'teacher.html' + (S.unit ? '?unit=' + S.unit.id : '');
  $('#done-btn').onclick = function () { if (S.preview) location.href = 'teacher.html?unit=' + S.unit.id; else location.reload(); };
  $('#back-read').onclick = function () { if (S.preview) location.href = 'teacher.html?unit=' + S.unit.id; else location.reload(); };
  $('#back-words').onclick = function () { show('s-read'); };
  $('#back-quiz').onclick = function () { if (qi > 0) { qi--; renderQ(); } else toWords(); };
  $('#to-words').onclick = toWords;

  // ---------- 시작 ----------
  var drillId = qs.get('drill'), textId = qs.get('text') || drillId, unitId = qs.get('unit') || (textId ? window.unitOfText(textId) : null);
  var meta = window.UNIT_LIST.filter(function (u) { return u.id === unitId; })[0] || null;
  if (textId && meta) {
    S.preview = true; S.num = 0;
    window.loadUnit(meta.id).then(function () {
      var f = window.findText(textId);
      if (f && drillId) { S.unit = f.unit; window.Drill.start({ unit: f.unit, text: f.text, code: '', num: 0, preview: true }); }
      else if (f) start(f.unit, f.text); else { initEnter(meta); show('s-enter'); }
    });
  } else { initEnter(meta); show('s-enter'); }
  if ('serviceWorker' in navigator && location.protocol !== 'file:') navigator.serviceWorker.register('sw.js').catch(function () {});
})();
