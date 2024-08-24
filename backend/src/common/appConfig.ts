import * as dotenv from "dotenv";
dotenv.config({path: './bin/.env.dev'});

export const appConfig = {
    APP_PORT: process.env.APP_PORT,
    MONGODB_URI: process.env.MONGODB_URI,
    SERVICE: process.env.SERVICE,
    HOST: process.env.HOST,
    PORT: process.env.PORT,
    EMAIL: process.env.EMAIL,
    PASSWORD: process.env.PASSWORD,
    TWILIO_ACCOUNT_SID: <string>process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: <string>process.env.TWILIO_AUTH_TOKEN,
    TWILIO_SERVICE_SID: <string>process.env.TWILIO_SERVICE_SID,
    TWILIO_MOBILE_NUMBER: process.env.TWILIO_MOBILE_NUMBER,
}