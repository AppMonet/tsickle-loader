// example typescript file

export function hello(name: string): string {
  return `Hello ${name}`;
}

export type PossibleReturn = number | string | null;

export function foo<R extends PossibleReturn>(bar: () => R): R | null {
  try {
    return bar();
  } catch (e) {
    return null;
  }
}
