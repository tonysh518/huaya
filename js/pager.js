(function($){
    $.pager = function(el, options){
        var base = this;
        base.$el = $(el);
        base.el = el;
        base.$el.data("pager", base);

        base.init = function(){
            base.options = $.extend({},$.pager.defaultOptions, options);
        };
        base.init();
    };

    $.pager.defaultOptions = {
        pageWrap      :   '.m-list5-wrap',
        pageClass     :   '.m-list5-inner',
        pagingClass   :   '.tan-page',
        pagingNumber   :   '.tan-page-num'
    };

    $.fn.pager = function(options){
        return this.each(function(){
            (new $.pager(this, options));
            var pagerWrap =  $(this).find(options.pageWrap);
            var pagerNum = $(this).find(options.pageClass).length;
            var pagerNumDiv =  $(this).find(options.pagingNumber);
            var prevBtn =  $(this).find('.tan-page-prve');
            var nextBtn =  $(this).find('.tan-page-next');
            var width = $(this).find(options.pageClass).width();
            var index = 0;
            prevBtn.css({visibility:'hidden'});

            for(var i = 0; i < pagerNum; i++)
            {
                pagerNumDiv.append('<a class="tan-page-item" href="#">' + (i+1) + '</a>');
            }

            pagerNumDiv.find('.tan-page-item').eq(0).addClass('tan-page-item-active');
            nextBtn.on('click',function(){

                index ++;
                pagerNumDiv.find('.tan-page-item').removeClass('tan-page-item-active');
                pagerNumDiv.find('.tan-page-item').eq(index).addClass('tan-page-item-active');
                pagerWrap.animate({'margin-left':-width*(index)});
                if(pagerNum == (index+1)){
                    $(this).css({visibility:'hidden'});
                }

                prevBtn.css({visibility:'visible'});
            });

            prevBtn.on('click',function(){
                index --;
                pagerNumDiv.find('.tan-page-item').removeClass('tan-page-item-active');
                pagerNumDiv.find('.tan-page-item').eq(index).addClass('tan-page-item-active');
                pagerWrap.animate({'margin-left':-width*(index)});
                if(index == 0){
                    $(this).css({visibility:'hidden'});
                }
                nextBtn.css({visibility:'visible'});
            });

            pagerNumDiv.find('a').on('click',function(){
                index = $.inArray(this,pagerNumDiv.find('a'));
                pagerNumDiv.find('.tan-page-item').removeClass('tan-page-item-active');
                pagerNumDiv.find('.tan-page-item').eq(index).addClass('tan-page-item-active');
                pagerWrap.animate({'margin-left':-width*(index)});
                nextBtn.css({visibility:'visible'});
                prevBtn.css({visibility:'visible'});
                if(index == 0){
                    prevBtn.css({visibility:'hidden'});
                }
                if((index+1) == pagerNum){
                    nextBtn.css({visibility:'hidden'});
                }
            });

        });
    };

})(jQuery);