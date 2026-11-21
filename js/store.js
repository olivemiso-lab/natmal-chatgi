// 저장소. js/config.js 에 window.FIREBASE_CONFIG 가 있으면 Firestore, 없으면 이 브라우저의 localStorage.
// localStorage 접두어 munhae_ (같은 주소를 쓰는 다른 앱과 겹치지 않게)
(function () {
  var P = 'munhae_';
  var local = {
    get: function (k) { try { return JSON.parse(localStorage.getItem(P + k)); } catch (e) { return null; } },
    set: function (k, v) { try { localStorage.setItem(P + k, JSON.stringify(v)); } catch (e) {} },
    del: function (k) { try { localStorage.removeItem(P + k); } catch (e) {} }
  };
  function norm(code) { return String(code || '').trim().toUpperCase(); }

  var LocalStore = {
    mode: 'local',
    getClass: function (code) { return Promise.resolve(local.get('class_' + norm(code))); },
    setClass: function (code, data) { var k = 'class_' + norm(code), cur = local.get(k) || {}; Object.keys(data).forEach(function (f) { cur[f] = data[f]; }); local.set(k, cur); return Promise.resolve(); },
    saveRecord: function (code, textId, num, rec) {
      var k = 'rec_' + norm(code) + '_' + textId; var all = local.get(k) || {}; all[num] = rec; local.set(k, all); return Promise.resolve();
    },
    watchRecords: function (code, textId, cb) {
      var k = 'rec_' + norm(code) + '_' + textId;
      var last = '';
      var tick = function () { var v = local.get(k) || {}; var s = JSON.stringify(v); if (s !== last) { last = s; cb(v); } };
      tick(); var t = setInterval(tick, 1500);
      var h = function (e) { if (e.key === P + k) tick(); }; window.addEventListener('storage', h);
      return function () { clearInterval(t); window.removeEventListener('storage', h); };
    },
    watchClass: function (code, cb) {
      var k = 'class_' + norm(code); var last = '';
      var tick = function () { var v = local.get(k); var s = JSON.stringify(v); if (s !== last) { last = s; cb(v); } };
      tick(); var t = setInterval(tick, 1500);
      return function () { clearInterval(t); };
    },
    clearRecords: function (code, textIds) { textIds.forEach(function (id) { local.del('rec_' + norm(code) + '_' + id); }); return Promise.resolve(); }
  };

  // Firestore (compat SDK, 필요할 때만 로드)
  function loadScript(src) { return new Promise(function (res, rej) { var s = document.createElement('script'); s.src = src; s.onload = res; s.onerror = rej; document.head.appendChild(s); }); }
  function makeFirestore(cfg) {
    var db;
    var ready = loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-app-compat.js')
      .then(function () { return loadScript('https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore-compat.js'); })
      .then(function () { firebase.initializeApp(cfg); db = firebase.firestore(); });
    var cls = function (code) { return db.collection('classes').doc(norm(code)); };
    var recs = function (code, textId) { return cls(code).collection('texts').doc(textId).collection('students'); };
    return {
      mode: 'firestore',
      getClass: function (code) { return ready.then(function () { return cls(code).get(); }).then(function (d) { return d.exists ? d.data() : null; }); },
      setClass: function (code, data) { return ready.then(function () { return cls(code).set(data, { merge: true }); }); },
      saveRecord: function (code, textId, num, rec) { return ready.then(function () { return recs(code, textId).doc(String(num)).set(rec); }); },
      watchRecords: function (code, textId, cb) {
        var un = null, dead = false;
        ready.then(function () { if (dead) return; un = recs(code, textId).onSnapshot(function (qs) { var o = {}; qs.forEach(function (d) { o[d.id] = d.data(); }); cb(o); }); });
        return function () { dead = true; if (un) un(); };
      },
      watchClass: function (code, cb) {
        var un = null, dead = false;
        ready.then(function () { if (dead) return; un = cls(code).onSnapshot(function (d) { cb(d.exists ? d.data() : null); }); });
        return function () { dead = true; if (un) un(); };
      },
      clearRecords: function (code, textIds) {
        return ready.then(function () {
          return Promise.all(textIds.map(function (id) {
            return recs(code, id).get().then(function (qs) { var b = db.batch(); qs.forEach(function (d) { b.delete(d.ref); }); return b.commit(); });
          }));
        });
      }
    };
  }
  window.Store = window.FIREBASE_CONFIG ? makeFirestore(window.FIREBASE_CONFIG) : LocalStore;
  window.normCode = norm;
})();
