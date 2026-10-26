// Amplitude 연동 (세 페이지 공통)
// 순서: amplitude-min.js(SDK) → amplitude-config.js(.env에서 생성) → analytics.js → 페이지 스크립트
(function () {
  var cfg = window.AMPLITUDE_CONFIG;
  var amp = window.amplitude;

  if (!amp || !cfg || !cfg.apiKey) {
    console.warn("[analytics] Amplitude SDK 또는 amplitude-config.js 가 없어 이벤트를 보내지 않습니다.");
    window.ampTrack = function () {};
    return;
  }

  amp.init(cfg.apiKey, {
    serverZone: cfg.serverZone || "US",
    defaultTracking: {
      pageViews: true,    // [Amplitude] Page Viewed
      sessions: true,     // [Amplitude] Start / End Session
      attribution: true,  // UTM·referrer를 사용자 속성으로 자동 저장 (채널별 분석용)
      formInteractions: false,
      fileDownloads: false
    }
  });

  // 어느 랜딩 페이지에서 발생한 이벤트인지 모든 이벤트에 붙임
  var page = decodeURIComponent(location.pathname.split("/").pop() || "index.html");

  window.ampTrack = function (event, props) {
    var clean = { page: page };
    Object.keys(props || {}).forEach(function (k) {
      if (props[k] !== undefined && props[k] !== null && props[k] !== "") clean[k] = props[k];
    });
    amp.track(event, clean);
  };
})();
