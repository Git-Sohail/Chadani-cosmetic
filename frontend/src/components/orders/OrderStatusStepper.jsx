'use client';

import React from 'react';
import { Check } from 'lucide-react';
import {
  ORDER_STATUS_STEPS,
  getOrderStatusStepIndex,
  getOrderStatusLabel,
} from '../../utils/orderStatus';

export default function OrderStatusStepper({ status }) {
  if (status === 'cancelled') {
    return (
      <div className="border border-red-200 bg-red-50/60 p-3 text-center rounded">
        <p className="text-xs font-semibold uppercase tracking-wider text-red-800">
          Order {getOrderStatusLabel(status)}
        </p>
      </div>
    );
  }

  const activeIndex = getOrderStatusStepIndex(status);

  return (
    <ol className="flex items-center justify-between gap-1 sm:gap-2">
      {ORDER_STATUS_STEPS.map((step, index) => {
        const done = index <= activeIndex;
        const current = index === activeIndex;

        return (
          <li key={step.key} className="flex flex-1 flex-col items-center min-w-0">
            <div className="flex w-full items-center">
              {index > 0 && (
                <div
                  className={`h-0.5 flex-1 ${index <= activeIndex ? 'bg-brand-accent' : 'bg-brand-border'}`}
                />
              )}
              <div
                className={`flex h-7 w-7 sm:h-8 sm:w-8 shrink-0 items-center justify-center rounded-full border transition-colors ${
                  done
                    ? 'border-brand-accent bg-brand-accent text-white'
                    : 'border-brand-border bg-brand-surface text-brand-muted/40'
                } ${current ? 'ring-2 ring-brand-accent/30 ring-offset-1' : ''}`}
              >
                {done ? (
                  <Check className="h-3.5 w-3.5 sm:h-4 sm:w-4" strokeWidth={2.5} />
                ) : (
                  <span className="text-[10px] font-mono">{index + 1}</span>
                )}
              </div>
              {index < ORDER_STATUS_STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 ${index < activeIndex ? 'bg-brand-accent' : 'bg-brand-border'}`}
                />
              )}
            </div>
            <span
              className={`mt-2 text-[9px] font-medium uppercase tracking-wider text-center truncate w-full ${
                current ? 'text-brand-dark font-bold' : done ? 'text-brand-muted' : 'text-brand-muted/40'
              }`}
            >
              {step.label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
