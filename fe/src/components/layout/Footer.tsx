'use client';

import React from 'react';
import Link from '@/components/ui/LocaleLink';
import { useTranslations } from 'next-intl';
import { Phone, Mail, MapPin, ShieldCheck, Flame, Award, ChevronRight } from 'lucide-react';

export default function Footer() {
  const t = useTranslations('Footer');
  const tc = useTranslations('Common');

  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 border-t border-slate-800">
      <div className="max-w-[1440px] mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-slate-800">
          
          {/* CỘT 1: VỀ REMAK */}
          <div>
            <div className="flex items-center gap-2 mb-5">
              <img 
                src="https://mgo.com.vn/wp-content/uploads/2022/08/Logo_remak_800.png" 
                alt={tc('logoAlt')} 
                className="h-10 w-auto  rounded-lg object-contain" 
              />
            </div>
            <p className="text-sm text-slate-400 mb-5 leading-relaxed">
              {t('about')}
            </p>
            <div className="flex flex-col gap-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="text-[#7CB305] flex-shrink-0 mt-0.5" />
                <span>{t('headOffice')}</span>
              </div>
              <div className="flex items-start gap-2.5">
                <MapPin size={16} className="text-[#7CB305] flex-shrink-0 mt-0.5" />
                <span>{t('factory')}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Phone size={16} className="text-[#F26522] flex-shrink-0" />
                <span className="text-white font-bold text-sm">{tc('hotline', { phone: '0902.441.981' })}</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={16} className="text-[#7CB305] flex-shrink-0" />
                <span>{t('email', { email: 'contact@remak.vn' })}</span>
              </div>
            </div>
          </div>

          {/* CỘT 2: SẢN PHẨM MGO */}
          <div>
            <h4 className="text-white font-bold text-base mb-5 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#7CB305] rounded-full"></span>
              {t('productsTitle')}
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-slate-400">
              <li>
                <Link href="/san-pham" className="hover:text-white flex items-center gap-1.5 transition-colors font-semibold text-white">
                  <ChevronRight size={14} className="text-[#7CB305]" /> {t('products.all')}
                </Link>
              </li>
              <li>
                <Link href="/san-pham/tam-mgo-boc-ong-gio-pccc" className="hover:text-white flex items-center gap-1.5 transition-colors">
                  <ChevronRight size={14} className="text-[#7CB305]" /> {t('products.duct')}
                </Link>
              </li>
              <li>
                <Link href="/san-pham/tam-mgo-tieu-chuan-chong-chay" className="hover:text-white flex items-center gap-1.5 transition-colors">
                  <ChevronRight size={14} className="text-[#7CB305]" /> {t('products.standard')}
                </Link>
              </li>
              <li>
                <Link href="/san-pham/tam-mgo-lot-san-chiu-luc" className="hover:text-white flex items-center gap-1.5 transition-colors">
                  <ChevronRight size={14} className="text-[#7CB305]" /> {t('products.floor')}
                </Link>
              </li>
              <li>
                <Link href="/san-pham/tam-mgo-trang-tri-tieu-am" className="hover:text-white flex items-center gap-1.5 transition-colors">
                  <ChevronRight size={14} className="text-[#7CB305]" /> {t('products.acoustic')}
                </Link>
              </li>
              <li>
                <Link href="/san-pham/tam-mgo-chong-an-mon-mos" className="hover:text-white flex items-center gap-1.5 transition-colors">
                  <ChevronRight size={14} className="text-[#7CB305]" /> {t('products.mos')}
                </Link>
              </li>
            </ul>
          </div>

          {/* CỘT 3: HỆ GIẢI PHÁP PCCC */}
          <div>
            <h4 className="text-white font-bold text-base mb-5 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#F26522] rounded-full"></span>
              {t('solutionsTitle')}
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-slate-400">
              <li>
                <Link href="/giai-phap-ung-dung/boc-ong-gio-chong-chay-pccc" className="hover:text-white flex items-center gap-1.5 transition-colors">
                  <ChevronRight size={14} className="text-[#F26522]" /> {t('solutions.duct')}
                </Link>
              </li>
              <li>
                <Link href="/giai-phap-ung-dung/vach-ngan-chong-chay-karaoke-bar" className="hover:text-white flex items-center gap-1.5 transition-colors">
                  <ChevronRight size={14} className="text-[#F26522]" /> {t('solutions.karaoke')}
                </Link>
              </li>
              <li>
                <Link href="/giai-phap-ung-dung/san-chieu-luc-nha-thep-tien-che" className="hover:text-white flex items-center gap-1.5 transition-colors">
                  <ChevronRight size={14} className="text-[#F26522]" /> {t('solutions.floor')}
                </Link>
              </li>
              <li>
                <Link href="/giai-phap-ung-dung/vach-tran-nha-xuong-cong-nghiep" className="hover:text-white flex items-center gap-1.5 transition-colors">
                  <ChevronRight size={14} className="text-[#F26522]" /> {t('solutions.factory')}
                </Link>
              </li>
              <li>
                <Link href="/thu-vien-tai-lieu" className="hover:text-white flex items-center gap-1.5 transition-colors">
                  <ChevronRight size={14} className="text-[#F26522]" /> {t('solutions.ibst')}
                </Link>
              </li>
            </ul>
          </div>

          {/* CỘT 4: CHÍNH SÁCH & ĐẠI LÝ */}
          <div>
            <h4 className="text-white font-bold text-base mb-5 flex items-center gap-2">
              <span className="w-1.5 h-4 bg-[#7CB305] rounded-full"></span>
              {t('policyTitle')}
            </h4>
            <ul className="flex flex-col gap-2.5 text-sm text-slate-400">
              <li>
                <Link href="/dai-ly" className="text-[#7CB305] font-semibold hover:underline flex items-center gap-1.5">
                  <Award size={15} /> {t('policy.dealer')}
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach/chinh-sach-giao-hang" className="hover:text-white flex items-center gap-1.5 transition-colors">
                  <ChevronRight size={14} className="text-slate-600" /> {t('policy.delivery')}
                </Link>
              </li>
              <li>
                <Link href="/chinh-sach/chinh-sach-bao-hanh" className="hover:text-white flex items-center gap-1.5 transition-colors">
                  <ChevronRight size={14} className="text-slate-600" /> {t('policy.warranty')}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="hover:text-white flex items-center gap-1.5 transition-colors">
                  <ChevronRight size={14} className="text-slate-600" /> {t('policy.faq')}
                </Link>
              </li>
              <li>
                <Link href="/bao-gia" className="text-[#F26522] font-semibold hover:underline flex items-center gap-1.5 mt-2">
                  <Flame size={15} /> {t('policy.quote')}
                </Link>
              </li>
            </ul>
          </div>

        </div>

        {/* BẢN QUYỀN */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            {t('copyright', { year: 2026 })}
          </div>
          <div className="flex items-center gap-6">
            <span>{t('standard')}</span>
            <span>{t('eco')}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
