# THE HARPER 앱 미리보기

모바일앱 화면을 웹으로 옮겨 브라우저에서 미리 보는 저장소. 피그마 시안이 기준이고, 화면이 늘어나면 페이지를 하나씩 추가한다.

- 홈: `index.html`
- 내 정보: `my.html` (설계서 09: 프로필 · 저장한 샵 · 방문 히스토리 · 언어/알림 설정 · 고객센터 · 로그아웃). 스타일 `my.css`, 동작 `my.js`
- 스타일: `styles.css`, 동작: `app.js`
- 배포: GitHub Pages(main 브랜치 루트)

## 고칠 수 있는 내용은 `data/` 에

글·사진·매장 목록은 HTML 안에 적혀 있지 않고 `data/` 의 JSON 두 개에 들어 있다. 화면은 이 파일을 읽어서 그린다.

- `data/content.json`: 홈 화면(오늘의 추천 · 투어 종류 · 에디터 큐레이션 피드 · 에디터’s PICK)과 에디터 목록. `home.js` 가 그린다
- `data/shops.json`: 매장 목록과 지역 중심 좌표. `shops.js` 가 읽어 목록(`list.js`) · 지도(`map.js`) · 상세(`shop.js`)가 같이 쓴다

이 파일은 관리자 페이지([the-harper-admin](https://github.com/hy0909/the-harper-admin))에서 고치고, 고치면 바로 이 저장소에 커밋된다. 사진은 `assets/uploads/` 아래에 올라간다.

JSON을 `fetch` 로 읽기 때문에 파일을 더블클릭해서(`file://`) 열면 내용이 비어 보인다. 로컬에서 볼 때는 저장소 폴더에서 `python3 -m http.server 8787` 을 띄우고 `http://localhost:8787/` 로 연다.

## 아이콘 출처

- 하단 탭 내 정보: [IconaMoon](https://github.com/dariushhpg1/IconaMoon) `profile-fill`, CC BY 4.0
- 하단 탭 검색: [Fluent UI System Icons](https://github.com/microsoft/fluentui-system-icons) `search-24-filled`, MIT
