import type { Trend } from '../types';

export const ALL_TRENDS: Trend[] = [
  // ── TikTok ──────────────────────────────────────────────────────────────
  // food
  { id: 1, category: 'food', lifecycle: 'rising', platform: 'tiktok', platformLabel: 'TIKTOK', time: '15분 전',
    thumb: '🍜', title: '편의점 신상 조합 찾았다 진짜 미침', creator: '@snack_hunter_kr',
    views: 820000, likes: 98000, comments: 4200, shares: 31000, hashtags: '#편의점 #먹방 #신상', growth: 125, duration: '0:22', videoUrl: undefined },
  { id: 2, category: 'food', lifecycle: 'peak', platform: 'tiktok', platformLabel: 'TIKTOK', time: '2시간 전',
    thumb: '🍚', title: '혼자 먹는 새벽 라면이 제일 맛있는 이유', creator: '@midnight_mukbang',
    views: 1500000, likes: 52000, comments: 2100, shares: 18000, hashtags: '#새벽라면 #혼밥 #먹방', growth: 36, duration: '0:30', videoUrl: undefined },
  // beauty
  { id: 3, category: 'beauty', lifecycle: 'rising', platform: 'tiktok', platformLabel: 'TIKTOK', time: '40분 전',
    thumb: '💄', title: '5천원 올리브영 신상으로 피부톤 바꾸기', creator: '@skincare_insider',
    views: 980000, likes: 115000, comments: 5800, shares: 42000, hashtags: '#올리브영 #스킨케어 #뷰티', growth: 123, duration: '0:28', videoUrl: undefined },
  { id: 4, category: 'beauty', lifecycle: 'peak', platform: 'tiktok', platformLabel: 'TIKTOK', time: '3시간 전',
    thumb: '✨', title: '요즘 대세 무쌍 아이라인 그리는 법', creator: '@eyeliner_queen',
    views: 1200000, likes: 41000, comments: 1900, shares: 14000, hashtags: '#아이라인 #메이크업', growth: 36, duration: '0:20', videoUrl: undefined },
  // lifestyle
  { id: 5, category: 'lifestyle', lifecycle: 'rising', platform: 'tiktok', platformLabel: 'TIKTOK', time: '30분 전',
    thumb: '☕', title: 'MZ 직장인 현실 퇴근 루틴.zip', creator: '@office_reality_kr',
    views: 1100000, likes: 130000, comments: 6500, shares: 48000, hashtags: '#직장인 #브이로그 #일상', growth: 124, duration: '0:25', videoUrl: undefined },
  { id: 6, category: 'lifestyle', lifecycle: 'peak', platform: 'tiktok', platformLabel: 'TIKTOK', time: '4시간 전',
    thumb: '🏠', title: '자취방 한 달 생활비 전부 공개', creator: '@solo_life_kr',
    views: 890000, likes: 31000, comments: 1500, shares: 9500, hashtags: '#자취 #생활비 #브이로그', growth: 37, duration: '0:35', videoUrl: undefined },
  // edu
  { id: 7, category: 'edu', lifecycle: 'rising', platform: 'tiktok', platformLabel: 'TIKTOK', time: '1시간 전',
    thumb: '💡', title: '30초 만에 이해하는 주식 PER 개념', creator: '@money_school_kr',
    views: 650000, likes: 78000, comments: 4100, shares: 27000, hashtags: '#주식 #재테크 #금융', growth: 126, duration: '0:30', videoUrl: undefined },
  { id: 8, category: 'edu', lifecycle: 'peak', platform: 'tiktok', platformLabel: 'TIKTOK', time: '5시간 전',
    thumb: '📚', title: '영어 말문 트이는 하루 10분 루틴', creator: '@english_daily_kr',
    views: 1100000, likes: 38000, comments: 1800, shares: 11000, hashtags: '#영어공부 #자기계발', growth: 36, duration: '0:28', videoUrl: undefined },
  // gaming
  { id: 9, category: 'gaming', lifecycle: 'rising', platform: 'tiktok', platformLabel: 'TIKTOK', time: '45분 전',
    thumb: '🎮', title: '발로란트 신캐 한 방에 정리 완료', creator: '@fps_meta_kr',
    views: 1300000, likes: 165000, comments: 7200, shares: 55000, hashtags: '#발로란트 #게임 #FPS', growth: 132, duration: '0:20', videoUrl: undefined },
  { id: 10, category: 'gaming', lifecycle: 'peak', platform: 'tiktok', platformLabel: 'TIKTOK', time: '3시간 전',
    thumb: '🕹️', title: '롤 시즌 변화 총정리 3분 컷', creator: '@lol_update_kr',
    views: 1800000, likes: 61000, comments: 2400, shares: 19000, hashtags: '#리그오브레전드 #롤', growth: 35, duration: '0:30', videoUrl: undefined },
  // fitness
  { id: 11, category: 'fitness', lifecycle: 'rising', platform: 'tiktok', platformLabel: 'TIKTOK', time: '20분 전',
    thumb: '💪', title: '뱃살 빠지는 3분 코어 루틴 따라해봐', creator: '@abs_challenge_kr',
    views: 2100000, likes: 260000, comments: 9800, shares: 82000, hashtags: '#운동 #코어 #다이어트', growth: 128, duration: '0:22', videoUrl: undefined },
  { id: 12, category: 'fitness', lifecycle: 'peak', platform: 'tiktok', platformLabel: 'TIKTOK', time: '4시간 전',
    thumb: '🏃', title: '헬스 초보가 제일 많이 하는 실수 TOP5', creator: '@gym_mentor_kr',
    views: 940000, likes: 33000, comments: 1700, shares: 12000, hashtags: '#헬스 #운동초보 #PT', growth: 37, duration: '0:35', videoUrl: undefined },
  // art
  { id: 13, category: 'art', lifecycle: 'rising', platform: 'tiktok', platformLabel: 'TIKTOK', time: '1시간 전',
    thumb: '🎤', title: 'K-pop 신보 안무 포인트만 3초 컷 ㄹㅇ', creator: '@kpop_dance_kr',
    views: 1700000, likes: 210000, comments: 8100, shares: 68000, hashtags: '#케이팝 #안무 #댄스', growth: 128, duration: '0:18', videoUrl: undefined },
  { id: 14, category: 'art', lifecycle: 'peak', platform: 'tiktok', platformLabel: 'TIKTOK', time: '5시간 전',
    thumb: '🎸', title: '한국 인디 밴드 숨겨진 명곡 TOP5', creator: '@indie_finder_kr',
    views: 720000, likes: 25000, comments: 1200, shares: 8000, hashtags: '#인디음악 #한국음악', growth: 36, duration: '0:40', videoUrl: undefined },

  // ── Instagram ────────────────────────────────────────────────────────────
  // food
  { id: 15, category: 'food', lifecycle: 'rising', platform: 'instagram', platformLabel: 'REELS', time: '30분 전',
    thumb: '🍰', title: '성수 감성 브런치 카페 BEST3 직접 다녀옴', creator: '@seoul_brunch_tour',
    views: 430000, likes: 55000, comments: 2800, shares: 21000, hashtags: '#성수 #카페 #브런치', growth: 135, duration: '0:30', videoUrl: undefined },
  { id: 16, category: 'food', lifecycle: 'peak', platform: 'instagram', platformLabel: 'REELS', time: '3시간 전',
    thumb: '🫕', title: '집에서 만드는 마라탕 레시피 진짜 쉬움', creator: '@homecook_real_kr',
    views: 980000, likes: 35000, comments: 1500, shares: 13000, hashtags: '#마라탕 #집밥 #레시피', growth: 37, duration: '0:45', videoUrl: undefined },
  // beauty
  { id: 17, category: 'beauty', lifecycle: 'rising', platform: 'instagram', platformLabel: 'REELS', time: '1시간 전',
    thumb: '🧴', title: '각질 한번에 없애는 뷰티 꿀팁 공유', creator: '@skin_miracle_kr',
    views: 560000, likes: 72000, comments: 3500, shares: 28000, hashtags: '#각질관리 #스킨케어 #뷰티꿀팁', growth: 135, duration: '0:25', videoUrl: undefined },
  { id: 18, category: 'beauty', lifecycle: 'peak', platform: 'instagram', platformLabel: 'REELS', time: '4시간 전',
    thumb: '👄', title: '봄 립 컬러 뭐 사야 해? 솔직 추천', creator: '@lip_edit_kr',
    views: 1100000, likes: 40000, comments: 1900, shares: 15000, hashtags: '#립스틱 #봄메이크업 #뷰티', growth: 38, duration: '0:22', videoUrl: undefined },
  // lifestyle
  { id: 19, category: 'lifestyle', lifecycle: 'rising', platform: 'instagram', platformLabel: 'REELS', time: '45분 전',
    thumb: '🏝️', title: '혼자 하는 제주도 2박3일 실제 후기', creator: '@jeju_solo_diary',
    views: 390000, likes: 48000, comments: 2500, shares: 18000, hashtags: '#제주도 #혼행 #여행', growth: 131, duration: '0:35', videoUrl: undefined },
  { id: 20, category: 'lifestyle', lifecycle: 'peak', platform: 'instagram', platformLabel: 'REELS', time: '5시간 전',
    thumb: '🛋️', title: '미니멀 자취방 꾸미기 비용 전부 공개', creator: '@minimal_room_kr',
    views: 810000, likes: 28000, comments: 1600, shares: 10000, hashtags: '#자취 #인테리어 #미니멀', growth: 37, duration: '0:40', videoUrl: undefined },
  // edu
  { id: 21, category: 'edu', lifecycle: 'rising', platform: 'instagram', platformLabel: 'REELS', time: '2시간 전',
    thumb: '📊', title: '유튜브 알고리즘 완전 정복 3분 정리', creator: '@creator_lab_kr',
    views: 480000, likes: 61000, comments: 3100, shares: 24000, hashtags: '#유튜브 #알고리즘 #크리에이터', growth: 134, duration: '0:28', videoUrl: undefined },
  { id: 22, category: 'edu', lifecycle: 'peak', platform: 'instagram', platformLabel: 'REELS', time: '6시간 전',
    thumb: '🎓', title: '취준생 포트폴리오 초보도 이렇게 만들어', creator: '@portfolio_kr',
    views: 740000, likes: 26000, comments: 1400, shares: 9000, hashtags: '#취업 #포트폴리오 #자기계발', growth: 37, duration: '0:35', videoUrl: undefined },
  // gaming
  { id: 23, category: 'gaming', lifecycle: 'rising', platform: 'instagram', platformLabel: 'REELS', time: '1시간 전',
    thumb: '🖥️', title: '스팀 세일 숨겨진 갓겜 발굴했다', creator: '@steam_finder_kr',
    views: 620000, likes: 79000, comments: 4100, shares: 32000, hashtags: '#스팀 #게임추천 #인디게임', growth: 134, duration: '0:30', videoUrl: undefined },
  { id: 24, category: 'gaming', lifecycle: 'peak', platform: 'instagram', platformLabel: 'REELS', time: '5시간 전',
    thumb: '📱', title: '포켓몬고 요즘 이렇게 즐기는 거임', creator: '@pokego_kr',
    views: 510000, likes: 18000, comments: 1000, shares: 7000, hashtags: '#포켓몬고 #모바일게임', growth: 37, duration: '0:25', videoUrl: undefined },
  // fitness
  { id: 25, category: 'fitness', lifecycle: 'rising', platform: 'instagram', platformLabel: 'REELS', time: '35분 전',
    thumb: '🧘', title: '스쿼트 10개가 이렇게 힘든 이유 있었음', creator: '@pt_class_kr',
    views: 770000, likes: 99000, comments: 4900, shares: 38000, hashtags: '#스쿼트 #운동 #PT', growth: 135, duration: '0:28', videoUrl: undefined },
  { id: 26, category: 'fitness', lifecycle: 'peak', platform: 'instagram', platformLabel: 'REELS', time: '4시간 전',
    thumb: '🤸', title: '필라테스 초보 동작 5가지 같이 해봐요', creator: '@pilates_daily_kr',
    views: 890000, likes: 31000, comments: 1600, shares: 12000, hashtags: '#필라테스 #홈트 #운동', growth: 37, duration: '0:40', videoUrl: undefined },
  // art
  { id: 27, category: 'art', lifecycle: 'rising', platform: 'instagram', platformLabel: 'REELS', time: '2시간 전',
    thumb: '🎵', title: '혼자 쓴 가사로 노래 만들기 도전해봤어', creator: '@songwrite_kr',
    views: 340000, likes: 44000, comments: 2300, shares: 17000, hashtags: '#작사 #작곡 #인디', growth: 136, duration: '0:35', videoUrl: undefined },
  { id: 28, category: 'art', lifecycle: 'peak', platform: 'instagram', platformLabel: 'REELS', time: '6시간 전',
    thumb: '📷', title: '필름 사진 요즘 이렇게 찍음', creator: '@analog_shot_kr',
    views: 670000, likes: 23000, comments: 1500, shares: 8500, hashtags: '#필름사진 #아날로그 #감성', growth: 37, duration: '0:30', videoUrl: undefined },
];
