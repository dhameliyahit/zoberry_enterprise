import { Category } from "@/types/category";
import Image from "next/image";
import Link from "next/link";

interface SingleItemProps {
  item: Category;
}

const SingleItem = ({ item }: SingleItemProps) => {
  // Fallbacks to keep rendering predictable and prevent crashes
  const imageSrc = item.image || "/images/categories/categories-01.png";
  const categoryName = item.name || "Unnamed Category";
  const productCount = item?.count ?? 0; // Standard e-commerce metric (e.g., 12 Items)

  return (
    <Link
      href={`/categories/${item.slug || ""}`}
      className="group flex flex-col items-center outline-none rounded-xl p-3 transition-all duration-200 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2"
      aria-label={`Browse ${categoryName} category, ${productCount} items available`}
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full max-w-[130px] bg-[#F2F3F8] rounded-full flex items-center justify-center mb-3 overflow-hidden shadow-sm ring-1 ring-black/5">
        {/* Absolute inner border overlay */}
        <div className="absolute inset-0 border border-gray-200/80 rounded-full overflow-hidden z-10 pointer-events-none" />

        <Image
          src={imageSrc}
          alt="" // Left blank intentionally because aria-label on the parent Link covers the context
          fill
          sizes="130px"
          className="object-cover transition-transform duration-300 ease-out group-hover:scale-110 group-focus-visible:scale-110"
          priority={false}
        />
      </div>

      {/* Text Container */}
      <div className="flex flex-col items-center gap-1">
        {/* Category Name */}
        <span className="relative text-sm font-semibold text-center text-gray-900 transition-colors duration-300 group-hover:text-blue-600 group-focus-visible:text-blue-600">
          {categoryName}
          {/* Animated underline bar centered under the text */}
          <span className="absolute bottom-0 left-1/2 block h-[2px] w-0 -translate-x-1/2 bg-blue-600 transition-all duration-300 group-hover:w-full group-focus-visible:w-full" />
        </span>

        {/* Item Counter */}
        <span className="text-xs font-medium text-gray-400 group-hover:text-gray-500 transition-colors duration-200">
          {productCount} {productCount === 1 ? "Item" : "Items"}
        </span>
      </div>
    </Link>
  );
};

export default SingleItem;
