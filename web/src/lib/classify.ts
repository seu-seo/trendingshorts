import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { TrendItem } from "./mock-data";

const SUBCATEGORIES: Record<string, string[]> = {
  "먹방":       ["레시피", "맛집리뷰", "편의점", "카페·디저트", "먹방ASMR"],
  "뷰티":       ["메이크업", "스킨케어", "헤어", "패션·코디"],
  "댄스":       ["챌린지", "커버댄스", "안무"],
  "일상 브이로그": ["하루일상", "출근·직장", "루틴", "모닝루틴"],
  "게임":       ["게임플레이", "공략·팁", "반응·리액션"],
  "운동":       ["홈트", "헬스·바디빌딩", "요가·필라테스", "다이어트"],
  "펫":         ["강아지", "고양이", "특이한동물"],
  "유머":       ["상황극", "몰카·반응", "밈"],
  "ASMR":      ["먹방ASMR", "자연·환경", "일상ASMR"],
  "DIY":        ["인테리어", "공예·만들기", "요리DIY"],
  "음악":       ["커버·MR제거", "작곡·비트", "뮤직비디오"],
  "여행":       ["국내여행", "해외여행", "맛집투어"],
  "콘텐츠":     ["영화·드라마", "웹툰·애니", "리뷰"],
  "테크":       ["기기리뷰", "언박싱", "IT꿀팁"],
};

function keywordFallback(item: TrendItem): string {
  const text = `${item.title} ${item.tags.join(" ")}`.toLowerCase();
  const subs = SUBCATEGORIES[item.category];
  if (!subs) return item.category;

  if (item.category === "먹방") {
    if (/asmr/.test(text)) return "먹방ASMR";
    if (/레시피|만드는|만들|요리/.test(text)) return "레시피";
    if (/편의점|gs|cu|세븐/.test(text)) return "편의점";
    if (/카페|디저트|케이크|빵/.test(text)) return "카페·디저트";
    return "맛집리뷰";
  }
  if (item.category === "뷰티") {
    if (/패션|코디|옷|룩/.test(text)) return "패션·코디";
    if (/헤어|머리|염색/.test(text)) return "헤어";
    if (/스킨|피부|세럼|크림/.test(text)) return "스킨케어";
    return "메이크업";
  }
  if (item.category === "운동") {
    if (/요가|필라테스/.test(text)) return "요가·필라테스";
    if (/헬스|근육|바디/.test(text)) return "헬스·바디빌딩";
    if (/다이어트|살/.test(text)) return "다이어트";
    return "홈트";
  }
  if (item.category === "펫") {
    if (/강아지|댕댕|멍/.test(text)) return "강아지";
    if (/고양이|냥/.test(text)) return "고양이";
    return "특이한동물";
  }
  if (item.category === "여행") {
    if (/해외|일본|태국|유럽|미국/.test(text)) return "해외여행";
    if (/맛집|먹/.test(text)) return "맛집투어";
    return "국내여행";
  }
  return subs[0];
}

export async function classifyItems(items: TrendItem[]): Promise<TrendItem[]> {
  const API_KEY = process.env.ANTHROPIC_API_KEY;
  if (!API_KEY) {
    return items.map(item => ({ ...item, subcategory: keywordFallback(item) }));
  }

  const categoryList = Object.entries(SUBCATEGORIES)
    .map(([cat, subs]) => `${cat}: ${subs.join(", ")}`)
    .join("\n");

  const results = await Promise.all(
    items.map(async (item) => {
      try {
        const { text } = await generateText({
          model: anthropic("claude-haiku-4-5-20251001"),
          system: `다음 서브카테고리 목록에서 콘텐츠에 가장 잘 맞는 서브카테고리 하나만 단답으로 답해줘. 목록에 없으면 카테고리명을 그대로 답해.\n\n${categoryList}`,
          prompt: `카테고리: ${item.category}\n제목: ${item.title}\n해시태그: ${item.tags.join(" ")}`,
          maxOutputTokens: 20,
        });
        return { ...item, subcategory: text.trim() };
      } catch {
        return { ...item, subcategory: keywordFallback(item) };
      }
    })
  );

  return results;
}
