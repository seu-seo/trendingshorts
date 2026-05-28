import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UploadCalendar from '@/components/mypage/UploadCalendar';
import type { UploadRecord } from '@/lib/types';

// 오늘 날짜 고정: 2026-05-28
const FIXED_TODAY = new Date('2026-05-28T12:00:00');
vi.setSystemTime(FIXED_TODAY);

const makeRecord = (date: string, override?: Partial<UploadRecord>): UploadRecord => ({
  id: `test-${date}`,
  date,
  platform: 'instagram',
  title: `테스트 영상 ${date}`,
  ...override,
});

const defaultProps = {
  records: [],
  viewYear: 2026,
  viewMonth: 4, // 5월 (0-indexed)
  onPrevMonth: vi.fn(),
  onNextMonth: vi.fn(),
};

describe('UploadCalendar — 배너', () => {
  it('기록 없을 때: "아직 기록이 없어요" 표시', () => {
    render(<UploadCalendar {...defaultProps} records={[]} />);
    expect(screen.getByText(/아직 기록이 없어요/)).toBeInTheDocument();
  });

  it('오늘 업로드: "오늘 업로드했어요" 표시', () => {
    const todayRecord = makeRecord('2026-05-28');
    render(<UploadCalendar {...defaultProps} records={[todayRecord]} />);
    expect(screen.getByText(/오늘 업로드했어요/)).toBeInTheDocument();
  });

  it('5일 전 마지막 업로드: "벌써 5일이 지났어요!" 표시', () => {
    const record = makeRecord('2026-05-23');
    render(<UploadCalendar {...defaultProps} records={[record]} />);
    expect(screen.getByText(/벌써/)).toBeInTheDocument();
    // "5"는 달력 날짜와 겹치므로 핑크 span으로 특정
    const pinkSpan = document.querySelector('span[style*="255, 61, 127"]');
    expect(pinkSpan).toBeTruthy();
    expect(pinkSpan?.textContent).toBe('5');
    expect(screen.getByText(/일이 지났어요!/)).toBeInTheDocument();
  });

  it('uploadGoalDays prop이 있으면 뱃지 표시', () => {
    render(<UploadCalendar {...defaultProps} uploadGoalDays={5} />);
    expect(screen.getByText(/업로드 주기 : 5일/)).toBeInTheDocument();
  });

  it('uploadGoalDays 없으면 뱃지 미표시', () => {
    render(<UploadCalendar {...defaultProps} />);
    expect(screen.queryByText(/업로드 주기/)).not.toBeInTheDocument();
  });

  it('목표 초과 시 독려 문구 표시', () => {
    const record = makeRecord('2026-05-23'); // 5일 전, 목표 5일
    render(<UploadCalendar {...defaultProps} records={[record]} uploadGoalDays={5} />);
    expect(screen.getByText(/꾸준한 인게이지먼트를 위해/)).toBeInTheDocument();
    expect(screen.getByText(/오늘 편집 한 번 어떨까요/)).toBeInTheDocument();
  });

  it('목표 미초과 시 독려 문구 미표시', () => {
    const record = makeRecord('2026-05-26'); // 2일 전, 목표 5일
    render(<UploadCalendar {...defaultProps} records={[record]} uploadGoalDays={5} />);
    expect(screen.queryByText(/꾸준한 인게이지먼트를 위해/)).not.toBeInTheDocument();
  });
});

describe('UploadCalendar — 달력 렌더링', () => {
  it('2026년 5월 표시', () => {
    render(<UploadCalendar {...defaultProps} />);
    expect(screen.getByText('2026. 5월')).toBeInTheDocument();
  });

  it('요일 헤더 7개 표시', () => {
    render(<UploadCalendar {...defaultProps} />);
    ['일', '월', '화', '수', '목', '금', '토'].forEach((day) => {
      expect(screen.getByText(day)).toBeInTheDocument();
    });
  });

  it('5월 31일까지 날짜 렌더링', () => {
    render(<UploadCalendar {...defaultProps} />);
    expect(screen.getByText('1')).toBeInTheDocument();
    expect(screen.getByText('31')).toBeInTheDocument();
  });

  it('업로드 기록 있는 날 닷(dot) 표시', () => {
    const record = makeRecord('2026-05-15');
    render(<UploadCalendar {...defaultProps} records={[record]} />);
    // 닷은 div.w-\[5px\] 클래스로 존재
    const dots = document.querySelectorAll('.bg-accent-lime');
    expect(dots.length).toBeGreaterThan(0);
  });
});

describe('UploadCalendar — 월 네비게이션', () => {
  it('이전 달 버튼 클릭 시 onPrevMonth 호출', () => {
    const onPrev = vi.fn();
    render(<UploadCalendar {...defaultProps} onPrevMonth={onPrev} />);
    // 첫 번째 chevron 버튼 (이전 달)
    const buttons = screen.getAllByRole('button');
    const prevBtn = buttons[0];
    fireEvent.click(prevBtn);
    expect(onPrev).toHaveBeenCalledOnce();
  });

  it('다음 달 버튼 클릭 시 onNextMonth 호출', () => {
    const onNext = vi.fn();
    render(<UploadCalendar {...defaultProps} onNextMonth={onNext} />);
    const buttons = screen.getAllByRole('button');
    const nextBtn = buttons[1];
    fireEvent.click(nextBtn);
    expect(onNext).toHaveBeenCalledOnce();
  });

  it('4월(viewMonth=3) 렌더링 시 4월 표시', () => {
    render(<UploadCalendar {...defaultProps} viewMonth={3} />);
    expect(screen.getByText('2026. 4월')).toBeInTheDocument();
  });
});

describe('UploadCalendar — 날짜 클릭', () => {
  it('날짜 클릭 시 onDateClick("YYYY-MM-DD") 호출', () => {
    const onDateClick = vi.fn();
    render(<UploadCalendar {...defaultProps} onDateClick={onDateClick} />);
    // 15일 클릭
    const dayButtons = screen.getAllByRole('button');
    // 날짜 버튼 중 "15" 찾기
    const day15 = dayButtons.find((btn) => btn.textContent?.trim().startsWith('15'));
    expect(day15).toBeTruthy();
    fireEvent.click(day15!);
    expect(onDateClick).toHaveBeenCalledWith('2026-05-15');
  });

  it('미래 날짜는 disabled 처리 (클릭 불가)', () => {
    const onDateClick = vi.fn();
    render(<UploadCalendar {...defaultProps} onDateClick={onDateClick} />);
    // 29일 (오늘 28일 기준 미래)
    const dayButtons = screen.getAllByRole('button');
    const day29 = dayButtons.find((btn) => btn.textContent?.trim().startsWith('29'));
    if (day29) {
      fireEvent.click(day29);
      expect(onDateClick).not.toHaveBeenCalled();
    }
  });
});

describe('UploadCalendar — 복수 기록', () => {
  it('같은 날 2개 기록: 닷 2개 표시', () => {
    const records = [
      makeRecord('2026-05-10', { id: 'a' }),
      makeRecord('2026-05-10', { id: 'b', platform: 'youtube' }),
    ];
    render(<UploadCalendar {...defaultProps} records={records} />);
    const dots = document.querySelectorAll('.bg-accent-lime');
    // 최소 2개 이상의 닷
    expect(dots.length).toBeGreaterThanOrEqual(2);
  });

  it('같은 날 4개 기록이어도 닷은 최대 3개', () => {
    const records = Array.from({ length: 4 }, (_, i) =>
      makeRecord('2026-05-10', { id: `r${i}`, platform: 'instagram' })
    );
    render(<UploadCalendar {...defaultProps} records={records} />);
    // 날짜 버튼 안의 닷만 카운트 (범례 닷 제외)
    const dayButtons = screen.getAllByRole('button');
    const day10Btn = dayButtons.find((btn) => btn.textContent?.trim().startsWith('10'));
    expect(day10Btn).toBeTruthy();
    const dotsInDay = day10Btn!.querySelectorAll('.bg-accent-lime');
    // min(4, 3) = 3개
    expect(dotsInDay.length).toBe(3);
  });
});
