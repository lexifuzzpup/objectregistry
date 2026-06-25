import { RegistryModificationError } from "./errors.js";
import type { Registry, LockableRegistry } from "./registry.js";

export class KeyedRegistry<RegistryObject, RegistryKey = string> 
implements Registry<RegistryObject, RegistryKey>, LockableRegistry {
    private readonly registeredObjects = new Map<RegistryKey, RegistryObject>;
    private readonly registeredObjectsReversed = new Map<RegistryObject, RegistryKey>;
    private locked = false;
    
    /**
     * Registers an object instance, using the key
     * passed in as a parameter. Once an object is
     * unregistered, this same key can be used again.
     * 
     * Multiple objects cannot be simultaneously
     * registered under the same key, nor can one
     * object be simultaneously registered with
     * multiple different keys.
     * 
     * Object instances cannot be registered when the
     * registry is locked.
     * 
     * @param key Key used to refer to the object
     * @param object Object instance to register
     * @returns Instance location
     */
    public register(key: RegistryKey, object: RegistryObject): RegistryKey {
        if(this.locked) throw new RegistryModificationError("Registry is locked");

        if(this.registeredObjects.has(key)) {
            throw new RegistryModificationError("Key is already used");
        }
        if(this.registeredObjectsReversed.has(object)) {
            throw new RegistryModificationError("Object is already registered");
        }

        this.registeredObjects.set(key, object);
        this.registeredObjectsReversed.set(object, key);
        return key;
    }

    /**
     * Unregisters an object by its instance, returning
     * whether or not the operation was successful.
     * 
     * Object instances cannot be unregistered when the
     * registry is locked.
     * 
     * @param object Object instance to unregister
     */
    public unregisterObject(object: RegistryObject): boolean {
        if(this.locked) throw new RegistryModificationError("Registry is locked");

        const key = this.registeredObjectsReversed.get(object);

        if(key == null) return false;

        this.registeredObjects.delete(key);
        this.registeredObjectsReversed.delete(object);

        return true;
    }

    /**
     * Unregisters an object by its key, returning
     * whether or not the operation was successful.
     * 
     * Object instances cannot be unregistered when the
     * registry is locked.
     * 
     * @param key Object's key to unregister
     */
    public unregisterKey(key: RegistryKey): boolean {
        if(this.locked) throw new RegistryModificationError("Registry is locked");

        const object = this.registeredObjects.get(key);

        if(object == null) return false;

        this.registeredObjects.delete(key);
        this.registeredObjectsReversed.delete(object);
        
        return true;
    }
    
    
    public get(key: RegistryKey): RegistryObject | null {
        return this.registeredObjects.get(key) || null;
    }

    public findKey(object: RegistryObject): RegistryKey | null {
        return this.registeredObjectsReversed.get(object) || null;
    }

    public entries(): Iterable<[RegistryKey, RegistryObject]> {
        return this.registeredObjects.entries();
    }
    
    public keys(): Iterable<RegistryKey> {
        return this.registeredObjects.keys();
    }
    
    public values(): Iterable<RegistryObject> {
        return this.registeredObjects.values();
    }

    public lock() {
        this.locked = true;
    }

    public unlock() {
        this.locked = false;
    }

    public isLocked() {
        return this.locked;
    }
}