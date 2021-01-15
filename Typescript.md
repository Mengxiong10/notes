## infer

```ts

type ParamType<T> = T extends (params: infer P) => any ? P : T;

type FunctionPropertyNames<T> = {
  [K in keyof T]: T[K] extends Function ? K : never;
}[keyof T];
type FunctionProperties<T> = Pick<T, FunctionPropertyNames<T>>;

```

