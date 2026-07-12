import Image from 'next/image';
import ScrollScene from './ScrollScene';
import PhotoCarousel from './PhotoCarousel';
import Reveal from './Reveal';
import ScrollProgress from './ScrollProgress';
import OrderButton from './OrderButton';
import EntranceGate from './EntranceGate';
import Accordion from './Accordion';
import { CATEGORY_BY_ID } from './menu';

const HERO_SCENE =
  'https://prod.spline.design/Le2iIYYasafjz8Ib/scene.splinecode';
const SWEET_TREATS_SCENE =
  'https://prod.spline.design/XLyPwbheYwHrlx28/scene.splinecode';
const BREADS_SCENE =
  'https://prod.spline.design/jcgH6ZbEJxJ40hGn/scene.splinecode';
const COOKIES_SCENE =
  'https://prod.spline.design/ltNfQI5ZTwL2Hsh9/scene.splinecode';
const LOAF_CAKES_SCENE =
  'https://prod.spline.design/XHTySNkj3qMwFQ1u/scene.splinecode';

const TREATS = CATEGORY_BY_ID.treats;
const BREADS = CATEGORY_BY_ID.breads;
const COOKIES = CATEGORY_BY_ID.cookies;
const LOAF = CATEGORY_BY_ID.loaf;

function SectionNum({ n }: { n: string }) {
  return (
    <span className="section-num" aria-hidden="true">
      {n}
    </span>
  );
}

function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect
        x="2.5"
        y="2.5"
        width="19"
        height="19"
        rx="5.5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="4.2" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.3" cy="6.7" r="1.2" fill="currentColor" />
    </svg>
  );
}

export default function Home() {
  return (
    <main>
      <EntranceGate />
      <ScrollProgress />

      {/* Navigation */}
      <nav className="nav">
        <div className="wrap nav__inner">
          <span className="nav__brand">Jozi Bakes</span>
          <OrderButton className="nav__cta">Order Now</OrderButton>
        </div>
      </nav>

      {/* Hero — the shop diorama as a full-bleed backdrop, matched to the
          section's corners, with the title / tagline / CTA sitting over it */}
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
            <Reveal variant="up" delay={280} className="hero__cta">
              <OrderButton className="btn btn--light">Order Now</OrderButton>
            </Reveal>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="about grain">
        <SectionNum n="01" />
        <div className="wrap">
          <Reveal as="span" variant="fade" className="eyebrow">
            About
          </Reveal>
          <Reveal as="h2" variant="clip" className="about__head">
            About
          </Reveal>
          <div className="about__grid">
            <Reveal variant="scale" className="about__visual">
              <div className="about__visualShape" aria-hidden="true" />
              <Image
                src="/images/gallery-babka.webp"
                alt="Fresh caramel babka loaf from Jozi Bakes"
                className="about__photo"
                fill
                sizes="(max-width: 780px) 320px, 400px"
              />
              <span className="about__badge">Small batches</span>
            </Reveal>
            <div className="about__copy">
              <Reveal variant="up">
                <p>
                  JoziBakes is a small home bakery built on one simple idea:
                  bake good food that people genuinely look forward to eating.
                </p>
              </Reveal>
              <Reveal variant="up" delay={80}>
                <p>
                  From fudgy brownies and chunky cookies to soft milk buns,
                  artisan breads, and comforting tea cakes, everything is made
                  in small batches with care and quality ingredients.
                </p>
              </Reveal>
              <Reveal variant="up" delay={160}>
                <p>
                  Every bake is handmade, fresh, and meant to feel just like
                  something you&rsquo;d share with family and friends.
                </p>
              </Reveal>
              <Reveal variant="up" delay={240}>
                <p>
                  We&rsquo;re still growing, trying new recipes, listening to
                  feedback, and having fun along the way. Whether
                  you&rsquo;re here for your favourite cookie or just
                  discovering us, we&rsquo;re happy you&rsquo;re here. Hope
                  you find something you&rsquo;ll love. &#127850;&#10024;
                </p>
              </Reveal>
            </div>
          </div>
        </div>
      </section>

      {/* Showreel + Gallery — one continuous horizontal photo ribbon */}
      <PhotoCarousel />

      {/* Sweet Treats */}
      <section className="product product--treats grain">
        <SectionNum n="02" />
        <div className="wrap product__inner">
          <div className="product__art">
            <ScrollScene
              scene={SWEET_TREATS_SCENE}
              fallbackSrc="/images/donut.webp"
              fallbackAlt="Chocolate-drizzled donut"
              fallbackMode="float"
            />
          </div>
          <div className="product__text">
            <Reveal as="span" variant="fade" className="eyebrow">
              Sweet Treats
            </Reveal>
            <Reveal as="h2" variant="clip" className="product__head">
              Sweet Treats
            </Reveal>
            <Reveal as="p" variant="up" delay={100} className="product__copy">
              {TREATS.tagline}
            </Reveal>
            <Reveal variant="up" delay={160}>
              <Accordion items={TREATS.details} />
            </Reveal>
            <Reveal variant="up" delay={240} className="product__cta">
              <OrderButton category="treats" className="btn btn--light">
                Order Now
              </OrderButton>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Breads */}
      <section className="product product--breads grain">
        <SectionNum n="03" />
        <div className="wrap product__inner">
          <div className="product__text">
            <Reveal as="span" variant="fade" className="eyebrow">
              Breads
            </Reveal>
            <Reveal as="h2" variant="clip" className="product__head">
              Breads
            </Reveal>
            <Reveal as="p" variant="up" delay={100} className="product__copy">
              {BREADS.tagline}
            </Reveal>
            <Reveal variant="up" delay={160}>
              <Accordion items={BREADS.details} />
            </Reveal>
            <Reveal variant="up" delay={240} className="product__cta">
              <OrderButton category="breads" className="btn btn--red">
                Order Now
              </OrderButton>
            </Reveal>
          </div>
          <div className="product__art">
            <ScrollScene
              scene={BREADS_SCENE}
              fallbackSrc="/images/bun.webp"
              fallbackAlt="Freshly baked milk buns"
              fallbackMode="float"
            />
          </div>
        </div>
      </section>

      {/* Cookies */}
      <section className="product product--cookies grain">
        <SectionNum n="04" />
        <div className="wrap product__inner">
          <div className="product__art">
            <ScrollScene
              scene={COOKIES_SCENE}
              fallbackSrc="/images/gallery-cookie.webp"
              fallbackAlt="Chocolate-drizzled cookies"
              fallbackMode="card"
            />
          </div>
          <div className="product__text">
            <Reveal as="span" variant="fade" className="eyebrow">
              Cookies
            </Reveal>
            <Reveal as="h2" variant="clip" className="product__head">
              Cookies
            </Reveal>
            <Reveal as="p" variant="up" delay={100} className="product__copy">
              {COOKIES.tagline}
            </Reveal>
            <Reveal variant="up" delay={160}>
              <Accordion items={COOKIES.details} />
            </Reveal>
            <Reveal variant="up" delay={240} className="product__cta">
              <OrderButton category="cookies" className="btn btn--light">
                Order Now
              </OrderButton>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Loaf Cakes */}
      <section className="product product--loaf grain">
        <SectionNum n="05" />
        <div className="wrap product__inner">
          <div className="product__text">
            <Reveal as="span" variant="fade" className="eyebrow">
              Loaf Cakes
            </Reveal>
            <Reveal as="h2" variant="clip" className="product__head">
              Loaf Cakes
            </Reveal>
            <Reveal as="p" variant="up" delay={100} className="product__copy">
              {LOAF.tagline}
            </Reveal>
            <Reveal variant="up" delay={160}>
              <Accordion items={LOAF.details} />
            </Reveal>
            <Reveal variant="up" delay={240} className="product__cta">
              <OrderButton category="loaf" className="btn btn--red">
                Order Now
              </OrderButton>
            </Reveal>
          </div>
          <div className="product__art">
            <ScrollScene
              scene={LOAF_CAKES_SCENE}
              fallbackSrc="/images/gallery-babka.webp"
              fallbackAlt="Caramel babka loaf cake"
              fallbackMode="card"
            />
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact">
        <div className="storefront">
          <Image
            src="/images/storefront.webp"
            alt="The Jozi Bakes storefront with Jozi and Bruno"
            fill
            sizes="100vw"
          />
        </div>
        <div className="contact grain">
          <SectionNum n="06" />
          <div className="wrap">
            <Reveal as="span" variant="fade" className="eyebrow">
              Visit Us
            </Reveal>
            <div className="contact__top">
              <Reveal as="h2" variant="clip" className="contact__head">
                Meet Jozi &amp; Bruno
              </Reveal>
              <a
                className="contact__social"
                href="https://instagram.com"
                aria-label="Instagram"
                target="_blank"
                rel="noreferrer"
              >
                <InstagramIcon />
              </a>
            </div>
            <Reveal variant="up" delay={100} className="contact__details">
              <div>
                <div className="contact__label">WhatsApp</div>
                <a
                  className="contact__value"
                  href="https://wa.me/919603542595"
                  target="_blank"
                  rel="noreferrer"
                >
                  +91 96035 42595
                </a>
              </div>
              <div>
                <div className="contact__label">Find us</div>
                <span className="contact__value">Kharghar, Navi Mumbai</span>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer grain curve-in">
        <div className="wrap footer__inner">
          <span>&copy; {new Date().getFullYear()} Jozi Bakes</span>
          <div className="footer__links">
            <a href="#contact">Terms &amp; Support</a>
            <a href="#contact">Privacy Policy</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
