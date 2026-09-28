import { FileCode2, FileCheck2, Shield, BookOpen } from 'lucide-react';
import type React from 'react';
import type { DocType } from '@/data/documents';

export type TypeConfig = {
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  badge: string;
  badgeText: string;
  cardAccent: string;
  downloadBg: string;
  downloadHover: string;
  description: string;
  label: string;
};

export const TYPE_CONFIG: Record<DocType | 'all', TypeConfig> = {
  all: {
    icon: FileCode2,
    iconBg: 'bg-slate-100',
    iconColor: 'text-slate-500',
    badge: 'bg-slate-100 text-slate-600',
    badgeText: 'Tất Cả',
    cardAccent: 'border-slate-300',
    downloadBg: 'bg-slate-700',
    downloadHover: 'hover:bg-slate-600',
    description: '',
    label: 'Tất Cả',
  },
  cad: {
    icon: FileCode2,
    iconBg: 'bg-blue-50',
    iconColor: 'text-blue-600',
    badge: 'bg-blue-50 text-blue-700',
    badgeText: 'CAD',
    cardAccent: 'border-blue-400',
    downloadBg: 'bg-blue-600',
    downloadHover: 'hover:bg-blue-700',
    description: 'Bản vẽ CAD ống gió, vách ngăn chịu lửa',
    label: 'CAD / DWG',
  },
  ibst: {
    icon: FileCheck2,
    iconBg: 'bg-[#F4F9E8]',
    iconColor: 'text-[#5F8A03]',
    badge: 'bg-[#F4F9E8] text-[#5F8A03]',
    badgeText: 'IBST',
    cardAccent: 'border-[#7CB305]',
    downloadBg: 'bg-[#5F8A03]',
    downloadHover: 'hover:bg-[#7CB305]',
    description: 'Biên bản đốt lò kiểm định IBST công chứng',
    label: 'Biên Bản IBST',
  },
  cert: {
    icon: Shield,
    iconBg: 'bg-amber-50',
    iconColor: 'text-amber-600',
    badge: 'bg-amber-50 text-amber-700',
    badgeText: 'CERT',
    cardAccent: 'border-amber-400',
    downloadBg: 'bg-amber-600',
    downloadHover: 'hover:bg-amber-700',
    description: 'ISO 1182, TCVN, QUATEST 3, giấy phép BXD',
    label: 'Chứng Chỉ',
  },
  guide: {
    icon: BookOpen,
    iconBg: 'bg-purple-50',
    iconColor: 'text-purple-600',
    badge: 'bg-purple-50 text-purple-700',
    badgeText: 'GUIDE',
    cardAccent: 'border-purple-400',
    downloadBg: 'bg-purple-600',
    downloadHover: 'hover:bg-purple-700',
    description: 'Quy trình thi công, TDS tấm MGO FireOFF',
    label: 'Hướng Dẫn KT',
  },
};

export const CERT_BADGE_COLORS: Record<string, string> = {
  'IBST':           'bg-[#F4F9E8] text-[#5F8A03]',
  'TCVN 9311':      'bg-blue-50 text-blue-700',
  'ISO 1182':       'bg-amber-50 text-amber-700',
  'Bureau Veritas': 'bg-sky-50 text-sky-700',
  'QUATEST 3':      'bg-orange-50 text-orange-700',
  'BXD':            'bg-rose-50 text-rose-700',
};

export const AUTH_BADGES = ['IBST', 'ISO 1182', 'QUATEST 3', 'BXD'];

export const TYPE_ACCENT_BAR: Record<string, string> = {
  cad:   'bg-blue-400',
  ibst:  'bg-[#5F8A03]',
  cert:  'bg-amber-500',
  guide: 'bg-purple-500',
};

export function handleDownload(url: string, title: string) {
  const a = document.createElement('a');
  a.href = url;
  a.download = title;
  a.click();
}
