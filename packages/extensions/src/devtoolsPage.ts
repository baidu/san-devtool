/* global chrome */
let created: boolean = false;
let createdCheckInterval: any;
// 检查面板提前开启，然后再 load san 页面的情况下，10s 内检查是否有 san，如果有则创建 san panel。超过 10s 无法创建 san panel
let checkCount = 0;
let checkGap = 1e3;
const CHECK_COUNT = 10;

function createDevtoolPanelIfNeeded() {
    if (created || checkCount++ > CHECK_COUNT) {
        clearInterval(createdCheckInterval);
        return;
    }

    chrome.devtools.inspectedWindow.eval('!!(window.__san_devtool__&&window.__san_devtool__.san)', hasSan => {
        if (!hasSan || created) {
            return;
        }
        clearInterval(createdCheckInterval);
        chrome.runtime && chrome.devtools.panels.create(
            'San',
            chrome.runtime.getURL('/icons/logo128.png'),
            'panel.html'
        );
        created = true;
    });
}

function startPoll() {
    createdCheckInterval = setInterval(createDevtoolPanelIfNeeded, checkGap);
    createDevtoolPanelIfNeeded();
}
startPoll();

/**
 *  当页面加载的时候会触发，
 *  1. 如果 san panel 已经存在，直接退出
 *  2. 如果不存在，重新轮询
 */
function onNavigatedHandler() {
    if (created) {
        return;
    }
    checkCount = 0;
    startPoll();
}
chrome.devtools.network.onNavigated.addListener(onNavigatedHandler);
