# v7 테마 시스템 개발 가이드

v7 리디자인의 색/스타일은 **하나의 출처(SSOT)** 에서 관리합니다. 이 문서는
테마 토큰 시스템의 구조와, 기존 화면을 테마에 연결하는 마이그레이션 방법을 설명합니다.

대상 시안: **A 인디고 / B 볼드 / C 퍼플** (모두 라이트 테마). A·C는 구조가 같고
primary 색만 다른 "팔레트 스왑" 관계이며, **B는 색뿐 아니라 구조(각진 모서리, 굵은
테두리, 오프셋 그림자)까지 다른 별개 디자인 언어**입니다. 그래서 토큰에는 색뿐
아니라 구조 토큰이 함께 들어갑니다.

---

## 0. 현재 구축된 것

| 파일 | 역할 |
|------|------|
| `app/lib/themes/themes.json` | indigo/purple/bold 테마 토큰(색 16 + 구조 7) 정의 |
| `app/lib/themes/types.ts` | `ThemeName` / `Theme` / `Themes` 타입 (json 구조와 1:1) |
| `app/app/globals.css` | 기존 다크 `:root` + v7 `[data-theme="…"]` 3블록 |

> 기존 다크 테마(`:root`의 `--bg`, `--accent-lime` 등)는 **그대로 유지**되며,
> v7 토큰은 `--color-*` / 구조 토큰 네임스페이스를 써서 충돌하지 않습니다.

---

## 1. 시맨틱 토큰 (색을 "용도"로 추상화)

원시 색(`indigo-600`)이 아니라 역할로 정의합니다. **B 때문에 색 토큰만으로는
부족하므로 구조 토큰을 반드시 포함**합니다.

- 색 토큰: `bg`, `surface`, `soft`, `tint`, `border`, `border2`,
  `ink`, `ink2`, `ink3`, `primary`, `primaryDeep`, `primarySoft`, `primaryMid`,
  `up`, `hot`, `warm`
- 구조 토큰: `radius`, `radiusLg`, `radiusXl`, `borderWidth`,
  `shadow`, `shadowCta`, `pageGrad`

CSS 변수 매핑명: `--color-bg`, `--color-primary`, … / `--radius`, `--border-width`,
`--shadow`, `--page-grad` 등.

> B 볼드는 데모에 `tint`/`primarySoft`/`primaryMid`가 없어 충실한 파생값으로
> 채워져 있습니다(tint=soft, primaryMid=lime-deep, primarySoft=옅은 라임). PoC에서
> 어색하면 `themes.json`에서 조정하세요.

## 2. 테마는 JSON으로 정의 → CSS 변수로 주입

`themes.json`이 진실의 원천입니다. 런타임에는 `<html data-theme="indigo">` 처럼
속성만 바꾸면 `globals.css`의 해당 `[data-theme]` 블록이 `--color-*` 변수 세트를
교체합니다. 테마 전환 = `data-theme` 값 변경 한 줄.

```css
[data-theme="indigo"] { --color-primary:#4F46E5; --radius:16px; /* … */ }
[data-theme="bold"]   { --color-primary:#D4F500; --radius:0px; --border-width:2px;
                        --shadow:6px 6px 0 #141414; --page-grad:none; }
```

## 3. tailwind.config.ts를 변수 참조로 전환

현재 tailwind는 색을 하드코딩 hex로 중복 정의합니다. 이를 변수 참조로 바꾸면
유틸 클래스가 자동으로 테마를 따라갑니다.

```ts
// 예시 (구현 시)
colors: { primary: 'var(--color-primary)', surface: 'var(--color-surface)' }
```

→ `bg-primary`, `text-ink` 같은 클래스가 테마에 반응. (색의 소스가 하나로 합쳐짐)

## 4. 인라인 hex 마이그레이션

tsx에 직접 박힌 `#C8FF57` 같은 리터럴(수십 곳)을 시맨틱 토큰/클래스로 치환합니다.
가장 노동집약적인 단계라 **화면 단위로 점진 진행**을 권장합니다.

## 5. 권장 순서

1. (완료) 토큰 설계 — `themes.json` + `[data-theme]` 블록 + 타입
2. 테마 적용 헬퍼/스위처 (`data-theme` 토글, 기본값 지정)
3. **A·C 먼저** 화면 연결 (팔레트 스왑이라 쉬움)
4. tailwind를 변수 참조로 전환
5. 화면별 인라인 hex 치환
6. **B 볼드 마지막** — 색 외 구조 토큰(테두리/그림자/모서리)까지 반영해야 함

---

## 참고

- 활성 앱은 `app/` 기준 (App Router, Next.js 14.2.5).
- 새 색이 필요하면 tsx에 hex를 박지 말고 `themes.json`에 토큰을 추가하세요.
