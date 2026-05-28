import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CategoryTabs from '@/components/dashboard/CategoryTabs';
import { useStore } from '@/lib/store';
import type { Trend } from '@/lib/types';

// 테스트용 트렌드 목업
const makeTrend = (id: number, category: string): Trend => ({
  id,
  category: category as Trend['category'],
  lifecycle: 'rising',
  platform: 'youtube',
  platformLabel: 'SHORTS',
  time: '2h',
  thumb: '',
  title: `트렌드 ${id}`,
  creator: '테스터',
  views: 10000,
  likes: 500,
  comments: 100,
  shares: 50,
  hashtags: '#test',
  growth: 10,
  duration: '0:30',
});

beforeEach(() => {
  useStore.setState({
    filterCategory: null,
    trends: [],
  });
});

describe('CategoryTabs — 렌더링', () => {
  it('트렌드 없어도 "전체" 탭은 항상 표시', () => {
    render(<CategoryTabs />);
    expect(screen.getByText('전체')).toBeInTheDocument();
  });

  it('트렌드에 fitness 있으면 "운동/건강" 탭 표시', () => {
    useStore.setState({ trends: [makeTrend(1, 'fitness')] });
    render(<CategoryTabs />);
    expect(screen.getByText('운동/건강')).toBeInTheDocument();
  });

  it('트렌드에 없는 카테고리 탭은 표시 안 됨', () => {
    useStore.setState({ trends: [makeTrend(1, 'fitness')] });
    render(<CategoryTabs />);
    expect(screen.queryByText('게임')).not.toBeInTheDocument();
    expect(screen.queryByText('뷰티/패션')).not.toBeInTheDocument();
  });

  it('여러 카테고리 트렌드 → 해당 탭들만 표시', () => {
    useStore.setState({
      trends: [
        makeTrend(1, 'fitness'),
        makeTrend(2, 'food'),
        makeTrend(3, 'food'), // 중복 — 탭은 하나만
      ],
    });
    render(<CategoryTabs />);
    expect(screen.getByText('운동/건강')).toBeInTheDocument();
    expect(screen.getByText('요리/먹방')).toBeInTheDocument();
    // food 탭이 중복 렌더링되지 않았는지 확인
    expect(screen.getAllByText('요리/먹방')).toHaveLength(1);
  });
});

describe('CategoryTabs — 카테고리 순서', () => {
  it('CATEGORY_ORDER 기준 정렬: lifestyle → beauty → food → fitness', () => {
    useStore.setState({
      trends: [
        makeTrend(1, 'food'),
        makeTrend(2, 'fitness'),
        makeTrend(3, 'lifestyle'),
        makeTrend(4, 'beauty'),
      ],
    });
    render(<CategoryTabs />);
    const buttons = screen.getAllByRole('button');
    const labels = buttons.map(b => b.textContent?.trim()).filter(Boolean);
    const lifeIdx = labels.findIndex(l => l?.includes('라이프스타일'));
    const beautyIdx = labels.findIndex(l => l?.includes('뷰티'));
    const foodIdx = labels.findIndex(l => l?.includes('요리'));
    const fitIdx = labels.findIndex(l => l?.includes('운동'));
    expect(lifeIdx).toBeLessThan(beautyIdx);
    expect(beautyIdx).toBeLessThan(foodIdx);
    expect(foodIdx).toBeLessThan(fitIdx);
  });
});

describe('CategoryTabs — 활성 상태', () => {
  it('filterCategory=null 이면 "전체" 탭 활성', () => {
    useStore.setState({ filterCategory: null });
    render(<CategoryTabs />);
    // 전체 버튼이 lime 스타일 가지는지
    const allBtn = screen.getByText('전체').closest('button');
    expect(allBtn?.getAttribute('style')).toContain('200, 255, 87');
  });

  it('filterCategory=fitness 이면 "운동/건강" 탭 활성', () => {
    useStore.setState({
      trends: [makeTrend(1, 'fitness')],
      filterCategory: 'fitness',
    });
    render(<CategoryTabs />);
    const fitBtn = screen.getByText('운동/건강').closest('button');
    expect(fitBtn?.getAttribute('style')).toContain('200, 255, 87');
  });
});

describe('CategoryTabs — 클릭 인터랙션', () => {
  it('카테고리 탭 클릭 → setFilterCategory 호출', async () => {
    const user = userEvent.setup();
    useStore.setState({ trends: [makeTrend(1, 'gaming')] });
    render(<CategoryTabs />);
    await user.click(screen.getByText('게임'));
    expect(useStore.getState().filterCategory).toBe('gaming');
  });

  it('"전체" 탭 클릭 → filterCategory null로 초기화', async () => {
    const user = userEvent.setup();
    useStore.setState({
      trends: [makeTrend(1, 'food')],
      filterCategory: 'food',
    });
    render(<CategoryTabs />);
    await user.click(screen.getByText('전체'));
    expect(useStore.getState().filterCategory).toBeNull();
  });
});
