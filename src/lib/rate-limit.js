// lib/rate-limit.js
const rateLimit = (options) => {
  const tokens = new Map();

  setInterval(() => {
    tokens.clear();
  }, options.interval);

  return {
    check: (res, limit, key) => {
      const token = tokens.get(key) || { count: 0 };
      
      if (token.count >= limit) {
        throw new Error('Rate limit exceeded');
      }
      
      token.count += 1;
      tokens.set(key, token);
      
      return true;
    }
  };
};

export default rateLimit;