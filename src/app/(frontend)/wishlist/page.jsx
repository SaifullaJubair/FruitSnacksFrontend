
import WishList from "@/components/frontend/wishList/WishList";
export async function generateMetadata() {
  return buildPageMeta("wishlist");
}
const WishListPage = () => {
  return (
    <div>
      <WishList />
    </div>
  );
};

export default WishListPage;
