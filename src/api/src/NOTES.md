# Week 9 Day 1 Reflection — Limits of `useEffect` Fetching

- **Caching:** Going from page 2 back to page 1 triggered another network request instead of reusing previously fetched page data.
- **Deduplication:** Multiple components requesting the same resource at once would fire separate requests unless shared or lifted.
- **Background refresh & retries:** Plain `useEffect` does not automatically refresh stale data when returning to the browser tab or retry failed requests with backoff.
- **Mutations & cache invalidation:** Updating lists after `POST` or `DELETE` required manual state updates or `refetch()` calls rather than automatic query invalidation.