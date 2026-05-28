import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import TabBar from '@/components/TabBar';
import { useStore } from '@/lib/store';

// next/navigation mock — TabBar가 usePathname()을 사용하기 때문
vi.mock('next/navigation', () => ({
  usePathname: vi.fn(() => '/'),
}));

// next/link mock — jsdom에서 Link 라우팅은 불필요
vi.mock('next/link', () => ({
  default: ({ href, onClick, children, className }: {
    href: string; onClick?: () => void; children: React.ReactNode; className?: string;
  }) => (
    <a href={href} onClick={onClick} className={className}>
      {children}
    </a>
  ),
}));

beforeEach(() => {
  useStore.setState({ currentTab: 'dashboard' });
});

describe('TabBar — 렌더링', () => {
  it('탭 3개 모두 표시 (대시보드, 제작, 마이)', () => {
    render(<TabBar />);
    expect(screen.getByText('대시보드')).toBeInTheDocument();
    expect(screen.getByText('제작')).toBeInTheDocument();
    expect(screen.getByText('마이')).toBeInTheDocument();
  });

  it('각 탭의 링크 href가 올바름', () => {
    render(<TabBar />);
    const links = screen.getAllByRole('link');
    const hrefs = links.map(l => l.getAttribute('href'));
    expect(hrefs).toContain('/');
    expect(hrefs).toContain('/recommend');
    expect(hrefs).toContain('/mypage');
  });
});

describe('TabBar — 활성 탭 표시', () => {
  it('currentTab=dashboard 일 때 대시보드 탭 활성(라임색)', () => {
    useStore.setState({ currentTab: 'dashboard' });
    render(<TabBar />);
    const dashLink = screen.getByText('대시보드').closest('a');
    expect(dashLink?.className).toContain('text-accent-lime');
  });

  it('currentTab=recommend 일 때 제작 탭 활성', () => {
    useStore.setState({ currentTab: 'recommend' });
    render(<TabBar />);
    const recLink = screen.getByText('제작').closest('a');
    expect(recLink?.className).toContain('text-accent-lime');
  });

  it('비활성 탭은 faint 색상', () => {
    useStore.setState({ currentTab: 'dashboard' });
    render(<TabBar />);
    const recLink = screen.getByText('제작').closest('a');
    expect(recLink?.className).toContain('text-text-faint');
  });
});

describe('TabBar — 클릭 인터랙션', () => {
  it('제작 탭 클릭 시 setTab("recommend") 호출', async () => {
    const user = userEvent.setup();
    render(<TabBar />);
    await user.click(screen.getByText('제작'));
    expect(useStore.getState().currentTab).toBe('recommend');
  });

  it('마이 탭 클릭 시 setTab("mypage") 호출', async () => {
    const user = userEvent.setup();
    render(<TabBar />);
    await user.click(screen.getByText('마이'));
    expect(useStore.getState().currentTab).toBe('mypage');
  });
});

describe('TabBar — 온보딩 중 숨김', () => {
  it('/onboarding 경로에서는 null 반환', async () => {
    const { usePathname } = await import('next/navigation');
    vi.mocked(usePathname).mockReturnValue('/onboarding');
    const { container } = render(<TabBar />);
    expect(container.firstChild).toBeNull();
  });

  it('/ 경로에서는 정상 렌더링', async () => {
    const { usePathname } = await import('next/navigation');
    vi.mocked(usePathname).mockReturnValue('/');
    render(<TabBar />);
    expect(screen.getByText('대시보드')).toBeInTheDocument();
  });
});
