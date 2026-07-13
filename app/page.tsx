import Image from 'next/image';
import ScrollScene from './ScrollScene';
import Reveal from './Reveal';
import EntranceGate from './EntranceGate';
import MagneticLink from './MagneticLink';
import { InstagramIcon, GalleryIcon } from './Icons';

const HERO_SCENE =
  'https://prod.spline.design/Le2iIYYasafjz8Ib/scene.splinecode';

const INSTAGRAM_URL = 'https://www.instagram.com/jozibakes/';

export default function Home() {
  return (
    <main className="home">
      <EntranceGate />

      {/* The hero right below carries the full brand lockup, so the bar
          holds only the Instagram link — no wordmark repeated an inch
          above the real one. */}
      <nav className="nav nav--home">
        <div className="wrap nav__inner nav__inner--end">
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
        {/* Soft clouds drifting across the morning sky, behind the scene —
            the Spline canvas is transparent, so these read as real sky. */}
        <div className="hero__clouds" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <div className="hero__art">
          <ScrollScene
            scene={HERO_SCENE}
            fallbackSrc="/images/storefront.webp"
            fallbackAlt="The Jozi Bakes storefront with Jozi and Bruno"
            fallbackMode="card"
          />
        </div>
        {/* Rotating baker's-stamp badge — circular type, slow spin */}
        <div className="hero__stamp" aria-hidden="true">
          <svg viewBox="0 0 120 120">
            <defs>
              <path
                id="stampArc"
                d="M60,60 m-46,0 a46,46 0 1,1 92,0 a46,46 0 1,1 -92,0"
              />
            </defs>
            <text>
              <textPath href="#stampArc" textLength="288">
                FRESH DAILY · SMALL BATCH · MADE WITH LOVE ·
              </textPath>
            </text>
          </svg>
          <span className="hero__stampHeart">♥</span>
        </div>
        <div className="wrap hero__inner">
          <div className="hero__text">
            <Reveal variant="scale" className="hero__logo">
              {/* decorative — the wordmark it carries is restated by the
                  h1 right below */}
              <Image
                src="/images/logo.webp"
                alt=""
                width={512}
                height={524}
                priority
              />
            </Reveal>
            <Reveal as="h1" variant="clip" delay={100} className="hero__title">
              Jozi
              <br />
              Bakes
            </Reveal>
            <Reveal as="p" variant="up" delay={200} className="hero__tag">
              &ldquo;Artisanal bakery in Kharghar.&rdquo;
            </Reveal>
            <Reveal variant="up" delay={320} className="hero__actions">
              <MagneticLink href="/menu" className="btn btn--red">
                Order Now
              </MagneticLink>
              <MagneticLink href="/gallery" className="btn btn--teal hero__gallery">
                <GalleryIcon />
                Made with love
              </MagneticLink>
            </Reveal>
            <Reveal as="ul" variant="up" delay={430} className="hero__points">
              <li>Fresh every morning</li>
              <li>Small batches only</li>
              <li>Kharghar, Navi Mumbai</li>
            </Reveal>
          </div>
        </div>
      </section>
    </main>
  );
}
