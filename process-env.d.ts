declare global {
  namespace NodeJS {
    interface ProcessEnv {
      [key: string]: string | undefined;
      PORT: string;
      MONGO_URI: string;
      JWT_SECRET: string | undefined;
      NODE_ENV: "development" | "production";
      // add more environment variables and their types here
    }
  }
}

export {};
