import { getQuotes } from "../lib/quotes.mjs";

export default async function handler(request, response) {
  if (request.method && request.method !== "GET") {
    response.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const result = await getQuotes();
    response.setHeader("cache-control", "no-store");
    response.status(result.status).json(result.body);
  } catch (error) {
    response.status(500).json({
      fetchedAt: new Date().toISOString(),
      tickers: [],
      kb: null,
      errors: [error.message || "Unexpected server error"],
    });
  }
}
