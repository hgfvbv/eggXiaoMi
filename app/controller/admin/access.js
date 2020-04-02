'use strict';

const BaseController = require('./base');

class AccessController extends BaseController {
    async index() {
        const { ctx, config } = this;

        let params = ctx.query,
            module_name = params.module_name ? params.module_name.trim() : '',
            page = params.page ? params.page : 1,
            pageSize = config.accessPageSize ? config.accessPageSize : 2,
            where = '';

        if (module_name && module_name != '') {
            //模糊查询
            where = module_name;
        };

        let totalCount = await ctx.model.Access.find({
            $and: [
                { module_name: { $regex: where } },
                { module_id: '0' }
            ]
        }).count();
        let pageCount = Math.ceil(totalCount / pageSize);

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
                        { module_name: { $regex: where } },
                        { module_id: '0' }
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
        await this.ctx.render('/admin/access/index', { params, list, await: config.await, page, pageCount });
    }

    async add() {
        let list = await this.ctx.model.Access.find({ module_id: '0', status: 1 }, { _id: 1, module_name: 1 }).sort({ sort: 1 });
        await this.ctx.render('/admin/access/add', { list });
    }

    async doAdd() {
        const { ctx, app, config } = this;
        let params = ctx.request.body,
            module_name = params.module_name ? params.module_name.trim() : '',
            action_name = params.action_name ? params.action_name.trim() : '',
            url = params.url ? params.url.trim() : '',
            module_id = params.module_id ? params.module_id.trim() : '',
            sort = params.sort ? params.sort.trim() : '',
            description = params.description ? params.description.trim() : '';

        if (module_name != config.awaitTxt) {
            if (params.type == 1) {
                if (module_name == '' || sort == '' || !(/^\d+$/.test(sort))) {
                    await this.error('/admin/access/add', '对不起！服务器繁忙！要不稍后再试试？');
                    return;
                }
                module_id = '0';
            } else {
                if (module_name == '' || action_name == '' || url == '' || sort == '' || !(/^\d+$/.test(sort))) {
                    await this.error('/admin/access/add', '对不起！服务器繁忙！要不稍后再试试？');
                    return;
                }
            }
        } else {
            await this.error('/admin/access/add', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        let access = new ctx.model.Access({
            module_name,
            type: params.type,
            action_name,
            url,
            module_id: module_id == '0' ? module_id : app.mongoose.Types.ObjectId(module_id),
            sort,
            description,
            status: params.status ? 1 : 0,
            add_time: await ctx.service.tools.getTime()
        });

        try {
            access = await access.save();
            if (module_name == config.awaitTxt) {
                config.await = access._id.toString();
            }
            await ctx.redirect('/admin/access');
        } catch (err) {
            await this.error('/admin/access/add', '增加权限失败！');
        }
    }

    async edit() {
        const { ctx, config } = this;
        let params = ctx.query,
            id = params.id ? params.id.trim() : '',
            page=params.page?params.page:1,
            where = {};

        if (id == '') {
            await this.error('/admin/access', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }
console.log(page)
        where = {
            _id: id
        };

        let result = await ctx.model.Access.find(where);
        let list = await this.ctx.model.Access.find({ module_id: '0', status: 1 }, { _id: 1, module_name: 1 }).sort({ sort: 1 });
        await this.ctx.render('/admin/access/edit', { result: result[0], list, await: config.await });
    }

    async doEdit() {
        const { ctx, app, config } = this;
        let params = ctx.request.body,
            id = params.id ? params.id.trim() : '',
            module_name = params.module_name ? params.module_name.trim() : '',
            type = params.type ? params.type.trim() : 1,
            action_name = params.action_name ? params.action_name.trim() : '',
            url = params.url ? params.url.trim() : '',
            module_id = params.module_id ? params.module_id.trim() : '',
            sort = params.sort ? params.sort.trim() : '',
            description = params.description ? params.description.trim() : '',
            where = {},
            uParams = {};

        if (id == '') {
            await this.error('/admin/access', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        if (module_name != config.awaitTxt) {
            if (type == 1) {
                if (id == config.await || module_name == '' || sort == '' || !(/^\d+$/.test(sort))) {
                    await this.error(`/admin/access/edit?id=${id}`, '对不起！服务器繁忙！要不稍后再试试？');
                    return;
                }
                module_id = '0';
            } else {
                if (id == config.await || module_name == '' || action_name == '' || url == '' || sort == '' || !(/^\d+$/.test(sort))) {
                    await this.error(`/admin/access/edit?id=${id}`, '对不起！服务器繁忙！要不稍后再试试？');
                    return;
                }
            }
        } else {
            await this.error(`/admin/access/edit?id=${id}`, '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        where = {
            _id: id
        };

        uParams = {
            module_name,
            type,
            action_name,
            url,
            module_id: module_id == '0' ? module_id : app.mongoose.Types.ObjectId(module_id),
            sort,
            description,
            status: params.status ? 1 : 0,
            add_time: await ctx.service.tools.getTime()
        };

        let access = await ctx.model.Access.updateOne(where, uParams);

        if (access.nModified > 0) {
            if (uParams.type == 1 && uParams.status == 0) {
                let childIds = await ctx.model.Access.find({ module_id: app.mongoose.Types.ObjectId(id) }, { _id: 1 }),
                    uResult = await ctx.model.Access.updateMany({ module_id: app.mongoose.Types.ObjectId(id) }, { module_id: app.mongoose.Types.ObjectId(config.await) });
                if (uResult.ok > 0) {
                    //删除所有角色该顶级模块权限
                    let roleAccessPResult = await ctx.model.RoleAccess.deleteMany({ access_id: id, role_id: { $nin: [config.isuper] } }),
                        isSuccess = roleAccessPResult.ok > 0;

                    if (isSuccess) {
                        //删除所有角色该权限
                        for (let i = 0; i < childIds.length; i++) {
                            let roleAccessResult = await ctx.model.RoleAccess.deleteMany({ access_id: childIds[i]._id, role_id: { $nin: [config.isuper] } });
                            if (roleAccessResult.ok <= 0) {
                                isSuccess = false;
                            }
                        }
                        if (isSuccess) {
                            await ctx.redirect('/admin/access');
                        } else {
                            await this.error(`/admin/access/edit?id=${id}`, '编辑权限失败！');
                        }
                    } else {
                        await this.error(`/admin/access/edit?id=${id}`, '编辑权限失败！');
                    }
                } else {
                    await this.error(`/admin/access/edit?id=${id}`, '编辑权限失败！');
                }
            } else {
                if (uParams.status == 0) {
                    let dResult = await ctx.model.RoleAccess.deleteMany({ access_id: id, role_id: { $nin: [config.isuper] } });
                    if (dResult.ok > 0) {
                        await ctx.redirect('/admin/access');
                    } else {
                        await this.error(`/admin/access/edit?id=${id}`, '编辑权限失败！');
                    }
                } else {
                    await ctx.redirect('/admin/access');
                }
            }
        } else {
            await this.error(`/admin/access/edit?id=${id}`, '编辑权限失败！');
        }
    }

    async changeStatus() {
        const { ctx, config, app } = this;
        let params = ctx.request.body,
            id = params.id ? params.id.trim() : '',
            type = params.type ? params.type.trim() : 1,
            where = {};

        if (id == '' || id == config.await) {
            ctx.body = { 'message': '对不起！服务器繁忙！要不稍后再试试？', 'success': false };
            return;
        }

        where = {
            _id: id
        };

        let result = await ctx.model.Access.findOne(where);
        if (result) {
            let uParams = result.status == 0 ? { status: 1, type } : { status: 0, type };

            let access = await ctx.model.Access.updateOne(where, uParams);

            if (access.nModified > 0) {
                if (uParams.type == 1 && uParams.status == 0) {
                    let childIds = await ctx.model.Access.find({ module_id: app.mongoose.Types.ObjectId(id) }, { _id: 1 }),
                        uResult = await ctx.model.Access.updateMany({ module_id: app.mongoose.Types.ObjectId(id) }, { module_id: app.mongoose.Types.ObjectId(config.await) });
                    if (uResult.ok > 0) {
                        //删除所有角色该顶级模块权限
                        let roleAccessPResult = await ctx.model.RoleAccess.deleteMany({ access_id: id, role_id: { $nin: [config.isuper] } }),
                            isSuccess = roleAccessPResult.ok > 0;

                        if (isSuccess) {
                            //删除所有角色该权限
                            for (let i = 0; i < childIds.length; i++) {
                                let roleAccessResult = await ctx.model.RoleAccess.deleteMany({ access_id: childIds[i]._id, role_id: { $nin: [config.isuper] } });
                                if (roleAccessResult.ok <= 0) {
                                    isSuccess = false;
                                }
                            }
                            if (isSuccess) {
                                ctx.body = { 'message': '更新成功', 'success': true };
                            } else {
                                ctx.body = { 'message': '更新失败', 'success': false };
                            }
                        } else {
                            ctx.body = { 'message': '更新失败', 'success': false };
                        }
                    } else {
                        ctx.body = { 'message': '更新失败', 'success': false };
                    }
                } else {
                    if (uParams.status == 0) {
                        let dResult = await ctx.model.RoleAccess.deleteMany({ access_id: id, role_id: { $nin: [config.isuper] } });
                        if (dResult.ok > 0) {
                            ctx.body = { 'message': '更新成功', 'success': true };
                        } else {
                            ctx.body = { 'message': '更新失败', 'success': false };
                        }
                    } else {
                        ctx.body = { 'message': '更新成功', 'success': true };
                    }
                }
            } else {
                ctx.body = { 'message': '更新失败', 'success': false };
            }
        } else {
            ctx.body = { 'message': '更新失败，参数错误', 'success': false };
        }
    }

    async delete() {
        const { ctx, app, config } = this;
        let params = ctx.query,
            id = params.id ? params.id.trim() : '',
            where = {};

        if (id == '' || id == config.await) {
            await this.error('/admin/access', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        where = {
            _id: id
        };

        let access = await ctx.model.Access.find(where),
            result = await ctx.model.Access.deleteOne(where);
        if (result.deletedCount > 0) {
            if (access[0].type == 1) {
                //删除所有角色该顶级模块权限
                let childIds = await ctx.model.Access.find({ module_id: app.mongoose.Types.ObjectId(id) }, { _id: 1 }),
                    roleAccessPResult = await ctx.model.RoleAccess.deleteMany({ access_id: id, role_id: { $nin: [config.isuper] } }),
                    isSuccess = roleAccessPResult.ok > 0;

                if (isSuccess) {
                    //删除所有角色该权限
                    for (let i = 0; i < childIds.length; i++) {
                        let roleAccessResult = await ctx.model.RoleAccess.deleteMany({ access_id: childIds[i]._id, role_id: { $nin: [config.isuper] } });
                        if (roleAccessResult.ok <= 0) {
                            isSuccess = false;
                        }
                    }
                    if (isSuccess) {
                        //删除子模块
                        let dResult = await ctx.model.Access.deleteMany({ module_id: app.mongoose.Types.ObjectId(id) });
                        if (dResult.ok > 0) {
                            await ctx.redirect('/admin/access');
                        } else {
                            await this.error(`/admin/access/edit?id=${id}`, '删除模块失败！');
                        }
                    } else {
                        await this.error(`/admin/access/edit?id=${id}`, '删除模块失败！');
                    }
                } else {
                    await this.error(`/admin/access/edit?id=${id}`, '删除模块失败！');
                }
            } else {
                //删除被删模块所在中间表的数据
                let roleAccessResult = await ctx.model.RoleAccess.deleteMany({ access_id: id, role_id: { $nin: [config.isuper] } });
                if (roleAccessResult.ok > 0) {
                    await ctx.redirect('/admin/access');
                } else {
                    await this.error(ctx.state.prevPage, '删除模块失败！');
                }
            }
        } else {
            await this.error(ctx.state.prevPage, '删除模块失败！');
        }
    }
}

module.exports = AccessController;
