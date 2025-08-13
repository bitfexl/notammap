export class MapCache<K, V extends object> {
    private readonly map: Map<K, WeakRef<V>>;

    constructor() {
        this.map = new Map();
    }

    store(key: K, value: V) {
        this.map.set(key, new WeakRef(value));
    }

    retrieve(key: K): V | null {
        const ref = this.map.get(key);
        if (!ref) {
            return null;
        }
        const value = ref.deref();
        if (!value) {
            this.map.delete(key);
            return null;
        }
        return value;
    }
}
