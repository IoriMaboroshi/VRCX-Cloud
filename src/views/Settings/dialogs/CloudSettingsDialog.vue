<template>
    <Dialog :open="isCloudSettingsDialogVisible" @update:open="(open) => (open ? null : closeDialog())">
        <DialogContent class="sm:max-w-[500px]">
            <DialogHeader>
                <DialogTitle>{{ t('settings.integrations.cloud_settings.header') }}</DialogTitle>
            </DialogHeader>

            <div class="text-xs text-muted-foreground mb-4">
                {{ t('settings.integrations.cloud_settings.description') }}
            </div>

            <div class="text-xs font-medium mb-1">{{ t('settings.integrations.cloud_settings.server_url') }}</div>
            <InputGroupField
                v-model="cloudServerUrl"
                :placeholder="'https://your-server.com'"
                class="mb-3" />

            <div class="text-xs font-medium mb-1">{{ t('settings.integrations.cloud_settings.api_key') }}</div>
            <InputGroupTextareaField
                v-model="cloudApiKey"
                :placeholder="t('settings.integrations.cloud_settings.api_key_placeholder')"
                :rows="3"
                class="mb-3" />

            <div v-if="connectionStatus" class="text-xs mb-3 flex items-center gap-2">
                <span class="inline-block w-2 h-2 rounded-full" :class="connectionStatus.connected ? 'bg-green-500' : 'bg-red-500'" />
                <span>{{ connectionStatus.text }}</span>
            </div>

            <DialogFooter>
                <Button variant="outline" @click="testConnection" :disabled="testing">
                    {{ testing ? 'Testing...' : 'Test Connection' }}
                </Button>
                <Button @click="saveSettings">Save</Button>
            </DialogFooter>
        </DialogContent>
    </Dialog>
</template>

<script setup>
    import { ref } from 'vue';
    import { storeToRefs } from 'pinia';
    import { toast } from 'vue-sonner';
    import { useI18n } from 'vue-i18n';

    import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
    import { Button } from '@/components/ui/button';
    import { InputGroupField, InputGroupTextareaField } from '@/components/ui/input-group';

    import { useAdvancedSettingsStore } from '../../../stores';
    import * as cloudApi from '../../../services/cloudApi';

    const advancedSettingsStore = useAdvancedSettingsStore();
    const { cloudServerUrl, cloudApiKey } = storeToRefs(advancedSettingsStore);
    const { setCloudServerUrl, setCloudApiKey } = advancedSettingsStore;
    const { t } = useI18n();

    defineProps({ isCloudSettingsDialogVisible: { type: Boolean, default: false } });
    const emit = defineEmits(['update:isCloudSettingsDialogVisible']);

    const testing = ref(false);
    const connectionStatus = ref(null);

    async function testConnection() {
        testing.value = true;
        connectionStatus.value = null;
        cloudApi.configureCloud(cloudServerUrl.value, cloudApiKey.value);
        try {
            const health = await cloudApi.getCloudHealth();
            connectionStatus.value = { connected: true, text: 'v' + health.version };
            toast.success('Connected!');
        } catch (err) {
            connectionStatus.value = { connected: false, text: err.message || 'Connection failed' };
            toast.error('Connection failed');
        } finally { testing.value = false; }
    }

    async function saveSettings() {
        await setCloudServerUrl(cloudServerUrl.value);
        await setCloudApiKey(cloudApiKey.value);
        cloudApi.configureCloud(cloudServerUrl.value, cloudApiKey.value);
        toast.success('Saved');
        closeDialog();
    }

    function closeDialog() { emit('update:isCloudSettingsDialogVisible', false); }
</script>
