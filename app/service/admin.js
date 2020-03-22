'use strict';

const Service = require('egg').Service,
    _ = require('lodash'),
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

        _.forEach(roleAccessResult, (item, i) => {
            roleAccess.push(item.access_id.toString());
        });

        if (_.includes(roleAccess, checkId)) {
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
                            { _id: { $nin: [app.mongoose.Types.ObjectId(config.await)] } }
                        ]
                    }
                },
                {
                    $sort: {
                        sort: 1
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
            ]),
            roleAccess = [],
            roleAccessResult = await ctx.model.RoleAccess.find({ role_id }, { access_id: 1 });

        // _.forEach(access, async (item, i) => {
        //     //移除失效的子模块
        //     access[i].child = item.child.filter((e => { return e.status == 1 }));
        //     //子模块排序
        //     access[i].child = await ctx.service.tools.jsonSort(item.child, 'sort', false);
        // });

        for (let i = 0; i < access.length; i++) {
            //移除失效的子模块
            access[i].child = access[i].child.filter((e => { return e.status == 1 }));
            //子模块排序
            access[i].child = await ctx.service.tools.jsonSort(access[i].child, 'sort', false);
        }

        _.forEach(roleAccessResult, (item, i) => {
            roleAccess.push(item.access_id.toString());
        });

        // _.forEach(access, (item, i) => {
        //     if (_.includes(roleAccess, item._id.toString())) {
        //         access[i].checked = true;
        //     }
        //     _.forEach(item.child, (child, j) => {
        //         if (_.includes(roleAccess, child._id.toString())) {
        //             access[i].child[j].checked = true;
        //         }
        //     });
        // });

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
