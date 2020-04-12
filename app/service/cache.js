'use strict';

const Service = require('egg').Service;

class CacheService extends Service {
    async set(key, value, seconds = 60 * 5) {
        const { app } = this;
        try {
            value = JSON.stringify(value);
            if (app.redis) {
                await app.redis.set(key, value, 'EX', seconds);
            }
        } catch (e) {
            console.log(e);
        }
    }

    async get(key) {
        const { app } = this;
        try {
            if (app.redis) {
                let data = await app.redis.get(key);
                return data ? JSON.parse(data) : '';
            } else {
                return '';
            }
        } catch (e) {
            console.log(e);
            return '';
        }
    }

    async del(key) {
        const { app } = this;
        try {
            let result = await app.redis.del(key);
            return result > 0 ? true : false;
        } catch (e) {
            console.log(e);
            return false;
        }
    }

    async clean() {
        const { app } = this;
        try {
            let result = await app.redis.flushall();
            return result == 'OK' ? true : false;
        } catch (e) {
            console.log(e);
            return false;
        }
    }
}

module.exports = CacheService;
