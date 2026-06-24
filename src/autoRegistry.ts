type AutoRegistryKey = Readonly<number>;

export class AutoRegistry<RegistryObject> {
    private readonly registeredObjects = new Array<RegistryObject>;
    private nextId: AutoRegistryKey = 0;

    /**
     * Registers an object instance, returning a key
     * that defines its location in the registry. The
     * key is unique and new objects registered will
     * never have this same key.
     * @param object Object instance to register
     * @returns Instance location
     */
    public register(object: RegistryObject): AutoRegistryKey {
        const id = this.nextId;
        this.registeredObjects[id] = object;

        this.nextId++;
        return id;
    }

    /**
     * Unregisters an object by its instance, returning
     * whether or not the operation was successful.
     * @param object Object instance to unregister
     */
    public unregister(object: RegistryObject): boolean

    /**
     * Unregisters an object by its key, returning
     * whether or not the operation was successful.
     * @param key Object's key to unregister
     */
    public unregister(key: AutoRegistryKey): boolean
    
    public unregister(arg0: any): boolean {
        // AutoRegistryKey
        if(typeof arg0 == "number") {
            if(!(arg0 in this.registeredObjects)) return false;

            // Remove the registered object with the specified id
            this.registeredObjects.splice(arg0, 1);
            return true;
        
        // RegistryObject
        } else {
            const index = this.registeredObjects.indexOf(arg0);
            if(index == -1) return false;

            // Remove the object at the index found for the registered object
            this.registeredObjects.splice(index, 1);
            return true;
        }
    }

    /**
     * Gets a registry object by its key, returning it
     * if found, otherwise a null value.
     * @param key Object's key to find
     * @returns The {@link RegistryObject} if found, otherwise null
     */
    public get(key: AutoRegistryKey): RegistryObject | null {
        return this.registeredObjects[key] || null;
    }

    /**
     * Returns an iterable of key, object pairs for every entry in the registry
     */
    public entries(): Iterator<[AutoRegistryKey, RegistryObject]> {
        return this.registeredObjects.entries().filter(([_, object]) => object);
    }

    /**
     * Returns an iterable of keys in the registry
     */
    public keys(): Iterator<AutoRegistryKey> {
        return this.registeredObjects.keys().filter((key) => key in this.registeredObjects);
    }

    /**
     * Returns an iterable of objects in the registry
     */
    public values(): Iterator<RegistryObject> {
        return this.registeredObjects.values().filter(object => object);
    }
}