import { NextResponse } from "next/server";
import type { ScriptRequest, ScriptResponse } from "@/lib/types";

// TODO: 경재 구현 예정
// 1. direction(사용자 수정 반영) + reference + persona를 받아 Claude에 대본 생성 요청
// 2. 3가지 톤 대본 + 추천 톤 + 적합도 점수(0~10) 반환
export async function POST(req: Request) {
  const _body: ScriptRequest = await req.json();

  const stub: ScriptResponse = {
    recommendedTone: "hooking",
    toneScore: 0,
    scripts: {
      informative: { hook: "(개발 예정)", body: "(개발 예정)", cta: "(개발 예정)" },
      story:       { hook: "(개발 예정)", body: "(개발 예정)", cta: "(개발 예정)" },
      hooking:     { hook: "(개발 예정)", body: "(개발 예정)", cta: "(개발 예정)" },
    },
  };
  return NextResponse.json(stub);
}
