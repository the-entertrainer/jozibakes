import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jozi Bakes',
  description: 'Jozi Bakes',
};

export const viewport: Viewport = {
  themeColor: '#000000',
  viewportFit: 'cover',
  width: 'device-width',
  height: 'device-height',
  initialScale: 1,
  minimumScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://prod.spline.design" crossOrigin="anonymous" />
        <link
          rel="preload"
          href="https://prod.spline.design/Le2iIYYasafjz8Ib/scene.splinecode"
          as="fetch"
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
