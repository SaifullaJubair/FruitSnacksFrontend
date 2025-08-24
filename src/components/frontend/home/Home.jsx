import Banner from "./banner/Banner";
import PopularProducts from "./popularProducts/PopularProducts";
import TrendingProduct from "./trendingProduct/TrendingProduct";

import NewFeatureCategories from "./newFeatureCategories/NewFeatureCategories";
import OnlyForYouProduct from "./latestProducts/LatestProducts";
import CategoryWiseProduct from "./categoryWiseProduct/CategoryWiseProduct";

const Home = () => {
  return (
    <div className="space-y-20">
      <Banner />
      <NewFeatureCategories />
      {/* <FeatureCategories /> */}
      {/* <ECommerceChoice /> */}
      <TrendingProduct />
      {/* <PopularProducts /> */}
      <CategoryWiseProduct />
      {/* Latest Product */}
      {/* <OnlyForYouProduct /> */}
      {/* <AdsSection /> */}
      {/* <SliderAd /> */}
      {/* <FeatureService /> */}
    </div>
  );
};

export default Home;
