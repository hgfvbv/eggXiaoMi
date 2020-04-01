'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);

  router.get('/admin', controller.admin.main.index);
  router.get('/admin/welcome', controller.admin.main.welcome);
  router.get('/admin/verify', controller.admin.base.verify);
  // router.get('/admin/delete', controller.admin.base.delete);
  // router.post('/admin/changeStatus', controller.admin.base.changeStatus);
  // router.post('/admin/changeNum', controller.admin.base.changeNum);
  router.get(['/admin/login', '/admin/HV'], controller.admin.login.index);
  router.get('/admin/loginOut', controller.admin.login.loginOut);
  router.get('/admin/exit', controller.admin.base.exit);
  router.post('/admin/doLogin', controller.admin.login.doLogin);

  router.get('/admin/access', controller.admin.access.index);
  router.get('/admin/access/add', controller.admin.access.add);
  router.post('/admin/access/doAdd', controller.admin.access.doAdd);
  router.get('/admin/access/edit', controller.admin.access.edit);
  router.post('/admin/access/doEdit', controller.admin.access.doEdit);
  router.post('/admin/access/changeStatus', controller.admin.access.changeStatus);
  router.post('/admin/access/changeNum', controller.admin.base.changeNum);
  router.get('/admin/access/delete', controller.admin.access.delete);

  router.get('/admin/manager', controller.admin.manager.index);
  router.get('/admin/manager/add', controller.admin.manager.add);
  router.post('/admin/manager/doAdd', controller.admin.manager.doAdd);
  router.get('/admin/manager/edit', controller.admin.manager.edit);
  router.post('/admin/manager/doEdit', controller.admin.manager.doEdit);
  router.get('/admin/manager/delete', controller.admin.base.delete);
  router.post('/admin/manager/changeStatus', controller.admin.base.changeStatus);

  router.get('/admin/role', controller.admin.role.index);
  router.get('/admin/role/add', controller.admin.role.add);
  router.post('/admin/role/doAdd', controller.admin.role.doAdd);
  router.get('/admin/role/edit', controller.admin.role.edit);
  router.post('/admin/role/doEdit', controller.admin.role.doEdit);
  router.post('/admin/role/changeStatus', controller.admin.role.changeStatus);
  router.get('/admin/role/delete', controller.admin.role.delete);
  router.get('/admin/role/auth', controller.admin.role.auth);
  router.post('/admin/role/doAuth', controller.admin.role.doAuth);

  router.get('/admin/focus', controller.admin.focus.index);
  router.get('/admin/focus/add', controller.admin.focus.add);
  router.post('/admin/focus/doAdd', controller.admin.focus.doAdd);
  router.get('/admin/focus/edit', controller.admin.focus.edit);
  router.post('/admin/focus/doEdit', controller.admin.focus.doEdit);
  router.get('/admin/focus/delete', controller.admin.base.delete);
  router.post('/admin/focus/changeStatus', controller.admin.base.changeStatus);
  router.post('/admin/focus/changeNum', controller.admin.base.changeNum);

  router.get('/admin/goodsType', controller.admin.goodsType.index);
  router.get('/admin/goodsType/add', controller.admin.goodsType.add);
  router.post('/admin/goodsType/doAdd', controller.admin.goodsType.doAdd);
  router.get('/admin/goodsType/edit', controller.admin.goodsType.edit);
  router.post('/admin/goodsType/doEdit', controller.admin.goodsType.doEdit);
  router.post('/admin/goodsType/changeStatus', controller.admin.goodsType.changeStatus);
  router.get('/admin/goodsType/delete', controller.admin.goodsType.delete);

  router.get('/admin/goodsTypeAttribute', controller.admin.goodsTypeAttributes.index);
  router.get('/admin/goodsTypeAttribute/add', controller.admin.goodsTypeAttributes.add);
  router.post('/admin/goodsTypeAttribute/doAdd', controller.admin.goodsTypeAttributes.doAdd);
  router.get('/admin/goodsTypeAttribute/edit', controller.admin.goodsTypeAttributes.edit);
  router.post('/admin/goodsTypeAttribute/doEdit', controller.admin.goodsTypeAttributes.doEdit);
  router.post('/admin/goodsTypeAttribute/changeStatus', controller.admin.goodsTypeAttributes.changeStatus);
  router.post('/admin/goodsTypeAttribute/changeNum', controller.admin.goodsTypeAttributes.changeSort);
  router.get('/admin/goodsTypeAttribute/delete', controller.admin.goodsTypeAttributes.delete);

  router.get('/admin/goodsCate', controller.admin.goodsCate.index);
  router.get('/admin/goodsCate/add', controller.admin.goodsCate.add);
  router.post('/admin/goodsCate/doAdd', controller.admin.goodsCate.doAdd);
  router.get('/admin/goodsCate/edit', controller.admin.goodsCate.edit);
  router.post('/admin/goodsCate/doEdit', controller.admin.goodsCate.doEdit);
  router.post('/admin/goodsCate/changeStatus', controller.admin.goodsCate.changeStatus);
  router.post('/admin/goodsCate/changeNum', controller.admin.base.changeNum);
  router.get('/admin/goodsCate/delete', controller.admin.goodsCate.delete);

  router.get('/admin/goods', controller.admin.goods.index);
  router.get('/admin/goods/add', controller.admin.goods.add);
  router.post('/admin/goods/doAdd', controller.admin.goods.doAdd);
  router.get('/admin/goods/edit', controller.admin.goods.edit);
  router.post('/admin/goods/doEdit', controller.admin.goods.doEdit);
  router.post('/admin/goods/goodsUploadImage', controller.admin.goods.goodsUploadImage);
  router.post('/admin/goods/goodsUploadVideo', controller.admin.goods.goodsUploadVideo);
  router.get('/admin/goods/goodsTypeAttribute', controller.admin.goods.goodsTypeAttribute);
  router.post('/admin/goods/goodsUploadPhoto', controller.admin.goods.goodsUploadPhoto);
  router.post('/admin/goods/goodsUploadImg', controller.admin.goods.goodsUploadImg);
  router.post('/admin/goods/changeGoodsImageColor', controller.admin.goods.changeGoodsImageColor);
  router.post('/admin/goods/goodsImageRemove', controller.admin.goods.goodsImageRemove);
  router.get('/admin/goods/delete', controller.admin.goods.delete);
  router.post('/admin/goods/changeStatus', controller.admin.base.changeStatus);
  router.post('/admin/goods/changeNum', controller.admin.base.changeNum);

  router.get('/admin/goodsColor', controller.admin.goodsColor.index);
  router.get('/admin/goodsColor/add', controller.admin.goodsColor.add);
  router.post('/admin/goodsColor/doAdd', controller.admin.goodsColor.doAdd);
  router.get('/admin/goodsColor/edit', controller.admin.goodsColor.edit);
  router.post('/admin/goodsColor/doEdit', controller.admin.goodsColor.doEdit);
  router.get('/admin/goodsColor/delete', controller.admin.goodsColor.delete);
  router.post('/admin/goodsColor/changeStatus', controller.admin.base.changeStatus);
};
