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
import logicer from "logicer";

var merge = (obj1, obj2) => {
    if (obj2) {
        for (var name in obj2) {
            obj1[name] = obj2[name];
        }
    }
    return obj1;
}

var generateBaseType = () => {
    let base = {};
    let arr = ["string", "object", "undefined", "boolean", "function", "number", "symbol"];
    for (let i = 0; i < arr.length; i++) {
        let f = v => typeof v === arr[i];
        base[arr[i]] = f;
    }
    return base;
}

var defaultTypeLogic = merge({
    "null": v => v === null,
    "array": v => v && typeof v === "object" && typeof v.length === "number",
    "valueObj": v => v && typeof v === "object",
    "pureObj": v => v && typeof v === "object" && typeof v.length !== "number",
    "falsy": v => !v,
    "truthy": v => v,
    "regExp": v => v instanceof RegExp,
    "any": v => true
}, generateBaseType());

export default (typeMap = {}) => {
    if (!typeMap || typeof typeMap !== "object")
        throw new TypeError("expect object for typeMap");
    let logic = logicer(merge(defaultTypeLogic, typeMap));

    return {
        translate: logic.translate,
        validate: (str, value) => logic.translate(str)(value),
        check: (str, value) => {
            let res = logic.translate(str)(value);
            if (!res)
                throw new Error("type checking fail. check type is '" + str + "'");
        },
        checkBatch: (strs, values) => {
            for (var i = 0; i < strs.length; i++) {
                let str = strs[i];
                let value = values[i];
                let res = logic.translate(str)(value);
                if (!res)
                    throw new Error("type checking fail. check type is '" + str + "'");

            }
        },
        validateBatch: (strs, values) => {
            for (var i = 0; i < strs.length; i++) {
                let str = strs[i];
                let value = values[i];
                let res = logic.translate(str)(value);
                if (!res) return false;
            }
            return true;
        }
    }
}