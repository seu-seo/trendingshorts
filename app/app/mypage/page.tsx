'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import UploadCalendar from '@/components/mypage/UploadCalendar';

export default function MyPage() {
  const uploadRecords  = useStore((s) => s.uploadRecords);
  const uploadGoalDays = useStore((s) => s.uploadGoalDays);

  const today = new Date();
  const [viewYear, setViewYear]   = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth()); // 0-indexed

  const handlePrevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };
  const handleNextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-28">
        <UploadCalendar
          records={uploadRecords}
          viewYear={viewYear}
          viewMonth={viewMonth}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          uploadGoalDays={uploadGoalDays}
        />
      </div>
    </div>
  );
}
