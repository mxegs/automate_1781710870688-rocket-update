'use client';

import React from 'react';
import { STEP_LABELS } from '@/lib/assets';

interface StepIndicatorProps {
  currentStep: number;
  totalSteps?: number;
}

export default function StepIndicator({ currentStep, totalSteps = 6 }: StepIndicatorProps) {
  return (
    <div className="mb-6">
      <div className="mb-2 flex items-center justify-between text-xs text-ckc-muted">
        <span>
          Step {currentStep} of {totalSteps}
        </span>
        <span>{Math.round((currentStep / totalSteps) * 100)}%</span>
      </div>
      <div className="mb-3 h-1 overflow-hidden rounded-full bg-ckc-elevated">
        <div
          className="h-full rounded-full bg-ckc-gold transition-all duration-300"
          style={{ width: `${(currentStep / totalSteps) * 100}%` }}
        />
      </div>
      <span className="ckc-label-pill">{STEP_LABELS[currentStep - 1]}</span>
    </div>
  );
}
