export declare global {
  namespace NodeJS {
    interface ProcessEnv {
      readonly APP_PORT: string;
      readonly POSTGRES_USER: string;
      readonly POSTGRES_PASSWORD: string;
      readonly POSTGRES_DB: string;
      readonly DATABASE_URL: string;
      readonly ACCESS_TOKEN_SECRET: string;
      readonly ACCESS_TOKEN_EXPIRES: string;
      readonly ACCESS_TOKEN_REFRESH: string;
      readonly ACCESS_TOKEN_REFRESH_EXPIRES: string;
      readonly EMAIL_VALIDATION_TOKEN_SECRET: string;
      readonly EMAIL_VALIDATION_TOKEN_EXPIRES: string;
      readonly EMAIL_UPDATE_TOKEN_SECRET: string;
      readonly EMAIL_UPDATE_TOKEN_EXPIRES: string;
      readonly EMAIL_RESET_PASSWORD_TOKEN_SECRET: string;
      readonly EMAIL_RESET_PASSWORD_TOKEN_EXPIRES: string;
      readonly EMAIL_VALIDATION_URL: string;
      readonly EMAIL_RESET_PASSWORD_URL: string;
      readonly MAILER_FROM: string;
      readonly MAILER_HOST: string;
      readonly MAILER_USER: string;
      readonly MAILER_PASS: string;
    }
  }
}
