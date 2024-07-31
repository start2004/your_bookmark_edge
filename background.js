/**
 * @since 2023-05-10 图标点击事件
 */
chrome.action.onClicked.addListener((tab) => {
    /**
     * @since 2023-05-10 打开页面
     */
    let url = chrome.runtime.getURL("newtab.html");
    chrome.tabs.create({ url });
});