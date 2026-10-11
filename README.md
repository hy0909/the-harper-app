# THE HARPER 앱 미리보기

모바일앱 화면을 웹으로 옮겨 브라우저에서 미리 보는 저장소. 피그마 시안이 기준이고, 화면이 늘어나면 페이지를 하나씩 추가한다.

- 홈: `index.html`
- 매거진 상세: `magazine.html?id=<글 id>`. 스타일 `magazine.css`, 동작 `magazine.js`
- 내 정보: `my.html` (설계서 09: 프로필 · 저장한 샵 · 방문 히스토리 · 언어/알림 설정 · 고객센터 · 로그아웃). 스타일 `my.css`, 동작 `my.js`
- 스타일: `styles.css`, 동작: `app.js`
- 배포: GitHub Pages(main 브랜치 루트)

## 글·사진·매장 목록은 Supabase 에서, 못 읽으면 `data/` JSON 에서

화면에 적히는 글·사진·매장 목록은 HTML 안에 있지 않다. 화면은 먼저 Supabase 를 읽고, 못 읽으면(키 비어 있음 · 네트워크 오류 · 프로젝트 정지 · 401 같은 오류 응답) 저장소 안 `data/` 의 JSON 파일을 대신 읽는다. 둘 다 같은 모양이라 화면 코드는 어느 쪽을 읽든 똑같이 돈다.

- 접속 정보: `config.js` 의 `window.HARPER_SUPABASE = { url, anonKey }`. `anonKey` 가 비어 있으면 Supabase 를 건너뛰고 조용히 JSON 을 읽는다(공개 anon 키라 저장소에 넣어도 된다)
- 홈 화면(오늘의 추천 · 투어 종류 · 에디터 큐레이션 피드 · 에디터’s PICK)과 에디터 목록: Supabase `editors` 표 + `site_content` 표의 `key = home` 행 → 대신 `data/content.json`. `home.js` 가 그린다
- 매거진 글(`magazine.html?id=<글 id>`: 대표 사진 · 제목 · 요약 · 안내 · 본문 · 브랜드/사람 묶음 · 관련 샵 · 하단 버튼): Supabase `magazines` 표 → 대신 `data/magazines.json`. `magazine.js` 가 그린다. id 가 없거나 못 찾으면 `sort` 가 가장 앞선 글을 보여 준다. 홈 피드 카드 · 오늘의 추천 · 샵 상세의 상품·드롭 줄이 이 글들로 이어진다
- 매장 목록과 지역 중심 좌표: Supabase `shops` 표(`area_name` 같은 snake_case 열은 `areaName` 으로 바꿔 쓴다) + `areas` 표 → 대신 `data/shops.json`. `shops.js` 가 읽어 목록(`list.js`) · 지도(`map.js`) · 상세(`shop.js`)가 같이 쓴다
- Supabase 는 SDK 없이 `fetch` 로 PostgREST(`/rest/v1/…`)를 바로 부른다. 못 읽으면 콘솔에 경고 한 줄만 남기고 JSON 으로 넘어간다
- 사진 주소는 Supabase Storage 의 절대 주소(`https://…`)여도 되고 저장소 안 상대 경로(`assets/…`)여도 된다. 화면에 사진을 넣는 자리는 모두 `window.HARPER_img()` 를 거친다

이 내용은 관리자 페이지([the-harper-admin](https://github.com/hy0909/the-harper-admin))에서 고친다. `data/` JSON 은 Supabase 를 못 읽을 때의 대비용이니 지우지 않는다. 사진은 `assets/uploads/` 아래(또는 Supabase Storage)에 올라간다.

JSON을 `fetch` 로 읽기 때문에 파일을 더블클릭해서(`file://`) 열면 내용이 비어 보인다. 로컬에서 볼 때는 저장소 폴더에서 `python3 -m http.server 8787` 을 띄우고 `http://localhost:8787/` 로 연다.

## 아이콘 출처

- 하단 탭 내 정보: [IconaMoon](https://github.com/dariushhpg1/IconaMoon) `profile-fill`, CC BY 4.0
- 하단 탭 검색: [Fluent UI System Icons](https://github.com/microsoft/fluentui-system-icons) `search-24-filled`, MIT
