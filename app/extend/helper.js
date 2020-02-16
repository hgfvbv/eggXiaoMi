const sd = require('silly-datetime');

module.exports = {
    formartTime(val) {
        return sd.format(val, 'YYYY-MM-DD HH:mm:ss');
    }
}