$(function () {

	app.init();
})


var app = {


	init: function () {
		this.toggleAside();
		this.deleteConfirm();
	},
	deleteConfirm: function () {
		$('.delete').click(function () {
			return confirm('您确定要删除吗？');
		});
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
	},
	changeNum: function (el, model, attr, id, _csrf) {
		var oldNum = $(el).html().trim();

		if (oldNum == '') {
			oldNum = 0;
		}

		var input = $('<input value="" />');

		//把input放在span里
		$(el).html(input);
		//给input赋值并获取焦点
		$(input).val(oldNum).trigger('focus');
		//input点击时阻止冒泡
		$(input).click(function () {
			return false;
		});

		$(input).blur(function () {
			var num = $(input).val().trim();

			if (num == '') {
				$(el).html(oldNum);
				alert('请输入排序！');
			} else if (!(/^\d+$/.test(num))) {
				$(el).html(oldNum);
				alert('请正确输入排序！');
			} else {
				$.post('/admin/changeNum', { model, attr, id, _csrf, num }, function (data) {
					if (data.success) {
						$(el).html(num);
					} else {
						$(el).html(oldNum);
						if (data.message) {
							alert(data.message);
						} else {
							alert('对不起！您无此权限！如有疑问可联系管理员！');
						}
					}
				});
			}
		});
	}
}