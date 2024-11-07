export type Tail<T extends unknown[]> = T extends [infer _, ...infer Tail] ? Tail : never;
