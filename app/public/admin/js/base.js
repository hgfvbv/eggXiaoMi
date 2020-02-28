$(function () {

	app.init();
})


var app = {


	init: function () {
		this.toggleAside();

	},
	toggleAside: function () {

		$('.aside h4').click(function () {

			$(this).siblings('ul').slideToggle();
		})
	},

	changeStatus: function (el, model, attr, id, _csrf, type) {
		switch (model) {
			case 'Role':
				$.post('/admin/role/changeStatus', { id, _csrf }, function (data) {
					if (data.success) {
						if (el.src.indexOf('yes') != -1) {
							el.src = '/public/admin/images/no.gif';
						} else {
							el.src = '/public/admin/images/yes.gif';
						}
					} else {
						if (data.message) {
							alert(data.message);
						} else {
							alert('对不起！您无此权限！如有疑问可联系管理员！');
						}
					}
				});
				break;
			case 'Access':
				$.post('/admin/access/changeStatus', { id, type, _csrf }, function (data) {
					if (data.success) {
						if (el.src.indexOf('yes') != -1) {
							el.src = '/public/admin/images/no.gif';
						} else {
							el.src = '/public/admin/images/yes.gif';
						}
					} else {
						if (data.message) {
							alert(data.message);
						} else {
							alert('对不起！您无此权限！如有疑问可联系管理员！');
						}
					}
				});
				break;
			default:
				$.post('/admin/changeStatus', { model, attr, id, _csrf }, function (data) {
					if (data.success) {
						if (el.src.indexOf('yes') != -1) {
							el.src = '/public/admin/images/no.gif';
						} else {
							el.src = '/public/admin/images/yes.gif';
						}
					} else {
						if (data.message) {
							alert(data.message);
						} else {
							alert('对不起！您无此权限！如有疑问可联系管理员！');
						}
					}
				});
				break;
		}
	}
}