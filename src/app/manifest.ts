import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Remak® MGO FireOFF - Tấm Chống Cháy Cao Cấp',
    short_name: 'Remak MGO',
    description: 'Tổng kho phân phối và sản xuất tấm Magie Oxit (MGO) chống cháy chuẩn QCVN 06:2022/BXD',
    start_url: '/',
    display: 'standalone',
    background_color: '#F8FAFC',
    theme_color: '#7CB305',
    icons: [
      {
        src: '/images/logo.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/images/logo.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
  };
}
