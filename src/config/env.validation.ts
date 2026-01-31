import * as Joi from 'joi';

export const envValidationSchema = Joi.object({
  NODE_ENV: Joi.string()
    .valid('development', 'production', 'test')
    .default('development'),
  PORT: Joi.number().default(3000),

  DATABASE_URL: Joi.string().uri().required(),

  JWT_ACCESS_SECRET: Joi.string().required(),
  JWT_REFRESH_SECRET: Joi.string().required(),

  JWT_ACCESS_EXPIRES_IN: Joi.number().integer().positive().default(900),
  JWT_REFRESH_EXPIRES_IN: Joi.number().integer().positive().default(604800),

  AUTH_REFRESH_COOKIE_NAME: Joi.string().default('refresh_token'),
  AUTH_REFRESH_COOKIE_PATH: Joi.string().default('/auth'),
  AUTH_COOKIE_DOMAIN: Joi.string().allow('').optional(),
  AUTH_COOKIE_SAMESITE: Joi.string()
    .valid('lax', 'strict', 'none')
    .default('none'),
  AUTH_COOKIE_SECURE: Joi.boolean().default(true),

  FRONTEND_ORIGIN: Joi.string().uri().default('http://localhost:3000'),

  THROTTLE_TTL: Joi.number().integer().positive().default(60),
  THROTTLE_LIMIT: Joi.number().integer().positive().default(5),
});
