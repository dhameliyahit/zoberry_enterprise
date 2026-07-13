import React from "react";
import Hero from "./Hero";
import Categories from "./Categories";
import NewArrival from "./NewArrivals";
// import PromoBanner from "./PromoBanner";
import BestSeller from "./BestSeller";
// import CounDown from "./Countdown";
import Testimonials from "./Testimonials";
import Watchlist from "./Watchlist";
import FAQ from "./FAQ";
import Newsletter from "../Common/Newsletter";
import RecentlyViewdItems from "../ShopDetails/RecentlyViewd";

const Home = () => {
  return (
    <main>
      <Hero />
      <RecentlyViewdItems />
      <Categories />
      <NewArrival />
      {/* <PromoBanner /> */}
      <BestSeller />
      <Watchlist />
      {/* <CounDown /> */}
      <Testimonials />
      <FAQ />
      <Newsletter />
    </main>
  );
};

export default Home;
