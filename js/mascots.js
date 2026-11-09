// 동물 캐릭터 (SVG, 파스텔). MASCOT.rabbit 처럼 꺼내 innerHTML로 넣는다.
(function () {
  var face = function (x, y) {
    return '<circle cx="' + (x - 14) + '" cy="' + y + '" r="4" fill="#2b2b36"/>' +
      '<circle cx="' + (x + 14) + '" cy="' + y + '" r="4" fill="#2b2b36"/>' +
      '<circle cx="' + (x - 13) + '" cy="' + (y - 1) + '" r="1.4" fill="#fff"/>' +
      '<circle cx="' + (x + 15) + '" cy="' + (y - 1) + '" r="1.4" fill="#fff"/>' +
      '<ellipse cx="' + (x - 24) + '" cy="' + (y + 10) + '" rx="6" ry="3.5" fill="#ffb6c6" opacity=".8"/>' +
      '<ellipse cx="' + (x + 24) + '" cy="' + (y + 10) + '" rx="6" ry="3.5" fill="#ffb6c6" opacity=".8"/>';
  };
  var wrap = function (inner) {
    return '<svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' + inner + '</svg>';
  };
  window.MASCOT = {
    rabbit: wrap(
      '<ellipse cx="44" cy="30" rx="10" ry="26" fill="#fff5f8" stroke="#e9c7d3" stroke-width="2"/>' +
      '<ellipse cx="76" cy="30" rx="10" ry="26" fill="#fff5f8" stroke="#e9c7d3" stroke-width="2"/>' +
      '<ellipse cx="44" cy="32" rx="5" ry="18" fill="#ffd3df"/>' +
      '<ellipse cx="76" cy="32" rx="5" ry="18" fill="#ffd3df"/>' +
      '<circle cx="60" cy="74" r="36" fill="#fff5f8" stroke="#e9c7d3" stroke-width="2"/>' +
      face(60, 70) +
      '<ellipse cx="60" cy="82" rx="4" ry="3" fill="#f08aa5"/>' +
      '<path d="M54 88 q6 6 12 0" stroke="#2b2b36" stroke-width="2" fill="none" stroke-linecap="round"/>'
    ),
    bear: wrap(
      '<circle cx="30" cy="38" r="14" fill="#e8cdb0" stroke="#cfae8a" stroke-width="2"/>' +
      '<circle cx="90" cy="38" r="14" fill="#e8cdb0" stroke="#cfae8a" stroke-width="2"/>' +
      '<circle cx="30" cy="38" r="7" fill="#f7e3d0"/><circle cx="90" cy="38" r="7" fill="#f7e3d0"/>' +
      '<circle cx="60" cy="70" r="38" fill="#e8cdb0" stroke="#cfae8a" stroke-width="2"/>' +
      '<ellipse cx="60" cy="84" rx="16" ry="12" fill="#f7e3d0"/>' +
      face(60, 64) +
      '<ellipse cx="60" cy="80" rx="5" ry="4" fill="#5a4030"/>' +
      '<path d="M54 90 q6 5 12 0" stroke="#5a4030" stroke-width="2" fill="none" stroke-linecap="round"/>'
    ),
    owl: wrap(
      '<path d="M30 40 l8 -18 l10 14 M90 40 l-8 -18 l-10 14" fill="#cdbdf3" stroke="#a894e0" stroke-width="2" stroke-linejoin="round"/>' +
      '<ellipse cx="60" cy="68" rx="38" ry="42" fill="#d9ccf7" stroke="#a894e0" stroke-width="2"/>' +
      '<ellipse cx="60" cy="84" rx="20" ry="22" fill="#efe9ff"/>' +
      '<circle cx="46" cy="58" r="14" fill="#fff"/><circle cx="74" cy="58" r="14" fill="#fff"/>' +
      '<circle cx="46" cy="58" r="6" fill="#2b2b36"/><circle cx="74" cy="58" r="6" fill="#2b2b36"/>' +
      '<circle cx="48" cy="56" r="2" fill="#fff"/><circle cx="76" cy="56" r="2" fill="#fff"/>' +
      '<path d="M56 70 l4 7 l4 -7 z" fill="#f4b860"/>' +
      '<ellipse cx="30" cy="72" rx="6" ry="3.5" fill="#ffb6c6" opacity=".8"/><ellipse cx="90" cy="72" rx="6" ry="3.5" fill="#ffb6c6" opacity=".8"/>'
    ),
    cat: wrap(
      '<path d="M28 50 l4 -30 l24 18 z" fill="#fff1d6" stroke="#e5c99a" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M92 50 l-4 -30 l-24 18 z" fill="#fff1d6" stroke="#e5c99a" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M34 46 l2 -18 l14 11 z" fill="#ffd3df"/><path d="M86 46 l-2 -18 l-14 11 z" fill="#ffd3df"/>' +
      '<circle cx="60" cy="72" r="36" fill="#fff1d6" stroke="#e5c99a" stroke-width="2"/>' +
      face(60, 68) +
      '<path d="M57 80 l3 3 l3 -3 z" fill="#f08aa5"/>' +
      '<path d="M54 86 q3 4 6 0 q3 4 6 0" stroke="#2b2b36" stroke-width="2" fill="none" stroke-linecap="round"/>' +
      '<path d="M20 78 h18 M20 86 h18 M82 78 h18 M82 86 h18" stroke="#c9a874" stroke-width="2" stroke-linecap="round"/>'
    ),
    penguin: wrap(
      '<ellipse cx="60" cy="68" rx="36" ry="44" fill="#6f7fa8" stroke="#5a6a92" stroke-width="2"/>' +
      '<ellipse cx="60" cy="78" rx="24" ry="30" fill="#f6f8ff"/>' +
      '<ellipse cx="22" cy="74" rx="8" ry="18" fill="#6f7fa8" transform="rotate(15 22 74)"/>' +
      '<ellipse cx="98" cy="74" rx="8" ry="18" fill="#6f7fa8" transform="rotate(-15 98 74)"/>' +
      '<circle cx="48" cy="52" r="4" fill="#2b2b36"/><circle cx="72" cy="52" r="4" fill="#2b2b36"/>' +
      '<circle cx="49" cy="51" r="1.4" fill="#fff"/><circle cx="73" cy="51" r="1.4" fill="#fff"/>' +
      '<path d="M54 60 l6 7 l6 -7 z" fill="#f4b860"/>' +
      '<ellipse cx="38" cy="62" rx="6" ry="3.5" fill="#ffb6c6" opacity=".8"/><ellipse cx="82" cy="62" rx="6" ry="3.5" fill="#ffb6c6" opacity=".8"/>' +
      '<ellipse cx="48" cy="110" rx="10" ry="4" fill="#f4b860"/><ellipse cx="72" cy="110" rx="10" ry="4" fill="#f4b860"/>'
    ),
    duck: wrap(
      '<ellipse cx="62" cy="84" rx="40" ry="30" fill="#fff4b8" stroke="#e6cf7a" stroke-width="2"/>' +
      '<circle cx="46" cy="48" r="26" fill="#fff4b8" stroke="#e6cf7a" stroke-width="2"/>' +
      '<path d="M18 52 q-14 4 -8 12 q10 2 14 -4 z" fill="#f4b860"/>' +
      '<circle cx="50" cy="44" r="4" fill="#2b2b36"/><circle cx="51" cy="43" r="1.4" fill="#fff"/>' +
      '<ellipse cx="60" cy="56" rx="6" ry="3.5" fill="#ffb6c6" opacity=".8"/>' +
      '<path d="M86 78 q18 -10 10 6 q-6 10 -14 4 z" fill="#ffe99a"/>' +
      '<path d="M40 22 q6 -10 12 0" stroke="#e6cf7a" stroke-width="3" fill="none" stroke-linecap="round"/>'
    ),
    frog: wrap(
      '<circle cx="36" cy="40" r="14" fill="#cdeec9" stroke="#8fcf8a" stroke-width="2"/>' +
      '<circle cx="84" cy="40" r="14" fill="#cdeec9" stroke="#8fcf8a" stroke-width="2"/>' +
      '<circle cx="36" cy="40" r="6" fill="#2b2b36"/><circle cx="84" cy="40" r="6" fill="#2b2b36"/>' +
      '<circle cx="38" cy="38" r="2" fill="#fff"/><circle cx="86" cy="38" r="2" fill="#fff"/>' +
      '<ellipse cx="60" cy="76" rx="42" ry="32" fill="#cdeec9" stroke="#8fcf8a" stroke-width="2"/>' +
      '<ellipse cx="60" cy="88" rx="26" ry="14" fill="#eafbe8"/>' +
      '<path d="M44 78 q16 12 32 0" stroke="#2b2b36" stroke-width="2.5" fill="none" stroke-linecap="round"/>' +
      '<ellipse cx="30" cy="70" rx="6" ry="3.5" fill="#ffb6c6" opacity=".8"/><ellipse cx="90" cy="70" rx="6" ry="3.5" fill="#ffb6c6" opacity=".8"/>' +
      '<circle cx="54" cy="66" r="2" fill="#2b2b36"/><circle cx="66" cy="66" r="2" fill="#2b2b36"/>'
    ),
    fox: wrap(
      '<path d="M26 56 l2 -34 l28 22 z" fill="#ffcf9e" stroke="#e8ad6c" stroke-width="2" stroke-linejoin="round"/>' +
      '<path d="M94 56 l-2 -34 l-28 22 z" fill="#ffcf9e" stroke="#e8ad6c" stroke-width="2" stroke-linejoin="round"/>' +
      '<circle cx="60" cy="72" r="36" fill="#ffcf9e" stroke="#e8ad6c" stroke-width="2"/>' +
      '<path d="M30 80 q30 36 60 0 q-10 -12 -30 -12 q-20 0 -30 12z" fill="#fff8f0"/>' +
      face(60, 66) +
      '<ellipse cx="60" cy="84" rx="5" ry="4" fill="#5a4030"/>' +
      '<path d="M54 92 q6 5 12 0" stroke="#5a4030" stroke-width="2" fill="none" stroke-linecap="round"/>'
    )
  };
  window.mascotEl = function (name, cls) {
    var d = document.createElement('div');
    d.className = 'mascot ' + (cls || '');
    d.innerHTML = window.MASCOT[name] || window.MASCOT.rabbit;
    return d;
  };
})();
