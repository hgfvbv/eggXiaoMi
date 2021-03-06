(function ($) {

    var app = {
        init: function () {

            this.initSwiper();

            this.initNavSlide();

            this.initContentTabs();

            this.initColorSelect();
        },
        initSwiper: function () {
            new Swiper('.swiper-container', {
                loop: true,
                navigation: {
                    nextEl: '.swiper-button-next',
                    prevEl: '.swiper-button-prev'
                },
                pagination: {
                    el: '.swiper-pagination',
                    clickable: true
                },
                autoplay: true
            });
        },
        initNavSlide: function () {
            $("#nav_list>li").hover(function () {

                $(this).find('.children-list').show();
            }, function () {
                $(this).find('.children-list').hide();
            })

        },
        initContentTabs: function () {

            $('.detail_info .detail_info_item:first').addClass('active');
            $('.detail_list li:first').addClass('active');
            $('.detail_list li').click(function () {
                var index = $(this).index();
                $(this).addClass('active').siblings().removeClass('active');

                $('.detail_info .detail_info_item').removeClass('active').eq(index).addClass('active');

            })
        },
        initColorSelect() {
            var that = this;
            $('#color_list .banben').click(function () {
                $(this).addClass('active').siblings().removeClass('active');
                var goods_id = $(this).attr('goods_id');
                var color_id = $(this).attr('goods_color');

                $.get('/getImagelist?goodsId=' + goods_id + '&colorId=' + color_id, function (data) {
                    if (data.success) {
                        var result = data.result;
                        var str = '';
                        for (let i = 0; i < result.length; i++) {
                            var point = result[i].img_url.lastIndexOf(".");
                            var type = result[i].img_url.substr(point);
                            str += '<div class="swiper-slide"><img src="' + result[i].img_url + '_400x400' + type + '" /> </div>';
                        }
                        $('#swiper-wrapper').html(str);

                        //改变轮播图以后重新初始化轮播图
                        that.initSwiper();
                    }
                });
            });
        }
    }

    $(function () {


        app.init();
    })



})($)
