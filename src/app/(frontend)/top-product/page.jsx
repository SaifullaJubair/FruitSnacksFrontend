import TopProduct from "@/components/frontend/topProduct/TopProduct";
export async function generateMetadata() {
  return buildPageMeta("topProduct");
}
const TopProductPage = () => {
  return (
    <div>
      <TopProduct />
    </div>
  );
};

export default TopProductPage;
