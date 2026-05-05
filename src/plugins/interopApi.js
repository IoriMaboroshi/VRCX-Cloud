// @ts-nocheck
import InteropApi from '../ipc-electron/interopApi.js';
import vrcxJsonStorage from '../services/jsonStorage.js';

export async function initInteropApi(isVrOverlay = false) {
    if (isVrOverlay) {
        // @ts-ignore
        window.AppApiVr = InteropApi.AppApiVrElectron;
    } else {
        // Electron path: use InteropApi bridge
        window.AppApi = InteropApi.AppApiElectron;
        window.WebApi = InteropApi.WebApi;
        window.VRCXStorage = InteropApi.VRCXStorage;
        window.SQLite = InteropApi.SQLite;
        window.LogWatcher = InteropApi.LogWatcher;
        window.Discord = InteropApi.Discord;
        window.AssetBundleManager = InteropApi.AssetBundleManager;
        window.AppApiVrElectron = InteropApi.AppApiVrElectron;

        // VRCXStorage: use the InteropApi proxy directly.
        // The proxy creates lazy method wrappers for IPC calls.
        // Wrap it so jsonStorage can add GetArray/SetArray/etc methods.
        window.VRCXStorage = InteropApi.VRCXStorage;

        new vrcxJsonStorage(window.VRCXStorage);

        if (window.AppApi && typeof window.AppApi.SetUserAgent === 'function') {
            window.AppApi.SetUserAgent();
        }
    }
}
