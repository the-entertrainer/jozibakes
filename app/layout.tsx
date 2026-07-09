import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Jozi Bakes',
  description: 'Premium home bakery in Kharghar, Navi Mumbai',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
