<template>
    <div class="x-container flex flex-col p-4 gap-4 overflow-y-auto">
        <div class="flex items-center justify-between shrink-0">
            <h2 class="text-lg font-semibold">Cloud Analytics</h2>
            <div class="flex items-center gap-2">
                <span class="text-xs" :class="cloudStore.isConnected ? 'text-green-600' : 'text-red-500'">
                    {{ cloudStore.isConnected ? '● Connected' : '○ Disconnected' }}
                </span>
                <Button size="sm" variant="outline" @click="refresh">Refresh</Button>
            </div>
        </div>

        <!-- Status Distribution -->
        <div class="border rounded-lg p-4">
            <h3 class="text-sm font-medium mb-3">Status Distribution</h3>
            <div v-if="statusDist" class="space-y-2">
                <div v-for="item in statusItems" :key="item.status" class="flex items-center gap-3">
                    <span class="w-16 text-xs text-right">{{ item.label }}</span>
                    <div class="flex-1 h-5 bg-muted rounded-full overflow-hidden">
                        <div class="h-full rounded-full transition-all duration-500"
                            :style="{ width: pct(item.count, statusDist.total) + '%', background: item.color }" />
                    </div>
                    <span class="text-xs w-10 font-mono">{{ item.count }}</span>
                    <span class="text-xs text-muted-foreground w-12">{{ pct(item.count, statusDist.total) }}%</span>
                </div>
            </div>
            <div v-else class="text-xs text-muted-foreground">No data -- connect cloud server.</div>
        </div>

        <!-- Bio Changes -->
        <div class="border rounded-lg p-4">
            <h3 class="text-sm font-medium mb-3">Recent Bio Changes</h3>
            <div v-if="bioList.length" class="space-y-3">
                <div v-for="item in bioList" :key="item.name" class="border rounded-md p-3">
                    <div class="flex items-center justify-between mb-2">
                        <span class="text-sm font-medium">{{ item.name }}</span>
                        <span class="text-xs text-muted-foreground">{{ item.time }}</span>
                    </div>
                    <div class="text-xs whitespace-pre-wrap leading-relaxed max-h-24 overflow-y-auto bg-muted/50 rounded p-2">
                        <template v-if="item.bio">{{ item.bio }}</template>
                        <template v-else><span class="text-muted-foreground italic">(empty)</span></template>
                    </div>
                </div>
            </div>
            <div v-else class="text-xs text-muted-foreground">No bio changes yet. Data collects over time.</div>
        </div>

        <!-- Online Friends -->
        <div class="border rounded-lg p-4">
            <h3 class="text-sm font-medium mb-3">
                Currently Online
                <span class="text-xs text-muted-foreground ml-1">({{ onlineList.length }})</span>
            </h3>
            <div v-if="onlineList.length" class="flex flex-wrap gap-1.5">
                <div v-for="f in onlineList" :key="f.id" class="text-xs px-2 py-1 rounded-full"
                    :class="statusClass(f.status)">
                    {{ f.name }}
                    <span v-if="f.world" class="opacity-50 ml-1">@ {{ f.world }}</span>
                </div>
            </div>
            <div v-else class="text-xs text-muted-foreground">No friends online.</div>
        </div>
    </div>
</template>

<script setup>
    import { ref, computed, onMounted } from 'vue';
    import { Button } from '@/components/ui/button';
    import * as cloudApi from '../../services/cloudApi';
    import { useCloudStore } from '../../stores/cloud';

    const cloudStore = useCloudStore();
    const statusDist = ref(null);
    const onlineList = ref([]);
    const bioList = ref([]);

    const statusItems = computed(() => {
        if (!statusDist.value) return [];
        const map = [
            { key: 'active', label: 'Active', color: '#06d6a0' },
            { key: 'join me', label: 'Join Me', color: '#06d6a0' },
            { key: 'online', label: 'Online', color: '#118ab2' },
            { key: 'ask me', label: 'Ask Me', color: '#ffd166' },
            { key: 'busy', label: 'Busy', color: '#ef476f' },
            { key: 'offline', label: 'Offline', color: '#aaa' },
        ];
        return map.map(m => ({
            status: m.key, label: m.label, color: m.color,
            count: statusDist.value.distribution[m.key] || 0,
        })).filter(i => i.count > 0);
    });

    function pct(c, t) { return t ? Math.round((c / t) * 100) : 0; }

    function statusClass(s) {
        if (s === 'join me' || s === 'active') return 'bg-emerald-100 text-emerald-800';
        if (s === 'ask me') return 'bg-amber-100 text-amber-800';
        if (s === 'busy') return 'bg-red-100 text-red-800';
        return 'bg-sky-100 text-sky-800';
    }

    function formatTime(ts) {
        if (!ts) return '';
        const diff = Date.now() - new Date(ts + 'Z').getTime();
        if (diff < 60000) return 'just now';
        if (diff < 3600000) return Math.floor(diff / 60000) + 'm ago';
        if (diff < 86400000) return Math.floor(diff / 3600000) + 'h ago';
        return new Date(ts + 'Z').toLocaleDateString();
    }

    async function refresh() {
        if (!cloudStore.shouldUseCloud()) return;
        try { statusDist.value = await cloudApi.cloudRequest('/api/analytics/status-distribution'); } catch (e) {}
        try {
            const res = await cloudApi.getCloudFriends();
            const f = res.friends || [];
            onlineList.value = f.filter(x => x.location !== 'offline' && x.location !== 'private')
                .map(x => ({ id: x.user_id, name: x.display_name, status: x.status, world: x.world_id }));
            bioList.value = f.filter(x => x.bio && x.bio.length > 5).slice(0, 8)
                .map(x => ({ name: x.display_name, bio: x.bio, time: formatTime(x.updated_at) }));
        } catch (e) {}
    }

    onMounted(() => { if (cloudStore.shouldUseCloud()) refresh(); });
</script>
