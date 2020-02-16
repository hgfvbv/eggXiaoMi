'use strict';

const BaseController = require('./base');

class RoleController extends BaseController {
    async index() {
        const { ctx } = this;
        let params = ctx.query,
            where = {};

        if (params.title && params.title != '') {
            //模糊查询
            where = {
                $or: [
                    { title: { $regex: params.title } }
                ]
            };
        };

        let list = await ctx.model.Role.find(where);
        await ctx.render('admin/role/index', { params, list });
    }

    async add() {
        await this.ctx.render('admin/role/add');
    }

    async doAdd() {
        const { ctx } = this;
        let params = ctx.request.body;

        if (params.title == '') {
            await this.error('/admin/role/add', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        let role = new ctx.model.Role({
            title: params.title,
            description: params.description,
            status: params.status ? 1 : 0
        });
        try {
            await role.save();
            await ctx.redirect('/admin/role');
        } catch (err) {
            await this.error('/admin/role/add', '增加角色失败！');
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

        let result = await ctx.model.Role.find(where);
        await this.ctx.render('admin/role/edit', { result: result[0] });
    }

    async doEdit() {
        const { ctx } = this;
        let params = ctx.request.body,
            where = {},
            uParams = {};

        if (params.id == '' || params.title == '') {
            await this.error(`/admin/role/edit?id=${params.id}`, '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        where = {
            _id: params.id
        };

        uParams = {
            title: params.title,
            description: params.description,
            status: params.status ? 1 : 0,
            edit_time: await ctx.service.tools.getTime()
        };

        let role = await ctx.model.Role.updateOne(where, uParams);

        if (role.nModified > 0) {
            await ctx.redirect('/admin/role');
        } else {
            await this.error('/admin/role/add', '编辑角色失败！');
        }
    }
}

module.exports = RoleController;
