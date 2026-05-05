<template>
    <Dialog :open="isPushSettingsDialogVisible" @update:open="(open) => (open ? null : closeDialog())">
        <DialogContent class="sm:max-w-[550px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
                <DialogTitle>Push Notification Settings</DialogTitle>
            </DialogHeader>

            <div class="text-xs text-muted-foreground mb-4">
                Configure where to send push notifications when tracked (VIP) friends come online, go offline, or change location.
            </div>

            <!-- Channels -->
            <div class="space-y-4">
                <div v-for="channel in channels" :key="channel.id" class="border rounded-lg p-3">
                    <div class="flex items-center justify-between mb-2">
                        <div class="flex items-center gap-2">
                            <span class="text-xs px-2 py-0.5 rounded-full" :class="channelTypeBadge(channel.channel_type)">
                                {{ channel.channel_type.toUpperCase() }}
                            </span>
                            <span class="text-sm font-medium">{{ channel.label }}</span>
                        </div>
                        <div class="flex gap-1">
                            <Button size="icon-xs" variant="ghost" @click="editChannel(channel)">
                                <Pencil class="size-3.5" />
                            </Button>
                            <Button size="icon-xs" variant="ghost" class="text-red-500" @click="confirmDelete(channel.id)">
                                <Trash2 class="size-3.5" />
                            </Button>
                        </div>
                    </div>
                    <div class="text-xs text-muted-foreground">
                        {{ summarizeChannel(channel) }}
                    </div>
                </div>

                <!-- Add new channel -->
                <Button variant="outline" size="sm" class="w-full" @click="startAddChannel">
                    <Plus class="size-4 mr-1.5" />
                    Add Channel
                </Button>
            </div>

            <!-- Add/Edit channel form -->
            <div v-if="showForm" class="border rounded-lg p-3 mt-4 space-y-3">
                <div class="text-sm font-medium">{{ editingId ? 'Edit Channel' : 'New Channel' }}</div>

                <select v-model="formType" class="w-full border rounded px-2 py-1.5 text-sm">
                    <option value="">-- Select Type --</option>
                    <option value="email">Email (SMTP)</option>
                    <option value="telegram">Telegram Bot</option>
                    <option value="qqbot">QQ Bot (NapQQ)</option>
                </select>

                <input v-model="formLabel" placeholder="Label (e.g. 'My Gmail')" class="w-full border rounded px-2 py-1.5 text-sm" />

                <!-- Email config -->
                <template v-if="formType === 'email'">
                    <input v-model="formConfig.smtpHost" placeholder="SMTP Host (smtp.gmail.com)" class="w-full border rounded px-2 py-1.5 text-sm" />
                    <input v-model="formConfig.smtpPort" placeholder="SMTP Port (587)" type="number" class="w-full border rounded px-2 py-1.5 text-sm" />
                    <input v-model="formConfig.smtpUser" placeholder="SMTP User" class="w-full border rounded px-2 py-1.5 text-sm" />
                    <input v-model="formConfig.smtpPass" placeholder="SMTP Password" type="password" class="w-full border rounded px-2 py-1.5 text-sm" />
                    <input v-model="formConfig.fromEmail" placeholder="From Email" class="w-full border rounded px-2 py-1.5 text-sm" />
                    <input v-model="formConfig.toEmail" placeholder="To Email" class="w-full border rounded px-2 py-1.5 text-sm" />
                </template>

                <!-- Telegram config -->
                <template v-if="formType === 'telegram'">
                    <input v-model="formConfig.botToken" placeholder="Bot Token (123:ABC)" class="w-full border rounded px-2 py-1.5 text-sm" />
                    <input v-model="formConfig.chatId" placeholder="Chat ID" class="w-full border rounded px-2 py-1.5 text-sm" />
                </template>

                <!-- QQ Bot config -->
                <template v-if="formType === 'qqbot'">
                    <input v-model="formConfig.apiUrl" placeholder="API URL (http://127.0.0.1:3000)" class="w-full border rounded px-2 py-1.5 text-sm" />
                    <input v-model="formConfig.token" placeholder="Access Token" class="w-full border rounded px-2 py-1.5 text-sm" />
                    <select v-model="formConfig.targetType" class="w-full border rounded px-2 py-1.5 text-sm">
                        <option value="user">User</option>
                        <option value="group">Group</option>
                    </select>
                    <input v-model="formConfig.targetId" placeholder="Target ID" class="w-full border rounded px-2 py-1.5 text-sm" />
                </template>

                <div class="flex gap-2">
                    <Button size="sm" @click="saveChannel">
                        {{ editingId ? 'Update' : 'Add' }}
                    </Button>
                    <Button size="sm" variant="ghost" @click="cancelForm">
                        Cancel
                    </Button>
                </div>
            </div>

            <DialogFooter>
                <Button @click="closeDialog">Close</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

<script setup>
    import { ref, reactive } from 'vue';
    import { toast } from 'vue-sonner';
    import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { Pencil, Plus, Trash2 } from 'lucide-vue-next';
    import * as cloudApi from '../../../services/cloudApi';

    const props = defineProps({
        isPushSettingsDialogVisible: { type: Boolean, default: false },
    });
    const emit = defineEmits(['update:isPushSettingsDialogVisible']);

    const channels = ref([]);
    const showForm = ref(false);
    const editingId = ref(null);
    const formType = ref('');
    const formLabel = ref('');
    const formConfig = reactive({});

    async function loadChannels() {
        try {
            const res = await cloudApi.getPushChannels();
            channels.value = res.channels || [];
        } catch (e) { /* ignore */ }
    }

    function channelTypeBadge(type) {
        const map = { email: 'bg-blue-100 text-blue-700', telegram: 'bg-sky-100 text-sky-700', qqbot: 'bg-green-100 text-green-700' };
        return map[type] || 'bg-gray-100 text-gray-700';
    }

    function summarizeChannel(c) {
        const cfg = typeof c.config === 'string' ? JSON.parse(c.config) : c.config;
        if (c.channel_type === 'email') return cfg.toEmail || cfg.smtpHost || '';
        if (c.channel_type === 'telegram') return 'Chat: ' + (cfg.chatId || '?');
        if (c.channel_type === 'qqbot') return (cfg.targetType || '?') + ':' + (cfg.targetId || '?');
        return '';
    }

    function startAddChannel() {
        editingId.value = null;
        formType.value = '';
        formLabel.value = '';
        Object.keys(formConfig).forEach(k => delete formConfig[k]);
        showForm.value = true;
    }

    function editChannel(channel) {
        editingId.value = channel.id;
        formType.value = channel.channel_type;
        formLabel.value = channel.label;
        const cfg = typeof channel.config === 'string' ? JSON.parse(channel.config) : channel.config;
        Object.keys(formConfig).forEach(k => delete formConfig[k]);
        Object.assign(formConfig, cfg);
        showForm.value = true;
    }

    async function saveChannel() {
        if (!formType.value) { toast.error('Select a channel type'); return; }
        const data = { channelType: formType.value, label: formLabel.value, config: { ...formConfig } };
        try {
            if (editingId.value) {
                await cloudApi.updatePushChannel(editingId.value, data);
            } else {
                await cloudApi.addPushChannel(data);
            }
            toast.success('Channel saved');
            showForm.value = false;
            await loadChannels();
        } catch (e) {
            toast.error(e.message || 'Failed to save channel');
        }
    }

    function cancelForm() { showForm.value = false; }

    async function confirmDelete(id) {
        try {
            await cloudApi.deletePushChannel(id);
            toast.success('Channel removed');
            await loadChannels();
        } catch (e) {
            toast.error(e.message || 'Failed to remove');
        }
    }

    function closeDialog() {
        emit('update:isPushSettingsDialogVisible', false);
    }

    // Load channels when dialog opens
    const unwatch = watch(() => props.isPushSettingsDialogVisible, (val) => { if (val) loadChannels(); });
    onUnmounted(() => unwatch());
</script>

<script>
    import { watch, onUnmounted } from 'vue';
</script>
