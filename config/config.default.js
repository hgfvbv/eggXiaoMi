/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
    /**
     * built-in config
     * @type {Egg.EggAppConfig}
     **/
    const config = exports = {};

    // use for cookie sign key, should change to your own and keep security
    config.keys = appInfo.name + '_1581493457159_9568';

    // add your middleware config here
    config.middleware = ['adminauth'];

    config.adminauth = {
        match: '/admin'
    };

    //此配置用于更改数据库必有字段时与数据库同步
    config.isuperTxt = '超级管理员';
    config.isuper = '5b8dee0a3811c10b70b08067';
    config.rwaitTxt = '待定';  //角色管理待定
    config.rwait = '5e4cdb709ddce035b8ce650e';
    config.awaitTxt = '待定';  //权限管理待定
    config.await = '5e50e212368c3a24b0c12605';

    config.icoDir = 'app/public/favicon.ico';
    config.uploadDir = 'app/public/admin/upload';

    //增加商品时用于删除缩略图的大小配置
    config.jimpImgSizes = [{ width: 64, height: 64 }, { width: 100, height: 100 }, { width: 180, height: 180 }, { width: 400, height: 400 }];

    config.loginFilter = [
        '/admin/login',
        '/admin/HV',
        '/admin/doLogin',
        '/admin/verify',
        '/admin/loginOut',
        '/admin/exit'
    ];

    config.accessFilter = [
        '/admin/login',
        '/admin/HV',
        '/admin/doLogin',
        '/admin/verify',
        '/admin/loginOut',
        '/admin',
        '/admin/welcome',
        '/admin/exit'
    ];

    config.session = {
        key: 'SESSION_ID',
        maxAge: 1200000,
        httpOnly: true,
        encrypt: true,
        renew: true //  延长会话有效期       
    }

    //全局分页每页数量 默认为10
    config.pageSize = 7;
    //权限分页每页数量 默认为2
    config.accessPageSize = 2;
    //权限分页每页数量 默认为2
    config.articleCatePageSize = 2;
    //前台订单分页 默认为2
    config.orderPageSize = 2;

    exports.multipart = {
        whitelist: ['.png', '.jfif', '.jpg', '.jpeg', '.bmp', '.psd', '.gif', '.mp4', '.avi'],
        fields: '50'  //配置表单数量
    };

    //针对指定的地址关闭csrf
    exports.security = {
        csrf: {
            // 判断是否需要 ignore 的方法，请求上下文 context 作为第一个参数
            ignore: ctx => {
                if (ctx.request.url == '/admin/goods/goodsUploadImage' || ctx.request.url == '/admin/goods/goodsUploadPhoto' || ctx.request.url == '/admin/goods/goodsUploadVideo' || ctx.request.url == '/admin/goods/goodsUploadImg' || ctx.request.url == '/admin/articleCate/articleCateUploadImg' || ctx.request.url == '/admin/article/articleUploadImage' || ctx.request.url == '/admin/article/articleUploadVideo' || ctx.request.url == '/admin/article/articleUploadImg' || ctx.request.url == '/admin/setting/siteIcoUploadImg' || ctx.request.url == '/admin/setting/siteLogoUploadImg' || ctx.request.url == '/admin/setting/noPictureUploadImg' || ctx.request.url === '/alipay/alipayNotify' || ctx.request.url === '/weChatPay/weChatPayNotify') {
                    return true;
                }
                return false;
            }
        }
    };

    config.redis = {
        client: {
            port: 6379,          // Redis port
            host: '127.0.0.1',   // Redis host
            password: '',
            db: 0,
        },
    }

    //短信apiKey
    config.apiKey = '**************************';
    //一个手机号一天发送短信最多次数，默认6
    config.sendCount = 6;
    //一个ip一天发送手机号最多次数，默认5
    config.ipCount = 5;
    //手机验证码有效时间，单位：分钟，默认30
    config.validTime = 15;

    //最多收货地址数量，默认20  
    config.addressCount = 10;

    config.alipayOptions = {
        appId: '需要配置',
        privateKey: "需要配置",
        alipayPublicKey: "需要配置"
    };
    exports.alipayBasicParams = {
        returnUrl: 'http://www.hgfvbv.xyz/alipay/alipayReturn', //支付成功返回地址
        notifyUrl: 'http://www.hgfvbv.xyz/alipay/alipayNotify' //支付成功异步通知地址
    }

    //微信支付的配置
    exports.weixinPayConfig = {
        mch_id: '商户号',
        wxappid: "需要配置",
        wxpaykey: '需要配置'
    }

    exports.weixinpayBasicParams = {
        //注意回调地址必须在  微信商户平台配置
        notify_url: "http://www.hgfvbv.xyz/weChatPay/weChatPayNotify'"
    }

    exports.proxy = true;

    exports.mongoose = {
        client: {
            url: 'mongodb://127.0.0.1/eggxiaomi',
            options: {},
        }
    };

    config.view = {
        mapping: {
            '.html': 'ejs',
            '.htm': 'nunjucks'
        }
    };

    // add your user config here
    const userConfig = {
        // myAppName: 'egg',
    };

    return {
        ...config,
        ...userConfig,
    };
};
