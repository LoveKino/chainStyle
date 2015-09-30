/**
 * provide chain style interface
 *
 * @goal make chain style interface easily to construct
 *
 * a.in1().in2().in3().end()
 * 
 * - names sets for chain calling
 * - calling chain regular
 * - default store
 * - chain calling end 
 * - lazy style
 *
 * - record time 
 * - execute time
 *
 * chainMap
 *     name 
 *         method
 *         typeCheck
 *         
 * opts
 *     init
 *     chainRegular
 *     otherMap
 *         name
 *             method
 *             checkType
 *     typeMap
 */

import TypeChecker from "./typeChecker";

var chainStyle = (chainMap = {}, otherMap = {}, opts = {}) => {
    let InnerClz = function() {
        this.__callingQueue__ = [];
        if (typeof opts.init === "function") {
            opts.init.apply(this);
        }
    }

    for (let name in chainMap) {
        if (name === "end") {
            throw new Error("end is special name for chain style, please change name.");
        }
        chainMethod(InnerClz, name, chainMap[name].method);
    }

    let typeChecker = TypeChecker(opts.typeMap);

    defineEnd(InnerClz, chainMap, opts, typeChecker);

    loadOtherMap(InnerClz, otherMap, typeChecker);

    return InnerClz;
}

var loadOtherMap = (InnerClz, otherMap, typeChecker) => {
    for (let name in otherMap) {
        if (name === "end") {
            throw new Error("end is special name for chain style, please change name.");
        }
        InnerClz.prototype[name] = function(...y) {
            return runMethodObject(otherMap[name], this, y, typeChecker);
        }
    }
}

var defineEnd = (InnerClz, chainMap, opts, typeChecker) => {
    InnerClz.prototype.end = function(cb) {
        if (this.__callingEnd__ === true) {
            return cb && cb.call(this, new QueneInfo(this.__callingQueue__));
        }
        callQuene(this.__callingQueue__, chainMap, this, typeChecker);
        let chainRegular = opts.chainRegular;
        if (chainRegular instanceof RegExp) {
            // check with regular
            let callingline = joinCallingLine(this.__callingQueue__);
            if (!chainRegular.test(callingline)) {
                let excepStr = "calling line " + callingline +
                    " is not match for regular " + chainRegular.toString();
                throw new WrongCallinglineException(excepStr);
            }
        }
        this.__callingEnd__ == true;
        return cb && cb.call(this, new QueneInfo(this.__callingQueue__));
    }
}

var callQuene = (__callingQueue__, chainMap, context, typeChecker) => {
    for (let i = 0; i < __callingQueue__.length; i++) {
        let callingItem = __callingQueue__[i];
        let name = callingItem.name;
        let args = callingItem.args;
        runMethodObject(chainMap[name], context, args, typeChecker);
    }
}

var runMethodObject = (methodObject, context, args, typeChecker) => {
    let method = methodObject.method;
    let checkType = methodObject.checkType;
    // check first
    if (isArray(checkType)) {
        for (let i = 0; i < checkType.length; i++) {
            let item = checkType[i];
            if (typeof item === "string") {
                typeChecker.check(item, args[i]);
            } else if (typeof item === "function") {
                if (!item(args[i])) {
                    throw new Error("method type checking fail. check type is '" + item + "'");
                }
            }
        }
    } else if (typeof checkType === "function") {
        if (!checkType.apply(undefined, args)) {
            throw new Error("method type checking fail. check type is '" + checkType.toString() + "'");
        }
    }
    //
    if (typeof method === "function") {
        return method.apply(context, args);
    }
}
var isArray = v => v && typeof v === "object" && typeof v.length === "number";
var WrongCallinglineException = function(value) {
    this.value = value;
    this.toString = function() {
        return this.value;
    };
}

var joinCallingLine = (__callingQueue__) => {
    let res = [];
    for (let i = 0; i < __callingQueue__.length; i++) {
        res.push(__callingQueue__[i].name);
    }
    return res.join(".");
}

var chainMethod = (clz, name, method) => {
    clz.prototype[name] = function(...y) {
        this.__callingEnd__ = false;
        this.__callingQueue__.push({
            name: name,
            args: y
        });
        return this;
    }
}

var QueneInfo = function(queue) {
    this.queue = queue;
}
QueneInfo.prototype = {
    constructor: QueneInfo,
    getMap: function() {
        let map = {};
        for (let i = 0; i < this.queue.length; i++) {
            let item = this.queue[i];
            let name = item.name;
            map[name] = item;
        }
        return map;
    },
    getArrMap: function() {
        let map = {};
        for (let i = 0; i < this.queue.length; i++) {
            let item = this.queue[i];
            let name = item.name;
            if (!map[name]) map[name] = [];
            map[name].push(item);
        }
        return map;
    }
}

export default chainStyle;