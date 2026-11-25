// src/hooks/useProduct.js
import { useEffect, useState } from "react";
import axios from "axios";
import { fetchProduct } from "../api/products";

export function useProduct(id) {
  const [state, setState] = useState({
    status: id ? "loading" : "idle",
    data: null,
    error: null,
  });

  useEffect(() => {
    // Dependent/conditional guard: do not fetch if no valid id is provided
    if (!id) {
      setState({ status: "idle", data: null, error: null });
      return;
    }

    const controller = new AbortController();
    setState({ status: "loading", data: null, error: null });

    fetchProduct(id, { signal: controller.signal })
      .then((data) => setState({ status: "success", data, error: null }))
      .catch((error) => {
        if (axios.isCancel(error) || error.name === "CanceledError") return;
        setState({ status: "error", data: null, error });
      });

    return () => controller.abort();
  }, [id]);

  return state;
}