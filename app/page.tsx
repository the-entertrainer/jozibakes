import ScrollScene from './ScrollScene';
import PhotoCarousel from './PhotoCarousel';
import HeroScene from './HeroScene';
import Reveal from './Reveal';
import ScrollProgress from './ScrollProgress';

const SWEET_TREATS_SCENE =
  'https://prod.spline.design/XLyPwbheYwHrlx28/scene.splinecode';
const BREADS_SCENE =
  'https://prod.spline.design/jcgH6ZbEJxJ40hGn/scene.splinecode';
const COOKIES_SCENE =
  'https://prod.spline.design/ltNfQI5ZTwL2Hsh9/scene.splinecode';
const LOAF_CAKES_SCENE =
  'https://prod.spline.design/Qu9P3tpZXhPQy7BF/scene.splinecode';

const LOREM =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Praesent vel lacus et est varius malesuada. Nullam tincidunt, libero at suscipit lacinia, justo odio convallis turpis, id tempus mauris lorem nec velit. Integer sit amet justo at nisl convallis consequat a a augue. Phasellus convallis, arcu nec cursus ultrices, turpis felis lacinia arcu, non posuere est urna quis purus. Donec vel magna ut dui facilisis vehicula. Curabitur euismod, ex nec facilisis facilisis, velit quam tincidunt est, eu tincidunt velit libero a nulla. Nam ac lacus sit amet libero facilisis dapibus a id tortor.';

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
      <ScrollProgress />

      {/* Navigation */}
      <nav className="nav">
        <div className="wrap nav__inner">
          <span className="nav__brand">Jozi Bakes</span>
          <a className="nav__cta" href="#contact">
            Order Now
          </a>
        </div>
      </nav>

      {/* Hero — fullscreen shop diorama; the camera pushes in on scroll
          (authored in Spline — the runtime pins itself over its scroll range) */}
      <section className="hero">
        <HeroScene />
        <div className="wrap hero__inner">
          <div className="hero__text">
            <Reveal as="h1" variant="clip" className="hero__title">
              Jozi
              <br />
              Bakes
            </Reveal>
            <Reveal
              as="p"
              variant="up"
              delay={150}
              className="hero__tag"
            >
              &ldquo;Artisanal bakery in Kharghar.&rdquo;
            </Reveal>
            <Reveal variant="up" delay={280} className="hero__cta">
              <a className="btn btn--red" href="#contact">
                Order Now
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="about grain">
        <div className="wrap">
          <Reveal as="span" variant="fade" className="eyebrow">
            01 — About
          </Reveal>
          <Reveal as="h2" variant="clip" className="about__head">
            About
          </Reveal>
          <div className="about__grid">
            <Reveal variant="scale" className="about__visual">
              <div className="about__visualShape" aria-hidden="true" />
              <img
                src="/images/gallery-babka.webp"
                alt="Fresh caramel babka loaf from Jozi Bakes"
                className="about__photo"
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
        <div className="wrap product__inner">
          <div className="product__art">
            <ScrollScene
              scene={SWEET_TREATS_SCENE}
              sizePct={330}
              offsetXPct={44}
              offsetYPct={-22}
              mobileOffsetYPct={12}
              fallbackSrc="/images/donut.webp"
              fallbackAlt="Chocolate-drizzled donut"
              fallbackMode="float"
            />
          </div>
          <div className="product__text">
            <Reveal as="span" variant="fade" className="eyebrow">
              02 — Sweet Treats
            </Reveal>
            <Reveal as="h2" variant="clip" className="product__head">
              Sweet Treats
            </Reveal>
            <Reveal as="p" variant="up" delay={100} className="product__copy">
              {LOREM}
            </Reveal>
            <Reveal variant="up" delay={200} className="product__cta">
              <a className="btn btn--light" href="#contact">
                Order Now
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Breads */}
      <section className="product product--breads grain">
        <div className="wrap product__inner">
          <div className="product__text">
            <Reveal as="span" variant="fade" className="eyebrow">
              03 — Breads
            </Reveal>
            <Reveal as="h2" variant="clip" className="product__head">
              Breads
            </Reveal>
            <Reveal as="p" variant="up" delay={100} className="product__copy">
              {LOREM}
            </Reveal>
            <Reveal variant="up" delay={200} className="product__cta">
              <a className="btn btn--red" href="#contact">
                Order Now
              </a>
            </Reveal>
          </div>
          <div className="product__art">
            <ScrollScene
              scene={BREADS_SCENE}
              sizePct={330}
              offsetXPct={-44}
              offsetYPct={-22}
              mobileOffsetYPct={12}
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
              sizePct={300}
              offsetXPct={40}
              offsetYPct={-12}
              mobileOffsetYPct={14}
              fallbackSrc="/images/gallery-cookie.webp"
              fallbackAlt="Chocolate-drizzled cookies"
              fallbackMode="card"
            />
          </div>
          <div className="product__text">
            <Reveal as="span" variant="fade" className="eyebrow">
              04 — Cookies
            </Reveal>
            <Reveal as="h2" variant="clip" className="product__head">
              Cookies
            </Reveal>
            <Reveal as="p" variant="up" delay={100} className="product__copy">
              {LOREM}
            </Reveal>
            <Reveal variant="up" delay={200} className="product__cta">
              <a className="btn btn--light" href="#contact">
                Order Now
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Loaf Cakes */}
      <section className="product product--loaf grain">
        <div className="wrap product__inner">
          <div className="product__text">
            <Reveal as="span" variant="fade" className="eyebrow">
              05 — Loaf Cakes
            </Reveal>
            <Reveal as="h2" variant="clip" className="product__head">
              Loaf Cakes
            </Reveal>
            <Reveal as="p" variant="up" delay={100} className="product__copy">
              {LOREM}
            </Reveal>
            <Reveal variant="up" delay={200} className="product__cta">
              <a className="btn btn--red" href="#contact">
                Order Now
              </a>
            </Reveal>
          </div>
          <div className="product__art">
            <ScrollScene
              scene={LOAF_CAKES_SCENE}
              sizePct={240}
              offsetXPct={-22}
              offsetYPct={-10}
              mobileOffsetYPct={12}
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
          <img
            src="/images/storefront.webp"
            alt="The Jozi Bakes storefront with Jozi and Bruno"
          />
        </div>
        <div className="contact grain">
          <div className="wrap">
            <Reveal as="span" variant="fade" className="eyebrow">
              06 — Visit Us
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
                <div className="contact__label">Phone</div>
                <a className="contact__value" href="tel:1234567890">
                  123-456-7890
                </a>
              </div>
              <div>
                <div className="contact__label">Email</div>
                <a
                  className="contact__value"
                  href="mailto:hello@reallygreatsite.com"
                >
                  hello@reallygreatsite.com
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer grain">
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
