'use client';

import React from 'react';
import CustomDesignModal from './CustomDesignModal';
import { Product } from '@/lib/types';

interface ConciergeAppointmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialProduct?: Product | null;
  initialTab?: 'modify' | 'new' | 'consultation';
}

export default function ConciergeAppointmentModal({
  isOpen,
  onClose,
  initialProduct,
  initialTab = 'consultation',
}: ConciergeAppointmentModalProps) {
  return (
    <CustomDesignModal
      isOpen={isOpen}
      onClose={onClose}
      initialProduct={initialProduct}
      initialTab={initialTab}
    />
  );
}
