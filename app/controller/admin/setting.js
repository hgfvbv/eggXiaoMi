'use strict';

const BaseController = require('./base'),
    fs = require('fs'),
    path = require('path'),
    pump = require('mz-modules/pump'),
    Jimp = require('jimp');

class SettingController extends BaseController {
    //上传网站ico
    async siteIcoUploadImg() {
        const { ctx, config } = this;
        let parts = ctx.multipart({ autoFields: true });
        let files = {},
            dir = config.icoDir ? config.icoDir : '',
            params,
            stream;

        while ((stream = await parts()) != null) {
            params = parts.field;

            if (!stream.filename || path.extname(stream.filename) == '.ico' || dir == '') {
                await this.error('/admin/setting', '对不起！服务器繁忙！要不稍后再试试？');
                //这里必须加ruturn，否则会死循环
                return;
            } else {
                console.log(dir)
                let fieldname = stream.fieldname,
                    writeStream = fs.createWriteStream(dir);

                await pump(stream, writeStream);

                Jimp.read(dir, (err, lenna) => {
                    if (err) throw err;
                    lenna.resize(128, 128) // resize
                        .quality(100) // set JPEG quality                  
                        .write(dir); // save
                });
                files = Object.assign({ [fieldname]: dir.slice(3).replace(/\\/g, '/') });
            }
        }

        ctx.body = { link: files.file };
    }

    //上传网站logo
    async siteLogoUploadImg() {
        const { ctx, service } = this;
        let parts = ctx.multipart({ autoFields: true });
        let files = {},
            params,
            stream;

        while ((stream = await parts()) != null) {
            //警告：前端图片上传必须放在表单最底下，否则会获取不到完整的前端传值
            params = parts.field;

            if (!stream.filename) {
                await this.error('/admin/setting', '对不起！服务器繁忙！要不稍后再试试？');
                //这里必须加ruturn，否则会死循环
                return;
            } else {
                let filename = stream.filename,
                    fieldname = stream.fieldname,
                    dir = await service.tools.getUploadFile(filename, 'setting'),
                    writeStream = fs.createWriteStream(dir.uploadDir);

                await pump(stream, writeStream);

                files = Object.assign({ [fieldname]: dir.saveDir });
            }
        }

        ctx.body = { link: files.file };
    }

    //上传商品默认图片
    async noPictureUploadImg() {
        const { ctx, service } = this;
        let parts = ctx.multipart({ autoFields: true });
        let files = {},
            params,
            stream;

        while ((stream = await parts()) != null) {
            //警告：前端图片上传必须放在表单最底下，否则会获取不到完整的前端传值
            params = parts.field;

            if (!stream.filename) {
                await this.error('/admin/setting', '对不起！服务器繁忙！要不稍后再试试？');
                //这里必须加ruturn，否则会死循环
                return;
            } else {
                let filename = stream.filename,
                    fieldname = stream.fieldname,
                    dir = await service.tools.getUploadFile(filename, 'goods'),
                    writeStream = fs.createWriteStream(dir.uploadDir);

                await pump(stream, writeStream);

                //生成缩略图
                service.tools.jimpImg(dir.uploadDir, 100, [{ width: 64, height: 64 }, { width: 100, height: 100 }, { width: 200, height: 200 }, { width: 400, height: 400 }]);

                files = Object.assign({ [fieldname]: dir.saveDir });
            }
        }

        ctx.body = { link: files.file };
    }

    async index() {
        const { ctx } = this;

        let result = (await ctx.model.Setting.find())[0];
        await this.ctx.render('admin/setting/index', { result });
    }

    async doEdit() {
        const { ctx, app } = this;

        //金钱和数字正则表达式
        let num = /^\d+$/,
            where = {},
            uParams = {};

        let params = ctx.request.body,
            id = params.id ? params.id.trim() : '',
            site_title = params.site_title ? params.site_title.trim() : '',
            site_ico = params.site_ico ? params.site_ico.trim() : '',
            site_logo = params.site_logo ? params.site_logo.trim() : '',
            site_keywords = params.site_keywords ? params.site_keywords.trim() : '',
            site_description = params.site_description ? params.site_description.trim() : '',
            site_address = params.site_address ? params.site_address.trim() : '',
            site_icp = params.site_icp ? params.site_icp.trim() : '',
            site_policeIcp = params.site_policeIcp ? params.site_policeIcp.trim() : '',
            site_qq = params.site_qq ? params.site_qq.trim() : '',
            site_tel = params.site_tel ? params.site_tel.trim() : '',
            no_picture = params.no_picture ? params.no_picture.trim() : '',
            search_keywords = params.search_keywords ? params.search_keywords.trim() : '',
            tongji_code = params.tongji_code ? params.tongji_code.trim() : '',
            site_status = params.site_status ? params.site_status : 1;

        if (id == '' || !/^1[3456789]\d{9}$/.test(site_tel)) {
            await this.error('/admin/setting', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        where = {
            _id: id
        };

        uParams = {
            site_title,
            site_ico,
            site_logo,
            site_keywords,
            site_description,
            site_address,
            site_icp,
            site_policeIcp,
            site_qq,
            site_tel,
            no_picture,
            search_keywords,
            tongji_code,
            site_status
        };

        let setting = await ctx.model.Setting.findOne(where, { _id: 0, site_ico: 1, site_logo: 1, no_picture: 1 }),
            site_icoOld = setting.site_ico,
            site_logoOld = setting.site_logo,
            no_pictureOld = setting.no_picture;

        let result = await ctx.model.Setting.updateOne(where, uParams);

        if (result.ok > 0) {
            try {
                if (uParams.site_ico != site_icoOld) {
                    await ctx.service.tools.deleteFile(site_icoOld);
                }
                if (uParams.site_logo != site_logoOld) {
                    await ctx.service.tools.deleteFile(site_logoOld);
                }
                if (uParams.no_picture != no_pictureOld) {
                    await ctx.service.tools.deleteFile(no_pictureOld, true);
                }
                await ctx.redirect('/admin/setting');
            } catch (err) {
                console.log(err);
                await this.error(`/admin/setting`, '修改系统配置失败！');
            }
        } else {
            await this.error(`/admin/setting`, '修改系统配置失败！');
        }
    }
}

module.exports = SettingController;
