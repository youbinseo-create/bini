const state = {
  quotes: null,
  loading: false,
  trades: [],
};

const TRADE_STORAGE_KEY = "usdt-arbitrage-trades-v1";

const els = {
  amount: document.querySelector("#amountInput"),
  upbitFee: document.querySelector("#upbitFeeInput"),
  bithumbFee: document.querySelector("#bithumbFeeInput"),
  transferFee: document.querySelector("#transferFeeInput"),
  priceBuffer: document.querySelector("#priceBufferInput"),
  fixedCost: document.querySelector("#fixedCostInput"),
  kbMode: document.querySelector("#kbModeInput"),
  manualRate: document.querySelector("#manualRateInput"),
  manualRateField: document.querySelector("#manualRateField"),
  rateDiffBox: document.querySelector("#rateDiffBox"),
  rateDiff: document.querySelector("#rateDiff"),
  rateDiffImpact: document.querySelector("#rateDiffImpact"),
  refreshButton: document.querySelector("#refreshButton"),
  inputWarning: document.querySelector("#inputWarning"),
  statusText: document.querySelector("#statusText"),
  refreshDot: document.querySelector("#refreshDot"),
  amountBadge: document.querySelector("#amountBadge"),
  amountSummary: document.querySelector("#amountSummary"),
  tableAmountLabel: document.querySelector("#tableAmountLabel"),
  effectiveRate: document.querySelector("#effectiveRate"),
  effectiveRateHint: document.querySelector("#effectiveRateHint"),
  bestProfit: document.querySelector("#bestProfit"),
  bestExchange: document.querySelector("#bestExchange"),
  breakEvenRate: document.querySelector("#breakEvenRate"),
  exchangeRows: document.querySelector("#exchangeRows"),
  kbTime: document.querySelector("#kbTime"),
  kbBase: document.querySelector("#kbBase"),
  kbCashSell: document.querySelector("#kbCashSell"),
  kbCashSellPreferred: document.querySelector("#kbCashSellPreferred"),
  kbReceive: document.querySelector("#kbReceive"),
  kbReceivePreferred: document.querySelector("#kbReceivePreferred"),
  tradeForm: document.querySelector("#tradeForm"),
  tradeDate: document.querySelector("#tradeDateInput"),
  tradeAmount: document.querySelector("#tradeAmountInput"),
  tradeBuyPrice: document.querySelector("#tradeBuyPriceInput"),
  tradeSellPrice: document.querySelector("#tradeSellPriceInput"),
  tradeWarning: document.querySelector("#tradeWarning"),
  tradeRows: document.querySelector("#tradeRows"),
  tradeTotal: document.querySelector("#tradeTotal"),
};

const money = new Intl.NumberFormat("ko-KR", { maximumFractionDigits: 0 });

const rate = new Intl.NumberFormat("ko-KR", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const amountFormat = new Intl.NumberFormat("ko-KR", {
  maximumFractionDigits: 2,
});

function asNumber(input, fallback = 0) {
  const value = Number(input?.value);
  return Number.isFinite(value) ? value : fallback;
}

function formatAmount(value) {
  return `${amountFormat.format(Math.max(0, value || 0))} USDT`;
}

function formatRate(value, signed = false) {
  if (!Number.isFinite(value)) return "-";
  const sign = signed && value > 0 ? "+" : signed && value < 0 ? "-" : "";
  return `${sign}${rate.format(Math.abs(value))}원`;
}

function formatMoney(value, signed = false) {
  if (!Number.isFinite(value)) return "-";
  const sign = signed && value > 0 ? "+" : signed && value < 0 ? "-" : "";
  return `${sign}${money.format(Math.abs(value))}원`;
}

function localDateText(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function loadTrades() {
  try {
    const parsed = JSON.parse(localStorage.getItem(TRADE_STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveTrades() {
  localStorage.setItem(TRADE_STORAGE_KEY, JSON.stringify(state.trades));
}

function profitForTrade(trade) {
  return (trade.sellPrice - trade.buyPrice) * trade.amount;
}

function preferredSellRate(baseRate, rawSellRate, preference = 0.9) {
  if (!Number.isFinite(baseRate) || !Number.isFinite(rawSellRate)) return null;
  return baseRate - (baseRate - rawSellRate) * (1 - preference);
}

function orderbookBuyQuote(ticker, amount) {
  const units = ticker.orderbook?.units || [];
  let remaining = amount;
  let filled = 0;
  let cost = 0;
  let lastAsk = null;

  for (const unit of units) {
    if (remaining <= 0) break;
    const askPrice = Number(unit.askPrice);
    const askSize = Number(unit.askSize);
    if (!Number.isFinite(askPrice) || !Number.isFinite(askSize) || askSize <= 0) continue;
    const take = Math.min(remaining, askSize);
    cost += take * askPrice;
    filled += take;
    remaining -= take;
    lastAsk = askPrice;
  }

  if (filled > 0) {
    return {
      averagePrice: cost / filled,
      filled,
      lastAsk,
      incomplete: remaining > 0,
      source: "orderbook",
    };
  }

  return {
    averagePrice: Number(ticker.price),
    filled: amount,
    lastAsk: Number(ticker.price),
    incomplete: true,
    source: "ticker",
  };
}

function getKbDerived(kb) {
  if (!kb) return null;

  return {
    cashSellPreferred: preferredSellRate(kb.baseRate, kb.cashSell),
    receivePreferred: preferredSellRate(kb.baseRate, kb.remittanceReceive),
  };
}

function getEffectiveKbRate() {
  const kb = state.quotes?.kb;
  const derived = getKbDerived(kb);
  const mode = els.kbMode.value;

  if (mode === "starFx" || mode === "manual") return asNumber(els.manualRate, null);
  if (!kb) return null;
  if (mode === "baseRate") return kb.baseRate;
  if (mode === "remittanceReceive") return derived?.receivePreferred ?? null;
  return derived?.cashSellPreferred ?? null;
}

function getEffectiveHint() {
  const mode = els.kbMode.value;
  if (mode === "starFx") return "Star FX 앱 표시 환율 직접 반영";
  if (mode === "manual") return "사용자 입력값 직접 반영";
  if (mode === "baseRate") return "KB 매매기준율 그대로";
  if (mode === "remittanceReceive") return "송금 받을 때 스프레드 90% 차감";
  return "현찰 파실 때 스프레드 90% 차감";
}

function isManualRateMode() {
  return els.kbMode.value === "starFx" || els.kbMode.value === "manual";
}

function feeRateForExchange(exchange) {
  if (exchange === "Bithumb") return asNumber(els.bithumbFee, 0) / 100;
  return asNumber(els.upbitFee, 0) / 100;
}

function validationMessage() {
  const amount = asNumber(els.amount, 0);
  const transferFee = asNumber(els.transferFee, 0);
  const priceBuffer = asNumber(els.priceBuffer, 0);
  const fixedCost = asNumber(els.fixedCost, 0);
  const upbitFee = asNumber(els.upbitFee, 0);
  const bithumbFee = asNumber(els.bithumbFee, 0);
  const manualRate = asNumber(els.manualRate, 0);

  if (amount <= 0) return "테더 수량은 0보다 커야 합니다.";
  if (transferFee < 0) return "전송 수수료는 0 이상이어야 합니다.";
  if (transferFee >= amount) return "전송 수수료가 테더 수량보다 크거나 같습니다.";
  if (upbitFee < 0 || bithumbFee < 0) return "거래 수수료는 0 이상이어야 합니다.";
  if (fixedCost < 0) return "고정비는 0 이상이어야 합니다.";
  if (priceBuffer < 0) return "보수적 매수가 버퍼는 0 이상이어야 합니다.";
  if (isManualRateMode() && manualRate <= 0) {
    return "Star FX 앱 환율은 0보다 커야 합니다.";
  }
  return "";
}

function setStatus(text, tone = "idle") {
  els.statusText.textContent = text;
  els.refreshDot.classList.toggle("live", tone === "live");
  els.refreshDot.classList.toggle("error", tone === "error");
}

function calculateRows() {
  if (validationMessage()) return [];

  const amount = asNumber(els.amount, 5000);
  const transferFee = asNumber(els.transferFee, 0);
  const priceBuffer = asNumber(els.priceBuffer, 0);
  const fixedCost = asNumber(els.fixedCost, 0);
  const effectiveRate = getEffectiveKbRate();
  const tickers = state.quotes?.tickers || [];

  if (!Number.isFinite(effectiveRate) || tickers.length === 0) return [];

  return tickers.map((ticker) => {
    const feeRate = feeRateForExchange(ticker.exchange);
    const buyQuote = orderbookBuyQuote(ticker, amount);
    const buyPrice = buyQuote.averagePrice + priceBuffer;
    const sellableAmount = Math.max(0, amount - transferFee);
    const isIncomplete = buyQuote.incomplete;
    const buyCost = isIncomplete ? null : buyPrice * amount;
    const buyFee = isIncomplete ? null : buyCost * feeRate;
    const proceeds = isIncomplete ? null : effectiveRate * sellableAmount;
    const spread = isIncomplete ? null : effectiveRate - buyPrice;
    const netProfit = isIncomplete ? null : proceeds - buyCost - buyFee - fixedCost;
    const breakEvenRate =
      !isIncomplete && sellableAmount > 0
        ? (buyCost + buyFee + fixedCost) / sellableAmount
        : null;

    return {
      ...ticker,
      amount,
      sellableAmount,
      buyQuote,
      isIncomplete,
      buyPrice,
      buyCost,
      buyFee,
      proceeds,
      spread,
      netProfit,
      breakEvenRate,
    };
  });
}

function renderKb() {
  const kb = state.quotes?.kb;
  const derived = getKbDerived(kb);

  if (!kb) {
    els.kbTime.textContent = "KB 데이터를 불러오지 못했습니다.";
    els.kbBase.textContent = "-";
    els.kbCashSell.textContent = "-";
    els.kbCashSellPreferred.textContent = "-";
    els.kbReceive.textContent = "-";
    els.kbReceivePreferred.textContent = "-";
    return;
  }

  els.kbTime.textContent = `${kb.queryDate || "오늘"} ${kb.quoteTime || ""} ${kb.quoteRound ? `${kb.quoteRound}회차` : ""}`.trim();
  els.kbBase.textContent = formatRate(kb.baseRate);
  els.kbCashSell.textContent = formatRate(kb.cashSell);
  els.kbCashSellPreferred.textContent = formatRate(derived.cashSellPreferred);
  els.kbReceive.textContent = formatRate(kb.remittanceReceive);
  els.kbReceivePreferred.textContent = formatRate(derived.receivePreferred);

  if (asNumber(els.manualRate, 0) === 0) {
    els.manualRate.value = (derived.receivePreferred || derived.cashSellPreferred || kb.baseRate || 0).toFixed(2);
  }
}

function renderRateDiff() {
  const kb = state.quotes?.kb;
  const derived = getKbDerived(kb);
  const referenceRate = derived?.receivePreferred;
  const effectiveRate = getEffectiveKbRate();
  const amount = asNumber(els.amount, 5000);
  const transferFee = asNumber(els.transferFee, 0);
  const sellableAmount = Math.max(0, amount - transferFee);
  const shouldShow =
    isManualRateMode() && Number.isFinite(referenceRate) && Number.isFinite(effectiveRate);

  els.rateDiffBox.hidden = !shouldShow;
  if (!shouldShow) return;

  const diff = effectiveRate - referenceRate;
  const impact = diff * sellableAmount;
  const tone = diff > 0 ? "positive" : diff < 0 ? "negative" : "neutral";
  els.rateDiff.className = tone;
  els.rateDiff.textContent = formatRate(diff, true);
  els.rateDiffImpact.textContent = `${formatAmount(sellableAmount)} 기준 영향 ${formatMoney(impact, true)}`;
}

function renderTable(rows) {
  const invalid = validationMessage();
  if (invalid) {
    els.exchangeRows.innerHTML = `<tr><td colspan="5" class="empty">${invalid}</td></tr>`;
    return;
  }

  if (!rows.length) {
    els.exchangeRows.innerHTML =
      '<tr><td colspan="5" class="empty">계산할 데이터가 아직 없습니다.</td></tr>';
    return;
  }

  els.exchangeRows.innerHTML = rows
    .map((row) => {
      const tone = row.netProfit > 0 ? "positive" : row.netProfit < 0 ? "negative" : "neutral";
      const spreadTone = row.spread > 0 ? "positive" : row.spread < 0 ? "negative" : "neutral";
      const basis = row.buyQuote.source === "orderbook" ? "" : " (체결가 대체)";
      const incomplete = row.buyQuote.incomplete
        ? ` / 호가 부족 ${rate.format(row.buyQuote.filled)} USDT`
        : "";
      return `
        <tr>
          <td data-label="거래소"><span class="cellValue">${row.exchange}</span></td>
          <td data-label="최근 체결가"><span class="cellValue">${formatRate(row.price)}</span></td>
          <td data-label="호가 평균가"><span class="cellValue">${formatRate(row.buyPrice)}<small>${basis}${incomplete}</small></span></td>
          <td data-label="스프레드" class="${spreadTone}"><span class="cellValue">${formatRate(row.spread, true)}</span></td>
          <td data-label="예상 순익" class="${tone}"><span class="cellValue">${row.isIncomplete ? "호가 부족" : formatMoney(row.netProfit, true)}</span></td>
        </tr>
      `;
    })
    .join("");
}

function tradeValidationMessage() {
  const amount = asNumber(els.tradeAmount, 0);
  const buyPrice = asNumber(els.tradeBuyPrice, 0);
  const sellPrice = asNumber(els.tradeSellPrice, 0);

  if (!els.tradeDate.value) return "진행 날짜를 입력하세요.";
  if (amount <= 0) return "수량은 0보다 커야 합니다.";
  if (buyPrice <= 0) return "산 가격은 0보다 커야 합니다.";
  if (sellPrice <= 0) return "판 가격은 0보다 커야 합니다.";
  return "";
}

function renderTrades() {
  const totalProfit = state.trades.reduce((sum, trade) => sum + profitForTrade(trade), 0);
  els.tradeTotal.textContent = `누적 ${formatMoney(totalProfit, true)}`;
  els.tradeTotal.className = `tradeTotal ${
    totalProfit > 0 ? "positive" : totalProfit < 0 ? "negative" : "neutral"
  }`;

  if (!state.trades.length) {
    els.tradeRows.innerHTML =
      '<tr><td colspan="6" class="empty">아직 기록이 없습니다.</td></tr>';
    return;
  }

  els.tradeRows.innerHTML = [...state.trades]
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
    .map((trade) => {
      const profit = profitForTrade(trade);
      const tone = profit > 0 ? "positive" : profit < 0 ? "negative" : "neutral";
      return `
        <tr>
          <td data-label="날짜"><span class="cellValue">${trade.date}</span></td>
          <td data-label="수량"><span class="cellValue">${formatAmount(trade.amount)}</span></td>
          <td data-label="산 가격"><span class="cellValue">${formatRate(trade.buyPrice)}</span></td>
          <td data-label="판 가격"><span class="cellValue">${formatRate(trade.sellPrice)}</span></td>
          <td data-label="실현 차익" class="${tone}"><span class="cellValue">${formatMoney(profit, true)}</span></td>
          <td data-label="삭제"><button class="deleteButton" type="button" data-trade-id="${trade.id}">삭제</button></td>
        </tr>
      `;
    })
    .join("");
}

function renderSummary(rows) {
  const invalid = validationMessage();
  const effectiveRate = getEffectiveKbRate();
  els.effectiveRate.textContent = formatRate(effectiveRate);
  els.effectiveRateHint.textContent = getEffectiveHint();
  renderRateDiff();
  els.inputWarning.hidden = !invalid;
  els.inputWarning.textContent = invalid;

  if (invalid) {
    els.bestProfit.textContent = "입력 확인";
    els.bestExchange.textContent = invalid;
    els.breakEvenRate.textContent = "-";
    return;
  }

  const completeRows = rows.filter((row) => Number.isFinite(row.netProfit));
  if (!completeRows.length) {
    els.bestProfit.textContent = "-";
    els.bestExchange.textContent = "거래소 비교 전";
    els.breakEvenRate.textContent = "-";
    return;
  }

  const best = completeRows.reduce((winner, row) => (row.netProfit > winner.netProfit ? row : winner), completeRows[0]);
  els.bestProfit.textContent = formatMoney(best.netProfit, true);
  els.bestExchange.textContent = `${best.exchange} 기준`;
  els.breakEvenRate.textContent = formatRate(best.breakEvenRate);
}

function render() {
  const amount = asNumber(els.amount, 5000);
  const amountText = formatAmount(amount);
  els.amountBadge.textContent = amountText;
  els.amountSummary.textContent = amountText;
  els.tableAmountLabel.textContent = amountText;
  els.manualRateField.classList.toggle("visible", isManualRateMode());
  renderKb();
  const rows = calculateRows();
  renderSummary(rows);
  renderTable(rows);
}

function addTrade(event) {
  event.preventDefault();
  const message = tradeValidationMessage();
  els.tradeWarning.hidden = !message;
  els.tradeWarning.textContent = message;
  if (message) return;

  state.trades.push({
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    date: els.tradeDate.value,
    amount: asNumber(els.tradeAmount, 5000),
    buyPrice: asNumber(els.tradeBuyPrice, 0),
    sellPrice: asNumber(els.tradeSellPrice, 0),
  });
  saveTrades();
  renderTrades();
  els.tradeWarning.hidden = true;
  els.tradeBuyPrice.value = "";
  els.tradeSellPrice.value = "";
}

function deleteTrade(id) {
  state.trades = state.trades.filter((trade) => trade.id !== id);
  saveTrades();
  renderTrades();
}

async function loadQuotes() {
  if (state.loading) return;
  state.loading = true;
  els.refreshButton.disabled = true;
  setStatus("실시간 데이터 불러오는 중", "idle");

  try {
    const response = await fetch("/api/quotes", { cache: "no-store" });
    const data = await response.json();
    if (!response.ok) throw new Error(data.errors?.join(" / ") || "데이터 요청 실패");

    state.quotes = data;
    render();

    const fetchedAt = new Date(data.fetchedAt);
    const timeText = fetchedAt.toLocaleTimeString("ko-KR", {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
    const orderbookErrors = (data.tickers || [])
      .filter((ticker) => ticker.orderbookError)
      .map((ticker) => `${ticker.exchange} 호가 오류`);
    const warnings = [...(data.errors || []), ...orderbookErrors];
    const warning = warnings.length ? ` 일부 오류: ${warnings.join(" / ")}` : "";
    setStatus(`${timeText} 갱신${warning}`, warnings.length ? "error" : "live");
  } catch (error) {
    setStatus(error.message || "데이터를 불러오지 못했습니다.", "error");
  } finally {
    state.loading = false;
    els.refreshButton.disabled = false;
  }
}

[
  els.amount,
  els.upbitFee,
  els.bithumbFee,
  els.transferFee,
  els.priceBuffer,
  els.fixedCost,
  els.kbMode,
  els.manualRate,
].forEach((input) => {
  input.addEventListener("input", render);
  input.addEventListener("change", render);
});

els.refreshButton.addEventListener("click", loadQuotes);
els.tradeForm.addEventListener("submit", addTrade);
els.tradeRows.addEventListener("click", (event) => {
  const id = event.target?.dataset?.tradeId;
  if (id) deleteTrade(id);
});

state.trades = loadTrades();
els.tradeDate.value = localDateText();
els.tradeAmount.value = els.amount.value || "5000";
renderTrades();
loadQuotes();
setInterval(loadQuotes, 10_000);
