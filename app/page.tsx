import Link from 'next/link';
import ScrollScene from './ScrollScene';
import Reveal from './Reveal';
import EntranceGate from './EntranceGate';
import { InstagramIcon, GalleryIcon } from './Icons';

const HERO_SCENE =
  'https://prod.spline.design/Le2iIYYasafjz8Ib/scene.splinecode';

const INSTAGRAM_URL = 'https://www.instagram.com/jozibakes/';

export default function Home() {
  return (
    <main className="home">
      <EntranceGate />

      <nav className="nav nav--home">
        <div className="wrap nav__inner">
          <Link href="/" className="nav__brand">
            Jozi Bakes
          </Link>
          <a
            className="nav__ig"
            href={INSTAGRAM_URL}
            aria-label="Jozi Bakes on Instagram"
            target="_blank"
            rel="noreferrer"
          >
            <InstagramIcon />
          </a>
        </div>
      </nav>

      {/* Hero — full-screen; the shop diorama fills the section behind the
          title, tagline and calls to action */}
      <section className="hero">
        <div className="hero__art">
          <ScrollScene
            scene={HERO_SCENE}
            fallbackSrc="/images/storefront.webp"
            fallbackAlt="The Jozi Bakes storefront with Jozi and Bruno"
            fallbackMode="card"
          />
        </div>
        <div className="wrap hero__inner">
          <div className="hero__text">
            <Reveal as="h1" variant="clip" className="hero__title">
              Jozi
              <br />
              Bakes
            </Reveal>
            <Reveal as="p" variant="up" delay={150} className="hero__tag">
              &ldquo;Artisanal bakery in Kharghar.&rdquo;
            </Reveal>
            <Reveal variant="up" delay={280} className="hero__actions">
              <Link href="/menu" className="btn btn--light">
                Order Now
              </Link>
              <Link href="/gallery" className="btn btn--ghost hero__gallery">
                <GalleryIcon />
                Made with love
              </Link>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
