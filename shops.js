/* 매장 데이터: 목록·지도·상세가 같이 쓴다. 좌표는 주소를 지오코딩한 값이라 입구와 몇 m 차이가 날 수 있음.
   한남은 표본이고 주소·영업시간은 [확인 필요]. tier(1~5)도 임시값 [확인 필요]. 실제 100곳 목록이 오면 이 배열만 바꾸면 된다 */
window.HARPER_SHOPS = [
  {
    "id": 0,
    "tier": 1,
    "area": "seongsu",
    "areaName": "성수",
    "name": "썬러브 링크스 성수",
    "addr": "성수동2가 269-77",
    "lat": 37.54048,
    "lng": 127.05601,
    "pick": true,
    "photo": "assets/photos/seongsu-brick-showroom.jpg",
    "note": "성수 숨은 디자이너 브랜드 편집샵",
    "intro": [
      "성수 골목 안쪽, 간판이 작아 그냥 지나치기 쉬운 편집샵이에요. 국내 신진 디자이너 브랜드를 모아 두는데, 대부분 일본에 매장이 없는 곳들이라 여기서만 살 수 있어요.",
      "한 번에 다 보려 하지 말고 랙 하나씩 천천히 보세요. 사이즈가 애매하면 직원분이 솔직하게 말해 주는 편이라 믿고 물어봐도 됩니다."
    ]
  },
  {
    "id": 1,
    "tier": 3,
    "area": "seongsu",
    "areaName": "성수",
    "name": "포인트오브뷰 성수",
    "addr": "연무장길 18",
    "lat": 37.54356,
    "lng": 127.0514,
    "pick": false,
    "photo": "assets/photos/seongsu-contemporary.jpg",
    "note": "문구와 오브제를 모아 둔 편집샵",
    "intro": [
      "옷은 없지만 성수 투어 중간에 한 번 들르기 좋은 곳이에요. 문구와 작은 오브제를 고르다 보면 쇼핑 리듬이 한 번 쉬어 갑니다."
    ]
  },
  {
    "id": 2,
    "tier": 2,
    "area": "seongsu",
    "areaName": "성수",
    "name": "LCDC SEOUL",
    "addr": "연무장17길 10",
    "lat": 37.54214,
    "lng": 127.06155,
    "pick": false,
    "photo": "assets/photos/seongsu-alley.jpg",
    "note": "복합 공간 안에 브랜드 매장이 모여 있는 곳",
    "intro": [
      "한 건물 안에 브랜드 매장과 카페가 모여 있어요. 비 오는 날 투어 코스로 넣기 좋습니다."
    ]
  },
  {
    "id": 3,
    "tier": 1,
    "area": "seongsu",
    "areaName": "성수",
    "name": "아더 스페이스 3.0",
    "addr": "연무장길 53",
    "lat": 37.54418,
    "lng": 127.05062,
    "pick": false,
    "photo": "assets/photos/hannam-studio.jpg",
    "note": "아더에러 플래그십, 공간 자체가 볼거리",
    "intro": [
      "아더에러의 성수 플래그십이에요. 옷만큼 공간 연출이 유명해서 사진 찍으러 오는 분도 많습니다."
    ]
  },
  {
    "id": 4,
    "tier": 2,
    "area": "hannam",
    "areaName": "한남",
    "name": "비이커 한남",
    "addr": "이태원로54길 57",
    "lat": 37.5351,
    "lng": 127.0008,
    "pick": false,
    "photo": "assets/photos/hannam-hillside.jpg",
    "note": "국내외 브랜드를 넓게 모아 둔 한남 편집샵",
    "intro": [
      "한남에서 가장 넓게 보는 편집샵이에요. 국내 브랜드와 해외 브랜드가 같이 걸려 있어 비교해 보기 좋습니다."
    ]
  },
  {
    "id": 5,
    "tier": 2,
    "area": "hannam",
    "areaName": "한남",
    "name": "아모멘토 한남",
    "addr": "한남동 [확인 필요]",
    "lat": 37.534,
    "lng": 127.003,
    "pick": false,
    "photo": "assets/photos/hannam-alley.jpg",
    "note": "군더더기 없는 한국 브랜드 플래그십",
    "intro": [
      "색과 선을 최소로 줄인 옷을 만드는 브랜드의 플래그십이에요. 베이식한 옷을 오래 입고 싶은 분께 먼저 권합니다."
    ]
  },
  {
    "id": 6,
    "tier": 3,
    "area": "hannam",
    "areaName": "한남",
    "name": "엠프티 한남",
    "addr": "한남동 [확인 필요]",
    "lat": 37.5357,
    "lng": 127.0005,
    "pick": false,
    "photo": "assets/photos/hannam-vintage.jpg",
    "note": "신진 브랜드를 모아 둔 무신사 편집샵",
    "intro": [
      "무신사가 꾸린 오프라인 편집샵이에요. 온라인에서만 보던 신진 브랜드를 직접 입어 볼 수 있습니다."
    ]
  },
];
window.HARPER_AREAS = {"seongsu": [37.5428, 127.0555], "hannam": [37.5345, 127.0012]};
