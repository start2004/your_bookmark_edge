/**
 * @since 2023-05-10 主入口
 */
$(function(){
    main();
});

/**
 * @since 2023-05-10 入口
 */
function main(){
    /**
     * @since 2024-08-02 title
     */
    $("title").text(chrome.i18n.getMessage("extension_name"));

    /**
     * @since 2023-05-11 处理搜素框
     */
    spiderSearch();

    /**
     * @since 2023-05-12 显示顶部
     */
    $(".head").show();

    /**
     * @since 2023-05-09 获取收藏夹数据
     */
    chrome.bookmarks.getTree(function(itemTree){
        itemTree.forEach(function(item){
            if(item.children){
                /**
                 * @since 2023-05-09 仅处理书签栏
                 */
                processNode(item.children[0].children);
            } else {}
        });
    });
}

/**
 * ===============================================================
 */

/**
 * @since 2023-05-11 搜索框处理
 */
function spiderSearch(){
    /**
     * @since 2023-05-15 初始化搜索图标
     */
    let spiderObj = getSpider();
    $(".search-text").attr("placeholder", chrome.i18n.getMessage("search_prompt"));

    /**
     * @since 2024-08-01 加载-更多搜索图标html
     */
    let htmlArray = new Array();
    let spiderArray = chrome.i18n.getMessage("spider").split(",");
    for(let i=0; i<spiderArray.length; i++){
        let spider = spiderArray[i];
        let html = '<li id="'+ spider +'" style="background-image: url(\'image/'+ spider +'_128.png\');" title="'+ chrome.i18n.getMessage(spider+ "_search") +'">'+ chrome.i18n.getMessage(spider) +'</li>';
        htmlArray.push(html);
    }
    let html = '<ul class="list-inline">' + htmlArray.join('') + '</ul>';
    $(".search-tip.img-rounded").html(html);

    /**
     * @since 2023-05-15 修改图片
     */
    $(".spider-btn img").attr("src", "image/"+ spiderObj.spider +"_128.png");

    /**
     * @since 2023-05-11 监听搜索图标
     */
    $(".spider-btn img").on("click", function() {
        openSpiderURL("", true);
    });

    /**
     * @since 2023-05-15 监听其他搜索图标
     */
    $(".search-tip li").on("click", function() {
        openSpiderURL(this.id, false);
    });

    /**
     * @since 2023-05-11 监听搜索框回车按键
     */
    $("#search-word").keydown(function(event) {
        if (event.keyCode == 13) {
            openSpiderURL("", false);
        }
    });

    /**
     * @since 2023-05-15 光标定位文本框
     */
    $("#search-word").on("focus", function () {
        $(".search-tip").fadeIn("slow");
    });

    /**
     * @since 2023-05-11 光标离开
     */
    $("#search-word").on("blur", function () {
        setTimeout(function (){
            $(".search-tip").fadeOut("slow");
        }, 300);
    });
}

/**
 * @since 2023-05-15 获取搜索引擎名称
 */
function getSpider(){
    /**
     * @since 2023-05-15 读取缓存
     */
    let key = "bookmark-spider";
    let spider = localStorage.getItem(key);

    /**
     * @since 2023-05-15 默认bing
     */
    if(chrome.i18n.getMessage(spider) == ""){
        spider = "bing";
    } else {}
    let spiderObj = {"spider":spider, "url":chrome.i18n.getMessage(spider +"_url"), "urlSearch":chrome.i18n.getMessage(spider +"_search_url")};

    /**
     * @return
     */
    return spiderObj;
}

/**
 * @since 2023-05-15 设置搜索引擎
 */
function setSpider(spider){
    let key = "bookmark-spider";

    /**
     * @since 2023-05-12 更新缓存
     */
    localStorage.setItem(key, spider);

    /**
     * @return
     */
    return getSpider();
}

/**
 * @since 2023-05-11 打开搜索页面
 */
function openSpiderURL(spider, jump){
    /**
     * @since 2023-05-12 无指定搜索引擎
     */
    let spiderObj = {};
    if (spider == ""){
        /**
         * @since 2023-05-12 读取缓存
         */
        spiderObj = getSpider();
    } else {
        /**
         * @since 2023-05-12 更新缓存
         */
        spiderObj = setSpider(spider);
    }

    /**
     * @since 2023-05-15 修改图片
     */
    $(".spider-btn img").attr("src", "image/"+ spiderObj.spider +"_128.png");

    /**
     * @since 2023-05-11 关键词为空
     */
    let searchWord = $("#search-word").val();
    if(searchWord == ""){
        if(!jump){
            /**
             * @since 2023-05-11 不跳转，光标离开事件或点击图标，选择搜索引擎
             */
            return false;
        } else {
            /**
             * @since 2023-05-11 访问主页
             */
            let url = spiderObj.url;
            window.open(url);
        }
    } else {
        /**
         * @since 2023-05-11 打开搜索
         */
        let url = spiderObj.urlSearch + encodeURIComponent(searchWord);
        window.open(url);
    }
}

/**
 * @since 2023-05-09 处理书签
 */
function processNode(node) {
    let barArray = new Array();
    let folderArray = new Array();

    for(let key in node){
        if(node[key].url){
            barArray.push(formatData(node[key]));
        } else {
            let title = node[key].title;
            folderArray[title] = processNodeChild(node[key].children);
        }
    }

    /**
     * @since 2023-05-09 渲染数据模板
     */
    _mainTemplateHtml_ = $("#main").prop("outerHTML");
    _bookmarkTemplateHtml_ = $("#bookmark").html();
    $("#main").hide();

    /**
     * @since 2023-05-10 书签栏增加额外
     */
    barArray = improveChromeBookmark(barArray);

    /**
     * @since 2023-05-10 固定书签栏
     */
    addBookmark('', barArray);

    /**
     * @since 2023-05-10 其他书签文件夹
     */
    for(let title in folderArray){
        addBookmark(title, folderArray[title]);
    }

    /**
     * @since 2023-05-10 监听a标签点击
     */
    $("#main a").on("click", function() {
        url = this.href;
        if(url.substr(0, 4) == "http"){
            return true;
        } else {
            chrome.tabs.create({ url: url });
            return false;
        }
    });

    /**
     * @since 2023-05-16 鼠标放上，修改背景图突出
     */
    $("#main li").hover(function() {
        $(this).css("background-color","#e0ffff");

        /**
         * @since 2023-05-24 显示完整的文字信息
         */
        $(this).find("div:eq(0)").css("display", "none");
        $(this).find("div:eq(1)").css("height", "52px");
    }, function (){
        $(this).css("background-color","white");

        $(this).find("div:eq(1)").css("height", "20px");
        $(this).find("div:eq(0)").css("display", "");
    });


    $("#bookmark").sortable({
        revert: true
    });
    $("ul, li").disableSelection();

    /**
     * @since 2023-05-12 显示书签和底部
     */
    $("#container").show();
    $(".foot").show();
}

/**
 * @since 2023-05-09 处理书签栏的文件夹
 */
function processNodeChild(node) {
    let barArray = new Array();

    for(let key in node){
        if(node[key].url){
            barArray.push(formatData(node[key]));
        } else {
            /**
             * @since 2023-05-09 二级文件夹不再处理
             */
        }
    }

    return barArray;
}

/**
 * @since 2023-05-09 格式化数据
 */
function formatData(node){
    let data = new Array();
    let url = node.url;
    data.title = node.title;
    data.url = url;

    /**
     * @since 2023-05-09 处理图标
     * @since 2023-05-10 获取网站的favicon
     */
    if (url == "edge://settings/clearBrowserData"){
        data.icon = "image/clear_128.png";
    } else {
        const chromeURL = new URL(chrome.runtime.getURL("/_favicon/"));
        chromeURL.searchParams.set("pageUrl",url);
        chromeURL.searchParams.set("size", "32");
        data.icon = chromeURL.toString();
    }

    return data;
}

/**
 * @since 2023-05-10 添加书签展现html
 */
function addBookmark(groupName, bookmarkArray){
    /**
     * @since 2023-05-10 书签列表
     */
    let bookmarkHtmlArray = new Array();
    for(let key in bookmarkArray){
        let bookmarkHtml = _bookmarkTemplateHtml_.replace(new RegExp("{\\$url}", "g"), bookmarkArray[key].url);
        bookmarkHtml = bookmarkHtml.replace(new RegExp("{\\$icon}", "g"), bookmarkArray[key].icon);
        bookmarkHtml = bookmarkHtml.replace(new RegExp("{\\$title}", "g"), bookmarkArray[key].title);
        bookmarkHtml = bookmarkHtml.replace('[img', '<img');
        bookmarkHtml = bookmarkHtml.replace(']</div>', '></div>');
        bookmarkHtmlArray.push(bookmarkHtml);
    }
    html = bookmarkHtmlArray.join('');

    /**
     * @since 2023-05-10 添加html
     */
    let mainHtml = _mainTemplateHtml_.replace(_bookmarkTemplateHtml_, html);
    mainHtml = mainHtml.replace('<h4>{$groupName}</h4>', "<h4>"+ groupName +"</h4>");
    $("#container").append(mainHtml);
}

/**
 * @since 2023-05-10 增加Chrome浏览器系统地址
 */
function improveChromeBookmark(bookmarkArray){
    let chromeArray = new Array(
        {
                title: chrome.i18n.getMessage("extension_store"),
                url: chrome.i18n.getMessage("extension_store_url")
            },
            {
                title: chrome.i18n.getMessage("extension"),
                url: 'edge://extensions/'
            },
            {
                title: chrome.i18n.getMessage("favorites"),
                url: 'edge://favorites/'
            },
            {
                title: chrome.i18n.getMessage("apps"),
                url: 'edge://apps/'
            },
            {
                title: chrome.i18n.getMessage("settings"),
                url: 'edge://settings/profiles'
            },
            {
                title: chrome.i18n.getMessage("downloads"),
                url: 'edge://downloads/all'
            },
            {
                title: chrome.i18n.getMessage("history"),
                url: 'edge://history/all'
            },
            {
                title: chrome.i18n.getMessage("clear_browser_data"),
                url: 'edge://settings/clearBrowserData'
            },
            {
                title: chrome.i18n.getMessage("version"),
                url: 'edge://version'
            }
    );

    for(let i=0; i<chromeArray.length; i=i+1){
        bookmarkArray.push(formatData(chromeArray[i]));
    }

    return bookmarkArray;
}