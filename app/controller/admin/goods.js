'use strict';

const BaseController = require('./base'),
    fs = require('fs'),
    pump = require('mz-modules/pump');

class GoodsController extends BaseController {
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

        let list = await ctx.model.Goods.find(where);
        await ctx.render('admin/goods/index', { params, list });
    }

    //商品详情中的上传图片
    async goodsUploadImage() {
        const { ctx, service } = this;
        let parts = ctx.multipart({ autoFields: true });
        let files = {},
            params,
            stream;

        while ((stream = await parts()) != null) {
            //警告：前端轮播图上传必须放在表单最底下，否则会获取不到完整的前端传值
            params = parts.field;

            if (!stream.filename) {
                await this.error('/admin/goods/add', '对不起！服务器繁忙！要不稍后再试试？');
                //这里必须加ruturn，否则会死循环
                return;
            } else {
                let filename = stream.filename,
                    fieldname = stream.fieldname,
                    dir = await service.tools.getUploadFile(filename, 'goodsContentImage'),
                    writeStream = fs.createWriteStream(dir.uploadDir);

                await pump(stream, writeStream);

                files = Object.assign({ [fieldname]: dir.saveDir });
            }
        }

        ctx.body = { link: files.file };
    }

    //商品详情中的上传视频
    async goodsUploadVideo() {
        const { ctx, service } = this;
        let parts = ctx.multipart({ autoFields: true });
        let files = {},
            params,
            stream;

        while ((stream = await parts()) != null) {
            //警告：前端轮播图上传必须放在表单最底下，否则会获取不到完整的前端传值
            params = parts.field;

            if (!stream.filename) {
                await this.error('/admin/goods/add', '对不起！服务器繁忙！要不稍后再试试？');
                //这里必须加ruturn，否则会死循环
                return;
            } else {
                let filename = stream.filename,
                    fieldname = stream.fieldname,
                    dir = await service.tools.getUploadFile(filename, 'goodsContentVideo'),
                    writeStream = fs.createWriteStream(dir.uploadDir);

                await pump(stream, writeStream);

                files = Object.assign({ [fieldname]: dir.saveDir });
            }
        }

        ctx.body = { link: files.file };
    }

    async goodsTypeAttribute() {
        const { ctx, app } = this;

        let params = ctx.query,
            cate_id = params.cate_id ? params.cate_id.trim() : '',
            where = '';

        if (cate_id == '') {
            await this.error('/admin/goods/add', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        let list = await ctx.model.GoodsTypeAttribute.find({ cate_id, status: 1 }, { title: 1, attr_type: 1, attr_value: 1 });
        ctx.body = { result: list };
    }

    //上传相册的图片
    async goodsUploadPhoto() {
        const { ctx, service } = this;
        let parts = ctx.multipart({ autoFields: true });
        let files = {},
            params,
            stream;

        while ((stream = await parts()) != null) {
            //警告：前端轮播图上传必须放在表单最底下，否则会获取不到完整的前端传值
            params = parts.field;

            if (!stream.filename) {
                await this.error('/admin/goods/add', '对不起！服务器繁忙！要不稍后再试试？');
                //这里必须加ruturn，否则会死循环
                return;
            } else {
                let filename = stream.filename,
                    fieldname = stream.fieldname,
                    dir = await service.tools.getUploadFile(filename, 'goodsContentPhoto'),
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
        let goodsColor = await ctx.model.GoodsColor.find({ status: 1 }, { color_name: 1 });
        let goodsType = await ctx.model.GoodsType.find({ status: 1 }, { title: 1 });
        for (let i = 0; i < list.length; i++) {
            list[i].child = await ctx.service.tools.jsonSort(list[i].child, 'sort', false);
        }
        await this.ctx.render('admin/goods/add', { goodsCate: list, goodsColor, goodsType });
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
                sort = params.sort ? params.sort.trim() : '',
                filename = stream.filename;




            params.status = params.status ? 1 : 0;

            if (!filename) {
                break;
                //await this.error('/admin/goods/add', '对不起！服务器繁忙！要不稍后再试试？');
                //这里必须加ruturn，否则会死循环
                //return;
            } else {
                let fieldname = stream.fieldname,
                    dir = await service.tools.getUploadFile(filename, 'goods'),
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

        let goods = Object.assign(
            files,
            params,
            { add_time: await ctx.service.tools.getTime() }
        );

        console.log(goods)

        /*
            {
                pic: '/public/admin/upload/goods/20200326/1585206393967.jpg',
                title: '1',
                sub_title: '2',
                goods_version: '3',
                cid: '5be930619567312f28240bf6',
                status: 1,
                price: '4',
                old_price: '5',
                is_best: '1',
                content: '<p>6<img src="/public/admin/upload/goodsContentImage/20200326/1585206323982.jpg" style="width: 300px;" class="fr-fic fr-dib"><span class="fr-video fr-dvb fr-draggable" contenteditable="false" draggable="true"><video class="fr-draggable" controls="" src="/public/admin/upload/goodsContentVideo/20200326/1585206334148.mp4" style="width: 600px;">您的 浏览器不支持 HTML5 视频。</video></span></p>',
                colors: [ '5bbb68c1fe498e2346af9e48', '5e7ad05a3380fd3e004b26ea' ],
                relation_goods: '7',
                goods_gift: '8',
                goods_fitting: '9',
                goods_attr: '10',
                goods_type_id: '5baf319abee4cc26e47833de',
                attr_id_list: [
                    '5baf521a7fea212078c7a299',
                    '5baf543d742ae71d744dce9d',
                    '5bbb2882fe9fc817a4411816',
                    '5bbeafc45e4b481d6cb2732e',
                    '5bbeb2e9192f161bf806617d',
                    '5bc0703626253f327017a01f',
                    '5bc0703d26253f327017a020'
                ],
                attr_value_list: [
                    '11', '12', '否',
                    '13', '14', '15',
                    '16'
                ],
                goods_image_list: [
                    '/public/admin/upload/goodsContentPhoto/20200326/1585206389241.jpg',
                    '/public/admin/upload/goodsContentPhoto/20200326/1585206391099.jpg',
                    '/public/admin/upload/goodsContentPhoto/20200326/1585206391129.jpg'
                ],
                add_time: 1585206393981
            }
        */

        // try {
        //     await goodsCate.save();
        //     await ctx.redirect('/admin/goodsCate');
        // } catch (err) {
        //     await this.error('/admin/goodsCate/add', '增加商品分类图失败！');
        // }
    }

    async edit() {
        const { ctx } = this;
        let params = ctx.query,
            id = params.id ? params.id.trim() : '',
            where = {};

        if (id == '') {
            await this.error('/admin/goods', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        where = {
            _id: id
        };

        let result = await ctx.model.GoodsColor.find(where);
        await this.ctx.render('admin/goods/edit', { result: result[0] });
    }

    async doEdit() {
        const { ctx } = this;
        let params = ctx.request.body,
            id = params.id ? params.id.trim() : '',
            color_name = params.color_name ? params.color_name.trim() : '',
            color_value = params.color_value ? params.color_value.trim() : '',
            where = {},
            uParams = {};

        if (id == '') {
            await this.error('/admin/goods', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        if (color_name == '' || color_value == '') {
            await this.error(`/admin/goods/edit?id=${id}`, '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        where = {
            _id: id
        };

        uParams = {
            color_name,
            color_value,
            status: params.status ? 1 : 0
        };

        let goodsColor = await ctx.model.GoodsColor.updateOne(where, uParams);

        if (goodsColor.nModified > 0) {
            await ctx.redirect('/admin/goods');
        } else {
            await this.error(`/admin/goods/edit?id=${id}`, '编辑商品颜色失败！');
        }
    }
}

module.exports = GoodsController;
