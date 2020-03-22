const sd = require('silly-datetime'),
    path = require('path');

module.exports = {
    formartTime(val) {
        return sd.format(val, 'YYYY-MM-DD HH:mm:ss');
    },

    getExtName(val) {
        return path.extname(val);
    }
}