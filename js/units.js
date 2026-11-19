// 단원 목록과 로더. 단원 콘텐츠는 js/units/<id>.js 에 있고, 각 파일은 window.UNITS 에 push 한다.
// 새 단원을 넣을 때: 1) js/units/<id>.js 작성 2) 아래 UNIT_LIST 에 한 줄 추가 3) u/<id>/index.html 입구 복사
window.UNITS = [];
window.MASCOT_INFO = {
  rabbit: { name: "토리" }, bear: { name: "곰곰" }, cat: { name: "냥이" }, penguin: { name: "펭펭" },
  owl: { name: "부엉" }, duck: { name: "꽥꽥" }, frog: { name: "개굴" }, fox: { name: "여우 선생님" }
};
window.UNIT_LIST = [
  { id: "4-2-3", grade: 4, semester: 2, no: 3, subject: "사회", title: "다양한 환경과 삶의 모습", mascot: "rabbit", status: "검토 전" }
];
(function () {
  var loaded = {};
  function base() { // index.html / teacher.html 이 있는 폴더 기준
    var s = document.querySelector('script[src$="js/units.js"]'); var src = s ? s.getAttribute('src') : 'js/units.js';
    return src.slice(0, src.length - 'js/units.js'.length);
  }
  window.loadUnit = function (id) {
    if (!window.UNIT_LIST.some(function (u) { return u.id === id; })) return Promise.reject(new Error('no unit ' + id));
    if (loaded[id]) return loaded[id];
    loaded[id] = new Promise(function (res, rej) {
      var sc = document.createElement('script'); sc.src = base() + 'js/units/' + id + '.js';
      sc.onload = function () { res(window.getUnit(id)); }; sc.onerror = function () { rej(new Error('load fail ' + id)); };
      document.head.appendChild(sc);
    });
    return loaded[id];
  };
  window.loadAllUnits = function () { return Promise.all(window.UNIT_LIST.map(function (u) { return window.loadUnit(u.id); })); };
  window.getUnit = function (id) { return window.UNITS.filter(function (u) { return u.id === id; })[0] || null; };
  window.unitOfText = function (textId) { return String(textId || '').replace(/-t\d+$/, ''); };
  window.findText = function (textId) {
    for (var i = 0; i < window.UNITS.length; i++) { var t = window.UNITS[i].texts.filter(function (x) { return x.id === textId; })[0]; if (t) return { unit: window.UNITS[i], text: t }; }
    return null;
  };
  window.unitLabel = function (u) { return u.grade + '학년 ' + u.subject + ' ' + u.semester + '학기 ' + u.no + '. ' + u.title; };
})();
