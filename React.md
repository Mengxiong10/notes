## 同步模式

### 创建阶段

1. 创建FiberRoot -> updateQueue (element: <App />)
2. workloop -> 创建替死鬼 workInProgress， 然后beginwork(current, workInProgress)
3. 如果是组件执行render, 调度阶段如果有componentDidMount, flags 加上update, 函数组件的钩子useEffect等副作用的钩子执行的时候也会在这个fiber的flags加上update | passive, 如果是context, context value 入栈， 然后调度子元素，创建子元素fiber，设置副作用为placement
4. completeUnitOfWork, 深度优先的情况下， 每次遍历到底， 比如到text了，创建textnode，如果有siblings,则beginWork(siblings), 没有siblings从继续从returnFiber complete, 对于div创建dom, 然后appendChild，设置属性， 如果是组件有副作用（componentdidMount）, 设置returnFiber的firstEffect和lastEffct， 值是这个组件的fiber, 这个是链表



#### Context

栈和游标， push 游标当前值入栈，游标的值变成push的value， contextProvider 的props value 会设置context._currentValue, pop 将游标当前值设置为栈的位置的值，栈的位置的值null, index--



#### React 需要提示key的情况

下面第二种不会提示缺失key, 在创建element时，element._store.validated 字段标识是否已经验证过key,

创建完之后会从第二个参数开始遍历检查，如果不是数组直接设置element._store.validated= true, 这样之后也就不会提示缺少key

```jsx
<div>{['1'].map(v => <span>{v}</span>)}</div>
// React.createElement('div', null, ['1'].map(...))

<div><span>2</span><span>2</span></div>
// React.createElement('div', null, span, span) 

```





