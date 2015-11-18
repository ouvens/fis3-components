/**
 * @chriscai 打分控件
 *
 *
 *   example :
 *
 *   event listener :   click
 *
 *   var commentStar =  new CommentStar({
 *          el :  // 容器
 *          maxCount : // 最多多少颗星  默认为5
 *          starLabel : // []或string 每颗星星的 label , 默认为 ['很不满意' , '不满意' , '一般' , '满意' , '很满意']
 *          showStarLabel  : // Boolean 是否显示 label
 *          clickable : // 星星是否可点
 *
 *   })
*/
(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else {
        root['CommentStar'] = factory(root['jquery']);
    }

}(this, function () {


   var CommentStar = function (setting){


       var $el , maxCount = 5 ,
           currentStar = 0 , self =  this ,
           starLabel = ['很不满意' , '不满意' , '一般' , '满意' , '很满意'] , noEvent = '' ,
           EVENT_NAME_SPACE = '__commentStar__' ,
           showStarLabel = true,
           selectedStar = false,
           $event = $('i') ;



       var _init = function (){
            $el = $(setting.el);
           setting.maxCount && (maxCount = setting.maxCount);

           if(setting.star){
               currentStar = setting.star;
               selectedStar = true;
           }

           if(setting.starLabel){
               starLabel = setting.starLabel;
           }

           if(setting.showStarLabel === false){
               showStarLabel = false;
           }


           if(setting.clickable !== false){
               bindEvent();
           }else {
               noEvent = 'no-event'
           }



           $el.addClass('star-list');
           self.setStar(currentStar);

       }


       function bindEvent() {
           $el.on('click' , 'i' , function (e){
                self.setStar(parseInt($(this).data('count')));
               $event.trigger(EVENT_NAME_SPACE + ':' + 'click');
               selectedStar = true;
           });
           $el.on( 'mouseenter mouseleave' , 'i' ,  function (e){
               if(selectedStar || noEvent){
                   return ;
               }
               if(e.type == 'mouseenter'){
                    $(this).prevAll().attr('class' , 'star');
                    $(this).attr('class' , 'star');
               }else {
                   $(this).prevAll().attr('class' , 'no-star');
                   $(this).attr('class' , 'no-star');
               }
           });
       }


       this.setStar = function (count){
           currentStar = count;
           renderStar();
       }

       this.getStar = function (){
           return currentStar;
       }

       this.setStarLabel = function (text){
           $el.find('.star-label').text(text);
       }

      var getFloat = function (floatNum){
          var strFloat = (floatNum + '');
          if(strFloat.indexOf(".") < 0){
            return 0;
          }
          return parseFloat('0' +strFloat.substring(strFloat.indexOf(".")) );
      }


       function getLabel(starNum) {
           var label = '';

           if ($.isArray(starLabel)) {
               label = (starNum ? starLabel[starNum - 1 ] : '');
           } else {
               label = starLabel;
           }

           if(showStarLabel){
              return '<span class="star-label">' + label + '</span>'
           }else {
               return '';
           }
       }

       var renderStar = function (){
           var html = '' , count = 0 , floatNum = getFloat(currentStar) , starNum = parseInt(currentStar) ;
           for(var i = 0 ; i < starNum  ; i++){
               count ++ ;
               html+='<i class="'+noEvent+'" data-count="'+count+'"></i>';
           }



           if( 0.25 < floatNum && floatNum < 0.75){
               starNum += 1;
               html+='<i class="'+noEvent+' half-star" data-count="'+count+'"></i>';
           }else if(floatNum > 0.75){
               starNum += 1;
               html+='<i class="'+noEvent+'" data-count="'+count+'"></i>';
           }
           var noStarCount = starNum - maxCount;

           if(noStarCount < 0){
               for(var j = 0 ;  j < Math.abs(noStarCount) ; j++){
                   count ++ ;
                   html += '<i class="no-star '+noEvent+'" data-count="'+count+'"></i>'
               }
           }

           html += getLabel(starNum);

           $el.html(html);
           if(!noEvent){
            attachLabel();
           }
       }


      var attachLabel = function (){
          var count = 0;
          $el.find('i').each(function (key , value){
            var label = starLabel;
            if ($.isArray(starLabel)) {
                label = starLabel[count];
            }
            $(this).attr('title', label);
            count ++ ;
          })
      }

      this.on = function (eventName , cb){
          $event.on( EVENT_NAME_SPACE + ':'+ eventName , cb())
      };

      this.off = function (eventName ,cb ){
          $event.off( EVENT_NAME_SPACE + ':'+ eventName , cb)
      }

       _init();
   }

    return CommentStar;
}));