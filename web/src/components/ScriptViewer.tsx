"use client";

import { useState } from "react";
import type { ScriptResponse, ScriptTone } from "@/lib/types";

const TONE_META: Record<ScriptTone, { label: string; color: string; bg: string }> = {
  informative: { label: "정보형", color: "#2563eb", bg: "#eff6ff" },
  story:       { label: "스토리형", color: "#7c3aed", bg: "#f5f3ff" },
  hooking:     { label: "후킹형", color: "#dc2626", bg: "#fef2f2" },
};

const TONES: ScriptTone[] = ["informative", "story", "hooking"];

interface Props {
  result: ScriptResponse;
}

export default function ScriptViewer({ result }: Props) {
  const [activeTone, setActiveTone] = useState<ScriptTone>(result.recommendedTone);
  const [copied, setCopied] = useState<string | null>(null);

  function copyText(key: string, text: string) {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(key);
      setTimeout(() => setCopied(null), 1500);
    });
  }

  const script = result.scripts[activeTone];
  const meta = TONE_META[activeTone];

  return (
    <div style={{ marginTop: 16 }}>
      {/* 탭 헤더 */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        {TONES.map((tone) => {
          const m = TONE_META[tone];
          const isActive = tone === activeTone;
          const isRecommended = tone === result.recommendedTone;
          return (
            <button
              key={tone}
              onClick={() => setActiveTone(tone)}
              style={{
                flex: 1,
                padding: "8px 4px",
                border: `2px solid ${isActive ? m.color : "#e5e7eb"}`,
                borderRadius: 10,
                background: isActive ? m.bg : "#fff",
                color: isActive ? m.color : "#6b7280",
                fontSize: 12,
                fontWeight: isActive ? 700 : 500,
                cursor: "pointer",
                position: "relative",
              }}
            >
              {m.label}
              {isRecommended && (
                <span style={{
                  position: "absolute",
                  top: -6,
                  right: -4,
                  background: "#f59e0b",
                  color: "#fff",
                  fontSize: 9,
                  fontWeight: 700,
                  borderRadius: 6,
                  padding: "1px 5px",
                }}>
                  추천
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* 적합도 점수 */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
        <span style={{ fontSize: 12, color: "#6b7280" }}>트렌드 적합도</span>
        <div style={{ flex: 1, height: 6, background: "#f3f4f6", borderRadius: 3, overflow: "hidden" }}>
          <div style={{
            width: `${result.toneScore * 10}%`,
            height: "100%",
            background: "linear-gradient(90deg, #6366f1, #8b5cf6)",
            borderRadius: 3,
          }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 700, color: "#6366f1" }}>{result.toneScore}/10</span>
      </div>

      {/* Hook 카드 */}
      <ScriptCard
        label="Hook · 첫 3초"
        color={meta.color}
        bg={meta.bg}
        copyKey={`${activeTone}-hook`}
        copied={copied}
        onCopy={() => copyText(`${activeTone}-hook`, script.hook)}
      >
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "#111827", margin: 0 }}>{script.hook}</p>
      </ScriptCard>

      {/* 본문 카드 */}
      <ScriptCard
        label="본문 · 단계별"
        color={meta.color}
        bg={meta.bg}
        copyKey={`${activeTone}-body`}
        copied={copied}
        onCopy={() => copyText(`${activeTone}-body`, script.body)}
      >
        <ol style={{ margin: 0, paddingLeft: 18 }}>
          {script.body.split("\n").filter(Boolean).map((step, i) => (
            <li key={i} style={{ fontSize: 13, lineHeight: 1.6, color: "#374151", marginBottom: 4 }}>
              {step}
            </li>
          ))}
        </ol>
      </ScriptCard>

      {/* CTA 카드 */}
      <ScriptCard
        label="CTA · 마무리"
        color={meta.color}
        bg={meta.bg}
        copyKey={`${activeTone}-cta`}
        copied={copied}
        onCopy={() => copyText(`${activeTone}-cta`, script.cta)}
      >
        <p style={{ fontSize: 14, lineHeight: 1.6, color: "#111827", margin: 0, fontWeight: 600 }}>{script.cta}</p>
      </ScriptCard>

      {/* 전체 복사 */}
      <button
        onClick={() =>
          copyText(
            `${activeTone}-all`,
            `[HOOK]\n${script.hook}\n\n[본문]\n${script.body}\n\n[CTA]\n${script.cta}`
          )
        }
        style={{
          width: "100%",
          padding: "12px",
          background: copied === `${activeTone}-all` ? "#6366f1" : "#f3f4f6",
          color: copied === `${activeTone}-all` ? "#fff" : "#374151",
          border: "none",
          borderRadius: 10,
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          transition: "background 0.2s",
        }}
      >
        {copied === `${activeTone}-all` ? "복사됨!" : "전체 대본 복사"}
      </button>
    </div>
  );
}

function ScriptCard({
  label, color, bg, copyKey, copied, onCopy, children,
}: {
  label: string;
  color: string;
  bg: string;
  copyKey: string;
  copied: string | null;
  onCopy: () => void;
  children: React.ReactNode;
}) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 12,
      padding: 14,
      marginBottom: 10,
      boxShadow: "0 1px 4px rgba(0,0,0,0.05)",
    }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color, background: bg, borderRadius: 6, padding: "2px 8px" }}>
          {label}
        </span>
        <button
          onClick={onCopy}
          style={{
            fontSize: 11,
            padding: "3px 10px",
            border: "1px solid #e5e7eb",
            borderRadius: 6,
            background: copied === copyKey ? color : "#fff",
            color: copied === copyKey ? "#fff" : "#6b7280",
            cursor: "pointer",
          }}
        >
          {copied === copyKey ? "복사됨!" : "복사"}
        </button>
      </div>
      {children}
    </div>
  );
}
