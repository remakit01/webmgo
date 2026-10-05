// Kiểu dữ liệu dùng chung cho màn hình dịch vi → en trong CMS (Hero, Tin tức, ...).

/** Một ô dịch được: khoá (vd "stats.1.label"), nội dung gốc tiếng Việt, nội dung đã dịch */
export interface TranslatableEntry {
  key: string;
  source: string;
  value: string;
}

export interface TranslationGroupEntry extends TranslatableEntry {
  /** Nhãn hiển thị trong dialog chọn, vd "Đoạn mô tả 1", "Tiêu đề" */
  label: string;
}

/** Nhóm ô hiển thị trong dialog chọn ô để AI dịch */
export interface TranslationGroup {
  id: string;
  title: string;
  entries: TranslationGroupEntry[];
}
