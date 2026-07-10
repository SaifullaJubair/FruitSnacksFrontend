"use client";
// Use cases — circular brand-tinted icon badges + label in soft cards.
//
// Icon priority: admin's custom upload (icon_url) > icon picked in the admin
// IconPicker (icon_key) > no icon at all. There is deliberately NO fallback
// glyph: this section used to hardcode a fork-and-knife, which is wrong on any
// store that doesn't sell food — and it ignored icon_key entirely, so an icon
// the admin actually picked never rendered. When a row has neither, the badge
// circle is omitted too, otherwise the card shows an empty coloured puck.
import FloatingAssets from "../FloatingAssets";
import DynamicIcon, { hasIcon } from "@/lib/icons/DynamicIcon";

export default function UseCasesSection({ product, theme }) {
  const items = product?.use_cases || [];
  if (items.length === 0) return null;

  return (
    <section
      className="relative overflow-hidden py-10 md:py-14"
      style={{ background: "var(--section-bg)" }}
    >
      <FloatingAssets assets={theme?.floating_assets} section="use_cases" />

      <div className="max-w-6xl mx-auto px-4 relative">
        <div className="flex items-center gap-2 mb-6">
          <span
            className="w-1.5 h-7 rounded-full"
            style={{ background: "var(--brand-primary)" }}
          />
          <h2
            className="text-xl md:text-2xl font-bold"
            style={{
              color: "var(--heading-color)",
              fontWeight: "var(--brand-heading-weight, 700)",
            }}
          >
            কোথায় ব্যবহার করবেন?
          </h2>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {items.map((u, i) => {
            // Only draw the badge when something will actually appear inside
            // it — an icon_key that no longer resolves would otherwise leave a
            // bare coloured circle.
            const showBadge = Boolean(u.icon_url) || hasIcon(u.icon_key);
            return (
              <div
                key={i}
                className="flex flex-col items-center text-center gap-3 rounded-xl p-5 transition-transform hover:-translate-y-0.5"
                style={{ background: "#fff" }}
              >
                {showBadge && (
                  <span
                    className="flex items-center justify-center rounded-full"
                    style={{
                      width: 56,
                      height: 56,
                      background: "var(--brand-primary-light)",
                      color: "var(--brand-primary-dark)",
                    }}
                  >
                    {u.icon_url ? (
                      <img
                        src={u.icon_url}
                        alt=""
                        width={30}
                        height={30}
                        className="object-contain"
                      />
                    ) : (
                      <DynamicIcon name={u.icon_key} size={22} />
                    )}
                  </span>
                )}
                <span
                  className="text-sm font-medium leading-tight"
                  style={{ color: "var(--body-color)" }}
                >
                  {u.text}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
