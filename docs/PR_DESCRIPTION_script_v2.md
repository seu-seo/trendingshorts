# PR: feature/script — 대본 생성 프롬프트 v2 (데이터 기반 톤 결정)

## TL;DR

`feature/script` 영역의 프롬프트 모듈을 production-grade로 재작성합니다.
**API 계약(`ScriptRequest`/`ScriptResponse`)은 그대로 유지**하므로 `feature/recommend`
(규동) 호출부는 무수정.

핵심 변경: typeIndex 기반 임의 매핑 → reference 메트릭과 페르소나 styles에서 도출한
**데이터 신호 기반 톤 결정**, 그리고 3톤 병렬 호출 → **단일 호출** (비용 1/3).

## 변경 요약

| 영역 | v1 (이전) | v2 (이번 PR) |
|---|---|---|
| 톤 결정 근거 | `recommendedToneByType(typeIndex)` (의미 충돌) | `recommendTone(ref, persona)` 데이터 신호 6종 |
| LLM 호출 횟수 | 톤별 3회 병렬 | 1회 (3톤 동시 생성) |
| `styles` 필드 활용 | 페르소나 분석에만 사용 | 톤 결정·CTA 어조에 직접 반영 |
| 인게이지먼트 수치 영향 | UI 표시만, 결과 무관 | 톤 추천 + CTA 가중치에 직접 반영 |
| 톤 추천 근거 노출 | 없음 | `meta.toneSignals` 로 사용자에게 노출 가능 |
| 출력 검증 | `parseScript` 단순 파싱 | `parseAllScripts` strict schema |
| 환경변수 검증 | 없음 | 라우트 시작 시 검증, 명확한 오류 메시지 |
| 프롬프트 메타데이터 | 없음 | `PROMPT_METADATA.version` (A/B 추적용) |

## 해결된 이슈 매핑

규동님의 5/4 정합성 분석 5건 중 본 PR이 해결한 항목 (`spec_main.md` 기준):

- ✅ **#3 typeIndex 의미 충돌**: `recommendedToneByType`는 deprecated 표시만 남기고
  실제 추천은 `recommendTone()` 가 담당. typeIndex는 onboarding accent 색상 결정용으로만.
- ✅ **#4 styles 필드 미반영**: `ExtendedScriptRequest.persona.styles` 필드를 받아
  톤 결정 가중치(`scoreInformative`/`scoreStory`/`scoreHooking`)에 직접 적용.
  미전달 시 기존 동작과 호환.
- ⚠️ **#1 카테고리 불일치**: 본 PR에서는 `reference.category` 한국어 카테고리 14개
  체계를 시스템 프롬프트가 인식하도록 패턴 매칭. 송신 측(onboarding 영문 6개) 매핑은
  지은님 PR 대기 중.
- ⚠️ **#2 페르소나-대시보드 미연결**: 본 PR 영역 외. 대시보드 진입 시 페르소나 필터
  적용은 승연님 영역.

5/4 클로드 코드 리뷰 3건:

- ✅ **3개 톤 동시 출력 부담**: 응답 형태는 유지(클라이언트 호환)하되, `recommendedTone`
  + `meta.toneSignals` 로 1순위와 그 근거를 명확히 표시. UI에서 1순위를 기본 선택으로
  표시하면 "감으로 고르는" 패턴 해소.
- ✅ **API key UI 안내 부정확**: 키는 서버 환경변수만 사용. 클라이언트 노출 0.
  미설정 시 명확한 500 응답 + hint 제공.
- ✅ **인게이지먼트 수치 미반영**: `engagement_rate`, `category_avg_engagement`,
  `growth`, `comments/likes ratio` 가 모두 톤 추천 점수에 직접 들어감.

## 변경 파일

```
web/src/lib/script.ts                MODIFIED  (+207, -65)
web/src/app/api/script/route.ts      MODIFIED  (+85,  -27)
```

## 핵심 설계 결정

### 1. API 계약 무변경 → 다른 팀원 코드 영향 없음

`ScriptRequest`, `ScriptResponse`, `ScriptTone`, `ScriptOutput` 모두 그대로.
`feature/recommend` 의 호출부 변경 불필요.

확장만 했음: `meta` 필드가 추가됐지만 옵셔널이라 기존 클라이언트는 무시 가능.
`persona.styles`, `persona.followerCount` 도 옵셔널 — 미전달 시 기존 동작과 동일.

### 2. 데이터 신호 6종으로 톤 결정

```
신호 1: 인게이지먼트가 카테고리 평균 +30% 초과 → hooking +25
신호 2: 댓글/좋아요 비율 ≥ 15% → informative +20 (토론 신호)
신호 3: 24h 성장률 > 30% → hooking +20 (emerging 트렌드)
신호 4: 카테고리 매칭 (테크/뷰티/교육 → informative, 일상/펫/먹방 → story)
신호 5: 페르소나 styles (education → informative, emotion → story, humor → hooking)
신호 6: 팔로워 < 1K → hooking +10 (어텐션 확보 단계)
```

근거 신호는 `meta.toneSignals` 로 응답에 포함되어 사용자가 확인 가능.
"왜 이 톤이 추천됐나"가 투명함 = "데이터로 결정" 매니페스토 가치 준수.

### 3. 단일 LLM 호출

기존 `Promise.allSettled([3 calls])` → `generateText({ ... 3 tones in JSON })`.
- 비용: 시스템 프롬프트 3회 전송 → 1회 전송 (input 토큰 1/3)
- 일관성: 3톤이 같은 컨텍스트에서 생성 → 톤 간 차별점이 명확
- 지연: 병렬이 아니어도 단일 호출이 더 빠른 경우가 많음 (네트워크 RTT 1회)

### 4. 한국 숏폼 컨벤션을 시스템 프롬프트에 인코딩

- 13음절 이하 훅 (한국어 발화 0.8초 기준)
- 팔로워 < 1K → 댓글 유도 CTA, 1K-10K → 저장·공유 유도 (알고리즘 고려)
- OSMU 변형 가이드 (YouTube Shorts 메인, Reels/TikTok 변형 권장사항)

## 테스트

```bash
cd web
# .env.local 에 ANTHROPIC_API_KEY 설정 후
npm run dev

# 다른 터미널
curl -X POST http://localhost:3000/api/script \
  -H "Content-Type: application/json" \
  -d '{
    "direction": "에이카랩스 어린이 치약을 트렌드에 맞춰 소개",
    "reference": {
      "id": 1,
      "platform": "youtube",
      "title": "3000원 차이로 효과 2배인 치약 비교",
      "creator": "치약덕후",
      "views": 184000,
      "likes": 12400,
      "comments": 2100,
      "shares": 800,
      "category": "뷰티",
      "subcategory": "오럴케어",
      "growth": 42,
      "duration": "0:48",
      "thumbnail": "",
      "trending_since": "2026-05-07",
      "tags": ["#치약비교", "#오럴케어"],
      "engagement_rate": 7.9,
      "category_avg_engagement": 4.2
    },
    "persona": {
      "personaType": "THE NICHE KING",
      "typeIndex": 1,
      "styles": ["education", "authenticity"],
      "followerCount": 3200
    }
  }'
```

기대 결과:
- `recommendedTone` 가 `informative` 또는 `hooking` (인게이지먼트 +88% + 성장률 +42% 신호)
- `meta.toneSignals` 에 6개 신호 중 매칭된 것들이 명시
- `scripts.informative.hook` 가 13-16음절 이내
- 3톤 모두 본문 300-400자

## 머지 전 체크리스트

- [x] `npm run lint` 통과
- [x] `tsc --noEmit` 통과
- [x] `ScriptRequest`/`ScriptResponse` 계약 유지 (호출부 무변경)
- [x] `recommendedToneByType` deprecated 처리 (즉시 제거 X, v2.1에서 제거)
- [ ] `feature/recommend` 통합 테스트 (규동님 확인 필요)
- [ ] 5/10 교수님 오피스아워 피드백 반영 (필요 시 v2.1 hotfix)

## 다음 단계 (이 PR 이후)

1. **5/10 오피스아워**: 톤 결정 신호 가중치가 비즈니스적으로 타당한지 검증
2. **5/12-15**: 에이카랩스 마케터 대상 출력 정성 평가
3. **5/16 피어리뷰 발표**: v2 결과물로 시연
4. **Post-피어리뷰**: 톤 추천 정확도 eval — 입력 50개 샘플에 대해 마케터 정답 vs LLM 추천 일치율

## Reviewers

@kyudong-aikalabs — 백엔드/구조 정합성 (Next.js, 타입 호환성, recommend 통합)
@seu-seo — 대시보드 인터페이스 호환성 (TrendItem 사용)
@haebojagu — 페르소나 인터페이스 호환성 (styles 필드)

---

작성: @kaist9558 (조경재)
작성일: 2026-05-09
프롬프트 버전: 2.0.0
