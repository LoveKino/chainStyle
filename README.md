## Chainstyle

This tool helps to build chain style interface.

Chain style interface is popular, we like this kind of interface than big json interface, it looks like:

```
m.getUp(time).wash(time).eat(time).out(time)
```

There are two main problems for chain style interface:

- calling order

In prev example, getUp, wash, eat and out have sequence relationship, we do not want user to call this chain like `m.out(time).getUp(time)`.

- lazy execution

We want to lazy our executation, we want to use those data at the last moment.

`chainstyle` can satisfy both.

## Install

`npm install chainstyle`

## example

```
var chainStyle = require("chainstyle");

let clz = chainStyle({
    getUp: null,
    wash: null
},{},{});

let inst = new clz();

inst.getUp("10:00", "bedroom").wash("10:30");

inst.end((queueInfo) => {
    let map = queueInfo.getMap();
    console.log(map["getUp"].args[0]); // 10:00
    console.log(map["getUp"].args[1]); // bedroom
    console.log(map["wash"].args[0]); // 10:30
});
```


## Initial API

`chainstyle( chainMap = { key:config }, otherMap = { key:config }, opts = {} )`

- chainMap
  
  Define chain style functions.

  Key is function name, value is a config for function, could be null or undefined.

  Function name defined in chainMap, can be used as chain function. Like the getup, wash, eat and out function.

```
// default config by using null
// chainMap
{
    a: null,
    b: null
}
// you can use function as the config
// chainMap
{
    a: function(){},
    b: function(){}
}

// you can use an object as the config
// chainMap
{
    a: {
        checkType: ["string & truthy"],
        method: function(){}
    },
    b: {
        checkType: ["string"]
    }
}
```

  If the config is a function it will run when `end` function (what is end, see next more) called.

  If the config is an object, contains two attributes at most, `checkType` and `method`. The meaning of `method` is that it will run when `end` function called.

  CheckType used to check input of function. It's a function or an array of string, each string is a logic expression and used to check correspond input param.

  ```
    let clz = chainStyle({
        a: {
            checkType: ["string & truthy", "string"]
        },
        b: {
            checkType: function(str){ return typeof str === "string"; }
        }
    });
    let inst = new clz();
    inst.a("ok", [123]).b("456").end(); 
    // will throw exception, because the second param [123] is not a "string".
  ```

About checkType string expression, see [typevalidator](https://github.com/LoveKino/typevalidator) and [logicer](https://github.com/LoveKino/logicer).

- otherMap

OtherMap used to define function which is not a chain style function but normal function.

```
let clz = chainStyle({
    // chainMap
}, {
    // otherMap
    double: {
        method: function(v){ return 2 * v; }
    }
});

let inst = new clz();
console.log(inst.double(10)); // 20
```

Like chainMap's config, otherMap's config can use function and object two types just like chainMap.

- opts.init

`function` default is undefined.

The init function will execute when constructor execute.

- opts.chainRegular

`RegExp` defaul is undefined.

Used to validate chain style calling queue.

```
let clz = chainStyle({
    getUp: null,
    wash: null,
    eat: null
}, {}, {
    chainRegular: /^getUp\.wash\.eat$/
});

var inst = new clz();
inst.wash("10:00").eat("11:00").getUp("12:00").end();
// will throw exception, because calling queue "wash.eat.getUp" 
// fails to regular expression /^getUp\.wash\.eat$/
```

By using chainRegular option we can design strict calling order easily.

- opts.typeMap

Used to create own types. See [typevalidator](https://github.com/LoveKino/typevalidator).

```
// define type isA and isB
{
    "isA": function(x){},
    "isB": function(x){}
}
// use for checkType
checkType: ["isA | object" , "isB & truthy"]
```

## end

By now, we know how to provide chain style interface to user, but how to get user's inputs in the calling queue.

The `end` function is a special function, used to indicate calling is end. And provide a callback to get all inputs through the calling chain.

- when the `end` called, all chain functions will run.
- `end` can be call multiple times, when you call `end` continuously, chain functions will run just once.

- the callback for `end` will have a param queueInfo, which provide functions `getMap` and `getArrMap`.

`getArrMap` will return all inputs event a chain function was called multiple times, `getMap` just return the latest inputs for every chain functions. If a chain function was called multiple times, `getMap` will only return latest one.

```
// getArrMap

let clz = chainStyle({
    a: null
});

let inst = new clz();
inst.a("123", null).a("789", 6);

inst.end(function(queueInfo) {
    let map = queueInfo.getArrMap();
    console.log(map["a"][0].args[0]); // 123
    console.log(map["a"][1].args[1]); // 6
    done();
});
```

```
// getMap

let clz = chainStyle({
    a: null
});

let inst = new clz();
inst.a(null, 44).a("123", 12);

inst.end(function(queueInfo){
    let map = queueInfo.getMap();
    console.log(map["a"].args[0]); // 123
    console.log(map["a"].args[1]); // 12
    done();
});
```


## License

MIT
