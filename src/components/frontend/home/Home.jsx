import Banner from "./banner/Banner";
import TrendingProduct from "./trendingProduct/TrendingProduct";

import CategoryWiseProduct from "./categoryWiseProduct/CategoryWiseProduct";
import ECommerceChoice from "./eCommerceChoice/ECommerceChoice";
import LatestProducts from "./latestProducts/LatestProducts";
import PromotionalBanner from "./promotionalBanner/PromotionalBanner";
import FeatureService from "./featureService/FeatureService";

const Home = () => {
  return (
    <div className="container mx-auto ">
      <div className="">
        <Banner />
        {/* <NewFeatureCategories />
        <FeatureCategories /> */}
        {/* <ECommerceChoice /> */}
        <TrendingProduct />
        <LatestProducts />
        <CategoryWiseProduct />
        {/* <PopularProducts /> */}
        <FeatureService />
        <PromotionalBanner />
        {/* Latest Product */}
        {/* <OnlyForYouProduct /> */}
        {/* <AdsSection /> */}
        {/* <SliderAd /> */}
      </div>
    </div>
  );
};

export default Home;
