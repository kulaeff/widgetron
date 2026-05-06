export type RequiredProperty<T, K extends keyof T> = T & {
  [Property in K]-?: NonNullable<T[Property]>;
};

export type Wrap<T> = {
  [K in keyof T as `$${Extract<K, string>}`]: T[K];
};

export type Unwrap<T> = {
  [K in keyof T as K extends `$${infer Q}` ? Q : K]: T[K];
};
