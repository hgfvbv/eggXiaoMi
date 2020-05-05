'use strict';

const BaseController = require('./base');

class AddressController extends BaseController {
    async addAddress() {
        const { ctx, service, config } = this;
        let params = ctx.request.body.params,
            uid = service.cookies.get('userInfo') ? service.cookies.get('userInfo')._id : '',
            name = params.name.trim() || '',
            phone = params.phone.trim() || '',
            address = params.address.trim() || '',
            zipcode = params.zipcode.trim() || '';

        if (uid === '' || name === '' || phone === '' || !/^[\d]{11}$/.test(phone) || address === '' || zipcode === '' || !/^[0-9]{6}$/.test(zipcode)) {
            ctx.body = {
                success: false,
                msg: '对不起！服务器忙！请稍后再试！'
            };
            return;
        }

        let addressRes = await ctx.model.Address.findOne({ uid, name, phone, address, zipcode }, '_id');
        if (addressRes) {
            ctx.body = {
                success: false,
                msg: '不能重复添加相同的地址！'
            };
        } else {
            const addressCount = await ctx.model.Address.find({ uid }, '_id').count();
            const count = config.addressCount || 20;
            if (addressCount < count) {
                await ctx.model.Address.updateMany({ uid }, { default_address: 0 });
                let addressM = new ctx.model.Address({
                    uid,
                    name,
                    phone,
                    address,
                    zipcode,
                    default_address: 1,
                    add_time: await service.tools.getTime()
                });

                addressM = await addressM.save();
                if (addressM && addressM._id) {
                    //let addressList = await ctx.model.Address.find({ uid }, '_id name phone address zipcode default_address').sort({ default_address: -1 });
                    ctx.body = {
                        success: true,
                        msg: '添加地址成功！',
                        //addressList
                    };
                } else {
                    ctx.body = {
                        success: false,
                        msg: '添加地址错误！'
                    };
                }
            } else {
                ctx.body = {
                    success: false,
                    msg: `添加地址错误，最多只能添加${count}个地址！`
                };
            }
        }
    }

    async getOneAddressList() {
        const { ctx, service } = this;
        let params = ctx.query,
            _id = params.id.trim() || '',
            uid = service.cookies.get('userInfo') ? service.cookies.get('userInfo')._id : '';

        if (uid === '' || _id === '') {
            ctx.body = {
                success: false,
                msg: '对不起！服务器忙！请稍后再试！'
            };
            return;
        }

        let address = await ctx.model.Address.findOne({ uid, _id }, '_id name phone address zipcode');
        if (address) {
            ctx.body = {
                success: true,
                address
            };
        } else {
            ctx.body = {
                success: false,
                msg: '对不起！服务器忙！刷新试试？'
            };
        }
    }

    async changeDefaultAddress() {
        const { ctx, service } = this;
        let params = ctx.query,
            _id = params.id.trim() || '',
            uid = service.cookies.get('userInfo') ? service.cookies.get('userInfo')._id : '';

        if (uid === '' || _id === '') {
            ctx.body = {
                success: false,
                msg: '对不起！服务器忙！请稍后再试！'
            };
            return;
        }

        let res = await ctx.model.Address.updateMany({ uid }, { default_address: 0 });
        let resU = await ctx.model.Address.updateOne({ uid, _id }, { default_address: 1 });
        if (res.ok > 0 && resU.ok > 0) {
            ctx.body = {
                success: true,
                msg: '更改默认地址成功！'
            };
        } else {
            ctx.body = {
                success: false,
                msg: '更改默认地址失败！'
            };
        }
    }

    async editAddress() {
        const { ctx, service } = this;
        let params = ctx.request.body.params,
            _id = params.id.trim() || '',
            uid = service.cookies.get('userInfo') ? service.cookies.get('userInfo')._id : '',
            name = params.name.trim() || '',
            phone = params.phone.trim() || '',
            address = params.address.trim() || '',
            zipcode = params.zipcode.trim() || '';

        if (_id === '' || uid === '' || name === '' || phone === '' || !/^[\d]{11}$/.test(phone) || address === '' || zipcode === '' || !/^[0-9]{6}$/.test(zipcode)) {
            ctx.body = {
                success: false,
                msg: '对不起！服务器忙！请稍后再试！'
            };
            return;
        }

        let addressRes = await ctx.model.Address.findOne({ uid, _id }, '_id');
        if (addressRes) {
            let res = await ctx.model.Address.updateOne({ uid, _id }, { name, phone, address, zipcode });

            if (res.ok > 0) {
                //let addressList = await ctx.model.Address.find({ uid }, '_id name phone address zipcode default_address').sort({ default_address: -1 });
                ctx.body = {
                    success: true,
                    msg: '修改地址成功！',
                    //addressList
                };
            } else {
                ctx.body = {
                    success: false,
                    msg: '修改地址错误！'
                };
            }
        } else {
            ctx.body = {
                success: false,
                msg: '对不起！服务器忙！刷新试试？'
            };
        }
    }

    async delAddress() {
        const { ctx, service } = this;
        let params = ctx.query,
            _id = params.id.trim() || '',
            uid = service.cookies.get('userInfo') ? service.cookies.get('userInfo')._id : '';

        if (uid === '' || _id === '') {
            ctx.body = {
                success: false,
                msg: '对不起！服务器忙！请稍后再试！'
            };
            return;
        }

        let addressRes = await ctx.model.Address.findOne({ uid, _id }, '_id');
        if (addressRes) {
            let res = await ctx.model.Address.deleteOne({ uid, _id });
            if (res.ok > 0) {
                await ctx.model.Address.updateOne({ uid }, { default_address: 1 });
                ctx.body = {
                    success: true,
                    msg: '删除地址成功！'
                };
            } else {
                ctx.body = {
                    success: false,
                    msg: '删除地址失败！'
                };
            }
        } else {
            ctx.body = {
                success: false,
                msg: '对不起！服务器忙！刷新试试？'
            };
        }
    }
}

module.exports = AddressController;
