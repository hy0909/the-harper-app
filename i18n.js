/* 언어: 온보딩(onboarding.html)이나 내 정보(my.html)에서 고른 값을 localStorage harper:lang 에 둔다(ko · en · ja · zh-Hans · zh-Hant, 없으면 ko).
   화면에 박힌 글(탭 · 버튼 · 제목 · 안내문)은 아래 UI 사전에서 바꾸고, 매장 · 매거진 · 홈 글처럼 데이터에서 오는 글은 data/i18n/<lang>.json 을 덮어씌운다.
   모든 페이지에서 config.js 보다 먼저 읽는다. HTML 에는 data-i18n="키"(글), data-i18n-html="키"(줄바꿈 있는 글), data-i18n-attrs="aria-label=키;data-label=키"(속성), data-i18n-page="키"(탭 제목)를 적는다 */
(function () {
  var LANGS = ['ko', 'en', 'ja', 'zh-Hans', 'zh-Hant'];
  var NAMES = { ko: '한국어', en: 'English', ja: '日本語', 'zh-Hans': '简体中文', 'zh-Hant': '繁體中文' };

  /* 키: [한국어, 영어, 일본어, 중국어 간체, 중국어 번체]. 비어 있으면 한국어를 쓴다 */
  var UI = {
    'title.prefix': ['THE HARPER 앱 미리보기 — ', 'THE HARPER App Preview — ', 'THE HARPER アプリプレビュー — ', 'THE HARPER 应用预览 — ', 'THE HARPER 應用程式預覽 — '],
    'page.home': ['홈', 'Home', 'ホーム', '首页', '首頁'],
    'page.search': ['검색', 'Search', '検索', '搜索', '搜尋'],
    'page.map': ['지도', 'Map', '地図', '地图', '地圖'],
    'page.my': ['내 정보', 'My Page', 'マイページ', '我的', '我的'],
    'page.shop': ['매장 상세', 'Shop Details', 'ショップ詳細', '店铺详情', '店家詳情'],
    'page.magazine': ['매거진', 'Magazine', 'マガジン', '杂志', '雜誌'],
    'page.onboarding': ['시작하기', 'Get Started', 'はじめに', '开始使用', '開始使用'],

    'tab.home': ['홈', 'Home', 'ホーム', '首页', '首頁'],
    'tab.search': ['매장 검색', 'Find Shops', 'ショップ検索', '搜索店铺', '搜尋店家'],
    'tab.my': ['내 정보', 'My Page', 'マイページ', '我的', '我的'],
    'nav.main': ['주요 메뉴', 'Main menu', 'メインメニュー', '主菜单', '主選單'],
    'header.search': ['검색', 'Search', '検索', '搜索', '搜尋'],
    'close': ['닫기', 'Close', '閉じる', '关闭', '關閉'],
    'back': ['뒤로', 'Back', '戻る', '返回', '返回'],
    'share': ['공유', 'Share', '共有', '分享', '分享'],

    'tours.infoBtn': ['투어 종류 안내 보기', 'About tour types', 'ツアー種類の案内を見る', '查看行程类型说明', '查看行程類型說明'],
    'tours.infoTitle': ['투어 종류 안내', 'Tour types', 'ツアーの種類', '行程类型说明', '行程類型說明'],
    'tours.soon': ['오픈 예정', 'Coming soon', '近日オープン', '即将开放', '即將開放'],
    'tours.prev': ['이전 투어', 'Previous tour', '前のツアー', '上一个行程', '上一個行程'],
    'tours.next': ['다음 투어', 'Next tour', '次のツアー', '下一个行程', '下一個行程'],
    'picks.prev': ['이전 추천', 'Previous pick', '前のおすすめ', '上一个推荐', '上一個推薦'],
    'picks.next': ['다음 추천', 'Next pick', '次のおすすめ', '下一个推荐', '下一個推薦'],

    'explore.view': ['보기 방식', 'View mode', '表示方法', '查看方式', '檢視方式'],
    'explore.list': ['목록', 'List', 'リスト', '列表', '列表'],
    'explore.map': ['지도', 'Map', '地図', '地图', '地圖'],
    'filter.all': ['전체', 'All', 'すべて', '全部', '全部'],
    'filter.area': ['지역', 'Area', 'エリア', '地区', '地區'],
    'filter.tier': ['티어', 'Tier', 'ティア', '等级', '等級'],
    'area.seongsu': ['성수', 'Seongsu', '聖水', '圣水', '聖水'],
    'area.hannam': ['한남', 'Hannam', '漢南', '汉南', '漢南'],
    'area.apgujeong': ['압구정', 'Apgujeong', '狎鴎亭', '狎鸥亭', '狎鷗亭'],
    'tier.1': ['티어 1', 'Tier 1', 'ティア1', '等级 1', '等級 1'],
    'tier.2': ['티어 2', 'Tier 2', 'ティア2', '等级 2', '等級 2'],
    'tier.3': ['티어 3', 'Tier 3', 'ティア3', '等级 3', '等級 3'],
    'tier.4': ['티어 4', 'Tier 4', 'ティア4', '等级 4', '等級 4'],
    'tier.5': ['티어 5', 'Tier 5', 'ティア5', '等级 5', '等級 5'],
    'map.aria': ['성수 편집샵 지도', 'Map of select shops', 'セレクトショップ地図', '买手店地图', '選物店地圖'],

    'profile.name': ['김하퍼', 'Harper Kim', 'キム・ハーパー', '金哈珀', '金哈珀'],
    'profile.edit': ['프로필 수정', 'Edit profile', 'プロフィール編集', '编辑资料', '編輯個人資料'],
    'saved.title': ['찜한 매장', 'Saved shops', 'お気に入り', '收藏的店铺', '收藏的店家'],
    'viewAll': ['전체 보기', 'View all', 'すべて見る', '查看全部', '查看全部'],
    'saved.empty': ['아직 찜한 매장이 없어요.', 'No saved shops yet.', 'まだお気に入りがありません。', '还没有收藏的店铺。', '還沒有收藏的店家。'],
    'history.title': ['방문 히스토리', 'Visit history', '訪問履歴', '访问记录', '造訪紀錄'],
    'history.1.name': ['썬러브 링크스 성수', 'Sunlove Links Seongsu', 'Sunlove Links 聖水', 'Sunlove Links 圣水', 'Sunlove Links 聖水'],
    'history.1.sub': ['성수', 'Seongsu', '聖水', '圣水', '聖水'],
    'history.2.name': ['아더 스페이스 3.0', 'ADER SPACE 3.0', 'ADER SPACE 3.0', 'ADER SPACE 3.0', 'ADER SPACE 3.0'],
    'history.2.sub': ['성수', 'Seongsu', '聖水', '圣水', '聖水'],
    'history.3.name': ['비이커 한남', 'BEAKER Hannam', 'BEAKER 漢南', 'BEAKER 汉南', 'BEAKER 漢南'],
    'history.3.sub': ['한남', 'Hannam', '漢南', '汉南', '漢南'],
    'settings': ['설정', 'Settings', '設定', '设置', '設定'],
    'settings.lang': ['언어', 'Language', '言語', '语言', '語言'],
    'settings.noti': ['알림', 'Notifications', '通知', '通知', '通知'],
    'settings.notiHint': ['새 에디터 픽 · 예약 안내', 'New editor picks · booking updates', '新着エディターピック · 予約案内', '新编辑精选 · 预约通知', '新編輯精選 · 預約通知'],
    'settings.support': ['고객센터', 'Customer support', 'カスタマーセンター', '客服中心', '客服中心'],
    'logout': ['로그아웃', 'Log out', 'ログアウト', '退出登录', '登出'],

    'gallery.aria': ['매장 사진', 'Shop photos', 'ショップ写真', '店铺照片', '店家照片'],
    'gallery.prev': ['이전 사진', 'Previous photo', '前の写真', '上一张', '上一張'],
    'gallery.next': ['다음 사진', 'Next photo', '次の写真', '下一张', '下一張'],
    'like': ['찜하기', 'Save', 'お気に入りに追加', '收藏', '收藏'],
    'unlike': ['찜 해제', 'Remove from saved', 'お気に入りから削除', '取消收藏', '取消收藏'],
    'shop.name': ['매장명', 'Shop name', 'ショップ名', '店铺名称', '店家名稱'],
    'info.addr': ['주소', 'Address', '住所', '地址', '地址'],
    'info.hours': ['영업시간', 'Hours', '営業時間', '营业时间', '營業時間'],
    'info.closed': ['휴무', 'Closed', '定休日', '休息日', '公休日'],
    'info.phone': ['전화', 'Phone', '電話', '电话', '電話'],
    'tbd': ['[확인 필요]', '[TBD]', '[要確認]', '[待确认]', '[待確認]'],
    'shop.tabsAria': ['상세 구분', 'Sections', '詳細タブ', '详情分类', '詳情分類'],
    'shop.tab.intro': ['소개', 'About', '紹介', '介绍', '介紹'],
    'shop.tab.drops': ['상품·드롭', 'Products & Drops', '商品・ドロップ', '商品·Drop', '商品·Drop'],
    'shop.tab.reviews': ['리뷰', 'Reviews', 'レビュー', '评价', '評價'],
    'shop.location': ['위치', 'Location', '場所', '位置', '位置'],
    'shop.mapLink': ['지도 화면에서 이 매장 위치 보기', 'See this shop on the map', '地図でこのショップの場所を見る', '在地图上查看此店铺', '在地圖上查看此店家'],
    'shop.dropsLead': [
      '이 매장이 들어 있는 투어예요. 상품은 매장에서 직접 사고, 투어는 여기서 예약합니다.',
      'Tours that include this shop. Buy products in store, book the tour here.',
      'このショップが含まれるツアーです。商品は店頭で、ツアーはこちらで予約できます。',
      '包含此店铺的行程。商品在店内购买，行程在这里预约。',
      '包含此店家的行程。商品在店內購買，行程在這裡預約。'
    ],
    'shop.reviewsEmpty': [
      '아직 방문 후기가 없어요.<br>다녀오셨다면 첫 후기를 남겨 주세요.',
      'No reviews yet.<br>Been here? Leave the first one.',
      'まだレビューがありません。<br>訪れた方は最初のレビューをお願いします。',
      '还没有评价。<br>去过的话，留下第一条评价吧。',
      '還沒有評價。<br>去過的話，留下第一則評價吧。'
    ],
    'shop.reviewWrite': ['리뷰 쓰기', 'Write a review', 'レビューを書く', '写评价', '寫評價'],
    'shop.book': ['예약하기', 'Book now', '予約する', '立即预约', '立即預約'],
    'shop.bookPrice': ['128,000원~', '₩128,000~', '₩128,000〜', '₩128,000起', '₩128,000起'],
    'shop.bookPer': ['4인 기준', 'for 4 people', '4名基準', '4人标准', '4人標準'],
    'shop.chipPick': ['에디터 PICK', "Editor’s PICK", 'エディターPICK', '编辑PICK', '編輯PICK'],
    'shop.chipRec': ['에디터 추천', "Editor’s choice", 'エディターおすすめ', '编辑推荐', '編輯推薦'],
    'shop.chipNoJapan': ['일본 미입점', 'Not in Japan', '日本未上陸', '日本未进驻', '日本未進駐'],
    'shop.dropTitle': ['성수 창고 쇼룸에서 고르는 한국 브랜드', "Korean brands from Seongsu’s warehouse showrooms", '聖水の倉庫ショールームで選ぶ韓国ブランド', '在圣水仓库展厅挑选韩国品牌', '在聖水倉庫展示間挑選韓國品牌'],
    'shop.dropPrice': ['128,000원~ · 4인 기준', '₩128,000~ · for 4 people', '₩128,000〜 · 4名基準', '₩128,000起 · 4人标准', '₩128,000起 · 4人標準'],
    'shop.dropNote': ['에디터와 함께 5곳을 돌아보는 투어', 'A tour of 5 shops with the editor', 'エディターと5軒をめぐるツアー', '与编辑同行探访5家店铺', '與編輯同行探訪5家店家'],
    'mag.more': ['자세히 보기', 'See more', '詳しく見る', '查看详情', '查看更多'],

    'onb.skip': ['건너뛰기', 'Skip', 'スキップ', '跳过', '略過'],
    'onb.langTitle': ['언어를 선택하세요', 'Choose your language', '言語を選択してください', '请选择语言', '請選擇語言'],
    'onb.next': ['다음', 'Next', '次へ', '下一步', '下一步'],
    'onb.styleTitle': ['관심 스타일을 선택하세요', 'Pick the styles you like', '好きなスタイルを選んでください', '请选择感兴趣的风格', '請選擇感興趣的風格'],
    'onb.styleSub': ['복수 선택 허용', 'Select all that apply', '複数選択可', '可多选', '可多選'],
    'onb.editorial': ['에디토리얼', 'Editorial', 'エディトリアル', '编辑风', '編輯風'],
    'onb.minimal': ['미니멀', 'Minimal', 'ミニマル', '极简', '極簡'],
    'onb.street': ['스트리트', 'Street', 'ストリート', '街头', '街頭'],
    'onb.vintage': ['빈티지', 'Vintage', 'ヴィンテージ', '复古', '復古'],
    'onb.feminine': ['페미닌', 'Feminine', 'フェミニン', '女性风', '女性風'],
    'onb.start': ['시작하기', 'Get started', 'はじめる', '开始', '開始'],

    'page.login': ['로그인', 'Log in', 'ログイン', '登录', '登入'],
    'provider.kakao': ['카카오', 'Kakao', 'Kakao', 'Kakao', 'Kakao'],
    'provider.line': ['LINE', 'LINE', 'LINE', 'LINE', 'LINE'],
    'provider.wechat': ['WeChat', 'WeChat', 'WeChat', '微信', 'WeChat'],
    'login.title': ['SNS 계정으로 시작하세요', 'Continue with your social account', 'SNSアカウントではじめましょう', '使用社交账号开始', '使用社群帳號開始'],
    'login.sub': ['처음이면 가입, 이미 가입했으면 바로 로그인돼요', "New here? We’ll sign you up. Already joined? You’ll be logged in.", '初めての方は登録、登録済みの方はそのままログインできます', '首次使用将自动注册，已注册则直接登录', '首次使用將自動註冊，已註冊則直接登入'],
    'login.kakao': ['카카오로 시작하기', 'Continue with Kakao', 'Kakaoではじめる', '使用 Kakao 开始', '使用 Kakao 開始'],
    'login.line': ['LINE으로 시작하기', 'Continue with LINE', 'LINEではじめる', '使用 LINE 开始', '使用 LINE 開始'],
    'login.wechat': ['WeChat으로 시작하기', 'Continue with WeChat', 'WeChatではじめる', '使用微信开始', '使用 WeChat 開始'],
    'login.terms': ['계속하면 이용약관과 개인정보 처리방침에 동의한 것으로 봅니다.', 'By continuing you agree to the Terms of Service and Privacy Policy.', '続行すると、利用規約とプライバシーポリシーに同意したものとみなされます。', '继续即表示您同意服务条款和隐私政策。', '繼續即表示您同意服務條款與隱私權政策。'],
    'login.connecting': ['{p}에 연결하는 중…', 'Connecting to {p}…', '{p}に接続しています…', '正在连接 {p}…', '正在連線 {p}…'],
    'signup.title': ['회원가입', 'Sign up', '会員登録', '注册', '註冊'],
    'signup.sub': ['{p} 계정으로 가입', 'Sign up with your {p} account', '{p}アカウントで登録', '使用 {p} 账号注册', '使用 {p} 帳號註冊'],
    'signup.nickname': ['닉네임', 'Nickname', 'ニックネーム', '昵称', '暱稱'],
    'signup.nicknameHint': ['매장 리뷰에 보이는 이름이에요', 'Shown on your shop reviews', 'ショップのレビューに表示される名前です', '显示在店铺评价中的名字', '顯示在店家評價中的名字'],
    'signup.all': ['모두 동의', 'Agree to all', 'すべてに同意', '全部同意', '全部同意'],
    'signup.required': ['필수', 'Required', '必須', '必填', '必填'],
    'signup.optional': ['선택', 'Optional', '任意', '可选', '選填'],
    'signup.terms': ['이용약관 동의', 'Terms of Service', '利用規約に同意', '同意服务条款', '同意服務條款'],
    'signup.privacy': ['개인정보 수집·이용 동의', 'Privacy Policy', '個人情報の収集・利用に同意', '同意收集和使用个人信息', '同意蒐集與使用個人資料'],
    'signup.marketing': ['새 에디터 픽·투어 소식 받기', 'Get editor picks & tour news', '新着エディターピック・ツアー情報を受け取る', '接收编辑精选和行程消息', '接收編輯精選與行程消息'],
    'signup.done': ['가입 완료', 'Done', '登録を完了', '完成注册', '完成註冊'],
    'my.loginTitle': ['로그인이 필요해요', 'Log in to get started', 'ログインが必要です', '请先登录', '請先登入'],
    'my.loginSub': ['찜한 매장과 방문 기록을 저장해요', 'Save shops and keep your visit history', 'お気に入りと訪問履歴を保存します', '保存收藏的店铺和访问记录', '儲存收藏的店家與造訪紀錄'],
    'my.loginBtn': ['로그인 · 가입', 'Log in · Sign up', 'ログイン・登録', '登录 · 注册', '登入 · 註冊'],
    'my.via': ['{p} 계정으로 로그인', 'Logged in with {p}', '{p}でログイン中', '通过 {p} 登录', '透過 {p} 登入'],
    'confirm': ['확인', 'OK', '確認', '确定', '確定'],
    'profile.photoUpload': ['사진 올리기', 'Upload photo', '写真をアップロード', '上传照片', '上傳照片'],
    'profile.photoChange': ['사진 바꾸기', 'Change photo', '写真を変更', '更换照片', '更換照片'],
    'profile.photoRemove': ['사진 지우기', 'Remove photo', '写真を削除', '删除照片', '刪除照片'],

    'support.subject': ['[THE HARPER] 문의', '[THE HARPER] Inquiry', '[THE HARPER] お問い合わせ', '[THE HARPER] 咨询', '[THE HARPER] 諮詢'],
    'support.bodyHead': ['문의 내용을 적어 주세요.', 'Please write your question here.', 'お問い合わせ内容をご記入ください。', '请在此填写咨询内容。', '請在此填寫諮詢內容。'],
    'support.version': ['앱 버전', 'App version', 'アプリ版', '应用版本', '應用程式版本'],
    'support.device': ['기기', 'Device', '端末', '设备', '裝置'],
    'support.desktopHint': ['컴퓨터에서는 메일 앱이 설정돼 있지 않을 수 있어요. 아래에서 골라 주세요.', 'Your computer may not have a mail app set up. Choose an option below.', 'パソコンにメールアプリが設定されていない場合があります。下から選んでください。', '电脑上可能没有设置邮件应用，请在下方选择。', '電腦上可能沒有設定郵件應用程式，請在下方選擇。'],
    'support.addrLabel': ['메일 주소', 'Email', 'メール', '邮箱', '電子郵件'],
    'support.mailApp': ['메일 앱으로 보내기', 'Send with mail app', 'メールアプリで送る', '用邮件应用发送', '用郵件應用程式寄送'],
    'support.gmail': ['Gmail로 보내기', 'Send with Gmail', 'Gmailで送る', '用 Gmail 发送', '用 Gmail 寄送'],
    'support.copy': ['주소 복사', 'Copy address', 'アドレスをコピー', '复制地址', '複製地址'],
    'support.copied': ['복사했어요', 'Copied', 'コピーしました', '已复制', '已複製'],
    'support.copyFail': ['복사하지 못했어요. 주소를 길게 눌러 복사해 주세요.', "Couldn't copy. Please select the address and copy it.", 'コピーできませんでした。アドレスを選んでコピーしてください。', '复制失败，请选中地址后手动复制。', '複製失敗，請選取地址後手動複製。']
  };

  function read() {
    var v = '';
    try { v = localStorage.getItem('harper:lang') || ''; } catch (e) {}
    return LANGS.indexOf(v) >= 0 ? v : 'ko';
  }
  var lang = read();
  var idx = LANGS.indexOf(lang);
  document.documentElement.lang = lang;

  /* t('키') → 현재 언어 글. t('키', { p: 'Kakao' }) 처럼 주면 글 안의 {p} 를 바꾼다 */
  function t(key, vars) {
    var row = UI[key];
    if (!row) return key;
    var s = row[idx] || row[0];
    if (vars) Object.keys(vars).forEach(function (k) { s = s.split('{' + k + '}').join(vars[k]); });
    return s;
  }

  /* HTML 에 적힌 data-i18n 표시를 모두 현재 언어로 바꾼다. 언어를 바꾸면 다시 부른다 */
  function apply(root) {
    root = root || document;
    var all = function (sel) { return Array.prototype.slice.call(root.querySelectorAll(sel)); };
    all('[data-i18n]').forEach(function (el) { el.textContent = t(el.getAttribute('data-i18n')); });
    all('[data-i18n-html]').forEach(function (el) { el.innerHTML = t(el.getAttribute('data-i18n-html')); });
    all('[data-i18n-attrs]').forEach(function (el) {
      el.getAttribute('data-i18n-attrs').split(';').forEach(function (pair) {
        var p = pair.split('=');
        if (p.length === 2 && p[0].trim()) el.setAttribute(p[0].trim(), t(p[1].trim()));
      });
    });
    all('[data-i18n-page]').forEach(function (el) { el.textContent = t('title.prefix') + t(el.getAttribute('data-i18n-page')); });
  }

  /* 데이터 번역 파일: 한국어면 없음(null). 못 읽어도 화면은 한국어 데이터로 그린다 */
  var ready = lang === 'ko'
    ? Promise.resolve(null)
    : fetch('data/i18n/' + lang + '.json', { cache: 'no-store' })
      .then(function (r) { return r.ok ? r.json() : null; })
      .catch(function () { return null; });

  /* 번역 값이 비어 있지 않을 때만 덮어쓴다. 글자 배열(intro)은 길이가 같을 때 통째로, 항목 배열(info · sections)은 자리마다 */
  function put(target, src, keys) {
    if (!target || !src) return target;
    keys.forEach(function (k) {
      var v = src[k];
      if (typeof v === 'string') { if (v) target[k] = v; }
      else if (Array.isArray(v) && Array.isArray(target[k])) {
        if (v.length && typeof v[0] === 'string') { if (v.length === target[k].length) target[k] = v.slice(); }
        else v.forEach(function (row, i) { if (target[k][i] && row) put(target[k][i], row, Object.keys(row)); });
      }
    });
    return target;
  }
  function trShop(s, tr) {
    var o = tr && tr.shops && tr.shops[String(s.id)];
    return o ? put(s, o, ['areaName', 'name', 'addr', 'note', 'intro', 'hours', 'closed']) : s;
  }
  function trMagazine(m, tr) {
    var o = tr && tr.magazines && tr.magazines[m.id];
    return o ? put(m, o, ['badge', 'title', 'price', 'note', 'summary', 'info', 'intro', 'sections', 'related_label', 'cta_label']) : m;
  }
  /* 홈 데이터({ editors, home, magazines }) 전체를 번역한다 */
  function trHome(data, tr) {
    if (!tr || !data) return data;
    (data.editors || []).forEach(function (e) { put(e, (tr.editors || {})[e.id], ['name']); });
    (data.magazines || []).forEach(function (m) { trMagazine(m, tr); });
    var h = data.home || {};
    var th = tr.home || {};
    if (h.today) put(h.today, th.today, ['eyebrow', 'title']);
    if (h.tours) {
      put(h.tours, th.tours, ['title', 'soonLabel']);
      if (th.tours && th.tours.info) { h.tours.info = h.tours.info || {}; put(h.tours.info, th.tours.info, ['title', 'note']); }
      (h.tours.items || []).forEach(function (x) { put(x, ((th.tours || {}).items || {})[x.tier], ['title', 'price', 'desc']); });
    }
    if (h.feed) {
      put(h.feed, th.feed, ['title']);
      (h.feed.items || []).forEach(function (x) { put(x, ((th.feed || {}).items || {})[x.magazine], ['title']); });
    }
    if (h.picks) put(h.picks, th.picks, ['title']);
    return data;
  }

  /* 곧은 따옴표(" ')를 둥근 따옴표(“ ” ‘ ’)로. Supabase 나 JSON 에서 온 글을 화면에 그리기 전에 거친다 */
  function curly(s) {
    return String(s).replace(/["']/g, function (ch, i, str) {
      var prev = i > 0 ? str[i - 1] : '';
      var next = str[i + 1] || '';
      var open = !prev || /[\s([{\n]/.test(prev);
      if (ch === '"') return open ? '“' : '”';
      if (prev && /[\p{L}\p{N}]/u.test(prev)) return '’';
      return (next && !/\s/.test(next)) ? '‘' : '’';
    });
  }
  function curlyDeep(v) {
    if (typeof v === 'string') return curly(v);
    if (Array.isArray(v)) { v.forEach(function (x, i) { v[i] = curlyDeep(x); }); return v; }
    if (v && typeof v === 'object') { Object.keys(v).forEach(function (k) { v[k] = curlyDeep(v[k]); }); return v; }
    return v;
  }
  window.HARPER_curly = curly;
  window.HARPER_curlyDeep = curlyDeep;

  window.HARPER_LANG = lang;
  window.HARPER_LANGS = LANGS;
  window.HARPER_LANG_NAMES = NAMES;
  window.HARPER_t = t;
  window.HARPER_applyI18n = apply;
  window.HARPER_i18nReady = ready;
  window.HARPER_trShop = trShop;
  window.HARPER_trMagazine = trMagazine;
  window.HARPER_trHome = trHome;
  /* 언어를 바꿔 저장한다(온보딩 · 내 정보). 화면 글은 apply() 로 바로 바꾸고, 데이터 글은 페이지를 다시 열 때 번역된다 */
  window.HARPER_setLang = function (v) {
    if (LANGS.indexOf(v) < 0) v = 'ko';
    try { localStorage.setItem('harper:lang', v); } catch (e) {}
    lang = v;
    idx = LANGS.indexOf(v);
    window.HARPER_LANG = v;
    document.documentElement.lang = v;
    apply();
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function () { apply(); });
  else apply();
})();
