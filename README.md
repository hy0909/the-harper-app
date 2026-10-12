# THE HARPER 앱 미리보기

모바일앱 화면을 웹으로 옮겨 브라우저에서 미리 보는 저장소. 피그마 시안이 기준이고, 화면이 늘어나면 페이지를 하나씩 추가한다.

- 홈: `index.html`
- 시작 화면(처음 켤 때만): `onboarding.html` (스플래시 → 언어 → 관심 스타일). 스타일 `onboarding.css`, 동작 `onboarding.js`. 끝내거나 건너뛰면 `index.html` 로 돌아간다. `index.html` 은 `localStorage` 의 `harper:onboarded` 가 없으면 이 페이지로 보낸다. 다시 보려면 `index.html?onboarding=1`
- 매거진 상세: `magazine.html?id=<글 id>`. 스타일 `magazine.css`, 동작 `magazine.js`
- 로그인·회원가입: `login.html?from=<돌아갈 페이지>` (SNS 고르기 → 연결 중 → 처음이면 가입 마무리). 스타일 `login.css`, 동작 `login.js`, 상태 저장 `auth.js`. 아래 '로그인' 참고
- 내 정보: `my.html` (설계서 09: 프로필 · 찜한 매장 · 방문 히스토리 · 언어/알림 설정 · 고객센터 · 로그아웃). 스타일 `my.css`, 동작 `my.js`
- 스타일: `styles.css`, 동작: `app.js`
- 언어: `i18n.js`. 시작 화면이나 내 정보의 언어 줄에서 고른 언어(`localStorage` 의 `harper:lang`, ko · en · ja · zh-Hans · zh-Hant)로 모든 화면이 보인다. 아래 '언어' 참고
- 배포: GitHub Pages(main 브랜치 루트)

## 글·사진·매장 목록은 Supabase 에서, 못 읽으면 `data/` JSON 에서

화면에 적히는 글·사진·매장 목록은 HTML 안에 있지 않다. 화면은 먼저 Supabase 를 읽고, 못 읽으면(키 비어 있음 · 네트워크 오류 · 프로젝트 정지 · 401 같은 오류 응답) 저장소 안 `data/` 의 JSON 파일을 대신 읽는다. 둘 다 같은 모양이라 화면 코드는 어느 쪽을 읽든 똑같이 돈다.

- 접속 정보: `config.js` 의 `window.HARPER_SUPABASE = { url, anonKey }`. `anonKey` 가 비어 있으면 Supabase 를 건너뛰고 조용히 JSON 을 읽는다(공개 anon 키라 저장소에 넣어도 된다)
- 홈 화면(오늘의 추천 · 투어 종류 · 에디터 큐레이션 피드 · 에디터’s PICK)과 에디터 목록: Supabase `editors` 표 + `site_content` 표의 `key = home` 행 → 대신 `data/content.json`. `home.js` 가 그린다
- 홈의 오늘의 추천 · 피드 · PICK 은 글 id 만 적는다(`{ "magazine": "<글 id>" }`). 제목·사진·에디터는 `magazines` 표(대신 `data/magazines.json`)의 그 글에서 가져오고, 누르면 `magazine.html?id=<글 id>` 로 간다. 오늘의 추천·피드·PICK 에는 가격을 그리지 않는다(투어 카드와 안내 창에는 투어 가격이 있다). 예전처럼 `link` 에 `?id=` 를 적은 값도 읽고, 글을 못 찾는 칸은 숨긴다
- 오늘의 추천 · 피드 칸에는 `title` 을 적어 줄바꿈을 정할 수 있다(비우면 매거진 제목). 줄바꿈과 공백을 뺀 글자가 매거진 제목과 다르면 매거진 제목을 쓰고 콘솔에 경고를 남긴다
- 투어 종류 안내(ⓘ 버튼): 제목·설명은 `home.tours.info`, 항목 설명은 `home.tours.items[].desc`
- 매거진 글(`magazine.html?id=<글 id>`: 대표 사진 · 제목 · 요약 · 안내 · 본문 · 브랜드/사람 묶음 · 관련 매장 · 하단 버튼): Supabase `magazines` 표 → 대신 `data/magazines.json`. `magazine.js` 가 그린다. id 가 없거나 못 찾으면 `sort` 가 가장 앞선 글을 보여 준다. 홈 피드 카드 · 오늘의 추천 · 매장 상세의 상품·드롭 줄이 이 글들로 이어진다
- 매장 목록과 지역 중심 좌표: Supabase `shops` 표(`area_name` 같은 snake_case 열은 `areaName` 으로 바꿔 쓴다) + `areas` 표 → 대신 `data/shops.json`. `shops.js` 가 읽어 목록(`list.js`) · 지도(`map.js`) · 상세(`shop.js`)가 같이 쓴다
- Supabase 는 SDK 없이 `fetch` 로 PostgREST(`/rest/v1/…`)를 바로 부른다. 못 읽으면 콘솔에 경고 한 줄만 남기고 JSON 으로 넘어간다
- 사진 주소는 Supabase Storage 의 절대 주소(`https://…`)여도 되고 저장소 안 상대 경로(`assets/…`)여도 된다. 화면에 사진을 넣는 자리는 모두 `window.HARPER_img()` 를 거친다

이 내용은 관리자 페이지([the-harper-admin](https://github.com/hy0909/the-harper-admin))에서 고친다. `data/` JSON 은 Supabase 를 못 읽을 때의 대비용이니 지우지 않는다. 사진은 `assets/uploads/` 아래(또는 Supabase Storage)에 올라간다.

JSON을 `fetch` 로 읽기 때문에 파일을 더블클릭해서(`file://`) 열면 내용이 비어 보인다. 로컬에서 볼 때는 저장소 폴더에서 `python3 -m http.server 8787` 을 띄우고 `http://localhost:8787/` 로 연다.

## 로그인(미리보기용)

내 정보 맨 위 '로그인 · 가입' 버튼에서 `login.html` 로 간다. 카카오 · LINE · WeChat 버튼 셋 중 하나를 누르면 잠깐 '연결하는 중' 화면이 뜨고, 이 기기에서 그 SNS 로 가입한 적이 없으면 가입 마무리(닉네임 · 약관 동의)로, 있으면 바로 로그인돼서 원래 화면으로 돌아간다.

- 실제 SNS 서버에는 붙지 않는다. 카카오·LINE·WeChat 로그인을 실제로 붙이려면 각 개발자 콘솔에 앱을 등록해 키와 돌아올 주소를 받고, 서버(Supabase Auth 등)에 연결해야 한다 [확인 필요]
- 상태는 `localStorage` 에 둔다. `harper:user` 가 지금 로그인한 사람(`provider` · `name` · `marketing` · `joinedAt`), `harper:accounts` 가 이 기기에서 가입한 SNS 별 계정. 로그아웃은 `harper:user` 만 지운다
- 내 정보는 로그인 전이면 안내 글과 로그인·가입 버튼, 로그인 후면 닉네임과 어느 SNS 인지 보여 준다(`my.js`). 로그아웃 버튼은 로그인했을 때만 보인다
- 글은 모두 `i18n.js` 사전(`login.*` · `signup.*` · `my.login*` · `provider.*`)에 있어 고른 언어로 보인다

## 언어

시작 화면에서 언어를 고르면 바로 그 언어로 바뀌고, 내 정보 > 설정 > 언어에서 바꾸면 페이지를 다시 열어 그 언어로 보여 준다. 고른 값은 `localStorage` 의 `harper:lang` 에 남고, 없으면 한국어다.

- 화면에 박힌 글(탭 · 버튼 · 제목 · 안내문): `i18n.js` 의 `UI` 사전. 키 하나에 `[한국어, 영어, 일본어, 중국어 간체, 중국어 번체]` 순서로 적는다. HTML 에는 `data-i18n="키"` 를 달아 두면 `i18n.js` 가 페이지를 열 때 바꾼다(속성은 `data-i18n-attrs="aria-label=키"`, 줄바꿈 있는 글은 `data-i18n-html`, 탭 제목은 `data-i18n-page`)
- 데이터에서 오는 글(홈 칸 제목 · 투어 설명 · 매거진 글 · 매장 이름 · 주소 · 소개): `data/i18n/<언어>.json`. `ko.json` 이 한국어 원문 틀이고, 나머지 네 파일은 같은 구조로 번역만 적는다. 매장은 id, 매거진은 글 id, 투어는 tier, 피드 칸은 글 id 로 맞춰 덮어씌운다. 값이 비어 있으면 한국어 원문이 그대로 보인다
- Supabase 에서 읽은 데이터도 같은 id 로 덮어씌우므로 관리자 페이지에서 한국어 글을 고치면 번역 파일도 같이 고쳐야 한다. 번역 파일은 지금 관리자 페이지에서 고칠 수 없다 [확인 필요]
- 새 매장이나 글을 더하면 `ko.json` 에 한국어 원문을, 나머지 파일에 번역을 같은 자리에 더한다

## 아이콘 출처

- 하단 탭 내 정보: [IconaMoon](https://github.com/dariushhpg1/IconaMoon) `profile-fill`, CC BY 4.0
- 하단 탭 검색: [Fluent UI System Icons](https://github.com/microsoft/fluentui-system-icons) `search-24-filled`, MIT
