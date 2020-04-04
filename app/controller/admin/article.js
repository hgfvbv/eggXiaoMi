'use strict';

const BaseController = require('./base'),
    fs = require('fs'),
    pump = require('mz-modules/pump'),
    _ = require('lodash');

class ArticleController extends BaseController {
    async index() {
        const { ctx, config } = this;

        let params = ctx.query,
            title = params.title ? params.title.trim() : '',
            page = params.page ? params.page : 1,
            pageSize = config.pageSize ? config.pageSize : 10,
            where = '';

        if (title && title != '') {
            //模糊查询
            where = title;
        };

        let totalCount = await ctx.model.Article.find({
            $or: [
                { title: { $regex: where } }
            ]
        }).count();
        let pageCount = Math.ceil(totalCount / pageSize);

        let list = await ctx.model.Article.aggregate([
            {
                $lookup: {
                    from: 'article_cate',
                    localField: 'cate_id',
                    foreignField: '_id',
                    as: 'articleCate'
                }
            },
            {
                $match: {
                    $or: [
                        { title: { $regex: where } }
                    ]
                }
            },
            {
                $skip: ((page - 1) * pageSize)
            },
            {
                $limit: pageSize
            }
        ]);
        await ctx.render('admin/article/index', { params, list, page, pageCount });
    }

    //文章详情中的上传图片
    async articleUploadImage() {
        const { ctx, service } = this;
        let parts = ctx.multipart({ autoFields: true });
        let files = {},
            params,
            stream;

        while ((stream = await parts()) != null) {
            //警告：前端图片上传必须放在表单最底下，否则会获取不到完整的前端传值
            params = parts.field;

            if (!stream.filename) {
                await this.error('/admin/article/add', '对不起！服务器繁忙！要不稍后再试试？');
                //这里必须加ruturn，否则会死循环
                return;
            } else {
                let filename = stream.filename,
                    fieldname = stream.fieldname,
                    dir = await service.tools.getUploadFile(filename, 'articleContentImage'),
                    writeStream = fs.createWriteStream(dir.uploadDir);

                await pump(stream, writeStream);

                files = Object.assign({ [fieldname]: dir.saveDir });
            }
        }

        ctx.body = { link: files.file };
    }

    //文章详情中的上传视频
    async articleUploadVideo() {
        const { ctx, service } = this;
        let parts = ctx.multipart({ autoFields: true });
        let files = {},
            params,
            stream;

        while ((stream = await parts()) != null) {
            //警告：前端视频上传必须放在表单最底下，否则会获取不到完整的前端传值
            params = parts.field;

            if (!stream.filename) {
                await this.error('/admin/article/add', '对不起！服务器繁忙！要不稍后再试试？');
                //这里必须加ruturn，否则会死循环
                return;
            } else {
                let filename = stream.filename,
                    fieldname = stream.fieldname,
                    dir = await service.tools.getUploadFile(filename, 'articleContentVideo'),
                    writeStream = fs.createWriteStream(dir.uploadDir);

                await pump(stream, writeStream);

                files = Object.assign({ [fieldname]: dir.saveDir });
            }
        }

        ctx.body = { link: files.file };
    }

    //上传封面图片
    async articleUploadImg() {
        const { ctx, service } = this;
        let parts = ctx.multipart({ autoFields: true });
        let files = {},
            params,
            stream;

        while ((stream = await parts()) != null) {
            //警告：前端图片上传必须放在表单最底下，否则会获取不到完整的前端传值
            params = parts.field;

            if (!stream.filename) {
                await this.error('/admin/article/add', '对不起！服务器繁忙！要不稍后再试试？');
                //这里必须加ruturn，否则会死循环
                return;
            } else {
                let filename = stream.filename,
                    fieldname = stream.fieldname,
                    dir = await service.tools.getUploadFile(filename, 'article'),
                    writeStream = fs.createWriteStream(dir.uploadDir);

                await pump(stream, writeStream);

                //生成缩略图
                service.tools.jimpImg(dir.uploadDir, 100, [{ width: 64, height: 64 }, { width: 100, height: 100 }, { width: 200, height: 200 }, { width: 400, height: 400 }]);

                files = Object.assign({ [fieldname]: dir.saveDir });
            }
        }

        ctx.body = { link: files.file };
    }

    async add() {
        const { ctx } = this;

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
                        { status: 1 },
                        { pid: '0' }
                    ]
                }
            },
            {
                $project: {
                    title: 1,
                    child: 1
                }
            },
            {
                $sort: {
                    sort: 1
                }
            }
        ]);
        for (let i = 0; i < list.length; i++) {
            //移除失效的子模块
            list[i].child = list[i].child.filter((e => { return e.status == 1 }));
            list[i].child = await ctx.service.tools.jsonSort(list[i].child, 'sort', false);
        }
        await this.ctx.render('admin/article/add', { articleCate: list });
    }

    async doAdd() {
        const { app, ctx } = this;
        //金钱和数字正则表达式
        let num = /^\d+$/;

        let params = ctx.request.body,
            title = params.title ? params.title.trim() : '',
            cate_id = params.cate_id ? params.cate_id : '-1',
            link = params.link ? params.link.trim() : '',
            keywords = params.keywords ? params.keywords.trim() : '',
            description = params.description ? params.description.trim() : '',
            status = params.status ? 1 : 0,
            sort = params.sort ? params.sort.trim() : '',
            article_img = params.article_img ? params.article_img : '',
            content = params.content ? params.content.trim() : '';

        if (title == '' || cate_id == '-1' || link == '' || sort == '' || !num.test(sort) || content == '') {

            if (article_img != '') {
                await ctx.service.tools.deleteFile(article_img, true);
            }

            await this.error('/admin/article/add', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        let article = new ctx.model.Article({
            title,
            cate_id,
            link,
            keywords,
            description,
            status,
            article_img,
            content,
            sort,
            add_time: await ctx.service.tools.getTime()
        });

        try {
            await article.save();
            await ctx.redirect('/admin/article');
        } catch (err) {
            console.log(err)
            await this.error('/admin/article/add', '增加文章失败！');
        }
    }

    async edit() {
        const { ctx } = this;
        let params = ctx.query,
            id = params.id ? params.id.trim() : '',
            where = {};

        if (id == '') {
            await this.error('/admin/article', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        where = {
            _id: id
        };

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
                        { status: 1 },
                        { pid: '0' }
                    ]
                }
            },
            {
                $project: {
                    title: 1,
                    child: 1
                }
            },
            {
                $sort: {
                    sort: 1
                }
            }
        ]);
        for (let i = 0; i < list.length; i++) {
            //移除失效的子模块
            list[i].child = list[i].child.filter((e => { return e.status == 1 }));
            list[i].child = await ctx.service.tools.jsonSort(list[i].child, 'sort', false);
        }

        let result = await ctx.model.Article.findOne(where);

        await this.ctx.render('admin/article/edit', {
            result,
            articleCate: list,
            prevPage: ctx.state.prevPage
        });
    }

    async doEdit() {
        const { app, ctx } = this;
        //金钱和数字正则表达式
        let num = /^\d+$/,
            where = {},
            uParams = {};

        let params = ctx.request.body,
            id = params.id ? params.id.trim() : '',
            title = params.title ? params.title.trim() : '',
            cate_id = params.cate_id ? params.cate_id : '-1',
            link = params.link ? params.link.trim() : '',
            keywords = params.keywords ? params.keywords.trim() : '',
            description = params.description ? params.description.trim() : '',
            status = params.status ? 1 : 0,
            sort = params.sort ? params.sort.trim() : '',
            article_img = params.article_img ? params.article_img : '',
            content = params.content ? params.content.trim() : '',
            prevPage = (params.prevPage && !params.prevPage.indexOf('/admin/article/doEdit')) ? params.prevPage : '/admin/article';

        if (id == '') {
            await this.error(prevPage, '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        if (title == '' || cate_id == '-1' || cate_id == '0' || link == '' || sort == '' || !num.test(sort) || content == '') {
            if (article_img != '') {
                await ctx.service.tools.deleteFile(article_img, true);
            }
            await this.error(`/admin/article/edit?id=${id}`, '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        where = {
            _id: id
        };

        uParams = {
            title,
            cate_id: app.mongoose.Types.ObjectId(cate_id),
            link,
            keywords,
            description,
            status,
            article_img,
            content,
            sort
        };

        let articleImg = (await ctx.model.Article.findOne(where, { _id: 0, article_img: 1 })).article_img;
        let article = await ctx.model.Article.updateOne(where, uParams);

        if (article.ok > 0) {
            if (uParams.article_img != articleImg) {
                await ctx.service.tools.deleteFile(articleImg, true);
            }
            await ctx.redirect(prevPage);
        } else {
            await this.error(`/admin/article/edit?id=${params.id}`, '编辑文章失败！');
        }
    }

    async delete() {
        const { ctx } = this;
        let params = ctx.query,
            id = params.id ? params.id.trim() : '',
            where = {};

        if (id == '') {
            await this.error(ctx.state.prevPage, '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        where = {
            _id: id
        };

        let article = await ctx.model.Article.findOne(where, { article_img: 1 });
        let result = await ctx.model.Article.deleteOne(where);
        if (result.deletedCount > 0) {
            await ctx.service.tools.deleteFile(article.article_img, true);
            await ctx.redirect(ctx.state.prevPage);
        } else {
            await this.error(ctx.state.prevPage, '删除文章失败！');
        }
    }
}

module.exports = ArticleController;
