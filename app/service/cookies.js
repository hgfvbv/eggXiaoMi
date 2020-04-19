'use strict';

const Service = require('egg').Service;

class CookiesService extends Service {
	set(key, value, expires = 24 * 3600 * 1000) {
		const { ctx } = this;
		try {
			value = JSON.stringify(value);
			ctx.cookies.set(key, value, {
				maxAge: expires,
				httpOnly: true,  //只有nodejs可以操作cookie
				encrypt: true    // 对cookies加密     
			});
		} catch (e) {
			console.log(e);
		}
	}

	get(key) {
		const { ctx } = this;
		try {
			let data = ctx.cookies.get(key, {
				encrypt: true
			});
			return data ? JSON.parse(data) : '';
		} catch (e) {
			console.log(e);
			return '';
		}
	}
}

module.exports = CookiesService;
