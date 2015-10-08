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

"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _typevalidator = require("typevalidator");

var _typevalidator2 = _interopRequireDefault(_typevalidator);

var _QueueInfo = require("./QueueInfo");

var _QueueInfo2 = _interopRequireDefault(_QueueInfo);

var chainStyle = function chainStyle() {
    var chainMap = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];
    var otherMap = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
    var opts = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

    var InnerClz = function InnerClz() {
        this.__callingQueue__ = [];
        if (typeof opts.init === "function") {
            opts.init.apply(this);
        }
    };

    for (var _name in chainMap) {
        if (_name === "end") {
            throw new Error("end is special name for chain style, please change name.");
        }
        chainMethod(InnerClz, _name, chainMap[_name].method);
    }

    var typeChecker = (0, _typevalidator2["default"])(opts.typeMap);

    defineEnd(InnerClz, chainMap, opts, typeChecker);

    loadOtherMap(InnerClz, otherMap, typeChecker);

    return InnerClz;
};

var loadOtherMap = function loadOtherMap(InnerClz, otherMap, typeChecker) {
    var _loop = function (_name2) {
        if (_name2 === "end") {
            throw new Error("end is special name for chain style, please change name.");
        }
        InnerClz.prototype[_name2] = function () {
            for (var _len = arguments.length, y = Array(_len), _key = 0; _key < _len; _key++) {
                y[_key] = arguments[_key];
            }

            return runMethodObject(otherMap[_name2], this, y, typeChecker);
        };
    };

    for (var _name2 in otherMap) {
        _loop(_name2);
    }
};

var defineEnd = function defineEnd(InnerClz, chainMap, opts, typeChecker) {
    InnerClz.prototype.end = function (cb) {
        if (this.__callingEnd__ === true) {
            return cb && cb.call(this, new _QueueInfo2["default"](this.__callingQueue__));
        }
        callQuene(this.__callingQueue__, chainMap, this, typeChecker);
        var chainRegular = opts.chainRegular;
        if (chainRegular instanceof RegExp) {
            // check with regular
            var callingline = joinCallingLine(this.__callingQueue__);
            if (!chainRegular.test(callingline)) {
                var excepStr = "calling line " + callingline + " is not match for regular " + chainRegular.toString();
                throw new WrongCallinglineException(excepStr);
            }
        }
        this.__callingEnd__ == true;
        return cb && cb.call(this, new _QueueInfo2["default"](this.__callingQueue__));
    };
};

var callQuene = function callQuene(__callingQueue__, chainMap, context, typeChecker) {
    for (var i = 0; i < __callingQueue__.length; i++) {
        var callingItem = __callingQueue__[i];
        var _name3 = callingItem.name;
        var args = callingItem.args;
        runMethodObject(chainMap[_name3], context, args, typeChecker);
    }
};

var runMethodObject = function runMethodObject(methodObject, context, args, typeChecker) {
    var method = methodObject.method;
    var checkType = methodObject.checkType;
    // check first
    if (isArray(checkType)) {
        for (var i = 0; i < checkType.length; i++) {
            var item = checkType[i];
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
};
var isArray = function isArray(v) {
    return v && typeof v === "object" && typeof v.length === "number";
};
var WrongCallinglineException = function WrongCallinglineException(value) {
    this.value = value;
    this.toString = function () {
        return this.value;
    };
};

var joinCallingLine = function joinCallingLine(__callingQueue__) {
    var res = [];
    for (var i = 0; i < __callingQueue__.length; i++) {
        res.push(__callingQueue__[i].name);
    }
    return res.join(".");
};

var chainMethod = function chainMethod(clz, name, method) {
    clz.prototype[name] = function () {
        for (var _len2 = arguments.length, y = Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
            y[_key2] = arguments[_key2];
        }

        this.__callingEnd__ = false;
        this.__callingQueue__.push({
            name: name,
            args: y
        });
        return this;
    };
};

exports["default"] = chainStyle;
module.exports = exports["default"];