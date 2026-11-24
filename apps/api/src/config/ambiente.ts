const CAMPOS_OBRIGATORIOS = [
  'DATABASE_URL',
  'JWT_SECRET',
  'PIX_WEBHOOK_SECRET',
] as const;

export type Ambiente = {
  NODE_ENV: string;
  API_PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
  JWT_EXPIRES_IN: string;
  PIX_WEBHOOK_SECRET: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
};

export function validarAmbiente(config: Record<string, unknown>): Ambiente {
  for (const campo of CAMPOS_OBRIGATORIOS) {
    if (!config[campo] || String(config[campo]).trim() === '') {
      throw new Error(`Variável de ambiente obrigatória ausente: ${campo}`);
    }
  }

  if (String(config.JWT_SECRET).length < 32) {
    throw new Error('JWT_SECRET precisa ter pelo menos 32 caracteres');
  }

  return {
    NODE_ENV: String(config.NODE_ENV ?? 'development'),
    API_PORT: Number(config.API_PORT ?? 3333),
    DATABASE_URL: String(config.DATABASE_URL),
    JWT_SECRET: String(config.JWT_SECRET),
    JWT_EXPIRES_IN: String(config.JWT_EXPIRES_IN ?? '1d'),
    PIX_WEBHOOK_SECRET: String(config.PIX_WEBHOOK_SECRET),
    REDIS_HOST: String(config.REDIS_HOST ?? 'localhost'),
    REDIS_PORT: Number(config.REDIS_PORT ?? 6380),
  };
}
