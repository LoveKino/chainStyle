import chainStyle from "../index";
import assert from "assert";


describe("chainStyle", () => {
    it("base0", () => {
        let clz = chainStyle({
            a: null,
            b: null
        });

        let inst = new clz();
        inst.a("123").b("456");

        inst.end();
    });
    it("base1", () => {
        let clz = chainStyle({
            a: function(){},
            b: function(){}
        });

        let inst = new clz();
        inst.a("123").b("456");

        inst.end();
    });
    it("base2", () => {
        let clz = chainStyle({
            a: {
                checkType: ["string"]
            },
            b: {
                checkType: ["string"]
            }
        });

        let inst = new clz();
        inst.a("123").b("456");

        inst.end();
    });

    it("checkType", (done) => {
        let clz = chainStyle({
            a: {
                checkType: ["string & truthy"]
            },
            b: {
                checkType: ["string"]
            }
        });

        let inst = new clz();
        inst.a("dss").b("456");
        inst.end();

        try {
            let inst2 = new clz();
            inst2.a().b("456");
            inst2.end();
        } catch (err) {
            done();
        }
    });

    it("chainRegular", (done) => {
        let clz = chainStyle({
            a: {
                checkType: ["string"]
            },
            b: {
                checkType: ["string"]
            }
        }, {}, {
            chainRegular: /^a\.b$/
        });

        var inst1 = new clz();
        inst1.a("123").b("456");
        inst1.end();
        try {
            var inst2 = new clz();
            inst2.a("123").a("what").b("456");
            inst2.end();
        } catch (err) {
            done();
        }
    });

    it("otherMap", () => {
        let clz = chainStyle({
            a: {
                checkType: ["string"]
            },
            b: {
                checkType: ["string"]
            }
        }, {
            double: {
                method: v => 2 * v
            }
        });
        let inst = new clz();
        assert.equal(inst.double(10), 20);
    });

    it("init", () => {
        let clz = chainStyle({
            a: {
                checkType: ["string"]
            },
            b: {
                checkType: ["string"]
            }
        }, {}, {
            init: function() {
                this.p = 20;
            }
        });
        let inst = new clz();
        assert.equal(inst.p, 20);
    });
});