# AGENTS.md

> 이 파일은 에이전트(Claude Code 등)가 trendingshorts(demo/v6)에서 작업할 때 따르는 규칙이다.
> Level 0 = 이 문서 자체 (tacit knowledge 외부화).
> Level 1 = 아래 "Autonomous Loop"를 에이전트가 스스로 돈다.

## 1. Project Context
- trendingshorts: 트렌딩 쇼츠/숏폼 콘텐츠 관련 프론트엔드 웹앱 (Vite 기반).
- 스택: JavaScript, Vite (dev/build), Vitest (test).
- 진입점: index.html
- 작업 위치: demo/v6
- 참고 문서: SPEC.md(스펙), MVP_PLAN.md(범위), ARCHITECTURE.md(구조), CONTEXT.md(현재 상황).
  → 작업 전에 이 문서들을 먼저 읽는다.

## 2. Commands (에이전트가 쓸 수 있는 명령)
<!-- package.json의 scripts와 다르면 실제 값으로 고쳐라 -->
- Install:  `npm install`
- Dev:      `npm run dev`
- Build:    `npm run build`
- Test:     `npm test`        # 루프의 종료 판정에 쓰임 (Vitest)
  - 한 번만 실행: `npx vitest run`
  - 특정 파일만: `npx vitest run tests/<파일>`

## 3. Conventions (암묵지 → 명문화)
<!-- TODO: "이건 나만 아는데" 싶은 걸 적어라. 그게 점수 포인트다. -->
- 코드 스타일:
- 컴포넌트/파일 구조 규칙:
- 디자인 관련 규칙:        <!-- 예: 틱톡 배지는 틱톡 브랜드 색상 사용 -->
- 절대 건드리면 안 되는 것:  <!-- 예: SPEC.md는 사람만 수정, /data 원본 -->
- 커밋 메시지 규칙:        <!-- 예: "v6: <한국어 요약>" -->

## 4. Autonomous Loop (Level 1)
**Goal (이번 루프 목표):**
<!-- TODO: 구체적인 한 가지. 예: "tests/ 에서 실패하는 테스트를 전부 통과시켜라" -->

**Loop:**
1. `npm test` 를 실행한다.
2. 실패가 있으면 실패 메시지를 읽고 원인을 추정한다.
3. src/ 안에서 최소한의 수정을 한다. (테스트 파일은 함부로 고치지 않는다)
4. 다시 1로 돌아간다.

**Exit conditions (이 중 하나면 멈춘다):**
- CLOSED: 모든 테스트 통과.
- STOP: 같은 실패가 연속 3회 반복 (무한루프 방지).
- STOP: 반복 10회 초과.

## 5. Security / Threat Constraints (Level 1-b)
<!-- 최소 1개를 실제로 적용하고, 제출 때 "내가 제약한 위협 1개"로 쓴다 -->
- **Allowlist (추천):** 다음 명령만 허용 → `npm test`, `npx vitest run`, `npm run build`, `git diff`, `git status`.
  - 금지: `git push`, `rm -rf`, `curl`/`wget`, `npm publish`, 외부 네트워크 접근.
- **Human gate:** `git commit` / `git push` 전에는 사람 확인을 받는다.
- **Scoped credential:** 실제 API 키는 주지 않고 더미 값만 사용.
- **Logging:** 모든 루프 반복(명령·출력·수정)을 loop.log 에 기록한다.

## 6. What NOT to do
- .env / secrets 파일을 열거나 출력하지 않는다.
- 사람 승인 전까지 remote(main 등)에 push하지 않는다.
- 위 Commands에 없는 임의의 셸 명령을 실행하지 않는다.
- tests/ 안의 테스트를 통과시키려고 테스트 자체를 무력화(skip/삭제)하지 않는다.
