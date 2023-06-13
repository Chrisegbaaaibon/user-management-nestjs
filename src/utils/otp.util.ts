import { randomInt, randomBytes } from 'crypto';
import { createClient } from 'redis';

const redisClient = createClient();

export const generateOTP = async (length: number) => {
  const otp = randomInt(10 ** (length - 1), 10 ** length - 1);
  return otp;
};

export const generateRandomBytes = async () => {
    return randomBytes(20).toString('hex');
}

export const setValueInRedis = async (key: string, value: any) => {
    const client = createClient();
    return client.set(key, value, { EX: 60 * 15 });
}
export const getValueFromRedis = async (key: string) => {
    const client = createClient();
    return client.get(key);
}

export const deleteValueFromRedis = async (key: string)=>{
    const client = createClient();
    return client.del(key);
}

export const verifyOTP = async (otp: string) => {
  const value = await redisClient.get(otp);
  return value === otp;
};

export const deleteOTP = async (otp: string) => {
  return await redisClient.del(otp);
}
