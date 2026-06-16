# 동료 공유용 기능 코드 정리

> `feat/v8-next.js` 브랜치 React 컴포넌트로 이식할 때 참고하세요.
> 원본 파일: `app/public/demo.html`

---

## 목차
1. [크리에이터 유형 카드](#1-크리에이터-유형-카드)
2. [업로드 달력 트래커](#2-업로드-달력-트래커)

---

## 1. 크리에이터 유형 카드

**위치:** `demo.html` lines 7652–7854  
**화면:** `screen-v7-persona` (마이페이지 하단 챗봇 분석 섹션)

### 필요한 전역 상태

```js
// 챗봇 답변 배열 (순서 중요)
// cbAnswers[0] = 추천 카테고리 (만들고 싶은 것)
// cbAnswers[1] = 지속 가능한 컨텐츠 (꾸준히 할 수 있는 것)
// cbAnswers[2] = 잘하는 것 (강점)
// cbAnswers[3] = 타겟 오디언스 (봐줬으면 하는 사람)
// 각 항목 구조: { q: '질문 텍스트', a: '답변 텍스트' }
let cbAnswers = [];

// 온보딩 카테고리 선택 (없으면 fallback용)
// answers.categories = ['food', 'beauty', 'fitness', ...] 중 하나 이상
```

---

### 데이터: CREATOR_TYPES

```js
const CREATOR_TYPES = {
  explorer: {
    name: '탐험가형', emoji: '🧭', tag: 'EXPLORER',
    desc: '새로운 경험을 콘텐츠로 기록하는 크리에이터',
    traits: ['호기심 왕성', '현장감 있는 영상', '실행력 강함'],
    advice: '직접 경험한 것만 찍어도 충분해요. 진짜 반응이 최고의 콘텐츠예요.',
    keywords: ['여행', '맛집', '카페', '탐험', '체험', '투어', '나들이', '먹어', '가봤', '다녀'],
  },
  analyst: {
    name: '분석가형', emoji: '🔍', tag: 'ANALYST',
    desc: '깊이 있는 정보로 신뢰를 쌓는 크리에이터',
    traits: ['꼼꼼한 리뷰', '논리적 설명', '정보 신뢰도 높음'],
    advice: '한 주제를 깊게 파면 팬이 생겨요. 쇼츠는 핵심 1개만 전달하세요.',
    keywords: ['게임', '리뷰', '분석', '공부', '정보', '비교', '추천', '공략', '설명', '기술'],
  },
  storyteller: {
    name: '스토리텔러형', emoji: '📖', tag: 'STORYTELLER',
    desc: '감성적인 서사로 공감을 이끄는 크리에이터',
    traits: ['감성적 연출', '이야기 구성력', '공감대 형성'],
    advice: '일상의 작은 순간도 스토리로 만들 수 있어요. 감정이 담긴 영상이 오래 기억돼요.',
    keywords: ['일상', '브이로그', '이야기', '사진', '감성', '글', '일기', '기록', '순간', '추억'],
  },
  entertainer: {
    name: '엔터테이너형', emoji: '🎭', tag: 'ENTERTAINER',
    desc: '에너지와 재미로 시선을 사로잡는 크리에이터',
    traits: ['높은 에너지', '트렌드 민감', '빠른 편집 감각'],
    advice: '첫 3초가 전부예요. 강렬한 훅으로 시작하면 알고리즘이 밀어줘요.',
    keywords: ['재미', '유머', '웃음', '트렌드', '챌린지', '반응', '예능', '개그', '신나', '핫'],
  },
  expert: {
    name: '전문가형', emoji: '🎓', tag: 'EXPERT',
    desc: '한 분야의 깊은 지식을 나누는 크리에이터',
    traits: ['전문 지식', '신뢰도 높음', '충성 팬 형성'],
    advice: '이미 아는 것에서 시작하세요. 전문성은 가장 강력한 차별점이에요.',
    keywords: ['운동', '헬스', '요리', '뷰티', '패션', '코딩', '영어', '강사', '배운', '가르'],
  },
  connector: {
    name: '공감형', emoji: '🤝', tag: 'CONNECTOR',
    desc: '진심 어린 소통으로 팬과 연결되는 크리에이터',
    traits: ['감정 공감력', '소통 중심', '커뮤니티 형성'],
    advice: '댓글 하나하나가 콘텐츠 아이디어예요. 팬과 함께 만드는 채널을 지향하세요.',
    keywords: ['소통', '공감', '함께', '같이', '위로', '힘들', '고민', '친구', '응원', '커뮤'],
  },
};
```

---

### 함수 1: cbDeriveCreatorType()

cbAnswers 전체 텍스트에서 키워드 점수를 매겨 유형을 결정합니다.

```js
function cbDeriveCreatorType() {
  const allText = cbAnswers.map(a => a.a).join(' ');
  const scores = {};
  for (const [key, type] of Object.entries(CREATOR_TYPES)) {
    scores[key] = type.keywords.filter(kw => allText.includes(kw)).length;
  }
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);

  // 키워드 매칭 없으면 카테고리 기반 fallback
  if (sorted[0][1] === 0) {
    const catTypeMap = {
      food: 'expert', beauty: 'expert', fitness: 'expert',
      travel: 'explorer', game: 'analyst', fashion: 'explorer'
    };
    const cat = answers.categories[0] || '';
    return CREATOR_TYPES[catTypeMap[cat] || 'storyteller'];
  }
  return CREATOR_TYPES[sorted[0][0]];
}
```

---

### 함수 2: cbPersonalAnalysis(ct)

유형(ct)과 실제 챗봇 답변을 섞어 개인화된 3문장 분석을 생성합니다.

```js
function cbPersonalAnalysis(ct) {
  const want     = cbAnswers[0]?.a.trim() || '';  // 추천 카테고리
  const sustain  = cbAnswers[1]?.a.trim() || '';  // 지속 가능한 컨텐츠
  const strength = cbAnswers[2]?.a.trim() || '';  // 잘하는 것
  const target   = cbAnswers[3]?.a.trim() || '';  // 타겟 오디언스
  const typeKey  = Object.keys(CREATOR_TYPES).find(k => CREATOR_TYPES[k] === ct) || 'storyteller';

  const sentences = [];

  // 1문장: want + strength 조합
  if (want && strength) {
    sentences.push(`<strong>${want}</strong>을 만들고 싶은 데다 <strong>${strength}</strong>까지 갖췄으니, ${ct.name} 유형 중에서도 가능성이 높아요.`);
  } else if (want) {
    sentences.push(`<strong>${want}</strong>을 콘텐츠로 담고 싶다는 게 이미 좋은 출발점이에요.`);
  } else if (strength) {
    sentences.push(`<strong>${strength}</strong>는 ${ct.name}에게 가장 중요한 능력이에요.`);
  }

  // 2문장: sustain (지속 가능 소재)
  if (sustain) {
    const sustainMap = {
      explorer:    `<strong>${sustain}</strong>처럼 직접 경험할 수 있는 소재는 탐험가형에게 완벽한 재료예요.`,
      analyst:     `<strong>${sustain}</strong>를 꾸준히 파고들면 그 분야에서 신뢰받는 채널이 될 수 있어요.`,
      storyteller: `<strong>${sustain}</strong>에서 감성적인 서사를 찾아내는 게 스토리텔러형의 핵심이에요.`,
      entertainer: `<strong>${sustain}</strong>도 재미있게 풀어내면 알고리즘이 밀어주는 콘텐츠가 돼요.`,
      expert:      `<strong>${sustain}</strong>를 꾸준히 쌓아가면 그게 곧 전문성이 돼요.`,
      connector:   `<strong>${sustain}</strong>를 진심으로 나누면 비슷한 고민을 가진 사람들이 모여들어요.`,
    };
    sentences.push(sustainMap[typeKey] || `<strong>${sustain}</strong>처럼 꾸준히 할 수 있는 소재가 있다는 게 큰 장점이에요.`);
  }

  // 3문장: target 오디언스
  if (target) {
    const targetMap = {
      explorer:    `<strong>${target}</strong>에게는 '직접 가봤어요' 한마디가 가장 강력한 훅이에요.`,
      analyst:     `<strong>${target}</strong>에게는 핵심만 콕 집어주는 짧은 영상이 최고예요.`,
      storyteller: `<strong>${target}</strong>의 마음을 움직이려면 진짜 감정이 담겨야 해요.`,
      entertainer: `<strong>${target}</strong>의 눈길을 잡으려면 첫 3초가 모든 걸 결정해요.`,
      expert:      `<strong>${target}</strong>에게는 '몰랐던 사실'을 알려줄 때 신뢰가 쌓여요.`,
      connector:   `<strong>${target}</strong>의 이야기를 먼저 들어주는 콘텐츠가 팬을 만들어요.`,
    };
    sentences.push(targetMap[typeKey] || `<strong>${target}</strong> 타겟이라면 — ${ct.advice}`);
  } else {
    sentences.push(ct.advice);
  }

  return sentences.join('<br><br>');
}
```

---

### 함수 3: cbIsInsufficient()

답변이 너무 짧거나 모호하면 `true` 반환 → 카드 대신 "다시 하기" 메시지 표시.

```js
function cbIsInsufficient() {
  if (cbAnswers.length < 4) return true;
  const vagueWords = ['없음', '모름', '몰라', '모르겠', '없어', '그냥', '??', '...', 'ㅋ', 'ㅎ', '글쎄'];
  const vagueCnt = cbAnswers.filter(a => {
    const v = a.a.trim();
    return v.length < 4 || vagueWords.some(w => v.includes(w));
  }).length;
  return vagueCnt >= 2;
}
```

---

### 렌더링 로직 (React로 이식 시 참고)

```js
// 호출 위치: 마이페이지 챗봇 분석 섹션 마운트 시 또는 cbAnswers 변경 시

if (cbAnswers.length === 0) {
  // insightEl.style.display = 'none'  → 섹션 자체를 숨김
} else if (cbIsInsufficient()) {
  // "크리에이터 유형을 분석하기 어려워요" 카드 표시
  // 버튼 클릭 → 챗봇 화면으로 이동
} else {
  const ct = cbDeriveCreatorType();
  // CREATOR TYPE 카드 렌더링:
  //   ct.name, ct.desc, ct.traits (칩), cbPersonalAnalysis(ct) (개인화 분석)
  // YOUR ANSWERS 카드 렌더링:
  //   shortQs = ['추천 카테고리', '지속 가능한 컨텐츠', '잘하는 것', '타겟 오디언스']
  //   cbAnswers.map((item, i) => shortQs[i] + ': ' + item.a)
}
```

### CREATOR TYPE 카드 HTML 구조

```html
<!-- CREATOR TYPE 카드 -->
<div style="background:linear-gradient(135deg,rgba(200,255,87,0.08),rgba(56,182,255,0.05));
            border:1px solid rgba(200,255,87,0.22); border-radius:16px; padding:18px; margin-bottom:12px;">
  <div style="font-family:monospace; font-size:10px; color:var(--primary);
              letter-spacing:0.1em; margin-bottom:12px;">CREATOR TYPE</div>
  <div style="margin-bottom:14px;">
    <div style="font-size:20px; font-weight:800; color:var(--ink);
                letter-spacing:-0.03em; line-height:1.2;">{ct.name}</div>
    <div style="font-size:11px; color:var(--gray); margin-top:4px; line-height:1.4;">{ct.desc}</div>
  </div>
  <!-- 특성 칩 -->
  <div style="display:flex; gap:6px; flex-wrap:wrap; margin-bottom:14px;">
    {ct.traits.map(t => (
      <span style="font-size:11px; font-weight:600; color:var(--primary);
                   background:rgba(200,255,87,0.08); border:1px solid rgba(200,255,87,0.2);
                   border-radius:999px; padding:4px 11px;">{t}</span>
    ))}
  </div>
  <!-- 개인화 분석 텍스트 (HTML 포함) -->
  <div style="font-size:12px; color:var(--gray); line-height:1.8;
              background:rgba(255,255,255,0.03); border-radius:10px;
              padding:12px 14px; border-left:2px solid var(--primary);"
       dangerouslySetInnerHTML={{ __html: cbPersonalAnalysis(ct) }} />
</div>

<!-- YOUR ANSWERS 카드 -->
<div style="background:var(--bg-card); border:1px solid var(--line);
            border-radius:14px; padding:14px;">
  <div style="font-family:monospace; font-size:10px; color:var(--gray);
              letter-spacing:0.08em; margin-bottom:12px;">YOUR ANSWERS</div>
  {cbAnswers.map((item, i) => (
    <div key={i} style={{ marginBottom: i < cbAnswers.length-1 ? '10px' : 0,
                           paddingBottom: i < cbAnswers.length-1 ? '10px' : 0,
                           borderBottom: i < cbAnswers.length-1 ? '1px solid var(--line)' : 'none' }}>
      <div style="font-size:10px; color:var(--gray); margin-bottom:3px;">
        {['추천 카테고리','지속 가능한 컨텐츠','잘하는 것','타겟 오디언스'][i]}
      </div>
      <div style="font-size:13px; color:var(--ink); font-weight:600; line-height:1.45;">{item.a}</div>
    </div>
  ))}
</div>
```

---

---

## 2. 업로드 달력 트래커

**위치:** `demo.html` lines 8251–8371 (JS) + lines 5941–5964 (HTML) + lines 2269–2287 (CSS)  
**화면:** `screen-mypage` (마이페이지 내 채널 성장 섹션 하단)

### 필요한 전역 상태

```js
const uploadCalendar = {};  // 'YYYY-MM-DD' → Set<'tiktok'|'instagram'|'youtube'>
let calYear  = new Date().getFullYear();
let calMonth = new Date().getMonth();   // 0-indexed
let calPlatform = 'tiktok';             // 현재 선택된 플랫폼 (클릭 시 기록)

const CAL_COLORS = { tiktok: '#5CE1E6', instagram: '#FF4274', youtube: '#FF5555' };
const CAL_ACTIVE = { tiktok: 'active-tt', instagram: 'active-ig', youtube: 'active-yt' };
const CAL_LABELS = { tiktok: '틱톡',     instagram: '인스타',    youtube: '유튜브' };
```

---

### CSS 클래스

```css
.cal-header        { display:flex; align-items:center; justify-content:space-between; margin-bottom:12px; }
.cal-nav-btn       { background:none; border:none; color:var(--ink-soft); font-size:18px; cursor:pointer; padding:4px 8px; line-height:1; border-radius:8px; }
.cal-nav-btn:active{ background:var(--bg-card); }
.cal-month-label   { font-size:13px; font-weight:700; color:var(--ink); }
.cal-plat-row      { display:flex; gap:6px; margin-bottom:12px; }
.cal-plat-btn      { flex:1; padding:5px 0; font-size:11px; font-weight:600; border-radius:20px; border:1.5px solid var(--line); background:none; color:var(--gray); cursor:pointer; transition:all .2s; }
.cal-plat-btn.active-tt { border-color:#5CE1E6; color:#5CE1E6; background:rgba(92,225,230,.1); }
.cal-plat-btn.active-ig { border-color:#FF4274; color:#FF4274; background:rgba(255,66,116,.1); }
.cal-plat-btn.active-yt { border-color:#FF5555; color:#FF5555; background:rgba(255,85,85,.1); }
.cal-day-headers   { display:grid; grid-template-columns:repeat(7,1fr); text-align:center; margin-bottom:4px; }
.cal-day-hdr       { font-size:9px; color:var(--gray); font-family:monospace; padding:2px 0; }
.cal-grid          { display:grid; grid-template-columns:repeat(7,1fr); gap:3px; }
.cal-cell          { aspect-ratio:1; border-radius:50%; border:none; background:none; cursor:pointer;
                     display:flex; flex-direction:column; align-items:center; justify-content:center;
                     font-size:11px; color:var(--ink); position:relative; transition:background .15s; gap:1px; }
.cal-cell:active   { opacity:.7; }
.cal-cell.today    { border:1.5px solid var(--primary); color:var(--primary); font-weight:700; }
.cal-cell.empty    { pointer-events:none; }
```

---

### HTML 구조

```html
<div style="margin:4px 16px 16px; background:var(--bg-card); border-radius:16px; padding:16px; border:1px solid var(--line);">
  <!-- 월 네비게이션 -->
  <div class="cal-header">
    <button class="cal-nav-btn" onclick="changeCalMonth(-1)">‹</button>
    <div id="cal-month-label" class="cal-month-label">2025년 6월</div>
    <button class="cal-nav-btn" onclick="changeCalMonth(1)">›</button>
  </div>

  <!-- 플랫폼 선택 버튼 -->
  <div class="cal-plat-row">
    <button class="cal-plat-btn active-tt" id="cal-btn-tiktok"     onclick="selectCalPlatform('tiktok')">틱톡</button>
    <button class="cal-plat-btn"           id="cal-btn-instagram"  onclick="selectCalPlatform('instagram')">인스타</button>
    <button class="cal-plat-btn"           id="cal-btn-youtube"    onclick="selectCalPlatform('youtube')">유튜브</button>
  </div>

  <!-- 요일 헤더 -->
  <div class="cal-day-headers">
    <div class="cal-day-hdr" style="color:#FF6B6B;">일</div>
    <div class="cal-day-hdr">월</div>
    <div class="cal-day-hdr">화</div>
    <div class="cal-day-hdr">수</div>
    <div class="cal-day-hdr">목</div>
    <div class="cal-day-hdr">금</div>
    <div class="cal-day-hdr" style="color:#6BA3FF;">토</div>
  </div>

  <!-- 날짜 그리드 (JS로 채움) -->
  <div id="cal-grid" class="cal-grid"></div>

  <!-- 이번 달 업로드 횟수 범례 (JS로 채움) -->
  <div id="cal-legend" style="display:flex; gap:10px; margin-top:10px; flex-wrap:wrap;"></div>
</div>
```

---

### 함수들

```js
function renderCalendar() {
  const label = document.getElementById('cal-month-label');
  if (!label) return;
  label.textContent = calYear + '년 ' + (calMonth + 1) + '월';

  const grid = document.getElementById('cal-grid');
  grid.innerHTML = '';

  const today     = new Date().toISOString().split('T')[0];
  const firstDay  = new Date(calYear, calMonth, 1).getDay();       // 0=일
  const daysInMonth = new Date(calYear, calMonth + 1, 0).getDate();

  // 첫 주 빈 칸
  for (let i = 0; i < firstDay; i++) {
    const blank = document.createElement('div');
    blank.className = 'cal-cell empty';
    grid.appendChild(blank);
  }

  // 날짜 셀
  for (let d = 1; d <= daysInMonth; d++) {
    const mm      = String(calMonth + 1).padStart(2, '0');
    const dd      = String(d).padStart(2, '0');
    const dateStr = `${calYear}-${mm}-${dd}`;
    const plats   = uploadCalendar[dateStr] ? [...uploadCalendar[dateStr]] : [];

    const cell = document.createElement('button');
    cell.className = 'cal-cell';
    cell.style.flexDirection = 'column';
    cell.style.gap = '1px';

    // 날짜 숫자
    const num = document.createElement('span');
    num.textContent = d;
    if (plats.length === 1)      { num.style.color = CAL_COLORS[plats[0]]; num.style.fontWeight = '700'; }
    else if (plats.length > 1)   { num.style.fontWeight = '700'; }
    cell.appendChild(num);

    // 플랫폼 점
    if (plats.length > 0) {
      const dotsRow = document.createElement('div');
      dotsRow.style.cssText = 'display:flex; gap:2px; justify-content:center;';
      plats.forEach(p => {
        const dot = document.createElement('div');
        dot.style.cssText = `width:3px; height:3px; border-radius:50%; background:${CAL_COLORS[p]}`;
        dotsRow.appendChild(dot);
      });
      cell.appendChild(dotsRow);
      cell.style.background = plats.length === 1 ? CAL_COLORS[plats[0]] + '22' : 'rgba(255,255,255,0.07)';
    }

    // 현재 선택 플랫폼 링 표시
    if (plats.includes(calPlatform)) {
      cell.style.boxShadow = `0 0 0 1.5px ${CAL_COLORS[calPlatform]}`;
    }

    if (dateStr === today) cell.classList.add('today');

    // 클릭 → 해당 날짜에 현재 플랫폼 토글
    cell.onclick = () => {
      if (!uploadCalendar[dateStr]) uploadCalendar[dateStr] = new Set();
      if (uploadCalendar[dateStr].has(calPlatform)) {
        uploadCalendar[dateStr].delete(calPlatform);
        if (uploadCalendar[dateStr].size === 0) delete uploadCalendar[dateStr];
      } else {
        uploadCalendar[dateStr].add(calPlatform);
      }
      renderCalendar();
    };

    grid.appendChild(cell);
  }

  // 범례: 이번 달 플랫폼별 업로드 횟수
  const legend = document.getElementById('cal-legend');
  legend.innerHTML = '';
  const counts = { tiktok: 0, instagram: 0, youtube: 0 };
  Object.entries(uploadCalendar).forEach(([date, platSet]) => {
    const [y, m] = date.split('-');
    if (parseInt(y) === calYear && parseInt(m) === calMonth + 1) {
      platSet.forEach(p => counts[p]++);
    }
  });
  ['tiktok', 'instagram', 'youtube'].forEach(p => {
    if (counts[p] === 0) return;
    const item = document.createElement('div');
    item.style.cssText = `display:flex; align-items:center; gap:4px; font-size:10px; font-family:monospace; color:${CAL_COLORS[p]}`;
    item.innerHTML = `<span style="width:6px;height:6px;border-radius:50%;background:${CAL_COLORS[p]};display:inline-block;"></span>${CAL_LABELS[p]} ${counts[p]}회`;
    legend.appendChild(item);
  });
}

function changeCalMonth(dir) {
  calMonth += dir;
  if (calMonth < 0)  { calMonth = 11; calYear--; }
  if (calMonth > 11) { calMonth = 0;  calYear++; }
  renderCalendar();
}

function selectCalPlatform(platform) {
  calPlatform = platform;
  ['tiktok', 'instagram', 'youtube'].forEach(p => {
    const btn = document.getElementById('cal-btn-' + p);
    if (!btn) return;
    btn.className = 'cal-plat-btn' + (p === platform ? ' ' + CAL_ACTIVE[p] : '');
  });
  renderCalendar();
}

// 초기 렌더
renderCalendar();
```

---

### React 이식 시 핵심 포인트

**크리에이터 유형 카드:**
- `cbAnswers` 를 props 또는 전역 상태(zustand/context)로 받아야 함
- `cbPersonalAnalysis()` 반환값이 HTML 태그(`<strong>`) 포함 → `dangerouslySetInnerHTML` 사용
- `answers.categories` (온보딩 카테고리)도 fallback으로 필요

**업로드 달력:**
- `uploadCalendar` 를 `useState` 또는 zustand로 관리 (Set 직렬화 주의)
- DOM 직접 조작 → 전부 `useState` + JSX로 교체
- `calYear`, `calMonth`, `calPlatform` 모두 상태로 관리
- Set은 JSON.stringify 불가 → localStorage 저장 시 `Array.from(set)` 변환 필요
