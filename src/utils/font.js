import {
  Anton,
  Archivo_Black,
  Caveat,
  Cookie,
  Merriweather,
  Noto_Sans_Display,
  Playfair_Display,
  Playfair_Display_SC,
  Roboto_Mono,
  Roboto_Serif,
  Russo_One,
  Satisfy,
  Yatra_One,
} from "next/font/google";


export const merriweather = Merriweather({
  subsets: ["latin"],
  weight: ["300", "400", "700", "900"], // Include the weights you need
  variable: "--font-merriweather", // Optional: Define a CSS variable
});

export const playfair = Playfair_Display({
  subsets: ["latin"], // Choose character sets
  weight: ["400", "500", "600", "700"], // Include desired font weights
  variable: "--font-playfair", // Custom CSS variable (optional)
});
export const playfairSc = Playfair_Display_SC({
  subsets: ["latin"], // Choose character sets
  weight: ["400", "700", "900"], // Include desired font weights
  variable: "--font-playfair", // Custom CSS variable (optional)
});
export const roboto_mono = Roboto_Mono({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});
export const roboto_serif = Roboto_Serif({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  display: "swap",
});
export const yatra = Yatra_One({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});
export const satisfy = Satisfy({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});
export const caveat = Caveat({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});
export const cookie = Cookie({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});
export const noto_sans = Noto_Sans_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});
export const russo_one = Russo_One({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
});
