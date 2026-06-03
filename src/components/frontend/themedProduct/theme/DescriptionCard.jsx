"use client";
// Compact "পণ্য সম্পর্কে" card shown right after the hero. Renders the rich-text
// product.description. Short content looks tidy in a small card; long content is
// clamped with a "আরও পড়ুন / কম দেখুন" toggle so it never dominates the page.
// Themed via brand CSS vars. Renders nothing when there's no description.
import { useState } from "react";
import { FaChevronDown } from "react-icons/fa6";

export default function DescriptionCard({ html }) {
  const [expanded, setExpanded] = useState(false);
  if (!html || !String(html).trim()) return null;

  // Heuristic: only offer the toggle when the content is long enough to bother
  // clamping. Strip tags for a rough length estimate.
  const plainLen = String(html).replace(/<[^>]*>/g, "").trim().length;
  const isLong = plainLen > 280;

  return (
    <section className="mb-8">
      <div className="flex items-center gap-2 mb-3">
        <span
          className="w-1.5 h-6 rounded-full"
          style={{ background: "var(--brand-primary)" }}
        />
        <h2
          className="text-lg md:text-xl font-bold"
          style={{
            color: "var(--heading-color)",
            fontWeight: "var(--brand-heading-weight, 700)",
          }}
        >
          পণ্য সম্পর্কে
        </h2>
      </div>

      <div
        className="rounded-2xl shadow-sm p-5 md:p-6"
        style={{ background: "#fff" }}
      >
        <div
          // `pdp-desc` namespaces the styles below so they affect only this
          // card's rich-text HTML — no global leak.
          className="pdp-desc text-sm md:text-base leading-relaxed transition-all duration-300"
          style={{
            color: "var(--body-color)",
            // Clamp long content until expanded; short content shows fully.
            ...(isLong && !expanded
              ? {
                  maxHeight: "10rem",
                  overflow: "hidden",
                  WebkitMaskImage:
                    "linear-gradient(to bottom, #000 60%, transparent)",
                  maskImage: "linear-gradient(to bottom, #000 60%, transparent)",
                }
              : {}),
          }}
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {isLong && (
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold"
            style={{ color: "var(--brand-primary)" }}
          >
            {expanded ? "কম দেখুন" : "আরও পড়ুন"}
            <FaChevronDown
              size={12}
              className="transition-transform duration-200"
              style={{ transform: expanded ? "rotate(180deg)" : "none" }}
            />
          </button>
        )}
      </div>

      {/* Scoped rich-text styling so admin's <ul>/<ol>/<table>/<blockquote>
          actually render with bullets, numbers, borders, etc. — we don't ship
          @tailwindcss/typography. Keep selectors under `.pdp-desc` so this
          can't bleed into other parts of the site. */}
      <style jsx>{`
        .pdp-desc :global(h2) {
          font-size: 1.25rem;
          font-weight: 700;
          margin: 1rem 0 0.5rem;
          color: var(--heading-color);
        }
        .pdp-desc :global(h3) {
          font-size: 1.1rem;
          font-weight: 700;
          margin: 0.9rem 0 0.4rem;
          color: var(--heading-color);
        }
        .pdp-desc :global(p) {
          margin: 0.5rem 0;
        }
        .pdp-desc :global(strong) {
          font-weight: 700;
          color: var(--heading-color);
        }
        .pdp-desc :global(em) {
          font-style: italic;
        }
        .pdp-desc :global(a) {
          color: var(--brand-primary);
          text-decoration: underline;
        }
        .pdp-desc :global(ul) {
          list-style: disc;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .pdp-desc :global(ol) {
          list-style: decimal;
          padding-left: 1.5rem;
          margin: 0.5rem 0;
        }
        .pdp-desc :global(li) {
          margin: 0.2rem 0;
        }
        .pdp-desc :global(blockquote) {
          margin: 0.75rem 0;
          padding: 0.6rem 0.9rem;
          border-left: 4px solid var(--brand-primary);
          background: var(--section-bg);
          font-style: italic;
          border-radius: 0 6px 6px 0;
        }
        .pdp-desc :global(table) {
          width: 100%;
          border-collapse: collapse;
          margin: 0.75rem 0;
          font-size: 0.9em;
        }
        .pdp-desc :global(th),
        .pdp-desc :global(td) {
          border: 1px solid var(--brand-primary-light);
          padding: 0.5rem 0.7rem;
          text-align: left;
        }
        .pdp-desc :global(th) {
          background: var(--brand-primary-light);
          font-weight: 700;
          color: var(--brand-primary-dark);
        }
        .pdp-desc :global(tr:nth-child(even) td) {
          background: var(--section-bg);
        }
        .pdp-desc :global(img) {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 0.5rem 0;
        }
      `}</style>
    </section>
  );
}
