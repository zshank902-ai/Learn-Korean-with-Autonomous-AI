"use client";

import { motion } from 'framer-motion';
import ModuleCard from '@/components/roadmap/ModuleCard';
import type { TopikModule } from '@/lib/roadmapTypes';
import type { ProgressModule } from '@/hooks/useTopikProgress';

interface ModuleGridProps {
  modules: TopikModule[];
  progressData: ProgressModule[];
  levelColor: string;
  onModuleSelect: (module: TopikModule) => void;
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.07,
    },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 24, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { type: 'spring' as const, stiffness: 320, damping: 22 },
  },
};

export default function ModuleGrid({
  modules,
  progressData,
  levelColor,
  onModuleSelect,
}: ModuleGridProps) {
  if (modules.length === 0) {
    return (
      <div
        style={{
          textAlign: 'center',
          padding: '48px 24px',
          fontFamily: 'Inter, sans-serif',
          color: '#6b7280',
          fontWeight: 600,
          fontSize: '15px',
        }}
      >
        No modules found for this level.
      </div>
    );
  }

  // Create a quick lookup for dynamic progress state
  const progressMap = new Map<string, ProgressModule>(
    progressData?.map(p => [p.module_id, p]) || []
  );

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))',
        gap: '20px',
        padding: '4px 0 24px',
      }}
    >
      {modules.map((module) => {
        const pState = progressMap.get(module.id);
        const status = pState?.status ?? 'locked';
        const progressPercent = pState?.progress_percent ?? 0;
        
        return (
          <motion.div key={module.id} variants={cardVariants} style={{ height: '100%' }}>
            <ModuleCard
              module={module}
              status={status}
              progressPercent={progressPercent}
              levelColor={levelColor}
              onStart={onModuleSelect}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
