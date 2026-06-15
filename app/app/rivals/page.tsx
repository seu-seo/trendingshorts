'use client';

import { useEffect, useState } from 'react';
import { useStore } from '@/lib/store';
import type { Category } from '@/lib/types';
import { applyTheme, clearTheme } from '@/lib/themes/applyTheme';
import type { ThemeName } from '@/lib/themes/types';
import ThemeSwitcher from '@/components/ThemeSwitcher';
import CreatorRecommendV7 from '@/components/recommend/CreatorRecommendV7';

const VALID_CATEGORIES: Category[] = ['food', 'beauty', 'lifestyle', 'edu', 'gaming', 'fitness', 'art'];

export default function RivalsPage() {
  const category = useStore((s) => s.category);
  const personaInput = useStore((s) => s.personaInput);
  const setTab = useStore((s) => s.setTab);

  // v7 PoC: A(인디고)/C(퍼플) 테마 전환. 이탈 시 해제.
  const [theme, setTheme] = useState<ThemeName>('indigo');
  useEffect(() => {
    applyTheme(theme);
    return () => clearTheme();
  }, [theme]);

  useEffect(() => {
    setTab('rivals');
  }, [setTab]);

  // 온보딩 결과(category)로 라이벌을 고른다. 비정상/미설정이면 lifestyle로 폴백.
  const cat = (VALID_CATEGORIES.includes(category as Category) ? category : 'lifestyle') as Category;
  const experience = personaInput?.experience ?? 1;

  return (
    <div style={{ minHeight: '100%', background: 'var(--color-bg)' }}>
      <ThemeSwitcher value={theme} onChange={setTheme} options={['indigo', 'purple']} />
      <div className="px-6 pt-5 pb-3">
        <div className="leading-tight tracking-tight"
          style={{ fontFamily: "'Cafe24 Dangdanghae', Impact, sans-serif", fontSize: '34px', color: 'var(--color-ink)' }}>
          라이벌 크리에이터
        </div>
        <div className="text-[12px] mt-1.5" style={{ color: 'var(--color-ink-2)' }}>
          나와 비슷한 단계의 채널을 보고 다음 목표를 잡아보세요.
        </div>
      </div>
      <CreatorRecommendV7 category={cat} experience={experience} />
    </div>
  );
}
