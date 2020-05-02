'use strict';

const BaseController = require('./base');

class UserController extends BaseController {
    async index() {
        const { ctx, config } = this;

        let params = ctx.query,
            phone = params.username ? params.username.trim() : '',
            page = params.page ? params.page : 1,
            pageSize = config.pageSize ? config.pageSize : 10,
            where = {};

        if (phone && phone != '') {
            //模糊查询
            where = {
                $or: [
                    { phone: { $regex: phone } }
                ]
            };
        };

        let totalCount = await ctx.model.User.find(where).count();
        let pageCount = Math.ceil(totalCount / pageSize);
        let list = await ctx.model.User.find(where, '_id email phone last_ip add_time status').skip((page - 1) * pageSize).limit(pageSize);

        await this.ctx.render('/admin/user/index', { params, list, page, pageCount });
    }

    async changeStatus() {
        const { ctx, service } = this;
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

        let user = await ctx.model.User.findOne(where, { _id: 0, phone: 1, last_ip: 1, status: 1 });
        let userStatus = user.status;

        if (user == undefined) {
            ctx.body = { 'message': '更新失败，参数错误', 'success': false };
        } else {
            let uParams = userStatus == 0 ? { status: 1 } : { status: 0 };
            try {
                await ctx.model.User.updateOne(where, uParams);
                if (uParams.status) {
                    let res = await ctx.model.BlackList.deleteOne({ phone: user.phone, ip: user.last_ip });
                    if (res.ok <= 0) {
                        ctx.body = { 'message': '更新失败', 'success': false };
                    }
                } else {
                    let blackData = await ctx.model.BlackList.findOne({ phone: user.phone, ip: user.last_ip }, '_id');
                    if (!blackData) {
                        let blackList = new ctx.model.BlackList({
                            phone: user.phone,
                            ip: user.last_ip,
                            add_time: await service.tools.getTime()
                        });
                        await blackList.save();
                    }
                }
                ctx.body = { 'message': '更新成功', 'success': true };
            } catch (err) {
                console.log(err);
                ctx.body = { 'message': '更新失败', 'success': false };
            }
        }
    }

    async blackList() {
        const { ctx, config } = this;

        let params = ctx.query,
            phoneOrIp = params.phoneOrIp ? params.phoneOrIp.trim() : '',
            page = params.page ? params.page : 1,
            pageSize = config.pageSize ? config.pageSize : 10,
            where = {};

        if (phoneOrIp && phoneOrIp != '') {
            //模糊查询
            where = {
                $or: [
                    { phone: { $regex: phoneOrIp } },
                    { ip: { $regex: phoneOrIp } }
                ]
            };
        };

        let totalCount = await ctx.model.User.find(where).count();
        let pageCount = Math.ceil(totalCount / pageSize);
        let list = await ctx.model.BlackList.find(where, '_id phone ip add_time').skip((page - 1) * pageSize).limit(pageSize);

        await this.ctx.render('/admin/user/blackList', { params, list, page, pageCount });
    }
}

module.exports = UserController;
