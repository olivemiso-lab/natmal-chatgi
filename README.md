# 낱말 찾기 (가칭 · 초등 교과 문해력 앱)

수업 전 5분, 곧 배울 단원의 개념어가 담긴 짧은 글을 읽으며 모르는 낱말을 누르고, 생각 질문 2개에 답한다. 교사는 반 전체가 막힌 낱말과 학생 유형을 본다. PRD: `Downloads\교과문해력앱_PRD_v0.1.hwpx`

## 파일
- `index.html` 학생 화면 (입장 → 읽기 → 뜻 확인 → 생각 질문 → 마무리)
- `teacher.html` 교사 화면 (반 만들기, 연습 열기/닫기, 결과, 낱말 카드 띄우기, 기록 삭제)
- `js/units.js` 단원 목록(UNIT_LIST)과 로더. `js/units/<단원id>.js` 에 단원별 연습 글·개념어·질문 (지금은 4-2-3 "다양한 환경과 삶의 모습" 7편)
- `u/<단원id>/index.html` 단원별 학생 입구 주소(틸더스 등록용). `index.html?unit=4-2-3` 으로 넘어간다
- `js/textparse.js` 글을 문장·터치 단위로 나눔. 글 안의 `[ ]` 는 한 번에 누르는 묶음
- `js/store.js` 저장소. `js/config.js` 에 Firebase 설정이 있으면 Firestore, 없으면 이 브라우저의 localStorage(시험용, 접두어 `munhae_`)
- `js/mascots.js` 동물 캐릭터 SVG (토끼·곰·고양이·펭귄·부엉이·오리·개구리·여우)
- `sw.js`, `manifest.json` PWA (홈 화면 추가, 오프라인 껍데기)

## 시험 방법
미리보기 이름 `교과문해력` (포트 8794). Firebase 없이 쓰면 교사 화면과 학생 화면을 **같은 브라우저**에서 열어야 결과가 보인다.
1. `teacher.html` → 반 만들기 → 연습 글 "열기"
2. `index.html` → 반 코드 + 번호 → 끝까지 진행
3. `teacher.html` 결과 칸에 바로 반영됨 (1.5초마다 갱신)
- 학생 화면 미리 보기(저장 안 함): `index.html?text=4-2-3-t1`

## 실제 교실에서 쓰려면 (여러 기기)
1. Firebase 콘솔에서 프로젝트 생성 (리전 **asia-northeast3 서울**), Firestore 만들기
2. 웹 앱 추가 → 설정값을 `js/config.js` 에 넣기
3. Firestore 규칙(시험용 최소): `classes/{code}` 아래 읽기·쓰기 허용, 그 밖은 거부
4. Firebase Hosting 에 올리기 (`firebase deploy`) 또는 다른 정적 호스팅

## 단원 추가
1. `js/units/<id>.js` 를 4-2-3.js 와 같은 모양으로 만든다 (글 id는 `<단원id>-t1` 처럼 단원 접두어)
2. `js/units.js` 의 UNIT_LIST 에 한 줄 추가
3. `u/<id>/index.html` 을 복사해 단원 id만 바꾼다
4. `sw.js` FILES 에 단원 파일을 추가하고 CACHE 버전을 올린다
반 코드와 교사 화면은 모든 단원이 공유한다.

## 검토지 만들기
`python -I tools/make_review_hwpx.py 4-2-3` → `콘텐츠_검토_4-2-3.hwpx` (서식 틀은 Downloads 의 PRD hwpx). 교사가 한글로 열어 검토한다.

## 아직 안 한 것
- 성취기준 코드 확정, 교사 검토(콘텐츠_검토.md 체크리스트)
- 같은 번호 중복 접속 표시, 연습 글 인쇄 버튼
- 내 낱말 도감, 수업 뒤 낱말 퀴즈, 반 합계 표시(2단계)
