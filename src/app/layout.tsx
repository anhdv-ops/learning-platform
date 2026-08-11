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
