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

  config.loginFilter = [
    '/admin/login',
    '/admin/doLogin',
    '/admin/verify'
  ];

  config.accessFilter = [
    '/admin/login',
    '/admin/doLogin',
    '/admin/verify',
    '/admin/loginOut',
    '/admin'
  ];

  config.session = {
    key: 'SESSION_ID',
    maxAge: 1200000,
    httpOnly: true,
    encrypt: true,
    renew: true //  延长会话有效期       
  }

  exports.mongoose = {
    client: {
      url: 'mongodb://127.0.0.1/eggxiaomi',
      options: {},
    }
  };

  config.view = {
    mapping: {
      '.html': 'ejs',
      '.nj': 'nunjucks'
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
