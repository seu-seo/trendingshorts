import { describe, it, expect, beforeEach, vi } from 'vitest';

// localStorage mock (jsdom에서는 존재하지만 store 초기화 전 리셋 필요)
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: (key: string) => store[key] ?? null,
    setItem: (key: string, value: string) => { store[key] = value; },
    removeItem: (key: string) => { delete store[key]; },
    clear: () => { store = {}; },
  };
})();

Object.defineProperty(globalThis, 'localStorage', { value: localStorageMock, writable: true });

// store는 모듈 수준에서 초기화되므로 각 테스트 전 직접 reset
import { useStore } from '@/lib/store';

describe('uploadRecords — CRUD', () => {
  beforeEach(() => {
    localStorageMock.clear();
    // store 상태를 시드 없이 빈 배열로 초기화
    useStore.setState({ uploadRecords: [] });
  });

  it('초기 상태: 빈 배열 (localStorage 리셋 후)', () => {
    expect(useStore.getState().uploadRecords).toEqual([]);
  });

  it('addUploadRecord: 기록 추가', () => {
    const { addUploadRecord } = useStore.getState();
    addUploadRecord({ date: '2026-05-28', platform: 'instagram', title: '테스트 영상' });

    const records = useStore.getState().uploadRecords;
    expect(records).toHaveLength(1);
    expect(records[0].title).toBe('테스트 영상');
    expect(records[0].platform).toBe('instagram');
    expect(records[0].date).toBe('2026-05-28');
    expect(records[0].id).toBeTruthy(); // id 자동 생성
  });

  it('addUploadRecord: 여러 건 추가 후 순서 유지', () => {
    const { addUploadRecord } = useStore.getState();
    addUploadRecord({ date: '2026-05-01', platform: 'youtube', title: '첫 번째' });
    addUploadRecord({ date: '2026-05-02', platform: 'tiktok', title: '두 번째' });
    addUploadRecord({ date: '2026-05-03', platform: 'instagram', title: '세 번째' });

    const records = useStore.getState().uploadRecords;
    expect(records).toHaveLength(3);
    expect(records[0].title).toBe('첫 번째');
    expect(records[2].title).toBe('세 번째');
  });

  it('addUploadRecord: url, note 선택 필드 포함', () => {
    const { addUploadRecord } = useStore.getState();
    addUploadRecord({
      date: '2026-05-28',
      platform: 'instagram',
      title: '릴스 테스트',
      url: 'https://instagram.com/reel/abc',
      note: '반응 좋았음',
    });

    const record = useStore.getState().uploadRecords[0];
    expect(record.url).toBe('https://instagram.com/reel/abc');
    expect(record.note).toBe('반응 좋았음');
  });

  it('deleteUploadRecord: id로 삭제', () => {
    const { addUploadRecord } = useStore.getState();
    addUploadRecord({ date: '2026-05-28', platform: 'instagram', title: '삭제할 영상' });
    addUploadRecord({ date: '2026-05-29', platform: 'youtube', title: '남길 영상' });

    const id = useStore.getState().uploadRecords[0].id;
    useStore.getState().deleteUploadRecord(id);

    const records = useStore.getState().uploadRecords;
    expect(records).toHaveLength(1);
    expect(records[0].title).toBe('남길 영상');
  });

  it('deleteUploadRecord: 없는 id 삭제해도 에러 없음', () => {
    const { addUploadRecord, deleteUploadRecord } = useStore.getState();
    addUploadRecord({ date: '2026-05-28', platform: 'instagram', title: '영상' });

    expect(() => deleteUploadRecord('non-existent-id')).not.toThrow();
    expect(useStore.getState().uploadRecords).toHaveLength(1);
  });

  it('updateUploadRecord: 제목 수정', () => {
    const { addUploadRecord, updateUploadRecord } = useStore.getState();
    addUploadRecord({ date: '2026-05-28', platform: 'instagram', title: '원래 제목' });

    const id = useStore.getState().uploadRecords[0].id;
    updateUploadRecord(id, { title: '수정된 제목' });

    const record = useStore.getState().uploadRecords[0];
    expect(record.title).toBe('수정된 제목');
    expect(record.platform).toBe('instagram'); // 나머지 필드 유지
  });

  it('addUploadRecord: localStorage에 저장됨', () => {
    const { addUploadRecord } = useStore.getState();
    addUploadRecord({ date: '2026-05-28', platform: 'instagram', title: '저장 테스트' });

    const saved = JSON.parse(localStorageMock.getItem('sfp_uploads') ?? '[]');
    expect(saved).toHaveLength(1);
    expect(saved[0].title).toBe('저장 테스트');
  });

  it('deleteUploadRecord: localStorage에서도 제거됨', () => {
    const { addUploadRecord, deleteUploadRecord } = useStore.getState();
    addUploadRecord({ date: '2026-05-28', platform: 'instagram', title: '영상' });
    const id = useStore.getState().uploadRecords[0].id;
    deleteUploadRecord(id);

    const saved = JSON.parse(localStorageMock.getItem('sfp_uploads') ?? '[]');
    expect(saved).toHaveLength(0);
  });
});

describe('uploadGoalDays', () => {
  it('기본값: 5일', () => {
    expect(useStore.getState().uploadGoalDays).toBe(5);
  });

  it('setUploadGoalDays: 값 변경', () => {
    useStore.getState().setUploadGoalDays(7);
    expect(useStore.getState().uploadGoalDays).toBe(7);

    // 원상복구
    useStore.getState().setUploadGoalDays(5);
  });
});

describe('Tab 상태', () => {
  it('초기 탭: dashboard', () => {
    useStore.setState({ currentTab: 'dashboard' });
    expect(useStore.getState().currentTab).toBe('dashboard');
  });

  it('setTab으로 mypage 이동', () => {
    useStore.getState().setTab('mypage');
    expect(useStore.getState().currentTab).toBe('mypage');
    // 복구
    useStore.getState().setTab('dashboard');
  });
});
