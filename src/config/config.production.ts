import baseConfig from "./config.base";

const productionConfig = {
  ...baseConfig,
  BASE_URL: "https://cherlygood.vercel.app/",
  // BASE_URL: "https://cherlygood.com/",
  SEO: {
    ...baseConfig.SEO,
  },
  PAYPAL: {
    ...baseConfig.PAYPAL,
    API_BASE: "https://api-m.paypal.com",
  },
};

export default productionConfig;
