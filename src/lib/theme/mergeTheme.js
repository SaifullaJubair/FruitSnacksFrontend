// Deep-merge product.theme_overrides into the base theme document.
// Override fields in product.theme_overrides take precedence; missing
// fields inherit from the theme. Keeps colors/button_style nested objects
// merged at the field level, not replaced wholesale.

const NEUTRAL_FALLBACK = {
  theme_name: "Neutral",
  theme_slug: "neutral-default",
  colors: {
    primary: "#10B981",
    primary_light: "#6EE7B7",
    primary_dark: "#047857",
    page_bg: "#FAFAFA",
    section_bg: "#F3F4F6",
    heading_text: "#111827",
    body_text: "#374151",
    accent: "#F59E0B",
    button_text: "#FFFFFF",
  },
  floating_assets: [],
  typography: {
    font_key: "hind-siliguri",
    heading_weight: "700",
    style: "rounded",
  },
  button_style: { border_radius: "8px", variant: "filled" },
};

export function mergeTheme(theme, overrides) {
  const base = theme || NEUTRAL_FALLBACK;
  if (!overrides) return base;

  return {
    ...base,
    colors: {
      ...base.colors,
      ...(overrides.colors || {}),
    },
    button_style: {
      ...base.button_style,
      ...(overrides.button_style || {}),
    },
  };
}

export { NEUTRAL_FALLBACK };
