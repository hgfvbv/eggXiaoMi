'use strict';

const Service = require('egg').Service;

class SearchService extends Service {

    async find(index = '', payload = {}, params = { isPage: false, page: 1, pageSize: 1 }) {
        const { app } = this;
        const { isPage, page, pageSize } = params;
        let result = {};
        try {
            if (isPage) {
                result = await app.elasticsearch.search({
                    index,
                    type: '_doc',
                    from: (page - 1) * pageSize,           //skip
                    size: pageSize,
                    body: {
                        query: {
                            match: payload
                        }
                    }
                });
            } else {
                result = await app.elasticsearch.search({
                    index,
                    type: '_doc',
                    body: {
                        query: {
                            match: payload
                        }
                    }
                });
            }

            const resultHits = result.hits.hits,
                array = [];
            if (resultHits.length > 0) {
                resultHits.forEach(item => {
                    array.push(item._source);
                });
            }
            return array;
        } catch (e) {
            console.log(e);
        }
    }

    async count(index = '', params = {}) {
        const { app } = this;
        try {
            const result = await app.elasticsearch.count({
                index,
                type: '_doc',
                body: {
                    query: {
                        match: params
                    }
                }
            });
            return result.count;
        } catch (e) {
            console.log(e);
        }
    }

    async create(index = '', id = '', params = {}) {
        const { app } = this;
        try {
            const result = await app.elasticsearch.bulk({
                body: [
                    { index: { _index: index, _type: '_doc', _id: id } },
                    params
                ]
            });
            return !result.errors;
        } catch (e) {
            console.log(e);
        }
    }

    async update(index = '', id = '', params = {}) {
        const { app } = this;
        try {
            const result = await app.elasticsearch.bulk({
                body: [
                    { update: { _index: index, _type: '_doc', _id: id } },
                    { doc: params }
                ]
            });
            return !result.errors;
        } catch (e) {
            console.log(e);
        }
    }

    async delete(index = '', id = '') {
        const { app } = this;
        try {
            const result = await app.elasticsearch.bulk({
                body: [
                    { delete: { _index: index, _type: '_doc', _id: id } },
                ]
            });
            return !result.errors;
        } catch (e) {
            console.log(e);
        }
    }
}

module.exports = SearchService;
