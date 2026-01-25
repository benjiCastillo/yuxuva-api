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
});
