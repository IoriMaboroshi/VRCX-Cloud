export function createQQBotChannel(cfg) { return { type: 'qqbot', send: async (m) => { try {
        const b = { message_type: cfg.targetType, message: [{ type: 'text', data: { text: m } }] };
        if (cfg.targetType === 'user')
            b.user_id = cfg.targetId;
        else
            b.group_id = cfg.targetId;
        const r = await fetch(cfg.apiUrl + '/send_msg', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + cfg.token }, body: JSON.stringify(b) });
        if (!r.ok)
            return { success: false, error: 'HTTP ' + r.status };
        return { success: true };
    }
    catch (e) {
        return { success: false, error: e.message };
    } } }; }
//# sourceMappingURL=qqbot.js.map