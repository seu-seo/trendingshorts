'use client';

// ─────────────────────────────────────────────────────────────
// CreatorTypeCard
//
// 챗봇 답변 4개를 받아서 크리에이터 유형을 분석하고 카드로 보여줍니다.
//
// 사용법:
//   <CreatorTypeCard answers={chatbotAnswers} onRetry={() => goToScreen('chatbot')} />
//
// answers 순서 (ChatbotScreen의 onComplete 콜백에서 받은 string[]):
//   [0] 만들고 싶은 것 (추천 카테고리)
//   [1] 꾸준히 할 수 있는 것 (지속 가능한 컨텐츠)
//   [2] 잘하는 것 (강점)
//   [3] 봐줬으면 하는 사람 (타겟 오디언스)
// ─────────────────────────────────────────────────────────────

interface CreatorTypeCardProps {
  answers: string[];       // ChatbotScreen onComplete 에서 받은 string[4]
  onRetry?: () => void;    // "챗봇 다시 하기" 버튼 클릭 시
}

// ── 크리에이터 유형 데이터 ────────────────────────────────────
interface CreatorType {
  name: string;
  tag: string;
  desc: string;
  traits: string[];
  advice: string;
  keywords: string[];
}

const CREATOR_TYPES: Record<string, CreatorType> = {
  explorer: {
    name: '탐험가형', tag: 'EXPLORER',
    desc: '새로운 경험을 콘텐츠로 기록하는 크리에이터',
    traits: ['호기심 왕성', '현장감 있는 영상', '실행력 강함'],
    advice: '직접 경험한 것만 찍어도 충분해요. 진짜 반응이 최고의 콘텐츠예요.',
    keywords: ['여행', '맛집', '카페', '탐험', '체험', '투어', '나들이', '먹어', '가봤', '다녀'],
  },
  analyst: {
    name: '분석가형', tag: 'ANALYST',
    desc: '깊이 있는 정보로 신뢰를 쌓는 크리에이터',
    traits: ['꼼꼼한 리뷰', '논리적 설명', '정보 신뢰도 높음'],
    advice: '한 주제를 깊게 파면 팬이 생겨요. 쇼츠는 핵심 1개만 전달하세요.',
    keywords: ['게임', '리뷰', '분석', '공부', '정보', '비교', '추천', '공략', '설명', '기술'],
  },
  storyteller: {
    name: '스토리텔러형', tag: 'STORYTELLER',
    desc: '감성적인 서사로 공감을 이끄는 크리에이터',
    traits: ['감성적 연출', '이야기 구성력', '공감대 형성'],
    advice: '일상의 작은 순간도 스토리로 만들 수 있어요. 감정이 담긴 영상이 오래 기억돼요.',
    keywords: ['일상', '브이로그', '이야기', '사진', '감성', '글', '일기', '기록', '순간', '추억'],
  },
  entertainer: {
    name: '엔터테이너형', tag: 'ENTERTAINER',
    desc: '에너지와 재미로 시선을 사로잡는 크리에이터',
    traits: ['높은 에너지', '트렌드 민감', '빠른 편집 감각'],
    advice: '첫 3초가 전부예요. 강렬한 훅으로 시작하면 알고리즘이 밀어줘요.',
    keywords: ['재미', '유머', '웃음', '트렌드', '챌린지', '반응', '예능', '개그', '신나', '핫'],
  },
  expert: {
    name: '전문가형', tag: 'EXPERT',
    desc: '한 분야의 깊은 지식을 나누는 크리에이터',
    traits: ['전문 지식', '신뢰도 높음', '충성 팬 형성'],
    advice: '이미 아는 것에서 시작하세요. 전문성은 가장 강력한 차별점이에요.',
    keywords: ['운동', '헬스', '요리', '뷰티', '패션', '코딩', '영어', '강사', '배운', '가르'],
  },
  connector: {
    name: '공감형', tag: 'CONNECTOR',
    desc: '진심 어린 소통으로 팬과 연결되는 크리에이터',
    traits: ['감정 공감력', '소통 중심', '커뮤니티 형성'],
    advice: '댓글 하나하나가 콘텐츠 아이디어예요. 팬과 함께 만드는 채널을 지향하세요.',
    keywords: ['소통', '공감', '함께', '같이', '위로', '힘들', '고민', '친구', '응원', '커뮤'],
  },
};

const SHORT_QS = ['추천 카테고리', '지속 가능한 컨텐츠', '잘하는 것', '타겟 오디언스'];

const VAGUE_WORDS = ['없음', '모름', '몰라', '모르겠', '없어', '그냥', '??', '...', 'ㅋ', 'ㅎ', '글쎄'];

// ── 유형 결정 ────────────────────────────────────────────────
function deriveCreatorType(answers: string[]): CreatorType {
  const allText = answers.join(' ');
  const scores: Record<string, number> = {};
  for (const [key, type] of Object.entries(CREATOR_TYPES)) {
    scores[key] = type.keywords.filter((kw) => allText.includes(kw)).length;
  }
  const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
  if (sorted[0][1] === 0) return CREATOR_TYPES.storyteller;
  return CREATOR_TYPES[sorted[0][0]];
}

// ── 답변 불충분 판단 ─────────────────────────────────────────
function isInsufficient(answers: string[]): boolean {
  if (answers.length < 4) return true;
  const vagueCnt = answers.filter((a) => {
    const v = a.trim();
    return v.length < 4 || VAGUE_WORDS.some((w) => v.includes(w));
  }).length;
  return vagueCnt >= 2;
}

// ── 개인화 분석 텍스트 생성 ──────────────────────────────────
function buildAnalysis(ct: CreatorType, typeKey: string, answers: string[]): string {
  const want     = answers[0]?.trim() ?? '';
  const sustain  = answers[1]?.trim() ?? '';
  const strength = answers[2]?.trim() ?? '';
  const target   = answers[3]?.trim() ?? '';

  const sentences: string[] = [];

  if (want && strength) {
    sentences.push(`<strong>${want}</strong>을 만들고 싶은 데다 <strong>${strength}</strong>까지 갖췄으니, ${ct.name} 유형 중에서도 가능성이 높아요.`);
  } else if (want) {
    sentences.push(`<strong>${want}</strong>을 콘텐츠로 담고 싶다는 게 이미 좋은 출발점이에요.`);
  } else if (strength) {
    sentences.push(`<strong>${strength}</strong>는 ${ct.name}에게 가장 중요한 능력이에요.`);
  }

  if (sustain) {
    const sustainMap: Record<string, string> = {
      explorer:    `<strong>${sustain}</strong>처럼 직접 경험할 수 있는 소재는 탐험가형에게 완벽한 재료예요.`,
      analyst:     `<strong>${sustain}</strong>를 꾸준히 파고들면 그 분야에서 신뢰받는 채널이 될 수 있어요.`,
      storyteller: `<strong>${sustain}</strong>에서 감성적인 서사를 찾아내는 게 스토리텔러형의 핵심이에요.`,
      entertainer: `<strong>${sustain}</strong>도 재미있게 풀어내면 알고리즘이 밀어주는 콘텐츠가 돼요.`,
      expert:      `<strong>${sustain}</strong>를 꾸준히 쌓아가면 그게 곧 전문성이 돼요.`,
      connector:   `<strong>${sustain}</strong>를 진심으로 나누면 비슷한 고민을 가진 사람들이 모여들어요.`,
    };
    sentences.push(sustainMap[typeKey] ?? `<strong>${sustain}</strong>처럼 꾸준히 할 수 있는 소재가 있다는 게 큰 장점이에요.`);
  }

  if (target) {
    const targetMap: Record<string, string> = {
      explorer:    `<strong>${target}</strong>에게는 '직접 가봤어요' 한마디가 가장 강력한 훅이에요.`,
      analyst:     `<strong>${target}</strong>에게는 핵심만 콕 집어주는 짧은 영상이 최고예요.`,
      storyteller: `<strong>${target}</strong>의 마음을 움직이려면 진짜 감정이 담겨야 해요.`,
      entertainer: `<strong>${target}</strong>의 눈길을 잡으려면 첫 3초가 모든 걸 결정해요.`,
      expert:      `<strong>${target}</strong>에게는 '몰랐던 사실'을 알려줄 때 신뢰가 쌓여요.`,
      connector:   `<strong>${target}</strong>의 이야기를 먼저 들어주는 콘텐츠가 팬을 만들어요.`,
    };
    sentences.push(targetMap[typeKey] ?? `<strong>${target}</strong> 타겟이라면 — ${ct.advice}`);
  } else {
    sentences.push(ct.advice);
  }

  return sentences.join('<br><br>');
}

// ── 컴포넌트 ─────────────────────────────────────────────────
export default function CreatorTypeCard({ answers, onRetry }: CreatorTypeCardProps) {
  if (answers.length === 0) return null;

  // 불충분한 답변 → 다시 하기 카드
  if (isInsufficient(answers)) {
    return (
      <div style={{ background: 'rgba(255,100,80,0.06)', border: '1px solid rgba(255,100,80,0.2)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
        <div style={{ fontSize: '28px', marginBottom: '10px' }}>🤔</div>
        <div style={{ fontSize: '15px', fontWeight: 800, color: 'var(--ink)', marginBottom: '6px' }}>크리에이터 유형을 분석하기 어려워요</div>
        <div style={{ fontSize: '12px', color: 'var(--gray)', lineHeight: 1.7, marginBottom: '16px' }}>
          챗봇 답변이 너무 짧아서 정확한 성향을 파악하기 어렵네요.<br />
          조금 더 자세히 이야기해주면 나에게 딱 맞는 유형을 알 수 있어요.
        </div>
        {onRetry && (
          <button
            onClick={onRetry}
            style={{ background: 'var(--primary)', color: '#000', fontWeight: 700, fontSize: '13px', border: 'none', borderRadius: '10px', padding: '11px 24px', cursor: 'pointer', width: '100%' }}
          >
            챗봇 다시 하기 →
          </button>
        )}
      </div>
    );
  }

  const typeKey = Object.keys(CREATOR_TYPES).find((k) => {
    const scores: Record<string, number> = {};
    const allText = answers.join(' ');
    for (const [key, type] of Object.entries(CREATOR_TYPES)) {
      scores[key] = type.keywords.filter((kw) => allText.includes(kw)).length;
    }
    const sorted = Object.entries(scores).sort((a, b) => b[1] - a[1]);
    return sorted[0][1] > 0 && sorted[0][0] === k;
  }) ?? 'storyteller';

  const ct = deriveCreatorType(answers);
  const analysisHtml = buildAnalysis(ct, typeKey, answers);

  return (
    <div>
      {/* CREATOR TYPE 카드 */}
      <div style={{ background: 'linear-gradient(135deg,rgba(200,255,87,0.08),rgba(56,182,255,0.05))', border: '1px solid rgba(200,255,87,0.22)', borderRadius: '16px', padding: '18px', marginBottom: '12px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--primary)', letterSpacing: '0.1em', marginBottom: '12px' }}>
          CREATOR TYPE
        </div>
        <div style={{ marginBottom: '14px' }}>
          <div style={{ fontSize: '20px', fontWeight: 800, color: 'var(--ink)', letterSpacing: '-0.03em', lineHeight: 1.2 }}>
            {ct.name}
          </div>
          <div style={{ fontSize: '11px', color: 'var(--gray)', marginTop: '4px', lineHeight: 1.4 }}>
            {ct.desc}
          </div>
        </div>

        {/* 특성 칩 */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '14px' }}>
          {ct.traits.map((t) => (
            <span
              key={t}
              style={{ fontSize: '11px', fontWeight: 600, color: 'var(--primary)', background: 'rgba(200,255,87,0.08)', border: '1px solid rgba(200,255,87,0.2)', borderRadius: '999px', padding: '4px 11px' }}
            >
              {t}
            </span>
          ))}
        </div>

        {/* 개인화 분석 (HTML 포함) */}
        <div
          style={{ fontSize: '12px', color: 'var(--gray)', lineHeight: 1.8, background: 'rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px 14px', borderLeft: '2px solid var(--primary)' }}
          dangerouslySetInnerHTML={{ __html: analysisHtml }}
        />
      </div>

      {/* YOUR ANSWERS 카드 */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--line)', borderRadius: '14px', padding: '14px' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--gray)', letterSpacing: '0.08em', marginBottom: '12px' }}>
          YOUR ANSWERS
        </div>
        {answers.map((answer, i) => (
          <div
            key={i}
            style={{
              marginBottom: i < answers.length - 1 ? '10px' : 0,
              paddingBottom: i < answers.length - 1 ? '10px' : 0,
              borderBottom: i < answers.length - 1 ? '1px solid var(--line)' : 'none',
            }}
          >
            <div style={{ fontSize: '10px', color: 'var(--gray)', marginBottom: '3px' }}>
              {SHORT_QS[i] ?? `Q${i + 1}`}
            </div>
            <div style={{ fontSize: '13px', color: 'var(--ink)', fontWeight: 600, lineHeight: 1.45 }}>
              {answer}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
