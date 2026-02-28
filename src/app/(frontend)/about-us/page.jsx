// src/app/(frontend)/about-us/page.jsx
// seo
import { buildPageMeta } from "@/components/lib/buildPageMeta";
import { PAGE_SEO } from "@/components/utils/pageSeo";
import AboutUs from "@/components/frontend/FooterSection/AboutUs";
export async function generateMetadata() {
  return buildPageMeta(PAGE_SEO.aboutUs);
}
const AboutUsPage = () => {
  return (
    <div>
      <AboutUs />
    </div>
  );
};

export default AboutUsPage;
