async function fetchWithTimeout(url, options, label, timeoutMs = 8000) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...options,
      signal: controller.signal,
    });
  } catch (error) {
    if (error.name === "AbortError") {
      throw new Error(`${label} request timed out after ${timeoutMs}ms`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function numberFromText(value) {
  if (!value) return null;
  const clean = String(value)
    .replace(/,/g, "")
    .replace(/%/g, "")
    .replace(/&nbsp;?/g, " ")
    .trim();
  const parsed = Number(clean);
  return Number.isFinite(parsed) ? parsed : null;
}

function stripHtml(value) {
  return String(value)
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;?/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function fetchJson(url, label) {
  const response = await fetchWithTimeout(
    url,
    {
      headers: {
        accept: "application/json",
        "user-agent": "usdt-arbitrage-dashboard/1.0",
      },
    },
    label
  );

  if (!response.ok) {
    throw new Error(`${label} response error: HTTP ${response.status}`);
  }

  return response.json();
}

async function getUpbitTicker() {
  const data = await fetchJson(
    "https://api.upbit.com/v1/ticker?markets=KRW-USDT",
    "Upbit"
  );
  const ticker = Array.isArray(data) ? data[0] : data?.[0];
  if (!ticker?.trade_price) throw new Error("Upbit ticker format is unexpected.");

  return {
    exchange: "Upbit",
    market: ticker.market,
    price: Number(ticker.trade_price),
    changeRate: Number(ticker.signed_change_rate || 0),
    volume24h: Number(ticker.acc_trade_volume_24h || 0),
    tradeTimeKst: `${ticker.trade_date_kst || ""} ${ticker.trade_time_kst || ""}`.trim(),
    rawTimestamp: ticker.timestamp || ticker.trade_timestamp || null,
  };
}

async function getBithumbTicker() {
  const data = await fetchJson(
    "https://api.bithumb.com/v1/ticker?markets=KRW-USDT",
    "Bithumb"
  );
  const ticker = Array.isArray(data) ? data[0] : data?.[0];
  if (!ticker?.trade_price) throw new Error("Bithumb ticker format is unexpected.");

  return {
    exchange: "Bithumb",
    market: ticker.market,
    price: Number(ticker.trade_price),
    changeRate: Number(ticker.signed_change_rate || 0),
    volume24h: Number(ticker.acc_trade_volume_24h || 0),
    tradeTimeKst: `${ticker.trade_date_kst || ""} ${ticker.trade_time_kst || ""}`.trim(),
    rawTimestamp: ticker.timestamp || ticker.trade_timestamp || null,
  };
}

async function getOrderbook(url, label) {
  const data = await fetchJson(url, label);
  const book = Array.isArray(data) ? data[0] : data?.[0];
  if (!book?.orderbook_units?.length) {
    throw new Error(`${label} orderbook format is unexpected.`);
  }

  return {
    timestamp: book.timestamp || null,
    totalAskSize: Number(book.total_ask_size || 0),
    totalBidSize: Number(book.total_bid_size || 0),
    topAsk: Number(book.orderbook_units[0].ask_price),
    topBid: Number(book.orderbook_units[0].bid_price),
    units: book.orderbook_units.map((unit) => ({
      askPrice: Number(unit.ask_price),
      askSize: Number(unit.ask_size),
      bidPrice: Number(unit.bid_price),
      bidSize: Number(unit.bid_size),
    })),
  };
}

async function withOrderbook(tickerPromise, orderbookPromise) {
  const [tickerResult, orderbookResult] = await Promise.allSettled([
    tickerPromise,
    orderbookPromise,
  ]);

  if (tickerResult.status === "rejected") throw tickerResult.reason;

  return {
    ...tickerResult.value,
    orderbook: orderbookResult.status === "fulfilled" ? orderbookResult.value : null,
    orderbookError:
      orderbookResult.status === "rejected" ? orderbookResult.reason.message : null,
  };
}

async function getUpbitMarket() {
  return withOrderbook(
    getUpbitTicker(),
    getOrderbook("https://api.upbit.com/v1/orderbook?markets=KRW-USDT", "Upbit")
  );
}

async function getBithumbMarket() {
  return withOrderbook(
    getBithumbTicker(),
    getOrderbook("https://api.bithumb.com/v1/orderbook?markets=KRW-USDT", "Bithumb")
  );
}

function parseKbRates(html) {
  const tableIndex = html.indexOf('summary="적용일자');
  if (tableIndex < 0) return parseKbQuickRates(html);

  const tableHtml = html.slice(tableIndex, tableIndex + 18000);
  const firstRow = tableHtml.match(/<tbody>[\s\S]*?<tr>([\s\S]*?)<\/tr>/);
  if (!firstRow) throw new Error("KB rate first row was not found.");

  const cells = [...firstRow[1].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((match) =>
    stripHtml(match[1])
  );

  if (cells.length < 9) throw new Error("KB rate table column count is unexpected.");

  const summaryIndex = html.indexOf('summary="현찰사실때 SPREAD');
  const summaryHtml = summaryIndex >= 0 ? html.slice(summaryIndex, summaryIndex + 3000) : "";
  const summaryCells = [...summaryHtml.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((match) =>
    stripHtml(match[1])
  );

  const queryDate = stripHtml(html.match(/조회대상일\s*:\s*<span>\s*([^<]+)/)?.[1] || "");
  const queryDateTime = stripHtml(
    html.match(/조회일시\s*:\s*<span>\s*([^<]+)<\/span>/)?.[1] || ""
  );

  return {
    source: "KB국민은행",
    quoteRound: numberFromText(cells[0]),
    quoteTime: cells[1],
    baseRate: numberFromText(cells[2]),
    remittanceSend: numberFromText(cells[4]),
    remittanceReceive: numberFromText(cells[5]),
    cashBuy: numberFromText(cells[6]),
    cashSell: numberFromText(cells[7]),
    usdConversion: numberFromText(cells[8]),
    cashBuySpreadPct: numberFromText(summaryCells[0]),
    cashSellSpreadPct: numberFromText(summaryCells[1]),
    firstRate: numberFromText(summaryCells[2]),
    currentRate: numberFromText(summaryCells[3]),
    queryDate,
    queryDateTime,
  };
}

function parseUsdQuickRow(tableHtml, label) {
  const rows = [...tableHtml.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/g)].map((match) => match[1]);
  const usdRow = rows.find((row) => row.includes('alt="USD"') || row.includes(">USD<"));
  if (!usdRow) throw new Error(`KB quick ${label} USD row was not found.`);

  const cells = [...usdRow.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/g)].map((match) =>
    numberFromText(stripHtml(match[1]))
  );
  if (cells.length < 2 || !cells.every(Number.isFinite)) {
    throw new Error(`KB quick ${label} USD row values are incomplete.`);
  }
  return cells;
}

function parseKbQuickRates(html) {
  const tables = [...html.matchAll(/<table[^>]*>[\s\S]*?<\/table>/g)].map((match) => match[0]);
  const cashTable = tables.find(
    (table) =>
      table.includes("icn_usd.png") && table.includes("사실때") && table.includes("파실때")
  );
  const remittanceTable = tables.find(
    (table) =>
      table.includes("icn_usd.png") && table.includes("보낼때") && table.includes("받을때")
  );

  if (!cashTable || !remittanceTable) {
    throw new Error("KB quick rate tables were not found.");
  }

  const [cashBuy, cashSell] = parseUsdQuickRow(cashTable, "cash");
  const [remittanceSend, remittanceReceive] = parseUsdQuickRow(remittanceTable, "remittance");
  const baseRate = (remittanceSend + remittanceReceive) / 2;
  const descriptor = stripHtml(
    html.match(/<p[^>]*class="excDesc"[^>]*>\s*\*?\s*([\s\S]*?)<\/p>/)?.[1] || ""
  );
  const [, queryDate = "", quoteTime = "", quoteRound = ""] =
    descriptor.match(/(\d{4}\.\d{2}\.\d{2})\s+(\d{2}:\d{2}:\d{2})\s+(\d+)회차/) || [];

  return {
    source: "KB국민은행",
    quoteRound: numberFromText(quoteRound),
    quoteTime,
    baseRate,
    remittanceSend,
    remittanceReceive,
    cashBuy,
    cashSell,
    usdConversion: baseRate,
    cashBuySpreadPct: ((cashBuy - baseRate) / baseRate) * 100,
    cashSellSpreadPct: ((baseRate - cashSell) / baseRate) * 100,
    firstRate: null,
    currentRate: null,
    queryDate,
    queryDateTime: `${queryDate} ${quoteTime}`.trim(),
  };
}

function parseKbJsonRates(data) {
  const serviceData = data?.msg?.servicedata;
  const usd = serviceData?.ARRAY수?.find((row) => row.통화코드 === "USD");
  if (!usd) throw new Error("KB JSON USD rate row was not found.");

  const baseRate = numberFromText(usd.기준환율);
  const cashBuy = numberFromText(usd.현찰매도환율);
  const cashSell = numberFromText(usd.현찰매입환율);
  const remittanceSend = numberFromText(usd.전신환매도율);
  const remittanceReceive = numberFromText(usd.전신환매입율 || usd.전신환매입률);

  if (![baseRate, cashBuy, cashSell, remittanceSend, remittanceReceive].every(Number.isFinite)) {
    throw new Error("KB JSON USD rate values are incomplete.");
  }

  return {
    source: "KB국민은행",
    quoteRound: numberFromText(serviceData.적용회차),
    quoteTime: serviceData.적용시분초 || "",
    baseRate,
    remittanceSend,
    remittanceReceive,
    cashBuy,
    cashSell,
    usdConversion: baseRate,
    cashBuySpreadPct: ((cashBuy - baseRate) / baseRate) * 100,
    cashSellSpreadPct: ((baseRate - cashSell) / baseRate) * 100,
    firstRate: null,
    currentRate: null,
    queryDate: serviceData.적용일자 || "",
    queryDateTime: `${serviceData.적용일자 || ""} ${serviceData.적용시분초 || ""}`.trim(),
  };
}

async function getKbRatesFromJson() {
  const data = await fetchJson(
    "https://obizapi.kbstar.com/quics?QAction=1221719&page=C101597",
    "KB"
  );

  if (data?.msg?.common?.status !== "S") {
    throw new Error("KB JSON rate response status is not successful.");
  }

  return parseKbJsonRates(data);
}

async function getKbRates() {
  try {
    return await getKbRatesFromJson();
  } catch (jsonError) {
    const response = await fetchWithTimeout(
      "https://obizapi.kbstar.com/quics?page=C101597",
      {
        headers: {
          accept: "text/html",
          "user-agent": "Mozilla/5.0 usdt-arbitrage-dashboard/1.0",
        },
      },
      "KB"
    );

    if (!response.ok) {
      throw new Error(`KB rate page response error: HTTP ${response.status}`);
    }

    try {
      const html = await response.text();
      return parseKbRates(html);
    } catch (htmlError) {
      throw new Error(`${jsonError.message} / ${htmlError.message}`);
    }
  }
}

export async function getQuotes() {
  const fetchedAt = new Date().toISOString();
  const sources = await Promise.allSettled([
    getUpbitMarket(),
    getBithumbMarket(),
    getKbRates(),
  ]);

  const [upbit, bithumb, kb] = sources;
  const errors = sources
    .map((result) => (result.status === "rejected" ? result.reason.message : null))
    .filter(Boolean);

  return {
    status: errors.length === 3 ? 502 : 200,
    body: {
      fetchedAt,
      tickers: [upbit, bithumb]
        .filter((result) => result.status === "fulfilled")
        .map((result) => result.value),
      kb: kb.status === "fulfilled" ? kb.value : null,
      errors,
    },
  };
}
