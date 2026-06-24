import { describe, expect, it } from "vitest";
import { AutoRegistry, RegistryModificationError } from "./autoRegistry";

describe("AutoRegistry", () => {
    it("registers objects and returns a unique key", () => {
        const registry = new AutoRegistry<string>();

        const firstKey = registry.register("first");
        const secondKey = registry.register("second");

        expect(firstKey).toBe(0);
        expect(secondKey).toBe(1);
        expect(firstKey).not.toBe(secondKey);
    });

    it("retrieves registered objects by key", () => {
        const registry = new AutoRegistry<{ name: string }>();
        const obj = { name: "hello" };
        const key = registry.register(obj);

        expect(registry.get(key)).toBe(obj);
    });

    it("finds the key for a registered object", () => {
        const registry = new AutoRegistry<{ name: string }>();
        const obj1 = { name: "alpha" };
        const obj2 = { name: "beta" };

        const key1 = registry.register(obj1);
        registry.register(obj2);

        expect(registry.findKey(obj1)).toBe(key1);
        expect(registry.findKey(obj2)).toBe(1);
    });

    it("returns null for findKey when the object is not registered", () => {
        const registry = new AutoRegistry<{ name: string }>();
        const obj = { name: "missing" };

        expect(registry.findKey(obj)).toBeNull();
    });

    it("returns null for missing registry keys", () => {
        const registry = new AutoRegistry<number>();

        expect(registry.get(0)).toBeNull();
        expect(registry.get(42)).toBeNull();
    });

    it("unregisters by key and prevents future retrieval", () => {
        const registry = new AutoRegistry<string>();
        const key = registry.register("value");

        expect(registry.unregister(key)).toBe(true);
        expect(registry.get(key)).toBeNull();
    });

    it("unregisters by object instance and prevents future retrieval", () => {
        const registry = new AutoRegistry<{ value: number }>();
        const obj = { value: 1 };
        const key = registry.register(obj);

        expect(registry.unregister(obj)).toBe(true);
        expect(registry.get(key)).toBeNull();
    });

    it("returns false when unregistering a missing key", () => {
        const registry = new AutoRegistry<string>();

        expect(registry.unregister(999)).toBe(false);
    });

    it("returns false when unregistering a missing object", () => {
        const registry = new AutoRegistry<string>();
        const notRegistered = "missing";

        expect(registry.unregister(notRegistered)).toBe(false);
    });

    it("locks and unlocks the registry state", () => {
        const registry = new AutoRegistry<number>();
        expect(registry.isLocked()).toBe(false);

        registry.lock();
        expect(registry.isLocked()).toBe(true);

        registry.unlock();
        expect(registry.isLocked()).toBe(false);
    });

    it("prevents registering when locked", () => {
        const registry = new AutoRegistry<string>();
        registry.lock();

        expect(() => registry.register("blocked")).toThrow(RegistryModificationError);
        expect(registry.isLocked()).toBe(true);
    });

    it("prevents unregistering when locked", () => {
        const registry = new AutoRegistry<string>();
        const key = registry.register("value");
        registry.lock();

        expect(() => registry.unregister(key)).toThrow(RegistryModificationError);
        expect(() => registry.unregister("value")).toThrow(RegistryModificationError);
    });

    it("allows modifications again after unlock", () => {
        const registry = new AutoRegistry<string>();
        registry.lock();
        registry.unlock();

        const key = registry.register("after unlock");
        expect(registry.get(key)).toBe("after unlock");
        expect(registry.unregister(key)).toBe(true);
    });

    it("iterates entries, keys, and values excluding removed entries", () => {
        const registry = new AutoRegistry<string>();
        const firstKey = registry.register("first");
        registry.register("second");
        registry.unregister(firstKey);

        expect(Array.from(registry.entries())).toEqual([[0, "second"]]);
        expect(Array.from(registry.keys())).toEqual([0]);
        expect(Array.from(registry.values())).toEqual(["second"]);
    });

    it("preserves key generation after removals", () => {
        const registry = new AutoRegistry<string>();
        const key1 = registry.register("a");
        registry.unregister(key1);

        const key2 = registry.register("b");
        expect(key2).toBe(1);
    });
});
