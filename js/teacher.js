(function () {
  var $ = function (s) { return document.querySelector(s); };
  var qs = new URLSearchParams(location.search);
  var T = { code: localStorage.getItem('munhae_teacher_code') || '', cls: null, unit: null, sel: null, recs: {}, unwatch: null, unwatchCls: null, top: [] };
  $('#m-teacher').appendChild(window.mascotEl('fox', 'sm'));
  $('#mode').textContent = window.Store.mode === 'firestore' ? '온라인 저장' : '이 기기 안에서만 저장(시험용)';

  function randCode() { var a = 'ABCDEFGHJKMNPQRSTUVWXYZ', s = ''; for (var i = 0; i < 4; i++) s += a[Math.floor(Math.random() * a.length)]; return s; }
  function curTexts() { return T.unit ? T.unit.texts : []; }
  function allTextIds() { var ids = []; window.UNITS.forEach(function (u) { u.texts.forEach(function (t) { ids.push(t.id); }); }); return ids; }
  function textById(id) { var f = window.findText(id); return f ? f.text : null; }

  // ---------- 단원 선택 ----------
  function initUnits() {
    var sel = $('#unit');
    sel.innerHTML = window.UNIT_LIST.map(function (u) { return '<option value="' + u.id + '">' + window.unitLabel(u) + (u.status === '검토 전' ? ' (검토 전)' : '') + '</option>'; }).join('');
    var want = qs.get('unit') || localStorage.getItem('munhae_teacher_unit') || window.UNIT_LIST[0].id;
    if (!window.getUnit(want)) want = window.UNIT_LIST[0].id;
    sel.value = want; setUnit(want);
    sel.onchange = function () { setUnit(this.value); };
  }
  function setUnit(id) {
    T.unit = window.getUnit(id); localStorage.setItem('munhae_teacher_unit', id);
    $('#unit-title').textContent = window.unitLabel(T.unit) + ' · ' + (T.unit.pages || '');
    $('#unit-link').textContent = location.origin + location.pathname.replace(/teacher\.html$/, '') + 'u/' + id + '/';
    $('#m-unit').innerHTML = ''; $('#m-unit').appendChild(window.mascotEl(T.unit.mascot, 'sm'));
    T.sel = null;
    if (T.cls) pickResult();
    renderTexts();
  }
  function pickResult() {
    var open = T.cls && T.cls.openTextId;
    if (open && window.unitOfText(open) === T.unit.id) select(open);
    else if (curTexts().length) select(curTexts()[0].id);
  }

  // ---------- 반 ----------
  function renderClass() {
    if (!T.code) { $('#class-setup').classList.remove('hidden'); $('#class-main').classList.add('hidden'); $('#panels').classList.add('hidden'); return; }
    $('#class-setup').classList.add('hidden'); $('#class-main').classList.remove('hidden'); $('#panels').classList.remove('hidden');
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
      var first = !T.cls; T.cls = c; renderClass();
      if (first || !T.sel) pickResult(); else renderTexts();
    });
  }

  // ---------- 연습 글 ----------
  function renderTexts() {
    var box = $('#tlist'); box.innerHTML = '';
    var openId = T.cls && T.cls.openTextId;
    if (openId && window.unitOfText(openId) !== T.unit.id) {
      var f = window.findText(openId);
      $('#open-elsewhere').textContent = '지금 열려 있는 연습: ' + (f ? window.unitLabel(f.unit) + ' · ' + f.text.title : openId) + ' (다른 단원)';
      $('#open-elsewhere').classList.remove('hidden');
    } else $('#open-elsewhere').classList.add('hidden');
    curTexts().forEach(function (t) {
      var open = openId === t.id;
      var d = document.createElement('div'); d.className = 'titem' + (open ? ' open' : '') + (T.sel === t.id ? ' sel' : '');
      d.innerHTML = '<div class="ttl"><b>' + t.title + '</b><span>' + t.lesson + ' · ' + (t.style || '') + ' · 개념어 ' + Object.keys(t.words).join(', ') + '</span></div>' +
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
    var t = textById(id); if (!t) return;
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
    if (!list.length) { $('#bars').innerHTML = '<div class="empty">아직 완료한 학생이 없어요. 연습을 열면 여기에 바로 나타나요.</div>'; $('#types').innerHTML = ''; $('#asklist').innerHTML = ''; T.top = Object.keys(t.words).slice(0, 3); return; }
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
    window.Store.clearRecords(T.code, allTextIds()).then(function () { T.recs = {}; var t = textById(T.sel); if (t) renderResult(t); });
  };

  // ---------- 낱말 카드 ----------
  var oi = 0;
  $('#cards').onclick = function () { if (!T.top.length) return; oi = 0; renderOverlay(); $('#overlay').classList.remove('hidden'); };
  $('#o-close').onclick = function () { $('#overlay').classList.add('hidden'); };
  $('#o-prev').onclick = function () { oi = (oi + T.top.length - 1) % T.top.length; renderOverlay(); };
  $('#o-next').onclick = function () { oi = (oi + 1) % T.top.length; renderOverlay(); };
  function renderOverlay() {
    var t = textById(T.sel); var k = T.top[oi], w = t.words[k];
    $('#o-card').innerHTML = '<div class="w">' + k + '</div><div class="def">' + w.def + '</div><div class="ex">예) ' + w.ex + '</div>';
    $('#o-pos').textContent = (oi + 1) + ' / ' + T.top.length;
  }
  document.addEventListener('keydown', function (e) { if ($('#overlay').classList.contains('hidden')) return; if (e.key === 'ArrowRight') $('#o-next').click(); if (e.key === 'ArrowLeft') $('#o-prev').click(); if (e.key === 'Escape') $('#o-close').click(); });

  // ---------- 시작: 모든 단원 로드 ----------
  window.loadAllUnits().then(function () {
    initUnits();
    if (T.code) bind(); else renderClass();
  });
})();
