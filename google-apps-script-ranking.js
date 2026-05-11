const SHEET_NAME = "rankings";
const GAME_ID = "card-playground-v1";
const ALLOWED_DECKS = ["space", "sharks", "endangered", "food"];

function doGet(event) {
  const callback = safeText(event.parameter.callback || "callback", 60);
  const deck = safeText(event.parameter.deck || "", 20);
  const cards = Number(event.parameter.cards || 0);
  const records = readRankings(deck, cards);

  return ContentService
    .createTextOutput(`${callback}(${JSON.stringify({ records })});`)
    .setMimeType(ContentService.MimeType.JAVASCRIPT);
}

function doPost(event) {
  try {
    const payload = JSON.parse(event.postData.contents || "{}");
    const record = normalizeRecord(payload);
    appendRecord(record);
    return jsonOutput({ ok: true });
  } catch (error) {
    return jsonOutput({ ok: false, error: String(error.message || error) });
  }
}

function normalizeRecord(payload) {
  const game = safeText(payload.game, 40);
  const deck = safeText(payload.deck, 20);
  const deckTitle = safeText(payload.deckTitle, 30);
  const name = safeText(payload.name || "이름 없는 고수", 12);
  const cards = Number(payload.cards);
  const seconds = Number(payload.seconds);
  const moves = Number(payload.moves);
  const createdAt = safeText(payload.createdAt || new Date().toISOString(), 40);

  if (game !== GAME_ID) throw new Error("wrong game");
  if (!ALLOWED_DECKS.includes(deck)) throw new Error("wrong deck");
  if (![12, 16, 24, 50].includes(cards)) throw new Error("wrong cards");
  if (!Number.isFinite(seconds) || seconds < 2 || seconds > 3600) throw new Error("wrong seconds");
  if (!Number.isFinite(moves) || moves < cards / 2 || moves > 2000) throw new Error("wrong moves");

  return {
    game,
    deck,
    deckTitle,
    cards,
    name,
    seconds: Math.floor(seconds),
    moves: Math.floor(moves),
    createdAt
  };
}

function appendRecord(record) {
  const sheet = getSheet();
  sheet.appendRow([
    new Date(),
    record.game,
    record.deck,
    record.deckTitle,
    record.cards,
    record.name,
    record.seconds,
    record.moves,
    record.createdAt
  ]);
}

function readRankings(deck, cards) {
  if (!ALLOWED_DECKS.includes(deck) || ![12, 16, 24, 50].includes(cards)) return [];

  const sheet = getSheet();
  const values = sheet.getDataRange().getValues();
  return values.slice(1)
    .filter(row => row[1] === GAME_ID && row[2] === deck && Number(row[4]) === Number(cards))
    .map(row => ({
      name: safeText(row[5] || "이름 없는 고수", 12),
      seconds: Number(row[6]),
      moves: Number(row[7]),
      createdAt: safeText(row[8] || "", 40)
    }))
    .filter(record => Number.isFinite(record.seconds) && Number.isFinite(record.moves))
    .sort((a, b) => a.seconds - b.seconds || a.moves - b.moves || a.createdAt.localeCompare(b.createdAt))
    .slice(0, 10);
}

function getSheet() {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = spreadsheet.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(SHEET_NAME);
    sheet.appendRow(["receivedAt", "game", "deck", "deckTitle", "cards", "name", "seconds", "moves", "createdAt"]);
  }
  return sheet;
}

function safeText(value, maxLength) {
  return String(value || "")
    .replace(/[<>{}[\]\\]/g, "")
    .trim()
    .slice(0, maxLength);
}

function jsonOutput(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
