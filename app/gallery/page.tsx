import Image from 'next/image';
import Link from 'next/link';
import { BackIcon } from '../Icons';

export const metadata = {
  title: 'Gallery — Jozi Bakes',
  description:
    'A continuous scroll through recent bakes from Jozi Bakes — brownies, cookies, breads, loaf cakes and more.',
};

// One continuous ribbon of bakes — full-bleed, edge to edge, no gaps.
const GALLERY = [
  { src: '/images/rolls.webp', alt: 'Golden dinner rolls fresh from the oven' },
  { src: '/images/gallery-cookie.webp', alt: 'Chocolate-drizzled cookies' },
  { src: '/images/gallery-babka.webp', alt: 'Caramel babka loaf' },
  { src: '/images/bun.webp', alt: 'Soft milk buns' },
  { src: '/images/gallery-bread.webp', alt: 'Sliced artisan ciabatta bread' },
  { src: '/images/donut.webp', alt: 'Chocolate-drizzled donut' },
  { src: '/images/storefront.webp', alt: 'The Jozi Bakes storefront with Jozi and Bruno' },
];

export default function GalleryPage() {
  return (
    <main className="gallery">
      <Link href="/" className="gallery__back" aria-label="Back to home">
        <BackIcon />
        <span>Home</span>
      </Link>

      <header className="gallery__intro">
        <span className="eyebrow">Made with love</span>
        <h1 className="gallery__title">The bake book</h1>
      </header>

      <div className="gallery__strip">
        {GALLERY.map((photo, i) => (
          <figure className="gallery__frame" key={i}>
            <Image
              src={photo.src}
              alt={photo.alt}
              fill
              sizes="100vw"
              className="gallery__img"
              // Small webps on a page whose whole purpose is the images —
              // load them up front so the scroll stays smooth with no gaps.
              priority={i === 0}
              loading={i === 0 ? undefined : 'eager'}
            />
          </figure>
        ))}
      </div>

      <footer className="gallery__foot">
        <Link href="/" className="btn btn--light">
          Back to home
        </Link>
      </footer>
    </main>
  );
}
