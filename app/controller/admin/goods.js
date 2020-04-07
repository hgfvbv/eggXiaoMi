'use strict';

const BaseController = require('./base'),
    fs = require('fs'),
    pump = require('mz-modules/pump'),
    _ = require('lodash');

class GoodsController extends BaseController {
    async index() {
        const { ctx, config } = this;

        let params = ctx.query,
            title = params.title ? params.title.trim() : '',
            page = params.page ? params.page : 1,
            pageSize = config.pageSize ? config.pageSize : 10,
            where = {};

        if (title && title != '') {
            //模糊查询
            where = {
                $or: [
                    { title: { $regex: title } }
                ]
            };
        };

        let totalCount = await ctx.model.Goods.find(where).count();
        let pageCount = Math.ceil(totalCount / pageSize);
        let list = await ctx.model.Goods.find(where).skip((page - 1) * pageSize).limit(pageSize).sort({ sort: 1 });
        await ctx.render('admin/goods/index', { params, list, page, pageCount });
    }

    //商品详情中的上传图片
    async goodsUploadImage() {
        const { ctx, service } = this;
        let parts = ctx.multipart({ autoFields: true });
        let files = {},
            params,
            stream;

        while ((stream = await parts()) != null) {
            //警告：前端图片上传必须放在表单最底下，否则会获取不到完整的前端传值
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
            //警告：前端视频上传必须放在表单最底下，否则会获取不到完整的前端传值
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
        const { ctx } = this;

        let params = ctx.query,
            cate_id = params.cate_id ? params.cate_id.trim() : '';

        if (cate_id == '') {
            await this.error('/admin/goods/add', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        let list = await ctx.model.GoodsTypeAttribute.find({ cate_id, status: 1 }, { title: 1, attr_type: 1, attr_value: 1 }).sort({ sort: 1 });
        ctx.body = { result: list };
    }

    //上传相册的图片
    async goodsUploadPhoto() {
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
                service.tools.jimpImg(dir.uploadDir, 100, jimpSizes);

                files = Object.assign({ [fieldname]: dir.saveDir });
            }
        }

        ctx.body = { link: files.file };
    }

    //上传商品图片
    async goodsUploadImg() {
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
                await this.error('/admin/goods/add', '对不起！服务器繁忙！要不稍后再试试？');
                //这里必须加ruturn，否则会死循环
                return;
            } else {
                let filename = stream.filename,
                    fieldname = stream.fieldname,
                    dir = await service.tools.getUploadFile(filename, 'goods'),
                    writeStream = fs.createWriteStream(dir.uploadDir);

                await pump(stream, writeStream);
console.log(jimpSizes)
                //生成缩略图
                service.tools.jimpImg(dir.uploadDir, 100, jimpSizes);

                files = Object.assign({ [fieldname]: dir.saveDir });
            }
        }

        ctx.body = { link: files.file };
    }

    async changeGoodsImageColor() {
        const { ctx, app } = this;
        let params = ctx.request.body,
            id = params.id ? params.id.trim() : '',
            color_id = params.colorId ? params.colorId.trim() : '',
            where = {},
            uParams = {};

        if (id == '' || color_id == '') {
            ctx.body = { 'message': '对不起！服务器繁忙！要不稍后再试试？', 'success': false };
            return;
        }

        where = {
            _id: id
        };

        uParams = {
            color_id: color_id == '0' ? '0' : app.mongoose.Types.ObjectId(color_id)
        };

        let result = await ctx.model.GoodsImage.updateOne(where, uParams);
        if (result.nModified > 0) {
            ctx.body = { 'message': '更新成功', 'success': true };
        } else {
            ctx.body = { 'message': '更新失败', 'success': false };
        }
    }

    async goodsImageRemove() {
        const { ctx, config } = this;
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

        let goods_img = (await ctx.model.GoodsImage.findOne(where, { _id: 0, img_url: 1 })).img_url;
        let result = await ctx.model.GoodsImage.deleteOne(where);

        if (result.deletedCount > 0) {
            await ctx.service.tools.deleteFile(goods_img, true);
            ctx.body = { 'message': '更新成功', 'success': true };
        } else {
            ctx.body = { 'message': '更新失败', 'success': false };
        }
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
            //移除失效的子模块
            list[i].child = list[i].child.filter((e => { return e.status == 1 }));
            list[i].child = await ctx.service.tools.jsonSort(list[i].child, 'sort', false);
        }
        await this.ctx.render('admin/goods/add', { goodsCate: list, goodsColor, goodsType });
    }

    async doAdd() {
        const { app, ctx } = this;
        //金钱和数字正则表达式
        let money = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/,
            num = /^\d+$/;

        let params = ctx.request.body,
            title = params.title ? params.title.trim() : '',
            sub_title = params.sub_title ? params.sub_title.trim() : '',
            goods_version = params.goods_version ? params.goods_version.trim() : '',
            goods_sn = params.goods_sn ? params.goods_sn.trim() : '',
            goods_number = params.goods_number ? params.goods_number.trim() : '',
            shop_price = params.shop_price ? params.shop_price.trim() : '',
            market_price = params.market_price ? params.market_price.trim() : '',
            sort = params.sort ? params.sort.trim() : '',
            goods_img = params.goods_img ? params.goods_img : '',
            goods_content = params.goods_content ? params.goods_content.trim() : '';

        if (title == '' || sub_title == '' || goods_version == '' || goods_sn == '' || goods_img == '' || shop_price == '' || !money.test(shop_price) || market_price == '' || !money.test(market_price) || sort == '' || !num.test(sort) || goods_number == '' || !num.test(goods_number) || goods_content == '') {

            if (goods_img != '') {
                await ctx.service.tools.deleteFile(goods_img, true);
            }

            await this.error('/admin/goods/add', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        params.status = params.status ? 1 : 0;
        params.is_best = params.is_best ? 1 : 0;
        params.is_hot = params.is_hot ? 1 : 0;
        params.is_new = params.is_new ? 1 : 0;
        params.goods_color = params.goods_color ? params.goods_color : [];
        params.attr_id_list = params.attr_id_list ? params.attr_id_list : [];
        params.attr_value_list = params.attr_value_list ? params.attr_value_list : [];
        params.goods_image_list = params.goods_image_list ? params.goods_image_list : [];

        let goods = new ctx.model.Goods({
            title,
            sub_title,
            goods_version,
            goods_sn,
            cate_id: params.cate_id,
            shop_price,
            market_price,
            click_count: 0,
            goods_number,
            status: params.status,
            sort,
            is_best: params.is_best,
            is_hot: params.is_hot,
            is_new: params.is_new,
            is_del: 0,
            goods_img,
            goods_content,
            goods_color: params.goods_color,
            relation_goods: params.relation_goods.trim().replace('，', ','),
            goods_gift: params.goods_gift.trim().replace('，', ','),
            goods_fitting: params.goods_fitting.trim().replace('，', ','),
            goods_attrs: params.goods_attr.trim().replace('，', ','),
            goods_keywords: params.goods_keywords,
            goods_desc: params.goods_desc,
            goods_type_id: params.goods_type_id == '0' ? params.goods_type_id : app.mongoose.Types.ObjectId(params.goods_type_id),
            add_time: await ctx.service.tools.getTime()
        });

        try {
            goods = await goods.save();

            let goodsImageArray = [];
            _.forEach(params.goods_image_list, (item, i) => {
                goodsImageArray.push(new ctx.model.GoodsImage({
                    goods_id: goods._id,
                    img_url: item,
                    color_id: '',
                    status: 1,
                    add_time: goods.add_time
                }));
            });

            if (goodsImageArray.length > 0) {
                try {
                    await ctx.model.GoodsImage.insertMany(goodsImageArray);
                } catch (err) {
                    await this.error(`/admin/goods/add`, '增加商品失败！');
                    return;
                }
            }

            let goodsAttrArray = [];
            for (let i = 0; i < params.attr_id_list.length; i++) {
                const item = params.attr_id_list[i];

                let goodsTypeAttribute = await ctx.model.GoodsTypeAttribute.findOne({ _id: item }, { _id: 0, title: 1, attr_type: 1 });
                goodsAttrArray.push(new ctx.model.GoodsAttr({
                    goods_id: goods._id,
                    cate_id: goods.cate_id,
                    attribute_id: item,
                    attribute_type: goodsTypeAttribute.attr_type,
                    attribute_title: goodsTypeAttribute.title,
                    attribute_value: params.attr_value_list[i],
                    status: 1,
                    sort: goodsTypeAttribute.sort,
                    add_time: goods.add_time
                }));
            }

            if (goodsAttrArray.length > 0) {
                try {
                    await ctx.model.GoodsAttr.insertMany(goodsAttrArray);
                } catch (err) {
                    await this.error(`/admin/goods/add`, '增加商品失败！');
                    return;
                }
            }

            await ctx.redirect('/admin/goods');
        } catch (err) {
            console.log(err)
            await this.error('/admin/goods/add', '增加商品失败！');
        }
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
            //移除失效的子模块
            list[i].child = list[i].child.filter((e => { return e.status == 1 }));
            list[i].child = await ctx.service.tools.jsonSort(list[i].child, 'sort', false);
        }

        let result = await ctx.model.Goods.findOne(where);
        let goodsImage = await ctx.model.GoodsImage.find({ goods_id: result._id }, { img_url: 1, color_id: 1 });
        let goodsAttrStr = '',
            goodsAttr = await ctx.model.GoodsAttr.find({ goods_id: result._id, status: 1 }).sort({ sort: 1 });

        for (let i = 0; i < goodsAttr.length; i++) {
            if (goodsAttr[i].attribute_type == '1') {
                goodsAttrStr += `<li class="line"><span>${goodsAttr[i].attribute_title}: 　</span><input type="hidden" name="attr_id_list[]" value="${goodsAttr[i].attribute_id}" />  <input type="text" name="attr_value_list[]" placeholder="请输入${goodsAttr[i].attribute_title}" value="${goodsAttr[i].attribute_value}" /></li>`;
            } else if (goodsAttr[i].attribute_type == '2') {
                goodsAttrStr += `<li class="line"><span>${goodsAttr[i].attribute_title}: 　</span> <input type="hidden" name="attr_id_list[]" value="${goodsAttr[i].attribute_id}">  <textarea cols="50" rows="3" name="attr_value_list[]" placeholder="请输入${goodsAttr[i].attribute_title}">${goodsAttr[i].attribute_value}</textarea></li>`
            } else {
                //获取 attr_value  获取可选值列表
                let goodsTypeAttr = await ctx.model.GoodsTypeAttribute.findOne({ _id: goodsAttr[i].attribute_id }, { _id: 0, attr_value: 1 });

                let arr = goodsTypeAttr.attr_value.split('\n');
                goodsAttrStr += `<li class="line"><span>${goodsAttr[i].attribute_title}: 　</span><input type="hidden" name="attr_id_list[]" value="${goodsAttr[i].attribute_id}">`;
                goodsAttrStr += `<select name="attr_value_list[]">`;
                for (let j = 0; j < arr.length; j++) {
                    if (arr[j] == goodsAttr[i].attribute_value) {
                        goodsAttrStr += `<option value="${arr[j]}" selected>${arr[j]}</option>`;
                    } else {
                        goodsAttrStr += `<option value="${arr[j]}">${arr[j]}</option>`;
                    }
                }
                goodsAttrStr += `</select>`;
                goodsAttrStr += `</li>`;
            }
        }

        let goodsColorIdArray = [];
        result.goods_color = result.goods_color ? result.goods_color : [];
        //兼容旧数据
        result.goods_color = new Array(result.goods_color);
        for (let i = 0; i < result.goods_color.length; i++) {
            goodsColorIdArray.push({ _id: result.goods_color[i] });
        }

        let goodsColorParams = {};
        if (goodsColorIdArray.length > 0) {
            goodsColorParams = { status: 1, $or: goodsColorIdArray };
        } else {
            goodsColorParams = { status: 1 };
        }

        let goodsColorRelation = await ctx.model.GoodsColor.find(goodsColorParams, { status: 0, color_value: 0 });

        await this.ctx.render('admin/goods/edit', {
            result,
            goodsImage,
            'goodsAttr': goodsAttrStr,
            goodsCate: list,
            goodsColorRelation,
            goodsColor,
            goodsType,
            prevPage: ctx.state.prevPage
        });
    }

    async doEdit() {
        const { app, ctx } = this;
        //金钱和数字正则表达式
        let money = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/,
            num = /^\d+$/,
            where = {},
            uParams = {};

        let params = ctx.request.body,
            id = params.id ? params.id.trim() : '',
            title = params.title ? params.title.trim() : '',
            sub_title = params.sub_title ? params.sub_title.trim() : '',
            cate_id = params.cate_id,
            goods_version = params.goods_version ? params.goods_version.trim() : '',
            goods_sn = params.goods_sn ? params.goods_sn.trim() : '',
            goods_number = params.goods_number ? params.goods_number.trim() : '',
            shop_price = params.shop_price ? params.shop_price.trim() : '',
            market_price = params.market_price ? params.market_price.trim() : '',
            sort = params.sort ? params.sort.trim() : '',
            goods_img = params.goods_img ? params.goods_img : '',
            prevPage = (params.prevPage && !params.prevPage.indexOf('/admin/goods/doEdit')) ? params.prevPage : '/admin/goods',
            goods_content = params.goods_content ? params.goods_content.trim() : '';

        if (id == '') {
            await this.error(prevPage, '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        if (title == '' || sub_title == '' || goods_version == '' || cate_id == '0' || goods_sn == '' || goods_img == '' || shop_price == '' || !money.test(shop_price) || market_price == '' || !money.test(market_price) || sort == '' || !num.test(sort) || goods_number == '' || !num.test(goods_number) || goods_content == '') {
            await this.error(`/admin/goods/edit?id=${params.id}`, '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        params.id = id;
        params.status = params.status ? 1 : 0;
        params.is_best = params.is_best ? 1 : 0;
        params.is_hot = params.is_hot ? 1 : 0;
        params.is_new = params.is_new ? 1 : 0;
        params.goods_color = params.goods_color ? params.goods_color : [];
        params.attr_id_list = params.attr_id_list ? params.attr_id_list : [];
        params.attr_value_list = params.attr_value_list ? params.attr_value_list : [];
        params.goods_image_list = params.goods_image_list ? params.goods_image_list : [];

        where = {
            _id: params.id
        };

        uParams = {
            title,
            sub_title,
            goods_version,
            goods_sn,
            cate_id,
            shop_price,
            market_price,
            click_count: 0,
            goods_number,
            status: params.status,
            sort,
            is_best: params.is_best,
            is_hot: params.is_hot,
            is_new: params.is_new,
            is_del: 0,
            goods_img,
            goods_content,
            goods_color: params.goods_color,
            relation_goods: params.relation_goods.trim().replace('，', ','),
            goods_gift: params.goods_gift.trim().replace('，', ','),
            goods_fitting: params.goods_fitting.trim().replace('，', ','),
            goods_attrs: params.goods_attr.trim().replace('，', ','),
            goods_keywords: params.goods_keywords.trim(),
            goods_desc: params.goods_desc.trim(),
            goods_type_id: params.goods_type_id == '0' ? params.goods_type_id : app.mongoose.Types.ObjectId(params.goods_type_id)
        };

        let goodsImg = (await ctx.model.Goods.findOne(where, { _id: 0, goods_img: 1 })).goods_img;
        let goods = await ctx.model.Goods.updateOne(where, uParams);

        if (goods.ok > 0) {
            if (uParams.goods_img != goodsImg) {
                await ctx.service.tools.deleteFile(goodsImg, true);
            }

            let goodsImageArray = [];
            for (let i = 0; i < params.goods_image_list.length; i++) {
                const item = params.goods_image_list[i];
                goodsImageArray.push(new ctx.model.GoodsImage({
                    goods_id: params.id,
                    img_url: item,
                    color_id: '',
                    status: 1,
                    add_time: await ctx.service.tools.getTime()
                }));
            }

            if (goodsImageArray.length > 0) {
                try {
                    await ctx.model.GoodsImage.insertMany(goodsImageArray);
                } catch (err) {
                    await this.error(`/admin/goods/edit?id=${params.id}`, '编辑商品失败！');
                    return;
                }
            }

            let res = await ctx.model.GoodsAttr.deleteMany({ goods_id: params.id });
            if (res.ok > 0) {

                let goodsAttrArray = [];
                for (let i = 0; i < params.attr_id_list.length; i++) {
                    const item = params.attr_id_list[i];

                    let goodsTypeAttribute = await ctx.model.GoodsTypeAttribute.findOne({ _id: item }, { _id: 0, title: 1, attr_type: 1 });
                    goodsAttrArray.push(new ctx.model.GoodsAttr({
                        goods_id: params.id,
                        cate_id: params.cate_id,
                        attribute_id: item,
                        attribute_type: goodsTypeAttribute.attr_type,
                        attribute_title: goodsTypeAttribute.title,
                        attribute_value: params.attr_value_list[i],
                        status: 1,
                        sort: goodsTypeAttribute.sort,
                        add_time: await ctx.service.tools.getTime()
                    }));
                }

                if (goodsAttrArray.length > 0) {
                    try {
                        await ctx.model.GoodsAttr.insertMany(goodsAttrArray);
                    } catch (err) {
                        await this.error(`/admin/goods/edit?id=${params.id}`, '编辑商品失败！');
                        return;
                    }
                }
            } else {
                await this.error(`/admin/goods/edit?id=${params.id}`, '编辑商品失败！');
                return;
            }

            await ctx.redirect(prevPage);
        } else {
            await this.error(`/admin/goods/edit?id=${params.id}`, '编辑商品失败！');
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

        let goods = await ctx.model.Goods.findOne(where, { goods_img: 1 });
        let result = await ctx.model.Goods.deleteOne(where);
        if (result.deletedCount > 0) {
            await ctx.service.tools.deleteFile(goods.goods_img, true);
            let goodsAttrsDel = await ctx.model.GoodsAttr.deleteMany({ goods_id: id });
            if (goodsAttrsDel.ok > 0) {
                let goodsImages = await ctx.model.GoodsImage.find({ goods_id: id }, { img_url: 1, _id: 0 });
                let goodsImagesDel = await ctx.model.GoodsImage.deleteMany({ goods_id: id });
                if (goodsImagesDel.ok > 0) {
                    for (let i = 0; i < goodsImages.length; i++) {
                        await ctx.service.tools.deleteFile(goodsImages[i].img_url, true);
                    }
                    await ctx.redirect(ctx.state.prevPage);
                } else {
                    await this.error(ctx.state.prevPage, '删除商品失败！');
                }
            } else {
                await this.error(ctx.state.prevPage, '删除商品失败！');
            }
        } else {
            await this.error(ctx.state.prevPage, '删除商品失败！');
        }
    }
}

module.exports = GoodsController;
