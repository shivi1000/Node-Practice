import * as dotenv from "dotenv";
dotenv.config({ path: './bin/.env.dev' });

export const appConfig = {
    APP_PORT: process.env.APP_PORT,
    MONGODB_URI: process.env.MONGODB_URI,
    BASIC_USERNAME: process.env.BASIC_USERNAME,
    BASIC_PASSWORD: process.env.BASIC_PASSWORD,
    //BASIC_AUTH: process.env.BASIC_AUTH,
    JWT_SECRET_KEY: <string>process.env.JWT_SECRET_KEY, // node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
    SERVICE: process.env.SERVICE,
    HOST: process.env.HOST,
    PORT: process.env.PORT,
    EMAIL: process.env.EMAIL,
    PASSWORD: process.env.PASSWORD,
    TWILIO_ACCOUNT_SID: <string>process.env.TWILIO_ACCOUNT_SID,
    TWILIO_AUTH_TOKEN: <string>process.env.TWILIO_AUTH_TOKEN,
    TWILIO_SERVICE_SID: <string>process.env.TWILIO_SERVICE_SID,
    TWILIO_MOBILE_NUMBER: process.env.TWILIO_MOBILE_NUMBER,
    AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    AWS_S3_BUCKET_NAME: <string>process.env.AWS_S3_BUCKET_NAME,
    AWS_REGION: process.env.AWS_REGION,
    REDIS_HOST: process.env.REDIS_HOST,
    REDIS_PORT: process.env.REDIS_PORT,
    REDIS_URL: process.env.REDIS_URL,
    REDIS_SECRET: <string>process.env.REDIS_SECRET,
    FIREBASE_API_KEY: process.env.FIREBASE_API_KEY,
    FIREBASE_AUTH_DOMAIN: process.env.FIREBASE_AUTH_DOMAIN,
    FIREBASE_DATABASE_URL:process.env.FIREBASE_DATABASE_URL,
    FIREBASE_PROJECT_ID: process.env.FIREBASE_PROJECT_ID,
    FIREBASE_STORAGE_BUCKET: process.env.FIREBASE_STORAGE_BUCKET,
    FIREBASE_MESSAGING_SENDER_ID: process.env.FIREBASE_MESSAGING_SENDER_ID,
    FIREBASE_APP_ID: process.env.FIREBASE_APP_ID,
    FIREBASE_MEASUREMENT_ID: process.env.FIREBASE_MEASUREMENT_ID,

}