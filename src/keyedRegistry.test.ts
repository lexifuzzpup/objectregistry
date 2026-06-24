import { describe, expect, it } from "vitest";
import { KeyedRegistry } from "./keyedRegistry";
import { RegistryModificationError } from "./errors";

describe("KeyedRegistry", () => {
    it("registers objects and returns the provided key", () => {
        const registry = new KeyedRegistry<{ value: number }, string>();
        const obj = { value: 1 };

        const key = registry.register("item-1", obj);

        expect(key).toBe("item-1");
        expect(registry.get("item-1")).toBe(obj);
        expect(registry.findKey(obj)).toBe("item-1");
    });

    it("throws when registering with a duplicate key", () => {
        const registry = new KeyedRegistry<{ value: number }, string>();
        registry.register("item", { value: 1 });

        expect(() => registry.register("item", { value: 2 })).toThrow(RegistryModificationError);
    });

    it("throws when registering the same object under two different keys", () => {
        const registry = new KeyedRegistry<{ value: number }, string>();
        const obj = { value: 1 };
        registry.register("item-a", obj);

        expect(() => registry.register("item-b", obj)).toThrow(RegistryModificationError);
    });

    it("unregisters by key and makes the object unavailable", () => {
        const registry = new KeyedRegistry<{ value: number }, string>();
        const obj = { value: 1 };
        registry.register("item-1", obj);

        expect(registry.unregisterKey("item-1")).toBe(true);
        expect(registry.get("item-1")).toBeNull();
        expect(registry.findKey(obj)).toBeNull();
    });

    it("unregisters by object and makes the key unavailable", () => {
        const registry = new KeyedRegistry<{ value: number }, string>();
        const obj = { value: 1 };
        registry.register("item-1", obj);

        expect(registry.unregisterObject(obj)).toBe(true);
        expect(registry.get("item-1")).toBeNull();
        expect(registry.findKey(obj)).toBeNull();
    });

    it("returns false when unregistering a missing key", () => {
        const registry = new KeyedRegistry<{ value: number }, string>();

        expect(registry.unregisterKey("missing")).toBe(false);
    });

    it("returns false when unregistering a missing object", () => {
        const registry = new KeyedRegistry<{ value: number }, string>();
        const obj = { value: 1 };

        expect(registry.unregisterObject(obj)).toBe(false);
    });

    it("returns null when getting a missing key", () => {
        const registry = new KeyedRegistry<{ value: number }, string>();

        expect(registry.get("missing")).toBeNull();
    });

    it("returns null when finding the key of an unregistered object", () => {
        const registry = new KeyedRegistry<{ value: number }, string>();
        const obj = { value: 1 };

        expect(registry.findKey(obj)).toBeNull();
    });

    it("allows reusing a key after unregistering it", () => {
        const registry = new KeyedRegistry<{ value: number }, string>();
        const obj1 = { value: 1 };
        const obj2 = { value: 2 };

        registry.register("item-1", obj1);
        expect(registry.unregisterKey("item-1")).toBe(true);

        expect(registry.register("item-1", obj2)).toBe("item-1");
        expect(registry.get("item-1")).toBe(obj2);
    });

    it("iterates entries, keys, and values", () => {
        const registry = new KeyedRegistry<{ value: number }, string>();
        const obj1 = { value: 1 };
        const obj2 = { value: 2 };

        registry.register("one", obj1);
        registry.register("two", obj2);

        expect(Array.from(registry.entries())).toEqual([["one", obj1], ["two", obj2]]);
        expect(Array.from(registry.keys())).toEqual(["one", "two"]);
        expect(Array.from(registry.values())).toEqual([obj1, obj2]);
    });

    it("locks and unlocks the registry state", () => {
        const registry = new KeyedRegistry<{ value: number }, string>();
        expect(registry.isLocked()).toBe(false);

        registry.lock();
        expect(registry.isLocked()).toBe(true);

        registry.unlock();
        expect(registry.isLocked()).toBe(false);
    });

    it("prevents registering when locked", () => {
        const registry = new KeyedRegistry<{ value: number }, string>();
        registry.lock();

        expect(() => registry.register("item", { value: 1 })).toThrow(RegistryModificationError);
    });

    it("prevents unregistering by key when locked", () => {
        const registry = new KeyedRegistry<{ value: number }, string>();
        const obj = { value: 1 };
        registry.register("item", obj);
        registry.lock();

        expect(() => registry.unregisterKey("item")).toThrow(RegistryModificationError);
    });

    it("prevents unregistering by object when locked", () => {
        const registry = new KeyedRegistry<{ value: number }, string>();
        const obj = { value: 1 };
        registry.register("item", obj);
        registry.lock();

        expect(() => registry.unregisterObject(obj)).toThrow(RegistryModificationError);
    });

    it("allows modifications again after unlocking", () => {
        const registry = new KeyedRegistry<{ value: number }, string>();
        const obj = { value: 1 };

        registry.lock();
        registry.unlock();

        expect(registry.register("item", obj)).toBe("item");
        expect(registry.unregisterKey("item")).toBe(true);
    });
});
