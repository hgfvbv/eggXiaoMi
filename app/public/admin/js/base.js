$(function () {

	app.init();
});

$(window).resize(function () {

	app.resizeIframe();
})

var app = {
	init: function () {
		this.toggleAside();
		this.deleteConfirm();
		//this.resizeIframe();
	},
	deleteConfirm: function () {
		$('.delete').click(function () {
			return confirm('您确定要删除吗？');
		});
	},
	resizeIframe: function () {
		var height = document.documentElement.clientHeight - 100;
		//document 是iframe子页面
		document.getElementById('rightMain').height = height;
	},
	toggleAside: function () {
		$('.aside h4').click(function () {
			//另一种效果
			$(this).next().slideDown(700).parent().siblings('li').children('ul').slideUp(700);

			// //默认效果
			// if ($(this).find('span').hasClass('nav_close')) {
			// 	$(this).find('span').removeClass('nav_close').addClass('nav_open');
			// } else {
			// 	$(this).find('span').removeClass('nav_open').addClass('nav_close');
			// }

			// // 同样的默认效果
			// // if ($(this).siblings('ul').is(":hidden")) {
			// // 	$(this).siblings('ul').slideDown();
			// // } else {
			// // 	$(this).siblings('ul').slideUp();
			// // }

			//$(this).siblings('ul').slideToggle();
		});
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