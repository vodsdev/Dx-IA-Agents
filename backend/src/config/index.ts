import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3001'),
  HOST: z.string().default('0.0.0.0'),
  CORS_ORIGIN: z.string().default('http://localhost:3000'),
  
  POSTGRES_HOST: z.string().default('localhost'),
  POSTGRES_PORT: z.string().default('5432'),
  POSTGRES_DB: z.string().default('dxagents'),
  POSTGRES_USER: z.string().default('dxadmin'),
  POSTGRES_PASSWORD: z.string().default('dx_secure_password_2024'),
  
  REDIS_HOST: z.string().default('localhost'),
  REDIS_PORT: z.string().default('6379'),
  REDIS_PASSWORD: z.string().optional(),
  
  QDRANT_URL: z.string().default('http://localhost:6333'),
  
  ANTHROPIC_API_KEY: z.string().optional(),
  OPENAI_API_KEY: z.string().optional(),
  GOOGLE_API_KEY: z.string().optional(),
  GROK_API_KEY: z.string().optional(),
  DEEPSEEK_API_KEY: z.string().optional(),
  GROQ_API_KEY: z.string().optional(),
  NVIDIA_API_KEY: z.string().optional(),
  
  WHISPER_ENDPOINT: z.string().default('http://localhost:8080'),
  OPENCV_ENDPOINT: z.string().default('http://localhost:8081'),
  TENSORFLOW_ENDPOINT: z.string().default('http://localhost:8082'),
  LOCAL_LLM_ENDPOINT: z.string().default('http://localhost:8083'),
  
  VIXDEV_API_URL: z.string().default('http://localhost:8000/api'),
  GITHUB_TOKEN: z.string().optional(),
  SLACK_BOT_TOKEN: z.string().optional(),
  
  JWT_SECRET: z.string().default('dev-secret-change-in-production'),
  JWT_EXPIRATION: z.string().default('24h'),
  ENCRYPTION_KEY: z.string().default('0123456789abcdef0123456789abcdef'),
  
  MAX_AGENTS: z.string().default('2000'),
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('debug'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const config = {
  env: parsed.data.NODE_ENV,
  server: {
    port: parseInt(parsed.data.PORT),
    host: parsed.data.HOST,
    corsOrigin: parsed.data.CORS_ORIGIN,
  },
  database: {
    host: parsed.data.POSTGRES_HOST,
    port: parseInt(parsed.data.POSTGRES_PORT),
    name: parsed.data.POSTGRES_DB,
    user: parsed.data.POSTGRES_USER,
    password: parsed.data.POSTGRES_PASSWORD,
  },
  redis: {
    host: parsed.data.REDIS_HOST,
    port: parseInt(parsed.data.REDIS_PORT),
    password: parsed.data.REDIS_PASSWORD,
  },
  qdrant: {
    url: parsed.data.QDRANT_URL,
  },
  providers: {
    anthropic: { apiKey: parsed.data.ANTHROPIC_API_KEY },
    openai: { apiKey: parsed.data.OPENAI_API_KEY },
    google: { apiKey: parsed.data.GOOGLE_API_KEY },
    grok: { apiKey: parsed.data.GROK_API_KEY },
    deepseek: { apiKey: parsed.data.DEEPSEEK_API_KEY },
    groq: { apiKey: parsed.data.GROQ_API_KEY },
    nvidia: { apiKey: parsed.data.NVIDIA_API_KEY },
  },
  localServices: {
    whisper: parsed.data.WHISPER_ENDPOINT,
    opencv: parsed.data.OPENCV_ENDPOINT,
    tensorflow: parsed.data.TENSORFLOW_ENDPOINT,
    localLlm: parsed.data.LOCAL_LLM_ENDPOINT,
  },
  external: {
    vixdev: parsed.data.VIXDEV_API_URL,
    github: parsed.data.GITHUB_TOKEN,
    slack: parsed.data.SLACK_BOT_TOKEN,
  },
  security: {
    jwtSecret: parsed.data.JWT_SECRET,
    jwtExpiration: parsed.data.JWT_EXPIRATION,
    encryptionKey: parsed.data.ENCRYPTION_KEY,
  },
  agents: {
    maxAgents: parseInt(parsed.data.MAX_AGENTS),
  },
  logLevel: parsed.data.LOG_LEVEL,
} as const;