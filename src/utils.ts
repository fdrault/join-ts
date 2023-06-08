export function mergeMaps<K, V>(target: Map<K, V>, ...iterables: Map<K, V>[]) {
  for (const iterable of iterables) {
    for (const item of iterable) {
      target.set(...item);
    }
  }
}
