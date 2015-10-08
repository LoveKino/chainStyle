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
 * otherMap
 *         name
 *             method
 *             checkType
 * opts
 *     init
 *     chainRegular
 *     typeMap
 */

import TypeChecker from "typevalidator";
import QueueInfo from "./QueueInfo";

var chainStyle = (chainMap = {}, otherMap = {}, opts = {}) => {
    let InnerClz = function() {
        this.__callingQueue__ = [];
        if (typeof opts.init === "function") {
            opts.init.apply(this);
        }
    }

    let typeChecker = TypeChecker(opts.typeMap);

    loadChainMap(InnerClz, chainMap);

    defineEnd(InnerClz, chainMap, opts, typeChecker);

    loadOtherMap(InnerClz, otherMap, typeChecker);

    return InnerClz;
}

var loadChainMap = (InnerClz, chainMap) => {
    for (let name in chainMap) {
        if (name === "end") {
            throw new Error("end is special name for chain style, please change name.");
        }
        chainMethod(InnerClz, name);
    }
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
        let queueInfo = new QueueInfo(this.__callingQueue__);
        if (this.__callingEnd__ === true) {
            return cb && cb.call(this, queueInfo);
        }
        // check calling order
        checkCallingQueue(opts.chainRegular, this.__callingQueue__);
        // run all call now.
        callQuene(this.__callingQueue__, chainMap, this, typeChecker);
        this.__callingEnd__ == true;
        return cb && cb.call(this, queueInfo);
    }
}

var checkCallingQueue = (chainRegular, __callingQueue__) => {
    if (chainRegular instanceof RegExp) {
        // check with regular
        let callingline = joinCallingLine(__callingQueue__);
        if (!chainRegular.test(callingline)) {
            let excepStr = "calling line " + callingline +
                " is not match for regular " + chainRegular.toString();
            throw new WrongCallinglineException(excepStr);
        }
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
    let validate = typeChecker.validate;
    if (validate("function", methodObject)) {
        var method = methodObject;
    } else if (validate("valueObj", methodObject)) {
        var method = methodObject.method;
        var checkType = methodObject.checkType;
    }
    // check first
    checkParams(args, checkType, typeChecker);
    //
    if (validate("function", method)) {
        return method.apply(context, args);
    }
}

var checkParams = (args, checkType, typeChecker) => {
    let validate = typeChecker.validate;
    if (validate("array", checkType)) {
        for (let i = 0; i < checkType.length; i++) {
            let item = checkType[i];
            if (validate("string", item)) {
                typeChecker.check(item, args[i]);
            } else if (validate("function", item)) {
                if (!item(args[i])) {
                    throw new Error("method type checking fail. check type is '" + item + "'");
                }
            }
        }
    } else if (validate("function", checkType)) {
        if (!checkType.apply(undefined, args)) {
            throw new Error("method type checking fail. check type is '" + checkType.toString() + "'");
        }
    }
}

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

var chainMethod = (clz, name) => {
    clz.prototype[name] = function(...y) {
        if (this.__callingEnd__ === true) {
            this.__callingEnd__ = false;
            this.__callingQueue__ = [];
        }
        this.__callingQueue__.push({
            name: name,
            args: y
        });
        return this;
    }
}

export default chainStyle;