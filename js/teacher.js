(function () {
  var $ = function (s) { return document.querySelector(s); };
  var texts = window.CONTENT.texts;
  var T = { code: localStorage.getItem('munhae_teacher_code') || '', cls: null, sel: null, recs: {}, unwatch: null, unwatchCls: null };
  $('#m-teacher').appendChild(window.mascotEl('fox', 'sm'));
  $('#unit-title').textContent = window.CONTENT.unit.grade + '학년 ' + window.CONTENT.unit.subject + ' ' + window.CONTENT.unit.title;
  $('#mode').textContent = window.Store.mode === 'firestore' ? '온라인 저장' : '이 기기 안에서만 저장(시험용)';

  function randCode() { var a = 'ABCDEFGHJKMNPQRSTUVWXYZ', s = ''; for (var i = 0; i < 4; i++) s += a[Math.floor(Math.random() * a.length)]; return s; }

  // ---------- 반 ----------
  function renderClass() {
    if (!T.code) { $('#class-setup').classList.remove('hidden'); $('#class-main').classList.add('hidden'); return; }
    $('#class-setup').classList.add('hidden'); $('#class-main').classList.remove('hidden');
    $('#code-view').textContent = T.code;
    $('#size').value = (T.cls && T.cls.size) || 30;
    renderTexts();
  }
  $('#make').onclick = function () {
    var code = window.normCode($('#code-in').value) || randCode();
    T.code = code; localStorage.setItem('munhae_teacher_code', code);
    window.Store.setClass(code, { code: code, size: 30, openTextId: null, createdAt: Date.now() }).then(bind);
  };
  $('#leave').onclick = function () { T.code = ''; localStorage.removeItem('munhae_teacher_code'); if (T.unwatchCls) T.unwatchCls(); if (T.unwatch) T.unwatch(); T.cls = null; renderClass(); };
  $('#size').onchange = function () { window.Store.setClass(T.code, { size: Math.max(1, Math.min(40, +this.value || 30)) }); };

  function bind() {
    if (T.unwatchCls) T.unwatchCls();
    T.unwatchCls = window.Store.watchClass(T.code, function (c) {
      if (!c) { window.Store.setClass(T.code, { code: T.code, size: 30, openTextId: null, createdAt: Date.now() }); return; }
      T.cls = c; renderClass();
      if (!T.sel) select(c.openTextId || texts[0].id);
      else renderTexts();
    });
  }

  // ---------- 연습 글 ----------
  function renderTexts() {
    var box = $('#tlist'); box.innerHTML = '';
    texts.forEach(function (t) {
      var open = T.cls && T.cls.openTextId === t.id;
      var d = document.createElement('div'); d.className = 'titem' + (open ? ' open' : '') + (T.sel === t.id ? ' sel' : '');
      d.innerHTML = '<div class="ttl"><b>' + t.title + '</b><span>' + t.lesson + ' · 개념어 ' + Object.keys(t.words).join(', ') + '</span></div>' +
        (open ? '<span class="tag mint">학생 입장 가능</span>' : '') +
        '<a class="btn small ghost" href="index.html?text=' + t.id + '">미리 보기</a>' +
        '<button class="btn small ' + (open ? 'danger' : 'mint') + '" data-act="toggle">' + (open ? '닫기' : '열기') + '</button>' +
        '<button class="btn small ghost" data-act="see">결과</button>';
      d.querySelector('[data-act=toggle]').onclick = function () { window.Store.setClass(T.code, { openTextId: open ? null : t.id }); select(t.id); };
      d.querySelector('[data-act=see]').onclick = function () { select(t.id); };
      box.appendChild(d);
    });
  }
  function select(id) {
    T.sel = id; renderTexts();
    var t = texts.filter(function (x) { return x.id === id; })[0];
    $('#r-title').textContent = t.title;
    if (T.unwatch) T.unwatch();
    T.unwatch = window.Store.watchRecords(T.code, id, function (r) { T.recs = r || {}; renderResult(t); });
  }

  // ---------- 결과 ----------
  function renderResult(t) {
    var list = Object.keys(T.recs).map(function (k) { return T.recs[k]; }).sort(function (a, b) { return a.num - b.num; });
    $('#r-count').textContent = list.length + '명 완료';
    var total = list.reduce(function (s, r) { return s + r.tapped.length; }, 0);
    $('#r-total').textContent = '우리 반이 찾아낸 낱말 ' + total + '개';
    if (!list.length) { $('#bars').innerHTML = '<div class="empty">아직 완료한 학생이 없어요. 연습을 열면 여기에 바로 나타나요.</div>'; $('#types').innerHTML = ''; $('#asklist').innerHTML = ''; return; }

    var cnt = {};
    list.forEach(function (r) { r.tapped.forEach(function (k) { cnt[k] = (cnt[k] || 0) + 1; }); });
    var ranked = Object.keys(cnt).sort(function (a, b) { return cnt[b] - cnt[a]; });
    var max = cnt[ranked[0]] || 1;
    $('#bars').innerHTML = ranked.slice(0, 10).map(function (k) {
      var ask = !t.words[k];
      return '<div class="bar"><span class="lbl' + (ask ? ' ask' : '') + '">' + k + '</span><span class="trk"><i class="' + (ask ? 'ask' : '') + '" style="width:' + Math.round(cnt[k] / max * 100) + '%"></i></span><span class="cnt">' + cnt[k] + '명</span></div>';
    }).join('') || '<div class="empty">누른 낱말이 없어요.</div>';
    var asks = ranked.filter(function (k) { return !t.words[k]; });
    $('#asklist').innerHTML = asks.length ? '풀이가 없는 낱말: ' + asks.map(function (k) { return '<span class="chip ask">' + k + ' ' + cnt[k] + '</span>'; }).join(' ') : '';
    T.top = ranked.filter(function (k) { return t.words[k]; }).slice(0, 3);
    if (T.top.length < 3) Object.keys(t.words).forEach(function (k) { if (T.top.length < 3 && T.top.indexOf(k) < 0) T.top.push(k); });

    var groups = { a: [], b: [], c: [], d: [] };
    list.forEach(function (r) {
      var tapped = r.tapped.length > 0, ok = r.correct[0];
      groups[tapped && ok ? 'a' : tapped && !ok ? 'b' : !tapped && ok ? 'c' : 'd'].push(r);
    });
    var meta = [
      ['a', '낱말 누름 + 정답', '모르는 것을 찾고 해결함 · 칭찬, 심화 질문'],
      ['b', '낱말 누름 + 오답', '낱말은 확인했으나 글 이해 부족 · 글 구조·맥락 지도'],
      ['c', '누름 없음 + 정답', '이미 알고 있음'],
      ['d', '누름 없음 + 오답', '모르는 것을 모름 · 개별 확인, 함께 읽기']
    ];
    $('#types').innerHTML = meta.map(function (m) {
      return '<div class="type' + (m[0] === 'd' ? ' warn' : '') + '"><h3>' + m[1] + ' <span class="muted">' + groups[m[0]].length + '명</span></h3><p>' + m[2] + '</p><div class="nums">' +
        groups[m[0]].map(function (r) { return '<span class="num" title="추론 문항 ' + (r.correct[1] ? '정답' : '오답') + (r.tts ? ', 읽어주기 ' + r.tts + '회' : '') + '">' + r.num + '<small>' + (r.correct[1] ? '○' : '×') + (r.tts ? '🔊' : '') + '</small></span>'; }).join('') +
        '</div></div>';
    }).join('');
  }

  $('#clear').onclick = function () {
    if (!confirm('이 반의 연습 기록을 모두 지울까요? 되돌릴 수 없어요.')) return;
    window.Store.clearRecords(T.code, texts.map(function (t) { return t.id; })).then(function () { T.recs = {}; var t = texts.filter(function (x) { return x.id === T.sel; })[0]; if (t) renderResult(t); });
  };

  // ---------- 낱말 카드 ----------
  var oi = 0;
  $('#cards').onclick = function () { oi = 0; renderOverlay(); $('#overlay').classList.remove('hidden'); };
  $('#o-close').onclick = function () { $('#overlay').classList.add('hidden'); };
  $('#o-prev').onclick = function () { oi = (oi + T.top.length - 1) % T.top.length; renderOverlay(); };
  $('#o-next').onclick = function () { oi = (oi + 1) % T.top.length; renderOverlay(); };
  function renderOverlay() {
    var t = texts.filter(function (x) { return x.id === T.sel; })[0];
    var k = T.top[oi], w = t.words[k];
    $('#o-card').innerHTML = '<div class="w">' + k + '</div><div class="def">' + w.def + '</div><div class="ex">예) ' + w.ex + '</div>';
    $('#o-pos').textContent = (oi + 1) + ' / ' + T.top.length;
  }
  document.addEventListener('keydown', function (e) { if ($('#overlay').classList.contains('hidden')) return; if (e.key === 'ArrowRight') $('#o-next').click(); if (e.key === 'ArrowLeft') $('#o-prev').click(); if (e.key === 'Escape') $('#o-close').click(); });

  if (T.code) bind(); else renderClass();
})();
