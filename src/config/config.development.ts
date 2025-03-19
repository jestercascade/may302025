import baseConfig from "./config.base";

const developmentConfig = {
  ...baseConfig,
  BASE_URL: "http://localhost:3000",

  SEO: {
    ...baseConfig.SEO,
    ROBOTS_PROTECTED: "noindex,nofollow",
    CANONICAL: "http://localhost:3000/",
  },

  PAYPAL: {
    ...baseConfig.PAYPAL,
    API_BASE: "https://api-m.sandbox.paypal.com",
  },
};

export default developmentConfig;
