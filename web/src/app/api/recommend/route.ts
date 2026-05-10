import { NextResponse } from "next/server";
import type { RecommendRequest, RecommendResponse } from "@/lib/types";

// TODO: 규동 구현 예정
// 1. persona + references(3~5개)를 받아 Claude에 콘텐츠 방향 추천 요청
// 2. 사용자가 수정 가능한 direction 텍스트 반환
export async function POST(req: Request) {
  const _body: RecommendRequest = await req.json();

  const stub: RecommendResponse = {
    direction: "(개발 예정) LLM이 레퍼런스를 분석해 콘텐츠 방향을 추천합니다.",
    suggestedTopic: "",
    hookPattern: "",
  };
  return NextResponse.json(stub);
}
