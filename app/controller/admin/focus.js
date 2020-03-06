'use strict';

const BaseController = require('./base'),
    fs = require('fs'),
    pump = require('mz-modules/pump');

class FocusController extends BaseController {
    async index() {
        const { ctx } = this;

        let params = ctx.query,
            title = params.title ? params.title.trim() : '',
            where = {};

        if (title && title != '') {
            //模糊查询
            where = {
                $or: [
                    { title: { $regex: title } }
                ]
            };
        };

        let list = await ctx.model.Focus.find(where);
        await ctx.render('admin/focus/index', { params, list });
    }

    async add() {
        await this.ctx.render('/admin/focus/add');
    }

    async doAdd() {
        const { ctx, service } = this;
        let parts = ctx.multipart({ autoFields: true });
        let files = {},
            params,
            stream;

        while ((stream = await parts()) != null) {
            //警告：前端轮播图上传必须放在表单最底下，否则会获取不到完整的前端传值
            params = parts.field;

            let title = params.title ? params.title.trim() : '',
                link = params.link ? params.link.trim() : '',
                sort = params.sort ? params.sort.trim() : '';

            if (title == '' || link == '' || sort == '' || !(/^\d+$/.test(sort))) {
                await this.error('/admin/focus/add', '对不起！服务器繁忙！要不稍后再试试？');
                return;
            }

            params.title = title;
            params.link = link;
            params.sort = sort;
            params.status = params.status ? 1 : 0;

            if (!stream.filename) {
                await this.error('/admin/focus/add', '对不起！服务器繁忙！要不稍后再试试？');
                //这里必须加ruturn，否则会死循环
                return;
            } else {
                let fieldname = stream.fieldname,
                    dir = await service.tools.getUploadFile(stream.filename),
                    writeStream = fs.createWriteStream(dir.uploadDir);

                await pump(stream, writeStream);

                files = Object.assign(files, {
                    [fieldname]: dir.saveDir
                });
            }
        }

        let focus = new ctx.model.Focus(Object.assign(
            files,
            params,
            { add_time: await ctx.service.tools.getTime() }
        ));

        try {
            await focus.save();
            await ctx.redirect('/admin/focus');
        } catch (err) {
            await this.error('/admin/focus/add', '增加轮播图失败！');
        }
    }

    async edit() {
        const { ctx } = this;
        let params = ctx.query,
            id = params.id ? params.id.trim() : '',
            where = {};

        if (id == '') {
            await this.error('/admin/focus', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        where = {
            _id: id
        };

        let result = await ctx.model.Focus.find(where);

        await this.ctx.render('/admin/focus/edit', { result: result[0] });
    }

    async doEdit() {
        const { ctx, service } = this;
        let parts = ctx.multipart({ autoFields: true });
        let files = {},
            where = {},
            params,
            stream;

        while ((stream = await parts()) != null) {
            //警告：前端轮播图上传必须放在表单最底下，否则会获取不到完整的前端传值
            params = parts.field;
            let id = params.id ? params.id.trim() : '',
                title = params.title ? params.title.trim() : '',
                link = params.link ? params.link.trim() : '',
                sort = params.sort ? params.sort.trim() : '';

            if (id == '') {
                await this.error('/admin/focus', '对不起！服务器繁忙！要不稍后再试试？');
                return;
            }

            if (title == '' || link == '' || sort == '' || !(/^\d+$/.test(sort))) {
                await this.error(`/admin/focus/edit?id=${id}`, '对不起！服务器繁忙！要不稍后再试试？');
                return;
            }

            params.id = id;
            params.title = title;
            params.link = link;
            params.sort = sort;
            params.status = params.status ? 1 : 0;

            if (!stream.filename) {
                break;
            } else {
                let fieldname = stream.fieldname,
                    dir = await service.tools.getUploadFile(stream.filename),
                    writeStream = fs.createWriteStream(dir.uploadDir);

                await pump(stream, writeStream);

                files = Object.assign(files, {
                    [fieldname]: dir.saveDir
                });
            }
        }

        where = {
            _id: params.id
        };

        let uParams = {};

        if (files == null) {
            uParams = params;
        } else {
            uParams = Object.assign(
                files,
                params
            );
        }

        let focus = await ctx.model.Focus.updateOne(where, uParams);

        if (focus.ok > 0) {
            await ctx.redirect('/admin/focus');
        } else {
            await this.error(`/admin/focus/edit?id=${params.id}`, '编辑轮播图失败！');
        }
    }
}

module.exports = FocusController;
