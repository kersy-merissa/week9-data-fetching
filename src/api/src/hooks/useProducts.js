// src/hooks/useProducts.js
import { useEffect, useState } from "react";
import axios from "axios";
import { fetchProducts, fetchProductsByCategory } from "../api/products";

export function useProducts({ category = "", limit = 12, skip = 0 } = {}) {
  const [state, setState] = useState({
    status: "loading", // "loading" | "success" | "error"
    data: null,
    error: null,
  });

  useEffect(() => {
    const controller = new AbortController();
    setState((prev) => ({ ...prev, status: "loading", error: null }));

    // Choose category endpoint when a category is selected, otherwise all products
    const request = category
      ? fetchProductsByCategory(category, { limit, skip, signal: controller.signal })
      : fetchProducts({ limit, skip, signal: controller.signal });

    request
      .then((data) => {
        setState({ status: "success", data, error: null });
      })
      .catch((error) => {
        // Ignore intentional aborts when dependencies change or component unmounts
        if (axios.isCancel(error) || error.name === "CanceledError") return;
        setState({ status: "error", data: null, error });
      });

    // Cancel in-flight request if inputs change or component unmounts
    return () => controller.abort();
  }, [category, limit, skip]);

  return state;
}