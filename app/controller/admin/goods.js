'use strict';

const BaseController = require('./base'),
    fs = require('fs'),
    path = require('path'),
    pump = require('mz-modules/pump'),
    _ = require('lodash');

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

        let list = await ctx.model.Goods.find(where).sort({ sort: 1 });
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
                service.tools.jimpImg(dir.uploadDir, 100, [{ width: 64, height: 64 }, { width: 100, height: 100 }, { width: 200, height: 200 }, { width: 400, height: 400 }]);

                files = Object.assign({ [fieldname]: dir.saveDir });
            }
        }

        ctx.body = { link: files.file };
    }

    //上传商品图片
    async goodsUploadImg() {
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
        const { app, ctx, config } = this;
        //金钱和数字正则表达式
        let money = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/,
            num = /^\d+$/;

        let params = ctx.request.body,
            jimpImgSizes = config.jimpImgSizes,
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

            console.log(params)

            /*
            {
                _csrf: 'HeYIYG2A-M2-uIwRBERoL5C3d9nMSJQFCSb8',
                title: '',
                sub_title: '',
                goods_version: '',
                goods_sn: '',
                goods_number: '',
                cate_id: '5bbf058f9079450a903cb77b',
                shop_price: '',
                market_price: '',
                sort: '0',
                file: [ '', '' ],
                goods_content: '',
                relation_goods: '',
                goods_gift: '',
                goods_fitting: '',
                goods_attr: '',
                goods_keywords: '',
                goods_desc: '',
                goods_type_id: '0'
            }
            */

            if (goods_img != '') {
                for (let i = 0; i < jimpImgSizes.length + 1; i++) {
                    let fileName = '';
                    if (i == jimpImgSizes.length) {
                        fileName = goods_img;
                    } else {
                        fileName = `${goods_img}_${jimpImgSizes[i].width}x${jimpImgSizes[i].height}${path.extname(goods_img)}`;
                    }

                    fs.unlink(`${config.uploadDir.substr(0, this.config.uploadDir.indexOf('/') + 1)}${fileName}`, function (error) {
                        if (error) {
                            console.log(error);
                            return false;
                        }
                        console.log('删除文件成功');
                    });
                }
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
            relation_goods: params.relation_goods,
            goods_gift: params.goods_gift,
            goods_fitting: params.goods_fitting,
            goods_attrs: params.goods_attr,
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
                await ctx.model.GoodsImage.insertMany(goodsImageArray);
            }

            let goodsAttrArray = [];
            if (params.attr_value_list) {
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
                        add_time: goods.add_time
                    }));
                }
            }

            if (goodsAttrArray.length > 0) {
                await ctx.model.GoodsAttr.insertMany(goodsAttrArray);
            }

            await ctx.redirect('/admin/goods');
        } catch (err) {
            console.log(err)
            await this.error('/admin/goods/add', '增加商品失败！');
        }

        console.log(params)
        console.log(goods)

        /*
            {
                _csrf: 'nl3hxawh-AvX9eheb9CP4ovlqO5yfy0G3Q24',
                title: '1',
                sub_title: '2',
                goods_version: '3',
                goods_sn: '4',
                goods_number: '5',
                cate_id: '5be92dd19567312f28240bed',
                shop_price: '6',
                market_price: '7',
                sort: '8',
                file: [ '', '' ],
                goods_img: '/public/admin/upload/goods/20200328/1585388278250.jpg',
                goods_content: '<p>9</p>',
                goods_color: [ '5bbb68dcfe498e2346af9e4a', '5bbb68effe498e2346af9e4b' ],
                relation_goods: '10',
                goods_gift: '11',
                goods_fitting: '12',
                goods_attr: '13',
                goods_keywords: '14',
                goods_desc: '15',
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
                attr_value_list: [ '16', '17', '是\r\n', '18', '19', '20', '21' ],
                goods_image_list: [
                    '/public/admin/upload/goodsContentPhoto/20200328/1585388313319.jpg',
                    '/public/admin/upload/goodsContentPhoto/20200328/1585388313371.jpg'
                ],
                status: 0,
                is_best: 0,
                is_hot: 0,
                is_new: 0
            }

            {
                title: '1',
                sub_title: '2',
                goods_sn: '4',
                click_count: 0,
                goods_number: 5,
                shop_price: 6,
                market_price: 7,
                relation_goods: '10',
                goods_attrs: '13',
                goods_version: '3',
                goods_img: '/public/admin/upload/goods/20200328/1585388278250.jpg',
                goods_gift: '11',
                goods_fitting: '12',
                goods_color: [ '5bbb68dcfe498e2346af9e4a', '5bbb68effe498e2346af9e4b' ],
                goods_keywords: '14',
                goods_desc: '15',
                goods_content: '<p>9</p>',
                sort: 8,
                is_del: 0,
                is_hot: 0,
                is_best: 0,
                is_new: 0,
                status: 0,
                _id: 5e7f1b1c76a21442dc557190,
                cate_id: 5be92dd19567312f28240bed,
                goods_type_id: 5baf319abee4cc26e47833de,
                add_time: 1585388316283
            }
        */
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
            list[i].child = await ctx.service.tools.jsonSort(list[i].child, 'sort', false);
        }

        let result = await ctx.model.Goods.findOne(where);
        let goodsImage = await ctx.model.GoodsImage.find({ goods_id: result._id }, { img_url: 1 });
        let goodsAttrStr = '',
            goodsAttr = await ctx.model.GoodsAttr.find({ goods_id: result._id });

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

        await this.ctx.render('admin/goods/edit', { result, goodsImage, 'goodsAttr': goodsAttrStr, goodsCate: list, goodsColor, goodsType });
    }

    async doEdit() {
        const { app, ctx, config } = this;
        //金钱和数字正则表达式
        let money = /(^[1-9]([0-9]+)?(\.[0-9]{1,2})?$)|(^(0){1}$)|(^[0-9]\.[0-9]([0-9])?$)/,
            num = /^\d+$/,
            where = {},
            uParams = {};

        /*
            {
                _csrf: '2bmkfZpm-7obkp4wsW1Qi815wqupIR9ORxrQ',
                id: '5e81a1ed062bc7008c20f34f',
                title: '1',
                sub_title: '2',
                goods_version: '3',
                goods_sn: '4',
                goods_number: '5',
                cate_id: '5be8fdfd9567312f28240be3',
                shop_price: '6',
                market_price: '7',
                sort: '8',
                file: [ '', '' ],
                goods_img: '/public/admin/upload/goods/20200330/1585553846839.jpg',
                goods_content: '<p>9<img src="/public/admin/upload/goodsContentImage/20200330/1585553857377.jpg" style="width: 300px;" class="fr-fic fr-dib"></p>',
                goods_color: [ '5bc067d92e5f889dc864aa96', '5c00baf55c5f7907da223bd9' ],
                relation_goods: '10',
                goods_gift: '11',
                goods_fitting: '12',
                goods_attr: '13',
                goods_keywords: '14',
                goods_desc: '15',
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
                attr_value_list: [ '16', '17', '是\r\n', '18', '19', '20', '21' ],
                color_id: [ '0', '0' ],
                isDelGoodsImage: [ '5e81a1ed062bc7008c20f350', '5e81a1ed062bc7008c20f351' ]
            }
                */
        let params = ctx.request.body,
            id = params.id ? params.id.trim() : '',
            jimpImgSizes = config.jimpImgSizes,
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

        if (id == '') {
            await this.error('/admin/goods', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        if (title == '' || sub_title == '' || goods_version == '' || goods_sn == '' || goods_img == '' || shop_price == '' || !money.test(shop_price) || market_price == '' || !money.test(market_price) || sort == '' || !num.test(sort) || goods_number == '' || !num.test(goods_number) || goods_content == '') {

            console.log(params)

            if (goods_img != '') {
                for (let i = 0; i < jimpImgSizes.length + 1; i++) {
                    let fileName = '';
                    if (i == jimpImgSizes.length) {
                        fileName = goods_img;
                    } else {
                        fileName = `${goods_img}_${jimpImgSizes[i].width}x${jimpImgSizes[i].height}${path.extname(goods_img)}`;
                    }

                    fs.unlink(`${config.uploadDir.substr(0, this.config.uploadDir.indexOf('/') + 1)}${fileName}`, function (error) {
                        if (error) {
                            console.log(error);
                            return false;
                        }
                        console.log('删除文件成功');
                    });
                }
            }

            await this.error('/admin/goods/add', '对不起！服务器繁忙！要不稍后再试试？');
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
        params.isDelGoodsImage = params.isDelGoodsImage ? params.isDelGoodsImage : [];
        params.color_id = params.color_id ? params.color_id : [];

        where = {
            _id: params.id
        };

        uParams = {
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
            relation_goods: params.relation_goods,
            goods_gift: params.goods_gift,
            goods_fitting: params.goods_fitting,
            goods_attrs: params.goods_attr,
            goods_keywords: params.goods_keywords,
            goods_desc: params.goods_desc,
            goods_type_id: params.goods_type_id == '0' ? params.goods_type_id : app.mongoose.Types.ObjectId(params.goods_type_id)
        };

        let goods = await ctx.model.Goods.updateOne(where, uParams);

        if (goods.ok > 0) {
            if (params.isDelGoodsImage.length > 0) {
                await ctx.model.GoodsImage.deleteMany({ _id: params.isDelGoodsImage });
            }

            let goodsImageArray = [];
            _.forEach(params.goods_image_list, async (item, i) => {
                goodsImageArray.push(new ctx.model.GoodsImage({
                    goods_id: params._id,
                    img_url: item,
                    color_id: '',
                    status: 1,
                    add_time: await ctx.service.tools.getTime()
                }));
            });

            if (goodsImageArray.length > 0) {
                await ctx.model.GoodsImage.insertMany(goodsImageArray);
            }

            await ctx.model.GoodsAttr.deleteMany({ goods_id: params._id });
            let goodsAttrArray = [];
            if (params.attr_value_list) {
                for (let i = 0; i < params.attr_id_list.length; i++) {
                    const item = params.attr_id_list[i];

                    let goodsTypeAttribute = await ctx.model.GoodsTypeAttribute.findOne({ _id: item }, { _id: 0, title: 1, attr_type: 1 });
                    goodsAttrArray.push(new ctx.model.GoodsAttr({
                        goods_id: params._id,
                        cate_id: params.cate_id,
                        attribute_id: item,
                        attribute_type: goodsTypeAttribute.attr_type,
                        attribute_title: goodsTypeAttribute.title,
                        attribute_value: params.attr_value_list[i],
                        status: 1,
                        add_time: await ctx.service.tools.getTime()
                    }));
                }
            }

            if (goodsAttrArray.length > 0) {
                await ctx.model.GoodsAttr.insertMany(goodsAttrArray);
            }

            await ctx.redirect('/admin/goods');
        } else {
            await this.error(`/admin/goods/edit?id=${params.id}`, '编辑商品失败！');
        }

        // try {
        //     goods = await goods.save();

        //     let goodsImageArray = [];
        //     _.forEach(params.goods_image_list, (item, i) => {
        //         goodsImageArray.push(new ctx.model.GoodsImage({
        //             goods_id: goods._id,
        //             img_url: item,
        //             color_id: '',
        //             status: 1,
        //             add_time: goods.add_time
        //         }));
        //     });

        //     if (goodsImageArray.length > 0) {
        //         await ctx.model.GoodsImage.insertMany(goodsImageArray);
        //     }

        //     let goodsAttrArray = [];
        //     if (params.attr_value_list) {
        //         for (let i = 0; i < params.attr_id_list.length; i++) {
        //             const item = params.attr_id_list[i];

        //             let goodsTypeAttribute = await ctx.model.GoodsTypeAttribute.findOne({ _id: item }, { _id: 0, title: 1, attr_type: 1 });
        //             goodsAttrArray.push(new ctx.model.GoodsAttr({
        //                 goods_id: goods._id,
        //                 cate_id: goods.cate_id,
        //                 attribute_id: item,
        //                 attribute_type: goodsTypeAttribute.attr_type,
        //                 attribute_title: goodsTypeAttribute.title,
        //                 attribute_value: params.attr_value_list[i],
        //                 status: 1,
        //                 add_time: goods.add_time
        //             }));
        //         }
        //     }

        //     if (goodsAttrArray.length > 0) {
        //         await ctx.model.GoodsAttr.insertMany(goodsAttrArray);
        //     }

        //     await ctx.redirect('/admin/goods');
        // } catch (err) {
        //     console.log(err)
        //     await this.error('/admin/goods/add', '增加商品失败！');
        // }

        // console.log(params)
        // console.log(goods)
    }
}

module.exports = GoodsController;
