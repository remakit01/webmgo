'use client';

import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { FAQ_LIST } from '@/data/products';
import { FaqItem } from '@/types';
import SectionHeading from '@/components/ui/SectionHeading';

interface FaqAccordionProps {
  items?: FaqItem[];
  showHeading?: boolean;
}

export default function FaqAccordion({
  items = FAQ_LIST,
  showHeading = true,
}: FaqAccordionProps) {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  return (
    <section className="max-w-[1440px] mx-auto px-4 lg:px-8">
      {showHeading && (
        <SectionHeading 
          title="Giải Đáp Kỹ Thuật Thường Gặp"
        />
      )}

      <div className="max-w-3xl mx-auto space-y-4">
        {items.map((faq, idx) => (
          <div key={idx} className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
            <button 
              onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
              className="w-full px-5 py-4 text-left font-bold text-slate-900 flex items-center justify-between gap-4 hover:text-[#5F8A03] transition-colors cursor-pointer"
            >
              <span>{faq.q}</span>
              <ChevronDown 
                size={18} 
                className={`text-slate-400 transition-transform flex-shrink-0 ${
                  openFaq === idx ? 'rotate-180 text-[#7CB305]' : ''
                }`} 
              />
            </button>
            {openFaq === idx && (
              <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                {faq.a}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
}
