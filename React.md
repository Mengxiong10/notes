## 同步模式

### 调度阶段

1. workloop -> 创建替死鬼 workInProgress， 然后 beginwork(current, workInProgress)
2. 如果是 class 组件执行 render, 调度阶段如果有 componentDidMount/componentDidUpdate, flags 加上 update, 函数组件的钩子 useEffect 等副作用的钩子执行的时候也会在这个 fiber 的 flags 加上 update | passive, 如果是 context, context value 入栈， 然后调度子元素，第一次创建就直接创建子元素 fiber，设置副作用为 placement，不是第一次有旧的 fiber，就去对比复用或新建。
3. completeUnitOfWork, 深度优先的情况下， 每次遍历到底， 比如到 text 了，创建 textnode，如果有 siblings,则 beginWork(siblings), 没有 siblings 从继续从 returnFiber complete, 如果是第一个的 render，没有 dom 实例对于 div 创建 dom, 然后 appendChild，设置属性，但是不会把最顶层的元素 append 到 root 里面（commit 阶段），如果不是第一个 render, 已经存在 dom 实例，dom 的创建更新放到 commit 阶段， 如果是组件有需要 commit 阶段执行的副作用就是之前 beginwork 的时候会打 flag, 设置 returnFiber 的 firstEffect 和 lastEffct， 值是这个组件的 fiber, 这个是链表, 最后 commin 阶段取出来有副作用的 fiber commit

#### reconcileChildrenArray (diff list)

开始循环对比，相同 key 的可以复用旧的 fiber, 当然还要看 type 是否相同，直到找到第一个不相同 key 的 fiber, 此时如果旧的 fiber 完了，剩下新的子元素全部创建新 fiber, 如果子元素完了，还有旧的 fiber,就都删掉。不然 将剩余的旧的 fiber 列表 用 key 作为键创建 map, 继续遍历新的子元素，如果可以从 map 中找到就复用，没有就新建。这个阶段的操作都是打 tag, 不会实际操作 dom

### Commit 阶段

1. commitBeforeMutationEffects
   其实就是调用生命周期钩子 getSnapshotBeforeUpdate
2. commitMutationEffects
   这个阶段主要是更新 DOM
3. commitLayoutEffects
   主要是调用生命周期 componentDidMount/componentDidUpdate.
    赋值 ref. 
   将useEffect的回调和清除函数分别加入到对应的队列, 将flushPassiveEffects加入到任务列表. 在下个任务调度之后就执行flushPassiveEffects, 分别执行useEffect清除和回调的队列



### React Scheduler

任务调度

使用MessageChannel, 将任务放在paint之后执行, 简单思路就是任务队列使用二叉堆结构(按过期时间排序),循环取栈顶的任务,把所有过期的任务全部执行, 未过期的任务检查deadline (当前帧是否还有空余时间), 没有空余时间就放到下次onmessage执行

### Context

栈和游标， push 游标当前值入栈，游标的值变成 push 的 value， contextProvider 的 props value 会设置 context.\_currentValue, pop 将游标当前值设置为栈的位置的值，栈的位置的值 null, index--

### 事件系统

react 是使用事件委托，onClick 等方法是没有绑定到实际的 dom 上面，v17 开始会在 root 元素上监听，之前的版本是监听在 document 上，事件都委托到 root 上面，执行的时候，从触发事件的 dom 元素所绑定的 fiber 开始往 return Fiber 找所有 prop 上有这个事件的 fiber, 然后按顺序执行这些 prop 绑定的函数。所以 react 里面事件的冒泡不一定是按照 dom 层级绑定事件冒泡的，而是 fiber 的层级，就是 jsx 写的层级，这样 portial 的元素也能冒泡了。

### hooks 顺序问题

在当前函数组件 fiber 的 memoizedState 记录了第一个 hook 的情况，接下的 hook 通过 next 链表结构处理，所以不能有 if hook 的情况，链表的顺序会乱

### React 需要提示 key 的情况

下面第二种不会提示缺失 key, 在创建 element 时，element.\_store.validated 字段标识是否已经验证过 key,

创建完之后会从第二个参数开始遍历检查，如果不是数组直接设置 element.\_store.validated= true, 这样之后也就不会提示缺少 key

```jsx
<div>{['1'].map(v => <span>{v}</span>)}</div>
// React.createElement('div', null, ['1'].map(...))

<div><span>2</span><span>2</span></div>
// React.createElement('div', null, span, span)

```
