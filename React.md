## 同步模式

### 调度

1. workloop -> 创建替死鬼 workInProgress， 然后beginwork(current, workInProgress)
2. 如果是class组件执行render, 调度阶段如果有componentDidMount/componentDidUpdate, flags 加上update, 函数组件的钩子useEffect等副作用的钩子执行的时候也会在这个fiber的flags加上update | passive, 如果是context, context value 入栈， 然后调度子元素，第一次创建就直接创建子元素fiber，设置副作用为placement，不是第一次有旧的fiber，就去对比复用或新建。
3. completeUnitOfWork, 深度优先的情况下， 每次遍历到底， 比如到text了，创建textnode，如果有siblings,则beginWork(siblings), 没有siblings从继续从returnFiber complete, 如果是第一个的render，没有dom实例对于div创建dom, 然后appendChild，设置属性，但是不会把最顶层的元素append到root里面（commit阶段），如果不是第一个render, 已经存在dom实例，dom的创建更新放到commit阶段， 如果是组件有需要commit阶段执行的副作用就是之前beginwork的时候会打flag, 设置returnFiber的firstEffect和lastEffct， 值是这个组件的fiber, 这个是链表, 最后commin 阶段取出来有副作用的fiber commit

#### reconcileChildrenArray (diff list)

开始循环对比，相同key的可以复用旧的fiber, 当然还要看type是否相同，直到找到第一个不相同key的fiber, 此时如果旧的fiber完了，剩下新的子元素全部创建新fiber, 如果子元素完了，还有旧的fiber,就都删掉。不然 将剩余的旧的fiber列表 用key作为键创建map, 继续遍历新的子元素，如果可以从map中找到就复用，没有就新建。这个阶段的操作都是打tag, 不会实际操作dom



### Commit 阶段

1. commitBeforeMutationEffects
   其实就是调用生命周期钩子getSnapshotBeforeUpdate
2. commitMutationEffects
   这个阶段主要是更新DOM
3. commitLayoutEffects
   主要是调用生命周期componentDidMount/componentDidUpdate, 赋值ref

#### Context

栈和游标， push 游标当前值入栈，游标的值变成push的value， contextProvider 的props value 会设置context._currentValue, pop 将游标当前值设置为栈的位置的值，栈的位置的值null, index--



#### 事件系统

react 是使用事件委托，onClick等方法是没有绑定到实际的dom上面，v17开始会在root元素上监听，之前的版本是监听在document上，事件都委托到root上面，执行的时候，从触发事件的dom元素所绑定的fiber开始往return Fiber找所有prop上有这个事件的fiber, 然后按顺序执行这些prop绑定的函数。所以react里面事件的冒泡不一定是按照dom层级绑定事件冒泡的，而是fiber的层级，就是jsx写的层级，这样portial的元素也能冒泡了。



#### hooks 顺序问题

在当前函数组件fiber的memoizedState记录了第一个hook的情况，接下的hook通过next链表结构处理，所以不能有if hook的情况，记忆的值顺序会乱



#### React 需要提示key的情况

下面第二种不会提示缺失key, 在创建element时，element._store.validated 字段标识是否已经验证过key,

创建完之后会从第二个参数开始遍历检查，如果不是数组直接设置element._store.validated= true, 这样之后也就不会提示缺少key

```jsx
<div>{['1'].map(v => <span>{v}</span>)}</div>
// React.createElement('div', null, ['1'].map(...))

<div><span>2</span><span>2</span></div>
// React.createElement('div', null, span, span) 

```





