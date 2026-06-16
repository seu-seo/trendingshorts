'use client';

import { useState } from 'react';
import type { AgeGroup, OnboardingPrefs, PlatformFilter } from '@/lib/types';

interface OnboardingPrefsScreenProps {
  onComplete: (prefs: OnboardingPrefs) => void;
  onSkip?: () => void;
  onBack?: () => void;
}

const PLATFORMS: { val: PlatformFilter; label: string }[] = [
  { val: 'tiktok', label: '틱톡' },
  { val: 'instagram', label: '인스타그램' },
  { val: 'youtube', label: '유튜브' },
  { val: 'all', label: '전체' },
];

const CATEGORIES: { cat: string; label: string }[] = [
  { cat: 'food', label: '먹방/요리' },
  { cat: 'beauty', label: '뷰티' },
  { cat: 'fitness', label: '운동/홈트' },
  { cat: 'lifestyle', label: '여행/라이프' },
  { cat: 'gaming', label: '게임' },
  { cat: 'art', label: '패션/아트' },
  { cat: 'edu', label: '교육/정보' },
];

const AGES: { val: AgeGroup; label: string }[] = [
  { val: '10s', label: '10대' },
  { val: '20s', label: '20대' },
  { val: '30s', label: '30대' },
  { val: '40s', label: '40대' },
  { val: '50+', label: '50+' },
];

export default function OnboardingPrefsScreen({ onComplete, onSkip, onBack }: OnboardingPrefsScreenProps) {
  const [platform, setPlatform] = useState<PlatformFilter | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [customCat, setCustomCat] = useState('');
  const [age, setAge] = useState<AgeGroup | null>(null);

  const toggleCategory = (cat: string) => {
    setCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat],
    );
  };

  const ready = platform !== null && age !== null;

  const submit = () => {
    if (!ready) return;
    const custom = customCat.trim();
    const cats = custom ? [...categories, custom] : categories;
    onComplete({ platform: platform!, categories: cats, age });
  };

  return (
    <div className="screen active q-screen q-all-screen" id="screen-q-all">
      <div className="status-bar">
        <span>9:41</span>
        <span style={{ fontSize: '12px' }}>􀙇 􀛪</span>
      </div>
      <div className="q-header">
        <button className="back-btn" onClick={onBack}>←</button>
        <span style={{ fontFamily: 'var(--font-body)', fontSize: '14px', fontWeight: '600', color: 'var(--ink)', flex: '1', textAlign: 'center' }}>취향 설정</span>
        <button className="skip-btn" onClick={onSkip}>건너뛰기</button>
      </div>
      <div className="q-all-scroll">

        {/* Q1: 플랫폼 */}
        <div className="q-all-section">
          <div className="q-all-section-label">플랫폼</div>
          <div className="q-all-section-title">어떤 플랫폼 자주 봐요?</div>
          <div className="simple-chips" id="platform-chips">
            {PLATFORMS.map((p) => (
              <div
                key={p.val}
                className={`chip${platform === p.val ? ' selected' : ''}`}
                onClick={() => setPlatform(p.val)}
              >
                {p.label}
              </div>
            ))}
          </div>
        </div>

        <div className="q-all-divider"></div>

        {/* Q2: 카테고리 */}
        <div className="q-all-section">
          <div className="q-all-section-label">카테고리</div>
          <div className="q-all-section-title">어떤 분야가 궁금해요?</div>
          <div className="simple-chips" id="cat-chips">
            {CATEGORIES.map((c) => (
              <div
                key={c.cat}
                className={`chip chip-sm cat-chip${categories.includes(c.cat) ? ' selected' : ''}`}
                onClick={() => toggleCategory(c.cat)}
              >
                {c.label}
              </div>
            ))}
          </div>
          <div className="cat-or-divider">또는</div>
          <input
            id="cat-custom-input"
            className="cat-custom-input"
            type="text"
            placeholder="직접 입력 (예: 반려동물, 댄스...)"
            value={customCat}
            onChange={(e) => setCustomCat(e.target.value)}
          />
        </div>

        <div className="q-all-divider"></div>

        {/* Q3: 연령대 */}
        <div className="q-all-section">
          <div className="q-all-section-label">시청자 연령</div>
          <div className="q-all-section-title">타깃 연령대가 어떻게 돼요?</div>
          <div className="age-segment" id="age-segment-all">
            <div className="age-segment-slider" id="age-slider-all"></div>
            {AGES.map((a) => (
              <div
                key={a.val}
                className={`age-seg-opt${age === a.val ? ' selected' : ''}`}
                onClick={() => setAge(a.val)}
              >
                {a.label}
              </div>
            ))}
          </div>
        </div>

        <div style={{ height: '24px' }}></div>
      </div>
      <div className="cta-wrap">
        <button className="cta" id="cta-all" disabled={!ready} onClick={submit}>트렌드 보러가기</button>
      </div>
    </div>
  );
}
