import baseConfig from "./config.base";

const productionConfig = {
  ...baseConfig,
  BASE_URL: "https://cherlygood.vercel.app/",
  SEO: {
    ...baseConfig.SEO,
  },
  PAYPAL: {
    ...baseConfig.PAYPAL,
    API_BASE: "https://api-m.paypal.com",
  },
  FIREBASE: {
    CLIENT: {
      API_KEY: process.env.NEXT_PUBLIC_FIREBASE_API_KEY_PROD,
      AUTH_DOMAIN: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN_PROD,
      PROJECT_ID: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID_PROD,
      STORAGE_BUCKET: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET_PROD,
      MESSAGING_SENDER_ID:
        process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID_PROD,
      APP_ID: process.env.NEXT_PUBLIC_FIREBASE_APP_ID_PROD,
      MEASUREMENT_ID: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID_PROD,
    },
    ADMIN: {
      PRIVATE_KEY: process.env.FIREBASE_PRIVATE_KEY_PROD?.replace(/\\n/g, "\n"),
      CLIENT_EMAIL: process.env.FIREBASE_CLIENT_EMAIL_PROD,
      PROJECT_ID: process.env.FIREBASE_PROJECT_ID_PROD,
    },
  },
};

export default productionConfig;
