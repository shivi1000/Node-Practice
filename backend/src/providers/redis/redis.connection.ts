import { appConfig } from '../../common/appConfig.js';
import { createClient } from "redis";
//import redis from 'redis';

export async function initializeRedisClient() {

    let redisClient = undefined;
    // create the Redis client object
    redisClient = createClient({ url: appConfig.REDIS_URL }).on("error", (e: any) => {
        console.error(`Failed to create the Redis client with error:`);
        console.error(e);
    });

    try {
        await redisClient.connect();
        console.log(`<<<<<<<<<< Connected to Redis successfully! >>>>>>>>>>>>>>`);
    } catch (e) {
        console.error(`Connection to Redis failed with error: ==================`, e);
        console.error(e);
    }
}

// export async function redisClient() {

// const client = redis.createClient({
//   url: appConfig.REDIS_URL,
// });

// client.on('error', (err) => {
//   console.error('Redis connection error:>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>', err); 
// });

// // If the connection is successful
// client.on('connect', () => {
//   console.log('<<<<<<<<<<< Connected to Redis >>>>>>>>>>>>>>>>>>>>>');
// });
// }

// If authentication is required, use the 'auth' method on the client
//client.auth('your-redis-password');