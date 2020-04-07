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
        const { ctx, service, config } = this;
        let parts = ctx.multipart({ autoFields: true });
        let files = {},
            jimpSizes = config.jimpImgSizes
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
                service.tools.jimpImg(dir.uploadDir, 100, jimpSizes);
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
            await this.error('/admin/goodsCate/add', '增加商品分类失败！');
        }
    }

    async edit() {
        const { ctx } = this;
        let params = ctx.query,
            id = params.id ? params.id.trim() : '',
            where = {};

        if (id == '') {
            await this.error('/admin/goodsCate', '对不起！服务器繁忙！要不稍后再试试？');
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
        const { ctx, service, app, config } = this;

        let parts = ctx.multipart({ autoFields: true });
        let files = {},
            where = {},
            jimpSizes = config.jimpImgSizes
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
                service.tools.jimpImg(dir.uploadDir, 100, jimpSizes);
            }
        }

        where = {
            _id: params.id
        };

        let uParams = {};

        //判断空json的笨方法
        if (JSON.stringify(files) == '{}') {
            uParams = params;
        } else {
            uParams = Object.assign(
                files,
                params
            );
            let goodsCateImg = (await ctx.model.GoodsCate.findOne(where, { _id: 0, cate_img: 1 })).cate_img;
            if (goodsCateImg) {
                await service.tools.deleteFile(goodsCateImg, true);
            }
        }

        let goodsCate = await ctx.model.GoodsCate.updateOne(where, uParams);

        if (goodsCate.ok > 0) {
            try {
                if (params.pid == '0') {
                    await ctx.model.GoodsCate.updateMany({ pid: this.app.mongoose.Types.ObjectId(params.id), status: !uParams.status }, { status: uParams.status });
                } else {
                    let goodsCateStatusCount = await ctx.model.GoodsCate.find({ pid: app.mongoose.Types.ObjectId(params.pid), status: 1 }).count();
                    if (!goodsCateStatusCount) {
                        await ctx.model.GoodsCate.updateOne({ _id: params.pid }, { status: uParams.status });
                    }
                }
            } catch (err) {
                console.log(err);
                await this.error(`/admin/goodsCate/edit?id=${params.id}`, '编辑商品分类失败！');
            }
            await ctx.redirect('/admin/goodsCate');
        } else {
            await this.error(`/admin/goodsCate/edit?id=${params.id}`, '编辑商品分类失败！');
        }
    }

    async changeStatus() {
        const { ctx, app } = this;
        let params = ctx.request.body,
            id = params.id ? params.id.trim() : '',
            where = {};

        if (id == '') {
            ctx.body = { 'message': '对不起！服务器繁忙！要不稍后再试试？', 'success': false };
            return;
        }

        where = {
            _id: id
        };

        let goodsCate = await ctx.model.GoodsCate.findOne(where, { _id: 0, pid: 1, status: 1 });
        let pid = goodsCate.pid,
            goodsCateStatus = goodsCate.status;

        if (goodsCate == undefined) {
            ctx.body = { 'message': '更新失败，参数错误', 'success': false };
        } else {
            let uParams = goodsCateStatus == 0 ? { status: 1 } : { status: 0 };
            if (pid == '0') {
                try {
                    await ctx.model.GoodsCate.updateOne(where, uParams);
                    await ctx.model.GoodsCate.updateMany({ pid: app.mongoose.Types.ObjectId(id), status: goodsCateStatus }, uParams);
                    ctx.body = { 'message': '更新成功', 'success': true };
                } catch (err) {
                    console.log(err);
                    ctx.body = { 'message': '更新失败', 'success': false };
                }
            } else {
                try {
                    await ctx.model.GoodsCate.updateOne(where, uParams);
                    if (goodsCateStatus) {
                        let goodsCateStatusCount = await ctx.model.GoodsCate.find({ pid: app.mongoose.Types.ObjectId(pid), status: 1 }).count();
                        if (!goodsCateStatusCount) {
                            await ctx.model.GoodsCate.updateOne({ _id: pid }, uParams);
                        }
                    } else {
                        let goodsCateStatus = (await ctx.model.GoodsCate.findOne({ _id: pid }, { status: 1, _id: 0 })).status;
                        if (!goodsCateStatus) {
                            await ctx.model.GoodsCate.updateOne({ _id: pid }, uParams);
                        }
                    }
                    ctx.body = { 'message': '更新成功', 'success': true };
                } catch (err) {
                    console.log(err);
                    ctx.body = { 'message': '更新失败', 'success': false };
                }
            }
        }
    }

    async delete() {
        const { ctx, service, app } = this;
        let params = ctx.query,
            id = params.id ? params.id.trim() : '',
            where = {};

        if (id == '') {
            await this.error('/admin/goodsCate', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        where = {
            _id: id
        };

        let goodsCate = await ctx.model.GoodsCate.findOne(where, { _id: 0, pid: 1, cate_img: 1 });
        let pid = goodsCate.pid,
            cate_img = goodsCate.cate_img;

        if (pid == '0') {
            try {
                await ctx.model.GoodsCate.deleteOne(where);
                await service.tools.deleteFile(cate_img, true);
                let goodsCateImgs = await ctx.model.GoodsCate.find({ pid: app.mongoose.Types.ObjectId(id) }, { _id: 0, cate_img: 1 });
                await ctx.model.GoodsCate.deleteMany({ pid: app.mongoose.Types.ObjectId(id) });
                for (let i = 0; i < goodsCateImgs.length; i++) {
                    await service.tools.deleteFile(goodsCateImgs[i].cate_img, true);
                }
                await ctx.redirect(ctx.state.prevPage);
            } catch (err) {
                console.log(err);
                await this.error(ctx.state.prevPage, '删除商品分类失败！');
            }
        } else {
            try {
                await ctx.model.GoodsCate.deleteOne(where);
                await service.tools.deleteFile(cate_img, true);
                await ctx.redirect(ctx.state.prevPage);
            } catch (err) {
                console.log(err);
                await this.error(ctx.state.prevPage, '删除商品分类失败！');
            }
        }
    }
}

module.exports = GoodsCateController;
