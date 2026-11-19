// 연습 글 → 문장 → 터치 단위(토큰). [ ] 묶음은 한 토큰, 나머지는 띄어쓰기 단위.
// [개념어]이라고 처럼 바로 뒤에 붙은 조사는 tail 로 붙여 같은 토큰으로 보여 준다.
(function () {
  function stripBrackets(s) { return s.replace(/\[([^\]]+)\]/g, '$1'); }
  function parse(body) {
    var sentences = body.split(/(?<=[.!?][”’"']?)\s+/);
    return sentences.map(function (sent) {
      var parts = sent.split(/(\[[^\]]+\])/).filter(Boolean);
      var tokens = [], afterConcept = false;
      parts.forEach(function (p) {
        var m = /^\[([^\]]+)\]$/.exec(p);
        if (m) { tokens.push({ text: m[1], key: m[1], concept: true }); afterConcept = true; return; }
        var words = p.split(' ');
        if (afterConcept && words[0]) { tokens[tokens.length - 1].tail = words[0]; words.shift(); }
        afterConcept = false;
        words.forEach(function (w) { if (w) tokens.push({ text: w, key: w.replace(/[.,!?]/g, ''), concept: false }); });
      });
      return { text: stripBrackets(sent), tokens: tokens };
    });
  }
  window.parseText = parse;
  window.plainText = stripBrackets;
})();
