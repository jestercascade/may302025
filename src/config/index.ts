// Add this line at the very top to default APP_ENV to NODE_ENV if undefined
process.env.APP_ENV = process.env.APP_ENV || process.env.NODE_ENV;

import developmentConfig from "./config.development";
import productionConfig from "./config.production";
import localConfig from "./config.local";

let appConfig: ConfigType;

switch (process.env.APP_ENV) {
  case "production":
    appConfig = productionConfig;
    break;
  case "local":
    appConfig = localConfig;
    break;
  case "development":
  default:
    appConfig = developmentConfig;
    break;
}

export { appConfig };
