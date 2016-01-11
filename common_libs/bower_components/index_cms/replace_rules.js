/**
 * @fileoverview 根据index.html页面生成 vm/index_cms.vm模板  此处为替换规则的配置
 * @author millerliu */
 

var match1=/<ul class=\"sliderbox\" id=\"js_sliderbox\">[\s\S]*?<\/ul>/;
var replace1='\
	<ul class="sliderbox" id="js_sliderbox">\n\
		#set ( $srcAttr ="src" )\
		#foreach( $banner_item in $banner )\
		<li report-tdw="action=Banner-clk&ver1=$escape.html($banner_item.banner_id)"><a target="_blank" href="$escape.html($banner_item.link_url)"><img height="280" width="758" $srcAttr="$escape.html($banner_item.pic_url)"  title="$escape.html($banner_item.hover_tips)"/></a></li>\n\
		#set ( $srcAttr ="lazy-src" )\
		#end\
	</ul>\n';
var match2=/<ul class=\"slidernav\" id=\"js_slidernav\">[\s\S]*?<\/ul>/;
var replace2='\
	<ul class="slidernav" id="js_slidernav">\n\
		#foreach( $banner_item in $banner )\
		<li></li>\n\
		#end\
	</ul>';



var rules=[
	{match:match1,replace:replace1},
	{match:match2,replace:replace2}
];
module.exports= rules;
