export type Platform = "youtube" | "tiktok" | "instagram";

export interface TrendItem {
  id: number;
  platform: Platform;
  title: string;
  creator: string;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  category: string;
  subcategory?: string;
  growth: number;
  duration: string;
  thumbnail: string;
  trending_since: string;
  tags: string[];
  videoUrl?: string;
}

export interface PlatformInfo {
  label: string;
  icon: string;
  color: string;
}

export const PLATFORMS: Record<"all" | Platform, PlatformInfo> = {
  all: { label: "전체", icon: "🔥", color: "#FF4500" },
  youtube: { label: "YouTube Shorts", icon: "▶️", color: "#FF0000" },
  tiktok: { label: "TikTok", icon: "♪", color: "#00F2EA" },
  instagram: { label: "Instagram Reels", icon: "◎", color: "#E1306C" },
};

export const CATEGORIES = ["전체", "먹방", "뷰티", "댄스", "일상 브이로그", "게임", "운동", "펫", "유머", "ASMR", "DIY", "음악", "여행", "콘텐츠", "테크"];

export const TRENDS_DATA: TrendItem[] = [
  { id: 1, platform: "youtube", title: "3초 만에 완성하는 초간단 김밥 레시피", creator: "@cook_master_kr", views: 12400000, likes: 890000, comments: 45200, shares: 120000, category: "먹방", growth: 342, duration: "0:58", thumbnail: "🍱", trending_since: "2시간 전", tags: ["#shorts", "#김밥", "#간단레시피", "#요리"] },
  { id: 2, platform: "youtube", title: "강아지가 주인 출근할 때 하는 행동 ㅋㅋ", creator: "@puppy_daily", views: 8700000, likes: 720000, comments: 38100, shares: 95000, category: "펫", growth: 287, duration: "0:45", thumbnail: "🐕", trending_since: "4시간 전", tags: ["#shorts", "#강아지", "#댕댕이", "#펫스타그램"] },
  { id: 3, platform: "youtube", title: "이 운동 하루 5분이면 뱃살 빠집니다", creator: "@fit_korea", views: 6300000, likes: 410000, comments: 22000, shares: 88000, category: "운동", growth: 198, duration: "1:00", thumbnail: "💪", trending_since: "6시간 전", tags: ["#shorts", "#운동", "#다이어트", "#뱃살"] },
  { id: 4, platform: "youtube", title: "갑자기 랩 시작한 할머니 반응 ㅋㅋㅋ", creator: "@daily_humor", views: 15200000, likes: 1100000, comments: 67000, shares: 230000, category: "유머", growth: 520, duration: "0:32", thumbnail: "😂", trending_since: "1시간 전", tags: ["#shorts", "#유머", "#할머니", "#랩"] },
  { id: 5, platform: "youtube", title: "ASMR 한국 편의점 먹방 🇰🇷", creator: "@asmr_heaven", views: 4100000, likes: 290000, comments: 15600, shares: 42000, category: "ASMR", growth: 156, duration: "0:59", thumbnail: "🎧", trending_since: "8시간 전", tags: ["#shorts", "#ASMR", "#편의점", "#먹방"] },
  { id: 6, platform: "youtube", title: "100원으로 명품 느낌 인테리어 DIY", creator: "@diy_queen", views: 3800000, likes: 265000, comments: 18900, shares: 67000, category: "DIY", growth: 134, duration: "0:55", thumbnail: "🔨", trending_since: "10시간 전", tags: ["#shorts", "#DIY", "#인테리어", "#꿀팁"] },
  { id: 7, platform: "tiktok", title: "이 댄스 챌린지 아직도 안 해봤어? 🔥", creator: "@dance_king_kr", views: 22000000, likes: 2400000, comments: 89000, shares: 450000, category: "댄스", growth: 680, duration: "0:15", thumbnail: "💃", trending_since: "30분 전", tags: ["#댄스챌린지", "#틱톡", "#fyp", "#viral"] },
  { id: 8, platform: "tiktok", title: "하루 만에 피부가 달라지는 루틴", creator: "@beauty_guru_kr", views: 9800000, likes: 870000, comments: 42000, shares: 156000, category: "뷰티", growth: 412, duration: "0:22", thumbnail: "✨", trending_since: "2시간 전", tags: ["#뷰티", "#스킨케어", "#피부관리", "#꿀팁"] },
  { id: 9, platform: "tiktok", title: "요즘 MZ 출근 브이로그 현실.zip", creator: "@office_life_kr", views: 7200000, likes: 590000, comments: 35000, shares: 110000, category: "일상 브이로그", growth: 345, duration: "0:30", thumbnail: "💼", trending_since: "3시간 전", tags: ["#브이로그", "#출근", "#MZ세대", "#직장인"] },
  { id: 10, platform: "tiktok", title: "게임하다 소름끼친 순간 TOP3", creator: "@game_master", views: 5500000, likes: 380000, comments: 28000, shares: 72000, category: "게임", growth: 234, duration: "0:28", thumbnail: "🎮", trending_since: "5시간 전", tags: ["#게임", "#소름", "#TOP3", "#gaming"] },
  { id: 11, platform: "tiktok", title: "이 노래 기타로 치면 분위기 미침", creator: "@music_vibe", views: 11000000, likes: 950000, comments: 51000, shares: 180000, category: "음악", growth: 478, duration: "0:18", thumbnail: "🎸", trending_since: "1시간 전", tags: ["#음악", "#기타", "#커버", "#감성"] },
  { id: 12, platform: "tiktok", title: "편의점 신상 조합 역대급 발견 ㅋㅋ", creator: "@food_finder", views: 6800000, likes: 520000, comments: 31000, shares: 94000, category: "먹방", growth: 289, duration: "0:25", thumbnail: "🏪", trending_since: "4시간 전", tags: ["#편의점", "#신상", "#먹방", "#조합"] },
  { id: 13, platform: "instagram", title: "올봄 데일리룩 코디 모음.zip 🌸", creator: "@fashion_daily_kr", views: 4500000, likes: 340000, comments: 19000, shares: 78000, category: "뷰티", growth: 198, duration: "0:20", thumbnail: "👗", trending_since: "3시간 전", tags: ["#데일리룩", "#코디", "#봄패션", "#ootd"] },
  { id: 14, platform: "instagram", title: "카페 사장님이 알려주는 홈카페 꿀팁", creator: "@cafe_owner_tips", views: 3200000, likes: 245000, comments: 14500, shares: 56000, category: "일상 브이로그", growth: 167, duration: "0:35", thumbnail: "☕", trending_since: "6시간 전", tags: ["#홈카페", "#카페", "#꿀팁", "#커피"] },
  { id: 15, platform: "instagram", title: "고양이와 함께하는 아침 루틴 🐱", creator: "@cat_morning", views: 5800000, likes: 480000, comments: 27000, shares: 89000, category: "펫", growth: 256, duration: "0:40", thumbnail: "🐱", trending_since: "2시간 전", tags: ["#고양이", "#모닝루틴", "#캣스타그램", "#일상"] },
  { id: 16, platform: "instagram", title: "서울 야경 타임랩스 🌃", creator: "@seoul_night", views: 2800000, likes: 210000, comments: 11200, shares: 45000, category: "일상 브이로그", growth: 145, duration: "0:28", thumbnail: "🌃", trending_since: "8시간 전", tags: ["#서울", "#야경", "#타임랩스", "#사진"] },
  { id: 17, platform: "instagram", title: "3분 복근 운동 챌린지 💥", creator: "@gym_daily", views: 4100000, likes: 310000, comments: 18000, shares: 67000, category: "운동", growth: 189, duration: "0:30", thumbnail: "🏋️", trending_since: "4시간 전", tags: ["#운동", "#복근", "#챌린지", "#헬스"] },
  { id: 18, platform: "instagram", title: "요즘 핫한 디저트 맛집 리뷰", creator: "@dessert_lover", views: 3600000, likes: 275000, comments: 16000, shares: 52000, category: "먹방", growth: 178, duration: "0:45", thumbnail: "🍰", trending_since: "5시간 전", tags: ["#디저트", "#맛집", "#리뷰", "#카페투어"] },
];

export function formatNumber(num: number): string {
  if (num >= 10000000) return (num / 10000000).toFixed(1) + "천만";
  if (num >= 10000) return (num / 10000).toFixed(1) + "만";
  if (num >= 1000) return (num / 1000).toFixed(1) + "K";
  return num.toString();
}
