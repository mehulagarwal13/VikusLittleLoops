import { Link } from "react-router-dom";
import { FaInstagram, FaWhatsapp, FaEnvelope } from "react-icons/fa";
import { useCategories, useHomepage } from "@/lib/hooks";

const helpCol = { title: "Help", links: [["Shipping", "/contact"], ["FAQ", "/contact"], ["Custom Orders", "/custom-order"]] };
const brandCol = { title: "Brand", links: [["The Maker", "/about"], ["Contact", "/contact"]] };

export default function Footer() {
  const { data: hp } = useHomepage();
  const { data: categories } = useCategories();
  const logoUrl = hp?.branding?.content?.logo_url;

  const shopLinks = categories?.length
    ? categories.slice(0, 5).map((c) => [c.name, `/shop?category=${c.id}`])
    : [["All Creations", "/shop"]];

  const cols = [{ title: "Shop", links: shopLinks }, helpCol, brandCol];

  return (
    <footer className="relative mt-16 border-t border-blush-200/50 pb-12 pt-12 sm:pt-20">
      <div className="container-lux">
        {/* Big outlined wordmark */}
        <p
          className="select-none text-center font-display font-bold leading-none tracking-tight text-transparent"
          style={{
            fontSize: "clamp(2rem, 11vw, 9rem)",
            WebkitTextStroke: "1.3px rgba(220,107,134,0.4)"
          }}
        >
          Little Loops
        </p>

        <div className="mt-10 grid grid-cols-2 gap-8 sm:mt-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <div className="flex items-center gap-3">
              {logoUrl ? (
                <img src={logoUrl} alt="Viku's Little Loops" className="h-9 w-9 rounded-full object-cover shadow-soft" />
              ) : (
                <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-blush-400 to-blush-600 text-white">
                  ✿
                </span>
              )}
              <span className="font-display text-lg font-semibold">
                Viku's Little Loops
              </span>
            </div>
            <p className="mt-4 max-w-xs font-serif text-lg text-ink-soft">
              Handmade crochet creations, stitched one loop at a time — designed
              to make every moment memorable.
            </p>
            <div className="mt-5 flex gap-3">
              <a href="https://www.instagram.com/vikuslittleloops" target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-soft transition-transform duration-500 ease-lux hover:-translate-y-1 hover:rotate-6">
                <FaInstagram />
              </a>
              <a href="https://wa.me/918979011405" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp" className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-soft transition-transform duration-500 ease-lux hover:-translate-y-1 hover:rotate-6">
                <FaWhatsapp />
              </a>
              <a href="mailto:hello@vikuslittleloops.com" aria-label="Email" className="grid h-11 w-11 place-items-center rounded-full bg-white shadow-soft transition-transform duration-500 ease-lux hover:-translate-y-1 hover:rotate-6">
                <FaEnvelope />
              </a>
            </div>
          </div>

          {cols.map((col) => (
            <div key={col.title}>
              <h4 className="font-display text-base font-medium">{col.title}</h4>
              <ul className="mt-4 space-y-2.5">
                {col.links.map(([label, to]) => (
                  <li key={label}>
                    <Link to={to} className="text-sm text-ink-soft transition-colors hover:text-blush-600">
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-blush-200/50 pt-6 text-[0.78rem] tracking-wide text-warmgray sm:flex-row">
          <span>© {new Date().getFullYear()} Viku's Little Loops · Crafted with love</span>
          <span>Made by hand in India 🌷</span>
        </div>
      </div>
    </footer>
  );
}
