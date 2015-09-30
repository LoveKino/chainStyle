import chainStyle from "../index";
import assert from "assert";


describe("chainStyle", () => {
    it("base", () => {
        let clz = chainStyle({
            a: {
                checkType: ["string"]
            },
            b: {
                checkType: ["string"]
            }
        }, {}, {});

        let inst = new clz();
        inst.a("123").b("456");

        inst.end();
    });
});