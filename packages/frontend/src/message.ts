/**
 * @file 主要用于接收 standalone 来的数据，包括：treeData，sanVersion。组件生命周期的事件backend处理之后再统一走 treeData
 */
import EventEmitter from '@shared/EventEmitter';
import Bridge from '@shared/Bridge';
import {
    HANDSHAKE_FRONTEND_READY,
    SAN_SET_VERSION,
    COMPONENT_SET_TREE_DATA,
    COMPONENT_GET_TREE_DATA,
    COMPONENT_SET_INFO,
    STORE_SET_MUTATION_INFO,
    STORE_SET_DATA,
    STORE_SET_PARENTACTION,
    HISTORY_SET_INFO,
    MESSAGE_SET_INFO,
    EVENT_SET_INFO,
    INSPECT_COMPONENT,
    STORE_DATA_CHANGED,
    BACKEND_CONNECTED,
    BACKEND_DISCONNECTED,
    PROFILER_SET_DATA,
    PROFILER_SET_INFO,
    PROFILER_SET_FIRST_RENDER_DATA,
    PROFILER_GET_FIRST_RENDER_DATA
} from '@shared/protocol';
import {store} from './store';
import {isChromePanel} from './utils/index';

export default class FrontendReceiver extends EventEmitter {
    _bridge: Bridge;
    constructor(bridge: Bridge) {
        super();
        this._bridge = bridge;
        bridge.on(COMPONENT_SET_TREE_DATA, this.onTreeData.bind(this));
        bridge.on(SAN_SET_VERSION, this.onSanVersion.bind(this));
        bridge.on(COMPONENT_SET_INFO, this.onComponentInfo.bind(this));
        bridge.on(STORE_SET_MUTATION_INFO, this.onMutation.bind(this));
        bridge.on(STORE_SET_DATA, this.onStore.bind(this));
        bridge.on(STORE_DATA_CHANGED, this.onStoreChanged.bind(this));
        bridge.on(STORE_SET_PARENTACTION, this.onActionCallStack.bind(this));
        bridge.on(HISTORY_SET_INFO, this.onHistory.bind(this));
        bridge.on(MESSAGE_SET_INFO, this.onMessage.bind(this));
        bridge.on(EVENT_SET_INFO, this.onEvent.bind(this));
        bridge.on(PROFILER_SET_DATA, this.onProfilerData.bind(this));
        bridge.on(PROFILER_SET_INFO, this.onProfilerInfo.bind(this));
        bridge.on(PROFILER_SET_FIRST_RENDER_DATA, this.onFirstRenderProfilerData.bind(this));
        bridge.on(INSPECT_COMPONENT, this.onInspectComponent.bind(this)); // inspect component
        bridge.on(BACKEND_CONNECTED, this.onBackendConnected.bind(this)); // 后端链接
        bridge.on(BACKEND_DISCONNECTED, this.onBackendDisconnected.bind(this)); // 后端断开
        !isChromePanel && this.frontendReady();
    }
    frontendReady() {
        this._bridge.send(HANDSHAKE_FRONTEND_READY, 'I am FrontEnd, I am standby!');
    }

    onSanVersion(d: any) {
        store.dispatch('setWsDisconnected', false);
        store.dispatch('setSanVersion', d);
        this._bridge.send(COMPONENT_GET_TREE_DATA, '');
        this._bridge.send(PROFILER_GET_FIRST_RENDER_DATA, '');
    }
    onTreeData(data: any) {
        // do something
        store.dispatch('setTreeData', JSON.parse(data));
    }
    onComponentInfo(data: any) {
        if (!data) {
            store.dispatch('setInspectId', '');
            store.dispatch('setComponentInfo', null);
            store.dispatch('setSelectedComponentBaseInfo', {id: '', displayName: ''});
            return;
        }
        store.dispatch('setComponentInfo', JSON.parse(data));
    }
    onMutation(data: any) {
        store.dispatch('setMutationTreeData', JSON.parse(data));
    }
    onStore(data: any) {
        store.dispatch('setStoreData', JSON.parse(data));
    }
    onStoreChanged() {
        store.dispatch('setStoreChanged', true);
    }
    onActionCallStack(data: any) {
        store.dispatch('setActionCallStack', JSON.parse(data));
    }
    onHistory(data: any) {
        // history 数据的接收是一个频繁触发的动作，store 的修改是同步的，会阻塞用户的交互动作
        setTimeout(() => {
            store.dispatch('setHistory', JSON.parse(data));
        }, 0);
    }
    onMessage(data: any) {
        store.dispatch('setMessage', JSON.parse(data));
    }
    onEvent(data: any) {
        store.dispatch('setEvent', JSON.parse(data));
    }
    onProfilerData(data: any) {
        store.dispatch('setProfilerData', JSON.parse(data));
    }
    onProfilerInfo(data: any) {
        store.dispatch('setProfilerInfo', JSON.parse(data));
    }
    onFirstRenderProfilerData(data: any) {
        store.dispatch('setProfilerDataList', JSON.parse(data));
    }
    // inspect component
    onInspectComponent() {
        if (isChromePanel) {
            let componentIdCode = 'window.__san_devtool__.sanDevtoolsContextMenuTargetIdPath';
            // eslint-disable-next-line
            chrome.devtools.inspectedWindow.eval(componentIdCode, function (res: any, err: chrome.devtools.inspectedWindow.EvaluationExceptionInfo) {
                if (err) {
                    console.log(err);
                }
                if (res) {
                    store.dispatch('setInspectId', res);
                }
            });
        }
    }
    // backend 断开链接
    onBackendDisconnected() {
        store.dispatch('setWsDisconnected', true);
        store.$resetStore({
            excludes: [
                'sanVersion',
                'bridge',
                'settings',
                'wsDisconnected',
                'activeTab'
            ]
        });
    }
    // backend 重新建立链接
    onBackendConnected() {
        // 当 backend 链接上了，返回 frontend 已经 ok 的消息
        this._bridge.send(HANDSHAKE_FRONTEND_READY, '');
    }
}
