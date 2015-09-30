/**
 * type level
 *     level1: number, function, array, object, boolean, string, symbol, undefined
 *     level2: define basetype
 *     level3: compose type
 * 
 * f.isNumber(a)  f.isFunction(b)
 *
 * type function
 *     (...y) => boolean
 */
"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var _logicer = require("logicer");

var _logicer2 = _interopRequireDefault(_logicer);

var merge = function merge(obj1, obj2) {
    if (obj2) {
        for (var name in obj2) {
            obj1[name] = obj2[name];
        }
    }
    return obj1;
};

var generateBaseType = function generateBaseType() {
    var base = {};
    var arr = ["string", "object", "undefined", "boolean", "function", "number", "symbol"];

    var _loop = function (i) {
        var f = function f(v) {
            return typeof v === arr[i];
        };
        base[arr[i]] = f;
    };

    for (var i = 0; i < arr.length; i++) {
        _loop(i);
    }
    return base;
};

var defaultTypeLogic = merge({
    "null": function _null(v) {
        return v === null;
    },
    "array": function array(v) {
        return v && typeof v === "object" && typeof v.length === "number";
    },
    "valueObj": function valueObj(v) {
        return v && typeof v === "object";
    },
    "pureObj": function pureObj(v) {
        return v && typeof v === "object" && typeof v.length !== "number";
    },
    "falsy": function falsy(v) {
        return !v;
    },
    "truthy": function truthy(v) {
        return v;
    },
    "regExp": function regExp(v) {
        return v instanceof RegExp;
    },
    "any": function any(v) {
        return true;
    }
}, generateBaseType());

exports["default"] = function () {
    var typeMap = arguments.length <= 0 || arguments[0] === undefined ? {} : arguments[0];

    if (!typeMap || typeof typeMap !== "object") throw new TypeError("expect object for typeMap");
    var logic = (0, _logicer2["default"])(merge(defaultTypeLogic, typeMap));

    return {
        translate: logic.translate,
        validate: function validate(str, value) {
            return logic.translate(str)(value);
        },
        check: function check(str, value) {
            var res = logic.translate(str)(value);
            if (!res) throw new Error("type checking fail. check type is '" + str + "'");
        },
        checkBatch: function checkBatch(strs, values) {
            for (var i = 0; i < strs.length; i++) {
                var str = strs[i];
                var value = values[i];
                var res = logic.translate(str)(value);
                if (!res) throw new Error("type checking fail. check type is '" + str + "'");
            }
        },
        validateBatch: function validateBatch(strs, values) {
            for (var i = 0; i < strs.length; i++) {
                var str = strs[i];
                var value = values[i];
                var res = logic.translate(str)(value);
                if (!res) return false;
            }
            return true;
        }
    };
};

module.exports = exports["default"];