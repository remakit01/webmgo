'use client';

// Gọi API Sản phẩm từ CMS (danh sách, form sửa, ảnh đại diện, thứ tự).

import type { ProductCms, ProductInput, ProductListItemCms } from '@remak/shared/contracts/product';
import { apiFetch, ifMatch } from './api-client';

const json = (body: unknown) => JSON.stringify(body);

export const productsApi = {
  list: () => apiFetch<ProductListItemCms[]>('/products'),
  get: (id: string) => apiFetch<ProductCms>(`/products/${id}`),
  create: (body: ProductInput) => apiFetch<ProductCms>('/products', { method: 'POST', body: json(body) }),
  update: (id: string, body: ProductInput, version: string) =>
    apiFetch<ProductCms>(`/products/${id}`, { method: 'PUT', body: json(body), headers: ifMatch(version) }),
  remove: (id: string) => apiFetch<{ success: boolean }>(`/products/${id}`, { method: 'DELETE' }),
  reorder: (ids: string[]) => apiFetch<ProductListItemCms[]>('/products/order', { method: 'PUT', body: json({ ids }) }),
  updateCover: (id: string, file: File, version: string) => {
    const form = new FormData();
    form.append('image', file);
    return apiFetch<ProductCms>(`/products/${id}/cover`, { method: 'PUT', body: form, headers: ifMatch(version) });
  },
  /** Ảnh chèn trong mô tả (editor) */
  uploadContentImage: async (file: File) => {
    const form = new FormData();
    form.append('image', file);
    return (await apiFetch<{ url: string }>('/media/images?scope=products', { method: 'POST', body: form })).url;
  },
};
