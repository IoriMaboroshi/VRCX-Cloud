import { initDayjs } from './dayjs';
import { initInteropApi } from './interopApi';
import { initNoty } from './noty';
import { initUi, initUiForVrOverlay } from './ui';

/**
 * @param {boolean} isVrOverlay
 * @returns {Promise<void>}
 */
export async function initPlugins(isVrOverlay = false) {
    await initInteropApi(isVrOverlay);
    initDayjs();
    if (isVrOverlay) {
        initNoty(true);
    }
}

export async function initUiPlugins(isVrOverlay = false) {
    if (!isVrOverlay) {
        await initUi();
    } else {
        await initUiForVrOverlay();
    }
}

export * from './i18n';
export * from './components';
export * from './sentry';
export * from './router';
