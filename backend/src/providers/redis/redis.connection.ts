import { appConfig } from '../../common/appConfig.js';
import { createClient } from "redis";
//import redis from 'redis';

export async function initializeRedisClient() {

    let redisClient;
    redisClient = createClient({ url: appConfig.REDIS_URL }).on("error", (error: any) => {
        console.error(`========= Failed to create the Redis client with error: ========`);
        console.error(error);
    });
    try {
        await redisClient.connect();
        console.log(`<<<<<<<<<< Connected to Redis successfully! >>>>>>>>>>>>>>`);
    } catch (error) {
        console.error(`========= Connection to Redis failed with error: ==================`, error);
        console.error(error);
    }
}

// export async function redisClient() {
// const client = redis.createClient({
//   url: appConfig.REDIS_URL,
// });
// client.on('error', (err) => {
//   console.error('Redis connection error:>>>>>>>>>>>>>>', err); 
// });
// // If the connection is successful
// client.on('connect', () => {
//   console.log('<<<<<<<< Connected to Redis >>>>>>>>>>>>>');
// });
// }