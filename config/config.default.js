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
  config.jimpImgSizes = [{ width: 64, height: 64 }, { width: 100, height: 100 }, { width: 200, height: 200 }, { width: 400, height: 400 }];

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

  exports.multipart = {
    whitelist: ['.png', '.jfif', '.jpg', '.jpeg', '.bmp', '.psd', '.gif', '.mp4', '.avi'],
    fields: '50'  //配置表单数量
  };

  //针对指定的地址关闭csrf
  exports.security = {
    csrf: {
      // 判断是否需要 ignore 的方法，请求上下文 context 作为第一个参数
      ignore: ctx => {
        if (ctx.request.url == '/admin/goods/goodsUploadImage' || ctx.request.url == '/admin/goods/goodsUploadPhoto' || ctx.request.url == '/admin/goods/goodsUploadVideo' || ctx.request.url == '/admin/goods/goodsUploadImg' || ctx.request.url == '/admin/articleCate/articleCateUploadImg' || ctx.request.url == '/admin/article/articleUploadImage' || ctx.request.url == '/admin/article/articleUploadVideo' || ctx.request.url == '/admin/article/articleUploadImg' || ctx.request.url == '/admin/setting/siteIcoUploadImg' || ctx.request.url == '/admin/setting/siteLogoUploadImg' || ctx.request.url == '/admin/setting/noPictureUploadImg') {
          return true;
        }
        return false;
      }
    }
  };

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
