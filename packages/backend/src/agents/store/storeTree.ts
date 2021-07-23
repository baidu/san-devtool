import {DevToolsHook, Component} from '../../hook';
import {IMutationData, IActionData, IDispatchMsg} from './types';
import {toLocaleDatetime} from '@shared/utils/dateFormator';

let guidIndex = 0;

/* -------------------------------------------------------------------------- */
/*                            get or set store data                           */
/* -------------------------------------------------------------------------- */

/**
 * 获取 store 对应的名字
 * @param storeMap 存储 storeData 的 map
 * @param store store 实例
 */
function getStoreName(storeMap: Map<string, any>, store: any) {
    let {name} = store;
    let fakeName = '';
    for (let [key, storeData] of storeMap.entries()) {
        if (storeData.store === store) {
            fakeName = key;
            break;
        }
    }
    fakeName = fakeName || name;
    if (!fakeName) {
        fakeName = `Store${++guidIndex}-NamedBySanDevtools`;
    }
    return fakeName;
}

/**
 * 更新 componentId，store 实例，存储 storeData
 * @param hook
 * @param store store 实例
 * @param canGetAction 是否更新 storeData 中的 action，避免不必要的计算
 * @param componentOption 如何处理 componentId
 */
export function setStore(
    hook: DevToolsHook<{}>,
    store: any
) {
    let {storeMap} = hook;
    let fakeName = getStoreName(storeMap, store);
    let oldData = hook.storeMap.get(fakeName);
    if (!oldData) {
        // 构建 data
        hook.storeMap.set(fakeName, {
            store,
            components: {}
        });
    }
    else {
        oldData.store = store;
    }
    return fakeName;
}

/**
 * 从 hook 获取 store 数据
 * @param hook
 * @param storeName
 */
export function getStoreData(hook: DevToolsHook<{}>, storeName: string, actionId: string) {
    let {store} = hook.storeMap.get(storeName) || {};
    if (!store || !store.stateChangeLogs) {
        return;
    }
    let state = null;
    if (actionId) {
        state = store.stateChangeLogs.find((item: any) => actionId === item.id);
    }
    else {
        state = store.raw;
    }
    return state ? {
        storeName,
        raw: state.newValue
    } : null;
}

/* -------------------------------------------------------------------------- */
/*                         handle action and mutation                         */
/* -------------------------------------------------------------------------- */
/**
 * 获取 action 的『开始时间-结束时间』字符串
 * @param startTime 开始时间
 * @param endTime 结束时间
 */
function getTimeRange(startTime: number | undefined, endTime: number | undefined) {
    let start = '';
    let end = '';
    if (startTime) {
        start = toLocaleDatetime(new Date(startTime), 'hhh:mm:ss');
    }
    if (endTime) {
        end = toLocaleDatetime(new Date(endTime), 'hhh:mm:ss');
    }
    return `${start}-${end}`;
}

/**
 * 获取触发的 action 的原始数据，这里调用 san-store 实例属性与方法，注意版本兼容性处理
 * @param data
 * @param storeName store 名称
 * @return targetStr 改变的 store 的 key
 */
function getActionInfo(data: any) {
    let actionId = data.actionId;
    let store = data.store;
    if (store.actionCtrl) {
        // san-store 2.0.3 以下 https://github.com/baidu/san-store/releases/tag/2.0.3
        return store.actionCtrl.getById(+actionId);
    }
    else if (store.actionInfos && store._getActionInfo) {
        // san-store 2.1.0+ https://github.com/baidu/san-store/commit/a8ade597cf8b00906c95adf9c628a9bded7d3d38
        return store._getActionInfo(actionId);
    }
    return null;
}

/**
 * 获取此次 action 改变了哪些data
 * @param data
 * @param storeName store 名称
 * @return targetStr 改变的 store 的 key
 */
function getChangedTarget(diffData: any[]) {
    let targetStr = '';
    if (!diffData || !Array.isArray(diffData)) {
        return targetStr;
    }
    diffData.reduce((pre, cur) => {
        let target = cur.target;
        if (target && Array.isArray(target)) {
            targetStr += target.join('.') + ';';
        }
    }, targetStr);
    return targetStr;
}

/**
 * 获取触发的 action 的基本信息，diff 不是 undefined 表示这是一个 mutation
 * san-store v2.0.3 之前只有 dispatched 事件
 * @param data
 * @param storeName store 名称
 */
export function getMutationData(data: any = {}, storeName: string): IMutationData | null {
    let actionInfo = getActionInfo(data);
    if (!actionInfo) {
        return null;
    }
    let {
        id = '-1',
        name = '',
        parentId = undefined,
        childs = [],
        startTime = -1,
        payload = '',
        // selfDone = false,
        done = false,
        endTime = -1
    } = actionInfo;

    // 如果是异步开始了,先存储下来，后面再判断是否是异步的
    let diffData;
    // eslint-disable-next-line
    if (data.hasOwnProperty('diff')) {
        diffData = data.diff;
    }

    let timeRange = getTimeRange(startTime, endTime);
    let status = !!done ? 'done' : 'pendding';
    let mutationUseless = 'useless';
    // 同步的 action，触发了 mutaion，但是数据没有变化
    if (Array.isArray(diffData) && diffData.length > 0) {
        mutationUseless = '';
    }
    // mutation backend 不需要存储，在点开 mutation 详情面板并修改数据的时候直接找到 store name 以及相关数据直接操作 store
    return diffData === null ? null : {
        storeName: storeName,
        extras: [
            // {
            //     text: timeRange // 持续时间
            // },
            {
                text: mutationUseless // 展示状态用
            }
        ],
        timeRange,
        status: status,
        childs,
        displayName: name,
        payload,
        id,
        parentId,
        diff: diffData ? diffData : null,
        changedTarget: getChangedTarget(diffData)
    };
}

/**
 * 收集 action
 * san-store v2.0.3 之前只有 dispatched 事件
 * @param data
 * @param storeName store 名称
 */
export function getAsyncActionData(id: string, store: any, storeName: string): IActionData[] {
    const actionId = id;
    const actions: IActionData[] = [];
    if (!actionId || !store) {
        return actions;
    }
    let curId = actionId;
    while (curId) {
        let actionInfo = getActionInfo({actionId: curId, store});
        if (!actionInfo) {
            break;
        }
        let {
            id = '-1',
            name = '',
            parentId = undefined,
            startTime = -1,
            payload = '',
            endTime = -1
        } = actionInfo;
        let timeRange = getTimeRange(startTime, endTime);
        actions.unshift({
            storeName: storeName,
            timeRange,
            name,
            payload,
            id,
            parentId
        });
        curId = parentId;
    }
    return actions;
}

/**
 * 触发 action
 * @param hook
 * @param message
 */
export function dispatchAction(hook: DevToolsHook<{}>, message: IDispatchMsg) {
    let {storeName, actionName, payload} = message;
    if (!hook.storeMap.has(storeName)) {
        return;
    }
    let store = hook.storeMap.get(storeName).store;
    store.dispatch(actionName, payload);
}

/* -------------------------------------------------------------------------- */
/*                    handle connected components info data                   */
/* -------------------------------------------------------------------------- */

function getStrFromObject(mapData: Record<string, any>) {
    if (Object.prototype.toString.call(mapData) === '[object Object]') {
        return Object.entries(mapData).map(item => {
            let value = '-';
            switch (typeof item[1]) {
                case 'string': {
                    value = item[1];
                    break;
                }
                case 'function' : {
                    value = item[1].name;
                }
                default: break;
            }
            return `${item[0]}: ${value},`;
        });
    }
    return;
}

/**
 * 由于 component inited 在 attach 之前，所以可以先存下来，用于构建 componentTree 的阶段
 * 构造并存储 storeComponentData
 * @param mapStates 组件对应的 state
 * @param mapActions 组件对应的 actions
 * @param component 组件实例
 */
export function setStoreComponentData(
    hook: DevToolsHook<{}>,
    component: Component,
    del: boolean,
    mapStates?: Record<string, any>,
    mapActions?: Record<string, any>,
    storeName?: string
) {
    let {id} = component;
    if (del) {
        hook.storeComponentMap.delete(id + '');
        return;
    }
    let mapActionsKeys = mapActions && getStrFromObject(mapActions);
    let mapStatesArr = mapStates ? getStrFromObject(mapStates) : undefined;
    let componentData = {
        mapStates: mapStatesArr,
        mapActionsKeys,
        storeName,
        extra: {
            text: 'connected'
        }
    };
    hook.storeComponentMap.set(id + '', componentData);
}
