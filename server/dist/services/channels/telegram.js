export function createTelegramChannel(cfg) { return { type: 'telegram', send: async (m) => { try {
        const r = await fetch('https://api.telegram.org/bot' + cfg.botToken + '/sendMessage', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ chat_id: cfg.chatId, text: m }) });
        if (!r.ok)
            return { success: false, error: 'HTTP ' + r.status };
        return { success: true };
    }
    catch (e) {
        return { success: false, error: e.message };
    } } }; }
//# sourceMappingURL=telegram.js.map