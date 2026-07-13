import Image from 'next/image';
import Link from 'next/link';
import ScrollScene from '../ScrollScene';
import Reveal from '../Reveal';
import ScrollProgress from '../ScrollProgress';
import OrderButton from '../OrderButton';
import Accordion from '../Accordion';
import { InstagramIcon } from '../Icons';
import { CATEGORY_BY_ID } from '../menuData';

export const metadata = {
  title: 'Menu — Jozi Bakes',
  description:
    'Browse the Jozi Bakes menu — sweet treats, breads, cookies and loaf cakes, all handmade in small batches. Add to your order and check out on WhatsApp.',
};

const SWEET_TREATS_SCENE =
  'https://prod.spline.design/XLyPwbheYwHrlx28/scene.splinecode';
const BREADS_SCENE =
  'https://prod.spline.design/jcgH6ZbEJxJ40hGn/scene.splinecode';
const COOKIES_SCENE =
  'https://prod.spline.design/ltNfQI5ZTwL2Hsh9/scene.splinecode';
const LOAF_CAKES_SCENE =
  'https://prod.spline.design/XHTySNkj3qMwFQ1u/scene.splinecode';

const INSTAGRAM_URL = 'https://www.instagram.com/jozibakes/';

const TREATS = CATEGORY_BY_ID.treats;
const BREADS = CATEGORY_BY_ID.breads;
const COOKIES = CATEGORY_BY_ID.cookies;
const LOAF = CATEGORY_BY_ID.loaf;

export default function MenuPage() {
  return (
    <main>
      <ScrollProgress />

      <nav className="nav">
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

      {/* Menu intro */}
      <section className="menuIntro">
        <div className="wrap">
          <Reveal as="span" variant="fade" className="eyebrow">
            The Menu
          </Reveal>
          <Reveal as="h1" variant="clip" className="menuIntro__head">
            Pick your treats
          </Reveal>
          <Reveal as="p" variant="up" delay={120} className="menuIntro__copy">
            Tap Order Now on any section to add it to your basket. When
            you&rsquo;re done, we&rsquo;ll hand the whole list to WhatsApp so you
            can confirm the details with us.
          </Reveal>
        </div>
      </section>

      {/* Sweet Treats */}
      <section className="product product--treats grain">
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
              Small-Batch Sweets
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
        <div className="wrap product__inner">
          <div className="product__text">
            <Reveal as="span" variant="fade" className="eyebrow">
              Baked Fresh Daily
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
              Straight From The Oven
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
        <div className="wrap product__inner">
          <div className="product__text">
            <Reveal as="span" variant="fade" className="eyebrow">
              Slow-Baked Comfort
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

      {/* About */}
      <section className="about grain">
        <div className="wrap">
          <Reveal as="span" variant="fade" className="eyebrow">
            Our Story
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
                  feedback, and having fun along the way. Whether you&rsquo;re
                  here for your favourite cookie or just discovering us,
                  we&rsquo;re happy you&rsquo;re here. Hope you find something
                  you&rsquo;ll love. &#127850;&#10024;
                </p>
              </Reveal>
            </div>
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
                href={INSTAGRAM_URL}
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
            <Link href="/">Home</Link>
            <Link href="/gallery">Gallery</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
