/**
 * Browser CSS Compatibility Fix
 */
(function($){
this.cssFix = cssFix;
//选择器模型分类
var pseudoClasses = sto(':active :first-child :focus :hover :lang :link :visited :first :left :right :root :nth-child :nth-last-child :nth-of-type :nth-last-of-type :last-child :first-of-type :last-of-type :only-child :only-of-type :empty :target :not :enabled :disabled :checked :indeterminate :default :valid :invalid :in-range :out-of-range :required :optional :read-only :read-write');
var pseudoElements = sto(':after :before :first-letter :first-line ::after ::before ::first-letter ::first-line ::selection');// ::value ::choices ::repeat-item ::repeat-index');
var combinatorsSelectors = sto('E+F E>F E~F');
var attributeSelectors = sto('[ns|attr] [att] [att=val] [att|=val] [att~=val] [att^=val] [att*=val] [att$=val]');
var atRules = sto('@charset @import @media @page @font-face @namespace');
var cssProperties = sto('height min-height max-height width min-width max-width margin-top margin-right margin-bottom margin-left margin padding-top padding-right padding-bottom padding-left padding border-top-color border-top-style border-top-width border-top border-right-color border-right-style border-right-width border-right border-bottom-color border-bottom-style border-bottom-width border-bottom border-left-color border-left-style border-left-width border-left border-color border-style border-width border outline-color outline-style outline-width outline display position float clear visibility top right bottom left z-index overflow clip list-style-type list-style-position list-style-image list-style table-layout border-collapse border-spacing empty-cells caption-side background-color background-image background-repeat background-position background-attachment background color font-family font-size font-weight font-style font-variant font letter-spacing word-spacing line-height text-align text-decoration text-indent text-transform text-shadow vertical-align white-space direction');
var elementSelectors = sto('* .. . # ns|E T');
var propertychange=0;
this.cssFix.pseudoClasses=pseudoClasses;
this.cssFix.pseudoElements=pseudoElements;
this.cssFix.combinatorsSelectors=combinatorsSelectors;
this.cssFix.atRules=atRules;
this.cssFix.attributeSelectors=attributeSelectors;
this.cssFix.elementSelectors=elementSelectors;

//jQuery 中没有定义的伪类 filter
var notExprFilters= {};
this.cssFix.notExprFilters = notExprFilters;

var doc=document;
this.cssFix.fixVer = 7;
this.cssFix.initFix = initFix;
this.cssFix.getCompatibility =getCompatibility;
this.cssFix.preFixClass =preFixClass;
this.cssFix.sto =sto;

var debug=[];
function sto(s) {
	s = s.split(' ');
	var o = {};
	for (var i = s.length - 1; i >= 0; i--) {
		o[s[i]] = 1;
	};
	return o;
}

/**
 * 建立 pseudo 节点
 * @param  string name      节点的 pseudoNode 属性名称
 * @param  string className
 * @return Element          新创建的节点元素
 */
function pseudoNode(name,className){
	var i=doc.createElement('pseudo');
	i.pseudoNode=name;
	if(className)
		i.className=className;
	return i;
}

/**
 * 获取兼容性定义
 */
function getCompatibility (){
	return BCCF;
}
/**
 * 设定css fix
 * @param string fixClass      已经设定好前缀的 fixClass
 * @param string selector    原始选择器
 * @param array fixPatterns 经过分析的修正 Patterns
 */
function preFixClass (that){
	if(that) prefixClass=that;
	return prefixClass;
}
/**
 * cssFix 入口
 * @note 由 bccp 生成的代码调用,过滤掉无须处理的选择器
 * 这个过滤其实是一个用户使用BUG,因为不应该出现这个情况
 * @param  string fixSelector	fix 后的完整选择器
 * @param  array selectors		数组化的原始选择器
 * @param  array fixPatterns	数组化的 fixSelector
 * @param  array types			原始选择器对应的类型分析
 * @param  object rules			规则定义中不兼容的定义
 */
function cssFix(fixSelector,selectors,fixPatterns,types,rules){
	if(!$.browser.msie) return;
	var i,p,fps=[],ps={};
	/*
	for( i=0;i<fixPatterns.length;i++){
		p=fixPatterns[i];
		if(!BCCF[p[0]] || BCCF[p[0]].ie<=ver) continue;
		fps.push(p);
	}
	*/
	//if(!fps.length) return cssFix;
	fix[fixSelector]={selectors:selectors,fixPatterns:fixPatterns,types:types,rules:rules};
	return cssFix;
}
/**
 * 处理入口
 */
function initFix(){
	var fixSelector,fixPatterns,selectors,types,p,i,j,s,jq,inited,rules;

	for(fixSelector in fix){
		if(!fix.hasOwnProperty(fixSelector)) continue;
		types = fix[fixSelector].types;
		fixPatterns = fix[fixSelector].fixPatterns;
		selectors = fix[fixSelector].selectors;
		rules=fix[fixSelector].rules;
		//原始选择符
		s=selectors.slice(0);
		
		for ( i = 0; i < fixPatterns.length; i++) {
			p = fixPatterns[i];
			if( p[1]==p[2] ){
				//剔除不兼容的部分
				if(types[p[1]]=='UP'){
					s[p[1]]='';
					continue;
				}
				continue;
			}
			inited=0;
			//处理被fix的部分 && BCCF[types[i]]
			for ( j = p[1]; j < p[2]; j++) {
				if(BCCF[types[j]] && BCCF[types[j]].init){
					inited=1;
					//特殊处理,调用init方法,如果返回真,保留原始选择符号
					//伪类初始化原型 init:function(已经匹配到的jq,className,原始selector字符,rules)
					jq=$(s.slice(0,j).join(''));
					if( !BCCF[types[j]].init(jq,p[0].slice(1),selectors[j],rules) )
						s[j]='';
				}else{
					//剔除不兼容的部分
					if(types[j]=='UP')
						s[j]='';
				}
			}
			//添加默认的 className
			if(!inited){
				$(s.slice(0,p[2]).join('')).addClass(p[0].slice(1));
			}
		}
		s=s.join('');
		jq=$(s);
		//规则初始化
		for ( i in rules) {
			if(!BCCF[i] || !BCCF[i].init) continue;
			BCCF[i].init(jq,rules[i],rules,i);
		}

	}
}


var prefixClass='CF'+(Math.random()+'').slice(2,8)+'_';
var fix={},ver=parseInt($.browser.version);

/**
 * 原型
 * init:function(已经匹配到的jq,className,原始selector字符,rules)
 */
/**
 * 模式定义
 */
var BCCF = {
	//atRules: {
    '@charset':{
    },
    '@import':{
    },
    '@media':{
    },
    '@font-face':{
    },
	'@page': {
		ie: 8
	},
	'@namespace': {
		ie: 9
	},
	':first': {
		is:'@page 文档打印第一页',
		ie: 8
	},
	':left': {
		is:'@page 打印的左页面的样式',
		ie: 8
	},
	':right': {
		is:'@page 打印的右页面的样式',
		ie: 8
	},	
	//},elementSelectors: {
	'#':{
		is:'ID选择'
	},
	'.':{
		is:'类选择'
	},
	'..': {
		is:'多类选择',
		ie: 7
	},
	'*': {
		is:'通用匹配',
		ie: 7
	},
	'ns|E': {
		ie: 9
	},
	//},attributeSelectors: {
	'[att]': {
		ie: 7
	},
	'[att=val]': {
		ie: 7
	},
	'[att|=val]': {
		ie: 7
	},
	'[att~=val]': {
		ie: 7
	},
	'[ns|attr]': {
		ie: 7
	},
	'[att^=val]': {
		ie: 7
	},
	'[att*=val]': {
		ie: 7
	},
	'[att$=val]': {
		ie: 7
	},
	//},combinatorsSelectors: {
	'E+F': {
		is:'相邻兄弟元素选择器',
		ie: 7
	},
	'E>F': {
		is:'子元素选择器',
		ie: 7
	},
	'E~F': {
		is:'通用兄弟选择器',
		ie: 7
	},
	//},pseudoClasses: {
	':link':{},
	':visited':{},
	':active': {
		is:'用户点击元素那一下',
		ie: 8,
		init: function(jq,cls){
			jq.mousedown(
				function () {
					$(this).addClass(cls);
				}
			)
			.mouseup(
				function () {
					$(this).removeClass(cls);
				}
			);
		}
	},
	':focus': {
		is:'元素成为焦点',
		ie: 8,
		init: function(jq,cls){
			jq.filter(':input')
			.focusin(
				function () {
					$(this).addClass(cls);
				}
			)
			.focusout(
				function () {
					$(this).removeClass(cls);
				}
			);
		}
	},
	':hover': {
		is:'当用户把鼠标移动到元素上面时',
		ie: 7,
		init: function(jq,cls){
			jq.hover(
				function () {
					$(this).addClass(cls);
				},
				function () {
					$(this).removeClass(cls);
				}
			);
		}
	},
	':first-child': {
		is:'元素的第一个子元素',
		ie: 7
	},	
	':lang': {
		is:'lang属性选择',
		ie: 8
	},
	':nth-child': {
		is:'一个或多个特定的子元素',
		ie: 9
	},
	':nth-last-child': {
		is:'从最后一个元素开始算',
		ie: 9
	},
	':nth-of-type': {
		is:'同类型匹配',
		ie: 9
	},
	':nth-last-of-type': {
		is:'同类型匹配从最后一个元素开始算',
		ie: 9
	},
	':last-child': {
		is:'元素的最后一个子元素',
		ie: 9
	},
	':first-of-type': {
		is:'同 :nth-of-type(1)。',
		ie: 9
	},
	':last-of-type': {
		is:'同 :nth-last-of-type(1)。',
		ie: 9
	},
	':only-child': {
		is:'匹配属于父元素中唯一子元素',
		ie: 9
	},
	':only-of-type': {
		is:'代表有父元素，并且父元素没有元素的节点，与:first-of-type:last-of-type 或者 :nth-of-type(1):nth-last-of-type(1)相同，但有更低的优先权。',
		ie: 9
	},
	':root': {
		is:'匹配文档的根元素html',
		ie: 9,
		init: function(jq,cls){
			jq.closest('html').addClass(cls);
		}
	},	
	':empty': {
		is:'空节点无任何子元素',
		ie: 9
	},
	':target': {
		is:'匹配 URL #id指向的元素',
		ie: 9
	},
	':enabled': {
		is:'form表单中处于可用状态的元素',
		ie: 9
	},
	':disabled': {
		is:'form表单中处于不可用状态的元素',
		ie: 9
	},
	':checked': {
		is:'form表单中处于选中状态的元素',
		ie: 9
	},
	':not': {
		is:'不匹配简单选择符',
		ie: 9
	},	
	':indeterminate': {
		is:'不确定的checkbox',
		ie: 9
	},
	':default': {
		is:'一组元素中的默认',
		ie: 9
	},
	':valid': {
		is:'数据验证有效',
		ie: 9
	},
	':invalid': {
		is:'数据验证无效',
		ie: 9
	},
	':in-range': {
		is:'常用于有范围限制的元素',
		ie: 9
	},
	':out-of-range': {
		is:'常用于有范围限制的元素',
		ie: 9
	},
	':required': {
		is:'表单元素必选项',
		ie: 9
	},
	':optional': {
		is:'表单元素可选项',
		ie: 9
	},
	':read-only': {
		is:'只读',
		ie: 9
	},
	':read-write': {
		is:'可读写',
		ie: 9
	},
	//},pseudoElements: {
	':after': {
		is:'匹配元素之后插入内容',
		ie: 8,
		init: function(jq,cls,selector,rules){
			jq.each(function(i,elem){
				i=elem.nextSibling;
				while(i && i.nodeType!==1) i=i.nextSibling;
				if(i && i.pseudoNode && i.pseudoNode.toLowerCase()=='after') return;
				i=pseudoNode('after',cls);
				$(elem).after(i);
				if(rules.position=='absolute'){
					if(!$(elem).is(':visible')) $(i).hide();
				}else{
					$(i).css({float:$(elem).css('float')});
				}
			});			
		}
	},
	':before': {
		is:'匹配元素之前插入内容',
		ie: 8,
		init: function(jq,cls,selector,rules){
			jq.each(function(i,elem){
				i=elem.previousSibling;
				while(i && i.nodeType!==1) i=i.previousSibling;
				if(i && i.pseudoNode && i.pseudoNode.toLowerCase()=='before') return;
				i=pseudoNode('before',cls);
				$(elem).before(i);
				if(rules.position=='absolute'){
					if(!$(elem).is(':visible')) $(i).hide();
				}else{
					$(i).css({float:$(elem).css('float')});
				}
			});
		}
	},
	'::before': {
		ie: 9,
		init: function(jq,cls,selector,rules){
			jq.each(function(i,elem){
				i=elem.previousSibling;
				while(i && i.nodeType!==1) i=i.previousSibling;
				if(i && i.pseudoNode && i.pseudoNode.toLowerCase()=='before') return;
				i=pseudoNode('before',cls);
				$(elem).before(i);
				if(rules.position=='absolute'){
					if(!$(elem).is(':visible')) $(i).hide();
				}else{
					$(i).css({float:$(elem).css('float')});
				}
			});		
		}
	},
	'::after': {
		ie: 9,
		init: function(jq,cls,selector,rules){
			jq.each(function(i,elem){
				i=elem.nextSibling;
				while(i && i.nodeType!==1) i=i.nextSibling;
				if(i && i.pseudoNode && i.pseudoNode.toLowerCase()=='after') return;
				i=pseudoNode('after',cls);
				$(elem).after(i);
				if(rules.position=='absolute'){
					if(!$(elem).is(':visible')) $(i).hide();
				}else{
					$(i).css({float:$(elem).css('float')});
				}
			});			
		}
	},
	':first-letter': {
		is:'第一个字母'
	},	
	'::first-letter': {
		is:'第一个字母',
		ie: 9
	},
	':first-line': {
		is:'第一行'
	},
	'::first-line': {
		is:'第一行',
		ie: 9
	},
	'::selection': {
		is:'匹配被用户选中或处于高亮状态的部分',
		ie: 9
	},
	/**
	 * 争议属性
	'::value': {//
		ie: 9
	},
	'::choices': {//
		ie: 9
	},
	'::repeat-item': {
		ie: 9
	},
	'::repeat-index': {
		ie: 9
	},
	*/
	//},properties: {http://www.w3.org/TR/css-2010/#properties
	'!important': {
		ie: 7
	},
	'transform': {//变形
		ie: 9,
		hack: function(){return true;}
	},
	'transform-origin': {//改变基点
		ie: 9,
		hack: function(){return true;}
	},
	'list-style-type': {//elements with ‘display: list-item’ 
		ie: 8
	},
	'color-profile': {//
		ie: 9
	},
	'rendering-intent': {//
		ie: 9
	},
	'white-space': {
		ie: 8,
		hack: function(){return true;}
	},
	'word-spacing': {
		ie: 8
	},
	'font-effect': {
		ie: 9
	},
	'font-emphasize': {
		ie: 9
	},
	'font-size-adjust': {
		ie: 9
	},
	'font-smooth': {
		ie: 9
	},
	'font-stretch': {
		ie: 9
	},
	'hanging-punctuation': {
		ie: 9
	},
	'punctuation-trim': {
		ie: 9
	},
	'ruby-span': {
		ie: 9
	},
	'text-align-last': {
		ie: 9
	},
	'text-emphasis': {
		ie: 9
	},
	'text-outline': {
		ie: 9
	},
	'text-overflow': {
		ie: 9,
		hack: function(){return true;}
	},
	'text-shadow': {
		ie: 9,
		hack: function(){return true;}
	},
	'content': {
		ie: 8,
		init: function(jq,val,rules){
			jq.text(val);
		}
	},
	'counter-increment': {
		ie: 8
	},
	'counter-reset': {
		ie: 8
	},
	'quotes': {
		ie: 8
	},
	'border-collapse': {
		ie: 8,
		hack: function(){return true;}
	},
	'border-spacing': {
		ie: 8,
		hack: function(){return true;}
	},
	'border-style': {
		ie: 8
	},
	'caption-side': {
		ie: 8
	},
	'empty-cells': {
		ie: 8
	},
	'border-break': {
		ie: 9
	},
	'border-image': {
		ie: 9,
		hack: function(){return true;}
	},
	'border-radius': {
		ie: 9,
		hack: function(){return true;}
	},
	'box-shadow': {
		ie: 9,
		hack: function(){return true;}
	},
	'bottom': {
		ie: 8,
		hack: function(){return true;}
	},
	'display': {
		ie: 8,
		values:{
			'inline':6,
			'block':6,
			'list-item':8,
			'inline-block':8,
			'table':8,
			'inline-table':8,
			'table-row-group':8,
			'table-header-group':8,
			'table-footer-group':8,
			'table-row':8,
			'table-column-group':8,
			'table-column':8,
			'table-cell':8,
			'table-caption':8,
			'none':6,
			'inherit':6
		},
		//检查值是否有效
		hack: function(v,k,rules){
			return true;
		},
		init: function(jq,val,rules){
			switch(val){
				case 'table':
					if(rules.content===''){
						jq.css({display:'block',height:0,lineHeight:0});
					}
					break;
				case 'inline-block':
					jq.css({display:'inline',zoom:1});
					break;
			}
		}
	},
	'max-height': {
		ie: 7,
		hack: function(v,k,rules){
			v=parseInt(v);
			var exp='expression((document.documentElement.clientHeight||document.body.clientHeight)>'
				+v+'?"'+v+'px":"")';
			rules._height = exp;
			return true;
		}
	},
	'max-width': {
		ie: 7,
		hack: function(v,k,rules){
			v=parseInt(v);
			var exp='expression((document.documentElement.clientWidth||document.body.clientWidth)>'
				+v+'?"'+v+'px":"")';
			rules._width=exp;
			return true;
		}
	},
	'min-height': {
		ie: 7,
		hack: function(v,k,rules){
			v=parseInt(v);
			var exp='expression((document.documentElement.clientHeight||document.body.clientHeight)<'
				+v+'?"'+v+'px":"")';
			rules['*height']=exp;
			return true;
		}
	},
	'min-width': {
		ie: 7,
		hack: function(v,k,rules){
			v=parseInt(v);
			var exp='expression((document.documentElement.clientWidth||document.body.clientWidth)<'
				+v+'?"'+v+'px":"")';
			rules['*width']=exp;
			return true;
		}
	},
	'position': {
		ie: 7
	},
	'z-index': {
		ie: 8,
		hack: function(){return true;}
	},
	'overflow-x': {
		ie: 7
	},
	'overflow-y': {
		ie: 7
	},
	'orphans': {
		ie: 8
	},
	'page-break-inside': {
		ie: 8
	},
	'widows': {
		ie: 8
	},
	'fit': {
		ie: 9
	},
	'fit-position': {
		ie: 9
	},
	'image-orientation': {
		ie: 9
	},
	'page': {
		ie: 9
	},
	'size': {
		ie: 9
	},
	'outline': {
		ie: 8
	},
	'outline-color': {
		ie: 8
	},
	'outline-style': {
		ie: 8
	},
	'outline-width': {
		ie: 8
	},
	'appearance': {
		ie: 9
	},
	'box-sizing': {
		ie: 8
	},
	'icon': {
		ie: 9
	},
	'nav-down': {
		ie: 9
	},
	'nav-index': {
		ie: 9
	},
	'nav-left': {
		ie: 9
	},
	'nav-right': {
		ie: 9
	},
	'nav-up': {
		ie: 9
	},
	'outline-offset': {
		ie: 9
	},
	'outline-radius': {
		ie: 9
	},
	'resize': {
		ie: 9
	},
	'filter': {
		ie:100,
		hack: function(v,k,rules){
			delete rules.filter;
			return true;
		}
	},
	'margin': {
		ie:7,
		init: function(jq,val,rules){
			jq.not('pseudo').each(function(){
				var h=$(this).outerHeight();
				var ph= parseInt($(this.parentNode).css('line-height'));
				
				if(h<ph) return;

				var lh=$(this).css('line-height');
				$(this).css({'line-height':lh-h+ph});
			});
		}
	},	
	//},values{
	'angle': {
		ie: 9
	},
	'time': {
		ie: 9
	},
	'frequency': {
		ie: 9
	},
	'counter': {
		ie: 8
	},
	'attr': {
		ie: 8
	},
	'calc': {
		ie: 9
	},
	'color(rgba(r,g,b,a))': {
		ie: 9
	},
	'color(hsl(h,s,l))': {
		ie: 9
	},
	'color(hsla(h,s,l,a))': {
		ie: 9
	},
	'transparent': {
		ie: 7
	},
	'auto': {
		ie: 7
	},
	'inherit': {
		ie: 8
	},
	'initial': {
		ie: 9
	}
	//}
};
/**
 * 表单元素伪类具有通性,:indeterminate
 * @param  {[type]} i [description]
 * @param  {[type]} k [description]
 * @return {[type]}   [description]
 */
(function(){
	function hasAttr(k) {
		return function (elem) {return !!elem[k];}
	}
	$.each('checked default required'.split(' '),function(i,k){
		if(!$.expr.filters[k]){
			$.expr.filters[k]=hasAttr(k);
		}
	});
	if( !$.expr.filters.optional ){
		$.expr.filters.optional=function(elem){
			return  !elem.required;
		};
	}
	$.each('valid in-range'.split(' '),function(i,k){
		if(!$.expr.filters[k]){
			$.expr.filters[k]=function(elem){return true;};
		}
	});
	$.each('invalid out-of-range'.split(' '),function(i,k){
		if(!$.expr.filters[k]){
			$.expr.filters[k]=function(elem){return false;};
		}
	});	
	
})();
/**
 * 边框透明的hack
 * @param  {[type]} value [description]
 * @param  {[type]} key   [description]
 * @return {[type]}       [description]
 */
function hackTransparent(value,key,rules){
	if( -1==value.indexOf('transparent') ) return true;
	rules['_'+key]=value.replace(/transparent/g,'#000001');
	rules._filter='chroma(color=#000001)';
	return true;
}
$.each('border border-left border-right border-bottom border-top'.split(' '),function(i,v){
	BCCF[v]=BCCF[v+'color']={
		ie:7,
		hack:hackTransparent
	}
});
$.each(pseudoClasses,function(k){
	if(!$.expr.filters[k.slice(1)]){
		notExprFilters[k]=1;
	}
});

$.each(':link :active :visited :first-line :first-letter . # ..'.split(' '),function(i,v){
	BCCF[v].css=1;
});

$.each('* E>F :first-child :hover :focus E+F [att] [att=val] [att~=val] :before :after'.split(' '),function(i,v){
	BCCF[v].css=2.1;
});

$.each('E~F [att^=val] [att$=val] [att*=val] [att|=val] :root :nth-of-type :nth-last-of-type :first-of-type :last-of-type :only-of-type :only-child :last-child :nth-child :nth-last-child :empty :target :checked ::selection :enabled :disabled :not'.split(' '),function(i,v){
	BCCF[v].css=3;
});
$.each(BCCF,function(i){
	if(i.slice(0,2)==='::')
		BCCF[i].css=3;
});
})(jQuery);