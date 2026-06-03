'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import ProtectedRoute from '@/components/ProtectedRoute';
import { TopikRoadmapPanel } from '@/components/panels/TopikRoadmapPanel';
import type { TopikModule } from '@/lib/roadmapTypes';
import type { ComponentType } from 'react';

// Lazy-import heavy exam runner — never loaded unless user clicks "Start Full Exam"
interface MockExamRunnerProps {
  levelId: number;
  levelColor: string;
  xpEarned: number;
  onClose: () => void;
}

const MockExamRunner = dynamic(
  () =>
    import('@/components/roadmap/MockExamRunner') as Promise<{
      default: ComponentType<MockExamRunnerProps>;
    }>,
  { ssr: false },
);

export default function RoadmapPage() {
  const [mockExam, setMockExam] = useState<{
    levelId: number;
    levelColor: string;
    xpEarned: number;
  } | null>(null);

  const handleStartMockExam = (module: TopikModule, levelColor: string) => {
    const levelId = module.level_id ?? 1;
    setMockExam({ levelId, levelColor, xpEarned: module.xp });
  };

  return (
    <ProtectedRoute>
      <div className="flex-1 p-6 md:p-12 max-w-7xl mx-auto w-full space-y-8 relative z-10">
        {/* Main Roadmap Panel */}
        <TopikRoadmapPanel onStartMockExam={handleStartMockExam} />

        {/* Mock Exam Overlay — rendered on top of everything */}
        {mockExam && (
          <MockExamRunner
            levelId={mockExam.levelId}
            levelColor={mockExam.levelColor}
            xpEarned={mockExam.xpEarned}
            onClose={() => setMockExam(null)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
