'use client';

import { useEffect } from 'react';
import { useStore } from '@/lib/store';
import type { Category } from '@/lib/types';
import CreatorRecommendSection from '@/components/recommend/CreatorRecommendSection';

const VALID_CATEGORIES: Category[] = ['food', 'beauty', 'lifestyle', 'edu', 'gaming', 'fitness', 'art'];

export default function RivalsPage() {
  const category = useStore((s) => s.category);
  const personaInput = useStore((s) => s.personaInput);
  const setTab = useStore((s) => s.setTab);

  useEffect(() => {
    setTab('rivals');
  }, [setTab]);

  // 온보딩 결과(category)로 라이벌을 고른다. 비정상/미설정이면 lifestyle로 폴백.
  const cat = (VALID_CATEGORIES.includes(category as Category) ? category : 'lifestyle') as Category;
  const experience = personaInput?.experience ?? 1;

  return (
    <div style={{ minHeight: '100%' }}>
      <div className="px-6 pt-4 pb-3">
        <div className="font-display text-2xl tracking-wider text-text">라이벌 크리에이터</div>
        <div className="text-[12px] text-text-dim mt-1">나와 비슷한 단계의 채널을 보고 다음 목표를 잡아보세요.</div>
      </div>
      <CreatorRecommendSection category={cat} experience={experience} />
    </div>
  );
}
