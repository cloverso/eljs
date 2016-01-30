/**********************************************
 * el.js 1.0.0
 * Lightweight js DOM manipulation library
 * @author clover/肆叶
 * @qq 515107927
 * @email clover@focus.so
 * @blog: http://clover.so
 * @Creation time: 2016/1/30
 *********************************************/

(function(){

	var ArrayProto 			= 	Array.prototype, 
		ObjProto 			=	Object.prototype, 
		FuncProto 			= 	Function.prototype,
		StrProto 			=	String.prototype,
	   	toString			=	ObjProto.toString,
	   	hasProp 			=	ObjProto.hasOwnProperty,
	   	slice 				= 	ArrayProto.slice,
	   	indexOf 			= 	ArrayProto.indexOf,
	   	forEach 			= 	ArrayProto.forEach,
	   	filter 				= 	ArrayProto.filter,
	   	map 				= 	ArrayProto.map,
	   	elementTypes  		=   [1, 3, 8, 9, 11];

	// 类型判断
	function isType(type) {
	  	return function(obj) {
		    return {}.toString.call(obj) == "[object " + type + "]"
		 }
	}
	var isObject = isType("Object"),
		isString = isType("String"),
		isArray = Array.isArray || isType("Array"),
		isFunction = isType("Function"),
		isUndefined = isType("Undefined");

	function El(selector, context) {
		return El.init(selector, context);
	};

	El.extend = function(prop) {
		var key;
		slice.call(arguments, 1).forEach(function(source){
			for (key in source) {
				if (source[key] !== undefined) prop[key] = source[key];
			}
		});
		return prop;
	};

	El.extend(El, {
		Q: function(dom, selector) {
			dom = dom || [];
			dom.__proto__ = El.prototype;
			dom.selector = selector || '';
			return dom;
		},
		init: function(selector, context) {
			if (!selector) { 
				return El.Q() 
			} else if (isFunction(selector)) {
				return El.prototype.ready(selector);
			} else if (selector instanceof El) {
				return selector;
			} else {
				var dom;
				if (isArray(selector)) {
					dom = filter.call(selecotr, function(item){
						return item != null;
					});
				} else if (elementTypes.indexOf(selector.nodeType) >= 0 || selector === window) {
					dom = [selector], selector = null;
				} else {
					dom = El.query(selector, context);
				}
				return El.Q(dom, selector);
			}
		},
		query: function(selector, context) {
			context = context || document;
			var found,
				maybeID = selector[0] === '#',
				maybeClass = !maybeID && selector[0] === '.',
				nameOnly = (maybeID || maybeClass) ? selector.slice(1) : selector,
				isSimple = /^[\w-]*$/.test(nameOnly);
			return ((context.nodeType === context.DOCUMENT_NODE) && isSimple && maybeID) ?
				((found = context.getElementById(nameOnly)) ? [found] : []) :
				(context.nodeType !== 1 && context.nodeType !== 9) ? [] :
				slice.call((isSimple && !maybeID) ? maybeClass ? context.getElementsByClassName(nameOnly) : context.getElementsByTagName(selector) : context.querySelectorAll(selector));
		}
	});

	El.extend(El.prototype, {
		ready: function(callback) {
			document.addEventListener("DOMContentLoaded", callback, false);
			return this;
		},
		each: function(callback) {
			if (isArray(this)) {
				forEach.call(this,function(el, index){
					callback.call(el, index, el);
				})
			} else {
				for (var key in this) {
					callback.call(this[key], key, this[key]);
				}
			}				
			return this;
		},
		hide: function() {
			return this.each(function(){this.style.display = 'none'});
		},
		show: function() {
			return this.each(function(){this.style.display = ''});
		},
		addClass: function(className) {
			return this.each(function(){this.classList.add(className)});
		},
		removeClass: function(className) {
			return this.each(function(){this.classList.remove(className)});
		},
		hasClass: function(classNmae) {
			return (this.length < 1) ? false : this[0].classList.contains(className);
		},
		toggleClass: function(className) {
			return this.each(function(){this.classList.toggle(className)});
		},
		html: function(htmlString) {
			return htmlString ? this.each(function(){this.innerHTML = htmlString}) :
				this[0].innerHTML;
		},
		text: function(text) {
			return text === undefined ?	(this.length > 0 ? this[0].textContent : null) :
			this.each(function(){ this.textContent = text });
		},
		attr: function(name,value) {
			return value ? this.each(function(){this.setAttribute(name, value)}) :
				this[0].getAttribute(name);
		},
		css: function(name,value) {
			return value ? this.each(function(){this.style[name] = value}) :
				getComputedStyle(this[0])[name];
		},
		parent: function() {
			return El(this[0].parentNode);
		},
		children: function() {
			return El(slice.call(this[0].children));
		},
		find: function(selector) {
			return El(selector,this[0]);
		},
		siblings: function(selector) {
			var self = this[0],	parent = self.parentNode;
			selector && (selector = El(selector,parent)[0]);
			return El.Q(filter.call(parent.children, function(child){
				return selector ? child === selector : child !== self;
			}))
		},
		after: function(htmlString) {
			return this.each(function(){this.insertAdjacentHTML('afterend',htmlString)});
		},
		before: function(htmlString) {
			return this.each(function(){this.insertAdjacentHTML('beforebegin', htmlString)});
		},
		append: function(htmlString) {
			return this.each(function(){this.insertAdjacentHTML('beforeend', htmlString)});
		},
		empty: function() {
			return this.each(function(){this.innerHTML = ''});
		},
		remove: function() {
			return this.each(function(){this.parentNode.removeChild(el)});
		},
		clone: function() {
			return this[0].cloneNode(true);
		}
	});	
	El.extend(El.prototype, {
        on: function(type,selector,handler,capture) {
            capture = !!capture;
            if (isString(selector)) {
                this.each(function(){
                    this.addEventListener(type, function(e){
                        Array.prototype.slice.call(this.querySelectorAll(selector)).forEach(function(item){ 
                            (e.target === item || item.contains(e.target)) && handler.call(item,e);
                        });
                    }, capture);
                });
            } else {
                handler = !!handler;
                this.each(function(){
                    this.addEventListener(type, selector, handler);
                });
            }
        return this;
        },
		off: function(type,callback) {
			this.each(function(){
				this.removeEventListener(type, handler);
			});
			return this;
		},
		trigger: function(type) {
			var event = document.createEvent('HTMLEvents');
			event.initEvent(type, true, false);
			this.each(function(){
				this.dispatchEvent(event);
			});
			return this;
		}
	});	

	this.$ = this.El = El;

}).call(this);

(function($){
	 //将键值对转换为hase值
    function toHash(data) {
        var str = [];
        for (var key in data) {
            if (typeof data[key] === 'function') continue;
            str.push(encodeURIComponent(key) + "=" + encodeURIComponent(data[key]));
        }
        return str.join('&');
    };

    /**
	 * 异步请求方法
	 * @param url(string): 要请求的服务器地址
	 * @param type(string): 请求的传输方式
	 * @param data(obj): 请求中需要传输的数据对象
	 * @param success(function): 请求成功后的回调
	 * @param error(function): 请求失败后的回调
	 * @describe: 异步请求方法封装，服务器返回的数据会传入回调函数中，可通过形参获取，如：function(cb){cosnole.log(cb)}
	 */
    $.ajax = function (url, type, data, success, error) {
        if (!url) return;
        type = type.toUpperCase();

        var request = new XMLHttpRequest();
        request.open(url, true);

        request.onload = function () {
            if (this.status >= 200 && this.status < 400) {
                success && success(JSON.parse(this.response));
            } else {
                error && error(this.response);
            }
        };

        request.onerror = function () { error(this.response) };

        type === 'POST' && request.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded; charset=UTF-8');
        type === 'POST' ? request.send(toHash(data)) : request.send();
    };
})($);

(function($){
	 /**
	 * js模板引擎
	 * @parame text(template DomString): html模板文本
	 * @parame data(dom object): 模板插入数据
	 **/
    $.template = function (text, data) {
        // 模板匹配正则
        var matcher = /<%=([\s\S]+?)%>|<%([\s\S]+?)%>|$/g;
        //模板文本中的特殊字符转义处理
        var escaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
        var escapes = {
            "'": "'",
            '\\': '\\',
            '\r': 'r',
            '\n': 'n',
            '\t': 't',
            '\u2028': 'u2028',
            '\u2029': 'u2029'
        };
        return (function (text, data) {
            //记录当前扫描位置;函数体数组初始化
            var index = 0, function_body = ["var temp = [];\n"];
            text.replace(matcher, function (match, interpolate, evaluate, offset) {
                //找到第一个匹配后，将前面部分作为普通字符串拼接的表达式，并添加处理转义字符
                function_body.push("temp.push('" + text.slice(index, offset).replace(escaper, function (match) { return '\\' + escapes[match]; }) + "');\n");
                // console.log(function_body)
                //如果是<% ... %>直接作为代码片段，evaluate就是捕获的分组
                if (evaluate) function_body.push(evaluate + '\n');
                //如果是<%= ... %>追加字符串，interpolate就是捕获的分组
                if (interpolate) function_body.push("temp.push(" + interpolate + ");\n");
                //递增index，跳过evaluate或者interpolate
                index = offset + match.length;
                //返回匹配值，当前使用场景可忽略
                return match;
            });
            //最后返回编译后的DOM代码    
            function_body.push("return temp.join('');");
            var render = new Function('data', function_body.join(''));
            return render(data);
        })(text, data);
    };
})($);
