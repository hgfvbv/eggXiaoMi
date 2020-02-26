'use strict';

const Service = require('egg').Service,
    url = require('url');

class AdminService extends Service {
    async checkAuth() {
        const { ctx, config } = this;
        let userinfo = ctx.session.userinfo,
            role_id = userinfo.role_id,
            isSuper = userinfo.is_super,
            isSuccess = false,
            pathName = url.parse(ctx.request.url).pathname;

        if (config.accessFilter.indexOf(pathName) != -1 || isSuper == 1) {
            return true;
        }

        let roleAccess = [],
            access = await ctx.model.Access.findOne({ url: pathName }),
            roleAccessResult = await ctx.model.RoleAccess.find({ role_id }, { access_id: 1 }),
            checkId = access ? access._id.toString() : '';

        roleAccessResult.forEach(val => {
            roleAccess.push(val.access_id.toString());
        });

        if (roleAccess.indexOf(checkId) != -1) {
            isSuccess = true;
        } else {
            isSuccess = false;
        }

        return isSuccess;
    }

    async getAuthList() {
        const { ctx, config, app } = this;
        let userinfo = ctx.session.userinfo,
            role_id = userinfo.role_id,
            access = await ctx.model.Access.aggregate([
                {
                    $match: {
                        $and: [
                            { status: 1 },
                            { module_id: '0' },
                            { _id: { $nin: [app.mongoose.Types.ObjectId(config.await)] } }
                        ]
                    }
                },
                {
                    $lookup: {
                        from: 'access',
                        localField: '_id',
                        foreignField: 'module_id',
                        as: 'child'
                    }
                },
                {
                    $project: {
                        '_id': 1,
                        'type': 1,
                        'module_name': 1,
                        'action_name': 1,
                        'url': 1,
                        'child': 1
                    }
                },
                {
                    $sort: {
                        sort: 1
                    }
                }
            ]),
            roleAccess = [],
            roleAccessResult = await ctx.model.RoleAccess.find({ role_id }, { access_id: 1 });

        for (let i = 0; i < access.length; i++) {
            //移除失效的子模块
            access[i].child = access[i].child.filter((e => { return e.status == 1 }));
            //子模块排序
            access[i].child = await ctx.service.tools.jsonSort(access[i].child, 'sort', false);
        }

        roleAccessResult.forEach(val => {
            roleAccess.push(val.access_id.toString());
        });

        for (let i = 0; i < access.length; i++) {
            if (roleAccess.indexOf(access[i]._id.toString()) != -1) {
                access[i].checked = true;
            }
            for (let j = 0; j < access[i].child.length; j++) {
                if (roleAccess.indexOf(access[i].child[j]._id.toString()) != -1) {
                    access[i].child[j].checked = true;
                }
            }
        }

        return access;
    }
}

module.exports = AdminService;
