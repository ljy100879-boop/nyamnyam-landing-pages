// Amplitude 연동 (세 페이지 공통)
// 순서: amplitude-min.js(SDK) → amplitude-config.js(.env에서 생성) → analytics.js → 페이지 스크립트
(function () {
  var cfg = window.AMPLITUDE_CONFIG;
  var amp = window.amplitude;
  window.dataLayer = window.dataLayer || [];

  // 어느 랜딩 페이지에서 발생한 이벤트인지 모든 이벤트에 붙임
  var page = decodeURIComponent(location.pathname.split("/").pop() || "index.html");

  if (!amp || !cfg || !cfg.apiKey) {
    console.warn("[analytics] Amplitude SDK 또는 amplitude-config.js 가 없어 Amplitude로는 보내지 않습니다.");
    window.ampTrack = function () {};
  } else {
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

    // 스토어·딥링크로 페이지를 떠나는 순간에도 클릭 이벤트가 유실되지 않도록 beacon으로 전송
    window.addEventListener("pagehide", function () {
      amp.setTransport("beacon");
      amp.flush();
    });

    window.ampTrack = function (event, props) {
      var clean = { page: page };
      Object.keys(props || {}).forEach(function (k) {
        if (props[k] !== undefined && props[k] !== null && props[k] !== "") clean[k] = props[k];
      });
      amp.track(event, clean);
    };
  }

  /* ===== CTA 노출·클릭 수집 =====
     data-cta-id 가 붙은 요소를 자동으로 추적합니다.
     - cta_impression: 요소가 화면에 50% 이상 1초 이상 보였을 때, 페이지 로드당 CTA별 1회
     - cta_click: 클릭할 때마다
     CTR(클릭률) = cta_click ÷ cta_impression (cta_id 기준) */
  var IMPRESSION_RATIO = 0.5;
  var IMPRESSION_MS = 1000;

  var params = new URLSearchParams(location.search);
  var context = {};
  ["utm_source", "utm_medium", "utm_campaign", "utm_content", "utm_term", "creator"].forEach(function (k) {
    if (params.get(k)) context[k] = params.get(k);
  });

  function ctaProps(el) {
    var props = {
      cta_id: el.dataset.ctaId,
      cta_label: (el.textContent || "").replace(/\s+/g, " ").trim().slice(0, 60)
    };
    Object.keys(context).forEach(function (k) { props[k] = context[k]; });
    return props;
  }

  function send(event, el) {
    var props = ctaProps(el);
    var dl = { event: event, page: page };
    Object.keys(props).forEach(function (k) { dl[k] = props[k]; });
    window.dataLayer.push(dl);
    window.ampTrack(event, props);
  }

  function initCtaTracking() {
    var els = document.querySelectorAll("[data-cta-id]");
    var seen = {};
    var timers = new Map();

    function clear(el) {
      clearTimeout(timers.get(el));
      timers.delete(el);
    }

    var io = "IntersectionObserver" in window ? new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var el = entry.target;
        var id = el.dataset.ctaId;
        if (seen[id]) return;
        if (entry.isIntersecting && entry.intersectionRatio >= IMPRESSION_RATIO) {
          if (timers.has(el)) return;
          timers.set(el, setTimeout(function () {
            timers.delete(el);
            // 탭이 백그라운드면 노출로 치지 않음
            if (document.visibilityState !== "visible" || seen[id]) return;
            seen[id] = true;
            io.unobserve(el);
            send("cta_impression", el);
          }, IMPRESSION_MS));
        } else {
          clear(el);
        }
      });
    }, { threshold: [0, IMPRESSION_RATIO, 1] }) : null;

    els.forEach(function (el) {
      if (io) io.observe(el);
      el.addEventListener("click", function () { send("cta_click", el); });
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initCtaTracking);
  else initCtaTracking();
})();
