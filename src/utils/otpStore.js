const OTPS = new Map();
const TTL_MS = 10 * 60 * 1000;

function key(email, type) {
  return `${email.toLowerCase()}:${type}`;
}

exports.set = (email, type, code) => {
  const k = key(email, type);
  OTPS.set(k, { code: String(code), expiresAt: Date.now() + TTL_MS });
};

exports.get = (email, type) => {
  const k = key(email, type);
  const row = OTPS.get(k);
  if (!row || Date.now() > row.expiresAt) return null;
  return row.code;
};

exports.consume = (email, type) => {
  const k = key(email, type);
  OTPS.delete(k);
};
