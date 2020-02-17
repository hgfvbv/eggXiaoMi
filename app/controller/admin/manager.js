'use strict';

const BaseController = require('./base');

class ManagerController extends BaseController {
    async index() {
        const { ctx } = this;
        let params = ctx.query,
            where = '';

        if (params.username && params.username != '') {
            //模糊查询
            where = params.username;
        };

        let list = await ctx.model.Admin.aggregate([
            {
                $lookup: {
                    from: 'role',
                    localField: 'role_id',
                    foreignField: '_id',
                    as: 'role'
                }
            },
            {
                $match: {
                    $or: [
                        { username: { $regex: where } }
                    ]
                }
            }
        ]);

        await this.ctx.render('admin/manager/index', { params, list });
    }

    async add() {
        const { ctx } = this;

        let list = await ctx.model.Role.find({ 'status': 1 }, { '_id': 1, 'title': 1 });
        await this.ctx.render('admin/manager/add', { list });
    }

    async doAdd() {
        const { ctx } = this;
        let params = ctx.request.body;

        if (params.username == '' || params.password == '' || (params.mobile != '' && !/^1[3456789]\d{9}$/.test(params.mobile)) || (params.email != '' && !/^[A-Za-z0-9]+([_\.][A-Za-z0-9]+)*@([A-Za-z0-9\-]+\.)+[A-Za-z]{2,6}$/.test(params.email))) {
            await this.error('/admin/manager/add', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        let admin = new ctx.model.Admin({
            username: params.username,
            password: await ctx.service.tools.md5(await ctx.service.tools.md5(params.password)),
            mobile: params.mobile,
            email: params.email,
            role_id: params.role_id,
            is_super: params.is_super ? 1 : 0,
            status: params.status ? 1 : 0,
            add_time: await ctx.service.tools.getTime()
        });

        try {
            await admin.save();
            await ctx.redirect('/admin/manager');
        } catch (err) {
            await this.error('/admin/manager/add', '增加商品失败！');
        }
    }

    async edit() {
        const { ctx } = this;
        let params = ctx.query,
            where = {};

        if (params.id == '') {
            await this.error('/admin/role', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        where = {
            _id: params.id
        };

        let list = await ctx.model.Role.find({ 'status': 1 }, { '_id': 1, 'title': 1 }),
            result = await ctx.model.Admin.find(where);

        await this.ctx.render('admin/manager/edit', { list, result: result[0] });
    }

    async doEdit() {
        const { ctx } = this;
        let params = ctx.request.body,
            where = {},
            uParams = {};

        if (params.username == '' || (params.mobile != '' && !/^1[3456789]\d{9}$/.test(params.mobile)) || (params.email != '' && !/^[A-Za-z0-9]+([_\.][A-Za-z0-9]+)*@([A-Za-z0-9\-]+\.)+[A-Za-z]{2,6}$/.test(params.email))) {
            await this.error(`/admin/manager/edit?id=${params.id}`, '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        where = {
            _id: params.id
        };

        if (params.password == '') {
            uParams = {
                username: params.username,
                mobile: params.mobile,
                email: params.email,
                role_id: params.role_id,
                is_super: params.is_super ? 1 : 0,
                status: params.status ? 1 : 0
            };
        } else {
            uParams = {
                username: params.username,
                password: await ctx.service.tools.md5(await ctx.service.tools.md5(params.password)),
                mobile: params.mobile,
                email: params.email,
                role_id: params.role_id,
                is_super: params.is_super ? 1 : 0,
                status: params.status ? 1 : 0
            };
        }

        let admin = await ctx.model.Admin.updateOne(where, uParams);

        if (admin.nModified > 0) {
            await ctx.redirect('/admin/manager');
        } else {
            await this.error(`/admin/manager/edit?id=${params.id}`, '编辑管理员失败！');
        }
    }
}

module.exports = ManagerController;
