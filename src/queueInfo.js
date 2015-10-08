var QueueInfo = function(queue) {
    this.queue = queue;
}
QueueInfo.prototype = {
    constructor: QueueInfo,
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

export default QueueInfo;