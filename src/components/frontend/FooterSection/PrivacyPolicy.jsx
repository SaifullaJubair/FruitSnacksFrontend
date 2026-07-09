import PolicyPageLayout from "@/components/frontend/policyPage/PolicyPageLayout";

// Content comes from Admin -> Settings -> Policies; layout + metadata are shared
// (see policyPage/policyMeta.js).
const PrivacyPolicy = () => <PolicyPageLayout slug="privacy-policy" />;

export default PrivacyPolicy;
