import { Buffer } from "buffer";
import camelCase from "lodash.camelcase";

export function formatId(type, baseId) {
  return `${type}:${baseId}`
}

export function parseId(id) {
  const parts = id.split(":", 2);
  return {
    type: parts[0],
    baseId: parts[1] || "",
  };
}

export function decodeCursorString(cursorString) {
  return JSON.parse(Buffer.from(cursorString, "base64").toString("utf8"));
}

export function encodeCursor(cursor) {
  return Buffer.from(JSON.stringify(cursor)).toString("base64");
}

export function convertToCamelCase(obj) {
  return Object.fromEntries(Object.entries(obj).map(([key, value]) =>
    [camelCase(key), value]));
}
