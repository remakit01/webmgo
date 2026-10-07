import { registerDecorator, type ValidationArguments, type ValidationOptions } from 'class-validator';
import { isSafeLink } from '@remak/shared/link';
import { isValidSlug, SLUG_MAX_LENGTH } from '@remak/shared/slug';
import { validateRichDoc } from '@remak/shared/rich-content';

// Decorator class-validator bọc các hàm kiểm tra của @remak/shared — đồng bộ quy tắc cho api và CMS.

/** Kích thước JSON nội dung tối đa (byte gần đúng) — chặn payload quá lớn trước khi duyệt cây */
export const MAX_RICH_DOC_CHARS = 600_000;

export function IsSlug(options?: ValidationOptions) {
  return (object: object, propertyName: string) =>
    registerDecorator({
      name: 'isSlug',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        validate: (value: unknown) => typeof value === 'string' && isValidSlug(value),
        defaultMessage: (args: ValidationArguments) =>
          `${args.property}: chỉ gồm chữ thường không dấu, số và gạch nối (tối đa ${SLUG_MAX_LENGTH} ký tự)`,
      },
    });
}

export function IsSafeLink(linkOptions: { allowAnchor?: boolean } = {}, options?: ValidationOptions) {
  return (object: object, propertyName: string) =>
    registerDecorator({
      name: 'isSafeLink',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        validate: (value: unknown) => typeof value === 'string' && isSafeLink(value, linkOptions),
        defaultMessage: (args: ValidationArguments) =>
          `${args.property}: đường dẫn phải bắt đầu bằng "/"${linkOptions.allowAnchor ? ', "#"' : ''} hoặc http(s)://`,
      },
    });
}

/**
 * Kiểm tra cấu trúc nội dung rich text (whitelist khối/định dạng, link an toàn).
 * Nguồn ảnh (chỉ ảnh MinIO của hệ thống) được service kiểm tra thêm vì cần cấu hình lúc chạy.
 */
export function IsRichDoc(options?: ValidationOptions) {
  // Lỗi chi tiết (vd "doc.content[3]: ảnh thiếu mô tả (alt)") giữ ngoài DTO để không lọt vào dữ liệu
  const errors = new WeakMap<object, string>();
  return (object: object, propertyName: string) =>
    registerDecorator({
      name: 'isRichDoc',
      target: object.constructor,
      propertyName,
      options,
      validator: {
        validate(value: unknown, args: ValidationArguments) {
          if (JSON.stringify(value ?? null).length > MAX_RICH_DOC_CHARS) {
            errors.set(args.object, 'nội dung quá lớn');
            return false;
          }
          const result = validateRichDoc(value);
          if (!result.ok) errors.set(args.object, result.error);
          return result.ok;
        },
        defaultMessage(args: ValidationArguments) {
          return `${args.property}: ${errors.get(args.object) ?? 'nội dung không hợp lệ'}`;
        },
      },
    });
}
