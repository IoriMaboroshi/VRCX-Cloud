class InteropApi {
    constructor() {
        return new Proxy(this, {
            get(target, prop) {
                // In CEF mode on Windows, globals are native; return undefined.
                // In Electron mode, use the Proxy to create IPC method wrappers.
                if (
                    WINDOWS &&
                    typeof window.process === 'undefined' &&
                    typeof window.electron === 'undefined'
                ) {
                    return undefined;
                }
                // For any property not on the target, create a nested Proxy
                // that maps method names to IPC calls.
                if (typeof prop === 'string' && !target[prop]) {
                    return new Proxy(
                        {},
                        {
                            get(_, methodName) {
                                // Return a method that calls the .NET method dynamically
                                return async (...args) => {
                                    return await target.callMethod(
                                        prop,
                                        methodName,
                                        ...args
                                    );
                                };
                            }
                        }
                    );
                }
                return target[prop];
            }
        });
    }

    async callMethod(className, methodName, ...args) {
        return window.interopApi
            .callDotNetMethod(className, methodName, args)
            .then((result) => {
                return result;
            });
    }
}

export default new InteropApi();
