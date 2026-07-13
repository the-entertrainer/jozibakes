import type { Metadata, Viewport } from 'next';
import { Poppins, Fraunces, Chewy } from 'next/font/google';
import './globals.css';
import CartProvider from './CartProvider';
import ScenePreloadProvider from './ScenePreloadProvider';

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800', '900'],
  variable: '--font-poppins',
  display: 'swap',
});

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['italic', 'normal'],
  variable: '--font-fraunces',
  display: 'swap',
});

// Display face for headings — the closest Google Fonts match to the
// hand-lettered wordmark in the Jozi Bakes logo (chunky rounded strokes,
// bouncing baseline, curled terminals). Single 400 weight.
const chewy = Chewy({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-display',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Jozi Bakes — Artisanal bakery in Kharghar',
  description:
    'Discover Jozi Bakes, an artisanal bakery crafting fresh, handmade treats like brownies, cookies, and breads with care and quality ingredients. Order now!',
  openGraph: {
    title: 'Jozi Bakes',
    type: 'website',
    description:
      'Discover Jozi Bakes, an artisanal bakery crafting fresh, handmade treats like brownies, cookies, and breads with care and quality ingredients. Order now!',
  },
};

export const viewport: Viewport = {
  themeColor: '#97191d',
  width: 'device-width',
  initialScale: 1,
  // lets the safe-area-inset-* CSS env() vars resolve on notched / Dynamic
  // Island phones, so the sticky nav and footer never sit under the cutout
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} ${fraunces.variable} ${chewy.variable}`}>
      <body>
        <ScenePreloadProvider>
          <CartProvider>{children}</CartProvider>
        </ScenePreloadProvider>
      </body>
    </html>
  );
}
