'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import MonthlyStats from '@/components/mypage/MonthlyStats';
import UploadCalendar from '@/components/mypage/UploadCalendar';
import UploadRecordSheet from '@/components/mypage/UploadRecordSheet';

export default function MyPage() {
  const uploadRecords  = useStore((s) => s.uploadRecords);
  const uploadGoalDays = useStore((s) => s.uploadGoalDays);

  const today = new Date();
  const [viewYear, setViewYear]         = useState(today.getFullYear());
  const [viewMonth, setViewMonth]       = useState(today.getMonth()); // 0-indexed
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const handlePrevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };
  const handleNextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };

  return (
    <div className="flex flex-col h-full relative">
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-28 flex flex-col gap-4">
        <MonthlyStats />
        <UploadCalendar
          records={uploadRecords}
          viewYear={viewYear}
          viewMonth={viewMonth}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onDateClick={(date) => setSelectedDate(date)}
          uploadGoalDays={uploadGoalDays}
        />
      </div>

      {/* 날짜 탭 → 아카이빙 바텀 시트 */}
      <UploadRecordSheet
        date={selectedDate}
        onClose={() => setSelectedDate(null)}
      />
    </div>
  );
}
