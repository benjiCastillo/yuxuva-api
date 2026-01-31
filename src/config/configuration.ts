export default () => ({
  env: process.env.NODE_ENV ?? 'development',
  port: parseInt(process.env.PORT ?? '3000', 10),

  database: {
    url: process.env.DATABASE_URL,
  },

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET,
    refreshSecret: process.env.JWT_REFRESH_SECRET,
    accessExpiresIn: Number(process.env.JWT_ACCESS_EXPIRES_IN),
    refreshExpiresIn: Number(process.env.JWT_REFRESH_EXPIRES_IN),
  },

  auth: {
    refreshCookieName: process.env.AUTH_REFRESH_COOKIE_NAME ?? 'refresh_token',
    refreshCookiePath: process.env.AUTH_REFRESH_COOKIE_PATH ?? '/auth',
    cookieDomain: process.env.AUTH_COOKIE_DOMAIN,
    cookieSameSite: process.env.AUTH_COOKIE_SAMESITE ?? 'none',
    cookieSecure:
      process.env.AUTH_COOKIE_SECURE !== undefined
        ? process.env.AUTH_COOKIE_SECURE === 'true'
        : process.env.NODE_ENV === 'production',
  },

  cors: {
    origin: process.env.FRONTEND_ORIGIN ?? 'http://localhost:3000',
  },

  throttle: {
    ttl: Number(process.env.THROTTLE_TTL ?? 60),
    limit: Number(process.env.THROTTLE_LIMIT ?? 5),
  },
});
