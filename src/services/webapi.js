// requires binding of WebApi

class WebApiService {
    clearCookies() {
        return WebApi.ClearCookies();
    }

    getCookies() {
        return WebApi.GetCookies();
    }

    setCookies(cookie) {
        return WebApi.SetCookies(cookie);
    }

    /**
     * @param {any} options
     * @returns {Promise<{status: number, data?: string}>}
     */
    async execute(options) {
        if (!options) {
            throw new Error('options is required');
        }
        const requestJson = JSON.stringify(options);
        var json = await WebApi.ExecuteJson(requestJson);
        try {
            var data = JSON.parse(json || '{}');
        } catch {
            throw new Error(
                `Invalid JSON response from WebApi: ${json?.substring(0, 100)}`
            );
        }
        if (data.status === -1) {
            throw new Error(data.message);
        }
        return {
            status: data.status,
            data: data.message
        };
    }
}

var self = new WebApiService();
window.webApiService = self;

export default self;
export { WebApiService };
