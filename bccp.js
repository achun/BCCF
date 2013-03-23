/**
 * Browser CSS Compatibility Parse
 */
(function() {
	function err(text) {
		console.log(text);
	}
	this.cssFix.cssParse = cssParse;
	this.cssFix.fixCompatibility = fixCompatibility ;
	this.cssFix.getFixStyle =getFixStyle;
	this.cssFix.getFixScript = getFixScript;
	var pseudoClasses = this.cssFix.pseudoClasses;
	var pseudoElements = this.cssFix.pseudoElements;
	/**
	 * Browser Compatibility
	 */
	var BCCF = cssFix.getCompatibility();
	/**
	 * 最终生成的 css , js 代码结果,prefixClass 是设定的前缀,currentStyle 是当前正在处理的 css
	 */
	var fixStyle, fixScript, prefixClass,currentStyle;
	var cnt = 1,
		trimLeft = /^[\s\xA0]+/,
		trimRight = /[\s\xA0]+$/,
		attrSelectors = {
			'': '[att]',
			'|': '[ns|att]',
			'*|': '[*|att]',
			'=': '[att=val]',
			'|=': '[att|=val]',
			'~=': '[att~=val]',
			'|': '[ns|attr]',
			'^=': '[att^=val]',
			'*=': '[att*=val]',
			'$=': '[att$=val]'
		},
		regAtt = /[|^*$=]+/,
		regPattern = /( )+|([>~*])|((?:\.[\w-]+)+)|(#[\w-]+)|(\:not\([^\)]+\))|(\[[^\]]+\])|(:{1,2}[\w-()+]+)/g;

	function sto(s) {
		s = s.split(' ');
		var o = {};
		for (var i = s.length - 1; i >= 0; i--) {
			o[s[i]] = 1;
		};
		return o;
	}

	function Regs() {
		return {
			ident: /[-]?([_a-z]|([^\0-\177])|((\\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?)|\\[^\n\r\f0-9a-f]))([_a-z0-9-]|([^\0-\177])|((\\[0-9a-f]{1,6}(\r\n|[ \n\r\t\f])?)|\\[^\n\r\f0-9a-f]))*/g,
			comment: /(\/\*[^*]*\*+([^/*][^*]*\*+)*\/)|(<!--.*-->)/g,
			/**/
			less: /[\;\{]/g,
			'}': /\}/g

		};
	}

	function resetRegs(regs) {
		for (reg in regs) {
			if (regs.hasOwnProperty(reg)) regs[reg].lastIndex = 0;
		}
	}

	function cssParse(text, skipComment) {
		var style = [];
		var reg, regs = Regs();

		if (!skipComment) text = text.replace(regs.comment, '');
		var s = 0,
			e = 0,
			length = text.length,
			mc, ident, tmp;
		while (e < length) {
			regs.less.lastIndex = e;
			mc = regs.less.exec(text);
			if (!mc) break;
			mc = mc[0];
			ident = trim(text.slice(e, regs.less.lastIndex - 1));
			e = regs.less.lastIndex;
			if (!ident) {
				continue;
			}
			if (ident[0] === '@') {
				if (mc === ';') {
					style.push(atBlock(ident + mc));
				}
				else {
					reg = /[{}]/g;
					reg.lastIndex = e;
					tmp = (reg.exec(text) || [''])[0];
					if (tmp === '{') {
						reg = /\}\S*\}/g;
						reg.lastIndex = e;
						tmp = (reg.exec(text) || [''])[0];
						if (!tmp) {
							err('Malformed at-Rules declarations:' + ident);
							continue;
						}
						style.push(atBlock(ident, text.slice(e, reg.lastIndex - 1)), 1);
					}
					else if (tmp === '}') {
						style.push(atBlock(ident, text.slice(e, reg.lastIndex - 1)));
					}
					else {
						err('Malformed at-Rules declarations:' + ident);
						continue;
					}
					e = reg.lastIndex;
				}
			}
			else {
				reg = regs['}'];
				reg.lastIndex = e;
				if (!reg.exec(text)) {
					continue;
				}
				style.push(cssBlock(ident, text.slice(e, reg.lastIndex - 1)));
				e = reg.lastIndex;
			}
		}
		/**
		 * 初始化返回结果
		 */
		if (skipComment != 'isRecursive') {
			fixStyle = [];
			fixScript = [];
			prefixClass = cssFix.preFixClass();
		}
		if (skipComment != 'isRecursive') {
			currentStyle = style;
		}
		return style;
	}

	function getFixStyle() {
		if(!fixStyle.length) fixCompatibility();
		return fixStyle.join('');
	}

	function getFixScript() {
		if(!fixScript.length) fixCompatibility();
		var s = [];
		for (var i = 0; i < fixScript.length; i++) {
			s[i] = '(' + 
			JSON.stringify(fixScript[i][0]) + ',' + 
			JSON.stringify(fixScript[i][1]) + ',' +
			JSON.stringify(fixScript[i][2])+','+
			JSON.stringify(fixScript[i][3])+','+
			JSON.stringify(fixScript[i][4]) + 
			')';
		}
		return ';cssFix.fixVer='+cssFix.fixVer+';cssFix\n'+s.join('\n')+'\n;';
	}

	function fixCompatibility(style) {
		if( !style ) style = currentStyle;
		if (style.fixCompatibility) return style;
		style.fixCompatibility = 1;
		var selectors, i, j, k, ps, fixSelector, fixPatterns, more,rules,fixRules,
			begin,end,tmp,hasFix,fixScriptLen;

		for (i = 0; i < style.length; i++) {
			selectors = style[i].selectors;
			if (!selectors) continue;
			rules=style[i].rules;
			fixRules=false;
			//处理规则
			for (j in rules) {
				if (!rules.hasOwnProperty(j)) continue;
				if (BCCF[j] && (BCCF[j].ie > cssFix.fixVer)) {
					//可 hack 规则,返回fixRules对象,否则true,下一个,
					if(BCCF[j].hack){
						tmp = BCCF[j].hack(rules[j],j,rules);
						if('object'!==typeof tmp)
							continue;
					}else
						continue;
					//需要hack保存到修正规则
					if(!fixRules) fixRules={};
					for( k in tmp){
						if (!tmp.hasOwnProperty(k)) continue;
						fixRules[k] = tmp[k];
					}
				}
			}
			more = 0;
			fixScriptLen = fixScript.length;
			for (j in selectors) {
				if (!selectors.hasOwnProperty(j)) continue;
				ps = selectors[j].patterns;
				fixPatterns = [];
				hasFix=0;
				for (k = 0; k < ps.length; k++) {
					if (BCCF[ps[k]] && BCCF[ps[k]].ie > cssFix.fixVer){
						tmp = '.'+prefixClass+(cnt++);
						begin=k;
						end=k;console.log(begin);
						//伪元素等不支持的需要特殊处理,向前合并						
						if(cssFix.fixVer<7)
						while( begin>=0 && ps[begin]!=' ' && ps[begin]!='#' && ps[begin]!='T' )
						{
							--begin;
						}
						else while( begin>=0 && ps[begin]!=' ' && ps[begin]!='#' && ps[begin]!='T' && ps[begin]!='.')
						{
							--begin;
						}
						while(end<ps.length && ps[end]!=' ')
						{
							++end;
						}
						begin=begin<0?0:begin+1;
						if(begin!=end){
							hasFix=1;
							fixPatterns=fixPatterns.slice(0,begin);
						}
						fixPatterns.push([tmp,begin<0?0:begin+1,end]);
						k=end-1;
					}else{
						fixPatterns.push([selectors[j][k],k,k]);
					}
				}
				fixSelector=[];
				for (k = fixPatterns.length - 1; k >= 0 ; k--) {
					fixSelector.push(fixPatterns[k][0]);
				}
				fixSelector = fixSelector.reverse().join('');
				if (more) fixStyle.push(',');

				selectors[j].fixSelector = fixSelector;
				selectors[j].fixPatterns = fixPatterns;
				fixStyle.push(fixSelector);
				if(hasFix || fixRules){
					fixScript.push([fixSelector, selectors[j].slice(0), fixPatterns,ps,fixRules||{}]);
				}
				more = 1;
			}

			fixStyle.push('{');
			rules=style[i].rules;
			for (j in rules) {
				fixStyle.push(j + ':' + rules[j] + ';');
			};
			fixStyle.push('}', "\n");
		}
		return style;
	}

	function atBlock(ident, text, css) {
		if (!text) {
			var regs = Regs(),
				s = 0,
				e = 0,
				length = ident.length,
				mc;
			mc = regs.ident.exec(ident);
			e = regs.ident.lastIndex;
			return {
				ident: mc[0],
				text: ident.slice(e),
				type: 'at'
			};
		}
		if (css) return {
			ident: ident.slice(1),
			text: text,
			css: cssParse(text, 'isRecursive'),
			type: 'css'
		};
		return {
			ident: ident.slice(1),
			text: text,
			rules: rulesParse(text),
			type: 'at'
		};
	}

	function cssBlock(ident, text) {
		return {
			ident: ident,
			text: text,
			selectors: identParse(ident),
			rules: rulesParse(text)
		};
	}
	/**
	 * 规则解析
	 */

	function rulesParse(rules) {
		rules = rules.split(';');
		var p, s, pos, ret = {};
		for (var i = 0; i < rules.length; i++) {
			pos = rules[i].indexOf(':');
			if (pos <= 0) continue;
			p = trim(rules[i].slice(0, pos));
			s = trim(rules[i].slice(pos + 1));
			if (p && s) ret[p] = s;
		}
		return ret;
	}

	function identParse(idents) {
		if (typeof idents === 'string') {
			idents = idents.split(',');
		}
		var types = {},
			selector;
		for (var i = 0; i < idents.length; i++) {
			selector = trim(idents[i]);
			types[selector] = selectorParse(selector);
			types[selector].patterns = patternParse(types[selector]);
		}
		return types;
	}
	/**
	 * 选择器解析到数组
	 * @param  String selectors
	 * @return Array
	 */

	function selectorParse(selectors) {
		var ps = selectors.split(regPattern),
			s = [];
		for (var i = 0; i < ps.length; i++) {
			if (ps[i]) {
				if (ps[i] === ' ' && (s[s.length - 1] === '>' || s[s.length - 1] === '~' || s[s.length - 1] === '+')) {
					continue;
				}
				if ((ps[i] === '>' || ps[i] === '~' || ps[i] === '+') && s[s.length - 1] === ' ') {
					s[s.length - 1] = ps[i];
					continue;
				}
				s.push(ps[i]);
			}
		}
		return s;
	}
	/**
	 * 由选择器数组分析出模式
	 * @param  Array selectors
	 * @return Object
	 */

	function patternParse(selectors) {
		var p = [],
			s, ch;
		var regP = /[:\w-]+/;
		for (var i = 0; i < selectors.length; i++) {
			ch = selectors[i][0];
			switch (ch) {
			case '*':
				//p['*']=(p['*'] || 0) + 1;
				p.push(ch);
				break;
			case '#':
				//p['#']=(p['#'] || 0) + 1;
				p.push(ch);
				break;
			case '.':
				if (selectors[i].indexOf('.', 1) == -1)
				//class
				//p['.']=(p['.'] || 0) + 1;
				p.push(ch);
				else
				//multipleclass
				//p['..']=(p['..'] || 0) + 1;
				p.push('..');
				break;
			case '[':
				s = (selectors[i].match(regAtt) || [''])[0];
				s = attrSelectors[s];
				//p[s]=( p[s] || 0 ) +1;
				p.push(s);
				break;
			case ':':
				//Pseudo-classes Pseudo-elements Pseudo-unknown
				s = (selectors[i].match(regP) || [''])[0];
				if (pseudoClasses[s]) {
					p.push(s);
					//p.push('PC');
				}
				else if (pseudoElements[s]) {
					p.push(s);
					//p.push('PE');
				}
				else {
					//unknow
					p.push('UP');
				}
				break;
			case '~':
				//p['E~F']=(p['E~F'] || 0) + 1;
				p.push('E~F');
				break;
			case '+':
				//p['E+F']=(p['E+F'] || 0) + 1;
				p.push('E+F');
				break;
			case '>':
				//p['E>F']=(p['E>F'] || 0) + 1;
				p.push('E>F');
				break;
			case ' ':
				p.push(' ');
				break;
			default:
				if (selectors[i + 1] === '|') {
					//p['ns|E']=(p['ns|E'] || 0) + 1;
					p.push('ns|E', '|');
					i++;
				}

				else {
					//tag
					//p.T=(p.T || 0) + 1;
					p.push('T');
				}
			}
		}
		return p;
	}

	function trim(text) {
		return text.replace(trimLeft, '').replace(trimRight, '');
	}
	// from http://www.w3.org/TR/CSS21/grammar.html
	var words = (function() {
		var s = '[ \\t\\r\\n\\f]+';
		var w = '[ \\t\\r\\n\\f]*';
		var nl = '(?:\\n|\\r\\n|\\r|\\f)';
		var num = '\\-?(?:[0-9]+|[0-9]*\\.[0-9]+)';
		var nonascii = '[^\\0-\\237]';
		var unicode = '\\\\[0-9a-f]{1,6}(?:\\r\\n|[ \\n\\r\\t\\f])?';
		var escape = '(?:' + unicode + '|\\\\[^\\n\\r\\f0-9a-f])';
		var string1 = '\\"(?:[^\\n\\r\\f\\\\"]|\\\\' + nl + '|' + escape + ')*"';
		var string2 = "\\'(?:[^\\n\\r\\f\\\\']|\\\\" + nl + '|' + escape + ")*\\'";
		var string = '(?:' + string1 + '|' + string2 + ')';
		var invalid1 = '\\"(?:[^\\n\\r\\f\\\\"]|\\\\' + nl + '|' + nonascii + '|' + escape + ')*';
		var invalid2 = "\\'(?:[^\\n\\r\\f\\\\']|\\\\" + nl + '|' + nonascii + '|' + escape + ')*';
		var invalid = invalid1 + '|' + invalid2;
		var comment = '\\/\\*[^*]*\\*+(?:[^/*][^*]*\\*+)*\\/';
		var badcomment1 = '\\/\\*[^*]*\\*+(?:[^/*][^*]*\\*+)*';
		var badcomment2 = '\\/\\*[^*]*(?:\\*+[^/*][^*]*)*';
		var badcomment = '(?:' + badcomment1 + '|' + badcomment2 + ')';
		var nmchar = '(?:[_a-z0-9\\-]|' + nonascii + '|' + escape + ')';
		var nmstart = '(?:[_a-z]|' + nonascii + '|' + escape + ')';
		var ident = '[-]?' + nmstart + '(?:' + nmchar + ')*';
		var name = nmchar + '+';
		var unicode_range = 'u\\+[0-9a-f?]{1,6}(?:-[0-9a-f]{1,6})?';
		var openbrace = '\\{';
		var closingbrace = '\\}';
		var openparenthese = '\\(';
		var closingparenthese = '\\)';
		var openbracket = '\\[';
		var closingbracket = '\\]';
		var url = '(?:[\\!\\#\\$\\%\\&\\*-\\~]|' + nonascii + '|' + escape + ')*';
		var uri = 'url\\(' + w + string + w + '\\)' + '|url\\(' + w + '(?:[\\!\\#\\$\\%\\&\\*-\\[\\]-\\~]|' + nonascii + '|' + escape + ')*' + w + '\\)';
		var baduri1 = 'url\\(' + w + '(?:[\\!\\#\\$\\%\\&\\*-\\[\\]-\\~]|' + nonascii + '|' + escape + ')*' + w;
		var baduri2 = 'url\\(' + w + string + w;
		var baduri3 = 'url\\(' + w + invalid;
		var baduri = '(?:' + baduri1 + '|' + baduri2 + '|' + baduri3 + ')';
		return {
			S: new RegExp(s),
			COMMENT: new RegExp(comment),
			BADCOMMENT: new RegExp(badcomment),
			CDO: new RegExp('<!--'),
			CDC: new RegExp('-->'),
			INCLUDES: new RegExp('\\~\\='),
			DASHMATCH: new RegExp('\\|\\='),
			PREFIXMATCH: new RegExp('\\^\\='),
			SUFFIXMATCH: new RegExp('\\$\\='),
			SUBSTRINGMATCH: new RegExp('\\*\\='),
			STRING: new RegExp(string),
			BADSTRING: new RegExp(invalid),
			URI: new RegExp('(?:URL\\(' + w + string + w + '\\)|URL\\(' + w + url + w + '\\))'),
			BAD_URI: new RegExp(baduri),
			FUNCTION: new RegExp(ident + '\\('),
			IDENT: new RegExp(ident),
			HASH: new RegExp('\\#' + name),
			CLASS: new RegExp('\\.' + ident),
			IMPORT_SYM: new RegExp('\\@import'),
			PAGE_SYM: new RegExp('\\@page'),
			MEDIA_SYM: new RegExp('\\@media'),
			CHARSET_SYM: new RegExp('\\@charset '),
			IMPORTANT_SYM: new RegExp('\\!(' + w + '|' + comment + ')*important'),
			EMS: new RegExp(num + 'em'),
			EXS: new RegExp(num + 'ex'),
			LENGTH: new RegExp('(?:' + num + 'px|' + num + 'cm|' + num + 'mm|' + num + 'in|' + num + 'pi|' + num + 'pc)'),
			ANGLE: new RegExp('(?:' + num + 'deg|' + num + 'rad|' + num + 'grad)'),
			TIME: new RegExp('(?:' + num + 'ms|' + num + 's)'),
			FREQ: new RegExp('(?:' + num + 'hz|' + num + 'khz)'),
			DIMENSION: new RegExp(num + ident),
			PERCENTAGE: new RegExp(num + '\\%'),
			NUMER: new RegExp(num),
			FUNCTION: new RegExp(ident + '\\('),
			PLUS: new RegExp(w + '\\+'),
			GREATER: new RegExp(w + '\\>'),
			COMMA: new RegExp(w + '\\,'),
			TILDE: new RegExp(w + '\\~'),
			NOT: new RegExp(':not\\('),
			ATKEYWORD: new RegExp('\\@' + ident),
			SEMICOLON: new RegExp('\\;'),
			COLON: new RegExp('\\:'),
			LBRACE: new RegExp(openbrace),
			RBRACE: new RegExp(closingbrace),
			RPARENTHESE: new RegExp(closingparenthese),
			LPARENTHESE: new RegExp(openparenthese),
			LBRACKET: new RegExp(openbracket),
			RBRACKET: new RegExp(closingbracket),
			EQUALSIGN: new RegExp('\\='),
			PERIOD: new RegExp('\\.'),
			STAR: new RegExp('\\*'),
			ANY: new RegExp('.')
		};
	})();
})();
