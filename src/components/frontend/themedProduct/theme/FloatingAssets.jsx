// Renders theme.floating_assets for a given page section.
// Position: left/right rail, opacity + animation per asset.
// Mobile: defaults to hidden (admin can override per-asset).

const SIZE_CLASS = {
  xs: "w-12 md:w-14",
  sm: "w-16 md:w-20",
  md: "w-24 md:w-28",
  lg: "w-32 md:w-44",
};

const animClass = (type, speed) => {
  if (!type || type === "none") return "";
  return `brand-anim-${type}-${speed || "normal"}`;
};

export default function FloatingAssets({ assets = [], section }) {
  if (!Array.isArray(assets) || assets.length === 0) return null;
  // section can be a string or array of section names (for combined sections)
  const sections = Array.isArray(section) ? section : [section];
  const filtered = assets.filter(
    (a) => sections.includes(a.section) || a.section === "any",
  );
  if (filtered.length === 0) return null;

  // Smart side distribution: if a section has 2+ assets, force them to alternate
  // sides (left, right, left, right …) so they don't all pile on one side.
  // Single asset honours the admin's chosen position.
  const sideFor = (a, i) =>
    filtered.length > 1
      ? i % 2 === 0
        ? "left"
        : "right"
      : a.position || "left";

  return (
    <>
      {filtered.map((a, i) => {
        const side = sideFor(a, i);
        const sideClass = side === "left" ? "left-0 md:left-2" : "right-0 md:right-2";
        const mobileClass = a.hide_on_mobile === false ? "" : "hidden md:block";
        // stagger vertically within each side so two left-side assets don't overlap
        const sameSideIdx = filtered
          .slice(0, i)
          .filter((x, j) => sideFor(x, j) === side).length;
        const top = `${10 + (sameSideIdx % 4) * 35}%`;
        return (
          <img
            key={i}
            src={a.asset_url}
            alt=""
            aria-hidden="true"
            loading="lazy"
            className={`absolute pointer-events-none select-none ${sideClass} ${SIZE_CLASS[a.size] || SIZE_CLASS.md} ${animClass(a.animation_type, a.animation_speed)} ${mobileClass}`}
            style={{
              opacity: typeof a.opacity === "number" ? a.opacity : 1,
              zIndex: i,
              top,
            }}
          />
        );
      })}
    </>
  );
}
