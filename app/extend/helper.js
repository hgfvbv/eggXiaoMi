const sd = require('silly-datetime'),
    path = require('path'),
    showdown = require('showdown');

module.exports = {
    formartTime(val) {
        return sd.format(val, 'YYYY-MM-DD HH:mm:ss');
    },

    getExtName(val) {
        return path.extname(val);
    },

    formartAttr(val) {
        let converter = new showdown.Converter();
        return converter.makeHtml(val);
    }
}