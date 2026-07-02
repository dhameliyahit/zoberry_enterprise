import Home from "@/components/Home";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Zoberry Enterprise | E-commerce",
  description: "This is Home for Zoberry Enterprise Template",
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
