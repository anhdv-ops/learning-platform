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
  title: "LishTex — Nền tảng học tiếng Anh",
  description: "Khám phá lộ trình học tiếng Anh cá nhân hóa với LishTex. Luyện nghe, nói, đọc, viết với các bài học tương tác.",
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
      <body className="min-h-full bg-bg-primary text-text-primary antialiased" style={{ backgroundColor: 'var(--bg-primary, #0a0a0f)', color: 'var(--text-primary, #f0f0f5)' }}>
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
