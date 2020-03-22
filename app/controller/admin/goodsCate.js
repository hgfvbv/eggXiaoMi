'use strict';

const BaseController = require('./base'),
    fs = require('fs'),
    pump = require('mz-modules/pump');

class GoodsCateController extends BaseController {
    async index() {
        const { ctx } = this;
        let params = ctx.query,
            title = params.title ? params.title.trim() : '',
            where = '';

        if (title && title != '') {
            //模糊查询
            where = title;
        };

        let list = await ctx.model.GoodsCate.aggregate([
            {
                $lookup: {
                    from: 'goods_cate',
                    localField: '_id',
                    foreignField: 'pid',
                    as: 'child'
                }
            },
            {
                $match: {
                    $and: [
                        { title: { $regex: where } },
                        { pid: '0' }
                    ]
                }
            },
            {
                $sort: {
                    sort: 1
                }
            }
        ]);
        for (let i = 0; i < list.length; i++) {
            list[i].child = await ctx.service.tools.jsonSort(list[i].child, 'sort', false);
        }
        await this.ctx.render('/admin/goodsCate/index', { params, list });
    }

    async add() {
        const { ctx } = this;

        let goodsCate = await ctx.model.GoodsCate.find({ status: 1, pid: '0' }, { title: 1 });
        await ctx.render('admin/goodsCate/add', { goodsCate });
    }

    async doAdd() {
        const { ctx, service } = this;
        let parts = ctx.multipart({ autoFields: true });
        let files = {},
            params,
            stream;

        while ((stream = await parts()) != null) {
            //警告：前端商品分类图上传必须放在表单最底下，否则会获取不到完整的前端传值
            params = parts.field;

            let title = params.title ? params.title.trim() : '',
                pid = params.pid ? params.pid : '-1',
                filter_attr = params.filter_attr ? params.filter_attr.trim() : '',
                link = params.link ? params.link.trim() : '',
                template = params.template ? params.template.trim() : '',
                sub_title = params.sub_title ? params.sub_title.trim() : '',
                keywords = params.keywords ? params.keywords.trim() : '',
                description = params.description ? params.description.trim() : '',
                sort = params.sort ? params.sort.trim() : '',
                filename = stream.filename;

            if (title == '' || pid == '-1' || sort == '' || !(/^\d+$/.test(sort))) {
                await this.error('/admin/goodsCate/add', '对不起！服务器繁忙！要不稍后再试试？');
                return;
            }

            params.title = title;
            params.pid = params.pid == '0' ? pid : this.app.mongoose.Types.ObjectId(pid);
            params.filter_attr = filter_attr;
            params.link = link;
            params.template = template;
            params.sub_title = sub_title;
            params.keywords = keywords;
            params.description = description;
            params.sort = sort;
            params.status = params.status ? 1 : 0;

            if (!filename) {
                await this.error('/admin/goodsCate/add', '对不起！服务器繁忙！要不稍后再试试？');
                //这里必须加ruturn，否则会死循环
                return;
            } else {
                let fieldname = stream.fieldname,
                    dir = await service.tools.getUploadFile(filename, 'goodsCate'),
                    writeStream = fs.createWriteStream(dir.uploadDir);

                //因异步问题，无法进行顶级分类不上传图片的处理，会造成假死
                await pump(stream, writeStream);

                files = Object.assign(files, {
                    [fieldname]: dir.saveDir
                });

                //生成缩略图
                service.tools.jimpImg(dir.uploadDir, 100, [{ width: 64, height: 64 }, { width: 100, height: 100 }, { width: 200, height: 200 }, { width: 400, height: 400 }]);
            }
        }

        let goodsCate = new ctx.model.GoodsCate(Object.assign(
            files,
            params,
            { add_time: await ctx.service.tools.getTime() }
        ));

        try {
            await goodsCate.save();
            await ctx.redirect('/admin/goodsCate');
        } catch (err) {
            await this.error('/admin/goodsCate/add', '增加商品分类图失败！');
        }
    }

    async edit() {
        const { ctx } = this;
        let params = ctx.query,
            id = params.id ? params.id.trim() : '',
            where = {};

        if (id == '') {
            await this.error('/admin/goodsType', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        where = {
            _id: id
        };

        let goodsCate = await ctx.model.GoodsCate.find({ status: 1, pid: '0' }, { title: 1 });
        let result = await ctx.model.GoodsCate.find(where);
        await this.ctx.render('admin/goodsCate/edit', { result: result[0], goodsCate });
    }

    async doEdit() {
        const { ctx, service } = this;

        let parts = ctx.multipart({ autoFields: true });
        let files = {},
            where = {},
            params,
            stream;

        while ((stream = await parts()) != null) {
            //警告：前端商品分类图上传必须放在表单最底下，否则会获取不到完整的前端传值
            params = parts.field;

            let id = params.id ? params.id.trim() : '',
                title = params.title ? params.title.trim() : '',
                pid = params.pid ? params.pid : '-1',
                filter_attr = params.filter_attr ? params.filter_attr.trim() : '',
                link = params.link ? params.link.trim() : '',
                template = params.template ? params.template.trim() : '',
                sub_title = params.sub_title ? params.sub_title.trim() : '',
                keywords = params.keywords ? params.keywords.trim() : '',
                description = params.description ? params.description.trim() : '',
                sort = params.sort ? params.sort.trim() : '',
                filename = stream.filename;

            if (id == '') {
                await this.error('/admin/goodsCate', '对不起！服务器繁忙！要不稍后再试试？');
                return;
            }

            if (title == '' || pid == '-1' || sort == '' || !(/^\d+$/.test(sort))) {
                await this.error(`/admin/goodsCate/edit?id=${params.id}`, '对不起！服务器繁忙！要不稍后再试试？');
                return;
            }

            params.id = id;
            params.title = title;
            params.pid = params.pid == '0' ? pid : this.app.mongoose.Types.ObjectId(pid);
            params.filter_attr = filter_attr;
            params.link = link;
            params.template = template;
            params.sub_title = sub_title;
            params.keywords = keywords;
            params.description = description;
            params.sort = sort;
            params.status = params.status ? 1 : 0;

            if (!filename) {
                break;
            } else {
                let fieldname = stream.fieldname,
                    dir = await service.tools.getUploadFile(filename, 'goodsCate'),
                    writeStream = fs.createWriteStream(dir.uploadDir);

                //因异步问题，无法进行顶级分类不上传图片的处理，会造成假死
                await pump(stream, writeStream);

                files = Object.assign(files, {
                    [fieldname]: dir.saveDir
                });

                //生成缩略图
                service.tools.jimpImg(dir.uploadDir, 100, [{ width: 64, height: 64 }, { width: 100, height: 100 }, { width: 200, height: 200 }, { width: 400, height: 400 }]);
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

        let goodsCate = await ctx.model.GoodsCate.updateOne(where, uParams);

        if (goodsCate.ok > 0) {
            await ctx.redirect('/admin/goodsCate');
        } else {
            await this.error(`/admin/goodsCate/edit?id=${params.id}`, '编辑商品分类失败！');
        }
    }
}

module.exports = GoodsCateController;
