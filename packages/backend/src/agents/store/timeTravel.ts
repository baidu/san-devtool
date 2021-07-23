/**
 * @file
 */
import {DevToolsHook} from '../../hook';
import {parseName, getValueByPath} from '../../utils/utils';

// type TCollectType = 'store-comp-inited' | 'store-comp-disposed';
interface IDiffItem {
    $change: 'change' | 'add' | 'remove';
    newValue: any;
    oldValue: any;
    target: string[];
}
interface IStateLog {
    oldValue: any;
    newValue: any;
    id: string;
    diff: IDiffItem[];
}

/**
 * 生成 diff 数据
 * @param newValue
 * @param oldValue
 * @param mapStatesPaths mapStates 映射为 store.state 属性路径
 * @returns 返回 diff 数据
 */
function getDiff(
    newValue: Record<string, any>,
    oldValue: Record<string, any>,
    mapStatesPaths: Record<string, any>
) {
    const diffs: IDiffItem[] = [];
    for (let stateName in mapStatesPaths) {
        if (mapStatesPaths.hasOwnProperty(stateName)) {
            const path = mapStatesPaths[stateName];
            const newData = getValueByPath(newValue, path);
            const oldData = getValueByPath(oldValue, path);
            let diff;
            if (oldData !== undefined && newData !== undefined && newData !== oldData) {
                diff = {
                    $change: 'change',
                    newValue: newData,
                    oldValue: oldData,
                    target: path
                };
            } else if (oldData === undefined && newData !== undefined) {
                diff = {
                    $change: 'add',
                    newValue: newData,
                    oldValue: oldData,
                    target: path
                };
            } else if (oldData !== undefined && newData === undefined) {
                diff = {
                    $change: 'remove',
                    newValue: newData,
                    oldValue: oldData,
                    target: path
                };
            }
            // eslint-disable-next-line
            diff && diffs.push(diff as IDiffItem);
        }
    }
    return diffs;
}

export function getStateFromStateLogs(logs: IStateLog[], id: string) {
    if (!Array.isArray(logs)) {
        return null;
    }
    return logs.find(item => id === item.id);
}

// 在 _fire 的时候，如果组件将 store 的某个数据放到 computed，并且 computed 中触发了 dispatch
// 那么 dispatch 的时候就应该将最新的值给填补回来
export function travelTo(storeCached: Record<string, any> = {}, id: string) {
    const {store, paths} = storeCached;
    if (!store || !store.stateChangeLogs || !paths) {
        return;
    }
    const state = getStateFromStateLogs(store.stateChangeLogs, id);
    if (!state) {
        return;
    }
    const diffs = getDiff(state.newValue, store.traveledState, paths);
    store.traveledState = state.newValue;
    store._fire(diffs);
    return;
}

export function collectMapStatePath(
    hook: DevToolsHook<{}>,
    storeName: string,
    mapStates: Record<string, any>
) {
    if (Object.prototype.toString.call(mapStates).toLocaleLowerCase() !== '[object object]') {
        return;
    }
    const store = hook.storeMap.get(storeName);
    let prevPaths = store.paths;
    if (!prevPaths) {
        store.paths = {};
    }
    Object.values(mapStates).reduce((prev: Record<string, any>, cur: string | string[]) => {
        let key = '';
        let value = [];
        if (Array.isArray(cur)) {
            key = cur.join('.');
            value = cur;
        }
        else {
            value = parseName(cur);
            key = value.join('.');
        }
        prev[key] = value;
        return prev;
    }, store.paths);
}
