export const __DEBUG__: boolean = process.env.NODE_ENV !== 'production';

export const SAN_DEVTOOL_NAMESPACE: string = '__san_devtool__';
// san component hook
// https://github.com/baidu/san/blob/fe8bbcab786a9da6cc73ca40e9b53bdd470aa8e3/src/view/component.js#L395
export const SAN_COMPONENT_HOOK = [
    'comp-compiled',
    'comp-inited',
    'comp-created',
    'comp-attached',
    'comp-detached',
    'comp-disposed',
    'comp-updated',
    // for profiler
    'comp-beforeCompile',
    'comp-beforeInit',
    'comp-beforeCreate',
    'comp-beforeAttach',
    'comp-beforeDetach',
    'comp-beforeDispose',
    'comp-beforeUpdate'
];
// san-store hook
export const SAN_STORE_HOOK = [
    'store-default-inited', // store 初始化
    'store-connected', // san 组件链接到 store
    'store-comp-inited', // store extendsComponent 组件初始化完成
    'store-comp-disposed', // store extendsComponent 组件卸载完成
    'store-listened', // 监听 store
    'store-unlistened', // 取消监听 store
    'store-dispatched', // 触发 dispatch
    'store-action-added', // 调用 store.addAction 添加 action
    'store-dispatch'
];

export const SAN_EVENT_HOOK = [
    'comp-event'
];

export const SAN_MESSAGE_HOOK = [
    'comp-message'
];
