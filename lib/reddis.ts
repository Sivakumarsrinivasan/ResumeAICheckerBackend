import {Redis} from "@upstash/redis";

const hasReddisConfig = Boolean(process.env.REDDIS_URL) && Boolean(process.env.REDDIS_TOKEN);

export const Redis1 = hasReddisConfig ? new Redis({
    url:process.env.REDDIS_URL,
    token:process.env.REDDIS_TOKEN
}) : null