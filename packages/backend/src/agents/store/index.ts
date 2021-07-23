import Bridge from '@shared/Bridge';
import {DevToolsHook} from '../../hook';
import Agent from '../Agent';
import {SAN_STORE_HOOK} from '../../constants';
import {
    setStore,
    getMutationData,
    dispatchAction,
    setStoreComponentData,
    getStoreData,
    getAsyncActionData
} from './storeTree';
import {travelTo, collectMapStatePath} from './timeTravel';
import CircularJSON from '@shared/utils/circularJSON';
import {
    STORE_SET_MUTATION_INFO,
    STORE_SET_DATA, STORE_GET_DATA,
    STORE_DATA_CHANGED,
    STORE_DISPATCH,
    STORE_TIME_TRAVEL,
    STORE_GET_PARENTACTION,
    STORE_SET_PARENTACTION
} from '@shared/protocol';
import {storeDecorator} from './storeDecorator';


export class StoreAgent extends Agent {
    setupHook() {
        // 生命周期监听
        SAN_STORE_HOOK.map(evtName => {
            this.hook.on(evtName, data => {
                this.onHookEvent(evtName, data);
            });
        });
    }
    onHookEvent(evtName: string, data: any): void {
        switch (evtName) {
            /**
             * 页面 import san-store: 创建默认的 store，new Store({name: '__default__'})
             */
            case 'store-default-inited': {
                let {store} = data;
                storeDecorator.handler(store);
                if (store.name !== '__default__') {
                    console.warn('[SAN_DEVTOOLS]: there is must be something bad has happened in san-store');
                    return;
                }
                setStore(this.hook, store);
                break;
            }
            /**
             * connectStore(store) 调用：与 store 创建链接
             */
            case 'store-connected': {
                let {store} = data;
                storeDecorator.timeTravel(store);
                setStore(this.hook, store);
                break;
            }
            /**
             * connect({mapStates, mapActions})(<组件>),组件 inited 生命周期
             * https://github.com/baidu/san-store/blob/05894698c8640d6c8cf92139819e2d6c94164499/src/connect/createConnector.js#L116
             * 1. 监听 store state change: store-listened
             * 2. store-comp 初始化完成: store-comp-inited
             * 3. 组件生命周期初始化触发: inited
             */
            case 'store-listened': {
                // 后续立马会执行 store-comp-inited
                break;
            }
            case 'store-comp-inited': {
                let {
                    mapStates,
                    mapActions,
                    store,
                    component,
                } = data;
                let storeName = setStore(this.hook, store);
                this.sendToFrontend(STORE_DATA_CHANGED, '');
                setStoreComponentData(this.hook, component, false, mapStates, mapActions, storeName);
                collectMapStatePath(this.hook, storeName, mapStates);
                break;
            }
            /**
             * 调用 store.dispatch 触发 store 的值的改变
             * 需要记录下来，作为 store tree 的展示内容，但是当变动频繁的时候
             */
            case 'store-dispatch': {
                let {store} = data;
                setStore(this.hook, store);
                break;
            }
            case 'store-dispatched': {
                let {store} = data;
                let storeName = setStore(this.hook, store);
                let mutation = getMutationData(data, storeName);
                if (mutation !== null) {
                    this.sendToFrontend(STORE_SET_MUTATION_INFO, CircularJSON.stringify(mutation));
                }
                break;
            }
            /**
             * store-comp 包裹组件卸载
             * https://github.com/baidu/san-store/blob/05894698c8640d6c8cf92139819e2d6c94164499/src/connect/createConnector.js#L161
             * 1. 取消监听 store state change: store-unlistened
             * 2. store-comp 卸载完成: store-comp-disposed
             * 3. 组件生命周期初始化触发: disposed
             */
            case 'store-unlistened': {
                // 后续立马会执行 store-comp-disposed
                break;
            }
            case 'store-comp-disposed': {
                let {
                    store,
                    component
                } = data;
                setStore(this.hook, store);
                this.sendToFrontend(STORE_DATA_CHANGED, '');
                setStoreComponentData(this.hook, component, true);
                break;
            }
            default: break;
        }
    }
    addListener() {
        this.bridge.on(STORE_DISPATCH, message => {
            dispatchAction(this.hook, message);
        });
        this.bridge.on(STORE_GET_DATA, message => {
            const {id, storeName} = message || {};
            if (!id || !storeName) {
                return;
            }
            let storeData = getStoreData(this.hook, storeName, id);
            this.sendToFrontend(STORE_SET_DATA, CircularJSON.stringify(storeData));
        });
        this.bridge.on(STORE_TIME_TRAVEL, message => {
            if (message && message.id && message.storeName) {
                const {id, storeName} = message;
                const store = this.hook.storeMap.get(storeName);
                travelTo(store, id);
            }
        });
        this.bridge.on(STORE_GET_PARENTACTION, message => {
            if (message && message.id && message.storeName) {
                const {id, storeName} = message;
                const store = this.hook.storeMap.get(storeName);
                const actions = getAsyncActionData(id, store.store, storeName);
                this.sendToFrontend(STORE_SET_PARENTACTION, CircularJSON.stringify(actions));
            }
        });
    }
}

export default function init(hook: DevToolsHook<any>, bridge: Bridge) {
    return new StoreAgent(hook, bridge);
}
