'use strict';

const BaseController = require('./base');

class RoleController extends BaseController {
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

        let list = await ctx.model.Role.find(where);
        await ctx.render('admin/role/index', { params, list });
    }

    async add() {
        await this.ctx.render('admin/role/add');
    }

    async doAdd() {
        const { ctx } = this;
        let params = ctx.request.body,
            title = params.title ? params.title.trim() : '',
            description = params.description ? params.description.trim() : '';

        if (title == '') {
            await this.error('/admin/role/add', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        let role = new ctx.model.Role({
            title,
            description,
            status: params.status ? 1 : 0,
            add_time: await ctx.service.tools.getTime()
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
            id = params.id ? params.id.trim() : '',
            where = {};

        if (id == '') {
            await this.error('/admin/role', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        where = {
            _id: id
        };

        let result = await ctx.model.Role.find(where);
        await this.ctx.render('admin/role/edit', { result: result[0] });
    }

    async doEdit() {
        const { ctx } = this;
        let params = ctx.request.body,
            id = params.id ? params.id.trim() : '',
            title = params.title ? params.title.trim() : '',
            description = params.description ? params.description.trim() : '',
            where = {},
            uParams = {};

        if (id == '' || id == '5e4cdb709ddce035b8ce650e' || title == '') {
            await this.error(`/admin/role/edit?id=${id}`, '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        where = {
            _id: id
        };

        uParams = {
            title: title,
            description: description,
            status: params.status ? 1 : 0,
            edit_time: await ctx.service.tools.getTime()
        };

        let role = await ctx.model.Role.updateOne(where, uParams);

        if (role.nModified > 0) {
            if (uParams.status == 0) {
                let uResult = await ctx.model.Admin.updateMany({ role_id: id }, { role_id: '5e4cdb709ddce035b8ce650e' });
                if (uResult.ok > 0) {
                    await ctx.redirect('/admin/role');
                } else {
                    await this.error(`/admin/role/edit?id=${id}`, '编辑角色失败！');
                }
            } else {
                await ctx.redirect('/admin/role');
            }
        } else {
            await this.error(`/admin/role/edit?id=${id}`, '编辑角色失败！');
        }
    }

    async delete() {
        const { ctx } = this;
        let params = ctx.query,
            id = params.id ? params.id.trim() : '',
            where = {};

        if (id == '' || id == '5e4cdb709ddce035b8ce650e') {
            await this.error('/admin/role', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        where = {
            _id: id
        };

        let result = await ctx.model.Role.deleteOne(where);
        if (result.deletedCount > 0) {
            let uResult = await ctx.model.Admin.updateMany({ role_id: id }, { role_id: '5e4cdb709ddce035b8ce650e' });
            if (uResult.ok > 0) {
                //删除该角色所有权限
                let roleAccessResult = await ctx.model.RoleAccess.deleteMany({ role_id: id });
                if (roleAccessResult.deletedCount > 0) {
                    await ctx.redirect(ctx.state.prevPage);
                } else {
                    await this.error(ctx.state.prevPage, '删除角色失败！');
                }
            } else {
                await this.error(ctx.state.prevPage, '删除角色失败！');
            }
        } else {
            await this.error(ctx.state.prevPage, '删除角色失败！');
        }
    }

    async auth() {
        const { ctx, app } = this;
        let params = ctx.query,
            id = params.id ? params.id.trim() : '',
            roleAccessArray = [],
            where = {};

        if (id == '' || id == '5e4cdb709ddce035b8ce650e') {
            await this.error('/admin/role', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        where = {
            role_id: id
        };

        let list = await ctx.model.Access.aggregate([
            {
                $lookup: {
                    from: 'access',
                    localField: '_id',
                    foreignField: 'module_id',
                    as: 'child'
                }
            },
            {
                $match: {
                    $and: [
                        { status: 1 },
                        { module_id: '0' },
                        { _id: { $nin: [app.mongoose.Types.ObjectId('5e50e212368c3a24b0c12605')] } }
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
            //移除失效的子模块
            list[i].child = list[i].child.filter((e => { return e.status == 1 }));
            //子模块排序
            list[i].child = await ctx.service.tools.jsonSort(list[i].child, 'sort', false);
        }

        let result = await ctx.model.RoleAccess.find(where);
        result.forEach((val) => {
            roleAccessArray.push(val.access_id.toString());
        });

        for (let i = 0; i < list.length; i++) {
            if (roleAccessArray.indexOf(list[i]._id.toString()) != -1) {
                list[i].checked = true;
            }
            for (let j = 0; j < list[i].child.length; j++) {
                if (roleAccessArray.indexOf(list[i].child[j]._id.toString()) != -1) {
                    list[i].child[j].checked = true;
                }
            }
        }

        await this.ctx.render(`/admin/role/auth`, { list, id });
    }

    async doAuth() {
        const { ctx } = this;
        let params = ctx.request.body,
            id = params.id ? params.id.trim() : '',
            access_node = params.access_node ? params.access_node : [],
            where = {};

        if (id == '' || id == '5e4cdb709ddce035b8ce650e') {
            await this.error(`/admin/role/auth?id=${id}`, '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        where = {
            role_id: id
        };

        let result = await ctx.model.RoleAccess.deleteMany(where),
            isSuccess = true;

        if (result.ok > 0) {
            for (let i = 0; i < access_node.length; i++) {
                let roleAccess = new ctx.model.RoleAccess({
                    role_id: id,
                    access_id: access_node[i]
                });
                try {
                    await roleAccess.save();
                } catch (err) {
                    isSuccess = false;
                    await this.error(`/admin/role/auth?id=${id}`, '角色授权失败！');
                }
            }
            if (isSuccess) {
                ctx.redirect(`/admin/role/auth?id=${id}`);
            }
        } else {
            await this.error(`/admin/role/auth?id=${id}`, '角色授权失败！');
        }
    }
}

module.exports = RoleController;
