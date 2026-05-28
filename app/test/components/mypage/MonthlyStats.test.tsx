import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import MonthlyStats from '@/components/mypage/MonthlyStats';
import { useStore } from '@/lib/store';
import type { UploadRecord } from '@/lib/types';

// 날짜를 2026-05-28로 고정 (시드 데이터와 동일한 달)
beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2026-05-28T12:00:00'));
  useStore.setState({
    uploadRecords: [],
    uploadGoalDays: 5,
  });
});

afterEach(() => {
  vi.useRealTimers();
});

const makeRecord = (
  id: string,
  date: string,
  platform: UploadRecord['platform'],
  title = `테스트 ${id}`,
): UploadRecord => ({ id, date, platform, title });

// ─── 렌더링 ────────────────────────────────────────────────────────────
describe('MonthlyStats — 렌더링', () => {
  it('"이번 달 통계" 라벨이 표시된다', () => {
    render(<MonthlyStats />);
    expect(screen.getByText(/이번 달 통계/i)).toBeInTheDocument();
  });

  it('uploadGoalDays=5 → "목표 6회" 뱃지 표시', () => {
    render(<MonthlyStats />);
    expect(screen.getByText(/목표 6회/)).toBeInTheDocument();
  });

  it('업로드 없으면 카운트 0 표시', () => {
    render(<MonthlyStats />);
    expect(screen.getByTestId('upload-count').textContent).toBe('0');
  });

  it('달성률 라벨과 퍼센트 표시', () => {
    render(<MonthlyStats />);
    expect(screen.getByText('달성률')).toBeInTheDocument();
    expect(screen.getByTestId('achievement-rate').textContent).toBe('0%');
  });
});

// ─── 이번 달 카운트 ────────────────────────────────────────────────────
describe('MonthlyStats — 이번 달 업로드 카운트', () => {
  it('이번 달(2026-05) 레코드만 카운트한다', () => {
    useStore.setState({
      uploadRecords: [
        makeRecord('a', '2026-05-10', 'instagram'),
        makeRecord('b', '2026-05-20', 'youtube'),
        makeRecord('c', '2026-04-15', 'instagram'), // 지난 달 — 제외
      ],
      uploadGoalDays: 5,
    });
    render(<MonthlyStats />);
    expect(screen.getByTestId('upload-count').textContent).toBe('2');
  });

  it('5건 업로드 → 5 표시', () => {
    useStore.setState({
      uploadRecords: [
        makeRecord('1', '2026-05-05', 'instagram'),
        makeRecord('2', '2026-05-10', 'youtube'),
        makeRecord('3', '2026-05-15', 'instagram'),
        makeRecord('4', '2026-05-20', 'instagram'),
        makeRecord('5', '2026-05-23', 'instagram'),
      ],
      uploadGoalDays: 5,
    });
    render(<MonthlyStats />);
    expect(screen.getByTestId('upload-count').textContent).toBe('5');
  });

  it('다른 달 레코드는 카운트에 포함되지 않는다', () => {
    useStore.setState({
      uploadRecords: [
        makeRecord('past', '2026-03-01', 'tiktok'),
        makeRecord('future', '2026-06-01', 'instagram'),
      ],
      uploadGoalDays: 5,
    });
    render(<MonthlyStats />);
    expect(screen.getByTestId('upload-count').textContent).toBe('0');
  });
});

// ─── 달성률 & progress bar ─────────────────────────────────────────────
describe('MonthlyStats — 달성률 progress bar', () => {
  it('0건 → 0%', () => {
    render(<MonthlyStats />);
    expect(screen.getByTestId('achievement-rate').textContent).toBe('0%');
  });

  it('3건 / 목표 6 → 50%', () => {
    useStore.setState({
      uploadRecords: [
        makeRecord('a', '2026-05-01', 'instagram'),
        makeRecord('b', '2026-05-10', 'youtube'),
        makeRecord('c', '2026-05-20', 'tiktok'),
      ],
      uploadGoalDays: 5,
    });
    render(<MonthlyStats />);
    expect(screen.getByTestId('achievement-rate').textContent).toBe('50%');
  });

  it('목표 초과 시 100%로 cap', () => {
    useStore.setState({
      uploadRecords: Array.from({ length: 10 }, (_, i) =>
        makeRecord(`r${i}`, `2026-05-${String(i + 1).padStart(2, '0')}`, 'instagram'),
      ),
      uploadGoalDays: 5, // goal = 6
    });
    render(<MonthlyStats />);
    expect(screen.getByTestId('achievement-rate').textContent).toBe('100%');
  });

  it('progress bar 너비가 달성률 % 값으로 설정된다', () => {
    useStore.setState({
      uploadRecords: [
        makeRecord('a', '2026-05-01', 'instagram'),
        makeRecord('b', '2026-05-10', 'youtube'),
        makeRecord('c', '2026-05-20', 'tiktok'),
      ],
      uploadGoalDays: 5, // goal = 6 → 3/6 = 50%
    });
    render(<MonthlyStats />);
    const bar = screen.getByTestId('progress-bar');
    expect(bar.getAttribute('style')).toContain('width: 50%');
  });
});

// ─── 플랫폼별 breakdown ────────────────────────────────────────────────
describe('MonthlyStats — 플랫폼별 breakdown', () => {
  it('업로드 없으면 "플랫폼별" 섹션 숨김', () => {
    render(<MonthlyStats />);
    expect(screen.queryByText('플랫폼별')).not.toBeInTheDocument();
  });

  it('instagram, youtube 있으면 둘 다 표시', () => {
    useStore.setState({
      uploadRecords: [
        makeRecord('a', '2026-05-10', 'instagram'),
        makeRecord('b', '2026-05-15', 'youtube'),
      ],
      uploadGoalDays: 5,
    });
    render(<MonthlyStats />);
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('YouTube')).toBeInTheDocument();
  });

  it('없는 플랫폼(TikTok)은 표시 안 됨', () => {
    useStore.setState({
      uploadRecords: [makeRecord('a', '2026-05-10', 'instagram')],
      uploadGoalDays: 5,
    });
    render(<MonthlyStats />);
    expect(screen.queryByText('TikTok')).not.toBeInTheDocument();
  });

  it('시드 데이터 기준: instagram 4건, youtube 1건만 표시', () => {
    useStore.setState({
      uploadRecords: [
        makeRecord('seed-1', '2026-05-23', 'instagram'),
        makeRecord('seed-2', '2026-05-20', 'instagram'),
        makeRecord('seed-3', '2026-05-15', 'instagram'),
        makeRecord('seed-4', '2026-05-10', 'youtube'),
        makeRecord('seed-5', '2026-05-05', 'instagram'),
      ],
      uploadGoalDays: 5,
    });
    render(<MonthlyStats />);
    expect(screen.getByText('Instagram')).toBeInTheDocument();
    expect(screen.getByText('YouTube')).toBeInTheDocument();
    expect(screen.queryByText('TikTok')).not.toBeInTheDocument();
  });
});

// ─── 월별 목표 계산 ────────────────────────────────────────────────────
describe('MonthlyStats — uploadGoalDays → 월 목표 변환', () => {
  it('uploadGoalDays=10 → 목표 3회 (ceil(30/10))', () => {
    useStore.setState({ uploadRecords: [], uploadGoalDays: 10 });
    render(<MonthlyStats />);
    expect(screen.getByText(/목표 3회/)).toBeInTheDocument();
  });

  it('uploadGoalDays=1 → 목표 30회 (ceil(30/1))', () => {
    useStore.setState({ uploadRecords: [], uploadGoalDays: 1 });
    render(<MonthlyStats />);
    expect(screen.getByText(/목표 30회/)).toBeInTheDocument();
  });

  it('uploadGoalDays=7 → 목표 5회 (ceil(30/7)=5)', () => {
    useStore.setState({ uploadRecords: [], uploadGoalDays: 7 });
    render(<MonthlyStats />);
    expect(screen.getByText(/목표 5회/)).toBeInTheDocument();
  });
});
