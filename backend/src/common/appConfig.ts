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
    JWT_SECRET_KEY: <string>process.env.JWT_SECRET_KEY, // node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    ACCESS_KEY_ID: process.env.ACCESS_KEY_ID,
    SECRET_ACCESS_KEY: process.env.SECRET_ACCESS_KEY,
    S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
    AWS_REGION: process.env.AWS_REGION,

}