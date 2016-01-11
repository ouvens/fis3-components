/**
 *  @info:
 *  @author: chriscai
 *  @date: 2014/4/29
 */
(function (root , factory){

    if(typeof define == 'function' && define.amd ){
        define(['jquery' , 'pagectrl', 'commonTemplate/common' ] , factory);
    }else{
        root['Grid' ] = factory(root['jQuery'] ,  root['PageCtrl'], root['TmplInline_common']);
    }


}(window , function ($ , PageCtrl ,TmplInline_common){


        /**
         * grid
         * @param setting
         *              {
         *                  el :  '' // 需要生成 grid 的容器
         *                  data : [] // 数据
         *                  header : [{Object}] ， 必须
         *                           表头
         *                           传递的值为  :
         *                           name: 表头名字 ，为空则不显示
         *                           width:  10px | 10% | 10 , 每列的宽度 ,  如果此字段为空，为自动扩充,
         *                           className:
         *
         *                  gridTmpl , ''{Object} // 表格模版，空则默认使用 template/common/grid
         *                  dataTmpl , ''
         *                          {Object}|| {Function}
         *                          数据模版，空则默认使用 template/common/grid_data
         *                          如果是function ,传递 参数 {row : [] , colWidth : [] , ext : {}}  colWidth 每列的宽度 , ext 为render 传递的附属参数
         *
         *                  tableId : '' // 挂在的id
         *                  tableClass : '' // 挂载的 class
         *                  pageCtrl :
         *                            {Object}
         *                            pageCtrl 不传递，不初始化pageCtrl
         *                            参考 pageCtrl 插件{el , total , max , idx }
         *                            如果 el 为空 ，将使用模版中默认的 .grid-page-wrap
         *
         *                            onPageChange 可以监听 page 的变化
         *
         *
         *              }
     */
    var Grid =  function (setting){

        //TODO 全局 引入 ，TmplInline_common 后期改成 require
        var self = this,
            opt = {} ,
            header = [] ,
            gTmpl  = TmplInline_common ,
            dTmpl = TmplInline_common   ,
            data = [] ,
            $el,
            pageCtrl,
            $page ,
            pageCb = [];




        var _init = function (){
            opt = $.extend(opt , setting);
            if(!opt.header){
                throw 'header is undefined';
            }
            header = opt.header;
            opt.gridTmpl && (gTmpl = opt.gridTmpl);
            opt.dataTmpl && ( dTmpl = opt.dataTmpl);


            $el = $(opt.el);

            if(opt.data &&  opt.data.length > 0 ){
                data = opt.data;
            }

//            var oneColWidth = parseInt($el.width()/header.length);
//
//
//            $.each(header , function (key , value){
//                var width = value.width && (value.width + '') ;
//                if(!width){
//                    value.width = (oneColWidth-2 > 0 ? oneColWidth-2 : oneColWidth) + 'px';
//                    return ;
//                }else if(width.indexOf('px')!=-1){
//                    return ;
//                }else if(width.indexOf('%')!=-1){
//                    return ;
//                }
//                value.width =  width + 'px';
//            })

            generateColWidth(header);

            initGrid();

            bindEvent();
        };



        var generateColWidth = function (header){
            var colWidth = [],unWidthCount = 0 , fullWidth = $el.width();

            for(var i = 0 ; i< header.length ; i++){
                if(header[i].width){
                    var curWidth = parseInt(((header[i].width + '' ).replace('px' , '')));
                    header[i].width = curWidth + 'px';
                    fullWidth -= curWidth;

                }else {
                    unWidthCount ++ ;
                    colWidth.push(i);
                }
            }


            var oneColWidth = parseInt(fullWidth/unWidthCount);


            $.each(colWidth , function ( key , value){
                header[value].width =  (oneColWidth -1) + 'px';
            });

//            var count = 0;
//            $.each(header , function (key , value){
//                var width = value.width && (value.width + '') ;
//                if(!width){
//                    value.width = (oneColWidth-2 > 0 ? oneColWidth-2 : oneColWidth) + 'px';
//                    return ;
//                }else if(width.indexOf('px')!=-1){
//                    return ;
//                }else if(width.indexOf('%')!=-1){
//                    return ;
//                }
//                value.width =  width + 'px';
//                count
//            })


//            $.each(header , function (key , value){
//                var width = value.width && (value.width + '') ;
//                if(!width){
//                    value.width = (oneColWidth-2 > 0 ? oneColWidth-2 : oneColWidth) + 'px';
//                    return ;
//                }else if(width.indexOf('px')!=-1){
//                    return ;
//                }else if(width.indexOf('%')!=-1){
//                    return ;
//                }
//                value.width =  width + 'px';
//            })
        }


        var initGrid = function (){

            var gHtml = '';
            if(typeof gTmpl == 'function'){
                gHtml = gTmpl({
               	    tableId: opt.tableId || '',
                	tableClass: opt.tableClass || '',
                	headers: opt.header
                });
            }else {
                gHtml = gTmpl.grid({
                    tableId: opt.tableId || '',
                    tableClass: opt.tableClass || '',
                    headers: opt.header
                });
            }


            $el.html(gHtml);

            if(opt.pageCtrl){
                self.resetPageCtrl(opt.pageCtrl);
            }


            if(data.length > 0){
                self.render(data);
            }
        }


        var bindEvent = function (){
            $el.find('.grid-data').delegate('tr' , 'mouseenter mouseleave', function (event){
                if(event.type === 'mouseenter' ){
                    $(this).addClass('grid-row-hover')
                }else{
                    $(this).removeClass('grid-row-hover')
                }

            } );
        }


        //////////           private attribute            ///////



        //////////           public attribute            ///////


        this.pageCtrl = null;



        this.render = function (data , ext){
            var dataHtml = '',colWidth =  [];


            for(var i = 0 ; i < header.length ; i ++ ){
                colWidth[i] = header[i].width;
            }

//            if(!colWidth || !colWidth.length ){
//                var oneColWidth = parseInt($el.width()/data.length);
//
//                for(var i = 0 ; i < data.length ; i ++){
//                    colWidth[i] = oneColWidth-2 > 0 ? oneColWidth-2 : oneColWidth;
//                }
//            }

            if(typeof dTmpl == 'function'){
                dataHtml = dTmpl({ rows : data, colWidth : colWidth , ext : ext });
            }else {
                dataHtml = dTmpl.grid_data({
                    rows : data,
                    colWidth : colWidth ,
                    ext : ext
                });
            }

            var rowCount = 1;
            dataHtml = dataHtml.replace(/(^\s*)|(\s*$)/g,'');
            var $dataHtml = $(dataHtml).each(function (key , value){
                var colCount = 1;
                $(this).addClass( 'grid-row-' + rowCount);
                $(this).find('td').each(function (key , value){
                    if ( ($(this).attr('style') + '').indexOf('width') <0) {
                        $(this).css('width' , colWidth[colCount - 1]);
                    }
                    $(this).addClass('grid-col-' + colCount);
                    colCount ++ ;
                });
                rowCount ++ ;
            })

            // console.log($dataHtml);
            $el.find('.grid-data tbody').html($dataHtml);
        }


        this.onPageChange = function (cb){
            pageCb.push(cb);
        }

        this.resetPageCtrl = function (pageOpt){

            if(this.pageCtrl){
                this.pageCtrl.reset(pageOpt);
            }else{
                $page = $( pageOpt.el || $el.find('.sort-page') );
                this.pageCtrl = new PageCtrl($page , function (){
                    var args = arguments;
                    $.each(pageCb , function (key ,value ){
                        value.apply(self,args);
                    })
                } , {
                    max : pageOpt.max ,
                    total : pageOpt.total ,
                    begin : pageOpt.begin || 0,
                    idx: pageOpt.idx || 1
                } );
            }
        }

        this.delegate = function (target , type , cb){
            $el.delegate(target , type , function (e){
                cb(self , e);
            });
        }


        this.getRowCount = function (){
            return $el.find('.grid-data-wrap table tr').length;
        }


        this.jumpPage = function (page){
            if(!this.pageCtrl){
                return ;
            }
            $page.find('.page-btn[data-index='+page+']').trigger('click');

        }

        this.toggleLoad = function (){
            var $load = $el.find('.loading-wrap')
            if($load.is(':hidden')){
                $load.show().spin({top : '100px'});
            }else {
                $load.hide();
            }
        }

        this.showLoad = function (){
            var $load = $el.find('.loading-wrap')
                $load.show().spin({top : '100px'});
        }

        this.hideLoad = function (){
            var $load = $el.find('.loading-wrap')
            $load.hide();
        }

        this.destroy = function (){
            $el.html();
            $el.undelegate();
            $el.find('.grid-data').undelegate();
            if(this.pageCtrl){
                this.pageCtrl.destroy();
            }
        }


        _init();
    };

    return Grid;
}));
