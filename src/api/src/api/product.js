import { api } from "./client";

// Fetch paginated products (supports AbortSignal for cancellation)
export async function fetchProducts({ limit = 12, skip = 0, signal } = {}) {
  const { data } = await api.get("/products", {
    params: { limit, skip },
    signal,
  });
  return data; // { products, total, skip, limit }
}

// Fetch a single product by ID
export async function fetchProduct(id, { signal } = {}) {
  const { data } = await api.get(`/products/${id}`, { signal });
  return data;
}

// Fetch the list of product categories
export async function fetchCategories({ signal } = {}) {
  const { data } = await api.get("/products/category-list", { signal });
  return data;
}

// Fetch products belonging to a specific category
export async function fetchProductsByCategory(
  category,
  { limit = 12, skip = 0, signal } = {}
) {
  const { data } = await api.get(`/products/category/${category}`, {
    params: { limit, skip },
    signal,
  });
  return data;
}

// Search products by keyword
export async function searchProducts(query, { signal } = {}) {
  const { data } = await api.get("/products/search", {
    params: { q: query },
    signal,
  });
  return data;
}

// Create a new product (POST)
export async function createProduct(product) {
  const { data } = await api.post("/products/add", product);
  return data;
}

// Delete a product by ID (DELETE)
export async function deleteProduct(id) {
  const { data } = await api.delete(`/products/${id}`);
  return data;
}