"use strict";

Object.defineProperty(exports, "__esModule", {
    value: true
});
var QueueInfo = function QueueInfo(queue) {
    this.queue = queue;
};
QueueInfo.prototype = {
    constructor: QueueInfo,
    getMap: function getMap() {
        var map = {};
        for (var i = 0; i < this.queue.length; i++) {
            var item = this.queue[i];
            var _name = item.name;
            map[_name] = item;
        }
        return map;
    },
    getArrMap: function getArrMap() {
        var map = {};
        for (var i = 0; i < this.queue.length; i++) {
            var item = this.queue[i];
            var _name2 = item.name;
            if (!map[_name2]) map[_name2] = [];
            map[_name2].push(item);
        }
        return map;
    }
};

exports["default"] = QueueInfo;
module.exports = exports["default"];