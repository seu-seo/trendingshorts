import type { Category, CategoryDataItem } from './types';

export const CATEGORY_DATA: Record<Category, CategoryDataItem> = {
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

export const SCRIPTS = {
  info: `[훅 · 0-3s]
이 한 가지만 알면 평균 조회수가 3배 됩니다.

[본문 · 3-25s]
1. 첫 3초에 결론부터 보여주세요
2. 자막은 짧고 굵게, 한 줄 최대 12자
3. 영상 중간에 "다음에 나올 것"을 예고하면 이탈률이 절반으로 줄어요

[마무리 · 25-30s]
이 세 가지만 지키면 다음 영상부터 바로 효과 봅니다. 댓글로 시도해본 결과 공유해주세요!`,
  emotion: `[훅 · 0-3s]
시작한 지 6개월, 아무도 안 봤어요.

[본문 · 3-25s]
혼자 카메라 앞에서 100개 넘게 찍었어요. 댓글 0개, 좋아요 한 자리수. 그만둘까 수십 번 고민했어요.

근데 어느 날, 한 분이 메시지를 주셨어요. "이 영상 덕분에 시작할 용기가 생겼어요."

그날부터 다시 시작이었어요.

[마무리 · 25-30s]
당신의 첫 100명을 위해, 계속 찍어보세요. 분명 누군가는 기다리고 있어요.`,
  humor: `[훅 · 0-3s]
조회수 안 나오는 채널 특징 ㅋㅋㅋ

[본문 · 3-25s]
1. 제목에 '드디어 공개합니다' (드디어가 누군데)
2. 첫 5초가 인사 + 채널 소개 + 오프닝 BGM
3. 자막이 20자 넘는 4줄짜리 ㄷㄷ
4. 영상 길이 17분 53초 (누가 봐;;)
5. 썸네일에 자기 얼굴만 크게 (미안한데 우리 모름)

[마무리 · 25-30s]
다 본인 얘기죠? 저도 그랬어요 ㅋㅋㅋㅋ 다음 영상에서 진짜 해결법 들고 올게요.`,
};

export const CONTI_CUTS = [
  { emoji: '🎬', text: '0-3s · 강렬한 훅\n결론부터 보여주기' },
  { emoji: '💡', text: '3-8s · 문제 제시\n공감 포인트 강조' },
  { emoji: '📍', text: '8-15s · 핵심 메시지 1\n자막 크게 노출' },
  { emoji: '🔑', text: '15-22s · 핵심 메시지 2\nB-roll 삽입' },
  { emoji: '✨', text: '22-27s · 반전 / 인사이트\n시청 지속률 유지' },
  { emoji: '👋', text: '27-30s · CTA\n구독·댓글 유도' },
];
