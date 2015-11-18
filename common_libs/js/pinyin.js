/*!
 * Description: Pinyin, to get chinese pinyin from chinese
 * 字典的更新参考: https://raw.githubusercontent.com/yorts52/pinyin/master/tools/update-dict.js
 */
;(function (root, factory) {
    if (typeof define === 'function' && define.amd) {
        define([], factory);
    } else {
        root['Pinyin'] = factory();
    }
})(this, function () {

    var Pinyin = {};
    var CHARS_MAX_LENGTH = 100; // 拼音串最长

    Pinyin.dict = {"er":"二贰儿而耳尔饵","shi":"十时实蚀士示世市式势事侍饰试视柿是适室逝释誓拭恃嗜尸失师诗狮施湿虱史使始驶矢屎","yi":"乙已以蚁倚一衣医依伊揖壹亿义艺忆议亦异役译易疫益谊意毅翼屹抑邑绎奕逸肄溢仪宜姨移遗夷胰椅","chang,an,han":"厂","ding,zheng":"丁","qi":"七戚欺漆柒凄嘁乞企启起气弃汽器迄泣妻骑棋旗歧祈脐畦崎鳍","bu,bo":"卜簿","ren":"人仁刃认韧纫任忍","ru":"入褥如儒蠕乳辱","jiu":"九久酒玖灸韭旧救就舅臼疚纠究揪鸠","ba":"八巴疤叭芭捌笆坝爸霸把吧拔跋靶","ji":"几及吉级极即急疾集籍棘辑嫉己挤脊计记技忌际季剂迹既继寄绩妓荠寂鲫冀击饥圾机肌鸡积基激讥叽唧畸箕纪济","liao,le":"了","li":"力历厉立励利例栗粒吏沥荔俐莉砾雳痢礼李里理鲤丽厘狸离犁梨璃黎漓篱哩","dao":"刀导岛蹈捣祷到盗悼道稻倒","nai":"乃奶耐奈","san":"三叁伞散","you":"又右幼诱佑友尤由邮犹油游有优忧悠幽","yu":"于余鱼娱渔榆愚隅逾舆与予玉育狱浴预域欲遇御裕愈誉芋郁喻寓豫屿宇羽雨语迂淤","gan":"干甘肝竿柑杆秆赶敢感橄","gong":"工弓公功攻宫恭躬巩汞拱共贡供","kui":"亏盔窥葵魁愧","tu":"土吐秃突凸图徒途涂屠兔","cun":"寸存村","da,dai,tai":"大","cai":"才材财裁采菜彩睬踩猜","xia":"下夏虾瞎峡狭霞匣侠暇辖","zhang":"丈仗帐胀障杖账张章彰樟涨掌","shang":"上伤商尚晌赏","wan,mo":"万","kou":"口扣寇抠","xiao":"小晓孝笑效哮啸消宵销萧硝箫嚣肖淆","jin":"巾斤今金津筋襟仅尽进近晋浸紧锦谨禁","shan":"山删衫珊闪陕扇善擅膳赡苫","qian":"千迁牵谦签欠歉前钱钳潜黔遣谴","chuan":"川穿串船喘","ge":"个各革阁格隔哥鸽割歌戈胳搁葛","shao":"勺芍少绍哨捎稍烧","fan":"凡烦矾樊反返犯饭泛范贩帆翻","xi":"夕西吸希析牺息悉惜稀锡溪熄膝昔晰犀熙嬉蟋习席袭媳细隙喜徙","wan":"丸完玩顽弯湾豌挽晚碗惋婉腕","yao,mo,ma,me":"么","guang,an":"广","wang,wu":"亡","men":"门们闷","zhi":"之支汁芝肢脂蜘止旨址纸指趾只执直侄值职植至志帜制质治致秩智置挚掷窒滞稚知织","zi":"子紫姊籽滓自字姿资滋咨","wei":"卫未位味畏胃喂慰谓猬蔚魏为伟伪苇纬萎危威微偎薇巍违围唯维桅委","ye":"也冶野业页夜液谒腋爷掖椰","nv,ru":"女","fei":"飞非啡肺废沸费吠肥匪诽菲","ma":"马码玛吗妈蚂骂麻","cha":"叉岔衩茶察茬插杈碴","feng":"丰封疯峰锋蜂枫风凤奉讽逢缝","xiang":"乡香箱厢湘镶向项象像橡享响想相祥翔","jing":"井警阱茎京经惊晶睛精荆兢鲸径竞竟敬静境镜靖","wang":"王网往枉妄忘旺望汪","kai":"开揩凯慨","tian":"天添田甜恬舔","wu":"无吴芜梧蜈五午伍武侮舞捂鹉勿务物误悟雾坞晤乌污呜屋巫诬","fu":"夫父付负妇附咐赴复傅富腹覆赋缚伏扶俘浮符幅福凫芙袱辐蝠抚斧府俯辅腐甫脯肤麸孵敷服","zhuan":"专砖赚撰","yuan":"元园原圆援缘源袁猿辕远怨院愿冤鸳渊","yun":"云匀耘允陨孕运韵酝蕴晕","za,zha":"扎","mu":"木目牧墓幕暮慕沐募睦穆母亩牡拇姆","ting":"厅听挺艇亭庭停蜓廷","bu,fou":"不","qu,ou":"区","quan":"犬劝权全泉拳痊","tai":"太态泰汰台苔抬胎","che,ju":"车","pi":"匹皮疲脾啤批披坯霹僻屁譬劈","ju":"巨拒具俱剧距惧锯聚炬局菊橘居鞠驹矩举据沮","ya":"牙芽崖蚜涯衙轧亚讶压呀押鸦鸭哑雅","bi":"比彼笔鄙匕秕币必毕闭毙碧蔽弊避壁庇蓖痹璧逼鼻荸","jie":"皆阶接街秸介戒届界借诫节结劫杰洁捷截竭姐","hu":"互户护沪乎呼忽虎狐胡壶湖蝴弧葫糊","qie":"切茄窃怯","wa":"瓦挖蛙洼娃袜","tun,zhun":"屯","ri":"日","zhong":"中众仲忠终钟盅衷肿","gang":"冈刚纲缸肛杠岗钢","nei,na":"内","bei":"贝备倍辈狈惫焙北杯悲碑卑背","shui":"水谁税睡","jian,xian":"见","niu":"牛扭纽钮","shou":"手守首收寿受授售兽瘦","mao":"毛矛茅锚茂贸帽貌猫铆","sheng":"升生声牲笙甥圣胜剩绳","chang,zhang":"长","shi,shen":"什","pian":"片偏篇翩骗","pu":"仆扑葡菩蒲铺普谱圃浦","hua":"化划华花画话桦哗猾滑","chou,qiu":"仇","zhao,zhua":"爪","reng":"仍扔","cong,zong":"从","xiong":"凶兄胸匈汹雄熊","fen":"分坟焚芬吩纷氛奋粪愤忿粉","fa":"乏伐罚阀筏发法","cang":"仓苍舱沧","yue":"月阅悦跃越岳粤","shi,zhi":"氏识","dan":"丹耽旦但诞淡蛋氮担胆","gou":"勾沟钩构购够垢狗苟","wen":"文闻蚊问纹温瘟稳吻紊","liu,lu":"六","huo":"火伙或货获祸惑霍活","fang":"方芳仿访纺防妨房肪坊放","dou":"斗抖陡蚪豆逗痘兜","ding":"订定锭叮盯钉顶鼎","xin":"心辛欣新薪锌芯衅","chi,che":"尺","yin":"引饮蚓瘾印因阴音姻茵银吟淫隐","chou":"丑抽绸酬筹稠愁畴","kong":"孔恐空控","dui":"队对堆","ban":"办半扮伴瓣绊板版班般斑搬扳颁","shu":"书叔殊梳舒疏输蔬抒枢淑束述树竖恕庶墅漱暑鼠薯黍蜀署曙熟秫赎","shuang":"双霜爽","huan":"幻换唤患宦涣焕痪欢环缓","kan":"刊堪勘砍坎看","mo":"末沫漠墨默茉陌寞摸膜魔馍摹蘑磨","da":"打达搭答瘩","qiao":"巧乔侨桥瞧荞憔悄锹敲跷峭窍撬翘","zheng":"正挣症争征睁筝蒸怔狰证郑政整拯","ba,pa":"扒耙","qu":"去曲驱屈岖蛆躯取娶","gu":"古谷股鼓估固故顾雇孤姑辜咕沽菇箍骨","ben":"本奔笨","shu,zhu":"术属","bing":"丙柄饼秉禀冰兵并病","ke":"可克刻客课科棵颗磕蝌渴坷","zuo":"左作坐座做昨","bu":"布步怖部埠补捕哺","shi,dan":"石","long":"龙聋隆咙胧窿拢垄笼","mie":"灭蔑","ping":"平评凭瓶萍坪乒","dong":"东冬动冻栋洞董懂","qia,ka":"卡","shuai":"帅蟀甩摔","gui":"归规闺硅瑰轨鬼诡贵桂跪刽","zhan":"占斩盏展沾粘毡瞻战站栈绽蘸","qie,ju":"且","ye,xie":"叶","jia":"甲钾加佳嘉枷驾架嫁稼假荚颊","shen":"申伸身深呻绅肾渗慎审婶甚神","hao":"号好耗浩毫豪壕嚎蒿","dian":"电店垫殿玷淀惦奠典点碘颠掂","yang":"央殃秧鸯扬阳杨洋养氧痒样漾","diao":"叼雕刁碉吊钓掉","jiao":"叫轿较窖酵交郊浇娇骄胶椒焦蕉礁狡饺绞脚搅教矫","ling":"另令伶灵铃陵零龄玲凌菱蛉翎岭领","tao,dao":"叨","si":"四寺饲肆司丝私斯撕嘶死","tan":"叹炭探碳坛谈痰昙谭潭檀坦毯袒贪摊滩瘫","qiu":"丘秋蚯求球囚","he":"禾河荷盒何贺赫褐鹤","dai":"代带贷怠袋逮戴呆待歹","xian":"仙先掀锨闲贤弦咸衔嫌涎舷现限线宪陷馅羡献腺显险鲜","bai":"白百摆败拜掰","zi,zai":"仔","chi":"斥赤翅吃嗤痴池驰迟持弛齿耻侈","ta":"他它塌塔踏蹋","gua":"瓜刮挂卦褂寡","cong":"丛匆葱聪囱","yong":"用永咏泳勇蛹踊佣拥庸","le,yue":"乐","ju,gou":"句拘","ce":"册厕测策","wai":"外歪","chu":"处出初除厨锄雏橱础储楚触矗","niao":"鸟","bao":"包胞苞褒报抱爆豹饱宝保雹","zhu":"主煮嘱拄竹逐烛住注驻柱祝铸贮蛀珠株诸猪蛛筑","lan":"兰拦栏蓝篮澜览懒揽缆榄烂滥","tou":"头投透偷","hui":"汇绘贿惠慧讳诲晦秽灰挥恢辉徽回茴蛔悔毁","han":"汉旱捍悍焊撼翰憾汗含寒函涵韩喊罕酣憨","tao":"讨逃桃陶萄淘套涛掏滔","xue":"穴学雪靴薛","xie":"写协胁斜携鞋谐泻卸屑械谢懈蟹歇楔蝎","ning,zhu":"宁","rang":"让壤攘嚷瓤","xun":"训讯迅汛驯逊殉旬寻巡询循勋熏","min":"民敏皿闽悯","ni":"尼你拟泥逆昵匿腻","liao":"辽疗僚聊寥嘹缭料镣撩燎瞭","nu":"奴努怒","zhao,shao":"召","bian":"边编鞭蝙变遍辨辩辫贬匾","kang,gang":"扛","xing":"刑形型邢兴杏幸性姓星腥猩醒","kao":"考烤拷靠铐","tuo":"托拖脱妥椭驼驮鸵唾","lao":"老劳牢捞涝酪唠","kuo":"扩阔廓","di,de":"地的底","sao":"扫嫂搔骚臊","chang":"场肠尝常偿昌猖畅唱倡敞","mang":"芒忙盲茫莽","xiu":"朽秀袖绣锈嗅修羞","pu,po,piao":"朴","guo":"过果裹国锅郭","chen":"臣尘辰沉陈晨忱衬趁","zai":"再在灾栽载宰","yan":"厌艳宴验雁焰砚唁谚堰延严言岩炎沿盐颜阎蜒檐研烟淹掩眼演衍燕奄","kua":"夸垮跨胯","jiang":"匠酱江姜僵缰讲奖桨蒋将浆","duo":"夺踱朵躲多哆惰舵跺垛","lie":"列劣烈猎裂咧","xie,ya,ye,yu,xu":"邪","jia,ga,xia":"夹","cheng":"成呈诚承城程惩橙秤撑逞","mai":"迈麦卖买","ci":"此次赐词辞慈磁祠瓷雌刺","zhen":"贞针侦珍真斟榛阵振震镇诊枕疹","jian":"尖奸歼坚肩艰兼煎件建荐贱剑健舰践鉴键箭涧间监拣茧俭捡检减剪简柬碱渐溅","guang":"光逛","dang":"当挡荡档党裆","zao":"早枣澡蚤藻皂灶造燥躁噪遭糟凿","xia,he":"吓","chong":"虫崇冲充宠","tuan":"团","tong":"同统桶筒捅桐铜童彤瞳通痛","qi,kai":"岂","ze":"则责","sui":"岁碎穗祟遂隧虽随髓","rou":"肉柔揉蹂","zhu,shu":"朱","nian":"年念蔫撵碾","diu":"丢","she":"舌设社舍涉赦奢赊","chuan,zhuan":"传","pang":"乓胖庞螃","xiu,xu":"休","jia,jie":"价家","fen,bin":"份","yang,ang":"仰","xie,xue":"血","si,shi":"似","hou":"后厚候吼喉猴侯","zhou":"舟州周洲宙昼皱骤咒肘帚轴","hang,xing":"行","hui,kuai":"会","sha":"杀纱杉砂沙煞傻啥霎","he,ge":"合","zhao":"兆赵照罩找沼招昭","chuang":"创闯床疮窗","za":"杂砸","ming":"名明鸣铭螟命","se":"色涩瑟","zhuang":"壮状撞庄装妆桩","qing":"庆青轻倾清蜻氢卿顷请情晴擎","liu":"刘留流榴琉硫瘤柳溜馏","qi,ji,zi,zhai":"齐","chan":"产铲阐馋缠蝉搀","yang,xiang":"羊","deng":"灯登蹬等凳邓瞪","mi":"米迷谜靡眯密蜜觅弥咪","guan":"关官棺观冠贯惯灌罐馆管","jue":"决绝掘诀爵倔","tang,shang":"汤","zhai":"宅债寨窄摘斋","an":"安氨庵鞍岸按案暗俺","jun":"军均君钧俊峻骏竣菌","xu,hu":"许","lun":"论轮仑伦沦抡","nong":"农浓脓","na,nei":"那","sun,xun":"孙","xi,hu":"戏","ta,jie":"她","hong,gong":"红","xian,qian":"纤","yue,yao":"约钥","nong,long":"弄","tun":"吞臀","huai,pei,pi":"坏","rao":"扰饶绕","che":"扯彻撤澈","zou":"走奏揍","chao":"抄钞超吵炒潮巢","zhe,she":"折","qiang,cheng":"抢","zhua":"抓","pao":"抛泡袍咆跑","kang":"抗炕康糠慷","keng":"坑","ke,qiao":"壳","kuai":"块快筷","que":"却确鹊缺瘸","qin":"芹琴禽勤秦擒侵钦寝","lu":"芦炉卢庐颅陆录鹿路赂虏鲁卤","su":"苏诉肃素速塑粟溯俗酥","du":"杜渡妒镀肚独牍堵赌睹督","geng":"更耕羹埂耿梗","liang":"两良梁粮粱亮谅辆晾凉量","huan,hai":"还","fou,pi":"否","lai":"来莱赖癞","lian":"连怜帘莲联廉镰练炼恋链脸敛","xian,xuan":"县","zhu,chu":"助","kuang":"旷况矿框眶狂筐","zu":"足族阻组祖诅租","dun":"吨蹲墩盾顿钝盹","kun":"困昆坤捆","nan":"男","yuan,yun":"员","chui":"吹炊垂锤捶","bie":"别憋鳖瘪","gao":"告高糕羔篙搞稿镐膏","wo":"我沃卧握窝蜗","luan":"乱卵峦","mei":"每美妹昧媚眉梅煤霉玫枚媒楣","ti,ben":"体","bo,bai,ba":"伯","di":"低堤滴抵帝递第蒂缔敌笛涤嘀嫡","fo,fu,bi,bo":"佛","lin":"邻林临琳磷鳞淋吝赁躏凛檩","gui,jun,qiu":"龟","mian":"免勉娩冕缅面眠绵棉","jiao,jue":"角嚼","tiao":"条挑笤","ying":"迎盈营蝇赢荧莹萤应英樱鹰莺婴缨鹦映硬影颖","xi,ji":"系","ku":"库裤酷苦枯哭窟","leng":"冷楞","zhe,zhei":"这","xu":"序叙绪续絮蓄旭恤酗婿须虚需徐","pan":"判盼叛畔盘攀潘","di,ti,tui":"弟","can":"灿残蚕惭惨餐","mei,mo":"没","shen,chen":"沈","huai":"怀槐徊淮","song":"宋送诵颂讼松耸","hong":"宏虹洪鸿轰烘哄","qiong":"穷琼","niao,sui":"尿","ceng":"层蹭","wei,yi":"尾","gai":"改该溉概丐钙","a,e":"阿","miao":"妙庙苗描瞄秒渺藐","yao":"妖腰邀夭吆药耀要咬舀窑谣摇遥肴姚","jin,jing":"劲","chun":"纯唇醇春椿蠢","na":"纳钠捺拿","bo":"驳脖博搏膊舶渤拨波玻菠播跛簸","zong":"纵宗棕踪总","lv":"驴律虑滤氯旅屡吕侣铝缕履","biao":"表标彪膘","mo,ma":"抹摩","guai":"拐乖怪","pai":"拍派湃排牌徘","zhe":"者哲辙浙蔗遮","chai,ca":"拆","la":"垃拉啦喇蜡辣","ban,pan":"拌","po":"坡泼颇破魄婆","ze,zhai":"择","qi,ji":"其奇期","ruo,re":"若","ping,peng":"苹","zhi,qi":"枝","gui,ju":"柜","qiang":"枪腔墙呛","sang":"丧桑嗓","ou":"欧殴鸥偶藕呕","zhuan,zhuai":"转","ruan":"软","ken":"肯垦恳啃","xie,suo":"些","ang":"昂肮","ni,ne":"呢","tie":"帖贴铁","luo":"罗萝锣箩骡螺逻骆洛啰裸","he,huo,hu":"和","ce,ze,zhai":"侧","pei":"佩配沛陪培赔胚","po,pai":"迫","pa":"爬怕帕趴","suo":"所索锁琐唆梭嗦","pin":"贫拼品聘","peng":"朋棚蓬膨硼鹏澎篷捧碰砰烹","hun":"昏婚荤浑魂混","jing,cheng":"净","nao":"闹挠恼脑","zha":"闸铡眨炸渣榨乍诈","juan":"卷捐鹃倦绢眷","quan,xuan":"券","dan,shan,chan":"单","qian,jian":"浅","xie,yi":"泄","lei":"泪类垒蕾儡累雷擂","bo,po":"泊","ze,shi":"泽","lang":"郎狼廊琅榔浪朗","xiang,yang":"详","li,dai":"隶","shua":"刷耍","meng":"孟梦萌盟檬朦猛锰蒙","jiang,xiang":"降","can,shen,cen,san":"参","bang":"帮邦梆绑膀棒傍谤榜","du,dai":"毒","kua,ku":"挎","shuan":"拴栓涮","kuo,gua":"括","shi,she":"拾","mou":"某谋","nuo":"挪诺懦糯","xiang,hang":"巷","cao":"草槽曹操糙","huang":"荒慌皇黄煌凰惶蝗蟥晃谎恍幌","rong":"荣绒容熔融茸蓉溶榕冗","nan,na":"南","cha,zha":"查","bai,bo":"柏","qi,qie":"砌","sheng,xing":"省","xiao,xue":"削","mao,mo":"冒","si,sai":"思","yan,ye":"咽","zan,za":"咱","ha":"哈","na,nei,ne":"哪","ke,hai":"咳","zen":"怎","xuan":"选癣宣轩喧悬玄漩旋炫","zhong,chong":"种重","bian,pian":"便扁","lia":"俩","duan":"段断缎锻短端","cu":"促醋簇粗","shun":"顺瞬吮","xin,shen":"信","zhui,dui":"追","hen":"很狠恨痕","pen":"盆喷","shi,si,yi":"食","mai,mo":"脉","ai":"哀哎埃挨唉爱碍艾隘矮蔼癌","du,duo":"度","qin,qing":"亲","cha,chai,ci":"差","pao,bao":"炮刨","ti":"剃惕替屉涕梯踢剔题蹄啼","sa,xi":"洒","zhuo":"浊啄灼茁卓酌捉桌拙","xi,xian":"洗","qia":"洽恰掐","ran":"染然燃","heng":"恒衡横哼","jue,jiao":"觉","ao":"袄傲澳懊熬","shuo,shui,yue":"说","tui":"退蜕推腿颓","hai":"孩海害亥骇","mu,lao":"姥","gei,ji":"给","luo,lao":"络","mai,man":"埋","nie":"捏聂镊孽","du,dou":"都读","sun":"损笋","re":"热惹","mo,mu":"莫模","e,wu":"恶","xiao,jiao":"校","he,hu":"核","gen":"根跟","chai":"柴豺","shai":"晒筛","en":"恩","a":"啊","ba,pi":"罢","zei":"贼","zuan":"钻","qian,yan":"铅","te":"特","cheng,sheng":"乘","mi,bi":"秘泌","cheng,chen":"称","tang,chang":"倘淌","chou,xiu":"臭","she,ye,yi":"射","hang":"航杭","weng":"翁嗡瓮","die":"爹跌叠蝶谍碟","cui":"脆翠悴粹催摧崔","zang":"脏葬赃","e":"饿扼遏愕噩鳄鹅额讹俄","shuai,cui":"衰","zhun":"准谆","teng":"疼腾誊藤","tang":"唐堂塘膛糖棠搪烫趟躺","pou":"剖","xu,chu":"畜","pang,bang":"旁","run":"润闰","yong,chong":"涌","kuan":"宽款","bin":"宾滨彬缤濒鬓","bei,pi":"被","tiao,diao,zhou":"调","bao,bo":"剥薄","ruo":"弱","niang":"娘酿","neng,nai":"能","nan,nuo":"难","lve":"掠略","zhu,zhuo,zhe":"著","le,lei":"勒","shao,sao":"梢","fu,pi":"副","piao":"票漂飘瓢","sheng,cheng":"盛","que,qiao":"雀","chi,shi":"匙","she,yi":"蛇","zhan,chan":"崭","quan,juan":"圈","nin":"您","de,dei":"得","cou":"凑","zhuo,zhao,zhe":"着","shuai,lv":"率","gai,ge,he":"盖","qu,ju":"渠","su,xiu":"宿","dan,tan":"弹","jing,geng":"颈","lv,lu":"绿","qu,cu":"趋趣","ti,di":"提","jie,qi":"揭","sou":"搜艘嗽","lou":"搂楼娄漏陋篓","zhao,chao":"朝","la,luo,lao":"落","sen":"森","gun,hun":"棍","zhi,shi":"殖","sha,xia":"厦","zan":"暂赞","zui":"最罪醉嘴","jing,ying":"景","he,ye":"喝","hei":"黑","rui":"锐瑞蕊","bao,bu,pu":"堡","ao,yu":"奥","fan,pan":"番","la,xi":"腊","man":"蛮馒满漫慢曼幔","zun":"尊遵","gang,jiang":"港","zeng,ceng":"曾","yu,tou":"愉","cuan":"窜篡","qun":"裙群","qiang,jiang":"强","zhou,yu":"粥","she,nie":"摄","tian,zhen":"填","suan":"蒜算酸","lu,liu":"碌","nuan":"暖","tiao,tao":"跳","e,yi":"蛾","cuo":"错挫措锉搓","jie,xie":"解","shu,shuo":"数","gun":"滚","sai,se":"塞","bi,pi":"辟","pie":"撇","chang,shang":"裳","yi,ni":"疑","sai":"赛腮","nen":"嫩","suo,su":"缩","sa":"撒飒萨","zeng":"增憎赠","man,men":"瞒","bao,pu":"暴","de":"德","ning":"凝狞柠拧泞","jiao,zhuo":"缴","ca":"擦","cang,zang":"藏","fan,po":"繁","bi,bei":"臂","beng":"蹦泵崩绷","chan,zhan":"颤","jiang,qiang":"疆","lou,lu":"露","nang":"囊","hang,ben":"夯","ao,wa":"凹","feng,ping":"冯","xu,yu":"吁","lei,le":"肋","jie,gai":"芥","zhi,zi":"吱","na,ne":"呐","dun,tun":"囤","hang,keng":"吭","dian,tian":"佃","si,ci":"伺","dian,tian,sheng":"甸","dui,rui,yue":"兑","zhui":"坠缀赘锥","tuo,ta,zhi":"拓","fu,bi":"拂","ao,niu":"拗","ke,he":"苛","he,a,ke":"呵","ka,ga":"咖","jiao,yao":"侥","cha,sha":"刹","nve,yao":"疟","meng,mang":"氓","ge,yi":"疙","zu,cu":"卒","wan,yuan":"宛","qi,qie,xie":"契","xie,jia":"挟","zha,shan,shi,ce":"栅","bo,bei":"勃","nve":"虐","yo":"哟","qiao,xiao":"俏","shuo":"烁","ping,bing":"屏","na,nuo":"娜","qi,xi":"栖","gu,jia":"贾","bang,beng":"蚌","gong,zhong":"蚣","yin,yan":"殷","nei":"馁","wo,guo":"涡","lao,luo":"烙","nian,nie":"捻","chan,xian,can,shan":"掺","dan,shan":"掸","qian,gan":"乾","shuo,shi":"硕","hu,xia":"唬","dang,cheng":"铛","xian,xi":"铣","kui,gui":"傀","ji,zhai":"祭","chun,zhun":"淳","wei,yu":"尉","duo,hui":"堕","chuo,chao":"绰","zong,zeng":"综","zhuo,zuo":"琢","chuai,tuan,zhui":"揣","peng,bang":"彭","zhui,chui":"椎","leng,ling":"棱","zha,cha":"喳","ge,ha":"蛤","qian,kan":"嵌","a,yan":"腌","dun,dui":"敦","kui,hui":"溃","jiong":"窘","kai,jie":"楷","pin,bin":"频","ni,niao":"溺","miu":"谬","jiao,chao":"剿","man,wan":"蔓","seng":"僧","tui,tun":"褪","cuo,zuo":"撮","bang,pang":"磅","chao,zhao":"嘲","hei,mo":"嘿","chuang,zhuang":"幢","ji,qi":"稽","lao,liao":"潦","cheng,deng":"澄","ma,mo":"蟆","mi,mei":"糜","huo,hua":"豁","pu,bao":"瀑","chuo":"戳","zan,cuan":"攒"};

    Pinyin.relookup = function() {
        for (var key in Pinyin.dict){
            var value = Pinyin.dict[key];
            for (var i = 0, l = value.length; i < l; i++) {
                Pinyin.dict[value.charAt(i)] = key;
            }
        }
        Pinyin.is_relookup = true;
    };

    Pinyin.getFullChars = function(str, is_capitalize) {
        var chars = [];
        var result = [];
        var res_len, i, l;
        if (!str) return "";
        for (i = 0, l = str.length; i < l; i++) {
            chars.push(Pinyin.getSingleChars(str.charAt(i), is_capitalize));
        }

        for (i = 0, l = chars.length; i < l; i++) {
            var temp = chars[i];
            if (i === 0) {
                while(temp.length) {
                    result.push([temp.shift()]);
                }
            } else {
                if (temp.length === 1) { // 非多音字
                    res_len = result.length;
                    while(res_len) {
                        --res_len;
                        result[res_len].push(temp[0]);
                    }
                } else { // 多音字
                    var new_res = [];
                    res_len = result.length;
                    while(temp.length && res_len < CHARS_MAX_LENGTH) {
                        var temp_val = temp.shift();
                        res_len = result.length;
                        while(res_len) {
                            --res_len;
                            var temp_arr = result[res_len].concat();
                            temp_arr.push(temp_val);
                            new_res.push(temp_arr);
                        }
                    }
                    result = new_res.reverse();
                }
            }
        }
        var ans = [];
        for (i = 0, l = result.length; i < l; i++) {
            ans.push(result[i].join(""));
        }
        return ans.join(" ");
    };

    Pinyin.getSingleChars = function(ch, is_capitalize){
        // 根据字典简历反查索引, 只需要执行一次
        !Pinyin.is_relookup && Pinyin.relookup();
        var unicode = ch.charCodeAt(0);
        var result = (unicode > 40869 || unicode < 19968) ? [ch] : (Pinyin.dict[ch] || "").split(",");
        if (is_capitalize) {
            for(var i = 0, l = result.length; i < l; i++) {
                result[i] = result[i].replace(/^[a-z]/, function(v){return v.toUpperCase();});
            }
        }
        return result;
    };

    return Pinyin;
});
