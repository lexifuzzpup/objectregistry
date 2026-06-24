# Object Registry

A small utility library for managing object registries in JavaScript and TypeScript.

This package provides two registry implementations:

- `AutoRegistry` — automatically assigns numeric keys to registered objects.
- `KeyedRegistry` — stores objects under user-provided keys and supports reverse lookup.

## Installation

```bash
npm install objectregistry
```

## Quick Start

### AutoRegistry

`AutoRegistry` is useful when you want stable handles for objects without choosing keys yourself.

```ts
import { AutoRegistry } from "objectregistry";

const registry = new AutoRegistry<{ name: string }>();
const key = registry.register({ name: "Alice" });

console.log(key); // 0
console.log(registry.get(key)); // { name: "Alice" }
console.log(registry.findByKey({ name: "Alice" })); // null (different object instance)

const obj = { name: "Bob" };
const bobKey = registry.register(obj);
console.log(registry.findByKey(obj)); // bobKey

registry.lock();
// registry.register({ name: "Carol" }); // throws RegistryModificationError
registry.unlock();
```

### KeyedRegistry

`KeyedRegistry` lets you assign your own keys and look up objects both ways.

```ts
import { KeyedRegistry } from "objectregistry";

const registry = new KeyedRegistry<{ value: number }, string>();
const item = { value: 10 };

registry.register("item-10", item);
console.log(registry.get("item-10")); // { value: 10 }
console.log(registry.findKey(item)); // "item-10"

registry.unregisterKey("item-10");
console.log(registry.get("item-10")); // null
```

## Features

- auto-generated numeric keys with `AutoRegistry`
- custom key registration with `KeyedRegistry`
- reverse lookup from object to key
- configurable lock/unlock support to prevent mutation
- iterator support for entries, keys, and values

## Notes

- `AutoRegistry` uses object identity to track reverse lookups.
- `KeyedRegistry` prevents duplicate keys and duplicate object registrations.
- Locked registries block `register()` and unregister operations.
