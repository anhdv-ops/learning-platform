import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { VideoProvider } from '@/contexts/VideoContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import GlobalVideoPlayer from '@/components/GlobalVideoPlayer';
import AppShell from '@/components/AppShell';

const inter = Inter({
  subsets: ["latin", "vietnamese"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  title: {
    default: 'LishTex — Nền tảng học tiếng Anh trực tuyến',
    template: '%s | LishTex',
  },
  description: 'Khám phá lộ trình học tiếng Anh cá nhân hóa với LishTex. Luyện nghe, nói, đọc, viết với các bài học tương tác, tài liệu học tập và hệ thống đánh giá khóa học chuyên nghiệp.',
  keywords: ['học tiếng anh', 'english learning', 'lishtex', 'khóa học tiếng anh', 'online courses', 'tiếng anh tương tác'],
  authors: [{ name: 'LishTex Team' }],
  creator: 'LishTex',
  publisher: 'LishTex',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'vi_VN',
    url: '/',
    siteName: 'LishTex',
    title: 'LishTex — Nền tảng học tiếng Anh trực tuyến',
    description: 'Khám phá lộ trình học tiếng Anh cá nhân hóa với LishTex. Luyện nghe, nói, đọc, viết với các bài học tương tác và tài liệu chất lượng.',
    images: [
      {
        url: '/og-banner.png',
        width: 1200,
        height: 630,
        alt: 'LishTex Learning Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'LishTex — Nền tảng học tiếng Anh trực tuyến',
    description: 'Khám phá lộ trình học tiếng Anh cá nhân hóa với LishTex.',
    images: ['/og-banner.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${inter.variable} h-full`}
      suppressHydrationWarning
    >
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('lishtex-theme');
                  if (saved === 'light') {
                    document.documentElement.classList.add('light');
                    document.documentElement.classList.remove('dark');
                  } else {
                    document.documentElement.classList.add('dark');
                    document.documentElement.classList.remove('light');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="min-h-full bg-bg-primary text-text-primary antialiased">
        <ThemeProvider>
          <VideoProvider>
            <AppShell>
              <GlobalVideoPlayer />
              {children}
            </AppShell>
          </VideoProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
