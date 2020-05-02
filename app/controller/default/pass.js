'use strict';

const BaseController = require('./base');

class PassController extends BaseController {
    async login() {
        const { ctx } = this;
        await ctx.render('/default/pass/login.htm');
    }

    async doLogin() {
        const { ctx, service } = this;
        let params = ctx.request.body,
            identify_code = params.identify_code.trim() ? params.identify_code.trim() : '',
            password = params.password.trim() || '',
            phone = params.username.trim() || '';

        if (identify_code === '' || identify_code !== ctx.session.identify_code || phone === '' || password === '') {
            ctx.session.identify_code = '';
            ctx.body = {
                success: false,
                msg: '请正确输入验证码！'
            };
            return;
        }

        password = await service.tools.md5(await service.tools.md5(password));
        let userInfo = await ctx.model.User.findOne({ phone, password }, '_id phone last_ip add_time email status');
        if (userInfo) {
            if (userInfo.status === 1) {
                //同步购物车数据
                await this.initCart(userInfo._id);
                service.cookies.set('userInfo', userInfo);
                ctx.body = {
                    success: true,
                    msg: '登陆成功！'
                };
            } else {
                ctx.session.identify_code = '';
                service.cookies.set('userInfo', '');
                ctx.body = {
                    success: false,
                    msg: '当前用户已被冻结，请咨询客服！'
                };
            }
        } else {
            ctx.session.identify_code = '';
            ctx.body = {
                success: false,
                msg: '用户名或密码错误！'
            };
        }
    }

    async loginOut() {
        this.service.cookies.set('userInfo', '');
        this.ctx.redirect('/');
    }

    async registerStep1() {
        const { ctx } = this;
        //清除注册可能没有清除的session
        ctx.session.identify_code = '';
        ctx.session.phone_code = '';
        await ctx.render('/default/pass/register_step1.htm');
    }

    async registerStep2() {
        const { ctx, service } = this;
        let params = ctx.query,
            identify_code = params.identify_code.trim() ? params.identify_code.trim() : '',
            add_day = await service.tools.getDay(),
            sign = params.sign.trim() ? params.sign.trim() : '';

        if (identify_code === '' || sign === '') {
            ctx.session.identify_code = '';
            ctx.session.phone_code = '';
            ctx.redirect('/register/registerStep1');
        }

        let userTemp = await ctx.model.UserTemp.findOne({ sign, add_day }, 'phone');
        if (userTemp) {
            let phone = userTemp.phone;
            let phoneStr = `${phone.substr(0, 3)}******${phone.substr(phone.lastIndexOf('*') - 1)}`;
            await ctx.render('/default/pass/register_step2.htm', { phoneStr, phone, identify_code, sign });
        } else {
            ctx.session.identify_code = '';
            ctx.session.phone_code = '';
            ctx.redirect('/register/registerStep1');
        }
    }

    async validatePhoneCode() {
        const { ctx, service, config } = this;
        let params = ctx.query,
            phone_code = params.phone_code.trim() ? params.phone_code.trim() : '',
            add_day = await service.tools.getDay(),
            sign = params.sign.trim() ? params.sign.trim() : '';

        if (phone_code === '' || phone_code !== ctx.session.phone_code) {
            // ctx.session.phone_code = '';
            ctx.body = {
                success: false,
                msg: '您输入的手机验证码错误！请重新发送！'
            };
            return;
        }

        if (sign === '') {
            ctx.session.identify_code = '';
            ctx.session.phone_code = '';
            ctx.body = {
                success: false,
                msg: '参数错误！'
            };
            return;
        }

        let userTemp = await ctx.model.UserTemp.findOne({ add_day, sign }, 'add_time phone ip');
        if (userTemp) {

            let blackList = await ctx.model.BlackList.findOne({
                $or: [
                    { phone: userTemp.phone },
                    { ip: userTemp.ip }
                ]
            }, '_id');

            //黑名单判断
            if (blackList) {
                ctx.session.identify_code = '';
                ctx.session.phone_code = '';
                ctx.body = {
                    success: false,
                    msg: '对不起！有关于您的信息记录已被冻结！无法注册！请咨询客服！'
                };
            } else {
                //判断验证码是否超时
                let nowTime = await service.tools.getTime(),
                    validTime = config.validTime ? config.validTime : 30;

                if (((userTemp.add_time - nowTime) / 1000 / 60) > validTime) {
                    ctx.session.phone_code = '';
                    ctx.body = {
                        success: false,
                        msg: '手机验证码已过期！请重新发送！'
                    };
                } else {
                    let user = await ctx.model.User.findOne({ phone: userTemp.phone }, '_id');
                    if (user) {
                        ctx.session.identify_code = '';
                        ctx.session.phone_code = '';
                        ctx.body = {
                            success: false,
                            msg: '此手机号已注册！'
                        };
                    } else {
                        ctx.body = {
                            success: true,
                            msg: '验证码正确！',
                            sign
                        };
                    }
                }
            }
        } else {
            ctx.session.identify_code = '';
            ctx.session.phone_code = '';
            ctx.body = {
                success: false,
                msg: '参数错误！'
            };
        }
    }

    async registerStep3() {
        const { ctx, service } = this;
        let params = ctx.query,
            phone_code = params.phone_code.trim() ? params.phone_code.trim() : '',
            add_day = await service.tools.getDay(),
            sign = params.sign.trim() ? params.sign.trim() : '',
            msg = params.msg || '';

        if (phone_code === '' || sign === '') {
            ctx.session.identify_code = '';
            ctx.session.phone_code = '';
            ctx.redirect('/register/registerStep1');
        }

        let userTemp = await ctx.model.UserTemp.findOne({ sign, add_day }, '_id');
        if (userTemp) {
            await ctx.render('/default/pass/register_step3.htm', { phone_code, sign, msg });
        } else {
            ctx.session.identify_code = '';
            ctx.session.phone_code = '';
            ctx.redirect('/register/registerStep1');
        }
    }

    async doRegister() {
        const { ctx, service } = this;
        let params = ctx.request.body,
            phone_code = params.phone_code.trim() ? params.phone_code.trim() : '',
            add_day = await service.tools.getDay(),
            sign = params.sign.trim() ? params.sign.trim() : '',
            password = params.password.trim() || '',
            rpassword = params.rpassword.trim() || '',
            ip = ctx.request.ip.replace(/::ffff:/, '');

        if (phone_code === '' || phone_code !== ctx.session.phone_code || sign === '' || password === '' || rpassword === '') {
            ctx.session.identify_code = '';
            ctx.session.phone_code = '';
            ctx.redirect('/register/registerStep1');
        }

        let userTemp = await ctx.model.UserTemp.findOne({ sign, add_day }, 'phone');
        if (userTemp) {
            if (password.length < 6 || password !== rpassword) {
                let msg = '密码不能小于6位且密码要和确认密码保持一致';
                ctx.redirect(`/register/registerStep3?sign=${sign}&phone_code=${phone_code}&msg=${msg}`);
            } else {
                let user = new ctx.model.User({
                    password: await service.tools.md5(await service.tools.md5(password)),
                    phone: userTemp.phone,
                    last_ip: ip,
                    add_time: await service.tools.getTime(),
                    email: '',
                    status: 1
                });

                try {
                    user = await user.save();
                    ctx.session.identify_code = '';
                    ctx.session.phone_code = '';
                    let userInfo = await ctx.model.User.findOne({ _id: user._id, phone: user.phone }, '_id phone last_ip add_time email status');

                    //同步购物车数据
                    await this.initCart(userInfo._id);
                    service.cookies.set('userInfo', userInfo);
                    ctx.redirect('/');
                } catch (e) {
                    console.log(e);
                    let msg = '注册失败！';
                    ctx.redirect('/default/pass/register_step3.htm', { phone_code, sign, msg });
                }
            }
        } else {
            ctx.session.identify_code = '';
            ctx.session.phone_code = '';
            ctx.redirect('/register/registerStep1');
        }

    }

    async sendCode() {
        const { ctx, service, config } = this;
        let params = ctx.query,
            phone = params.phone.trim() ? params.phone.trim() : '',
            identify_code = params.identify_code.trim() ? params.identify_code.trim() : '',
            reg = /^[\d]{11}$/;

        if (identify_code !== ctx.session.identify_code) {
            ctx.session.identify_code = '';
            ctx.body = {
                success: false,
                msg: '请正确输入验证码！'
            };
            return;
        }
        if (phone === '' || !reg.test(phone)) {
            ctx.session.identify_code = '';
            ctx.body = {
                success: false,
                msg: '请正确输入手机号！'
            };
            return;
        }

        let add_day = await service.tools.getDay(),
            add_time = await service.tools.getTime(),
            sign = await service.tools.md5(add_day + phone),  //签名
            ip = ctx.request.ip.replace(/::ffff:/, ''),
            phone_code = await service.tools.getRandomNum(5);  //发送短信的随机码

        let userTemp = await ctx.model.UserTemp.findOne({ sign, add_day }, '_id send_count');
        //1个ip 一天只能发5个手机号
        let ipCount = await ctx.model.UserTemp.find({ ip, add_day }).count(),
            sendCount = config.sendCount ? config.sendCount : 6,
            ipcount = config.ipCount ? config.ipCount : 5;

        if (userTemp) {
            if (userTemp.send_count < sendCount && ipCount < ipcount) {
                let send_count = userTemp.send_count + 1;
                let user_temp = await ctx.model.UserTemp.updateOne({ _id: userTemp._id }, { send_count, add_time });
                console.log(send_count)
                if (user_temp.ok > 0) {
                    console.log(phone_code);
                    //发送短信
                    // await service.sendMsg.send(phone, phone_code);
                    ctx.session.phone_code = phone_code;
                    ctx.body = {
                        success: true,
                        sign,
                        msg: '发送成功！'
                    };
                } else {
                    ctx.session.identify_code = '';
                    ctx.body = {
                        success: false,
                        msg: '发送失败！'
                    };
                }
            } else {
                ctx.session.identify_code = '';
                ctx.body = {
                    success: false,
                    msg: '当前手机号码发送次数达到上限，明天再试！'
                };
            }
        } else {
            if (ipCount < ipcount) {
                let user_temp = new ctx.model.UserTemp({
                    phone,
                    send_count: 1,
                    sign,
                    add_day,
                    ip,
                    add_time
                });
                try {
                    await user_temp.save();
                    console.log(phone_code);
                    //发送短信
                    // await service.sendMsg.send(phone, phone_code);
                    ctx.session.phone_code = phone_code;
                    ctx.body = {
                        success: true,
                        sign,
                        msg: '发送成功！'
                    };
                } catch (e) {
                    ctx.session.identify_code = '';
                    console.log(e);
                    ctx.body = {
                        success: false,
                        msg: '发送失败！'
                    };
                }
            } else {
                ctx.session.identify_code = '';
                ctx.body = {
                    success: false,
                    msg: '当前IP发送次数达到上限，明天再试！'
                };
            }
        }
    }

    async initCart(userId) {
        const { ctx, service } = this;
        let cartList = service.cookies.get('cartList'),
            insertList = [];
        //有问题，参考购物车cookie的添加原理
        let cartData = await ctx.model.Cart.find({ userId }, 'goodsId color');
        if (cartData && cartData.length > 0 && cartList && cartList.length > 0) {
            for (let i = 0; i < cartList.length; i++) {
                const element = cartList[i];

                if (service.cart.cartHasData(cartData, element, true)) {
                    let dataNum = (await ctx.model.Cart.findOne({ goodsId: element._id, color: element.color }, 'num')).num;
                    let num = dataNum + element.num;
                    let uRes = await ctx.model.Cart.updateOne({ goodsId: element._id, color: element.color }, { num });
                    if (uRes.ok <= 0) {
                        console.log('同步购物车更改数量时失败！');
                    }
                } else {
                    insertList.push(new ctx.model.Cart({
                        userId,
                        goodsId: element._id,
                        title: element.title,
                        price: element.price,
                        goods_version: element.goods_version,
                        num: element.num,
                        color: element.color,
                        goods_img: element.goods_img,
                        goodsGiftIds: element.goodsGiftIds,
                        checked: element.checked
                    }));
                }
            }

            if (insertList && insertList.length > 0) {
                let res = await ctx.model.Cart.insertMany(insertList);
                if (res.length > 0) {
                    service.cookies.set('cartList', '');
                    console.log('同步购物车数据成功！');
                } else {
                    console.log('同步购物车数据失败！');
                }
            } else {
                service.cookies.set('cartList', '');
            }

        } else if (cartList && cartList.length > 0) {
            for (let i = 0; i < cartList.length; i++) {
                const element = cartList[i];
                insertList.push(new ctx.model.Cart({
                    userId,
                    goodsId: element._id,
                    title: element.title,
                    price: element.price,
                    goods_version: element.goods_version,
                    num: element.num,
                    color: element.color,
                    goods_img: element.goods_img,
                    goodsGiftIds: element.goodsGiftIds,
                    checked: element.checked
                }));
            }

            let res = await ctx.model.Cart.insertMany(insertList);
            if (res.length > 0) {
                service.cookies.set('cartList', '');
                console.log('同步购物车数据成功！');
            } else {
                console.log('同步购物车数据失败！');
            }
        }
    }

    async welcome() {
        const { ctx } = this;
        await ctx.render('/default/user.htm');
    }

    async order() {
        const { ctx } = this;
        await ctx.render('/default/order.htm');
    }
}

module.exports = PassController;
