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
      <div className="rounded-2xl border border-red-100 bg-red-50/50 px-4 py-3 text-center">
        <p className="text-xs font-black uppercase tracking-widest text-red-700">
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
                  className={`h-0.5 flex-1 ${index <= activeIndex ? 'bg-rose-600' : 'bg-pink-100'}`}
                />
              )}
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 transition-colors ${
                  done
                    ? 'border-rose-600 bg-rose-600 text-white'
                    : 'border-pink-200 bg-white text-pink-200'
                } ${current ? 'ring-2 ring-rose-200 ring-offset-2' : ''}`}
              >
                {done ? (
                  <Check className="h-4 w-4" strokeWidth={3} />
                ) : (
                  <span className="text-[10px] font-black">{index + 1}</span>
                )}
              </div>
              {index < ORDER_STATUS_STEPS.length - 1 && (
                <div
                  className={`h-0.5 flex-1 ${index < activeIndex ? 'bg-rose-600' : 'bg-pink-100'}`}
                />
              )}
            </div>
            <span
              className={`mt-2 text-[8px] sm:text-[9px] font-black uppercase tracking-wider text-center truncate w-full ${
                current ? 'text-rose-900' : done ? 'text-rose-700/70' : 'text-rose-900/30'
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
