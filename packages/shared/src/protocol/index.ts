/**
 * @file
 */
// HandShake
const HANDSHAKE_FRONTEND_READY = 'HandShake.frontendReady';

// connection
const BACKEND_CONNECTED = 'SYSTEM:backendConnected'; // 后端已链接
const BACKEND_DISCONNECTED = 'SYSTEM:backendDisconnected'; // 后端断开链接

// San
const SAN_SET_VERSION = 'San.setSanVersion';
const SAN_GET_VERSION = 'San.getSanVersion';

// Component
const COMPONENT_SET_TREE_DATA = 'Component.setTreeData'; // 接收组件树的数据：不包含组件实例，只用于展示以及组件的唯一标记
const COMPONENT_GET_TREE_DATA = 'Component.getTreeData';
const COMPONENT_SET_INFO = 'Component.setComponentInfo'; // 接收组件的详情
const COMPONENT_GET_INFO = 'Component.getComponentInfo';
const COMPONENT_MODIFY_DATA = 'Component.modifyComponentData';

// Store
const STORE_SET_MUTATION_INFO = 'Store.setMutationTreeData'; // 接收 mutation
const STORE_GET_MUTATION_INFO = 'Store.getMutationTreeData';
const STORE_SET_DATA = 'Store.setStoreData'; // 接收 store
const STORE_GET_DATA = 'Store.getStoreData'; // 接收 store
const STORE_DATA_CHANGED = 'Store.storeChanged'; // store 变化了
const STORE_DISPATCH = 'Store.dispatchAction';
const STORE_TIME_TRAVEL = 'Store.timeTravel';
const STORE_GET_PARENTACTION = 'Store.getParentAction';
const STORE_SET_PARENTACTION = 'store.setParentAction';

// history
const HISTORY_SET_INFO = 'History.setHistory'; // 接收
const HISTORY_GET_INFO = 'History.getHistory';
const HISTORY_RECORD = 'History.historyRecording';

// message
const MESSAGE_SET_INFO = 'Message.setMessage';
const MESSAGE_GET_INFO = 'Message.getMessage';
const MESSAGE_RECORD = 'Message.messageRecording';
const MESSAGE_DISPATCH = 'Message.dispatch';

// event
const EVENT_SET_INFO = 'Event.setEvent';
const EVENT_GET_INFO = 'Event.getEvent';
const EVENT_RECORD = 'Event.eventRecording';
const EVENT_FIRE = 'Event.fire';

// profiler
const PROFILER_SET_DATA = 'Profiler.setProfilerData'; // 一段时间内火焰图的数据
const PROFILER_GET_DATA = 'Profiler.getProfilerData';
const PROFILER_SET_INFO = 'Profiler.setProfilerInfo'; // 获取某个组件的渲染数据
const PROFILER_GET_INFO = 'Profiler.getProfilerInfo';
const PROFILER_SET_FIRST_RENDER_DATA = 'Profiler.setFirstReanderProfilerData'; // 首屏组件挂载的 profiler 数据
const PROFILER_GET_FIRST_RENDER_DATA = 'Profiler.getFirstReanderProfilerData';
const PROFILER_RECORD = 'Profiler.profilerRecording';

// inspect component
const INSPECT_COMPONENT = 'Inspector.component';
const INSPECT_HIGHLIGHT = 'Inspect.highlight';
const INSPECT_UNHIGHLIGHT = 'Inspect.unhighlight';

// TODO:Recording

export {
    HANDSHAKE_FRONTEND_READY,
    BACKEND_CONNECTED,
    BACKEND_DISCONNECTED,

    SAN_SET_VERSION,
    SAN_GET_VERSION,

    COMPONENT_SET_TREE_DATA,
    COMPONENT_GET_TREE_DATA,
    COMPONENT_SET_INFO,
    COMPONENT_GET_INFO,
    COMPONENT_MODIFY_DATA,

    STORE_SET_MUTATION_INFO,
    STORE_GET_MUTATION_INFO,
    STORE_SET_DATA,
    STORE_GET_DATA,
    STORE_DATA_CHANGED,
    STORE_DISPATCH,
    STORE_TIME_TRAVEL,
    STORE_GET_PARENTACTION,
    STORE_SET_PARENTACTION,

    HISTORY_SET_INFO,
    HISTORY_GET_INFO,
    HISTORY_RECORD,

    MESSAGE_SET_INFO,
    MESSAGE_GET_INFO,
    MESSAGE_RECORD,
    MESSAGE_DISPATCH,

    EVENT_SET_INFO,
    EVENT_GET_INFO,
    EVENT_RECORD,
    EVENT_FIRE,

    PROFILER_SET_DATA,
    PROFILER_GET_DATA,
    PROFILER_SET_INFO,
    PROFILER_GET_INFO,
    PROFILER_SET_FIRST_RENDER_DATA,
    PROFILER_GET_FIRST_RENDER_DATA,
    PROFILER_RECORD,

    INSPECT_COMPONENT,
    INSPECT_HIGHLIGHT,
    INSPECT_UNHIGHLIGHT
};
