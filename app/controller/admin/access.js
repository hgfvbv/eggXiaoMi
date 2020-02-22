'use strict';

const BaseController = require('./base');

class AccessController extends BaseController {
    async index() {
        const { ctx } = this;
        let params = ctx.query,
            module_name = params.module_name ? params.module_name.trim() : '',
            where = '';

        if (module_name && module_name != '') {
            //模糊查询
            where = module_name;
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
                        { module_name: { $regex: where } },
                        { module_id: '0' }
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
        await this.ctx.render('admin/access/index', { params, list });
    }

    async add() {
        let list = await this.ctx.model.Access.find({ module_id: '0', status: 1 }, { _id: 1, module_name: 1 });
        await this.ctx.render('admin/access/add', { list });
    }

    async doAdd() {
        const { ctx, app } = this;
        let params = ctx.request.body,
            module_name = params.module_name ? params.module_name.trim() : '',
            action_name = params.action_name ? params.action_name.trim() : '',
            url = params.url ? params.url.trim() : '',
            module_id = params.module_id ? params.module_id.trim() : '',
            sort = params.sort ? params.sort.trim() : '',
            description = params.description ? params.description.trim() : '';

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
            await access.save();
            await ctx.redirect('/admin/access');
        } catch (err) {
            await this.error('/admin/access/add', '增加权限失败！');
        }
    }

    async edit() {
        const { ctx } = this;
        let params = ctx.query,
            id = params.id ? params.id.trim() : '',
            where = {};

        if (id == '') {
            await this.error('/admin/access', '对不起！服务器繁忙！要不稍后再试试？');
            return;
        }

        where = {
            _id: id
        };

        let result = await ctx.model.Access.find(where);
        let list = await this.ctx.model.Access.find({ module_id: '0', status: 1 }, { _id: 1, module_name: 1 });
        await this.ctx.render('admin/access/edit', { result: result[0], list });
    }

    async doEdit() {
        const { ctx, app } = this;
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

        if (type == 1) {
            if (id == '' || id == '5e50e212368c3a24b0c12605' || module_name == '' || sort == '' || !(/^\d+$/.test(sort))) {
                await this.error(`/admin/access/edit?id=${id}`, '对不起！服务器繁忙！要不稍后再试试？');
                return;
            }
            module_id = '0';
        } else {
            if (id == '' || id == '5e50e212368c3a24b0c12605' || module_name == '' || action_name == '' || url == '' || sort == '' || !(/^\d+$/.test(sort))) {
                await this.error(`/admin/access/edit?id=${id}`, '对不起！服务器繁忙！要不稍后再试试？');
                return;
            }
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
                let uResult = await ctx.model.Access.updateMany({ module_id: app.mongoose.Types.ObjectId(id) }, { module_id: app.mongoose.Types.ObjectId('5e50e212368c3a24b0c12605') });
                if (uResult.ok > 0) {
                    await ctx.redirect('/admin/access');
                } else {
                    await this.error(`/admin/access/edit?id=${id}`, '编辑权限失败！');
                }
            } else {
                await ctx.redirect('/admin/access');
            }
        } else {
            await this.error(`/admin/access/edit?id=${id}`, '编辑权限失败！');
        }
    }

    async delete() {
        const { ctx, app } = this;
        let params = ctx.query,
            id = params.id ? params.id.trim() : '',
            where = {};

        if (id == '' || id == '5e50e212368c3a24b0c12605') {
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
                let dResult = await ctx.model.Access.deleteMany({ module_id: app.mongoose.Types.ObjectId(id) });
                if (dResult.ok > 0) {
                    await ctx.redirect('/admin/access');
                } else {
                    await this.error(`/admin/access/edit?id=${id}`, '删除模块失败！');
                }
            } else {
                await ctx.redirect('/admin/access');
            }
        } else {
            await this.error(ctx.state.prevPage, '删除模块失败！');
        }
    }
}

module.exports = AccessController;
