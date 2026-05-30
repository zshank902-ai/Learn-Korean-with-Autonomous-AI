'use client';

import { motion } from 'framer-motion';
import ModuleCard from '@/components/roadmap/ModuleCard';
import type { TopikModule, ModuleStatus } from '@/lib/roadmapTypes';

interface ModuleGridProps {
  modules: TopikModule[];
  moduleStatuses: Record<string, ModuleStatus>;
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
  moduleStatuses,
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
        const status: ModuleStatus = moduleStatuses[module.id] ?? 'locked';
        return (
          <motion.div key={module.id} variants={cardVariants} style={{ height: '100%' }}>
            <ModuleCard
              module={module}
              status={status}
              levelColor={levelColor}
              onStart={onModuleSelect}
            />
          </motion.div>
        );
      })}
    </motion.div>
  );
}
