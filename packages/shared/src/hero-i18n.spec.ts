import { mergeHeroTranslation } from './hero-i18n.js';

const VALID_HERO = {
  title: 'Tấm Chống Cháy MGO',
  subtitle: 'Phụ đề',
  paragraphs: ['Chịu lửa **1.200°C**'],
  primaryCta: { text: 'Nhận mẫu', link: '/nhan-mau-thu' },
  secondaryCta: { text: 'Dự toán', link: '#du-toan' },
  stats: [
    { value: '1', label: 'a', sublabel: '', accent: 'orange' },
    { value: '2', label: 'b', sublabel: '', accent: 'green' },
    { value: '3', label: 'c', sublabel: '', accent: 'green-dark' },
    { value: '4', label: 'd', sublabel: '', accent: 'slate' },
  ],
  media: { frameTitle: 'Khung', badge: 'Badge', alt: 'Ảnh tấm MGO' },
};

describe('mergeHeroTranslation', () => {
  it('không có bản dịch -> giữ nguyên tiếng Việt', () => {
    expect(mergeHeroTranslation(VALID_HERO, undefined)).toBe(VALID_HERO);
    expect(mergeHeroTranslation(VALID_HERO, {})).toEqual(VALID_HERO);
  });

  it('ghép từng trường: rỗng/khoảng trắng -> dùng tiếng Việt', () => {
    const en = mergeHeroTranslation(VALID_HERO, {
      title: 'MgO Fire-Rated Board',
      subtitle: '   ',
      primaryCta: { text: 'Get samples', link: '' },
      media: { alt: 'MgO board' },
    });
    expect(en.title).toBe('MgO Fire-Rated Board');
    expect(en.subtitle).toBe(VALID_HERO.subtitle);
    expect(en.primaryCta).toEqual({ text: 'Get samples', link: '/nhan-mau-thu' });
    expect(en.media).toEqual({ ...VALID_HERO.media, alt: 'MgO board' });
  });

  it('đoạn mô tả dịch theo cả khối; toàn đoạn rỗng thì dùng tiếng Việt', () => {
    expect(mergeHeroTranslation(VALID_HERO, { paragraphs: ['', 'One', '  '] }).paragraphs).toEqual(['One']);
    expect(mergeHeroTranslation(VALID_HERO, { paragraphs: ['', ' '] }).paragraphs).toEqual(VALID_HERO.paragraphs);
  });

  it('thẻ số liệu ghép theo vị trí, giữ màu nhấn tiếng Việt, thiếu phần tử thì dùng tiếng Việt', () => {
    const en = mergeHeroTranslation(VALID_HERO, { stats: [{ label: 'Heat' }] });
    expect(en.stats[0]).toEqual({ ...VALID_HERO.stats[0], label: 'Heat' });
    expect(en.stats.slice(1)).toEqual(VALID_HERO.stats.slice(1));
    expect(en.stats.map((s) => s.accent)).toEqual(VALID_HERO.stats.map((s) => s.accent));
  });

  it('nút phụ ẩn theo tiếng Việt dù bản dịch có nội dung', () => {
    const en = mergeHeroTranslation({ ...VALID_HERO, secondaryCta: null }, { secondaryCta: { text: 'Estimate' } });
    expect(en.secondaryCta).toBeNull();
  });
});
