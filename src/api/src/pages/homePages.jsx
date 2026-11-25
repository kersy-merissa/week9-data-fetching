import { useEffect, useState } from "react";
import {
  createProduct,
  deleteProduct,
  fetchCategories,
  fetchProducts,
} from "../api/products";

// Read a query parameter from the current browser URL
function getSearchParam(name, fallback) {
  return new URLSearchParams(window.location.search).get(name) ?? fallback;
}

export default function HomePage() {
  const limit = 8;

  // Initialize category and page from the URL query string
  const [category, setCategory] = useState(() => getSearchParam("category", ""));
  const [page, setPage] = useState(() => Number(getSearchParam("page", 1)));

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [total, setTotal] = useState(0);
  const [status, setStatus] = useState("loading");
  const [error, setError] = useState(null);

  // Form & mutation feedback state
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");

  // Sync `category` and `page` to the browser URL without reloading
  useEffect(() => {
    const url = new URL(window.location.href);
    if (category) {
      url.searchParams.set("category", category);
    } else {
      url.searchParams.delete("category");
    }
    url.searchParams.set("page", String(page));
    window.history.replaceState(null, "", url);
  }, [category, page]);

  // Load categories and products in parallel using Promise.all (avoids a waterfall)
  useEffect(() => {
    const controller = new AbortController();
    const skip = (page - 1) * limit;
    setStatus("loading");
    setError(null);

    Promise.all([
      fetchCategories({ signal: controller.signal }),
      fetchProducts({ limit, skip, signal: controller.signal }),
    ])
      .then(([categoryList, productsResponse]) => {
        setCategories(categoryList);

        // If a category filter is active, filter the returned products client-side or use category endpoint
        const items = category
          ? productsResponse.products.filter((p) => p.category === category)
          : productsResponse.products;

        setProducts(items);
        setTotal(productsResponse.total);
        setStatus("success");
      })
      .catch((err) => {
        if (err.name === "CanceledError") return;
        setError(err.message);
        setStatus("error");
      });

    return () => controller.abort();
  }, [category, page]);

  // Handle "Add product" via event handler (POST)
  async function handleAddProduct(e) {
    e.preventDefault();
    if (!title.trim() || !price) return;

    setIsSubmitting(true);
    setFeedback("");
    try {
      const created = await createProduct({
        title: title.trim(),
        price: Number(price),
        category: category || "general",
      });

      // Prepend the created product to the top of the current list
      setProducts((prev) => [created, ...prev]);
      setTitle("");
      setPrice("");
      setFeedback(`Added "${created.title}" (simulated by DummyJSON).`);
    } catch (err) {
      setFeedback(err.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Handle "Delete" with optimistic removal and rollback on failure
  async function handleDelete(id) {
    const previousProducts = products;
    setFeedback("");

    // 1. Optimistically remove item from UI immediately
    setProducts((prev) => prev.filter((item) => item.id !== id));

    try {
      await deleteProduct(id);
      setFeedback(`Deleted product #${id} (simulated by DummyJSON).`);
    } catch (err) {
      // 2. Roll back to previous list if the API request fails
      setProducts(previousProducts);
      setFeedback(`Couldn't delete product #${id}: ${err.message}`);
    }
  }

  function handleCategoryChange(nextCategory) {
    setCategory(nextCategory);
    setPage(1); // Reset to page 1 when switching categories
  }

  const totalPages = Math.max(1, Math.ceil(total / limit));

  return (
    <main className="max-w-4xl mx-auto p-6 space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-bold">Week 9 Mini-Shop</h1>
        <span className="text-sm text-gray-600">
          Page {page} of {totalPages}
        </span>
      </header>

      {/* Category Filter Controls */}
      <div className="flex flex-wrap gap-2">
        <button
          type="button"
          onClick={() => handleCategoryChange("")}
          className={`px-3 py-1 rounded border ${
            category === "" ? "bg-blue-600 text-white" : "bg-white"
          }`}
        >
          All
        </button>
        {categories.slice(0, 8).map((cat) => {
          const slug = typeof cat === "string" ? cat : cat.slug;
          const label = typeof cat === "string" ? cat : cat.name;
          return (
            <button
              key={slug}
              type="button"
              onClick={() => handleCategoryChange(slug)}
              className={`px-3 py-1 rounded border ${
                category === slug ? "bg-blue-600 text-white" : "bg-white"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Add Product Form */}
      <form
        onSubmit={handleAddProduct}
        className="flex flex-wrap gap-3 p-4 border rounded bg-gray-50"
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Product title"
          className="border px-3 py-1.5 rounded bg-white"
          required
        />
        <input
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="Price"
          min="1"
          className="border px-3 py-1.5 rounded bg-white w-28"
          required
        />
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-1.5 rounded bg-blue-600 text-white disabled:opacity-50"
        >
          {isSubmitting ? "Saving..." : "Add Product"}
        </button>
      </form>

      {feedback && <p className="text-sm text-blue-700">{feedback}</p>}

      {/* Loading / Error / Products List */}
      {status === "loading" && <p className="text-gray-600">Loading store data...</p>}
      {status === "error" && <p className="text-red-600">Error: {error}</p>}

      {status === "success" && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {products.map((product) => (
            <li
              key={product.id}
              className="p-4 border rounded flex items-center justify-between gap-3"
            >
              <div>
                <h2 className="font-semibold">{product.title}</h2>
                <p className="text-sm text-gray-600">
                  ${product.price} · {product.category}
                </p>
              </div>
              <button
                type="button"
                onClick={() => handleDelete(product.id)}
                className="px-3 py-1 text-sm border border-red-300 text-red-600 rounded hover:bg-red-50"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      )}

      {/* Pagination Controls */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          Previous
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => setPage((p) => p + 1)}
          className="px-3 py-1 border rounded disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </main>
  );
}