import { getSiteFaqs } from "@/components/lib/getSiteFaqs";
import { titleFont } from "@/utils/font";
import FaqItem from "./FaqItem";

// Server Component — FAQs are fetched here so they are in the initial HTML
// (they are also SEO-relevant content, which a client fetch hides from crawlers).
// Only the accordion toggle stays client-side (FaqItem).
const SiteFaqSection = async ({ settings }) => {
  const title = settings?.site_faq_section_title || "Frequently Asked Questions";

  const data = await getSiteFaqs();
  const faqs = data?.data ?? [];

  if (!faqs.length) return null;

  return (
    <div className="py-4 md:py-10">
      <div className="max-w-[98%] mx-auto">
        <h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold text-center text-gray-800 mb-6 md:mb-10"
          style={{ fontFamily: titleFont.style.fontFamily }}
        >
          {title}
        </h2>
        <div className="max-w-3xl mx-auto space-y-3">
          {faqs.map((faq) => (
            <FaqItem key={faq._id} faq={faq} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default SiteFaqSection;
