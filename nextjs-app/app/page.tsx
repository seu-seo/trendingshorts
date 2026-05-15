'use client';

import { useEffect, useRef } from 'react';

const BODY_HTML = `<button class="reset-btn" onclick="resetDemo()">↺ RESET</button>

<div class="phone">
  <div class="statusbar">
    <span>9:41</span>
    <span class="right">●●● 📶 100%</span>
  </div>

  <!-- ============ INTRO / SPLASH ============ -->
  <div class="screen active" id="screen-intro">
    <div class="splash">
      <div class="splash-logo">
        <span class="splash-dot">
          <span class="splash-ripple"></span>
          <span class="splash-ripple ripple-delay"></span>
        </span>
        <span class="splash-text">SHORTFORM PULSE</span>
      </div>
    </div>
  </div>

  <!-- ============ QUESTIONS ============ -->
  <div class="screen" id="screen-question">
    <div class="q-screen">
      <div class="q-header">
        <span class="q-counter" id="q-counter">QUESTION 01 / 08</span>
        <button class="q-skip" id="q-skip-btn" onclick="skipToDemo()">DEMO SKIP →</button>
      </div>
      <div class="q-progress">
        <div class="q-progress-fill" id="q-progress-fill" style="width:12.5%;"></div>
      </div>

      <p class="q-intro-helper" id="q-intro-helper">
        7개의 질문으로 당신의 <span class="hl-white">페르소나</span>를 찾아드려요
      </p>

      <h2 class="q-title" id="q-title">주로 활동하는<br>플랫폼은?</h2>
      <p class="q-hint" id="q-hint">하나만 선택해주세요</p>

      <div id="q-body"></div>
    </div>

    <div class="q-nav">
      <button class="q-back" onclick="prevQuestion()">BACK</button>
      <button class="q-next" id="q-next-btn" onclick="nextQuestion()" disabled>NEXT →</button>
    </div>
  </div>

  <!-- ============ LOADING ============ -->
  <div class="screen" id="screen-loading">
    <div class="loading">
      <div class="loading-status">ANALYZING</div>
      <h2 class="loading-title">
        <span class="accent">페르소나</span><br>
        매칭 중...
      </h2>
      <p class="loading-sub">RESPONSES → STYLE → PERSONA → READY</p>

      <div class="loading-steps" id="loading-steps">
        <div class="loading-step" data-step="0">
          <span>설문 응답 분석</span>
          <span class="status">···</span>
        </div>
        <div class="loading-step" data-step="1">
          <span>카테고리 · 스타일 분류</span>
          <span class="status">···</span>
        </div>
        <div class="loading-step" data-step="2">
          <span>페르소나 매칭</span>
          <span class="status">···</span>
        </div>
        <div class="loading-step" data-step="3">
          <span>추천 준비</span>
          <span class="status">···</span>
        </div>
      </div>
    </div>
  </div>

  <!-- ============ RESULT (persona reveal + intent picker) ============ -->
  <div class="screen" id="screen-result">
    <div class="result">
      <div class="result-eyebrow">YOUR PERSONA</div>

      <div class="result-card" id="result-card">
        <div class="result-tag" id="result-tag">TYPE 00</div>
        <div class="result-name" id="result-name">THE TRENDSETTER</div>
        <div class="result-line" id="result-line">트렌드 감각으로 선점하는 타입</div>
      </div>

      <div class="result-meta" id="result-meta">
        <!-- platform / category / goal pills, populated by JS -->
      </div>

      <div class="result-prompt">
        <div class="result-prompt-label">지금 가장 필요한 건?</div>
        <div class="result-prompt-hint">선택하면 바로 안내해드려요</div>
      </div>

      <div class="result-chips">
        <button class="result-chip chip-lime" type="button" onclick="pickIntent('explore')">
          <span class="result-chip-label">숏폼 트렌드</span>
          <span class="result-chip-desc">뭘 만들지 모르겠어</span>
        </button>
        <button class="result-chip chip-pink" type="button" onclick="pickIntent('reference')">
          <span class="result-chip-label">인플루언서</span>
          <span class="result-chip-desc">누가 잘하는지 보고 싶어</span>
        </button>
        <button class="result-chip chip-blue" type="button" onclick="pickIntent('produce')">
          <span class="result-chip-label">콘티 추천</span>
          <span class="result-chip-desc">바로 만들기 시작하고 싶어</span>
        </button>
      </div>
    </div>
  </div>

  <!-- ============ DASHBOARD TAB (트렌드 확인) ============ -->
  <div class="screen has-tabbar" id="screen-dashboard">
    <div class="tab-screen">
      <div class="tab-top">
        <div class="tab-eyebrow">YOUR DASHBOARD</div>
        <h2 class="tab-title" id="dash-title">FOOD<br><span class="accent-blue">TRENDS</span></h2>
        <p class="tab-sub">이번 주 카테고리 TOP 영상</p>
      </div>

      <div class="dash-section">
        <div class="section-head">
          <span class="section-label">🏆 TOP 3 영상</span>
          <span class="section-meta" id="dash-platform">YouTube</span>
        </div>
        <div class="video-list" id="dash-videos"></div>
      </div>

      <div class="dash-section">
        <div class="section-head">
          <span class="section-label">🔍 주요 키워드 분석</span>
          <span class="gemini-pill">GEMINI AI</span>
        </div>
        <div class="keyword-cloud" id="dash-keywords"></div>
        <div class="insight-box" id="dash-insight">
          <div class="insight-label">TREND INSIGHT</div>
          <div class="insight-text">키워드를 분석 중입니다...</div>
        </div>
      </div>
    </div>
  </div>

  <!-- ============ TRENDS TAB (인플루언서 추천) ============ -->
  <div class="screen has-tabbar" id="screen-trends">
    <div class="tab-screen">
      <div class="tab-top">
        <div class="tab-eyebrow">CREATOR REFERENCES</div>
        <h2 class="tab-title">INFLU<br><span class="accent-gradient">ENCERS</span></h2>
        <p class="tab-sub">참고할 만한 크리에이터</p>
      </div>

      <div class="creator-list" id="trends-creators"></div>
    </div>
  </div>

  <!-- ============ CONTI TAB (제작 도움) ============ -->
  <div class="screen has-tabbar" id="screen-conti">
    <div class="tab-screen">
      <!-- Stage 1: Survey -->
      <div id="conti-stage-survey" class="conti-stage active">
        <div class="tab-top">
          <div class="tab-eyebrow">PRODUCTION</div>
          <h2 class="tab-title">영상<br><span class="accent-lime">방향</span> 설문</h2>
          <p class="tab-sub">3개 질문으로 맞춤 콘티를 만들어요</p>
        </div>

        <div class="conti-q">
          <div class="conti-q-label">Q1. 어떤 분위기?</div>
          <div class="conti-q-opts" data-q="mood">
            <button class="conti-opt" data-v="energetic">활기찬</button>
            <button class="conti-opt" data-v="cozy">아늑한</button>
            <button class="conti-opt" data-v="humorous">유머러스</button>
            <button class="conti-opt" data-v="info">정보 중심</button>
          </div>
        </div>

        <div class="conti-q">
          <div class="conti-q-label">Q2. 영상 길이</div>
          <div class="conti-q-opts" data-q="length">
            <button class="conti-opt" data-v="short">쇼츠 (15-30s)</button>
            <button class="conti-opt" data-v="med">1분 내외</button>
            <button class="conti-opt" data-v="long">긴 영상</button>
          </div>
        </div>

        <div class="conti-q">
          <div class="conti-q-label">Q3. 강조할 본인만의 특징</div>
          <div class="conti-q-opts" data-q="strength">
            <button class="conti-opt" data-v="story">스토리텔링</button>
            <button class="conti-opt" data-v="visual">비주얼</button>
            <button class="conti-opt" data-v="expert">전문성</button>
            <button class="conti-opt" data-v="personal">개인적 경험</button>
          </div>
        </div>

        <button class="conti-cta" id="conti-cta" disabled onclick="generateConti()">
          <span class="cta-icon">✨</span>
          <span>소재·컨셉 추천받기</span>
        </button>
        <div class="gemini-note">⚡ Gemini API · 추천부터 콘티까지 한 번에 생성</div>
      </div>

      <!-- Stage 2: Loading -->
      <div id="conti-stage-loading" class="conti-stage">
        <div class="conti-loading">
          <div class="conti-loading-orb"></div>
          <h2 class="conti-loading-title">맞춤 콘티를<br>생성하는 중...</h2>
          <p class="conti-loading-sub">PERSONA × TREND × YOUR INPUT</p>
          <div class="conti-loading-steps">
            <div class="cl-step" data-step="0"><span>페르소나 결합</span><span class="status">···</span></div>
            <div class="cl-step" data-step="1"><span>트렌드 매핑</span><span class="status">···</span></div>
            <div class="cl-step" data-step="2"><span>대본 생성</span><span class="status">···</span></div>
            <div class="cl-step" data-step="3"><span>콘티 구성</span><span class="status">···</span></div>
          </div>
        </div>
      </div>

      <!-- Stage 3: Result -->
      <div id="conti-stage-result" class="conti-stage">
        <div class="tab-top">
          <div class="tab-eyebrow">RECOMMENDATION</div>
          <h2 class="tab-title">맞춤 <span class="accent-pink">콘티</span></h2>
          <p class="tab-sub">대본 3종 + 6컷 콘티</p>
        </div>

        <div class="script-section">
          <div class="section-head">
            <span class="section-label">📄 대본 3종</span>
            <span class="gemini-pill">GEMINI AI</span>
          </div>
          <div class="script-tabs">
            <button class="script-tab active" data-script="info" onclick="switchScript('info')">정보형</button>
            <button class="script-tab" data-script="emotion" onclick="switchScript('emotion')">감성형</button>
            <button class="script-tab" data-script="humor" onclick="switchScript('humor')">유머형</button>
          </div>
          <div class="script-content" id="script-content"></div>
        </div>

        <div class="conti-section">
          <div class="section-head">
            <span class="section-label">🎞 6컷 콘티</span>
          </div>
          <div class="conti-grid" id="conti-grid"></div>
        </div>

        <button class="conti-redo" onclick="resetConti()">↻ 다시 생성하기</button>
      </div>
    </div>
  </div>

  <!-- ============ TABBAR ============ -->
  <div class="tabbar" id="tabbar">
    <button class="tab" data-tab="dashboard" onclick="switchTab('dashboard')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 12l9-9 9 9M5 10v10h14V10"/></svg>
      <span>DASHBOARD</span>
    </button>
    <button class="tab" data-tab="trends" onclick="switchTab('trends')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 17l6-6 4 4 8-8"/><path d="M14 7h7v7"/></svg>
      <span>TRENDS</span>
    </button>
    <button class="tab" data-tab="conti" onclick="switchTab('conti')">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="M3 10h18M9 4v16"/></svg>
      <span>CONTI</span>
    </button>
  </div>

</div>
`;

const APP_SCRIPT = `// ============================================
// SURVEY DEFINITION (matches spec exactly)
// ============================================
const QUESTIONS = [
  {
    id: 'platform',
    type: 'single',
    title: '주로 활동하는<br>플랫폼은?',
    hint: '하나만 선택해주세요',
    options: [
      { value: 'youtube',   label: 'YouTube Shorts',  icon: \`<svg viewBox="0 0 28 28" width="28" height="28" xmlns="http://www.w3.org/2000/svg"><rect x="1" y="6" width="26" height="16" rx="4" fill="#FF0000"/><polygon points="11.5,10 11.5,18 18.5,14" fill="#ffffff"/></svg>\` },
      { value: 'tiktok',    label: 'TikTok',          icon: \`<svg viewBox="0 0 28 28" width="28" height="28" xmlns="http://www.w3.org/2000/svg"><g transform="translate(0,0)"><path d="M16 3 L19.5 3 C19.8 5.6 21.4 7 24 7.3 L24 10.7 C22.3 10.6 20.7 10.1 19.5 9.3 L19.5 17.5 C19.5 21.6 16.1 25 12 25 C7.9 25 4.5 21.6 4.5 17.5 C4.5 13.4 7.9 10 12 10 L12 13.5 C9.8 13.5 8 15.3 8 17.5 C8 19.7 9.8 21.5 12 21.5 C14.2 21.5 16 19.7 16 17.5 Z" fill="#25F4EE" transform="translate(-1.5,-1)"/><path d="M16 3 L19.5 3 C19.8 5.6 21.4 7 24 7.3 L24 10.7 C22.3 10.6 20.7 10.1 19.5 9.3 L19.5 17.5 C19.5 21.6 16.1 25 12 25 C7.9 25 4.5 21.6 4.5 17.5 C4.5 13.4 7.9 10 12 10 L12 13.5 C9.8 13.5 8 15.3 8 17.5 C8 19.7 9.8 21.5 12 21.5 C14.2 21.5 16 19.7 16 17.5 Z" fill="#FE2C55" transform="translate(1.5,1)"/><path d="M16 3 L19.5 3 C19.8 5.6 21.4 7 24 7.3 L24 10.7 C22.3 10.6 20.7 10.1 19.5 9.3 L19.5 17.5 C19.5 21.6 16.1 25 12 25 C7.9 25 4.5 21.6 4.5 17.5 C4.5 13.4 7.9 10 12 10 L12 13.5 C9.8 13.5 8 15.3 8 17.5 C8 19.7 9.8 21.5 12 21.5 C14.2 21.5 16 19.7 16 17.5 Z" fill="#ffffff"/></g></svg>\` },
      { value: 'instagram', label: 'Instagram Reels', icon: \`<svg viewBox="0 0 28 28" width="28" height="28" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="igGrad" x1="0%" y1="100%" x2="100%" y2="0%"><stop offset="0%" stop-color="#FFDC80"/><stop offset="25%" stop-color="#FCAF45"/><stop offset="50%" stop-color="#F77737"/><stop offset="70%" stop-color="#E1306C"/><stop offset="100%" stop-color="#833AB4"/></linearGradient></defs><rect x="2" y="2" width="24" height="24" rx="7" fill="url(#igGrad)"/><circle cx="14" cy="14" r="5.5" fill="none" stroke="#ffffff" stroke-width="2"/><circle cx="20.5" cy="7.5" r="1.4" fill="#ffffff"/></svg>\` },
      { value: 'multi',     label: '멀티 플랫폼',      icon: \`<svg viewBox="0 0 28 28" width="28" height="28" xmlns="http://www.w3.org/2000/svg" fill="none" stroke="#C8FF57" stroke-width="2"><circle cx="14" cy="14" r="10"/><ellipse cx="14" cy="14" rx="4" ry="10"/><line x1="4" y1="14" x2="24" y2="14"/></svg>\` },
    ],
  },
  {
    id: 'category',
    type: 'single',
    title: '내 채널의<br>카테고리는?',
    hint: '주력 카테고리 하나만',
    options: [
      { value: 'food',      label: '요리 / 먹방',       icon: '🍜' },
      { value: 'beauty',    label: '뷰티 / 패션',       icon: '💄' },
      { value: 'lifestyle', label: '라이프스타일 / 일상', icon: '☕' },
      { value: 'edu',       label: '정보 / 자기계발',    icon: '💡' },
      { value: 'gaming',    label: '게임 / 엔터테인먼트', icon: '🎮' },
      { value: 'fitness',   label: '운동 / 건강',        icon: '💪' },
      { value: 'art',       label: '예술 / 창작',        icon: '🎨' },
    ],
  },
  {
    id: 'experience',
    type: 'slider',
    title: '경력은?',
    hint: '숏폼 크리에이터로 활동한 기간',
    min: 0, max: 5, default: 2,
    labels: ['채널 없음', '1개월 미만', '1~6개월', '6개월~1년', '1~3년', '3년 이상'],
    ticks: ['NEW', '<1M', '1-6M', '6M-1Y', '1-3Y', '3Y+'],
  },
  {
    id: 'goal',
    type: 'single',
    title: '지금 가장<br>원하는 목표는?',
    hint: '하나만 선택해주세요',
    options: [
      { value: 'growth',    label: '구독자 / 팔로워 증가', icon: '📈' },
      { value: 'monetize',  label: '수익화 시작',         icon: '💰' },
      { value: 'brand',     label: '브랜드 인지도 구축',   icon: '✨' },
      { value: 'community', label: '팬덤 / 커뮤니티',     icon: '💞' },
    ],
  },
  {
    id: 'style',
    type: 'multi',
    title: '내 콘텐츠<br>스타일은?',
    hint: '최대 3개까지 선택',
    maxSelect: 3,
    options: [
      { value: 'humor',     label: '유머 / 웃음',   icon: '🎭' },
      { value: 'info',      label: '정보 / 교육',   icon: '💡' },
      { value: 'emotion',   label: '감성 / 공감',   icon: '🤍' },
      { value: 'impact',    label: '자극 / 임팩트', icon: '⚡' },
      { value: 'honest',    label: '솔직 / 현실',   icon: '📝' },
      { value: 'visual',    label: '비주얼 / 심미', icon: '✨' },
      { value: 'challenge', label: '챌린지 / 트렌드', icon: '🔥' },
      { value: 'creative',  label: '실험 / 독창성', icon: '🧪' },
    ],
  },
  {
    id: 'pain',
    type: 'single',
    title: '제작에서<br>가장 힘든 건?',
    hint: '가장 큰 고민 하나만',
    options: [
      { value: 'idea',        label: '아이디어가 안 떠올라요',         icon: '💭' },
      { value: 'trend',       label: '트렌드를 어떻게 써야 할지 모름', icon: '🔄' },
      { value: 'reach',       label: '만들어도 반응이 없어요',          icon: '📉' },
      { value: 'consistency', label: '꾸준히 못하겠어요',              icon: '⏱' },
    ],
  },
  {
    id: 'frequency',
    type: 'slider',
    title: '주당<br>몇 편 올릴 예정?',
    hint: '목표 업로드 빈도',
    min: 1, max: 7, default: 3, unit: '편/주',
    ticks: ['1', '2', '3', '4', '5', '6', '7'],
  },
];

// ============================================
// STATE
// ============================================
const state = {
  qIdx: 0,
  answers: {},
  multiSelected: {},
  personaTone: 0,
};

// ============================================
// PERSONA DERIVATION (mock — matches spec typeIndex 0-3)
// ============================================
const PERSONA_DEFS = {
  0: { name: 'THE TRENDSETTER',   tag: '트렌드 감각으로 선점하는 타입', color: '#C8FF57', toneClass: 'info' },
  1: { name: 'THE NICHE KING',    tag: '신뢰감 있는 정보를 만드는 타입', color: '#57C8FF', toneClass: 'trust' },
  2: { name: 'THE HOOKER',        tag: '첫 3초로 사로잡는 타입',         color: '#FF8657', toneClass: 'hook' },
  3: { name: 'THE EXPERIMENTER',  tag: '독창적인 실험으로 차별화',       color: '#C857FF', toneClass: 'experiment' },
};

function derivePersona() {
  const styles = state.answers.style || [];
  // simple deterministic mapping for demo
  if (styles.includes('info') || styles.includes('honest')) return 1;
  if (styles.includes('impact') || styles.includes('challenge')) return 2;
  if (styles.includes('creative') || styles.includes('visual')) return 3;
  return 0;
}

// ============================================
// SURVEY FLOW
// ============================================
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(id);
  target.classList.add('active');
  target.scrollTop = 0;
  // tabbar visibility
  const tabbar = document.getElementById('tabbar');
  if (tabbar) {
    tabbar.classList.toggle('visible', target.classList.contains('has-tabbar'));
  }
  // splash auto-advance
  clearTimeout(window._splashTimer);
  if (id === 'screen-intro') {
    window._splashTimer = setTimeout(() => {
      // only advance if still on intro (user might have reset etc.)
      if (document.getElementById('screen-intro').classList.contains('active')) {
        startSurvey();
      }
    }, 2500);
  }
}

function startSurvey() {
  state.qIdx = 0;
  state.answers = {};
  state.multiSelected = {};
  showScreen('screen-question');
  renderQuestion();
}

function renderQuestion() {
  const q = QUESTIONS[state.qIdx];
  document.getElementById('q-counter').textContent = \`QUESTION \${String(state.qIdx + 1).padStart(2, '0')} / \${String(QUESTIONS.length).padStart(2, '0')}\`;
  document.getElementById('q-progress-fill').style.width = \`\${((state.qIdx + 1) / QUESTIONS.length) * 100}%\`;
  document.getElementById('q-title').innerHTML = q.title;
  document.getElementById('q-hint').textContent = q.hint;
  // Show intro helper only on first question
  const helper = document.getElementById('q-intro-helper');
  if (helper) helper.classList.toggle('show', state.qIdx === 0);
  const body = document.getElementById('q-body');
  body.innerHTML = '';
  const nextBtn = document.getElementById('q-next-btn');
  nextBtn.disabled = true;

  if (q.type === 'single') {
    const wrap = document.createElement('div');
    wrap.className = 'q-options';
    q.options.forEach(opt => {
      const b = document.createElement('button');
      b.className = 'q-opt' + (opt.chip ? ' has-chip' : '');
      const leftEl = opt.chip
        ? \`<span class="q-opt-chip chip-\${opt.chipColor || 'lime'}">\${opt.chip}</span>\`
        : \`<span class="q-opt-icon">\${opt.icon}</span>\`;
      b.innerHTML = \`
        \${leftEl}
        <span class="q-opt-label">\${opt.label}</span>
        <span class="q-opt-check"></span>
      \`;
      if (state.answers[q.id] === opt.value) b.classList.add('selected');
      b.onclick = () => {
        wrap.querySelectorAll('.q-opt').forEach(x => x.classList.remove('selected'));
        b.classList.add('selected');
        state.answers[q.id] = opt.value;
        nextBtn.disabled = false;
      };
      wrap.appendChild(b);
    });
    body.appendChild(wrap);
    if (state.answers[q.id]) nextBtn.disabled = false;
  }

  if (q.type === 'multi') {
    const sel = new Set(state.answers[q.id] || []);
    const counter = document.createElement('div');
    counter.className = 'multi-counter';
    counter.textContent = \`\${sel.size} / \${q.maxSelect} SELECTED\`;
    body.appendChild(counter);

    const grid = document.createElement('div');
    grid.className = 'multi-grid';
    q.options.forEach(opt => {
      const b = document.createElement('button');
      b.className = 'multi-opt';
      b.innerHTML = \`<span class="ico">\${opt.icon}</span>\${opt.label}\`;
      if (sel.has(opt.value)) b.classList.add('selected');
      b.onclick = () => {
        if (sel.has(opt.value)) {
          sel.delete(opt.value);
          b.classList.remove('selected');
        } else if (sel.size < q.maxSelect) {
          sel.add(opt.value);
          b.classList.add('selected');
        }
        state.answers[q.id] = [...sel];
        counter.textContent = \`\${sel.size} / \${q.maxSelect} SELECTED\`;
        nextBtn.disabled = sel.size === 0;
      };
      grid.appendChild(b);
    });
    body.appendChild(grid);
    if (sel.size > 0) nextBtn.disabled = false;
  }

  if (q.type === 'slider') {
    const cur = state.answers[q.id] !== undefined ? state.answers[q.id] : q.default;
    state.answers[q.id] = cur;
    const wrap = document.createElement('div');
    wrap.className = 'slider-wrap';
    const labelText = q.labels ? q.labels[cur] : (cur + (q.unit || ''));
    wrap.innerHTML = \`
      <div class="slider-value" id="slider-val">\${q.labels ? cur : cur + (q.unit ? '' : '')}</div>
      <div class="slider-label" id="slider-label">\${labelText}</div>
      <input type="range" min="\${q.min}" max="\${q.max}" value="\${cur}" class="slider" id="slider-input">
      <div class="slider-ticks">
        \${(q.ticks || []).map(t => \`<span>\${t}</span>\`).join('')}
      </div>
    \`;
    body.appendChild(wrap);
    const input = wrap.querySelector('#slider-input');
    const val = wrap.querySelector('#slider-val');
    const lab = wrap.querySelector('#slider-label');
    input.addEventListener('input', e => {
      const v = +e.target.value;
      state.answers[q.id] = v;
      val.textContent = q.labels ? v : v;
      lab.textContent = q.labels ? q.labels[v] : (v + (q.unit || ''));
    });
    nextBtn.disabled = false;
  }
}

function nextQuestion() {
  if (state.qIdx < QUESTIONS.length - 1) {
    state.qIdx++;
    renderQuestion();
  } else {
    runAnalysis();
  }
}

function prevQuestion() {
  if (state.qIdx > 0) {
    state.qIdx--;
    renderQuestion();
  } else {
    showScreen('screen-intro');
  }
}

function skipToDemo() {
  // Fill with demo defaults so the storyboard works straight away
  state.answers = {
    platform: 'youtube',
    category: 'food',
    experience: 2,
    goal: 'growth',
    style: ['humor', 'visual', 'challenge'],
    pain: 'idea',
    frequency: 4,
  };
  runAnalysis();
}

// ============================================
// LOADING ANIMATION
// ============================================
function runAnalysis() {
  showScreen('screen-loading');
  const steps = document.querySelectorAll('.loading-step');
  steps.forEach(s => { s.classList.remove('done', 'active'); s.querySelector('.status').textContent = '···'; });
  let i = 0;
  const advance = () => {
    if (i > 0) {
      steps[i - 1].classList.remove('active');
      steps[i - 1].classList.add('done');
      steps[i - 1].querySelector('.status').textContent = 'OK';
    }
    if (i < steps.length) {
      steps[i].classList.add('active');
      steps[i].querySelector('.status').textContent = 'RUN';
      i++;
      setTimeout(advance, 650);
    } else {
      setTimeout(showResult, 350);
    }
  };
  advance();
}


function showResult() {
  // Build persona data
  const personaIdx = derivePersona();
  state.personaTone = personaIdx;
  const persona = PERSONA_DEFS[personaIdx];

  // Persona card
  const card = document.getElementById('result-card');
  card.style.setProperty('--accent', persona.color);
  document.getElementById('result-tag').textContent = \`PERSONA · TYPE \${String(personaIdx).padStart(2, '0')}\`;
  document.getElementById('result-name').textContent = persona.name;
  document.getElementById('result-line').textContent = persona.tag;

  // Meta pills (platform / category / goal / frequency)
  const platLabels = { youtube:'YouTube Shorts', tiktok:'TikTok', instagram:'Instagram', multi:'Multi-Platform' };
  const catLabels = { food:'요리·먹방', beauty:'뷰티·패션', lifestyle:'라이프스타일', edu:'정보·자기계발', gaming:'게임·엔터', fitness:'운동·건강', art:'예술·창작' };
  const goalLabels = { growth:'팔로워 증가', monetize:'수익화', brand:'브랜드 인지도', community:'커뮤니티' };
  const a = state.answers;
  const pills = [
    platLabels[a.platform],
    catLabels[a.category],
    goalLabels[a.goal],
    a.frequency ? \`\${a.frequency}편/주\` : null,
  ].filter(Boolean);
  document.getElementById('result-meta').innerHTML = pills
    .map(p => \`<span class="result-meta-pill">\${p}</span>\`)
    .join('');

  showScreen('screen-result');
}

// ============================================
// INTENT-BASED TAB LANDING
// ============================================
const INTENT_LANDING = {
  explore:   'dashboard',
  reference: 'trends',
  produce:   'conti',
};

function pickIntent(intent) {
  state.answers.intent = intent;
  // Build all tab content so they're ready
  prepareDashboard();
  prepareTrends();
  prepareConti();
  const target = INTENT_LANDING[intent] || 'dashboard';
  switchTab(target);
}

function switchTab(tab) {
  showScreen('screen-' + tab);
  document.querySelectorAll('.tab').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tab);
  });
}

// ============================================
// MOCK DATA per category
// ============================================
const CATEGORY_DATA = {
  food: {
    title: 'FOOD',
    videos: [
      { thumb: '🍜', title: '집에서 5분만에 만드는 마라탕 레시피', views: '127만', likes: '8.2만', time: '3일 전', tags: ['#마라탕', '#홈쿠킹', '#5분요리'] },
      { thumb: '🍳', title: '직장인 도시락 일주일 루틴 공개', views: '89만', likes: '5.4만', time: '5일 전', tags: ['#도시락', '#직장인', '#밀프렙'] },
      { thumb: '🥘', title: '백종원도 인정한 김치찌개 비법', views: '64만', likes: '4.1만', time: '6일 전', tags: ['#김치찌개', '#한식', '#백종원'] },
    ],
    keywords: [
      { text: '#마라탕', type: 'hot' },
      { text: '#홈쿠킹', type: 'rising' },
      { text: '#밀프렙', type: 'rising' },
      { text: '#5분레시피', type: '' },
      { text: '#한식', type: '' },
      { text: '#감성먹방', type: 'rising' },
      { text: '#편의점', type: '' },
    ],
    insight: '이번 주는 "혼자 빠르게 만들 수 있는 요리"가 폭발적으로 상승 중이에요. 직장인 타깃 콘텐츠가 강세이고, 영상 길이는 30초 내외가 평균 조회수 2.3배 더 높습니다.',
    creators: [
      { name: '@momoeats',     followers: '340K', niche: '먹방',     uploads: '매일',   score: 94, growth: 18, reason: '같은 카테고리·매일 업로드 패턴이 닮음' },
      { name: '@kitchen.note', followers: '128K', niche: '홈쿠킹',   uploads: '주 4편', score: 88, growth: 12, reason: '5분 요리 포맷, 직장인 타깃 일치' },
      { name: '@daily.bites',  followers: '62K',  niche: '감성 먹방', uploads: '주 3편', score: 82, growth: 24, reason: '빠르게 성장 중인 신생 크리에이터' },
      { name: '@spoon.diary',  followers: '45K',  niche: '밀프렙',   uploads: '주 2편', score: 76, growth: 8,  reason: '비슷한 페르소나의 시작 단계 채널' },
    ],
  },
  beauty: {
    title: 'BEAUTY',
    videos: [
      { thumb: '💄', title: '여름 데일리 메이크업 5분 완성', views: '156만', likes: '11만', time: '2일 전', tags: ['#데일리메이크업', '#여름메이크업', '#5분메이크업'] },
      { thumb: '✨', title: '글로우 피부 만드는 베이스 비법', views: '98만', likes: '7.2만', time: '4일 전', tags: ['#베이스', '#글로우', '#피부결'] },
      { thumb: '💋', title: '편의점 화장품 솔직 리뷰', views: '72만', likes: '5.8만', time: '6일 전', tags: ['#편의점', '#가성비', '#솔직리뷰'] },
    ],
    keywords: [
      { text: '#글로우메이크업', type: 'hot' },
      { text: '#톤업', type: 'rising' },
      { text: '#쿨톤', type: '' },
      { text: '#5분메이크업', type: 'rising' },
      { text: '#피부결', type: '' },
      { text: '#여름메이크업', type: 'hot' },
    ],
    insight: '여름 시즌 진입과 함께 "글로우/물광 피부" 관련 콘텐츠가 급상승. Before-After 변화 보여주는 영상 포맷이 평균 조회수 3.1배 높아요.',
    creators: [
      { name: '@beautynote',    followers: '420K', niche: '데일리 메이크업', uploads: '주 5편', score: 92, growth: 15, reason: '데일리 포맷 + 짧은 호흡이 페르소나에 적합' },
      { name: '@glowup.kr',     followers: '180K', niche: '피부케어',       uploads: '주 3편', score: 87, growth: 22, reason: '글로우 트렌드 선점, 폭발적 성장 중' },
      { name: '@palette.diary', followers: '95K',  niche: '컬러 메이크업',   uploads: '주 2편', score: 83, growth: 10, reason: '비주얼 중심 스타일이 강조 포인트와 맞음' },
      { name: '@cosme.review',  followers: '38K',  niche: '제품 리뷰',       uploads: '주 4편', score: 78, growth: 14, reason: '솔직 리뷰 톤, 진정성 어필' },
    ],
  },
  lifestyle: {
    title: 'LIFESTYLE',
    videos: [
      { thumb: '☕', title: '미라클 모닝 루틴 한 달 후기', views: '210만', likes: '14만', time: '4일 전', tags: ['#미라클모닝', '#루틴', '#자기계발'] },
      { thumb: '🌿', title: '7평 자취방 깔끔하게 꾸미기', views: '95만', likes: '7.1만', time: '5일 전', tags: ['#자취방', '#인테리어', '#원룸'] },
      { thumb: '📔', title: '저녁 1시간으로 인생 바꾸는 루틴', views: '78만', likes: '5.6만', time: '7일 전', tags: ['#저녁루틴', '#자기관리', '#습관'] },
    ],
    keywords: [
      { text: '#미라클모닝', type: 'hot' },
      { text: '#루틴', type: 'hot' },
      { text: '#자취일상', type: 'rising' },
      { text: '#원룸인테리어', type: '' },
      { text: '#자기계발', type: '' },
      { text: '#습관만들기', type: 'rising' },
    ],
    insight: '"루틴" 키워드가 2주 연속 상위권. 특히 미라클 모닝과 저녁 루틴 콘텐츠 강세이고, 한 달 챌린지 형식 영상의 완주율이 평균 대비 1.8배 높아요.',
    creators: [
      { name: '@morning.kim', followers: '380K', niche: '미라클모닝',     uploads: '매일',   score: 95, growth: 20, reason: '핵심 키워드 선점 + 매일 업로드 일관성' },
      { name: '@roomtour.kr', followers: '145K', niche: '자취방 인테리어', uploads: '주 3편', score: 86, growth: 11, reason: '비슷한 타깃·차별화된 비주얼' },
      { name: '@routine.log', followers: '88K',  niche: '데일리 루틴',     uploads: '주 4편', score: 81, growth: 16, reason: '꾸준한 루틴 콘텐츠로 팬덤 형성 중' },
      { name: '@minimal.life',followers: '52K',  niche: '미니멀라이프',   uploads: '주 2편', score: 75, growth: 9,  reason: '특정 라이프스타일 니치 타깃' },
    ],
  },
  edu: {
    title: 'EDUCATION',
    videos: [
      { thumb: '💡', title: '경제 뉴스 5분만에 정리해드림', views: '142만', likes: '9.8만', time: '3일 전', tags: ['#경제', '#뉴스정리', '#5분요약'] },
      { thumb: '📚', title: '독서로 인생 바꾼 1년 후기', views: '88만', likes: '6.4만', time: '5일 전', tags: ['#독서', '#책추천', '#자기계발'] },
      { thumb: '🎯', title: '직장인 부업으로 월 100만원', views: '110만', likes: '7.5만', time: '6일 전', tags: ['#부업', '#투잡', '#사이드프로젝트'] },
    ],
    keywords: [
      { text: '#5분요약', type: 'hot' },
      { text: '#경제상식', type: 'rising' },
      { text: '#부업', type: 'hot' },
      { text: '#책추천', type: '' },
      { text: '#자기계발', type: '' },
      { text: '#재테크', type: 'rising' },
    ],
    insight: '"짧게 핵심만" 포맷이 압도적. 경제·재테크 관련 5분 요약 콘텐츠가 평균 조회수 2.8배 높고, 자막 가독성이 핵심 성공 요소예요.',
    creators: [
      { name: '@money.note',   followers: '510K', niche: '경제 뉴스',  uploads: '매일',   score: 96, growth: 17, reason: '5분 요약 포맷의 정석, 최고 매칭' },
      { name: '@book.curator', followers: '180K', niche: '책 추천',    uploads: '주 3편', score: 89, growth: 13, reason: '큐레이션 톤이 정보형 페르소나와 일치' },
      { name: '@side.income',  followers: '120K', niche: '부업 정보',   uploads: '주 4편', score: 85, growth: 26, reason: '"부업" 키워드로 급상승 중' },
      { name: '@learn.daily',  followers: '67K',  niche: '자기계발',   uploads: '주 5편', score: 79, growth: 11, reason: '꾸준한 업로드 패턴 유사' },
    ],
  },
  gaming: {
    title: 'GAMING',
    videos: [
      { thumb: '🎮', title: '엘든링 신캐릭 1시간 클리어', views: '188만', likes: '12만', time: '2일 전', tags: ['#엘든링', '#게임공략', '#스피드런'] },
      { thumb: '🕹️', title: '발로란트 다이아 가는 법', views: '124만', likes: '8.9만', time: '4일 전', tags: ['#발로란트', '#FPS', '#랭크게임'] },
      { thumb: '🎯', title: '인디게임 숨은 명작 TOP 5', views: '76만', likes: '5.3만', time: '5일 전', tags: ['#인디게임', '#게임추천', '#리뷰'] },
    ],
    keywords: [
      { text: '#엘든링', type: 'hot' },
      { text: '#발로란트', type: 'hot' },
      { text: '#게임공략', type: '' },
      { text: '#스피드런', type: 'rising' },
      { text: '#인디게임', type: 'rising' },
      { text: '#게임리뷰', type: '' },
    ],
    insight: '신작 출시 직후 1주일이 골든타임. 공략 영상은 출시 3일 이내 게시 시 조회수 5배, 짧은 하이라이트 클립 포맷이 강세예요.',
    creators: [
      { name: '@gamer.kim',  followers: '620K', niche: 'FPS 공략',   uploads: '매일',   score: 93, growth: 15, reason: '같은 장르 + 일관된 업로드 페이스' },
      { name: '@speed.run',  followers: '210K', niche: '스피드런',   uploads: '주 5편', score: 88, growth: 19, reason: '신작 타이밍 잘 타는 운영 방식' },
      { name: '@indie.lover',followers: '95K',  niche: '인디게임 리뷰',uploads: '주 3편', score: 82, growth: 22, reason: '"인디게임" 키워드 상승세 동행' },
      { name: '@retro.play', followers: '48K',  niche: '레트로 게임',  uploads: '주 2편', score: 76, growth: 7,  reason: '특정 니치, 두터운 팬층 형성' },
    ],
  },
  fitness: {
    title: 'FITNESS',
    videos: [
      { thumb: '💪', title: '집에서 15분 전신운동 루틴', views: '198만', likes: '14만', time: '3일 전', tags: ['#홈트', '#전신운동', '#15분운동'] },
      { thumb: '🏃', title: '한 달 만에 -5kg 다이어트 식단', views: '156만', likes: '11만', time: '4일 전', tags: ['#다이어트', '#식단', '#한달챌린지'] },
      { thumb: '🧘', title: '아침 스트레칭 루틴 5분', views: '88만', likes: '6.7만', time: '6일 전', tags: ['#스트레칭', '#모닝루틴', '#건강'] },
    ],
    keywords: [
      { text: '#홈트', type: 'hot' },
      { text: '#다이어트', type: 'hot' },
      { text: '#식단', type: '' },
      { text: '#15분운동', type: 'rising' },
      { text: '#한달챌린지', type: 'rising' },
      { text: '#스트레칭', type: '' },
    ],
    insight: '"짧은 시간 + 가시적 결과" 조합이 핵심. 15분 이하 운동 영상이 조회수 2.5배, Before-After 변화를 보여주는 챌린지형 콘텐츠 강세예요.',
    creators: [
      { name: '@home.fit',      followers: '480K', niche: '홈트레이닝',   uploads: '매일',   score: 94, growth: 16, reason: '15분 이하 포맷의 정석' },
      { name: '@diet.note',     followers: '210K', niche: '다이어트 식단', uploads: '주 4편', score: 89, growth: 14, reason: '챌린지형 콘텐츠 패턴 일치' },
      { name: '@stretch.daily', followers: '120K', niche: '스트레칭',     uploads: '주 5편', score: 84, growth: 12, reason: '짧고 반복 가능한 콘텐츠 구조' },
      { name: '@yoga.life',     followers: '58K',  niche: '요가',         uploads: '주 3편', score: 78, growth: 8,  reason: '비슷한 페르소나의 차별화 사례' },
    ],
  },
  art: {
    title: 'ART',
    videos: [
      { thumb: '🎨', title: '아이패드로 일러스트 그리기', views: '145만', likes: '10만', time: '3일 전', tags: ['#일러스트', '#아이패드', '#디지털드로잉'] },
      { thumb: '✏️', title: '초보도 가능한 인물화 5단계', views: '92만', likes: '6.8만', time: '5일 전', tags: ['#인물화', '#드로잉', '#초보'] },
      { thumb: '🖼️', title: '도시 풍경 수채화 타임랩스', views: '74만', likes: '5.2만', time: '6일 전', tags: ['#수채화', '#타임랩스', '#풍경화'] },
    ],
    keywords: [
      { text: '#디지털드로잉', type: 'hot' },
      { text: '#일러스트', type: 'rising' },
      { text: '#아이패드', type: '' },
      { text: '#타임랩스', type: 'rising' },
      { text: '#수채화', type: '' },
      { text: '#드로잉튜토리얼', type: '' },
    ],
    insight: '작업 과정을 빠르게 보여주는 타임랩스가 강세. "초보도 따라할 수 있는" 콘텐츠가 평균 조회수 2.1배 높고, 영상 마지막에 완성작 풀샷 노출이 핵심이에요.',
    creators: [
      { name: '@ipad.draw',       followers: '380K', niche: '디지털 일러스트',uploads: '주 4편', score: 91, growth: 18, reason: '같은 도구 사용, 작업 과정 노출 패턴' },
      { name: '@sketch.kim',      followers: '150K', niche: '인물화',         uploads: '주 3편', score: 86, growth: 13, reason: '튜토리얼 톤이 페르소나에 적합' },
      { name: '@watercolor.day',  followers: '88K',  niche: '수채화',         uploads: '주 2편', score: 81, growth: 21, reason: '타임랩스 포맷으로 빠르게 성장 중' },
      { name: '@art.note',        followers: '42K',  niche: '드로잉 튜토리얼',uploads: '주 5편', score: 77, growth: 10, reason: '꾸준한 업로드 패턴이 닮음' },
    ],
  },
};

// ============================================
// PREPARE DASHBOARD
// ============================================
function prepareDashboard() {
  const cat = state.answers.category || 'food';
  const data = CATEGORY_DATA[cat] || CATEGORY_DATA.food;
  const platMap = { youtube: 'YouTube', tiktok: 'TikTok', instagram: 'Instagram', multi: 'Multi' };
  const platLabel = platMap[state.answers.platform] || 'YouTube';

  // Title
  document.getElementById('dash-title').innerHTML = \`\${data.title}<br><span class="accent-blue">TRENDS</span>\`;
  document.getElementById('dash-platform').textContent = platLabel;

  // Videos
  document.getElementById('dash-videos').innerHTML = data.videos.map(v => \`
    <div class="video-card">
      <div class="video-thumb">\${v.thumb}</div>
      <div class="video-info">
        <div class="video-title">\${v.title}</div>
        <div class="video-meta">
          <span class="views">\${v.views} views</span>
          <span>· ♥ \${v.likes}</span>
          <span>· \${v.time}</span>
        </div>
        <div class="video-tags">
          \${v.tags.map(t => \`<span class="video-tag">\${t}</span>\`).join('')}
        </div>
      </div>
    </div>
  \`).join('');

  // Keywords
  document.getElementById('dash-keywords').innerHTML = data.keywords.map(k => \`
    <span class="keyword-chip \${k.type}">\${k.text}</span>
  \`).join('');

  // Insight
  document.querySelector('#dash-insight .insight-text').textContent = data.insight;
}

// ============================================
// PREPARE TRENDS (Influencers)
// ============================================
function prepareTrends() {
  const cat = state.answers.category || 'food';
  const data = CATEGORY_DATA[cat] || CATEGORY_DATA.food;
  const [hero, ...rest] = data.creators;

  const heroHTML = \`
    <div class="hero-card">
      <div class="hero-badge">★ BEST MATCH</div>
      <div class="hero-head">
        <div class="hero-avatar">\${hero.name[1].toUpperCase()}</div>
        <div class="hero-meta">
          <div class="hero-name">\${hero.name}</div>
          <div class="hero-niche">\${hero.niche} · \${hero.uploads}</div>
        </div>
        <div class="hero-score">
          <div class="hero-score-num">\${hero.score}</div>
          <div class="hero-score-label">MATCH</div>
        </div>
      </div>

      <div class="hero-bar">
        <div class="hero-bar-fill" style="width:\${hero.score}%"></div>
      </div>

      <div class="hero-metrics">
        <div class="hero-metric">
          <div class="hm-label">FOLLOWERS</div>
          <div class="hm-value">\${hero.followers}</div>
        </div>
        <div class="hero-metric">
          <div class="hm-label">UPLOADS</div>
          <div class="hm-value">\${hero.uploads}</div>
        </div>
        <div class="hero-metric">
          <div class="hm-label">7-DAY</div>
          <div class="hm-value hm-growth">▲ \${hero.growth}%</div>
        </div>
      </div>

      <div class="hero-reason">
        <span class="hero-reason-label">WHY</span>
        \${hero.reason}
      </div>
    </div>
  \`;

  const restLabel = '<div class="creator-list-label">OTHER MATCHES</div>';
  const restHTML = rest.map((c, i) => \`
    <div class="creator-row">
      <div class="row-rank">\${String(i + 2).padStart(2, '0')}</div>
      <div class="row-avatar">\${c.name[1].toUpperCase()}</div>
      <div class="row-info">
        <div class="row-name">\${c.name}</div>
        <div class="row-niche">\${c.followers} · \${c.niche}</div>
        <div class="row-bar"><div class="row-bar-fill" style="width:\${c.score}%"></div></div>
      </div>
      <div class="row-side">
        <div class="row-score">\${c.score}</div>
        <div class="row-growth">▲ \${c.growth}%</div>
      </div>
    </div>
  \`).join('');

  document.getElementById('trends-creators').innerHTML = heroHTML + restLabel + restHTML;
}

// ============================================
// PREPARE CONTI (3-step survey + recommendation)
// ============================================
const contiState = { mood: null, length: null, strength: null };

function prepareConti() {
  // Reset state and stage
  contiState.mood = null;
  contiState.length = null;
  contiState.strength = null;
  document.querySelectorAll('#conti-stage-survey .conti-opt').forEach(b => b.classList.remove('selected'));
  document.getElementById('conti-cta').disabled = true;
  showContiStage('survey');

  // Wire option buttons (once per build is fine; re-wire on every prepare to be safe)
  document.querySelectorAll('#conti-stage-survey .conti-q-opts').forEach(group => {
    const qKey = group.dataset.q;
    group.querySelectorAll('.conti-opt').forEach(btn => {
      btn.onclick = () => {
        group.querySelectorAll('.conti-opt').forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        contiState[qKey] = btn.dataset.v;
        const ready = contiState.mood && contiState.length && contiState.strength;
        document.getElementById('conti-cta').disabled = !ready;
      };
    });
  });
}

function showContiStage(stage) {
  document.querySelectorAll('.conti-stage').forEach(s => s.classList.remove('active'));
  document.getElementById('conti-stage-' + stage).classList.add('active');
}

function generateConti() {
  showContiStage('loading');
  const steps = document.querySelectorAll('.cl-step');
  steps.forEach(s => { s.classList.remove('done', 'active'); s.querySelector('.status').textContent = '···'; });
  let i = 0;
  const tick = () => {
    if (i > 0) {
      steps[i-1].classList.remove('active');
      steps[i-1].classList.add('done');
      steps[i-1].querySelector('.status').textContent = 'OK';
    }
    if (i < steps.length) {
      steps[i].classList.add('active');
      steps[i].querySelector('.status').textContent = 'RUN';
      i++;
      setTimeout(tick, 500);
    } else {
      setTimeout(showContiResult, 300);
    }
  };
  tick();
}

// ============================================
// CONTI RESULT (3 scripts + 6-cut storyboard)
// ============================================
const SCRIPTS = {
  info: \`[훅 · 0-3s]
이 한 가지만 알면 평균 조회수가 3배 됩니다.

[본문 · 3-25s]
1. 첫 3초에 결론부터 보여주세요
2. 자막은 짧고 굵게, 한 줄 최대 12자
3. 영상 중간에 "다음에 나올 것"을 예고하면 이탈률이 절반으로 줄어요

[마무리 · 25-30s]
이 세 가지만 지키면 다음 영상부터 바로 효과 봅니다. 댓글로 시도해본 결과 공유해주세요!\`,
  emotion: \`[훅 · 0-3s]
시작한 지 6개월, 아무도 안 봤어요.

[본문 · 3-25s]
혼자 카메라 앞에서 100개 넘게 찍었어요. 댓글 0개, 좋아요 한 자리수. 그만둘까 수십 번 고민했어요.

근데 어느 날, 한 분이 메시지를 주셨어요. "이 영상 덕분에 시작할 용기가 생겼어요."

그날부터 다시 시작이었어요.

[마무리 · 25-30s]
당신의 첫 100명을 위해, 계속 찍어보세요. 분명 누군가는 기다리고 있어요.\`,
  humor: \`[훅 · 0-3s]
조회수 안 나오는 채널 특징 ㅋㅋㅋ

[본문 · 3-25s]
1. 제목에 '드디어 공개합니다' (드디어가 누군데)
2. 첫 5초가 인사 + 채널 소개 + 오프닝 BGM
3. 자막이 20자 넘는 4줄짜리 ㄷㄷ
4. 영상 길이 17분 53초 (누가 봐;;)
5. 썸네일에 자기 얼굴만 크게 (미안한데 우리 모름)

[마무리 · 25-30s]
다 본인 얘기죠? 저도 그랬어요 ㅋㅋㅋㅋ 다음 영상에서 진짜 해결법 들고 올게요.\`,
};

const CONTI_CUTS = [
  { emoji: '🎬', text: '0-3s · 강렬한 훅\\n결론부터 보여주기' },
  { emoji: '💡', text: '3-8s · 문제 제시\\n공감 포인트 강조' },
  { emoji: '📍', text: '8-15s · 핵심 메시지 1\\n자막 크게 노출' },
  { emoji: '🔑', text: '15-22s · 핵심 메시지 2\\nB-roll 삽입' },
  { emoji: '✨', text: '22-27s · 반전 / 인사이트\\n시청 지속률 유지' },
  { emoji: '👋', text: '27-30s · CTA\\n구독·댓글 유도' },
];

let currentScript = 'info';

function showContiResult() {
  showContiStage('result');
  switchScript('info');
  // Build conti grid
  document.getElementById('conti-grid').innerHTML = CONTI_CUTS.map((c, i) => \`
    <div class="conti-cell">
      <div class="conti-cell-num">CUT \${String(i + 1).padStart(2, '0')}</div>
      <div class="conti-cell-visual">\${c.emoji}</div>
      <div class="conti-cell-text">\${c.text.replace('\\n', '<br>')}</div>
    </div>
  \`).join('');
}

function switchScript(type) {
  currentScript = type;
  document.querySelectorAll('.script-tab').forEach(b => {
    b.classList.toggle('active', b.dataset.script === type);
  });
  document.getElementById('script-content').textContent = SCRIPTS[type];
}

function resetConti() {
  prepareConti();
}

// ============================================
// RESET
// ============================================
function resetDemo() {
  state.qIdx = 0;
  state.answers = {};
  state.multiSelected = {};
  showScreen('screen-intro');
}

// On first page load, splash is already 'active' via HTML — kick off auto-advance.
function initSplashTimer() {
  window._splashTimer = setTimeout(() => {
    if (document.getElementById('screen-intro').classList.contains('active')) {
      startSurvey();
    }
  }, 2500);
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initSplashTimer);
} else {
  initSplashTimer();
}
`;

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    // Run the inline app script after the markup is mounted
    const script = document.createElement('script');
    script.textContent = APP_SCRIPT;
    document.body.appendChild(script);

    return () => {
      // Best-effort cleanup
      if (script.parentNode) script.parentNode.removeChild(script);
    };
  }, []);

  return (
    <div ref={containerRef} dangerouslySetInnerHTML={{ __html: BODY_HTML }} />
  );
}
