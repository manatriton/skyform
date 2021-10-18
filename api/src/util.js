const { Buffer } = require("buffer");
const camelCase = require("lodash.camelcase");

function formatId(type, baseId) {
  return `${type}:${baseId}`
}

function parseId(id) {
  const parts = id.split(":", 2);
  return {
    type: parts[0],
    baseId: parts[1] || "",
  };
}

function decodeCursorString(cursorString) {
  return JSON.parse(Buffer.from(cursorString, "base64").toString("utf8"));
}

function encodeCursor(cursor) {
  return Buffer.from(JSON.stringify(cursor)).toString("base64");
}

function convertToCamelCase(obj) {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) =>
    [camelCase(key), value]));
}

module.exports = {
  parseId,
  formatId,
  decodeCursorString,
  encodeCursor,
  convertToCamelCase,
};