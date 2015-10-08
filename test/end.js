import chainStyle from "../index";
import assert from "assert";


describe("end", () => {
    it("getMap", (done) => {
        let clz = chainStyle({
            a: null,
            b: null
        });

        let inst = new clz();
        inst.a(null, 44).a("123", 12).b("456");

        inst.end((queueInfo) => {
            let map = queueInfo.getMap();
            assert.equal(map["a"].args[0], "123");
            assert.equal(map["a"].args[1], 12);
            assert.equal(map["b"].args[0], "456");
            done();
        });
    });

    it("getArrMap", (done) => {
        let clz = chainStyle({
            a: null,
            b: null
        });

        let inst = new clz();
        inst.a("123").b("456").a("789");

        inst.end((queueInfo) => {
            let map = queueInfo.getArrMap();
            assert.equal(map["a"][0].args[0], "123");
            assert.equal(map["a"][1].args[0], "789");
            assert.equal(map["b"][0].args[0], "456");
            done();
        });
    });
});