# 단원 콘텐츠(js/units/<id>.js)로 교사 검토지 한글 파일(.hwpx)을 만든다.
# 사용: python -I tools/make_review_hwpx.py 4-2-3
# 서식 틀: Downloads 의 PRD hwpx (header.xml 의 문단·글자 모양 id 20/21/23/24/25/26, charPr 7/8/9/10, borderFill 3/4 를 쓴다)
import re, zipfile, os, html, random, sys, io
import xml.etree.ElementTree as ET

UNIT_ID = sys.argv[1] if len(sys.argv) > 1 else '4-2-3'
APP = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TPL_HWPX = os.path.join(os.path.expanduser('~'), 'Downloads', '교과문해력앱_PRD_v0.1.hwpx')
OUT = os.path.join(APP, '콘텐츠_검토_%s.hwpx' % UNIT_ID)
TODAY = '2026. 11. 19.'

tplzip = zipfile.ZipFile(TPL_HWPX)
sec = tplzip.read('Contents/section0.xml').decode('utf-8')
head = sec[:sec.index('</hp:p>') + 7]
tail = '</hs:sec>'
i = sec.index('<hp:tbl'); j = sec.rindex('<hp:p ', 0, i); k = sec.index('</hp:tbl>', i) + 9
wrap_open = sec[j:i]; wrap_close = sec[k:sec.index('</hp:p>', k) + 7]

def esc(t): return html.escape(t, quote=False)
def pid(): return str(random.randint(10**8, 2 * 10**9))
def P(text, pp, cp):
    return ('<hp:p id="%s" paraPrIDRef="%s" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0">'
            '<hp:run charPrIDRef="%s"><hp:t>%s</hp:t></hp:run></hp:p>') % (pid(), pp, cp, esc(text))
title = lambda t: P(t, 20, 7); sub = lambda t: P(t, 21, 8); h1 = lambda t: P(t, 23, 8); h2 = lambda t: P(t, 25, 9)
body = lambda t: P(t, 24, 9); bullet = lambda t: P('• ' + t, 26, 9); note = lambda t: P(t, 24, 10); blank = lambda: P('', 24, 9)

def table(rows, widths):
    W = 42520; ws = [round(W * w / sum(widths)) for w in widths]
    out = ['<hp:tbl id="%s" zOrder="0" numberingType="TABLE" textWrap="TOP_AND_BOTTOM" textFlow="BOTH_SIDES" lock="0" dropcapstyle="None" pageBreak="CELL" repeatHeader="1" rowCnt="%d" colCnt="%d" cellSpacing="0" borderFillIDRef="3" noAdjust="0">' % (pid(), len(rows), len(widths)),
           '<hp:sz width="%d" widthRelTo="ABSOLUTE" height="%d" heightRelTo="ABSOLUTE" protect="0"/>' % (W, 282 * len(rows)),
           '<hp:pos treatAsChar="1" affectLSpacing="0" flowWithText="1" allowOverlap="0" holdAnchorAndSO="0" vertRelTo="PARA" horzRelTo="COLUMN" vertAlign="TOP" horzAlign="LEFT" vertOffset="0" horzOffset="0"/>',
           '<hp:outMargin left="0" right="0" top="0" bottom="0"/><hp:inMargin left="510" right="510" top="141" bottom="141"/>']
    for r, row in enumerate(rows):
        out.append('<hp:tr>')
        for c, cell in enumerate(row):
            out.append('<hp:tc name="" header="%d" hasMargin="0" protect="0" editable="0" dirty="1" borderFillIDRef="4">' % (1 if r == 0 else 0) +
                       '<hp:subList id="" textDirection="HORIZONTAL" lineWrap="BREAK" vertAlign="CENTER" linkListIDRef="0" linkListNextIDRef="0" textWidth="0" textHeight="0" hasTextRef="0" hasNumRef="0">' +
                       '<hp:p paraPrIDRef="0" styleIDRef="0" pageBreak="0" columnBreak="0" merged="0" id="%s"><hp:run charPrIDRef="0"><hp:t>%s</hp:t></hp:run></hp:p></hp:subList>' % (pid(), esc(cell)) +
                       '<hp:cellAddr colAddr="%d" rowAddr="%d"/><hp:cellSpan colSpan="1" rowSpan="1"/><hp:cellSz width="%d" height="282"/><hp:cellMargin left="510" right="510" top="141" bottom="141"/></hp:tc>' % (c, r, ws[c]))
        out.append('</hp:tr>')
    out.append('</hp:tbl>')
    return wrap_open + ''.join(out) + wrap_close

# ---- 단원 파일 파싱 (정규식, 파일 모양이 4-2-3.js 와 같아야 함) ----
js = open(os.path.join(APP, 'js', 'units', UNIT_ID + '.js'), encoding='utf-8').read()
um = re.search(r'id: "([^"]+)", grade: (\d+), semester: (\d+), no: (\d+), subject: "([^"]+)", title: "([^"]+)",\s*mascot: "(\w+)", pages: "([^"]*)", status: "([^"]*)"', js)
unit = dict(id=um.group(1), grade=um.group(2), semester=um.group(3), no=um.group(4), subject=um.group(5), title=um.group(6), pages=um.group(8), status=um.group(9))
texts = []
pat = re.compile(r'\{\s*id: "([\w-]+)", lesson: "([^"]+)", title: "([^"]+)", mascot: "(\w+)", style: "([^"]+)",\s*intro: "([^"]*)",\s*standard: "([^"]+)",\s*body: "([^"]+)",\s*words: \{(.*?)\n      \},\s*questions: \[(.*?)\]\s*\}', re.S)
for m in pat.finditer(js):
    words = re.findall(r'"([^"]+)": \{ def: "([^"]+)", ex: "([^"]+)" \}', m.group(9))
    qs = re.findall(r'type: "(\w+)", q: "([^"]+)", choices: \[(.*?)\], answer: (\d)', m.group(10))
    texts.append(dict(id=m.group(1), lesson=m.group(2), title=m.group(3), style=m.group(5), intro=m.group(6), standard=m.group(7),
                      body=re.sub(r'[\[\]]', '', m.group(8)), words=words, qs=qs))
assert texts, '글을 찾지 못함'
stds = []
for t in texts:
    if t['standard'] not in stds: stds.append(t['standard'])
label = '%s학년 %s %s학기 %s. %s' % (unit['grade'], unit['subject'], unit['semester'], unit['no'], unit['title'])

doc = [head, title('콘텐츠 검토지'), sub(label + ' · 연습 글 %d편' % len(texts)), blank()]
doc.append(table([['항목', '내용'], ['작성일', TODAY + ' (3판, 이야기체)'], ['근거 자료', '%s %s-%s 교과서 %s, i-Scream 알짜 정리 학습지' % (unit['subject'], unit['grade'], unit['semester'], unit['pages'])],
                  ['성취기준', ' / '.join(s.split(']')[0] + ']' for s in stds)], ['상태', 'AI 초안을 교과서 용어에 맞추고 이야기체로 다시 쓴 것. 교사 최종 검토 전'],
                  ['앱 주소', 'https://olivemiso-lab.github.io/natmal-chatgi/u/%s/' % unit['id']],
                  ['원본 파일', '앱 개발\\교과문해력\\js\\units\\%s.js (고칠 때 앱 파일과 이 문서를 같이 고침)' % unit['id']]], [1, 3]))
doc.append(blank())
doc += [h1('1. 이 판에서 바뀐 것'),
        bullet('글의 틀을 이야기체로 바꿨다. 아이의 이야기 3편, 사물이 말하기 2편, 질문으로 열기 2편.'),
        bullet('교과서에 없는 낱말은 쓰지 않았다(산지, 평야, 해안, 보전, 촌락, 고랭지 등). 개념어는 모두 교과서 본문에 나오는 낱말이다.'),
        bullet('교과서 사례(울산, 시화호, 평택)는 지명을 빼고 "바닷가 마을", "들판"처럼 일반화했다.'),
        bullet('질문은 이야기 속 사실을 묻는 것으로 손봤고, 추론 문항의 오답지는 낱말 뜻을 잘못 알았을 때 고를 답으로 두었다.')]
for s in stds: doc.append(bullet('성취기준 ' + s))
doc.append(blank())
doc.append(h1('2. 검토 체크리스트'))
doc.append(body('글의 기준: 공백 포함 220~300자 · 문장 40자 안팎 · 개념어 3~5개(두 차시 글은 6개까지) · 사실 확인 1문항 + 추론·적용 1문항 · 교과서 문장을 그대로 옮기지 않음'))
rows = [['글 (차시)', '교육과정 정합성', '사실 정확성', '학년 수준', '공정성', '저작권']]
for t in texts: rows.append(['%s (%s)' % (t['title'], t['lesson']), '□', '□', '□', '□', '□'])
doc.append(table(rows, [3, 1, 1, 1, 1, 1])); doc.append(blank())
doc += [h1('3. 선생님이 정해 주실 것'),
        bullet('글 5(갯벌의 편지)만 개념어가 6개(간척, 영향, 개발, 삼림, 산사태, 생태 통로). 두 차시 분량이라 두었는데 많으면 "영향"을 뺀다.'),
        bullet('글 1의 "지형"(교과서 110쪽)을 개념어로 둘지, 일반 낱말로 둘지.'),
        bullet('글 4의 "수산물 직판장"은 개념어에 넣지 않았다. 학생이 많이 누르면 다음 판에 넣는다.'),
        bullet('글 6의 "열 명 가운데 아홉 명"은 교과서 131쪽 수치(2023년 국토교통부). 숫자를 둘지 뺄지.'),
        bullet('글 7의 해결 노력(숲 만들기, 쓰레기 캠페인)은 교과서 142쪽 신문 기사 사례. 수업에서 다른 사례를 쓰면 맞춘다.'),
        bullet('이야기 속 인물(삼촌, 외할머니, 허수아비)이나 말투가 우리 반에 맞지 않으면 바꾼다.'), blank()]
doc.append(h1('4. 연습 글'))
circ = '①②③④'
for n, t in enumerate(texts, 1):
    doc.append(h2('글 %d · %s (%s · %s)' % (n, t['title'], t['lesson'], t['style'])))
    doc.append(note('개념어: ' + ', '.join(w[0] for w in t['words']) + (' · 안내: ' + t['intro'] if t['intro'] else '')))
    doc.append(body(t['body']))
    doc.append(table([['개념어', '쉬운 풀이', '예문']] + [[w[0], w[1], w[2]] for w in t['words']], [1, 2.2, 2.6]))
    for typ, q, ch, ans in t['qs']:
        choices = re.findall(r'"([^"]+)"', ch)
        lab = '사실 확인' if typ == 'fact' else '추론·적용'
        doc.append(bullet('[%s] %s' % (lab, q)))
        doc.append(note('    ' + '   '.join('%s %s%s' % (circ[i], c, ' (정답)' if i == int(ans) else '') for i, c in enumerate(choices))))
    doc.append(note('메모: '))
    doc.append(blank())
doc.append(h1('5. 쓰지 않은 차시'))
doc.append(body('1차시(단원 도입), 8·14차시(생각을 펼쳐요), 15~16차시(생각 그물)는 새 개념어가 없어 연습 글을 두지 않았다.'))
doc.append(tail)
newsec = ''.join(doc)
ET.fromstring(newsec)

with zipfile.ZipFile(OUT, 'w') as z:
    z.writestr(zipfile.ZipInfo('mimetype'), tplzip.read('mimetype'), compress_type=zipfile.ZIP_STORED)
    for it in tplzip.infolist():
        if it.filename == 'mimetype': continue
        data = tplzip.read(it.filename)
        if it.filename == 'Contents/section0.xml': data = newsec.encode('utf-8')
        if it.filename == 'Preview/PrvText.txt': data = ('콘텐츠 검토지 - ' + label).encode('utf-16le')
        z.writestr(it.filename, data, compress_type=zipfile.ZIP_DEFLATED)
print('ok', OUT, os.path.getsize(OUT), 'bytes,', len(texts), 'texts')
