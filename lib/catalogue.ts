/**
 * Pure catalogue filtering + sorting. No server/DB imports, so this runs happily
 * in Client Components too (the shop page filters live, without a page reload).
 */
import type { Product, ProductFilters, SortKey } from "./types";

export const ALL_CATEGORY = "all";

export const sortOptions: { value: SortKey; label: string }[] = [
  { value: "featured", label: "Tanlangan" },
  { value: "popularity", label: "Mashhur" },
  { value: "price-asc", label: "Narx: arzondan" },
  { value: "price-desc", label: "Narx: qimmatdan" },
];

export function filterAndSortProducts(
  products: Product[],
  { category = ALL_CATEGORY, search = "", sort = "featured" }: ProductFilters = {},
): Product[] {
  const query = search.trim().toLowerCase();

  const filtered = products.filter((p) => {
    const matchesCategory = category === ALL_CATEGORY || p.categorySlug === category;
    const matchesSearch =
      query.length === 0 ||
      p.name.toLowerCase().includes(query) ||
      p.description.toLowerCase().includes(query) ||
      p.categoryName.toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  return sortProducts(filtered, sort);
}

function sortProducts(products: Product[], sort: SortKey): Product[] {
  const copy = [...products];
  switch (sort) {
    case "price-asc":
      return copy.sort((a, b) => a.price - b.price);
    case "price-desc":
      return copy.sort((a, b) => b.price - a.price);
    case "popularity":
      return copy.sort((a, b) => b.popularity - a.popularity);
    case "featured":
    default:
      return copy.sort(
        (a, b) =>
          Number(b.isFeatured) - Number(a.isFeatured) ||
          Number(b.isBestseller) - Number(a.isBestseller) ||
          b.popularity - a.popularity,
      );
  }
}
