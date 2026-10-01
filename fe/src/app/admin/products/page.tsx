'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Boxes, Plus, Edit2, Trash2, CheckCircle2, AlertCircle, Shield, ExternalLink } from 'lucide-react';
import AdminHeader from '@/cms/components/AdminHeader';
import { INITIAL_PRODUCTS, Product } from '@/cms/lib/cms-data';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);

  return (
    <div className="flex-1 flex flex-col bg-slate-50 min-h-screen">
      <AdminHeader 
        title="Quản Lý Sản Phẩm MGO Remak" 
        subtitle="Quản lý danh sách, thông số kỹ thuật PCCC, độ dày và bảng giá niêm yết"
        actionText="Thêm Sản Phẩm Mới"
        onAction={() => alert('Chức năng thêm sản phẩm mới (Form Modal)')}
      />

      <div className="p-6 max-w-7xl w-full mx-auto space-y-6">
        <div className="bg-white rounded-2xl border-2 border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 text-slate-600 font-black uppercase tracking-wider text-xs border-b-2 border-slate-200">
                <tr>
                  <th className="py-4 px-5">Tên Sản Phẩm</th>
                  <th className="py-4 px-5">Tiêu Chuẩn PCCC</th>
                  <th className="py-4 px-5">Quy Cách (Dày / Tỷ Trọng)</th>
                  <th className="py-4 px-5">Giá Niêm Yết (VND/m²)</th>
                  <th className="py-4 px-5">Trạng Thái</th>
                  <th className="py-4 px-5 text-right">Thao Tác</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-slate-100">
                {products.map((prod) => (
                  <tr key={prod.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-5">
                      <div className="font-extrabold text-slate-900 text-base">{prod.name}</div>
                      <div className="text-xs text-slate-400 font-medium mt-0.5">Slug: /{prod.slug}</div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#F4F9E8] text-[#5F8A03] border-2 border-[#7CB305]/40">
                        <Shield size={14} /> {prod.eiRating}
                      </span>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-bold text-slate-800 text-sm">{prod.thickness}</div>
                      <div className="text-xs text-slate-400 font-medium">{prod.density}</div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-black text-[#F26522] text-base">
                        {prod.price.toLocaleString()} đ
                      </div>
                      <div className="text-xs text-slate-400 font-medium">Đơn vị: {prod.unit}</div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-bold bg-emerald-50 text-emerald-700 border-2 border-emerald-200">
                        <CheckCircle2 size={13} /> Đang Bán
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/san-pham/${prod.slug}`}
                          target="_blank"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 border border-transparent hover:border-slate-200"
                          title="Xem ngoài Live Web"
                        >
                          <ExternalLink size={15} />
                        </Link>
                        <button
                          type="button"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-[#5F8A03] hover:bg-slate-100 border border-transparent hover:border-slate-200 cursor-pointer"
                          title="Chỉnh sửa sản phẩm"
                        >
                          <Edit2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
