import type { Category, Creator, FollowerTier } from './types';

export const TIER_LABELS: Record<FollowerTier, string> = {
  1: '< 1K',
  2: '1K – 10K',
  3: '10K – 100K',
  4: '100K – 500K',
  5: '500K+',
};

export function experienceToFollowerTier(experience: 0 | 1 | 2 | 3 | 4 | 5): FollowerTier {
  if (experience <= 1) return 1;
  if (experience === 2) return 2;
  if (experience === 3) return 3;
  if (experience === 4) return 4;
  return 5;
}

export function getNextTier(tier: FollowerTier): FollowerTier {
  return Math.min(tier + 1, 5) as FollowerTier;
}

const CREATORS: Record<Category, Creator[]> = {
  food: [
    // Tier 2 (1K-10K)
    { handle: '@cookwith.me', followersLabel: '2.4K', followers: 2400, niche: '홈쿠킹', uploadFreq: '주 3편', tier: 2, growth: 28, score: 80, reason: '비슷한 시작점에서 꾸준한 업로드로 성장 중' },
    { handle: '@5min.cook',   followersLabel: '7.1K', followers: 7100, niche: '5분 레시피', uploadFreq: '주 4편', tier: 2, growth: 35, score: 85, reason: '짧은 레시피 포맷으로 빠르게 팬 확보 중' },
    // Tier 3 (10K-100K)
    { handle: '@spoon.diary',  followersLabel: '45K', followers: 45000, niche: '밀프렙',   uploadFreq: '주 2편', tier: 3, growth: 8,  score: 76, reason: '비슷한 페르소나의 시작 단계 채널' },
    { handle: '@daily.bites',  followersLabel: '62K', followers: 62000, niche: '감성 먹방', uploadFreq: '주 3편', tier: 3, growth: 24, score: 82, reason: '빠르게 성장 중인 신생 크리에이터' },
    // Tier 4 (100K-500K)
    { handle: '@kitchen.note', followersLabel: '128K', followers: 128000, niche: '홈쿠킹', uploadFreq: '주 4편', tier: 4, growth: 12, score: 88, reason: '5분 요리 포맷, 직장인 타깃 일치' },
    // Tier 5 (500K+)
    { handle: '@momoeats',     followersLabel: '340K', followers: 340000, niche: '먹방', uploadFreq: '매일', tier: 4, growth: 18, score: 94, reason: '같은 카테고리·매일 업로드 패턴이 닮음' },
    { handle: '@food.king',    followersLabel: '680K', followers: 680000, niche: '먹방 챌린지', uploadFreq: '매일', tier: 5, growth: 14, score: 90, reason: '숏폼 먹방의 교과서, 후킹 포맷 선점' },
  ],
  beauty: [
    { handle: '@daily.glow',    followersLabel: '3.8K', followers: 3800, niche: '데일리 스킨케어', uploadFreq: '주 3편', tier: 2, growth: 31, score: 81, reason: '루틴 공개 포맷으로 팔로워 모으는 중' },
    { handle: '@makeup.3min',   followersLabel: '8.5K', followers: 8500, niche: '3분 메이크업', uploadFreq: '주 5편', tier: 2, growth: 42, score: 87, reason: '짧은 튜토리얼 포맷이 알고리즘 타는 중' },
    { handle: '@cosme.review',  followersLabel: '38K',  followers: 38000, niche: '제품 리뷰', uploadFreq: '주 4편', tier: 3, growth: 14, score: 78, reason: '솔직 리뷰 톤, 진정성 어필' },
    { handle: '@palette.diary', followersLabel: '95K',  followers: 95000, niche: '컬러 메이크업', uploadFreq: '주 2편', tier: 3, growth: 10, score: 83, reason: '비주얼 중심 스타일이 강조 포인트와 맞음' },
    { handle: '@glowup.kr',     followersLabel: '180K', followers: 180000, niche: '피부케어', uploadFreq: '주 3편', tier: 4, growth: 22, score: 87, reason: '글로우 트렌드 선점, 폭발적 성장 중' },
    { handle: '@beautynote',    followersLabel: '420K', followers: 420000, niche: '데일리 메이크업', uploadFreq: '주 5편', tier: 4, growth: 15, score: 92, reason: '데일리 포맷 + 짧은 호흡이 페르소나에 적합' },
    { handle: '@beauty.star',   followersLabel: '920K', followers: 920000, niche: '트렌드 뷰티', uploadFreq: '매일', tier: 5, growth: 19, score: 93, reason: '뷰티 숏폼 최정상, 트렌드 반응 속도 최고' },
  ],
  lifestyle: [
    { handle: '@my.routine',    followersLabel: '1.9K', followers: 1900, niche: '일상 브이로그', uploadFreq: '주 3편', tier: 2, growth: 22, score: 77, reason: '비슷한 일상 콘텐츠로 팬층 만들기 시작' },
    { handle: '@vlog.today',    followersLabel: '6.3K', followers: 6300, niche: '자취 일상', uploadFreq: '주 4편', tier: 2, growth: 33, score: 83, reason: '원룸/자취 타깃으로 빠르게 팬 확보' },
    { handle: '@minimal.life',  followersLabel: '52K',  followers: 52000, niche: '미니멀라이프', uploadFreq: '주 2편', tier: 3, growth: 9,  score: 75, reason: '특정 라이프스타일 니치 타깃' },
    { handle: '@routine.log',   followersLabel: '88K',  followers: 88000, niche: '데일리 루틴', uploadFreq: '주 4편', tier: 3, growth: 16, score: 81, reason: '꾸준한 루틴 콘텐츠로 팬덤 형성 중' },
    { handle: '@roomtour.kr',   followersLabel: '145K', followers: 145000, niche: '자취방 인테리어', uploadFreq: '주 3편', tier: 4, growth: 11, score: 86, reason: '비슷한 타깃·차별화된 비주얼' },
    { handle: '@morning.kim',   followersLabel: '380K', followers: 380000, niche: '미라클모닝', uploadFreq: '매일', tier: 4, growth: 20, score: 95, reason: '핵심 키워드 선점 + 매일 업로드 일관성' },
    { handle: '@life.changer',  followersLabel: '710K', followers: 710000, niche: '자기계발 라이프', uploadFreq: '주 5편', tier: 5, growth: 23, score: 91, reason: '자기계발 숏폼의 대표 채널, 훅 전략 탁월' },
  ],
  edu: [
    { handle: '@daily.tip',     followersLabel: '4.2K', followers: 4200, niche: '생활 꿀팁', uploadFreq: '주 4편', tier: 2, growth: 29, score: 79, reason: '유용한 정보로 공유 유도, 성장 가속 중' },
    { handle: '@news.5min',     followersLabel: '9.1K', followers: 9100, niche: '뉴스 5분 요약', uploadFreq: '매일', tier: 2, growth: 48, score: 88, reason: '매일 업로드 뉴스 포맷으로 급성장' },
    { handle: '@learn.daily',   followersLabel: '67K',  followers: 67000, niche: '자기계발', uploadFreq: '주 5편', tier: 3, growth: 11, score: 79, reason: '꾸준한 업로드 패턴 유사' },
    { handle: '@side.income',   followersLabel: '120K', followers: 120000, niche: '부업 정보', uploadFreq: '주 4편', tier: 4, growth: 26, score: 85, reason: '"부업" 키워드로 급상승 중' },
    { handle: '@book.curator',  followersLabel: '180K', followers: 180000, niche: '책 추천', uploadFreq: '주 3편', tier: 4, growth: 13, score: 89, reason: '큐레이션 톤이 정보형 페르소나와 일치' },
    { handle: '@money.note',    followersLabel: '510K', followers: 510000, niche: '경제 뉴스', uploadFreq: '매일', tier: 5, growth: 17, score: 96, reason: '5분 요약 포맷의 정석, 최고 매칭' },
    { handle: '@econ.short',    followersLabel: '830K', followers: 830000, niche: '경제·재테크', uploadFreq: '주 5편', tier: 5, growth: 21, score: 94, reason: '재테크 숏폼 최대 채널, 고퀄 자막 전략' },
  ],
  gaming: [
    { handle: '@game.start',    followersLabel: '2.1K', followers: 2100, niche: '신작 반응', uploadFreq: '주 3편', tier: 2, growth: 25, score: 76, reason: '신작 출시 타이밍 콘텐츠로 성장 중' },
    { handle: '@clip.shorts',   followersLabel: '5.8K', followers: 5800, niche: '하이라이트 클립', uploadFreq: '주 5편', tier: 2, growth: 39, score: 84, reason: '짧은 하이라이트 포맷으로 알고리즘 타는 중' },
    { handle: '@retro.play',    followersLabel: '48K',  followers: 48000, niche: '레트로 게임', uploadFreq: '주 2편', tier: 3, growth: 7,  score: 76, reason: '특정 니치, 두터운 팬층 형성' },
    { handle: '@indie.lover',   followersLabel: '95K',  followers: 95000, niche: '인디게임 리뷰', uploadFreq: '주 3편', tier: 3, growth: 22, score: 82, reason: '"인디게임" 키워드 상승세 동행' },
    { handle: '@speed.run',     followersLabel: '210K', followers: 210000, niche: '스피드런', uploadFreq: '주 5편', tier: 4, growth: 19, score: 88, reason: '신작 타이밍 잘 타는 운영 방식' },
    { handle: '@gamer.kim',     followersLabel: '620K', followers: 620000, niche: 'FPS 공략', uploadFreq: '매일', tier: 5, growth: 15, score: 93, reason: '같은 장르 + 일관된 업로드 페이스' },
    { handle: '@fps.master',    followersLabel: '1.2M', followers: 1200000, niche: 'FPS 정복', uploadFreq: '매일', tier: 5, growth: 12, score: 91, reason: '게임 숏폼 최정상 채널, 공략 포맷 교과서' },
  ],
  fitness: [
    { handle: '@30day.fit',     followersLabel: '3.1K', followers: 3100, niche: '30일 챌린지', uploadFreq: '매일', tier: 2, growth: 36, score: 82, reason: '챌린지 연속 업로드로 팔로워 급증 중' },
    { handle: '@home.workout',  followersLabel: '7.6K', followers: 7600, niche: '홈트 루틴', uploadFreq: '주 4편', tier: 2, growth: 30, score: 79, reason: '홈트 입문자 타깃 콘텐츠로 성장세' },
    { handle: '@yoga.life',     followersLabel: '58K',  followers: 58000, niche: '요가', uploadFreq: '주 3편', tier: 3, growth: 8,  score: 78, reason: '비슷한 페르소나의 차별화 사례' },
    { handle: '@stretch.daily', followersLabel: '120K', followers: 120000, niche: '스트레칭', uploadFreq: '주 5편', tier: 4, growth: 12, score: 84, reason: '짧고 반복 가능한 콘텐츠 구조' },
    { handle: '@diet.note',     followersLabel: '210K', followers: 210000, niche: '다이어트 식단', uploadFreq: '주 4편', tier: 4, growth: 14, score: 89, reason: '챌린지형 콘텐츠 패턴 일치' },
    { handle: '@home.fit',      followersLabel: '480K', followers: 480000, niche: '홈트레이닝', uploadFreq: '매일', tier: 4, growth: 16, score: 94, reason: '15분 이하 포맷의 정석' },
    { handle: '@fit.nation',    followersLabel: '740K', followers: 740000, niche: '체력 단련', uploadFreq: '매일', tier: 5, growth: 18, score: 92, reason: '피트니스 숏폼 1위, Before-After 전략 최강' },
  ],
  art: [
    { handle: '@sketch.start',  followersLabel: '1.5K', followers: 1500, niche: '드로잉 입문', uploadFreq: '주 3편', tier: 2, growth: 27, score: 77, reason: '초보 대상 쉬운 튜토리얼로 팬 모으는 중' },
    { handle: '@timelapse.now', followersLabel: '6.9K', followers: 6900, niche: '타임랩스 그림', uploadFreq: '주 4편', tier: 2, growth: 44, score: 86, reason: '타임랩스 포맷이 알고리즘 강세, 급성장' },
    { handle: '@art.note',      followersLabel: '42K',  followers: 42000, niche: '드로잉 튜토리얼', uploadFreq: '주 5편', tier: 3, growth: 10, score: 77, reason: '꾸준한 업로드 패턴이 닮음' },
    { handle: '@watercolor.day',followersLabel: '88K',  followers: 88000, niche: '수채화', uploadFreq: '주 2편', tier: 3, growth: 21, score: 81, reason: '타임랩스 포맷으로 빠르게 성장 중' },
    { handle: '@sketch.kim',    followersLabel: '150K', followers: 150000, niche: '인물화', uploadFreq: '주 3편', tier: 4, growth: 13, score: 86, reason: '튜토리얼 톤이 페르소나에 적합' },
    { handle: '@ipad.draw',     followersLabel: '380K', followers: 380000, niche: '디지털 일러스트', uploadFreq: '주 4편', tier: 4, growth: 18, score: 91, reason: '같은 도구 사용, 작업 과정 노출 패턴' },
    { handle: '@art.viral',     followersLabel: '610K', followers: 610000, niche: '팝아트 숏폼', uploadFreq: '주 5편', tier: 5, growth: 25, score: 90, reason: '아트 숏폼 최정상, 비주얼 임팩트 최강' },
  ],
};

export function getCreatorRecommendations(
  category: Category,
  experience: 0 | 1 | 2 | 3 | 4 | 5,
  limit = 3,
): Creator[] {
  const currentTier = experienceToFollowerTier(experience);
  const targetTier = getNextTier(currentTier);
  const pool = CREATORS[category].filter((c) => c.tier === targetTier);

  if (pool.length === 0) {
    // fallback: return highest tier available
    const fallback = [...CREATORS[category]].sort((a, b) => b.tier - a.tier || b.score - a.score);
    return fallback.slice(0, limit);
  }

  return [...pool].sort((a, b) => b.score - a.score).slice(0, limit);
}
