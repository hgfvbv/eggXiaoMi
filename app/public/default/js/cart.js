(function ($) {

    var app = {
        init: function () {
            this.isCheckedAll();
            this.initCheckBox();
            this.deleteConfirm();
            this.changeCartNum();
        },
        deleteConfirm: function () {
            $('.delete').click(function () {
                return confirm('您确定要删除吗?');
            });
        },
        initCheckBox() {
            $("#checkAll").click(function () {
                if (this.checked) {
                    $(":checkbox").prop("checked", true);
                    $.get('/changeAllCart', { type: 1 }, function (data) {
                        if (data.success) {
                            $('#allPrice').html(data.allPrice + '元');
                            $('#goodsCount').html(data.cartCount);
                            $('#goodsChecked').html(data.checkedCount);
                        } else {
                            alert(data.msg);
                        }
                    });
                } else {
                    $(":checkbox").prop("checked", false);
                    $.get('/changeAllCart', { type: 0 }, function (data) {
                        if (data.success) {
                            $('#allPrice').html(data.allPrice + '元');
                            $('#goodsCount').html(data.cartCount);
                            $('#goodsChecked').html(data.checkedCount);
                        } else {
                            alert(data.msg);
                        }
                    });
                }
            });

            var _that = this;
            $('.cart_list input:checkbox').click(function () {
                _that.isCheckedAll();
                var goodsId = $(this).attr('goodsId'),
                    color = $(this).attr('color');

                $.get('/changeOneCart', { goodsId, color }, function (data) {
                    if (data.success) {
                        $('#allPrice').html(data.allPrice + '元');
                        $('#goodsCount').html(data.cartCount);
                        $('#goodsChecked').html(data.checkedCount);
                    } else {
                        alert(data.msg);
                    }
                });
            });
        },
        //判断全选是否选择
        isCheckedAll() {
            var chknum = $(".cart_list input:checkbox").size();//checkbox总个数
            var chk = 0;  //checkbox checked=true总个数
            $(".cart_list input:checkbox").each(function () {
                if ($(this).prop("checked") == true) {
                    chk++;
                }
            });
            if (chknum == chk) {//全选
                $("#checkAll").prop("checked", true);
            } else {//不全选
                $("#checkAll").prop("checked", false);
            }
        },
        changeCartNum() {
            $('.decCart').click(function () {
                var goodsId = $(this).attr('goodsId'),
                    color = $(this).attr('color');

                $.get('/decCart', { goodsId, color }, function (data) {
                    if (data.success) {
                        $('#allPrice').html(data.allPrice + '元');
                        $(this).siblings('.input_center').find('input').val(data.num);
                        $(this).parent().parent().siblings('.totalPrice').html(data.totalPrice + '元');
                    } else {
                        alert(data.msg);
                    }
                }.bind(this));
            });

            $('.incCart').click(function () {
                var goodsId = $(this).attr('goodsId'),
                    color = $(this).attr('color');

                $.get('/incCart', { goodsId, color }, function (data) {
                    if (data.success) {
                        $('#allPrice').html(data.allPrice + '元');
                        $(this).siblings('.input_center').find('input').val(data.num);
                        $(this).parent().parent().siblings('.totalPrice').html(data.totalPrice + '元');
                    } else {
                        alert(data.msg);
                    }
                }.bind(this));
            });
        },
    }

    $(function () {
        app.init();
    });
})($);