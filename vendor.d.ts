/** Type declarations for JavaScript dependencies that do not ship their own. */

declare module "lodash-es/shuffle" {
  export default function shuffle<T>(collection: ArrayLike<T>): T[];
}

declare module "lodash-es/debounce" {
  interface DebouncedFunction<T extends (...args: any[]) => any> {
    (...args: Parameters<T>): ReturnType<T> | undefined;
    cancel(): void;
    flush(): ReturnType<T> | undefined;
  }

  export default function debounce<T extends (...args: any[]) => any>(
    func: T,
    wait?: number
  ): DebouncedFunction<T>;
}
