'use strict';

const BaseController = require('./base'),
    fs = require('fs'),
    pump = require('mz-modules/pump');

class ArticleCateController extends BaseController {
    async index() {
        const { ctx, config } = this;
        let params = ctx.query,
            title = params.title ? params.title.trim() : '',
            page = params.page ? params.page : 1,
            pageSize = config.articleCatePageSize ? config.articleCatePageSize : 2,
            where = '';

        if (title && title != '') {
            //模糊查询
            where = title;
        };

        let totalCount = await ctx.model.ArticleCate.find({
            $and: [
                { title: { $regex: where } },
                { pid: '0' }
            ]
        }).count();
        let pageCount = Math.ceil(totalCount / pageSize);

        let list = await ctx.model.ArticleCate.aggregate([
            {
                $lookup: {
                    from: 'article_cate',
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
            },
            {
                $skip: ((page - 1) * pageSize)
            },
            {
                $limit: pageSize
            }
        ]);
        for (let i = 0; i < list.length; i++) {
            list[i].child = await ctx.service.tools.jsonSort(list[i].child, 'sort', false);
        }
        await this.ctx.render('/admin/articleCate/index', { params, list, page, pageCount });
    }

    //上传文章图片
    async articleCateUploadImg() {
        const { ctx, service, config } = this;
        let parts = ctx.multipart({ autoFields: true });
        let files = {},
            jimpSizes = config.jimpImgSizes,
            params,
            stream;

        while ((stream = await parts()) != null) {
            //警告：前端图片上传必须放在表单最底下，否则会获取不到完整的前端传值
            params = parts.field;

            if (!stream.filename) {
                await this.error('/admin/articleCate/add', '对不起！服务器繁忙！要不稍后再试试？');
                //这里必须加ruturn，否则会死循环
                return;
            } else {
                let filename = stream.filename,
                    fieldname = stream.fieldname,
                    dir = await service.tools.getUploadFile(filename, 'articleCate'),
                    writeStream = fs.createWriteStream(dir.uploadDir);

                await pump(stream, writeStream);

                //生成缩略图
                service.tools.jimpImg(dir.uploadDir, 100, jimpSizes);

                files = Object.assign({ [fieldname]: dir.saveDir });
            }
        }

        ctx.body = { link: files.file };
    }

    async add() {
        const { ctx } = this;

        let articleCate = await ctx.model.ArticleCate.find({ status: 1, pid: '0' }, { title: 1 });
        await ctx.render('admin/articleCate/add', { articleCate });
    }

    async doAdd() {
        const { ctx, app } = this;
        //金钱和数字正则表达式
        let num = /^\d+$/;

        let params = ctx.request.body,
            title = params.title ? params.title.trim() : '',
            pid = params.pid ? params.pid : '-1',
            link = params.link ? params.link.trim() : '',
            sub_title = params.sub_title ? params.sub_title.trim() : '',
            keywords = params.keywords ? params.keywords.trim() : '',
            description = params.description ? params.description.trim() : '',
            sort = params.sort ? params.sort.trim() : '',
            status = params.status ? 1 : 0,
            cate_img = params.cate_img ? params.cate_img : '';

        if (title == '' || pid == '-1' || link == '' || sort == '' || !num.test(sort)) {

            if (cate_img != '') {
                await ctx.service.tools.deleteFile(cate_img, true);
            }

            await this.error('/admin/articleCate/add', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        let articleCate = new ctx.model.ArticleCate({
            title,
            pid: pid == '0' ? pid : app.mongoose.Types.ObjectId(pid),
            link,
            sub_title,
            keywords,
            description,
            sort,
            status,
            cate_img,
            add_time: await ctx.service.tools.getTime()
        });

        try {
            await articleCate.save();
            await ctx.redirect('/admin/articleCate');
        } catch (err) {
            await this.error('/admin/articleCate/add', '增加文章分类失败！');
        }
    }

    async edit() {
        const { ctx } = this;
        let params = ctx.query,
            id = params.id ? params.id.trim() : '',
            where = {};

        if (id == '') {
            await this.error('/admin/articleCate', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        where = {
            _id: id
        };

        let articleCate = await ctx.model.ArticleCate.find({ status: 1, pid: '0' }, { title: 1 });
        let result = await ctx.model.ArticleCate.find(where);
        await this.ctx.render('admin/articleCate/edit', { result: result[0], articleCate, prevPage: ctx.state.prevPage });
    }

    async doEdit() {
        const { ctx, app } = this;

        //金钱和数字正则表达式
        let num = /^\d+$/,
            where = {},
            uParams = {};

        let params = ctx.request.body,
            id = params.id ? params.id.trim() : '',
            title = params.title ? params.title.trim() : '',
            pid = params.pid ? params.pid : '-1',
            link = params.link ? params.link.trim() : '',
            sub_title = params.sub_title ? params.sub_title.trim() : '',
            keywords = params.keywords ? params.keywords.trim() : '',
            description = params.description ? params.description.trim() : '',
            sort = params.sort ? params.sort.trim() : '',
            status = params.status ? 1 : 0,
            cate_img = params.cate_img ? params.cate_img : '',
            prevPage = (params.prevPage && !params.prevPage.indexOf('/admin/articleCate/doEdit')) ? params.prevPage : '/admin/articleCate';

        if (id == '') {
            await this.error(prevPage, '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        if (title == '' || pid == '-1' || link == '' || sort == '' || !num.test(sort)) {

            if (cate_img != '') {
                await ctx.service.tools.deleteFile(cate_img, true);
            }

            await this.error(`/admin/articleCate/edit?id=${id}`, '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        where = {
            _id: id
        };

        uParams = {
            title,
            pid: pid == '0' ? pid : app.mongoose.Types.ObjectId(pid),
            link,
            sub_title,
            keywords,
            description,
            sort,
            status,
            cate_img
        };

        let cateImg = (await ctx.model.ArticleCate.findOne(where, { _id: 0, cate_img: 1 })).cate_img;
        let articleCate = await ctx.model.ArticleCate.updateOne(where, uParams);

        if (articleCate.ok > 0) {
            try {
                if (uParams.cate_img != cateImg) {
                    await ctx.service.tools.deleteFile(cateImg, true);
                }
                if (uParams.pid == '0') {
                    await ctx.model.ArticleCate.updateMany({ pid: this.app.mongoose.Types.ObjectId(id), status: !uParams.status }, { status: uParams.status });
                } else {
                    let articleCateStatusCount = await ctx.model.ArticleCate.find({ pid: uParams.pid, status: 1 }).count();
                    if (!articleCateStatusCount) {
                        await ctx.model.ArticleCate.updateOne({ _id: pid }, { status: uParams.status });
                    }
                }
            } catch (err) {
                console.log(err);
                await this.error(`/admin/articleCate/edit?id=${id}`, '编辑文章分类失败！');
            }
            await ctx.redirect(prevPage);
        } else {
            await this.error(`/admin/articleCate/edit?id=${id}`, '编辑文章分类失败！');
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

        let articleCate = await ctx.model.ArticleCate.findOne(where, { _id: 0, pid: 1, status: 1 });
        let pid = articleCate.pid,
            articleCateStatus = articleCate.status;

        if (articleCate == undefined) {
            ctx.body = { 'message': '更新失败，参数错误', 'success': false };
        } else {
            let uParams = articleCateStatus == 0 ? { status: 1 } : { status: 0 };
            if (pid == '0') {
                try {
                    await ctx.model.ArticleCate.updateOne(where, uParams);
                    await ctx.model.ArticleCate.updateMany({ pid: app.mongoose.Types.ObjectId(id), status: articleCateStatus }, uParams);
                    ctx.body = { 'message': '更新成功', 'success': true };
                } catch (err) {
                    console.log(err);
                    ctx.body = { 'message': '更新失败', 'success': false };
                }
            } else {
                try {
                    await ctx.model.ArticleCate.updateOne(where, uParams);
                    if (articleCateStatus) {
                        let articleCateStatusCount = await ctx.model.ArticleCate.find({ pid: app.mongoose.Types.ObjectId(pid), status: 1 }).count();
                        if (!articleCateStatusCount) {
                            await ctx.model.ArticleCate.updateOne({ _id: pid }, uParams);
                        }
                    } else {
                        let articleCateStatus = (await ctx.model.ArticleCate.findOne({ _id: pid }, { status: 1, _id: 0 })).status;
                        if (!articleCateStatus) {
                            await ctx.model.ArticleCate.updateOne({ _id: pid }, uParams);
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
            await this.error('/admin/articleCate', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        where = {
            _id: id
        };

        let articleCate = await ctx.model.ArticleCate.findOne(where, { _id: 0, pid: 1, cate_img: 1 });
        let pid = articleCate.pid,
            cate_img = articleCate.cate_img;

        if (pid == '0') {
            try {
                await ctx.model.ArticleCate.deleteOne(where);
                await service.tools.deleteFile(cate_img, true);
                let articleCateImgs = await ctx.model.ArticleCate.find({ pid: app.mongoose.Types.ObjectId(id) }, { _id: 0, cate_img: 1 });
                await ctx.model.ArticleCate.deleteMany({ pid: app.mongoose.Types.ObjectId(id) });
                for (let i = 0; i < articleCateImgs.length; i++) {
                    await service.tools.deleteFile(articleCateImgs[i].cate_img, true);
                }
                await ctx.redirect(ctx.state.prevPage);
            } catch (err) {
                console.log(err);
                await this.error(ctx.state.prevPage, '删除商品分类失败！');
            }
        } else {
            try {
                await ctx.model.ArticleCate.deleteOne(where);
                await service.tools.deleteFile(cate_img, true);
                await ctx.redirect(ctx.state.prevPage);
            } catch (err) {
                console.log(err);
                await this.error(ctx.state.prevPage, '删除商品分类失败！');
            }
        }
    }
}

module.exports = ArticleCateController;
