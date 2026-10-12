/* 지도 스타일: 홈페이지 v2(the-harper-v2)와 같은 벡터 지도. OpenFreeMap positron(키 없이 쓸 수 있음, 출처 표기 필수)을 받아
   앱 색(따뜻한 회색)으로 다시 칠하고, 작은 길 이름·도로 번호·공항·국경은 숨긴다. 지명은 앱 언어(ko·en·ja·zh-Hans·zh-Hant)를 따른다.
   map.js(지도 화면)와 shop.js(매장 상세 미니 지도)가 같이 쓴다 */
(function () {
  var STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';
  var ATTR = '<a href="https://openfreemap.org">OpenFreeMap</a> &copy; <a href="https://www.openmaptiles.org/">OpenMapTiles</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';
  var cache = null;

  /* 지명 표기: 그 언어 이름이 있으면 그것, 없으면 영문, 그래도 없으면 원래 이름 */
  function labelField(lang) {
    var keys = {
      ko: ['name:ko', 'name:nonlatin'],
      en: ['name:en', 'name:latin'],
      ja: ['name:ja', 'name:en', 'name:latin'],
      'zh-Hans': ['name:zh', 'name:zh-Hans', 'name:en', 'name:latin'],
      'zh-Hant': ['name:zh-Hant', 'name:zh', 'name:en', 'name:latin']
    }[lang] || ['name:en', 'name:latin'];
    var expr = ['coalesce'];
    keys.forEach(function (k) { expr.push(['get', k]); });
    expr.push(['get', 'name']);
    return expr;
  }

  function restyle(style, lang) {
    var C = {
      bg: '#F3F1EC', land: '#EEEBE4', park: '#E6E4DC', wood: '#E2DFD7', water: '#D5D1C9',
      building: '#E8E5DE', buildingLine: '#DCD8D0',
      roadCasing: '#D8D4CC', roadInner: '#FFFFFF', roadMinor: '#FBFAF7', rail: '#D8D4CC', boundary: '#C8C3BA',
      label: '#5B5650', labelStrong: '#3A362F', halo: 'rgba(243, 241, 236, 0.9)'
    };
    var hide = /shield|airport|label_country|label_state|label_city|label_town|boundary_disputed|aeroway|ice_shelf|glacier|dashline|highway-name-minor|highway-name-path/;
    var field = labelField(lang);
    (style.layers || []).forEach(function (layer) {
      var id = layer.id;
      layer.layout = layer.layout || {};
      layer.paint = layer.paint || {};
      if (hide.test(id)) { layer.layout.visibility = 'none'; return; }
      if (layer.type === 'background') layer.paint['background-color'] = C.bg;
      if (id === 'landuse_residential') layer.paint['fill-color'] = C.land;
      if (id === 'park') layer.paint['fill-color'] = C.park;
      if (id === 'landcover_wood') layer.paint['fill-color'] = C.wood;
      if (id === 'water') layer.paint['fill-color'] = C.water;
      if (id === 'waterway') layer.paint['line-color'] = C.water;
      if (id === 'building') { layer.paint['fill-color'] = C.building; layer.paint['fill-outline-color'] = C.buildingLine; }
      if (/road_area_pier|road_pier/.test(id)) layer.paint[layer.type === 'fill' ? 'fill-color' : 'line-color'] = C.land;
      if (/casing/.test(id)) layer.paint['line-color'] = C.roadCasing;
      if (/_inner|_subtle/.test(id)) layer.paint['line-color'] = C.roadInner;
      if (id === 'highway_minor') layer.paint['line-color'] = C.roadMinor;
      if (id === 'highway_path') layer.paint['line-color'] = C.roadCasing;
      if (/^railway/.test(id)) layer.paint['line-color'] = C.rail;
      if (/^boundary/.test(id)) layer.paint['line-color'] = C.boundary;
      if (layer.type === 'symbol') {
        layer.paint['text-color'] = /label_city|label_town/.test(id) ? C.labelStrong : C.label;
        layer.paint['text-halo-color'] = C.halo;
        layer.paint['text-halo-width'] = 1.2;
        layer.paint['text-halo-blur'] = 0.4;
        if (layer.layout['text-field']) {
          layer.layout['text-field'] = field;
          layer.layout['text-font'] = ['Noto Sans Regular'];
        }
      }
    });
    return style;
  }

  /* 스타일 JSON을 받아 다시 칠한 것을 돌려준다(한 번 받으면 다시 안 받음) */
  function load(lang) {
    if (!cache) {
      cache = fetch(STYLE_URL).then(function (r) {
        if (!r.ok) throw new Error('style ' + r.status);
        return r.json();
      });
    }
    return cache.then(function (style) { return restyle(JSON.parse(JSON.stringify(style)), lang || window.HARPER_LANG || 'ko'); });
  }

  /* Leaflet 지도에 벡터 지도를 올린다. 올리면 true, 못 올리면(라이브러리·스타일 없음) false 를 돌려주니 호출한 쪽에서 OSM 타일로 대신한다 */
  function addTo(map, lang) {
    if (!window.L || !L.maplibreGL || !window.maplibregl) return Promise.resolve(false);
    return load(lang).then(function (style) {
      var layer = L.maplibreGL({ style: style, attribution: ATTR }).addTo(map);
      /* 스타일을 받는 동안 지도 칸 크기가 바뀌었을 수 있으니, 올린 뒤 크기를 다시 맞춘다 */
      map.invalidateSize();
      var gl = layer.getMaplibreMap && layer.getMaplibreMap();
      if (gl) gl.once('load', function () { map.invalidateSize(); gl.resize(); });
      return true;
    }).catch(function () { return false; });
  }

  window.HARPER_mapStyle = { load: load, addTo: addTo, labelField: labelField, attribution: ATTR };
})();
