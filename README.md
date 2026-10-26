# 냠냠배달 랜딩 페이지 (학습용)

그로스 마케팅 학습을 위해 만든 **가상 배달앱 브랜드 "냠냠배달"**의 광고 랜딩 페이지입니다. 실존 기업·서비스와 무관합니다.

| 파일 | 타깃 | 핵심 오퍼 | 유입 채널 |
|---|---|---|---|
| `nyamnyam-club-landing.html` | 신규 / 1년 이상 미사용 고객 | 냠냠클럽(구독) 첫 달 무료 | 유튜브 광고, 배너 광고 |
| `1팀 냠냠 랜딩페이지.html` | 6개월 이상 미방문 이탈 고객 | 컴백 쿠폰팩 + 크리에이터 전용 할인 코드 | 유튜브 크리에이터 광고, 카카오·쿠팡·네이버 배너 |

## 주요 기능
- 모바일 우선 단일 컬럼 레이아웃, 하단 고정 CTA
- UTM 파라미터를 앱 딥링크로 전달 (채널별 전환 측정)
- `?creator=키` 로 크리에이터별 코드·문구 개인화 (winback 페이지)
- GTM `dataLayer` 이벤트: `lp_view`, `cta_click`, `store_click`, `scroll_depth`, `faq_open`, `calc_use`, `code_copy`

브라우저에서 HTML 파일을 바로 열어 확인할 수 있습니다.

## Amplitude 연동
1. `.env.example` 을 복사해 `.env` 를 만들고 키를 채웁니다. (`.env` 는 `.gitignore` 로 커밋되지 않음)
2. 설정 파일을 만듭니다: `node scripts/build-config.mjs` → `amplitude-config.js` 생성
3. 커밋·푸시하면 GitHub Pages에 반영됩니다.

- 브라우저에는 **API 키만** 들어갑니다. API 키는 이벤트 전송용 공개 키라 페이지에 노출돼도 되는 값입니다.
- **비밀 키(`AMPLITUDE_SECRET_KEY`)는 `.env` 에만** 두고, 웹페이지·저장소에는 절대 넣지 않습니다.
- 자동 수집: 페이지뷰, 세션, UTM 기반 유입 경로(attribution)
- 직접 보내는 이벤트: `lp_view`, `cta_click`, `store_click`, `scroll_depth`, `faq_open`, `calc_use`, `code_copy`, `index_card_click` (모든 이벤트에 `page` 속성 포함)
