'use client';

// Gọi API Sản phẩm từ CMS (danh sách, form sửa, ảnh đại diện, thứ tự).

import type {
  ProductCms,
  ProductInput,
  ProductListItemCms,
  ProductTypeCms,
  ProductTypeInput,
  SpecOptionCms,
  SpecOptionGroup,
  SpecOptionInput,
} from '@remak/shared/contracts/product';
import { apiFetch, ifMatch } from './api-client';

const json = (body: unknown) => JSON.stringify(body);

export const productsApi = {
  list: (opts?: { trash?: boolean }) =>
    apiFetch<ProductListItemCms[]>(`/products${opts?.trash ? '?trash=true' : ''}`),
  get: (id: string) => apiFetch<ProductCms>(`/products/${id}`),
  create: (body: ProductInput) => apiFetch<ProductCms>('/products', { method: 'POST', body: json(body) }),
  update: (id: string, body: ProductInput, version: string) =>
    apiFetch<ProductCms>(`/products/${id}`, { method: 'PUT', body: json(body), headers: ifMatch(version) }),
  remove: (id: string) => apiFetch<{ success: boolean }>(`/products/${id}`, { method: 'DELETE' }),
  restore: (id: string) => apiFetch<{ success: boolean }>(`/products/${id}/restore`, { method: 'POST' }),
  purge: (id: string) => apiFetch<{ success: boolean }>(`/products/${id}/permanent`, { method: 'DELETE' }),
  reorder: (ids: string[]) => apiFetch<ProductListItemCms[]>('/products/order', { method: 'PUT', body: json({ ids }) }),

  // ── Loại sản phẩm ──
  types: () => apiFetch<ProductTypeCms[]>('/products/types'),
  createType: (body: ProductTypeInput) => apiFetch<ProductTypeCms>('/products/types', { method: 'POST', body: json(body) }),
  updateType: (id: string, body: ProductTypeInput, version: string) =>
    apiFetch<ProductTypeCms>(`/products/types/${id}`, { method: 'PUT', body: json(body), headers: ifMatch(version) }),
  removeType: (id: string) => apiFetch<{ success: boolean }>(`/products/types/${id}`, { method: 'DELETE' }),
  reorderTypes: (ids: string[]) => apiFetch<ProductTypeCms[]>('/products/types/order', { method: 'PUT', body: json({ ids }) }),

  // ── Danh mục thông số ──
  specOptions: () => apiFetch<SpecOptionCms[]>('/products/spec-options'),
  createSpecOption: (body: SpecOptionInput) => apiFetch<SpecOptionCms>('/products/spec-options', { method: 'POST', body: json(body) }),
  updateSpecOption: (id: string, body: Omit<SpecOptionInput, 'group'>, version: string) =>
    apiFetch<SpecOptionCms>(`/products/spec-options/${id}`, { method: 'PUT', body: json(body), headers: ifMatch(version) }),
  removeSpecOption: (id: string) => apiFetch<{ success: boolean }>(`/products/spec-options/${id}`, { method: 'DELETE' }),
  reorderSpecOptions: (group: SpecOptionGroup, ids: string[]) =>
    apiFetch<SpecOptionCms[]>('/products/spec-options/order', { method: 'PUT', body: json({ group, ids }) }),
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
