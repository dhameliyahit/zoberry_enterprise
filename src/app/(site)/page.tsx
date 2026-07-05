import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zoberry Enterprise | Smart Home Utilities & Kitchen Gadgets",
  description:
    "Discover trending home utilities, smart kitchen gadgets, and daily-use problem solvers. Shop the best deals on household essentials — up to 50% off.",
  // other metadata
};

export default function HomePage() {
  return (
    <>
      <div className="min-h-screen">
        <Home />
      </div>
    </>
  );
}
