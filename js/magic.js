// Copyright (c) 2009-2012, Baidu Inc. All rights reserved.
//
// Licensed under the BSD License
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
// 
//      http://tangram.baidu.com/license.html
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.


















var T, baidu = T = baidu || function(q, c) { return baidu.dom ? baidu.dom(q, c) : null; };

baidu.version = '2.0.2.1';
baidu.guid = "$BAIDU$";
baidu.key = "tangram_guid";

// Tangram 可能被放在闭包中
// 一些页面级别唯一的属性，需要挂载在 window[baidu.guid]上

var _ = window[ baidu.guid ] = window[ baidu.guid ] || {};
(_.versions || (_.versions = [])).push(baidu.version);

// 20120709 mz 添加参数类型检查器，对参数做类型检测保护
baidu.check = baidu.check || function(){};

if (typeof jQuery != 'undefined') {
    baidu.dom = jQuery;
}





 
baidu.lang = baidu.lang || {};













baidu.forEach = function( enumerable, iterator, context ) {
    var i, n, t;

    if ( typeof iterator == "function" && enumerable) {

        // Array or ArrayLike or NodeList or String or ArrayBuffer
        n = typeof enumerable.length == "number" ? enumerable.length : enumerable.byteLength;
        if ( typeof n == "number" ) {

            // 20121030 function.length
            //safari5.1.7 can not use typeof to check nodeList - linlingyu
            if (Object.prototype.toString.call(enumerable) === "[object Function]") {
                return enumerable;
            }

            for ( i=0; i<n; i++ ) {

                t = enumerable[ i ] || (enumerable.charAt && enumerable.charAt( i ));

                // 被循环执行的函数，默认会传入三个参数(array[i], i, array)
                iterator.call( context || null, t, i, enumerable );
            }
        
        // enumerable is number
        } else if (typeof enumerable == "number") {

            for (i=0; i<enumerable; i++) {
                iterator.call( context || null, i, i, i);
            }
        
        // enumerable is json
        } else if (typeof enumerable == "object") {

            for (i in enumerable) {
                if ( enumerable.hasOwnProperty(i) ) {
                    iterator.call( context || null, enumerable[ i ], i, enumerable );
                }
            }
        }
    }

    return enumerable;
};




baidu.type = (function() {
    var objectType = {},
        nodeType = [, "HTMLElement", "Attribute", "Text", , , , , "Comment", "Document", , "DocumentFragment", ],
        str = "Array Boolean Date Error Function Number RegExp String",
        retryType = {'object': 1, 'function': '1'},//解决safari对于childNodes算为function的问题
        toString = objectType.toString;

    // 给 objectType 集合赋值，建立映射
    baidu.forEach(str.split(" "), function(name) {
        objectType[ "[object " + name + "]" ] = name.toLowerCase();

        baidu[ "is" + name ] = function ( unknow ) {
            return baidu.type(unknow) == name.toLowerCase();
        }
    });

    // 方法主体
    return function ( unknow ) {
        var s = typeof unknow;
        return !retryType[s] ? s
            : unknow == null ? "null"
            : unknow._type_
                || objectType[ toString.call( unknow ) ]
                || nodeType[ unknow.nodeType ]
                || ( unknow == unknow.window ? "Window" : "" )
                || "object";
    };
})();

// extend
baidu.isDate = function( unknow ) {
    return baidu.type(unknow) == "date" && unknow.toString() != 'Invalid Date' && !isNaN(unknow);
};

baidu.isElement = function( unknow ) {
    return baidu.type(unknow) == "HTMLElement";
};

// 20120818 mz 检查对象是否可被枚举，对象可以是：Array NodeList HTMLCollection $DOM
baidu.isEnumerable = function( unknow ){
    return unknow != null
        && (typeof unknow == "object" || ~Object.prototype.toString.call( unknow ).indexOf( "NodeList" ))
    &&(typeof unknow.length == "number"
    || typeof unknow.byteLength == "number"     //ArrayBuffer
    || typeof unknow[0] != "undefined");
};
baidu.isNumber = function( unknow ) {
    return baidu.type(unknow) == "number" && isFinite( unknow );
};

// 20120903 mz 检查对象是否为一个简单对象 {}
baidu.isPlainObject = function(unknow) {
    var key,
        hasOwnProperty = Object.prototype.hasOwnProperty;

    if ( baidu.type(unknow) != "object" ) {
        return false;
    }

    //判断new fn()自定义对象的情况
    //constructor不是继承自原型链的
    //并且原型中有isPrototypeOf方法才是Object
    if ( unknow.constructor &&
        !hasOwnProperty.call(unknow, "constructor") &&
        !hasOwnProperty.call(unknow.constructor.prototype, "isPrototypeOf") ) {
        return false;
    }
    //判断有继承的情况
    //如果有一项是继承过来的，那么一定不是字面量Object
    //OwnProperty会首先被遍历，为了加速遍历过程，直接看最后一项
    for ( key in unknow ) {}
    return key === undefined || hasOwnProperty.call( unknow, key );
};

baidu.isObject = function( unknow ) {
    return typeof unknow === "function" || ( typeof unknow === "object" && unknow != null );
};





baidu.global = baidu.global || (function() {
    var me = baidu._global_ = window[ baidu.guid ],
        // 20121116 mz 在多个tangram同时加载时有互相覆写的风险
        global = me._ = me._ || {};

    return function( key, value, overwrite ) {
        if ( typeof value != "undefined" ) {
            overwrite || ( value = typeof global[ key ] == "undefined" ? value : global[ key ] );
            global[ key ] =  value;

        } else if (key && typeof global[ key ] == "undefined" ) {
            global[ key ] = {};
        }

        return global[ key ];
    }
})();












baidu.extend = function(depthClone, object) {
    var second, options, key, src, copy,
        i = 1,
        n = arguments.length,
        result = depthClone || {},
        copyIsArray, clone;
    
    baidu.isBoolean( depthClone ) && (i = 2) && (result = object || {});
    !baidu.isObject( result ) && (result = {});

    for (; i<n; i++) {
        options = arguments[i];
        if( baidu.isObject(options) ) {
            for( key in options ) {
                src = result[key];
                copy = options[key];
                // Prevent never-ending loop
                if ( src === copy ) {
                    continue;
                }
                
                if(baidu.isBoolean(depthClone) && depthClone && copy
                    && (baidu.isPlainObject(copy) || (copyIsArray = baidu.isArray(copy)))){
                        if(copyIsArray){
                            copyIsArray = false;
                            clone = src && baidu.isArray(src) ? src : [];
                        }else{
                            clone = src && baidu.isPlainObject(src) ? src : {};
                        }
                        result[key] = baidu.extend(depthClone, clone, copy);
                }else if(copy !== undefined){
                    result[key] = copy;
                }
            }
        }
    }
    return result;
};





baidu.browser = baidu.browser || function(){
    var ua = navigator.userAgent;
    
    var result = {
        isStrict : document.compatMode == "CSS1Compat"
        ,isGecko : /gecko/i.test(ua) && !/like gecko/i.test(ua)
        ,isWebkit: /webkit/i.test(ua)
    };

    try{/(\d+\.\d+)/.test(external.max_version) && (result.maxthon = + RegExp['\x241'])} catch (e){};

    // 蛋疼 你懂的
    switch (true) {
        case /msie (\d+\.\d+)/i.test(ua) :
            result.ie = document.documentMode || + RegExp['\x241'];
            break;
        case /chrome\/(\d+\.\d+)/i.test(ua) :
            result.chrome = + RegExp['\x241'];
            break;
        case /(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(ua) && !/chrome/i.test(ua) :
            result.safari = + (RegExp['\x241'] || RegExp['\x242']);
            break;
        case /firefox\/(\d+\.\d+)/i.test(ua) : 
            result.firefox = + RegExp['\x241'];
            break;
        
        case /opera(?:\/| )(\d+(?:\.\d+)?)(.+?(version\/(\d+(?:\.\d+)?)))?/i.test(ua) :
            result.opera = + ( RegExp["\x244"] || RegExp["\x241"] );
            break;
    }
           
    baidu.extend(baidu, result);

    return result;
}();




baidu.id = function() {
    var maps = baidu.global("_maps_id")
        ,key = baidu.key;

    // 2012.12.21 与老版本同步
    window[ baidu.guid ]._counter = window[ baidu.guid ]._counter || 1;

    return function( object, command ) {
        var e
            ,str_1= baidu.isString( object )
            ,obj_1= baidu.isObject( object )
            ,id = obj_1 ? object[ key ] : str_1 ? object : "";

        // 第二个参数为 String
        if ( baidu.isString( command ) ) {
            switch ( command ) {
            case "get" :
                return obj_1 ? id : maps[id];
//            break;
            case "remove" :
            case "delete" :
                if ( e = maps[id] ) {
                    // 20120827 mz IE低版本(ie6,7)给 element[key] 赋值时会写入DOM树，因此在移除的时候需要使用remove
                    if (baidu.isElement(e) && baidu.browser.ie < 8) {
                        e.removeAttribute(key);
                    } else {
                        delete e[ key ];
                    }
                    delete maps[ id ];
                }
                return id;
//            break;
            default :
                if ( str_1 ) {
                    (e = maps[ id ]) && delete maps[ id ];
                    e && ( maps[ e[ key ] = command ] = e );
                } else if ( obj_1 ) {
                    id && delete maps[ id ];
                    maps[ object[ key ] = command ] = object;
                }
                return command;
            }
        }

        // 第一个参数不为空
        if ( obj_1 ) {
            !id && (maps[ object[ key ] = id = baidu.id() ] = object);
            return id;
        } else if ( str_1 ) {
            return maps[ object ];
        }

        return "TANGRAM_" + baidu._global_._counter ++;
    };
}();

//TODO: mz 20120827 在低版本IE做delete操作时直接 delete e[key] 可能出错，这里需要重新评估，重写





baidu.base = baidu.base || {blank: function(){}};







baidu.base.Class = (function() {
    var instances = (baidu._global_ = window[baidu.guid])._instances;
    instances || (instances = baidu._global_._instances = {});

    // constructor
    return function() {
        this.guid = baidu.id();
        this._decontrol_ || (instances[this.guid] = this);
    }
})();


baidu.extend(baidu.base.Class.prototype, {
    
    toString: baidu.base.Class.prototype.toString = function(){
        return "[object " + ( this._type_ || "Object" ) + "]";
    }

    
    ,dispose: function() {
        // 2013.1.11 暂时关闭此事件的派发
        // if (this.fire("ondispose")) {
            // decontrol
            delete baidu._global_._instances[this.guid];

            if (this._listeners_) {
                for (var item in this._listeners_) {
                    this._listeners_[item].length = 0;
                    delete this._listeners_[item];
                }
            }

            for (var pro in this) {
                if ( !baidu.isFunction(this[pro]) ) delete this[pro];
                else this[pro] = baidu.base.blank;
            }

            this.disposed = true;   //20100716
        // }
    }

    
    ,fire: function(event, options) {
        baidu.isString(event) && (event = new baidu.base.Event(event));

        var i, n, list, item
            , t=this._listeners_
            , type=event.type
            // 20121023 mz 修正事件派发多参数时，参数的正确性验证
            , argu=[event].concat( Array.prototype.slice.call(arguments, 1) );
        !t && (t = this._listeners_ = {});

        // 20100603 添加本方法的第二个参数，将 options extend到event中去传递
        baidu.extend(event, options || {});

        event.target = event.target || this;
        event.currentTarget = this;

        type.indexOf("on") && (type = "on" + type);

        baidu.isFunction(this[type]) && this[type].apply(this, argu);
        (i=this._options) && baidu.isFunction(i[type]) && i[type].apply(this, argu);

        if (baidu.isArray(list = t[type])) {
            for ( i=list.length-1; i>-1; i-- ) {
                item = list[i];
                item && item.handler.apply( this, argu );
                item && item.once && list.splice( i, 1 );
            }
        }

        return event.returnValue;
    }

    
    ,on: function(type, handler, once) {
        if (!baidu.isFunction(handler)) {
            return this;
        }

        var list, t = this._listeners_;
        !t && (t = this._listeners_ = {});

        type.indexOf("on") && (type = "on" + type);

        !baidu.isArray(list = t[type]) && (list = t[type] = []);
        t[type].unshift( {handler: handler, once: !!once} );

        return this;
    }
    // 20120928 mz 取消on()的指定key

    ,once: function(type, handler) {
        return this.on(type, handler, true);
    }
    ,one: function(type, handler) {
        return this.on(type, handler, true);
    }

    
    ,off: function(type, handler) {
        var i, list,
            t = this._listeners_;
        if (!t) return this;

        // remove all event listener
        if (typeof type == "undefined") {
            for (i in t) {
                delete t[i];
            }
            return this;
        }

        type.indexOf("on") && (type = "on" + type);

        // 移除某类事件监听
        if (typeof handler == "undefined") {
            delete t[type];
        } else if (list = t[type]) {

            for (i = list.length - 1; i >= 0; i--) {
                list[i].handler === handler && list.splice(i, 1);
            }
        }

        return this;
    }
});
baidu.base.Class.prototype.addEventListener = 
baidu.base.Class.prototype.on;
baidu.base.Class.prototype.removeEventListener =
baidu.base.Class.prototype.un =
baidu.base.Class.prototype.off;
baidu.base.Class.prototype.dispatchEvent =
baidu.base.Class.prototype.fire;



window["baiduInstance"] = function(guid) {
    return window[baidu.guid]._instances[ guid ];
}




baidu.base.Event = function(type, target) {
    this.type = type;
    this.returnValue = true;
    this.target = target || null;
    this.currentTarget = null;
    this.preventDefault = function() {this.returnValue = false;};
};


//  2011.11.23  meizz   添加 baiduInstance 这个全局方法，可以快速地通过guid得到实例对象
//  2011.11.22  meizz   废除创建类时指定guid的模式，guid只作为只读属性


/// support magic - Tangram 1.x Code Start




baidu.lang.Class = baidu.base.Class;
//  2011.11.23  meizz   添加 baiduInstance 这个全局方法，可以快速地通过guid得到实例对象
//  2011.11.22  meizz   废除创建类时指定guid的模式，guid只作为只读属性
//  2011.11.22  meizz   废除 baidu.lang._instances 模块，由统一的global机制完成；


/// support magic - Tangram 1.x Code End













baidu.createClass = function(constructor, type, options) {
    constructor = baidu.isFunction(constructor) ? constructor : function(){};
    options = typeof type == "object" ? type : options || {};

    // 创建新类的真构造器函数
    var fn = function(){
        var me = this;

        // 20101030 某类在添加该属性控制时，guid将不在全局instances里控制
        options.decontrolled && (me._decontrol_ = true);

        // 继承父类的构造器
        fn.superClass.apply(me, arguments);

        // 全局配置
        for (var i in fn.options) me[i] = fn.options[i];

        constructor.apply(me, arguments);

        for (var i=0, reg=fn._reg_; reg && i<reg.length; i++) {
            reg[i].apply(me, arguments);
        }
    };

    baidu.extend(fn, {
        superClass: options.superClass || baidu.base.Class

        ,inherits: function(superClass){
            if (typeof superClass != "function") return fn;

            var C = function(){};
            C.prototype = (fn.superClass = superClass).prototype;

            // 继承父类的原型（prototype)链
            var fp = fn.prototype = new C();
            // 继承传参进来的构造器的 prototype 不会丢
            baidu.extend(fn.prototype, constructor.prototype);
            // 修正这种继承方式带来的 constructor 混乱的问题
            fp.constructor = constructor;

            return fn;
        }

        ,register: function(hook, methods) {
            (fn._reg_ || (fn._reg_ = [])).push( hook );
            methods && baidu.extend(fn.prototype, methods);
            return fn;
        }
        
        ,extend: function(json){baidu.extend(fn.prototype, json); return fn;}
    });

    type = baidu.isString(type) ? type : options.className || options.type;
    baidu.isString(type) && (constructor.prototype._type_ = type);
    baidu.isFunction(fn.superClass) && fn.inherits(fn.superClass);

    return fn;
};

// 20111221 meizz   修改插件函数的存放地，重新放回类构造器静态属性上
// 20121105 meizz   给类添加了几个静态属性方法：.options .superClass .inherits() .extend() .register()


/// support magic - Tangram 1.x Code Start






baidu.lang.createClass = baidu.createClass;

// 20111221 meizz   修改插件函数的存放地，重新放回类构造器静态属性上

/// support magic - Tangram 1.x Code End








baidu.base.inherits = function (subClass, superClass, type) {
    var key, proto, 
        selfProps = subClass.prototype, 
        clazz = new Function();
        
    clazz.prototype = superClass.prototype;
    proto = subClass.prototype = new clazz();

    for (key in selfProps) {
        proto[key] = selfProps[key];
    }
    subClass.prototype.constructor = subClass;
    subClass.superClass = superClass.prototype;

    // 类名标识，兼容Class的toString，基本没用
    typeof type == "string" && (proto._type_ = type);

    subClass.extend = function(json) {
        for (var i in json) proto[i] = json[i];
        return subClass;
    }
    
    return subClass;
};

//  2011.11.22  meizz   为类添加了一个静态方法extend()，方便代码书写


/// support magic - Tangram 1.x Code Start





baidu.lang.inherits = baidu.base.inherits;

//  2011.11.22  meizz   为类添加了一个静态方法extend()，方便代码书写
/// support magic - Tangram 1.x Code End







baidu.base.register = function (Class, constructorHook, methods) {
    (Class._reg_ || (Class._reg_ = [])).push( constructorHook );

    for (var method in methods) {
        Class.prototype[method] = methods[method];
    }
};

// 20111221 meizz   修改插件函数的存放地，重新放回类构造器静态属性上
// 20111129    meizz    添加第三个参数，可以直接挂载方法到目标类原型链上


/// support magic - Tangram 1.x Code Start





baidu.lang.register = baidu.base.register;

// 20111221 meizz   修改插件函数的存放地，重新放回类构造器静态属性上
// 20111129    meizz    添加第三个参数，可以直接挂载方法到目标类原型链上
/// support magic - Tangram 1.x Code End

/// support maigc - Tangram 1.x Code Start








//baidu.lang.isDate = function(o) {
//    // return o instanceof Date;
//    return {}.toString.call(o) === "[object Date]" && o.toString() !== 'Invalid Date' && !isNaN(o);
//};

baidu.lang.isDate = baidu.isDate;
/// support maigc Tangram 1.x Code End







//baidu.lang.isString = function (source) {
//    return '[object String]' == Object.prototype.toString.call(source);
//};
baidu.lang.isString = baidu.isString;

/// support magic - Tangram 1.x Code Start








baidu.lang.guid = function() {
    return baidu.id();
};

//不直接使用window，可以提高3倍左右性能
//baidu.$$._counter = baidu.$$._counter || 1;


// 20111129    meizz    去除 _counter.toString(36) 这步运算，节约计算量
/// support magic - Tangram 1.x Code End




baidu.object = baidu.object || {};





//baidu.object.extend = function (target, source) {
//    for (var p in source) {
//        if (source.hasOwnProperty(p)) {
//            target[p] = source[p];
//        }
//    }
//    
//    return target;
//};
baidu.object.extend = baidu.extend;









//baidu.lang.isObject = function (source) {
//    return 'function' == typeof source || !!(source && 'object' == typeof source);
//};
baidu.lang.isObject = baidu.isObject;







//baidu.lang.isFunction = function (source) {
    // chrome下,'function' == typeof /a/ 为true.
//    return '[object Function]' == Object.prototype.toString.call(source);
//};
baidu.lang.isFunction = baidu.isFunction;




baidu.object.merge = function(){
    function isPlainObject(source) {
        return baidu.lang.isObject(source) && !baidu.lang.isFunction(source);
    };
    function mergeItem(target, source, index, overwrite, recursive) {
        if (source.hasOwnProperty(index)) {
            if (recursive && isPlainObject(target[index])) {
                // 如果需要递归覆盖，就递归调用merge
                baidu.object.merge(
                    target[index],
                    source[index],
                    {
                        'overwrite': overwrite,
                        'recursive': recursive
                    }
                );
            } else if (overwrite || !(index in target)) {
                // 否则只处理overwrite为true，或者在目标对象中没有此属性的情况
                target[index] = source[index];
            }
        }
    };
    
    return function(target, source, opt_options){
        var i = 0,
            options = opt_options || {},
            overwrite = options['overwrite'],
            whiteList = options['whiteList'],
            recursive = options['recursive'],
            len;
    
        // 只处理在白名单中的属性
        if (whiteList && whiteList.length) {
            len = whiteList.length;
            for (; i < len; ++i) {
                mergeItem(target, source, whiteList[i], overwrite, recursive);
            }
        } else {
            for (i in source) {
                mergeItem(target, source, i, overwrite, recursive);
            }
        }
        return target;
    };
}();







baidu.object.isPlain  = baidu.isPlainObject;










baidu.createChain = function(chainName, fn, constructor) {
    // 创建一个内部类名
    var className = chainName=="dom"?"$DOM":"$"+chainName.charAt(0).toUpperCase()+chainName.substr(1);
    var slice = Array.prototype.slice;

    // 构建链头执行方法
    var chain = baidu[chainName] = baidu[chainName] || fn || function(object) {
        return baidu.extend(object, baidu[chainName].fn);
    };

    // 扩展 .extend 静态方法，通过本方法给链头对象添加原型方法
    chain.extend = function(extended) {
        var method;

        // 直接构建静态接口方法，如 baidu.array.each() 指向到 baidu.array().each()
        for (method in extended) {
            // 20121128 这个if判断是防止console按鸭子判断规则将本方法识别成数组
            if (method != "splice") {
                chain[method] = function() {
                    var id = arguments[0];

                    // 在新版接口中，ID选择器必须用 # 开头
                    chainName=="dom" && baidu.type(id)=="string" && (id = "#"+ id);

                    var object = chain(id);
                    var result = object[method].apply(object, slice.call(arguments, 1));

                    // 老版接口返回实体对象 getFirst
                    return baidu.type(result) == "$DOM" ? result.get(0) : result;
                }
            }
        }
        return baidu.extend(baidu[chainName].fn, extended);
    };

    // 创建 链头对象 构造器
    baidu[chainName][className] = baidu[chainName][className] || constructor || function() {};

    // 给 链头对象 原型链做一个短名映射
    chain.fn = baidu[chainName][className].prototype;

    return chain;
};


baidu.overwrite = function(Class, list, fn) {
    for (var i = list.length - 1; i > -1; i--) {
        Class.prototype[list[i]] = fn(list[i]);
    }

    return Class;
};








baidu.createChain('string',
    // 执行方法
    function(string){
        var type = baidu.type(string),
            str = new String(~'string|number'.indexOf(type) ? string : type),
            pro = String.prototype;
        baidu.forEach(baidu.string.$String.prototype, function(fn, key) {
            pro[key] || (str[key] = fn);
        });
        return str;
    }
);







baidu.merge = function(first, second) {
    var i = first.length,
        j = 0;

    if ( typeof second.length === "number" ) {
        for ( var l = second.length; j < l; j++ ) {
            first[ i++ ] = second[ j ];
        }

    } else {
        while ( second[j] !== undefined ) {
            first[ i++ ] = second[ j++ ];
        }
    }

    first.length = i;

    return first;
};







//format(a,a,d,f,c,d,g,c);
baidu.string.extend({
    format : function (opts) {
        var source = this.valueOf(),
            data = Array.prototype.slice.call(arguments,0), toString = Object.prototype.toString;
        if(data.length){
            data = data.length == 1 ? 
                
                (opts !== null && (/\[object Array\]|\[object Object\]/.test(toString.call(opts))) ? opts : data) 
                : data;
            return source.replace(/#\{(.+?)\}/g, function (match, key){
                var replacer = data[key];
                // chrome 下 typeof /a/ == 'function'
                if('[object Function]' == toString.call(replacer)){
                    replacer = replacer(key);
                }
                return ('undefined' == typeof replacer ? '' : replacer);
            });
        }
        return source;
    }
});









baidu.string.extend({
    encodeHTML : function () {
        return this.replace(/&/g,'&amp;')
                    .replace(/</g,'&lt;')
                    .replace(/>/g,'&gt;')
                    .replace(/"/g, "&quot;")
                    .replace(/'/g, "&#39;");
    }
});

/// support magic - Tangram 1.x Code Start






baidu.global.set = function(key, value, overwrite){
    return baidu.global(key, value, !overwrite);
};
/// support magic - Tangram 1.x Code End

/// support magic - Tangram 1.x Code Start






baidu.global.get = function(key){
    return baidu.global(key);
};
/// support magic - Tangram 1.x Code End

/// support magic - Tangram 1.x Code Start










baidu.global.getZIndex = function(key, step) {
    var zi = baidu.global.get("zIndex");
    if (key) {
        zi[key] = zi[key] + (step || 1);
    }
    return zi[key];
};
baidu.global.set("zIndex", {popup : 50000, dialog : 1000}, true);
/// support magic - Tangram 1.x Code End








baidu.createChain("fn",

// 执行方法
function(fn){
    return new baidu.fn.$Fn(~'function|string'.indexOf(baidu.type(fn)) ? fn : function(){});
},

// constructor
function(fn){
    this.fn = fn;
});




baidu.fn.extend({
    bind: function(scope){
        var func = this.fn,
            xargs = arguments.length > 1 ? Array.prototype.slice.call(arguments, 1) : null;
        return function(){
            var fn = baidu.type(func) === 'string' ? scope[func] : func,
                args = xargs ? xargs.concat(Array.prototype.slice.call(arguments, 0)) : arguments;
            return fn.apply(scope || fn, args);
        }
    }
});
/// Tangram 1.x Code Start

baidu.fn.bind = function(func, scope) {
    var fn = baidu.fn(func);
    return fn.bind.apply(fn, Array.prototype.slice.call(arguments, 1));
};
/// Tangram 1.x Code End

/// support maigc - Tangram 1.x Code Start








//baidu.lang.isElement = function (source) {
//    return !!(source && source.nodeName && source.nodeType == 1);
//};
baidu.lang.isElement = baidu.isElement;
/// support maigc - Tangram 1.x Code End






baidu.makeArray = function(array, results){
    var ret = results || [];
    if(!array){return ret;}
    array.length == null || ~'string|function|regexp'.indexOf(baidu.type(array)) ?
        [].push.call(ret, array) : baidu.merge(ret, array);
    return ret;
};











baidu.createChain("array", function(array){
    var pro = baidu.array.$Array.prototype
        ,ap = Array.prototype
        ,key;

    baidu.type( array ) != "array" && ( array = [] );

    for ( key in pro ) {
        //ap[key] || (array[key] = pro[key]);
        array[key] = pro[key];
    }

    return array;
});

// 对系统方法新产生的 array 对象注入自定义方法，支持完美的链式语法
baidu.overwrite(baidu.array.$Array, "concat slice".split(" "), function(key) {
    return function() {
        return baidu.array( Array.prototype[key].apply(this, arguments) );
    }
});








baidu.array.extend({
    indexOf : function (match, fromIndex) {
        baidu.check(".+(,number)?","baidu.array.indexOf");
        var len = this.length;

        // 小于 0
        (fromIndex = fromIndex | 0) < 0 && (fromIndex = Math.max(0, len + fromIndex));

        for ( ; fromIndex < len; fromIndex++) {
            if(fromIndex in this && this[fromIndex] === match) {
                return fromIndex;
            }
        }
        
        return -1;
    }
});









baidu.array.extend({
    contains : function (item) {
        return !!~this.indexOf(item);
    }
});









baidu.array.extend({
    remove : function (match) {
        var n = this.length;
            
        while (n--) {
            if (this[n] === match) {
                this.splice(n, 1);
            }
        }
        return this;
    }
});

















baidu.array.extend({
    filter: function(iterator, context) {
        var result = baidu.array([]),
            i, n, item, index=0;
    
        if (baidu.type(iterator) === "function") {
            for (i=0, n=this.length; i<n; i++) {
                item = this[i];
    
                if (iterator.call(context || this, item, i, this) === true) {
                    result[index ++] = item;
                }
            }
        }
        return result;
    }
});
/// Tangram 1.x Code Start
// TODO: delete in tangram 3.0
baidu.array.filter = function(array, filter, context) {
    return baidu.isArray(array) ? baidu.array(array).filter(filter, context) : [];
};
/// Tangram 1.x Code End

















baidu.createChain("event",

    // method
    function(){
        var lastEvt = {};
        return function( event, json ){
            switch( baidu.type( event ) ){
                // event
                case "object":
                    return lastEvt.originalEvent === event ? 
                        lastEvt : lastEvt = new baidu.event.$Event( event );

                case "$Event":
                    return event;

                // event type
//                case "string" :
//                    var e = new baidu.event.$Event( event );
//                    if( typeof json == "object" ) 
//                        baidu.forEach( e, json );
//                    return e;
            }
        }
    }(),

    // constructor
    function( event ){
        var e, t, f;
        var me = this;

        this._type_ = "$Event";

        if( typeof event == "object" && event.type ){

            me.originalEvent = e = event;

            for( var name in e )
                if( typeof e[name] != "function" )
                    me[ name ] = e[ name ];

            if( e.extraData )
                baidu.extend( me, e.extraData );

            me.target = me.srcElement = e.srcElement || (
                ( t = e.target ) && ( t.nodeType == 3 ? t.parentNode : t )
            );

            me.relatedTarget = e.relatedTarget || (
                ( t = e.fromElement ) && ( t === me.target ? e.toElement : t )
            );

            me.keyCode = me.which = e.keyCode || e.which;

            // Add which for click: 1 === left; 2 === middle; 3 === right
            if( !me.which && e.button !== undefined )
                me.which = e.button & 1 ? 1 : ( e.button & 2 ? 3 : ( e.button & 4 ? 2 : 0 ) );

            var doc = document.documentElement, body = document.body;

            me.pageX = e.pageX || (
                e.clientX + (doc && doc.scrollLeft || body && body.scrollLeft || 0) - (doc && doc.clientLeft || body && body.clientLeft || 0)
            );

            me.pageY = e.pageY || (
                e.clientY + (doc && doc.scrollTop  || body && body.scrollTop  || 0) - (doc && doc.clientTop  || body && body.clientTop  || 0)
            );

            me.data;
        }

        // event.type
//        if( typeof event == "string" )
//            this.type = event;

        // event.timeStamp
        this.timeStamp = new Date().getTime();
    }

).extend({
    stopPropagation : function() {
        var e = this.originalEvent;
        e && ( e.stopPropagation ? e.stopPropagation() : e.cancelBubble = true );
    },

    preventDefault : function() {
        var e = this.originalEvent;
        e && ( e.preventDefault ? e.preventDefault() : e.returnValue = false );
    }
});

/// support magic - Tangram 1.x Code Start

/// support magic - Tangram 1.x Code Start




baidu.i18n = baidu.i18n || {};
/// support magic - Tangram 1.x Code End

baidu.i18n.cultures = baidu.i18n.cultures || {};
/// support magic - Tangram 1.x Code End




baidu.i18n.cultures['zh-CN'] = baidu.object.extend(baidu.i18n.cultures['zh-CN'] || {}, {
    calendar: {
        dateFormat: 'yyyy-MM-dd',
        titleNames: '#{yyyy}年&nbsp;#{MM}月',
        monthNames: ['一', '二', '三', '四', '五', '六', '七', '八', '九', '十', '十一', '十二'],
        monthNamesShort: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
        dayNames: {mon: '一', tue: '二', wed: '三', thu: '四', fri: '五', sat: '六', sun: '日'}
    },
    
    timeZone: 8,
    whitespace: new RegExp("(^[\\s\\t\\xa0\\u3000]+)|([\\u3000\\xa0\\s\\t]+\x24)", "g"),
    
    number: {
        group: ",",
        groupLength: 3,
        decimal: ".",
        positive: "",
        negative: "-",

        _format: function(number, isNegative){
            return baidu.i18n.number._format(number, {
                group: this.group,
                groupLength: this.groupLength,
                decimal: this.decimal,
                symbol: isNegative ? this.negative : this.positive 
            });
        }
    },

    currency: {
        symbol: '￥'  
    },

    language: {
        ok: '确定',
        cancel: '取消',
        signin: '注册',
        signup: '登录'
    }
});

baidu.i18n.currentLocale = 'zh-CN';

/// support magic - Tangram 1.x Code Start







baidu.date = baidu.date || {};







baidu.createChain('number', function(number){
    var nan = parseFloat(number),
        val = isNaN(nan) ? nan : number,
        clazz = typeof val === 'number' ? Number : String,
        pro = clazz.prototype;
    val = new clazz(val);
    baidu.forEach(baidu.number.$Number.prototype, function(value, key){
        pro[key] || (val[key] = value);
    });
    return val;
});








baidu.number.extend({
    pad : function (length) {
        var source = this;
        var pre = "",
            negative = (source < 0),
            string = String(Math.abs(source));
    
        if (string.length < length) {
            pre = (new Array(length - string.length + 1)).join('0');
        }
    
        return (negative ?  "-" : "") + pre + string;
    }
});





baidu.date.format = function (source, pattern) {
    if ('string' != typeof pattern) {
        return source.toString();
    }

    function replacer(patternPart, result) {
        pattern = pattern.replace(patternPart, result);
    }
    
    var pad     = baidu.number.pad,
        year    = source.getFullYear(),
        month   = source.getMonth() + 1,
        date2   = source.getDate(),
        hours   = source.getHours(),
        minutes = source.getMinutes(),
        seconds = source.getSeconds();

    replacer(/yyyy/g, pad(year, 4));
    replacer(/yy/g, pad(parseInt(year.toString().slice(2), 10), 2));
    replacer(/MM/g, pad(month, 2));
    replacer(/M/g, month);
    replacer(/dd/g, pad(date2, 2));
    replacer(/d/g, date2);

    replacer(/HH/g, pad(hours, 2));
    replacer(/H/g, hours);
    replacer(/hh/g, pad(hours % 12, 2));
    replacer(/h/g, hours % 12);
    replacer(/mm/g, pad(minutes, 2));
    replacer(/m/g, minutes);
    replacer(/ss/g, pad(seconds, 2));
    replacer(/s/g, seconds);

    return pattern;
};


baidu.i18n.date = baidu.i18n.date || {

    
    getDaysInMonth: function(year, month) {
        var days = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

        if (month == 1 && baidu.i18n.date.isLeapYear(year)) {
            return 29;
        }
        return days[month];
    },

    
    isLeapYear: function(year) {
        return !(year % 400) || (!(year % 4) && !!(year % 100));
    },

    
    toLocaleDate: function(dateObject, sLocale, tLocale) {
        return this._basicDate(dateObject, sLocale, tLocale || baidu.i18n.currentLocale);
    },

    
    _basicDate: function(dateObject, sLocale, tLocale) {
        var tTimeZone = baidu.i18n.cultures[tLocale || baidu.i18n.currentLocale].timeZone,
            tTimeOffset = tTimeZone * 60,
            sTimeZone,sTimeOffset,
            millisecond = dateObject.getTime();

        if(sLocale){
            sTimeZone = baidu.i18n.cultures[sLocale].timeZone;
            sTimeOffset = sTimeZone * 60;
        }else{
            sTimeOffset = -1 * dateObject.getTimezoneOffset();
            sTimeZone = sTimeOffset / 60;
        }

        return new Date(sTimeZone != tTimeZone ? (millisecond  + (tTimeOffset - sTimeOffset) * 60000) : millisecond);
    },

    
    format: function(dateObject, tLocale) {
        // 拿到对应locale的format类型配置
        var c = baidu.i18n.cultures[tLocale || baidu.i18n.currentLocale];
        return baidu.date.format(
            baidu.i18n.date.toLocaleDate(dateObject, "", tLocale),
            c.calendar.dateFormat);
    }
};
/// support magic -  Tangram 1.x Code End






baidu.each = function( enumerable, iterator, context ) {
    var i, n, t, result;

    if ( typeof iterator == "function" && enumerable) {

        // Array or ArrayLike or NodeList or String or ArrayBuffer
        n = typeof enumerable.length == "number" ? enumerable.length : enumerable.byteLength;
        if ( typeof n == "number" ) {

            // 20121030 function.length
            //safari5.1.7 can not use typeof to check nodeList - linlingyu
            if (Object.prototype.toString.call(enumerable) === "[object Function]") {
                return enumerable;
            }

            for ( i=0; i<n; i++ ) {

                t = enumerable[ i ] || (enumerable.charAt && enumerable.charAt( i ));

                // 被循环执行的函数，默认会传入三个参数(i, array[i], array)
                result = iterator.call( context || t, i, t, enumerable );

                // 被循环执行的函数的返回值若为 false 和"break"时可以影响each方法的流程
                if ( result === false || result == "break" ) {break;}
            }
        
        // enumerable is number
        } else if (typeof enumerable == "number") {

            for (i=0; i<enumerable; i++) {
                result = iterator.call( context || i, i, i, i);
                if ( result === false || result == "break" ) { break;}
            }
        
        // enumerable is json
        } else if (typeof enumerable == "object") {

            for (i in enumerable) {
                if ( enumerable.hasOwnProperty(i) ) {
                    result = iterator.call( context || enumerable[ i ], i, enumerable[ i ], enumerable );

                    if ( result === false || result == "break" ) { break;}
                }
            }
        }
    }

    return enumerable;
};




//IE 8下，以documentMode为准
//在百度模板中，可能会有$，防止冲突，将$1 写成 \x241

//baidu.browser.ie = baidu.ie = /msie (\d+\.\d+)/i.test(navigator.userAgent) ? (document.documentMode || + RegExp['\x241']) : undefined;




baidu.page = baidu.page || {};
baidu.page.getWidth = function () {
    var doc = document,
        body = doc.body,
        html = doc.documentElement,
        client = doc.compatMode == 'BackCompat' ? body : doc.documentElement;

    return Math.max(html.scrollWidth, body.scrollWidth, client.clientWidth);
};

baidu.page.getHeight = function () {
    var doc = document,
        body = doc.body,
        html = doc.documentElement,
        client = doc.compatMode == 'BackCompat' ? body : doc.documentElement;

    return Math.max(html.scrollHeight, body.scrollHeight, client.clientHeight);
};


baidu.page.getScrollTop = function () {
    var d = document;
    return window.pageYOffset || d.documentElement.scrollTop || d.body.scrollTop;
};


baidu.page.getScrollLeft = function () {
    var d = document;
    return window.pageXOffset || d.documentElement.scrollLeft || d.body.scrollLeft;
};

baidu.browser = baidu.browser || function(){
    var ua = navigator.userAgent;
    
    var result = {
        isStrict : document.compatMode == "CSS1Compat"
        ,isGecko : /gecko/i.test(ua) && !/like gecko/i.test(ua)
        ,isWebkit: /webkit/i.test(ua)
    };

    try{/(\d+\.\d+)/.test(external.max_version) && (result.maxthon = + RegExp['\x241'])} catch (e){};

    // 蛋疼 你懂的
    switch (true) {
        case /msie (\d+\.\d+)/i.test(ua) :
            result.ie = document.documentMode || + RegExp['\x241'];
            break;
        case /chrome\/(\d+\.\d+)/i.test(ua) :
            result.chrome = + RegExp['\x241'];
            break;
        case /(\d+\.\d)?(?:\.\d)?\s+safari\/?(\d+\.\d+)?/i.test(ua) && !/chrome/i.test(ua) :
            result.safari = + (RegExp['\x241'] || RegExp['\x242']);
            break;
        case /firefox\/(\d+\.\d+)/i.test(ua) : 
            result.firefox = + RegExp['\x241'];
            break;
        
        case /opera(?:\/| )(\d+(?:\.\d+)?)(.+?(version\/(\d+(?:\.\d+)?)))?/i.test(ua) :
            result.opera = + ( RegExp["\x244"] || RegExp["\x241"] );
            break;
    }
           
    baidu.extend(baidu, result);

    return result;
}();

//IE 8下，以documentMode为准
//在百度模板中，可能会有$，防止冲突，将$1 写成 \x241

//baidu.browser.ie = baidu.ie = /msie (\d+\.\d+)/i.test(navigator.userAgent) ? (document.documentMode || + RegExp['\x241']) : undefined;


baidu.page.getViewHeight = function () {
    var doc = document,
        ie = baidu.browser.ie || 1,
        client = doc.compatMode === 'BackCompat'
            && ie < 9 ? doc.body : doc.documentElement;
        //ie9浏览器需要取得documentElement才能取得到正确的高度
    return client.clientHeight;
};
baidu.page.getViewWidth = function () {
    var doc = document,
        client = doc.compatMode == 'BackCompat' ? doc.body : doc.documentElement;

    return client.clientWidth;
};

(function(){

    baidu.page.getMousePosition = function() {
        return {
            x : baidu.page.getScrollLeft() + xy.x,
            y : baidu.page.getScrollTop() + xy.y
        };
    };

    var xy = {x:0, y:0};

    // 监听当前网页的 mousemove 事件以获得鼠标的实时坐标
    baidu.dom(document).mousemove(function(e) {
        e = window.event || e;
        xy.x = e.clientX;
        xy.y = e.clientY;
    });
})();

baidu.extend({
    contains : function(target) {
        return jQuery.contains(this, target);
    }    
});

baidu.fx = baidu.fx || {};

baidu.fx.current = function(element) {
    if (!(element = $(element).get(0))) return null;
    var a, guids, reg = /\|([^\|]+)\|/g;

    // 可以向<html>追溯
    do {if (guids = element.getAttribute("baidu_current_effect")) break;}
    while ((element = element.parentNode) && element.nodeType == 1);

    if (!guids) return null;

    if ((a = guids.match(reg))) {
        //fix
        //在firefox中使用g模式，会出现ture与false交替出现的问题
        reg = /\|([^\|]+)\|/;
        
        for (var i=0; i<a.length; i++) {
            reg.test(a[i]);
//            a[i] = window[baidu.guid]._instances[RegExp["\x241"]];
            a[i] = baidu._global_._instances[RegExp["\x241"]];
        }
    }
    return a;
};

baidu.fx.Timeline = function(options){
    baidu.lang.Class.call(this);

    this.interval = 16;
    this.duration = 500;
    this.dynamic  = true;

    baidu.object.extend(this, options);
};
baidu.lang.inherits(baidu.fx.Timeline, baidu.lang.Class, "baidu.fx.Timeline").extend({

    
    launch : function(){
        var me = this;
        me.dispatchEvent("onbeforestart");

        
        typeof me.initialize =="function" && me.initialize();

        me["\x06btime"] = new Date().getTime();
        me["\x06etime"] = me["\x06btime"] + (me.dynamic ? me.duration : 0);
        me["\x06pulsed"]();

        return me;
    }

    
    ,"\x06pulsed" : function(){
        var me = this;
        var now = new Date().getTime();
        // 当前时间线的进度百分比
        me.percent = (now - me["\x06btime"]) / me.duration;
        me.dispatchEvent("onbeforeupdate");

        // 时间线已经走到终点
        if (now >= me["\x06etime"]){
            typeof me.render == "function" && me.render(me.transition(me.percent = 1));

            // [interface run] finish()接口，时间线结束时对应的操作
            typeof me.finish == "function" && me.finish();

            me.dispatchEvent("onafterfinish");
            me.dispose();
            return;
        }

        
        typeof me.render == "function" && me.render(me.transition(me.percent));
        me.dispatchEvent("onafterupdate");

        me["\x06timer"] = setTimeout(function(){me["\x06pulsed"]()}, me.interval);
    }
    
    ,transition: function(percent) {
        return percent;
    }

    
    ,cancel : function() {
        this["\x06timer"] && clearTimeout(this["\x06timer"]);
        this["\x06etime"] = this["\x06btime"];

        // [interface run] restore() 当时间线被撤销时的恢复操作
        typeof this.restore == "function" && this.restore();
        this.dispatchEvent("oncancel");

        this.dispose();
    }

    
    ,end : function() {
        this["\x06timer"] && clearTimeout(this["\x06timer"]);
        this["\x06etime"] = this["\x06btime"];
        this["\x06pulsed"]();
    }
});
/// support magic - Tangram 1.x Code End


baidu.fx.create = function(element, options, fxName) {
    var timeline = new baidu.fx.Timeline(options);

    timeline.element = element;
    timeline.__type = fxName || timeline.__type;
    timeline["\x06original"] = {};   // 20100708
    var catt = "baidu_current_effect";

    
    timeline.addEventListener("onbeforestart", function(){
        var me = this, guid;
        me.attribName = "att_"+ me.__type.replace(/\W/g, "_");
        guid = $(me.element).attr(catt);
        $(me.element).attr(catt, (guid||"") +"|"+ me.guid +"|", 0);

        if (!me.overlapping) {
            (guid = $(me.element).attr(me.attribName)) 
                && baiduInstance(guid).cancel();

            //在DOM元素上记录当前效果的guid
            $(me.element).attr(me.attribName, me.guid, 0);
        }
    });

    
    timeline["\x06clean"] = function(e) {
        var me = this, guid;
        if (e = me.element) {
            e.removeAttribute(me.attribName);
            guid = e.getAttribute(catt);
            guid = guid.replace("|"+ me.guid +"|", "");
            if (!guid) e.removeAttribute(catt);
            else e.setAttribute(catt, guid, 0);
        }
    };

    
    timeline.addEventListener("oncancel", function() {
        this["\x06clean"]();
        this["\x06restore"]();
    });

    
    timeline.addEventListener("onafterfinish", function() {
        this["\x06clean"]();
        this.restoreAfterFinish && this["\x06restore"]();
    });

    
    timeline.protect = function(key) {
        this["\x06original"][key] = this.element.style[key];
    };

    
    timeline["\x06restore"] = function() {
        var o = this["\x06original"],
            s = this.element.style,
            v;
        for (var i in o) {
            v = o[i];
            if (typeof v == "undefined") continue;

            s[i] = v;    // 还原初始值

            // [TODO] 假如以下语句将来达不到要求时可以使用 cssText 操作
            if (!v && s.removeAttribute) s.removeAttribute(i);    // IE
            else if (!v && s.removeProperty) s.removeProperty(i); // !IE
        }
    };

    return timeline;
};




/// support magic - support magic - Tangram 1.x Code End


 

baidu.fx.scrollBy = function(element, distance, options) {
    if (!(element = $(element).get(0)) || typeof distance != "object") return null;
    
    var d = {}, mm = {};
    d.x = distance[0] || distance.x || 0;
    d.y = distance[1] || distance.y || 0;

    var fx = baidu.fx.create(element, baidu.object.extend({
        //[Implement Interface] initialize
        initialize : function() {
            var t = mm.sTop   = element.scrollTop;
            var l = mm.sLeft  = element.scrollLeft;

            mm.sx = Math.min(element.scrollWidth - element.clientWidth - l, d.x);
            mm.sy = Math.min(element.scrollHeight- element.clientHeight- t, d.y);
        }

        //[Implement Interface] transition
        ,transition : function(percent) {return 1 - Math.pow(1 - percent, 2);}

        //[Implement Interface] render
        ,render : function(schedule) {
            element.scrollTop  = (mm.sy * schedule + mm.sTop);
            element.scrollLeft = (mm.sx * schedule + mm.sLeft);
        }

        ,restore : function(){
            element.scrollTop   = mm.sTop;
            element.scrollLeft  = mm.sLeft;
        }
    }, options), "baidu.fx.scroll");

    return fx.launch();
};

/// support magic - Tangram 1.x Code End

 

baidu.fx.scrollTo = function(element, point, options) {
    if (!(element = $(element).get(0)) || typeof point != "object") return null;
    
    var d = {};
    d.x = (point[0] || point.x || 0) - element.scrollLeft;
    d.y = (point[1] || point.y || 0) - element.scrollTop;

    return baidu.fx.scrollBy(element, d, options);
};



(function(){
    var dragging = false,
        target, // 被拖曳的DOM元素
        op, ox, oy, timer, left, top, lastLeft, lastTop, mozUserSelect;
    baidu.dom.drag = function(element, options){
        if(!(target = baidu.dom(element))){return false;}
        op = baidu.object.extend({
            autoStop: true, // false 用户手动结束拖曳 ｜ true 在mouseup时自动停止拖曳
            capture: true,  // 鼠标拖曳粘滞
            interval: 16    // 拖曳行为的触发频度（时间：毫秒）
        }, options);
        lastLeft = left = target.css('left').replace('px', '') - 0 || 0;
        lastTop = top = target.css('top').replace('px', '') - 0 || 0;
        dragging = true;
        setTimeout(function(){
            var mouse = baidu.page.getMousePosition();  // 得到当前鼠标坐标值
            ox = op.mouseEvent ? (baidu.page.getScrollLeft() + op.mouseEvent.clientX) : mouse.x;
            oy = op.mouseEvent ? (baidu.page.getScrollTop() + op.mouseEvent.clientY) : mouse.y;
            clearInterval(timer);
            timer = setInterval(render, op.interval);
        }, 1);
        // 这项为 true，缺省在 onmouseup 事件终止拖曳
        var tangramDom = baidu(document);
        op.autoStop && tangramDom.on('mouseup', stop);
        // 在拖曳过程中页面里的文字会被选中高亮显示，在这里修正
        tangramDom.on('selectstart', unselect);
        // 设置鼠标粘滞
        if (op.capture && target.setCapture) {
            target.setCapture();
        } else if (op.capture && window.captureEvents) {
            window.captureEvents(Event.MOUSEMOVE|Event.MOUSEUP);
        }
        // fixed for firefox
        mozUserSelect = document.body.style.MozUserSelect;
        document.body.style.MozUserSelect = 'none';
        baidu.isFunction(op.ondragstart)
            && op.ondragstart(target, op);
        return {
            stop: stop, dispose: stop,
            update: function(options){
                baidu.object.extend(op, options);
            }
        }
    }
    // 停止拖曳
    function stop() {
        dragging = false;
        clearInterval(timer);
        // 解除鼠标粘滞
        if (op.capture && target.releaseCapture) {
            target.releaseCapture();
        } else if (op.capture && window.releaseEvents) {
            window.releaseEvents(Event.MOUSEMOVE|Event.MOUSEUP);
        }
        // 拖曳时网页内容被框选
        document.body.style.MozUserSelect = mozUserSelect;
        var tangramDom = baidu.dom(document);
        tangramDom.off('selectstart', unselect);
        op.autoStop && tangramDom.off('mouseup', stop);
        // ondragend 事件
        baidu.isFunction(op.ondragend)
            && op.ondragend(target, op, {left: lastLeft, top: lastTop});
    }
    // 对DOM元素进行top/left赋新值以实现拖曳的效果
    function render(e) {
        if(!dragging){
            clearInterval(timer);
            return;
        }
        var rg = op.range || [],
            mouse = baidu.page.getMousePosition(),
            el = left + mouse.x - ox,
            et = top  + mouse.y - oy;

        // 如果用户限定了可拖动的范围
        if (baidu.isObject(rg) && rg.length == 4) {
            el = Math.max(rg[3], el);
            el = Math.min(rg[1] - target.outerWidth(), el);
            et = Math.max(rg[0], et);
            et = Math.min(rg[2] - target.outerHeight(), et);
        }
        target.css('left', el + 'px');
        target.css('top', et + 'px');
        lastLeft = el;
        lastTop = et;
        baidu.isFunction(op.ondrag)
            && op.ondrag(target, op, {left: lastLeft, top: lastTop});
    }
    // 对document.body.onselectstart事件进行监听，避免拖曳时文字被选中
    function unselect(e) {
        return baidu.event.preventDefault(e, false);
    }
})();

baidu.fx.move = function(element, options) {
    if (!(element = $(element).get(0))
        || $(element).css("position") == "static") return null;
    
    options = baidu.object.extend({x:0, y:0}, options || {});
    if (options.x == 0 && options.y == 0) return null;

    var fx = baidu.fx.create(element, baidu.object.extend({
        //[Implement Interface] initialize
        initialize : function() {
            this.protect("top");
            this.protect("left");

            this.originX = parseInt($(element).css("left"))|| 0;
            this.originY = parseInt($(element).css("top")) || 0;
        }

        //[Implement Interface] transition
        ,transition : function(percent) {return 1 - Math.pow(1 - percent, 2);}

        //[Implement Interface] render
        ,render : function(schedule) {
            element.style.top  = (this.y * schedule + this.originY) +"px";
            element.style.left = (this.x * schedule + this.originX) +"px";
        }
    }, options), "baidu.fx.move");

    return fx.launch();
};

baidu.fx.moveTo = function(element, point, options) {
    if (!(element = $(element))
        || element.css("position") == "static"
        || typeof point != "object") return null;

    var p = [point[0] || point.x || 0,point[1] || point.y || 0];
    var x = parseInt($(element).css("left")) || 0;
    var y = parseInt($(element).css("top"))  || 0;

    var fx = baidu.fx.move(element, baidu.object.extend({x: p[0]-x, y: p[1]-y}, options||{}));

    return fx;
};

baidu.string.extend({
    trim : function() {
        return jQuery.trim(this);
    }    
});



if(typeof magic != "function"){
    var magic = function(){
        // TODO: 
    };
}

magic.resourcePath = "";
magic.skinName = "default";
magic.version = "1.1.0.4";

/msie 6/i.test(navigator.userAgent) && 
document.execCommand("BackgroundImageCache", false, true);











magic.Base = function(){
    baidu.lang.Class.call(this);

    this._ids = {};
    this._eid = this.guid +"__";
}
baidu.lang.inherits(magic.Base, baidu.lang.Class, "magic.Base").extend(

{
    
    getElement : function(id) {
        return document.getElementById(this.$getId(id));
    },

    
    getElements: function(){
        var result = {};
        var _ids = this._ids;
        for(var key in _ids)
            result[key] = this.getElement(key);
        return result;
    },

    
    $getId : function(key) {
        key = baidu.lang.isString(key) ? key : "";
        // 2012-3-23: 使 _ids 存入所以可能被建立映射的 key
        return this._ids[key] || (this._ids[key] = this._eid + key);
    }

    
    ,$mappingDom : function(key, dom){
        if (baidu.lang.isString(dom)) {
            this._ids[key] = dom;
        } else if (dom && dom.nodeType) {
            dom.id ? this._ids[key] = dom.id : dom.id = this.$getId(key);
        }
        return this;
    }

    
    ,$dispose : function() {
        this.fire("ondispose") && baidu.lang.Class.prototype.dispose.call(this);
    }
});

//  20120110    meizz   简化eid去掉其中的__type部分；事件派发使用fire方法替换原来 dispatchEvent
//  20111129    meizz   实例化效率大比拼
//                      new ui.Base()           效率为 1
//                      new ui.control.Layer()  效率为 2
//                      new ui.Dialog()         效率为 3.5





magic.control = magic.control || {};













































void function(){
    
    function Item(options){
        this._options = options;
        this._constructor();
    }
    
    
    Item.prototype._constructor = function(){
        var me = this,
            opt = me._options;
        me._element = baidu.lang.isElement(opt.content) && opt.content;
        me.guid = me._element.id || baidu.lang.guid() + '-carousel-item';
        me._element && !me._element.id && (me._element.id = me.guid);
    }
    
    Item.prototype.render = function(target, direction){
        if(this._element){return;}
        var me = this,
            opt = me._options,
            child = baidu.dom(target).children(),
            tagName = child[0] ? child[0].tagName : 'li',
            template = '<'+ tagName +' id="#{rsid}" class="#{class}">#{content}</'+ tagName +'>',
            position = direction == 'forward' ? 'append' : 'prepend';

        baidu.dom(target)[position](baidu.string.format(template, {
                rsid: me.guid,
                'class': 'tang-carousel-item' + (opt.empty ? ' tang-carousel-item-empty' : ''),
                content: opt.empty ? '&nbsp;' : ''
            }));
        me._element = baidu.dom('#'+me.guid).get(0);
    }
    
    Item.prototype.insert = function(target, direction){
        var me = this;
        if(me._element){
            direction == 'forward' ? target.appendChild(me._element)
                : target.insertBefore(me._element, target.firstChild)
        }else{
            me.render(target, direction);
        }
    }
    
    Item.prototype.loadContent = function(){
        var me = this;
    }
    
    
    Item.prototype.getElement = function(){
        var me = this;
        return me._element || baidu.dom('#'+this.guid).get(0);
    }
    
    

    magic.control.Carousel = baidu.lang.createClass(function(options){
        var me = this,
            focusRange = options.focusRange,
            opt;
        me._options = baidu.object.extend({
            viewSize: 3,
            step: 1,//修改成数值
            focusRange: {min: 0, max: options.viewSize - 1 || 2},
            orientation: 'horizontal',//horizontal|vertical
            originalIndex: 0,
            isLoop: false
        }, options);
        opt = me._options;
        //
        me._selectedIndex = opt.originalIndex;
        focusRange && (opt.focusRange = {//fix focusRange
            min: Math.max(0, focusRange.min),
            max: Math.min(opt.viewSize - 1, focusRange.max)
        });
        //
        me._items = opt.items || [];//数据内容项
        me._dataIds = [];
        me._datas = {};//Item对象
        me.on('onfocus', function(){me._scrolling = false;});
        me.on('onload', function(evt){
            var axis = me._axis[me._options.orientation],
                selectedIndex = me._selectedIndex,
                opt = me._options,
                focusRange = opt.focusRange,
                handler = baidu.fn.bind('_onEventHandler', me);
            me.$mappingDom('container', baidu('.tang-carousel-container', me.getElement())[0]).
            $mappingDom('element', baidu('.tang-carousel-element', me.getElement())[0]);
            //data
            baidu.dom(baidu.dom(me.getElement('element')).children()).each(function(index, ele){
                var item = new Item({content: ele});
                me._dataIds.push(item.guid);
                me._datas[item.guid] = item;
                baidu.dom(ele)[selectedIndex == index ? 'addClass' : 'removeClass']('tang-carousel-item-selected');
            });
            me._clear(selectedIndex, focusRange[selectedIndex > (me._dataIds.length - 1) / 2 ? 'max' : 'min'], true);
            me._resize();
            //event
            baidu.dom(me.getElement('element')).on('click', handler);
            baidu.dom(me.getElement('element')).on('mouseover', handler);
            baidu.dom(me.getElement('element')).on('mouseout', handler);
            me.on('ondispose', function(){
                baidu.dom(me.getElement('element')).off('click', handler);
                baidu.dom(me.getElement('element')).off('mouseover', handler);
                baidu.dom(me.getElement('element')).off('mouseout', handler);
            });
        });
        
    }, {
        type: 'magic.control.Carousel',
        superClass: magic.Base
    }).extend(
    
    {
        _axis: {
            horizontal: {size: 'width',  offsetPos: 'offsetLeft', offsetSize: 'offsetWidth',  scrollPos: 'scrollLeft'},
            vertical:   {size: 'height', offsetPos: 'offsetTop',  offsetSize: 'offsetHeight', scrollPos: 'scrollTop'}
        },
        
        
        
        
        
        _onEventHandler: function(evt){
            var me = this,
                opt = me._options,
                element = me.getElement('element'),
                target = evt.target;
            if(!baidu.dom.contains(me.getElement('element'), target)){return;}
            var item = baidu.dom(target).closest('.tang-carousel-item').get(0);
            
            if(evt.type === 'mouseover'){
                var relatedTarget = evt.fromElement || evt.relatedTarget;
            }else if(evt.type === 'mouseout'){
                var relatedTarget = evt.toElement || evt.relatedTarget;
            }
            if(baidu.dom(relatedTarget).closest(item).size() > 0) return;
            
            me.fire('on' + evt.type.toLowerCase() + 'item', {
                DOMEvent: evt,
                index: baidu.array.indexOf(me._dataIds, item.id)
            });
        },
        
        //private
        
        _getItemBound: function(){
            var me = this,
                opt = me._options,
                orie = opt.orientation.toLowerCase() == 'horizontal',
                axis = me._axis[opt.orientation],
                val = me._bound,
                child;
            if(!val){
                child = baidu.dom(me.getElement('element')).children().get(0);
                if(child){
                    val = me._bound = {
                        marginPrev: parseInt(baidu.dom(child).css('margin' + (orie ? 'Left' : 'Top')), 10),
                        marginNext: parseInt(baidu.dom(child).css('margin' + (orie ? 'Right' : 'Bottom')), 10),
                        size: child[axis.offsetSize]
                    };
                    val.bound = val.size + (orie ? (val.marginPrev + val.marginNext) : Math.max(val.marginPrev, val.marginNext));
                }
            }
            return val || {marginPrev: 0, marginNext: 0, size: 0, bound: 0};
        },
        
        
        _resize: function(){
            var me = this,
                axis = me._axis[me._options.orientation],
                el = me.getElement('element'),
                child = baidu.dom(el).children();
            el.style[axis.size] = child.length * me._getItemBound().bound + 'px';
        },
        
        
        _clear: function(index, offset, isLimit){
            var me = this,
                axis = me._axis[me._options.orientation],
                opt = me._options,
                viewSize = opt.viewSize,
                focusRange = opt.focusRange,
                totalCount = me._dataIds.length,
                child = baidu.makeArray(baidu.dom(me.getElement('element')).children()),
                posIndex = baidu.array(child).indexOf(me._getItem(index).getElement());
            if(isLimit){
                index - focusRange.min < 0 && (offset = index);
                index + viewSize - focusRange.max > totalCount
                    && (offset = viewSize - totalCount + index);
            }
            
            baidu(child).each(function(index, item){
                (index < posIndex - offset || index > posIndex + viewSize - offset - 1)
                    && baidu.dom(item).remove();
            });
            me.getElement('container')[axis.scrollPos] = 0;//init
        },
        
        
        _getItem: function(index){
            var me = this;
            return me._datas[typeof index == 'string' ? index : me._dataIds[index]];
        },
        
        
        _toggle: function(index){
            var me = this;
            baidu.dom('#'+me._dataIds[me._selectedIndex]).removeClass('tang-carousel-item-selected');
            me._selectedIndex = index;
            baidu.dom('#'+me._dataIds[index]).addClass('tang-carousel-item-selected');
        },
        
        
        
        _scrollTo: function(index, direction){
            var me = this,
                opt = me._options,
                focusRange = opt.focusRange,
                selectedIndex = me._selectedIndex,
                axis = me._axis[opt.orientation],
                direction = direction || (index > selectedIndex ? 'forward' : 'backward'),
                vector = direction.toLowerCase() == 'forward',
                container = me.getElement('container'),
                element = me.getElement('element'),
                bound = me._getItemBound(),
                target = baidu.dom('#'+me._getItem(index).guid).get(0),
                totalCount = me._dataIds.length,
                child = baidu.makeArray(baidu.dom(element).children()),
                posIndex = baidu.array.indexOf(child, me._getItem(selectedIndex).getElement()),//当前焦点在viewSize中的位置
                len = ((vector ? 1 : -1) * (index - selectedIndex) + totalCount) % totalCount
                    + (vector ? opt.viewSize - focusRange.max - 1 : focusRange.min)
                    - (vector ? child.length - posIndex - 1 : posIndex),//((vector ? -1 : 1) * y - x + len) % len.
                empty = [],
                count, ele, distance, insertItem, entry;
            if( me._scrolling){//exit
                return;
            }
            me._scrolling = true;
            if(!target || target[axis.offsetPos] < focusRange.min * bound.bound
                || target[axis.offsetPos] - bound.marginPrev > focusRange.max * bound.bound){//need move
                for(var i = 0; i < len; i++){
                    count = (selectedIndex + (vector ? child.length - posIndex - 1 : -posIndex)
                        + (vector ? 1 : -1) * (i + 1) + totalCount) % totalCount;
                    ele = baidu.dom('#'+me._dataIds[count]).get(0);
                    insertItem = ele ? new Item({empty: true}) : me._getItem(count);
                    insertItem.insert(element, direction);
                    insertItem.loadContent();
                    ele && empty.push({empty: insertItem.getElement(), item: ele});
                }
                me._resize();
                !vector && (container[axis.scrollPos] += bound.bound * len);
                //
                if(me.fire('onbeforescroll', {index: index, distance: (vector ? 1 : -1) * bound.bound * len, empty: empty})){
                    me._toggle(index);
                    while(empty.length > 0){//clear empty
                        entry = empty.shift();
                        element.replaceChild(entry.item, entry.empty);
                        baidu.dom(entry.empty).remove();
                    }
                    me._clear(index, focusRange[vector ? 'max' : 'min']);
                    me._resize();
                    me.fire('onfocus', {direction: direction});
                }
            }else{//keep
                me._toggle(index);
                me.fire('onfocus', {direction: direction});
            }
        },
        
        
        _basicFlip: function(type){
            var me = this,
                opt = me._options,
                focusRange = opt.focusRange,
                vector = (type == 'forward') ? 1 : -1,
                selectedIndex = me._selectedIndex,
                totalCount = me._dataIds.length,
                index = opt.isLoop ?
                    (selectedIndex + vector * opt.step + totalCount) % totalCount
                    : Math.min(totalCount - 1 - (opt.viewSize - 1 - focusRange.max), Math.max(0 + focusRange.min , selectedIndex + vector * opt.step));
            me._scrollTo(index, type);
        },
        
        //public
        
        focusPrev: function(){
            this._basicFlip('backward');
        },
        
        
        focusNext: function(){
            this._basicFlip('forward');
        },
        
        
        focus: function(index, direction){
            var index = Math.min(Math.max(0, index), this._dataIds.length - 1);
            this._scrollTo(index, direction);
        },
        
        
        getCurrentIndex: function(){
            return this._selectedIndex;
        },
        
        
        getTotalCount: function(){
            return this._dataIds.length;
        },
        
        
        $dispose: function(){
            var me = this;
            if(me.disposed){return;}
            magic.Base.prototype.$dispose.call(me);
        }
    });
}();













magic.Carousel = baidu.lang.createClass(function(options){
    
}, {
    type: 'magic.Carousel',
    superClass: magic.control.Carousel
}).extend(

{
    
    tplItem: '<li class="#{class}">#{content}</li>',
    
    
    toHTMLString: function(){
        var me = this,
            len = me._options.items.length,
            array = [];
        for(var i = 0; i < len; i++){
            array.push(baidu.string.format(me.tplItem, {
                'class': 'tang-carousel-item',
                content: me._items[i].content
            }));
        }
        return baidu.string.format(
            '<div class="#{containerClass}"><ul class="#{elementClass}">#{content}</ul></div>',
            {containerClass: 'tang-carousel-container', elementClass: 'tang-carousel-element', content: array.join('')});
    },
    
    
    render: function(target){
        var me = this,
            container;
        if (me.getElement()) {return;}//已经渲染过
        me.$mappingDom('', baidu.dom('#'+target).get(0) || document.body);
        container = me.getElement();
        baidu.dom(container).addClass('tang-ui tang-carousel')
                            .append(me.toHTMLString());
        me.fire('ondomready');
        me.fire('onload');
    },
    
    
    $dispose: function(){
        var me = this, container;
        if(me.disposed){return;}
        baidu.dom(me.getElement()).removeClass('tang-ui tang-carousel');
        container = me.getElement('container');
        magic.Base.prototype.$dispose.call(me);
        baidu.dom(container).remove();
        container = null;
    }
});





(function(){
    magic.setup = magic.setup || function(el, Type, options){
        // 从HTML标签属性 tang-param 里分解出用户指定的参数
        var opt = parseAttr(el, "tang-param") || {};

        // 脚本里直接指定的参数权重要高于HTML标签属性里的tang-param
        for (var i in options) opt[i] = options[i];

        var ui = new Type(opt);
        ui.$mappingDom("", el);

        // 添加DOM元素直接调用实例方法的模式    20111205 meizz
        // tang-event="onclick:$.hide()"
        attachEvent(el, ui.guid);
        var doms = el.getElementsByTagName("*");
        for (var i = doms.length - 1; i >= 0; i--) {
            attachEvent(doms[i], ui.guid);
        };

        return ui;
    };

    // 解析DOM元素标签自定义属性值，返回 JSON 对象
    function parseAttr(el, attr) {
        var str = el.getAttribute(attr), keys, json = false;

        if (str && (keys = str.match(reg[0]))) {
            json = {};
            for (var i = 0, a; i < keys.length; i++) {
                a = keys[i].match(reg[1]);

                // Number类型的处理
                !isNaN(a[2]) && (a[2] = +a[2]);

                // 去引号
                reg[2].test(a[2]) && (a[2] = a[2].replace(reg[3], "\x242"));

                // Boolean类型的处理
                reg[4].test(a[2]) && (a[2] = reg[5].test(a[2]));

                json[a[1]] = a[2];
            };
        }
        return json;
    }
    var reg = [
        /\b[\w\$\-]+\s*:\s*[^;]+/g         
        ,/([\w\$\-]+)\s*:\s*([^;]+)\s*/    
        ,/\'|\"/                         
        ,/^\s*(\'|\")([^\1]*)\1\s*/        
        ,/^(true|false)\s*$/i            
        ,/\btrue\b/i                     
    ]

    // 解析 DOM 元素标签属性 tang-event ，动态绑定事件
    function attachEvent(el, guid) {
        var json = parseAttr(el, "tang-event");
        if (json) {
            for (var i in json) {
                var method = json[i].substr(1);
                // 如果用户已经指定参数，有效
                method.indexOf("(") < 0 && (method += "()");
                baidu.dom(el).on(i, new Function("baiduInstance('"+guid+"') && baiduInstance('"+guid+"')"+method));
            }
        }
    }
})();






magic.setup.carousel = function(el, options) {
    
    var instance = magic.setup(baidu.dom('#'+el).get(0), magic.control.Carousel, options);
    instance.fire('onload');
    return instance;
};
























baidu.lang.register(magic.control.Carousel, function(options){
    var me = this, prevHandler, nextHandler;
    me._options.button = baidu.object.extend({
        enable: true
    }, me._options.button);
    if(!me._options.button.enable){return;}
    prevHandler = baidu.fn.bind('_onButtonClick', me, 'backward');
    nextHandler = baidu.fn.bind('_onButtonClick', me, 'forward');
    function toggle(){
        var prev = me.getElement('prev'),
            next = me.getElement('next');
        baidu.dom(prev)[me.isFirst() ? 'addClass' : 'removeClass']('tang-carousel-btn-prev-disabled');
        baidu.dom(next)[me.isLast() ? 'addClass' : 'removeClass']('tang-carousel-btn-next-disabled');
        baidu.dom(prev)[!me.isFirst() ? 'addClass' : 'removeClass']('tang-carousel-btn-prev');
        baidu.dom(next)[!me.isLast() ? 'addClass' : 'removeClass']('tang-carousel-btn-next');
    }
    me.on('onload', function(evt){
        me.$mappingDom('prev', baidu('.tang-carousel-btn-prev', me.getElement())[0]).
        $mappingDom('next', baidu('.tang-carousel-btn-next', me.getElement())[0]);
        //
        baidu.dom(me.getElement('prev')).on('click', prevHandler);
        baidu.dom(me.getElement('next')).on('click', nextHandler);
        toggle();
    });
    //
    me.on('onfocus', function(){
        toggle();
    });
    //
    me.on('ondispose', function(){
        baidu.dom(me.getElement('prev')).off('click', prevHandler);
        baidu.dom(me.getElement('next')).off('click', nextHandler);
    });
}, 
{
    
    _onButtonClick: function(direction, evt){
        var me = this;
        if(direction == 'forward' ? me.isLast() : me.isFirst()){return;}
        me._basicFlip(direction);
    },
    
    
    _isLimit: function(direction){
        var me = this,
            opt = me._options,
            focusRange = opt.focusRange,
            selectedIndex = me._selectedIndex,
            val = (direction == 'forward') ? selectedIndex >= me.getTotalCount() - 1 - (opt.viewSize - 1 - focusRange.max)
                : selectedIndex <= focusRange.min;
        return opt.isLoop ? false : val;
    },
    
    
    
    isFirst: function(){
        return this._isLimit('backward');
    },
    
    isLast: function(){
        return this._isLimit('forward');
    }
});





baidu.lang.register(magic.Carousel, function(options){
    var me = this,
        tplButton = '<a href="#" class="tang-carousel-btn #{class}" onclick="return false;">#{content}</a>';
    
    me._options.button = baidu.object.extend({
        buttonLabel: {
            prev: '',
            next: ''
        }
    }, me._options.button);
    
    if(!me._options.button.enable){return;}
    me.on('ondomready', function(evt){
        var container = me.getElement();
        baidu.dom(container).prepend(baidu.string.format(tplButton, {
            'class': 'tang-carousel-btn-prev',
            content: me._options.button.buttonLabel.prev
        }));
        baidu.dom(container).append(baidu.string.format(tplButton, {
            'class': 'tang-carousel-btn-next',
            content: me._options.button.buttonLabel.next
        }));
        me.on('ondispose', function(){
            baidu(['prev', 'next']).each(function(index, item){
                baidu.dom(me.getElement(item)).remove();
            });
        });
    });
});













baidu.lang.register(magic.control.Carousel, function(options){
    var me = this, autoScroll;
    me._options.autoScroll = baidu.object.extend({
        enable: true,
        interval: 1000,
        direction: 'forward'// forward|backward 描述组件的滚动方向
    }, me._options.autoScroll);
    autoScroll = me._options.autoScroll;
    if(!autoScroll.enable){return;}
    autoScroll._autoScrolling = true;
    autoScroll.direction = autoScroll.direction.toLowerCase();//sweet?
    me.on('onload', function(evt){
        var handler = baidu.fn.bind('_onMouseEventHandler', me);
        baidu.dom(me.getElement('element')).on('mouseenter', handler);
        baidu.dom(me.getElement('element')).on('mouseleave', handler);
        me.on('ondispose', function(){
            baidu.dom(me.getElement('element')).off('mouseenter', handler);
            baidu.dom(me.getElement('element')).off('mouseleave', handler);
        });
        me.start();
    });
    me.on('onfocus', function(evt){
        if(!autoScroll._autoScrolling){return;}
        evt.target.start();
    });
    me.on('ondispose', function(evt){
        evt.target.stop();
    });
}, 
{   
    
    
    
    _onMouseEventHandler: function(evt){
        var me = this,
            evtName = {mouseover: 'mouseenter', mouseout: 'mouseleave'},
            type = evt.type;
        me.fire('on' + (evtName[type] || type), {DOMEvent: evt});
    },
    
    
    start: function(){
        var me = this,
            autoScroll = me._options.autoScroll;
        autoScroll._autoScrolling = true;
        clearTimeout(autoScroll._autoScrollTimeout);
        autoScroll._autoScrollTimeout = setTimeout(function(){
            me._basicFlip(autoScroll.direction);
        }, autoScroll.interval);
    },
    
    
    stop: function(){
        var me = this,
            autoScroll = me._options.autoScroll;
        clearTimeout(autoScroll._autoScrollTimeout);
        autoScroll._autoScrolling = false;
    }
});








baidu.lang.register(magic.control.Carousel, function(options){
    var me = this;
    me._options.fx = baidu.object.extend({
        enable: true
    }, me._options.fx);
    if(!me._options.fx.enable){return;}
    me.on('onbeforescroll', function(evt){
        evt.returnValue = false;
        if (baidu.fx.current(me.getElement('container'))) {return;}
        var opt = me._options,
            axis = me._axis[opt.orientation],
            orie = opt.orientation == 'horizontal',
            container = me.getElement('container'),
            val = container[axis.scrollPos] + evt.distance,
            fxOptions = baidu.object.extend({
                onbeforeupdate: function(){
                    if(evt.empty.length <= 0){return;}
                    var entry = evt.empty[0], parentNode, cloneNode;
                    if(evt.distance < 0 ? entry.empty[axis.offsetPos] + entry.empty[axis.offsetSize] - container[axis.scrollPos] >= 0
                        : entry.empty[axis.offsetPos] - container[axis.scrollPos] <= container[axis.offsetSize]){
                        parentNode = entry.empty.parentNode;
                        cloneNode = entry.empty.cloneNode(true);
                        parentNode.replaceChild(cloneNode, entry.empty);
                        parentNode.replaceChild(entry.empty, entry.item);
                        parentNode.replaceChild(entry.item, cloneNode);
                        evt.empty.shift();
                    }
                },
                
                onafterfinish: function(){
                    if(me.disposed)
                        return;
                    me._toggle(evt.index);
                    me._clear(evt.index, opt.focusRange[evt.distance < 0 ? 'min' : 'max']);
                    me._resize();
                    me.fire('onfocus', {direction: evt.distance > 0 ? 'forward' : 'backward'});
                }
            }, opt.fx);
        //
        baidu.fx.scrollTo(container, {x: orie ? val : 0, y: orie ? 0 : val}, fxOptions);
    });
});










baidu.lang.register(magic.control.Carousel, function(options){
    var me = this;
    me._options.itemsModify = baidu.object.extend({
        enable: true
    }, me._options.itemsModify);
    if(!me._options.itemsModify.enable){return;}

}, {
    
    removeItem : function(index) {
        //debugger;
        if (index >= this._dataIds.length) {
            return;
        }
        var me = this,
            focusRange = me._options.focusRange,
            viewSize = me._options.viewSize,
            element = me.getElement('element'),
            child = baidu.makeArray(baidu.dom(element).children()),
            totalCount = me._dataIds.length,
            removeTarget = baidu('#' + me._dataIds[index]),
            viewIds = [],
            count, insertItem;
        baidu.array(child).each(function(index, item) {
            viewIds.push(item.id);
        })
        if (baidu.array(viewIds).indexOf(me._dataIds[index]) != -1) {
            baidu(removeTarget).remove();
            if (me._dataIds.length > viewSize) {
                count = baidu.array(me._dataIds).indexOf(child[viewSize - 1].id) + 1;
                if (count == me._dataIds.length) {
                    count = 0;
                }
                insertItem = me._getItem(count);
                insertItem.insert(element, 'forward');
                insertItem.loadContent();
                me._resize();                 
            }
        }
        delete me._datas[me._getItem(index).guid];
        baidu.array(me._dataIds).removeAt(index);
        if (index >= me._dataIds.length) {
            index = 0;
        }
        if(me._selectedIndex == index && me._dataIds.length > 0) {
            //me._selectedIndex = -1;
            me.focus(index);
        } 
    }  
});//依赖包
























 
magic.Pager = baidu.lang.createClass(function(options) {
    var me = this;
    this.currentPage = 1;
    this.totalPage = 1;
    this.viewSize = 10;
    this.currentPagePos = 4;
    this.labelFirst = '首页';
    this.labelPrev = '上一页';
    this.labelNext = '下一页';
    this.labelLast = '尾页';
    this.tplURL = '##{pageNum}';
    this.tplLabelNormal = '#{pageNum}';
    this.tplLabelCurrent = '#{pageNum}';
    baidu.object.extend(this, options);
    this.currentPage = Math.max(this.currentPage, 1);
}, {
    type:"magic.Pager"
    ,superClass : magic.Base
}).extend(
    
{
    
    
    '_buildLink' : function(pageNum, className, innerHTML) {
        return '<a onclick="return baiduInstance(\'' + this.guid + '\').$update(' + pageNum + ')" href="' + baidu.string.format(this.tplURL, {'pageNum' : pageNum}) + '" class="tang-pager-' + className + '">'+ innerHTML + '</a>';
    },
    
    
    '$update' : function(currentPage) {
        this.currentPage = currentPage;
        var container = this.getElement();
        container.innerHTML = '';
        this.render(this.$getId());
       
        return this.fire('pagechange', {
            'pageNum' : currentPage
        });
    },
    
    
    '$toHTMLString' :  function() {
        var pageNum,
            HTMLString = [],
            //展现起始页
            startPage = this.totalPage < this.viewSize || this.currentPage <= this.currentPagePos ? 1 : Math.min(this.currentPage - this.currentPagePos, this.totalPage - this.viewSize + 1),
            //展现结束页
            endPage = Math.min(this.totalPage, startPage + this.viewSize - 1);
        HTMLString.push('<div id="' + this.$getId('main') + '" class="tang-pager-main">');
        //首页，前一页
        if (1 < this.currentPage) {
            HTMLString.push(this._buildLink(1, 'first', this.labelFirst));
            HTMLString.push(this._buildLink(this.currentPage - 1, 'previous', this.labelPrev));
        }
        //在当前页前面的页码
        for (pageNum = startPage; pageNum < this.currentPage; pageNum++) {
            HTMLString.push(this._buildLink(pageNum, 'normal', baidu.string.format(this.tplLabelNormal, {'pageNum' : pageNum})));
        }
        //当前页
        HTMLString.push('<span class="tang-pager-current">' + baidu.string.format(this.tplLabelCurrent, {'pageNum' : this.currentPage}) + '</span>');
        //在当前页后面的页码
        for (pageNum = this.currentPage + 1; pageNum <= endPage; pageNum++) {
            HTMLString.push(this._buildLink(pageNum, 'normal', baidu.string.format(this.tplLabelNormal, {'pageNum' : pageNum})));
        }
        //下一页，尾页
        if (this.totalPage > this.currentPage) {
            HTMLString.push(this._buildLink(this.currentPage + 1, 'next', this.labelNext));
            HTMLString.push(this._buildLink(this.totalPage, 'last', this.labelLast));
        }
        HTMLString.push('</div>');
        return HTMLString.join('');
    },
    
    
    'render' :  function(target) {
        if (!this.getElement()) {
            this.$mappingDom('', target || document.body);
        }
        target = baidu.dom('#'+target);
        baidu.dom(target).addClass('tang-pager')
                            .append(this.$toHTMLString());
       
        this.fire("load");
    },
    
    
    '$dispose' : function() {
        if(this.disposed) {
            return;
        }
        var container = this.getElement(),
            main = this.getElement('main');
        baidu.dom(container).removeClass('tang-pager');
       
       
        magic.Base.prototype.$dispose.call(this);
        baidu.dom(main).remove();
        container = main = null;
    }
});

// baidu.lang.register(magic.Pager, function(){}); // totalCount/viewSize
// 以后添加那种只有上、下、第一、最后、goto的模式












































































magic.control.Slider = baidu.lang.createClass( function(options){
    var me = this,
        info = me._info = baidu.object.extend({
            accuracy: 0,
            _status: 'enable'
        }, options), 
        vertical = info._isVertical = info.orientation == 'vertical';

    info.direction == 'backward' && (info._oppsite = true);

    baidu.object.extend(info, {
        _suffix: vertical ? 'vtl' : 'htl',
        _knobKey: vertical ? 'top' : 'left',
        _mouseKey: vertical? 'y' : 'x',
        _accuracyKey: vertical? 'height' : 'width'
    });
    
    me.on("load", function(){
        var view = me.getElement('view'),
            inner = me.getElement('inner'),
            eventsList = ['mousedown', 'click'],
            eventHandler = baidu.fn.bind(me._eventControl, me),
            _accuracyKey = info._accuracyKey;
        
        info._val = 'offset' + _accuracyKey.replace(/([a-z])([a-z]*)/, function($1, $2, $3){
            return $2.toUpperCase() + $3;
        });

        info.width = view.clientWidth;
        info.height = view.clientHeight;

        // 范围和固定值
        info._range = [0, info[_accuracyKey]];
        info._limit = inner[info._val];
        info._const = (info._range[1] - info._limit) / 2;

        baidu(eventsList).each(function(i, type){
            baidu.dom(view).on(type, eventHandler);
        });

        // 解除dom events绑定
        me.on('dispose', function(){
            baidu(eventsList).each(function(i, type){
                baidu.dom(view).off(type, eventHandler);
            });
        }) ;

        // 设置感应区
        me._setAccuracy(info.accuracy);

        // 初始化slider值
        me.setValue(info.currentValue);

    });

}, {type: "magic.control.Slider", superClass: magic.Base});


magic.control.Slider.extend({

    
    disable: function(){
        this._info._status = 'disabled';
    },
    
    enable: function(){
        this._info._status = 'enable';
    },

    
    setValue: function(value){
        var me = this,
            info = me._info,
            _accuracyKey = info._accuracyKey,
            value = value || 0,
            pos = info[_accuracyKey] * value;

        if(info._oppsite){
            pos = info[_accuracyKey] * me._accSub(1, value);
        }

        // 伪造一个event对象
        me._setPosition({target: null, noAccuracy: true, noFx: true}, pos);
        info.currentValue = value;       
    },
    
    getValue: function(){
        return this._info.currentValue;
    },
    
    setRange: function(value){
        var me = this,
            info = me._info,
            max = info[info._accuracyKey],
            r = value * max;

        // 缓存条限制进度功能，不支持精确度
        if(info.accuracy) return;

        info._oppsite ? info._range[0] = r : info._range[1] = r;
        info._percent = r / max;

    },

    
    $dispose: function(){
        var me = this;
        if(me.disposed) return;
        magic.Base.prototype.$dispose.call(me);
    },

    
    _accSub: function(arg1, arg2){
        var r1, r2, m, n;
        try{ r1 = arg1.toString().split(".")[1].length; }catch(e){ r1 = 0;}
        try{ r2 = arg2.toString().split(".")[1].length; }catch(e){ r2 = 0;}
        m = Math.pow(10, Math.max(r1, r2));

        n = (r1 >= r2) ? r1 : r2;
        return +((arg1 * m - arg2 * m) / m).toFixed(n);
    },

    
    _startDrag: function(evt){
        var me = this,
            info = me._info,
            knob  = me.getElement('knob'),
            process = me.getElement('process'),
            accuracy = info.accuracy,
            r1 = info.width,
            r2 = info.height,
            t1 = 0,
            t2 = 0,
            extra = knob[info._val],
            range = info._range,
            rect = [],
            offset = parseInt(baidu.dom(knob).css('margin-' + info._knobKey));
        evt.stopPropagation();
        if(info._isVertical){ // 计算拖拽的范围
            r2 = range[1] + extra;
            t1 = range[0];
        }else{
            r1 = range[1] + extra;
            t2 = range[0];
        }
        rect = [t1, r1, r2, t2];
       
        if(evt.target != knob || me._isMoving) return;

        me._recover();
        baidu.dom.drag(knob, {range: rect, fix: [info._knobKey, offset], 
            ondragstart: function(){
                me.fire('onslidestart');
            },

            ondrag: function(){
                var pos = me._getRealPos(knob, info._knobKey);
                baidu.dom(process).css(info._accuracyKey, me._getProcessPos(pos));
                me._setCurrentValue(pos);

                me.fire('onslide');
                me.fire('onchange', {value: info.currentValue});
            },

            ondragend: function(knob, op, pos){
                pos = pos[info._knobKey];
                me._reset(pos);
                accuracy && me._useAdsorbr(pos);
                me.fire('onslidestop');
            }
        });
    },

    
    _resize: function(){
        var me = this,
            info = me._info,
            percent = isNaN(Math.min(info._percent, 1)) ? 1 : Math.min(info._percent, 1),
            inner = me.getElement('inner'),
            view = me.getElement('view'), max;

        info.width = view.clientWidth;
        info.height = view.clientHeight;
        info._limit = inner[info._val];
        max = info[info._accuracyKey];

        if(info._oppsite){
            info._range = percent < 1 ? [max * percent, max] : [0, max];
        }else{
            info._range = [0, max * percent];
        }

        me._setAccuracy(info.accuracy); 
    },

    
    _recover: function(){
        var me = this,
            info = me._info,
            knob = me.getElement('knob'),
            process = me.getElement('process'),
            _accuracyKey = info._accuracyKey,
            pos1 = knob.style[info._knobKey],
            pos2 = process.style[_accuracyKey];
        if(/px|auto/.test(pos1)) return;
        if(!pos1.length) pos1 = 0;
        if(!pos2.length) pos2 = 0;
        pos1 = parseFloat(pos1) / 100 * info[_accuracyKey] + 'px';
        pos2 = parseFloat(pos2) / 100 * info._limit + 'px';
        baidu.dom(knob).css(info._knobKey, pos1);
        baidu.dom(process).css(_accuracyKey, pos2);;
    },

    
    _reset: function(pos){
        var me = this,
            info = me._info,
            knob = me.getElement('knob'),
            process = me.getElement('process');

        if(/%/.test(pos)) return;

        baidu.dom(knob).css(info._knobKey, me._knobPercent(pos));
        baidu.dom(process).css(info._accuracyKey, me._processPercent(me._getProcessPos(pos)));
    },

    
    _knobPercent: function(pos){
        var info = this._info;
        return parseFloat(pos) / info[info._accuracyKey] * 100 + '%';

    },

    
    _processPercent: function(pos){
        return this._info._limit == 0 ? '0' : parseFloat(pos) / this._info._limit * 100 + '%';
    },

    
    _getRealPos: function(elem, key){
        return elem.style[key];
    },

    
    _getProcessPos: function(pos){
        var me = this,
            info = me._info,
            range = info._range,
            limit = info._limit,
            pos = parseFloat(pos) - info._const;

        if(range[0] && pos < range[0]){
            var val = range[0] - info._const;
            return val > 0 ? val + 'px' : 0;
        }else if(pos > range[1]){
            return range[1] - info._const + 'px';
        }

        pos < 0 && (pos = 0);
        pos > limit && (pos = limit); 
        info._oppsite && (pos = limit - pos);

        return pos + 'px';

    },

    
    _getKnobPos: function(pos){
        var pos = parseFloat(pos),
            info = this._info,
            range = info._range;

        if(info._oppsite){
            pos = pos < range[0] ? range[0] : pos;
        }else{
            pos = pos > range[1] ? range[1] : pos;
        }

        return pos + 'px'
    },

    
    _getMousePos: function(){
        var view = this.getElement('view'),
            xy = baidu.page.getMousePosition(),
            page = baidu.dom(view).offset();
        
        if(this._info._mouseKey == 'x'){
            return xy.x - page.left;
        }else{
            return xy.y - page.top;
        }
    },

    
    _move: function(knob, process, pos){
        var me = this,
            info = me._info,
            range = info._range,
            mousePos = me._getKnobPos(pos),
            processPos = me._getProcessPos(pos);

        me._setCurrentValue(mousePos);
        baidu.dom(knob).css(info._knobKey, me._knobPercent(mousePos));
        baidu.dom(process).css(info._accuracyKey, me._processPercent(processPos));
    },

    
    _setCurrentValue: function(pos){
        var me = this,
            info = me._info,
            value = (parseFloat(pos) * 10) / (info[info._accuracyKey] * 10);
        if(info._oppsite){
            value = me._accSub(1, value);
        }
        info.currentValue = value;
    },

    
    _slide: function(pos, fn, inneral){
        var me = this,
            info = me._info,
            knob = me.getElement('knob'),
            process = me.getElement('process');

        if(me.fire('startFx', {knob: knob, process: process, pos: pos, fn: fn})){
            me._move(knob, process, pos);
            fn && fn();
        }
    },

    
    _setPosition: function(evt, pos, undefined){
       var me = this,
           info = me._info,
           knob = me.getElement('knob'),
           process = me.getElement('process'),
           noAccuracy = evt.noAccuracy || !info.accuracy,
           callback = function(pos){
                me._isMoving = false;
                me.fire('onchange', {value: info.currentValue});        
            };

        pos == undefined && (pos = me._getMousePos()); // 没有传值，计算鼠标位置
        if(evt.target === knob) return;
        
        me._isMoving = true;
        noAccuracy ? me._slide(pos, callback, evt.noFx) : me._useAdsorbr(pos, callback, evt.noFx);
            
    },

    
    _useAdsorbr: function(pos, fn, inneral){
        var me = this,
            info = me._info,
            pos = parseFloat(pos) || 0,
            range = info._range,
            accuracyZone = info._accuracyZone.slice(0),
            len = accuracyZone.length,
            i = 0,
            temp = pos,
            lock;

        if(pos == 0 || pos > range[1])
            lock = pos; // 边界情况
        else{
            if(info.accuracy){
                for(;i < len; i++){
                    var x = Math.abs(accuracyZone[i] - pos);
                    if(x <= temp){
                        temp = x;
                        lock = accuracyZone[i];
                    }
                }
            }else{
                lock = pos;
            }
        }

        me._slide(lock, fn, inneral);
    },

    
    _setAccuracy: function(ratio){
        var info = this._info,
            range = info._range,
            _accuracyKey = info._accuracyKey,
            factor = ratio * info[_accuracyKey],
            m = 0,
            accuracyZone = [0],
            n;

        // 如果设为0，说明不使用感应区
        if(ratio == 0){
            info.accuracy = 0;
            delete info._accuracyZone;
        }

        info.accuracy = ratio;
        while( (n = m + factor) && n < range[1]){
            m = n;
            accuracyZone.push(n);
        }

        info._accuracyZone = accuracyZone.concat(info[_accuracyKey]);
    },

    
    
    
    
    
    
    
    
    _eventControl: function(evt){
        var me = this,
            knob = me.getElement('knob'),
            process = me.getElement('process');

        evt.preventDefault(); // 阻止默认行为
        me._resize(); // 重新设置范围

        if(me._info._status == 'enable'){
            if(evt.target == knob && evt.type == 'mousedown'){
                me._startDrag(evt);
            }else if(evt.type == 'mousedown'){
                if(me.fire('onbeforeslideclick')){
                    me._setPosition(evt);
                    me.fire('onslideclick');
                }
            }
        }

    }

});




























magic.control.Slider = baidu.lang.createClass( function(options){
    var me = this,
        info = me._info = baidu.object.extend({
            accuracy: 0,
            _status: 'enable'
        }, options), 
        vertical = info._isVertical = info.orientation == 'vertical';

    info.direction == 'backward' && (info._oppsite = true);

    baidu.object.extend(info, {
        _suffix: vertical ? 'vtl' : 'htl',
        _knobKey: vertical ? 'top' : 'left',
        _mouseKey: vertical? 'y' : 'x',
        _accuracyKey: vertical? 'height' : 'width'
    });
    
    me.on("load", function(){
        var view = me.getElement('view'),
            inner = me.getElement('inner'),
            eventsList = ['mousedown', 'click'],
            eventHandler = baidu.fn.bind(me._eventControl, me),
            _accuracyKey = info._accuracyKey;
        
        info._val = 'offset' + _accuracyKey.replace(/([a-z])([a-z]*)/, function($1, $2, $3){
            return $2.toUpperCase() + $3;
        });

        info.width = view.clientWidth;
        info.height = view.clientHeight;

        // 范围和固定值
        info._range = [0, info[_accuracyKey]];
        info._limit = inner[info._val];
        info._const = (info._range[1] - info._limit) / 2;

        baidu(eventsList).each(function(i, type){
            baidu.dom(view).on(type, eventHandler);
        });

        // 解除dom events绑定
        me.on('dispose', function(){
            baidu(eventsList).each(function(i, type){
                baidu.dom(view).off(type, eventHandler);
            });
        }) ;

        // 设置感应区
        me._setAccuracy(info.accuracy);

        // 初始化slider值
        me.setValue(info.currentValue);

    });

}, {type: "magic.control.Slider", superClass: magic.Base});


magic.control.Slider.extend({

    
    disable: function(){
        this._info._status = 'disabled';
    },
    
    enable: function(){
        this._info._status = 'enable';
    },

    
    setValue: function(value){
        var me = this,
            info = me._info,
            _accuracyKey = info._accuracyKey,
            value = value || 0,
            pos = info[_accuracyKey] * value;

        if(info._oppsite){
            pos = info[_accuracyKey] * me._accSub(1, value);
        }

        // 伪造一个event对象
        me._setPosition({target: null, noAccuracy: true, noFx: true}, pos);
        info.currentValue = value;       
    },
    
    getValue: function(){
        return this._info.currentValue;
    },
    
    setRange: function(value){
        var me = this,
            info = me._info,
            max = info[info._accuracyKey],
            r = value * max;

        // 缓存条限制进度功能，不支持精确度
        if(info.accuracy) return;

        info._oppsite ? info._range[0] = r : info._range[1] = r;
        info._percent = r / max;

    },

    
    $dispose: function(){
        var me = this;
        if(me.disposed) return;
        magic.Base.prototype.$dispose.call(me);
    },

    
    _accSub: function(arg1, arg2){
        var r1, r2, m, n;
        try{ r1 = arg1.toString().split(".")[1].length; }catch(e){ r1 = 0;}
        try{ r2 = arg2.toString().split(".")[1].length; }catch(e){ r2 = 0;}
        m = Math.pow(10, Math.max(r1, r2));

        n = (r1 >= r2) ? r1 : r2;
        return +((arg1 * m - arg2 * m) / m).toFixed(n);
    },

    
    _startDrag: function(evt){
        var me = this,
            info = me._info,
            knob  = me.getElement('knob'),
            process = me.getElement('process'),
            accuracy = info.accuracy,
            r1 = info.width,
            r2 = info.height,
            t1 = 0,
            t2 = 0,
            extra = knob[info._val],
            range = info._range,
            rect = [],
            offset = parseInt(baidu.dom(knob).css('margin-' + info._knobKey));
        evt.stopPropagation();
        if(info._isVertical){ // 计算拖拽的范围
            r2 = range[1] + extra;
            t1 = range[0];
        }else{
            r1 = range[1] + extra;
            t2 = range[0];
        }
        rect = [t1, r1, r2, t2];
       
        if(evt.target != knob || me._isMoving) return;

        me._recover();
        baidu.dom.drag(knob, {range: rect, fix: [info._knobKey, offset], 
            ondragstart: function(){
                me.fire('onslidestart');
            },

            ondrag: function(){
                var pos = me._getRealPos(knob, info._knobKey);
                baidu.dom(process).css(info._accuracyKey, me._getProcessPos(pos));
                me._setCurrentValue(pos);

                me.fire('onslide');
                me.fire('onchange', {value: info.currentValue});
            },

            ondragend: function(knob, op, pos){
                pos = pos[info._knobKey];
                me._reset(pos);
                accuracy && me._useAdsorbr(pos);
                me.fire('onslidestop');
            }
        });
    },

    
    _resize: function(){
        var me = this,
            info = me._info,
            percent = isNaN(Math.min(info._percent, 1)) ? 1 : Math.min(info._percent, 1),
            inner = me.getElement('inner'),
            view = me.getElement('view'), max;

        info.width = view.clientWidth;
        info.height = view.clientHeight;
        info._limit = inner[info._val];
        max = info[info._accuracyKey];

        if(info._oppsite){
            info._range = percent < 1 ? [max * percent, max] : [0, max];
        }else{
            info._range = [0, max * percent];
        }

        me._setAccuracy(info.accuracy); 
    },

    
    _recover: function(){
        var me = this,
            info = me._info,
            knob = me.getElement('knob'),
            process = me.getElement('process'),
            _accuracyKey = info._accuracyKey,
            pos1 = knob.style[info._knobKey],
            pos2 = process.style[_accuracyKey];
        if(/px|auto/.test(pos1)) return;
        if(!pos1.length) pos1 = 0;
        if(!pos2.length) pos2 = 0;
        pos1 = parseFloat(pos1) / 100 * info[_accuracyKey] + 'px';
        pos2 = parseFloat(pos2) / 100 * info._limit + 'px';
        baidu.dom(knob).css(info._knobKey, pos1);
        baidu.dom(process).css(_accuracyKey, pos2);;
    },

    
    _reset: function(pos){
        var me = this,
            info = me._info,
            knob = me.getElement('knob'),
            process = me.getElement('process');

        if(/%/.test(pos)) return;

        baidu.dom(knob).css(info._knobKey, me._knobPercent(pos));
        baidu.dom(process).css(info._accuracyKey, me._processPercent(me._getProcessPos(pos)));
    },

    
    _knobPercent: function(pos){
        var info = this._info;
        return parseFloat(pos) / info[info._accuracyKey] * 100 + '%';

    },

    
    _processPercent: function(pos){
        return this._info._limit == 0 ? '0' : parseFloat(pos) / this._info._limit * 100 + '%';
    },

    
    _getRealPos: function(elem, key){
        return elem.style[key];
    },

    
    _getProcessPos: function(pos){
        var me = this,
            info = me._info,
            range = info._range,
            limit = info._limit,
            pos = parseFloat(pos) - info._const;

        if(range[0] && pos < range[0]){
            var val = range[0] - info._const;
            return val > 0 ? val + 'px' : 0;
        }else if(pos > range[1]){
            return range[1] - info._const + 'px';
        }

        pos < 0 && (pos = 0);
        pos > limit && (pos = limit); 
        info._oppsite && (pos = limit - pos);

        return pos + 'px';

    },

    
    _getKnobPos: function(pos){
        var pos = parseFloat(pos),
            info = this._info,
            range = info._range;

        if(info._oppsite){
            pos = pos < range[0] ? range[0] : pos;
        }else{
            pos = pos > range[1] ? range[1] : pos;
        }

        return pos + 'px'
    },

    
    _getMousePos: function(){
        var view = this.getElement('view'),
            xy = baidu.page.getMousePosition(),
            page = baidu.dom(view).offset();
        
        if(this._info._mouseKey == 'x'){
            return xy.x - page.left;
        }else{
            return xy.y - page.top;
        }
    },

    
    _move: function(knob, process, pos){
        var me = this,
            info = me._info,
            range = info._range,
            mousePos = me._getKnobPos(pos),
            processPos = me._getProcessPos(pos);

        me._setCurrentValue(mousePos);
        baidu.dom(knob).css(info._knobKey, me._knobPercent(mousePos));
        baidu.dom(process).css(info._accuracyKey, me._processPercent(processPos));
    },

    
    _setCurrentValue: function(pos){
        var me = this,
            info = me._info,
            value = (parseFloat(pos) * 10) / (info[info._accuracyKey] * 10);
        if(info._oppsite){
            value = me._accSub(1, value);
        }
        info.currentValue = value;
    },

    
    _slide: function(pos, fn, inneral){
        var me = this,
            info = me._info,
            knob = me.getElement('knob'),
            process = me.getElement('process');

        if(me.fire('startFx', {knob: knob, process: process, pos: pos, fn: fn})){
            me._move(knob, process, pos);
            fn && fn();
        }
    },

    
    _setPosition: function(evt, pos, undefined){
       var me = this,
           info = me._info,
           knob = me.getElement('knob'),
           process = me.getElement('process'),
           noAccuracy = evt.noAccuracy || !info.accuracy,
           callback = function(pos){
                me._isMoving = false;
                me.fire('onchange', {value: info.currentValue});        
            };

        pos == undefined && (pos = me._getMousePos()); // 没有传值，计算鼠标位置
        if(evt.target === knob) return;
        
        me._isMoving = true;
        noAccuracy ? me._slide(pos, callback, evt.noFx) : me._useAdsorbr(pos, callback, evt.noFx);
            
    },

    
    _useAdsorbr: function(pos, fn, inneral){
        var me = this,
            info = me._info,
            pos = parseFloat(pos) || 0,
            range = info._range,
            accuracyZone = info._accuracyZone.slice(0),
            len = accuracyZone.length,
            i = 0,
            temp = pos,
            lock;

        if(pos == 0 || pos > range[1])
            lock = pos; // 边界情况
        else{
            if(info.accuracy){
                for(;i < len; i++){
                    var x = Math.abs(accuracyZone[i] - pos);
                    if(x <= temp){
                        temp = x;
                        lock = accuracyZone[i];
                    }
                }
            }else{
                lock = pos;
            }
        }

        me._slide(lock, fn, inneral);
    },

    
    _setAccuracy: function(ratio){
        var info = this._info,
            range = info._range,
            _accuracyKey = info._accuracyKey,
            factor = ratio * info[_accuracyKey],
            m = 0,
            accuracyZone = [0],
            n;

        // 如果设为0，说明不使用感应区
        if(ratio == 0){
            info.accuracy = 0;
            delete info._accuracyZone;
        }

        info.accuracy = ratio;
        while( (n = m + factor) && n < range[1]){
            m = n;
            accuracyZone.push(n);
        }

        info._accuracyZone = accuracyZone.concat(info[_accuracyKey]);
    },

    
    
    
    
    
    
    
    
    _eventControl: function(evt){
        var me = this,
            knob = me.getElement('knob'),
            process = me.getElement('process');

        evt.preventDefault(); // 阻止默认行为
        me._resize(); // 重新设置范围

        if(me._info._status == 'enable'){
            if(evt.target == knob && evt.type == 'mousedown'){
                me._startDrag(evt);
            }else if(evt.type == 'mousedown'){
                if(me.fire('onbeforeslideclick')){
                    me._setPosition(evt);
                    me.fire('onslideclick');
                }
            }
        }

    }

});











magic.Slider = baidu.lang.createClass(function(options){


}, { type: "magic.Slider", superClass: magic.control.Slider });


magic.Slider.extend({
    
    render: function(el){
        var me = this;
        el = baidu.dom('#'+el).get(0);
        el || document.body.appendChild(el = document.createElement("div"));      
        if(/tang-slider/.test(el.className)) return;

        baidu.dom(el).addClass('tang-ui tang-slider tang-slider-' + me._info._suffix);
        el.innerHTML = me.toHTMLString();
        me.$mappingDom("", el);

        me.fire("load");

    },

    
    toHTMLString: function(){
        var me = this,
            info = me._info,
            processClass = 'tang-process-' + info.direction,
            cornerClass = info._oppsite ? '-backward' : '',
            template = baidu.string.format(magic.Slider.template, {
                id: me.$getId(),
                viewId: me.$getId('view'),
                innerId: me.$getId('inner'),
                cornerClass: cornerClass,
                processId: me.$getId("process"),
                processClass: processClass,
                knobId: me.$getId("knob")
        });

        return template;
    },

    
    $dispose: function(){
        var me = this, slider;
        if(me.disposed){ return; }
        slider = me.getElement('');
        magic.Base.prototype.$dispose.call(me);
        baidu.dom(slider).remove();
        slider = null;
    }
});

magic.Slider.template = '<div id="#{viewId}" class="tang-view"><div class="tang-content"><div class="tang-corner tang-start#{cornerClass}"></div>'
    + '<div class="tang-corner tang-last#{cornerClass}"></div>'
    + '<div id="#{innerId}" class="tang-inner"><div id="#{processId}" class="tang-process #{processClass}"></div></div>'
    + '</div>'
    + '<a id="#{knobId}" href="javascript:;" class="tang-knob"></a></div>';


magic.control.ScrollPanel = baidu.lang.createClass(function(options){
    var me = this;
    me._active = false;
    me._options = baidu.extend({
        autoUpdateDelay: 500,     // 动态内容自动更新延时
        arrowButtonStep: 20,
        mousewheelStep: 50,
        scrollbarStep: 80,
        intervalScrollDelay: 300,
        intervalScrollFreq: 100,
        scrollbarMinHeight: 10
    }, options);
    
    me.on('load', function(){
        var target = me._target = baidu(me.getElement('target')),
            opt = me._options;
        target.addClass('tang-scrollpanel');
        me.on('installpanel', me._installSlider);
        me.on('uninstallpanel', me._uninstallSlider);
        me._installPanel();
        me.update();
        if(opt.autoUpdateDelay){
            (function(){
                var fn = arguments.callee;
                me._updateTimer = setTimeout(function(){
                    me.update();
                    fn();
                }, opt.autoUpdateDelay);
            })();
        }
    });
},{
    type: "magic.control.ScrollPanel",
    superClass: magic.Base
}).extend({
    
    _installPanel: function(){
        var me = this,
            opt = me._options,
            wrapper = baidu('<div id="'+ me.$getId('wrapper') +'" class="tang-scrollpanel-wrapper"></div>')
            .css({
                width: me._target.width(),
                height: me._target.height()
            }),
            content = baidu('<div id="'+ me.$getId('content') +'" class="tang-scrollpanel-content"></div>');
        content.append(me._target.children());
        wrapper.append(content);
        me._target.append(wrapper);
        function mousewheel(e){
            if(!me._active) return;
            e.preventDefault();
            me.scrollBy(e.wheelDelta > 0 ? -opt.mousewheelStep : opt.mousewheelStep);
        }
        wrapper.on('mousewheel', mousewheel);
        me.on('dispose', function(){
            wrapper.off('mousewheel', mousewheel);
        });
        me.fire('installpanel');
    },
    
    _uninstallPanel: function(){
        var me = this;
        me._target.append(baidu(me.getElement('content')).children())
            .removeClass('tang-scrollpanel');
            // .css('overflow', 'auto');
        baidu(me.getElement('wrapper')).remove();
        me.fire('uninstallpanel');
    },
    
    _installSlider: function(){
        var me = this,
            wrapper = baidu(me.getElement('wrapper')),
            $slider = baidu('<div id="'+ me.$getId('slider') +'"></div>').css({
                height: me._target.height()
            }),
            slider;
        wrapper.append($slider);
        
        // instantiate slider
        me._slider = slider = new magic.Slider({
            orientation: 'vertical',
            currentValue: 0
        });
        slider.on('change', function(e){
            me.scrollTo(me._pctToPixel(e.value));
        });
        slider.render(me.$getId('slider'));
        me._hackSlider();
    },
    _hackSlider: function(){
        var me = this,
            opt = me._options,
            $slider = baidu(me.getElement('slider')),
            slider = me._slider,
            knob = baidu(slider.getElement('knob')),
            view = slider.getElement('view'),
            arrowTop = baidu('.tang-start', view),
            arrowBottom = baidu('.tang-last', view),
            view = baidu(view);
        
        me.$mappingDom('arrowTop', arrowTop.get(0));
        me.$mappingDom('arrowBottom', arrowBottom.get(0));
        $slider.append(arrowTop);
        $slider.append(arrowBottom);
        view.css({
            width: knob.outerWidth()
        });
        function mousedown(e, num){
            e.stopPropagation();
            e.preventDefault();
            me.scrollBy(num);
            
            var startTimer,
                intervalTimer,
            unselect = function(e){
                e.preventDefault();
            },
            releaseCapture = function(e){
                if (e.target.releaseCapture) {
                    e.target.releaseCapture();
                } else if (window.releaseEvents) {
                    window.releaseEvents(Event.MOUSEMOVE | Event.MOUSEUP);
                };
            },
            stop = function(){
                clearInterval(startTimer);
                clearInterval(intervalTimer);
                baidu(document).off('mouseup', stop);
                baidu(document).off('selectstart', unselect);
                releaseCapture(e);
            };
            
            startTimer = setTimeout(function(){
                intervalTimer = setInterval(function(){
                    // assert positive or negative 'num' is used to get the direction of scrolling.
                    if((num < 0 && e.pageY > knob.offset().top) || (num > 0 && e.pageY < knob.offset().top + knob.outerHeight())){
                        stop();
                        return;
                    }
                    me.scrollBy(num);
                }, opt.intervalScrollFreq);
            }, opt.intervalScrollDelay);
            
            baidu(document).on('mouseup', stop);
            baidu(document).on('selectstart', unselect);
            
            if (e.target.setCapture) {
                e.target.setCapture();
            } else if (window.captureEvents) {
                window.captureEvents(Event.MOUSEMOVE | Event.MOUSEUP);
            };
        }
        
        var onArrowMousedown = function(e){
            var n = e.target == arrowTop.get(0) ? -1 : 1;
            mousedown(e, n * opt.arrowButtonStep);
        };
        var onSliderMousedown = function(e){
            if(e.target == slider.getElement('knob')) return;
            if(e.pageY < knob.offset().top){
                mousedown(e, -opt.scrollbarStep);
            }else if(e.pageY > knob.offset().top + knob.outerHeight()){
                mousedown(e, opt.scrollbarStep);
            }
        };
        
        arrowTop.on('mousedown', onArrowMousedown);
        arrowBottom.on('mousedown', onArrowMousedown);
        $slider.on('mousedown', onSliderMousedown);
        me.on('dispose', function(){
            arrowTop.off('mousedown', onArrowMousedown);
            arrowBottom.off('mousedown', onArrowMousedown);
            $slider.off('mousedown', onSliderMousedown);
        });
       
        // for prevent setValue-like action on mousedown
        slider.on('beforeslideclick', function(e){
            e.returnValue = false;
        });
    },
    
    _uninstallSlider: function(){
        if(this._slider)
            this._slider.$dispose();
    },
    
    _resetSliderUnitsPos: function(){
        var me = this,
            opt = me._options,
            view = baidu(me._slider.getElement('view')),
            knob = baidu(me._slider.getElement('knob')),
            content = baidu(me.getElement('content')),
            $slider = me.getElement('slider'),
            arrowTop = baidu('.tang-start' ,$slider),
            arrowBottom = baidu('.tang-last' ,$slider),
            arrowTopHeight = arrowTop.css('display') == 'none' ? 0 : arrowTop.outerHeight(),
            arrowBottomHeight = arrowBottom.css('display') == 'none' ? 0 : arrowBottom.outerHeight(),
            $slider = baidu($slider),
            newKnobHeight = Math.round((me._target.height() / content.outerHeight()) * ($slider.height() - arrowTopHeight - arrowBottomHeight));
        knob.css({
            height: newKnobHeight > opt.scrollbarMinHeight ? newKnobHeight : opt.scrollbarMinHeight
        });
        view.css({
            top: arrowTopHeight,
            height: $slider.height() - arrowBottomHeight - arrowTopHeight - knob.outerHeight()
        });

        // ie6 fix
        if(baidu.browser.ie < 7){
            if($slider.height() % 2 != 0){
                arrowBottom.css({
                    bottom: -1
                });
            }
            if(view.height() % 2 != 0){
                view.css({
                    height: view.height() + 1
                });
                knob.css({
                    height: knob.height() - 1
                });
            }
        }
    },
    
    _pixelToPct: function(pixel){
        return pixel / (baidu(this.getElement('content')).height() - baidu(this.getElement('wrapper')).height());
    },
    
    _pctToPixel: function(pct){
        return (baidu(this.getElement('content')).height() - baidu(this.getElement('wrapper')).height()) * pct;
    },
    _setActive: function(){
        var me = this,
            $slider = baidu(me.getElement('slider')),
            sliderView = baidu(me._slider.getElement('view')),
            content = baidu(me.getElement('content')),
            wrapper = baidu(me.getElement('wrapper'));
        $slider.show();
        $slider.css({
            width: sliderView.width()
        });
        content.css({
            width: wrapper.width() - $slider.width()
        });
        me._resetSliderUnitsPos();
        me._active = true;
        me._oldContentHeight = content.outerHeight();
    },
    _setInactive: function(){
        var me = this,
            $slider = baidu(me.getElement('slider')),
            content = baidu(me.getElement('content'));
        content.css({
            width: content.width() + $slider.width()
        });
        $slider.hide();
        me._active = false;
    },
    
    update: function(){
        var me = this;
        if(me._isScrollable(me._target).y){
            if(!me._active){
                me._setActive();
            }else{
                if(me._oldContentHeight != baidu(me.getElement('content')).outerHeight()){
                    me._resetSliderUnitsPos();
                    me._oldContentHeight = baidu(me.getElement('content')).outerHeight();
                    me._scrollTo(me.getScroll());
                }
            }
        }else{
            if(me._active){
                me._setInactive();
                me.scrollTo(0);
            }
        }
    },
    
    clearAutoUpdate: function(){
        if(!this._updateTimer) return;
        clearTimeout(this._updateTimer);
        delete this._updateTimer;
    },
    
    _isScrollable: function(){
        var me = this,
            target = me._target,
            targetWidth = target.innerWidth(),
            targetHeight = target.innerHeight(),
        x = baidu(me.getElement('content')).innerWidth() > targetWidth,
        y = baidu(me.getElement('content')).innerHeight() > targetHeight;
        return {
            x: x,
            y: y
        }
    },
    
    scrollTo: function(pos){
        var me = this,
            oldPos = pos,
            wrapper = baidu(me.getElement('wrapper')),
            content = baidu(me.getElement('content')),
            wrapperHeight = wrapper.height(),
            contentHeight = content.outerHeight();
        if(pos > contentHeight - wrapperHeight)
            pos = contentHeight - wrapperHeight;
        if(pos < 0)
            pos = 0;
        if(me.getScroll() == pos) return;
                
        
        me.fire('beforescroll', {
            pos: pos
        });
        me._scrollTo(pos);
        
        me.fire('afterscroll', {
            pos: pos
        });
    },
    
    _scrollTo: function(pos){
        var me = this,
            slider = me._slider;
        baidu(me.getElement('content')).css({
            top: -pos
        });
        slider.un('change');
        slider.setValue(me._pixelToPct(pos));
        slider.on('change', function(e){
            me.scrollTo(me._pctToPixel(e.value));
        });
    },
    
    scrollToTop: function(){
        this.scrollTo(0);
        return this;
    },
    
    scrollToBottom: function(){
        this.scrollTo(baidu(this.getElement('content')).height());
        return this;
    },
    
    scrollToElement: function(ele){
        var pos = baidu(ele).offset().top - baidu(this.getElement('content')).offset().top;
        this.scrollTo(pos);
        return this;
    },
    
    scrollBy: function(num){
        this.scrollTo(this.getScroll() + num);
        return this;
    },
    
    getScroll: function(){
        // FIXME can't get exactly value in Chrome 24, fix this if it is okay in future version
        // return -Math.round(baidu(this.getElement('content')).position().top);
        return -Math.round(parseFloat(baidu(this.getElement('content')).css('top')));
    },
    
    getScrollPct: function(){
        var scrollableHeight = baidu(this.getElement('content')).outerHeight() - baidu(this.getElement('wrapper')).height();
        return Math.round(this.getScroll() / scrollableHeight * 100) / 100;
    },
    
    $dispose: function(){
        var me = this;
        if(me.disposed) return;
        me.clearAutoUpdate();
        me._uninstallPanel();
        magic.Base.prototype.$dispose.call(me);
    }
});



 

magic.setup.scrollPanel = function(el, options){

 

    if(baidu.type(el) === "string"){
        el = '#' + el;
    }
    var el = baidu(el)[0],
    instance = magic.setup(el, magic.control.ScrollPanel, options);
    instance.$mappingDom('target', el);
    instance.fire('load');
    return instance;
};