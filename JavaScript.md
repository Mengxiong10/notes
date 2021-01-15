### Proxy



### Promise

```js
const asyncFn = (fn) => {
  return () => {
    setTimeout(() => {
      fn();
    }, 0);
  };
};

function resolvePromise(promise, x, resolve, reject) {
  if (promise === x) {
    throw new TypeError("circle promise");
  }
  if (x instanceof Promise) {
    x.then(resolve, reject);
    return;
  }
  if ((x !== null && typeof x === "object") || typeof x === "function") {
    let called = false;
    try {
      let then = x.then;
      if (typeof then === "function") {
        then.call(
          x,
          (y) => {
            if (!called) {
              called = true;
              resolvePromise(promise, y, resolve, reject);
            }
          },
          (err) => {
            if (!called) {
              called = true;
              reject(err);
            }
          }
        );
      } else {
        resolve(x);
      }
    } catch (error) {
      if (!called) {
        reject(error);
      }
    }
  } else {
    resolve(x);
  }
}

class Promise {
  constructor(executor) {
    this.state = "pending";
    this.value = undefined;
    this.error = undefined;

    this.filfilledCallbacks = [];
    this.rejectedCallbacks = [];

    const resolve = (value) => {
      if (this.state === "pending") {
        this.state = "resolved";
        this.value = value;
        this.filfilledCallbacks.forEach((fn) => fn());
      }
    };
    const reject = (err) => {
      if (this.state === "pending") {
        this.state = "rejected";
        this.error = err;
        this.rejectedCallbacks.forEach((fn) => fn());
      }
    };

    try {
      executor(resolve, reject);
    } catch (error) {
      reject(error);
    }
  }

  then(onFulfilled, onRejected) {
    onFulfilled = typeof onFulfilled === "function" ? onFulfilled : (x) => x;
    onRejected =
      typeof onRejected === "function"
        ? onRejected
        : (err) => {
            throw err;
          };
    const Promise = this.constructor;
    let p = new Promise((res, rej) => {
      const resolvedCallback = asyncFn(() => {
        try {
          const x = onFulfilled(this.value);
          resolvePromise(p, x, res, rej);
        } catch (error) {
          rej(error);
        }
      });
      const rejectedCallback = asyncFn(() => {
        try {
          const x = onRejected(this.value);
          resolvePromise(p, x, res, rej);
        } catch (error) {
          rej(error);
        }
      });
      if (this.state === "resolved") {
        resolvedCallback();
      } else if (this.state === "rejected") {
        rejectedCallback();
      } else {
        this.filfilledCallbacks.push(resolvedCallback);
        this.rejectedCallbacks.push(rejectedCallback);
      }
    });

    return p;
  }
}
```

### Iterator 和 for...of

for...of 循环就是为了统一所有数据结构的遍历方法. Iterator接口就是为此设计.

对象上只要部署了Iterator接口就可以用for...of 遍历.

Iterator 接口部署在对象的[Symbol.iterator]属性上, [Symbol.iterator]是一个函数返回一个遍历器对象, 这个对象上必须有next函数(怎么遍历的关键), 可选return(处理return), throw(处理throw情况)函数

```js
const obj = {
  [Symbol.iterator] : function () {
    return {
      next: function () {
        return {
          value: 1, // 遍历的值
          done: true // 是否结束
        };
      }
    };
  }
};

```

原生具备 Iterator 接口的数据结构如下。

- Array
- Map
- Set
- String
- TypedArray
- 函数的 arguments 对象
- NodeList 对象



### Generator

Generator 也是普通函数, 但是它返回的是一个遍历器对象, 调用next执行. 第一次next可以理解为启动参数无效, 之后的next可以带参数, 表示上一次yield表达式的值, 不然就是undefined.

```js
function* foo(x) {
  var y = 2 * (yield (x + 1));
  var z = yield (y / 3);
  return (x + y + z);
}

var b = foo(5);
b.next() // { value:6, done:false }
b.next(12) // { value:8, done:false } // 设置yield (x + 1) 的返回值是12
b.next(13) // { value:42, done:true }

```

因为Generator返回的值是遍历器对象, 可以直接赋值给[Symbol.iterator], 使对象可遍历, 同时这个对象本身也具有[Symbol.iterator]属性,执行后返回自身, 所以它自身也可以被遍历

```js
function* gen(){
    yield 1;
    yield 2;
    yield 3;
}

const a = {
    [Symbol.iterator]: gen
};

console.log([...a]) // [1, 2, 3]

var g = gen();

g[Symbol.iterator]() === g;

console.log([...g]); // [1, 2, 3]



```

### Async



### Module

#### CommonJS 循环加载

CommonJS 是 加载时执行, 第一次require文件, 文件代码就执行, 返回对象, 之后的require 就不会再执行代码, 直接从缓存中取出上次执行的结果, 如果出现某个模板被循环加载, 就输出已经执行的部分.

```js
// a.js
exports.done = false;
var b = require('./b.js');
console.log('在 a.js 之中，b.done = %j', b.done);
exports.done = true;
console.log('a.js 执行完毕');

// b.js
exports.done = false;
var a = require('./a.js'); // 发现循环加载,输出当前a export的值false, 继续往下执行, 完后再把控制权给a
console.log('在 b.js 之中，a.done = %j', a.done);
exports.done = true;
console.log('b.js 执行完毕');

// main.js
var a = require('./a.js');
var b = require('./b.js');
console.log('在 main.js 之中, a.done=%j, b.done=%j', a.done, b.done);


$ node main.js

在 b.js 之中，a.done = false
b.js 执行完毕
在 a.js 之中，b.done = true
a.js 执行完毕
在 main.js 之中, a.done=true, b.done=true

```

#### ES6模板循环加载

ES6 模板import模板加载, 是指向被加载模板的引用, 而不是直接取值, 需要开发者自己保证取值, 等到使用的时候才去取模板引用的值.



