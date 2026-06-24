export interface Registry<RegistryObject, RegistryKey> {
    /**
     * Gets a registry object by its key, returning it
     * if found, otherwise a null value.
     * @param key Object's key to find
     * @returns The registry object, if found, otherwise null
     */
    get(key: RegistryKey): RegistryObject | null;
    
    /**
     * Tries to find the key associated with a registry
     * object, returning the registry key, or
     * null if not found.
     * @param object Object instance to find
     * @returns The key associated with the object
     */
    findKey(object: RegistryObject): RegistryKey | null;

    
    /**
     * Returns an iterable of key, object pairs for every entry in the registry
     */
    entries(): Iterable<[RegistryKey, RegistryObject]>;

    /**
     * Returns an iterable of keys in the registry
     */
    keys(): Iterable<RegistryKey>;

    /**
     * Returns an iterable of objects in the registry
     */
    values(): Iterable<RegistryObject>;
}

export interface LockableRegistry {
    /**
     * Locks this registry so no new items can be registered
     */
    lock(): void;

    /**
     * Unlocks this registry so new items can be registered again
     */
    unlock(): void;


    /**
     * Checks if the registry is locked
     */
    isLocked(): void;
}