import ScrollScene from './ScrollScene';
import PhotoCarousel from './PhotoCarousel';
import HeroScene from './HeroScene';

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
            <h1 className="hero__title">
              Jozi
              <br />
              Bakes
            </h1>
            <p className="hero__tag">&ldquo;Artisanal bakery in Kharghar.&rdquo;</p>
            <a className="btn btn--red hero__cta" href="#contact">
              Order Now
            </a>
          </div>
        </div>
      </section>

      {/* About */}
      <section className="about">
        <div className="wrap">
          <h2 className="about__head">About</h2>
          <div className="about__grid">
            <div className="about__block" aria-hidden="true" />
            <div className="about__copy">
              <p>
                JoziBakes is a small home bakery built on one simple idea: bake
                good food that people genuinely look forward to eating.
              </p>
              <p>
                From fudgy brownies and chunky cookies to soft milk buns, artisan
                breads, and comforting tea cakes, everything is made in small
                batches with care and quality ingredients.
              </p>
              <p>
                Every bake is handmade, fresh, and meant to feel just like
                something you&rsquo;d share with family and friends.
              </p>
              <p>
                We&rsquo;re still growing, trying new recipes, listening to
                feedback, and having fun along the way. Whether you&rsquo;re here
                for your favourite cookie or just discovering us, we&rsquo;re
                happy you&rsquo;re here. Hope you find something you&rsquo;ll
                love. &#127850;&#10024;
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Showreel + Gallery — one continuous horizontal photo ribbon */}
      <PhotoCarousel />

      {/* Sweet Treats */}
      <section className="product product--treats">
        <div className="wrap product__inner">
          <div className="product__art">
            <ScrollScene
              scene={SWEET_TREATS_SCENE}
              preset="treats"
              sizePct={330}
              offsetXPct={44}
              offsetYPct={-22}
              mobileOffsetYPct={12}
            />
          </div>
          <div className="product__text">
            <h2 className="product__head">Sweet Treats</h2>
            <p className="product__copy">{LOREM}</p>
            <a className="btn btn--light product__cta" href="#contact">
              Order Now
            </a>
          </div>
        </div>
      </section>

      {/* Breads */}
      <section className="product product--breads">
        <div className="wrap product__inner">
          <div className="product__text">
            <h2 className="product__head">Breads</h2>
            <p className="product__copy">{LOREM}</p>
            <a className="btn btn--red product__cta" href="#contact">
              Order Now
            </a>
          </div>
          <div className="product__art">
            <ScrollScene
              scene={BREADS_SCENE}
              preset="breads"
              sizePct={330}
              offsetXPct={-44}
              offsetYPct={-22}
              mobileOffsetYPct={12}
            />
          </div>
        </div>
      </section>

      {/* Cookies */}
      <section className="product product--cookies">
        <div className="wrap product__inner">
          <div className="product__art">
            <ScrollScene
              scene={COOKIES_SCENE}
              preset="cookies"
              sizePct={300}
              offsetXPct={40}
              offsetYPct={-12}
              mobileOffsetYPct={14}
            />
          </div>
          <div className="product__text">
            <h2 className="product__head">Cookies</h2>
            <p className="product__copy">{LOREM}</p>
            <a className="btn btn--light product__cta" href="#contact">
              Order Now
            </a>
          </div>
        </div>
      </section>

      {/* Loaf Cakes */}
      <section className="product product--loaf">
        <div className="wrap product__inner">
          <div className="product__text">
            <h2 className="product__head">Loaf Cakes</h2>
            <p className="product__copy">{LOREM}</p>
            <a className="btn btn--red product__cta" href="#contact">
              Order Now
            </a>
          </div>
          <div className="product__art">
            <ScrollScene
              scene={LOAF_CAKES_SCENE}
              preset="loaf"
              sizePct={240}
              offsetXPct={-22}
              offsetYPct={-10}
              mobileOffsetYPct={12}
            />
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact">
        <div className="storefront">
          <img
            src="/images/storefront.jpg"
            alt="The Jozi Bakes storefront with Jozi and Bruno"
          />
        </div>
        <div className="contact">
          <div className="wrap">
            <div className="contact__top">
              <h2 className="contact__head">Meet Jozi &amp; Bruno</h2>
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
            <div className="contact__details">
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
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
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
