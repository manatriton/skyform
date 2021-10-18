const crypto = require("crypto");
const baseX = require("base-x");

const BASE62_ALPHABET = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DEFAULT_TOKEN_SIZE = 50;

const base62 = baseX(BASE62_ALPHABET);

module.exports = function generateToken(size = DEFAULT_TOKEN_SIZE) {
  return new Promise(((resolve, reject) => {
    crypto.randomBytes(size, (err, buf) => {
      if (err) {
        reject(err);
      } else {
        resolve(base62.encode(buf));
      }
    });
  }));
};
