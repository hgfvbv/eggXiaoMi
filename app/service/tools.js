'use strict';

const svgCaptcha = require('svg-captcha'),
    md5 = require('md5'),
    Service = require('egg').Service,
    sd = require('silly-datetime'),
    fs = require('fs'),
    path = require('path'),
    mkdirp = require('mz-modules/mkdirp'),
    _ = require('lodash'),
    Jimp = require('jimp');

class ToolsService extends Service {
    async captcha(isMath, params = { size: 4, fontSize: 50, width: 100, height: 32, noise: 1, background: '#cc9966', color: false, mathOperator: '', mathMin: 1, mathMax: 9 }, isBack = true) {

        if (params.color) {
            delete params.background;
        }
        if (params.mathOperator == '') {
            delete params.mathOperator;
            delete params.mathMin;
            delete params.mathMax;
        }

        let captcha;
        if (isMath) {
            captcha = svgCaptcha.createMathExpr(params);
        } else {
            captcha = svgCaptcha.create(params);
        }

        if (isBack) {
            this.ctx.session.code = captcha.text;
        } else {
            this.ctx.session.identify_code = captcha.text;   //前台验证码
        }
        return captcha;
    }

    async md5(val) {
        return md5(val);
    }

    async getTime() {
        let date = new Date();
        return date.getTime();
    }

    async getDay() {
        let day = sd.format(new Date(), 'YYYYMMDD');
        return day;
    }

    /*
     * @description    根据某个字段实现对json数组的排序
     * @param   array  要排序的json数组对象
     * @param   field  排序字段（此参数必须为字符串）
     * @param   reverse 是否倒序（默认为false）
     * @return  array  返回排序后的json数组
    */
    async jsonSort(array, field, reverse = false) {
        if (reverse) {
            array = _.sortBy(array, (item) => {
                return -item[field];
            });
        } else {
            array = _.sortBy(array, (item) => {
                return item[field];
            });
        }
        return array;
    }

    async getUploadFile(filename, dirName) {
        let day = sd.format(new Date(), 'YYYYMMDD'),
            d = await this.getTime(),
            dir = path.join(`${this.config.uploadDir}/${dirName}`, day),
            uploadDir = path.join(dir, d + path.extname(filename));

        await mkdirp(dir);
        // \app\public\admin\upload\${dirName}\20200305\1583412665865.jpg

        return {
            uploadDir,
            saveDir: uploadDir.slice(3).replace(/\\/g, '/')
        };
    }

    //生成缩略图
    async jimpImg(filePath, quality = 80, size = [{ width: 200, height: 200 }]) {
        _.forEach(size, (item, i) => {
            Jimp.read(filePath, (err, lenna) => {
                if (err) throw err;
                lenna.resize(item.width, item.height) // resize
                    .quality(quality) // set JPEG quality                  
                    .write(`${filePath}_${item.width}x${item.height}${path.extname(filePath)}`); // save
            });
        });
    }

    async deleteFile(url, isJimpImg = false) {
        const { config } = this;

        let systemDir = config.uploadDir.substr(0, config.uploadDir.indexOf('/') + 1);

        if (isJimpImg) {
            let jimpImgSizes = config.jimpImgSizes;
            for (let i = 0; i < jimpImgSizes.length + 1; i++) {
                let fileName = '';
                if (i == jimpImgSizes.length) {
                    fileName = url;
                } else {
                    fileName = `${url}_${jimpImgSizes[i].width}x${jimpImgSizes[i].height}${path.extname(url)}`;
                }

                fs.unlink(`${systemDir}${fileName}`, function (error) {
                    if (error) {
                        console.log(error);
                    } else {
                        console.log('删除文件成功');
                    }
                });
            }
        } else {
            fs.unlink(`${systemDir}${url}`, function (error) {
                if (error) {
                    console.log(error);
                } else {
                    console.log('删除文件成功');
                }
            });
        }
    }

    //短信随机码
    async getRandomNum(count = 4) {
        let random_str = '';
        for (let i = 0; i < count; i++) {
            random_str += Math.floor(Math.random() * 10);
        }
        return random_str;
    }

    //生成订单号
    async getOrderId() {
        let nowTime = await this.getTime();
        let randomNum = await this.getRandomNum(6);
        return 'ZLZK' + nowTime.toString() + randomNum.toString();
    }
}

module.exports = ToolsService;
