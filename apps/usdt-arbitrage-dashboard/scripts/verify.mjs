import assert from "node:assert/strict";
import { spawn } from "node:child_process";

const port = Number(process.env.VERIFY_PORT || 4193);
const baseUrl = `http://localhost:${port}`;

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function fetchWithRetry(url, attempts = 30) {
  let lastError;
  for (let attempt = 0; attempt < attempts; attempt += 1) {
    try {
      const response = await fetch(url, { cache: "no-store" });
      if (response.ok) return response;
      lastError = new Error(`HTTP ${response.status}`);
    } catch (error) {
      lastError = error;
    }
    await sleep(500);
  }
  throw lastError;
}

function preferredSellRate(baseRate, rawSellRate, preference = 0.9) {
  return baseRate - (baseRate - rawSellRate) * (1 - preference);
}

function orderbookBuyQuote(ticker, amount) {
  let remaining = amount;
  let filled = 0;
  let cost = 0;

  for (const unit of ticker.orderbook?.units || []) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, unit.askSize);
    cost += take * unit.askPrice;
    filled += take;
    remaining -= take;
  }

  assert.ok(filled > 0, `${ticker.exchange} orderbook has no usable asks`);
  return {
    averagePrice: cost / filled,
    incomplete: remaining > 0,
  };
}

function round2(value) {
  return Math.round(value * 100) / 100;
}

const child = spawn(process.execPath, ["server.mjs"], {
  cwd: new URL("..", import.meta.url),
  env: { ...process.env, PORT: String(port) },
  stdio: ["ignore", "pipe", "pipe"],
});

let output = "";
child.stdout.on("data", (chunk) => {
  output += chunk.toString();
});
child.stderr.on("data", (chunk) => {
  output += chunk.toString();
});

try {
  const pageResponse = await fetchWithRetry(baseUrl);
  assert.equal(pageResponse.headers.get("content-type")?.includes("text/html"), true);
  const pageHtml = await pageResponse.text();
  for (const marker of [
    'value="starFx"',
    "tradeForm",
    "tradeDateInput",
    "tradeAmountInput",
    "tradeBuyPriceInput",
    "tradeSellPriceInput",
    "tradeRows",
    "tradeTotal",
    "rateSourceBox",
  ]) {
    assert.ok(pageHtml.includes(marker), `Page is missing expected marker: ${marker}`);
  }

  const jsResponse = await fetchWithRetry(`${baseUrl}/app.js`);
  assert.equal(jsResponse.headers.get("content-type")?.includes("text/javascript"), true);
  const appJs = await jsResponse.text();
  for (const marker of [
    "TRADE_STORAGE_KEY",
    "profitForTrade",
    "renderTrades",
    "normalizeTrade",
    "addTrade",
    "deleteTrade",
    "getEffectiveRateInfo",
    "Star FX 앱 환율 대기 중, KB 대안 사용",
    "setInterval(loadQuotes, 10_000)",
  ]) {
    assert.ok(appJs.includes(marker), `App script is missing expected marker: ${marker}`);
  }

  const badPathResponse = await fetch(`${baseUrl}/%E0%A4%A`);
  assert.equal(badPathResponse.status, 400, "Malformed URL path should return 400");
  const stillAliveResponse = await fetchWithRetry(`${baseUrl}/`);
  assert.equal(stillAliveResponse.ok, true, "Server should stay alive after malformed path");

  const apiResponse = await fetchWithRetry(`${baseUrl}/api/quotes`, 40);
  const data = await apiResponse.json();

  assert.match(data.fetchedAt, /^\d{4}-\d{2}-\d{2}T/);
  assert.equal(Array.isArray(data.tickers), true);
  assert.ok(data.tickers.length >= 2, "Expected Upbit and Bithumb tickers");

  for (const ticker of data.tickers) {
    assert.ok(["Upbit", "Bithumb"].includes(ticker.exchange), `Unknown exchange ${ticker.exchange}`);
    assert.equal(ticker.market, "KRW-USDT");
    assert.ok(ticker.price > 1000 && ticker.price < 3000, `${ticker.exchange} price out of expected range`);
    assert.ok(ticker.volume24h >= 0, `${ticker.exchange} 24h volume is invalid`);
    assert.ok(ticker.orderbook, `${ticker.exchange} orderbook is missing`);
    assert.ok(ticker.orderbook.topAsk > ticker.orderbook.topBid, `${ticker.exchange} spread is invalid`);
    assert.ok(ticker.orderbook.topAsk > 1000 && ticker.orderbook.topAsk < 3000, `${ticker.exchange} top ask is invalid`);
    assert.ok(ticker.orderbook.topBid > 1000 && ticker.orderbook.topBid < 3000, `${ticker.exchange} top bid is invalid`);
    assert.ok(ticker.orderbook.units.length >= 5, `${ticker.exchange} orderbook depth is too shallow`);
  }

  assert.ok(data.kb, "KB rates are missing");
  const kb = data.kb;
  assert.ok(kb.baseRate > 1000 && kb.baseRate < 3000, "KB base rate out of expected range");
  assert.ok(kb.cashSell < kb.baseRate, "KB cash sell rate should be below base rate");
  assert.ok(kb.cashBuy > kb.baseRate, "KB cash buy rate should be above base rate");
  assert.ok(kb.remittanceReceive < kb.baseRate, "KB remittance receive rate should be below base rate");
  assert.ok(kb.remittanceSend > kb.baseRate, "KB remittance send rate should be above base rate");

  const cashPreferred = preferredSellRate(kb.baseRate, kb.cashSell);
  const receivePreferred = preferredSellRate(kb.baseRate, kb.remittanceReceive);
  assert.ok(cashPreferred > kb.cashSell && cashPreferred < kb.baseRate);
  assert.ok(receivePreferred > kb.remittanceReceive && receivePreferred < kb.baseRate);
  assert.equal((1500 - 1498) * 5000, 10000, "2 KRW rate gap should move 5,000 USDT by 10,000 KRW");
  assert.equal(
    Math.round((1503.55 - 1476) * 5000),
    137750,
    "Actual trade profit calculation should round to the expected KRW amount"
  );

  const amount = 5000;
  const calculations = data.tickers.map((ticker) => {
    const feeRate = ticker.exchange === "Bithumb" ? 0.0004 : 0.0005;
    const quote = orderbookBuyQuote(ticker, amount);
    const buyCost = quote.averagePrice * amount;
    const buyFee = buyCost * feeRate;
    const proceeds = cashPreferred * amount;
    return {
      exchange: ticker.exchange,
      spread: cashPreferred - quote.averagePrice,
      averageBuyPrice: quote.averagePrice,
      netProfit: proceeds - buyCost - buyFee,
      breakEvenRate: quote.averagePrice * (1 + feeRate),
      orderbookIncomplete: quote.incomplete,
    };
  });

  assert.equal(calculations.length, data.tickers.length);
  for (const row of calculations) {
    assert.ok(Number.isFinite(row.netProfit), `${row.exchange} net profit is invalid`);
    assert.ok(Number.isFinite(row.breakEvenRate), `${row.exchange} break-even is invalid`);
  }

  console.log("Verification passed");
  console.log(
    JSON.stringify(
      {
        fetchedAt: data.fetchedAt,
        kb: {
          baseRate: kb.baseRate,
          cashSell: kb.cashSell,
          cashPreferred: round2(cashPreferred),
          receivePreferred: round2(receivePreferred),
        },
        calculations: calculations.map((row) => ({
          exchange: row.exchange,
          averageBuyPrice: round2(row.averageBuyPrice),
          spread: round2(row.spread),
          netProfit: Math.round(row.netProfit),
          breakEvenRate: round2(row.breakEvenRate),
          orderbookIncomplete: row.orderbookIncomplete,
        })),
      },
      null,
      2
    )
  );
} catch (error) {
  console.error("Verification failed");
  console.error(error);
  if (output.trim()) console.error(output);
  process.exitCode = 1;
} finally {
  child.kill();
}
