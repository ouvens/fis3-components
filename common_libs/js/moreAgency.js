//TODO:拆分DB修改
;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define(['jquery', 'db', 'commonTemplate/common', 'base'], factory);
    } else {
        root['$'] = factory(root['$']);
    }
}(this, function ($, DB, TmplInline_common) {

  DB.extend({
    getMoreAgency: function(page, succ){
      var _this = this;
      var _opt = {};
      _opt.param = {
        page : page || 1,
        count : 11
      };
      _opt.url = '/cgi-bin/tool/get_bottom_agency';
      _opt.noNeedLogin = true;
      _opt.succ = succ;
      _this.cgiHttp(_opt);
    }
  });

  var PageViewer = function(container,pre_btn,next_btn,width,ajaxFn){

    this.pre_btn = pre_btn;
    this.next_btn = next_btn;
    this.container = container;
    this.width = width;
    this.ajaxFn = ajaxFn;
    this.nowPage = 1;

    this.maxPage = 5;

    this.isLoading = false;
  };
  PageViewer.prototype = {
    //课程翻页
    bindCoursePage : function(){

      this.pre_btn.show();
      this.next_btn.show();

      var _this = this;

      this.pre_btn.on("click",function(e){

        if(_this.nowPage <= 1)return ;

        _this.nowPage -= 1;

        _this.container.animate({marginLeft: '+='+_this.width+'px'},'normal');

        _this.checkBtnStatus();
      });

      this.next_btn.on("click",function(e){

        if(_this.nowPage >= _this.maxPage)return ;
        if(_this.next_btn.hasClass('slider_loading'))return ;

        _this.nowPage += 1;

        _this.next_btn[0].className = "slider_loading";
        _this.isLoading = true;

        _this.ajaxFn(_this.nowPage,function(isEnd){

          _this.isLoading = false;
          _this.next_btn[0].className = "next-btn";

          _this.container.animate({marginLeft: '-='+_this.width+'px'},'normal');

          if(isEnd)_this.maxPage = _this.nowPage;

          _this.checkBtnStatus();
        });

      });

    },
    checkBtnStatus : function(){

    this.pre_btn.removeClass("dis");
    this.next_btn.removeClass("dis");

    if(this.nowPage <= 1)return this.pre_btn.addClass("dis");
    if(this.nowPage >= this.maxPage)return this.next_btn.addClass("dis");
    }
  };

  var $agencyCache = {};
  var $agencyPage = 1;
  //拉取合作机构列表
  function getAgencyList(page,cb){

    page = page || 1;

    if($agencyCache[page])return (typeof cb ==="function") && cb();

    DB.getMoreAgency(page, function(data){

      var agencys = data.result.items || [];

      if(!agencys.length) return;

      $("#js_agency_list").append(TmplInline_common.agency_list({agencys: agencys}));

      $agencyCache[$agencyPage] = true;

      $agencyPage += 1;

      if(!cb && !data.result.end_flag){

        new PageViewer($("#js_agency_list"),$("#js_agency_pre"),$("#js_agency_next"),1100,getAgencyList).bindCoursePage();
      }
      else if(cb)cb(data.result.end_flag);

      $("#js_agency_cnt").lazyload();
    });
  }

  $.MoreAgency = function(selector) {
    $(selector).html(TmplInline_common.more_agency({agencys: []}));
    getAgencyList();
  };

}));