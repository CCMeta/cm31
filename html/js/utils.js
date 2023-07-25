let sessionCookie;
function get_post_data_string(postData) {
    var str = "";
    for(var prop in postData){
        str += prop + "=" + postData[prop] + "&"
    }
    return str;
}
function createXmlHttp() {
    if (window.XMLHttpRequest) {// code for IE7+, Firefox, Chrome, Opera, Safari
        return new XMLHttpRequest();
    } else {// code for IE6, IE5
        return new ActiveXObject("Microsoft.XMLHTTP");
    }
}
function XmlAjax(parma = {}) {
    let xmlHttp = createXmlHttp();
    let postData;
    if (parma.url) {
        xmlHttp.onreadystatechange = function () {
            if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
                if (parma.success) {
                    parma.success(xmlHttp.responseText)
                }
            } else if (xmlHttp.status === 404) {
                console.warning("请求页面不存在！");
            }
        }
        if (parma.data) {
            postData = get_post_data_string(parma.data);
        }
        xmlHttp.open("POST", parma.url, true);
        xmlHttp.send(postData);
    } else {
        parma.error();
    }
}
//弹框功能
(function (define) {
    define(['jquery'], function ($) {
        return (function () {
            var $container;
            var listener;
            var toastId = 0;
            var toastType = {error: 'error', info: 'info', success: 'success', warning: 'warning'};
            var toastr = {clear: clear, remove: remove, error: error, getContainer: getContainer, info: info, options: {}, subscribe: subscribe, success: success, version: '2.1.4', warning: warning};
            var previousToast;
            return toastr;
            ////////////////
            function error(message, title, optionsOverride) {return notify({type: toastType.error, iconClass: getOptions().iconClasses.error, message: message, optionsOverride: optionsOverride, title: title});}
            function getContainer(options, create) {
                if (!options) { options = getOptions(); }
                $container = $('#' + options.containerId);
                if ($container.length) {return $container;}
                if (create) {$container = createContainer(options);}
                return $container;
            }
            function info(message, title, optionsOverride) {
                return notify({type: toastType.info, iconClass: getOptions().iconClasses.info, message: message, optionsOverride: optionsOverride, title: title});
            }
            function subscribe(callback) {listener = callback;}
            function success(message, title, optionsOverride) {
                return notify({type: toastType.success, iconClass: getOptions().iconClasses.success, message: message, optionsOverride: optionsOverride, title: title});
            }
            function warning(message, title, optionsOverride) {
                return notify({type: toastType.warning, iconClass: getOptions().iconClasses.warning, message: message, optionsOverride: optionsOverride, title: title});
            }
            function clear($toastElement, clearOptions) {
                var options = getOptions();
                if (!$container) { getContainer(options); }
                if (!clearToast($toastElement, options, clearOptions)) {clearContainer(options);}
            }
            function remove($toastElement) {
                var options = getOptions();
                if (!$container) { getContainer(options); }
                if ($toastElement && $(':focus', $toastElement).length === 0) {removeToast($toastElement);return;}
                if ($container.children().length) {$container.remove();}
            }
            // internal functions
            function clearContainer (options) {
                var toastsToClear = $container.children();
                for (var i = toastsToClear.length - 1; i >= 0; i--) {clearToast($(toastsToClear[i]), options);}
            }
            function clearToast ($toastElement, options, clearOptions) {
                var force = clearOptions && clearOptions.force ? clearOptions.force : false;
                if ($toastElement && (force || $(':focus', $toastElement).length === 0)) {
                    $toastElement[options.hideMethod]({
                        duration: options.hideDuration,
                        easing: options.hideEasing,
                        complete: function () { removeToast($toastElement); }
                    });
                    return true;
                }
                return false;
            }
            function createContainer(options) {
                $container = $('<div/>')
                    .attr('id', options.containerId)
                    .addClass(options.positionClass);
                $container.appendTo($(options.target));
                return $container;
            }
            function getDefaults() {
                return {
                    tapToDismiss: true,
                    toastClass: 'toast',
                    containerId: 'toast-container',
                    debug: false,
                    showMethod: 'fadeIn', //fadeIn, slideDown, and show are built into jQuery
                    showDuration: 300,
                    showEasing: 'swing', //swing and linear are built into jQuery
                    onShown: undefined,
                    hideMethod: 'fadeOut',
                    hideDuration: 1000,
                    hideEasing: 'swing',
                    onHidden: undefined,
                    closeMethod: false,
                    closeDuration: false,
                    closeEasing: false,
                    closeOnHover: true,
                    // extendedTimeOut: 1000,
                    extendedTimeOut: 800,
                    iconClasses: {error: 'toast-error', info: 'toast-info', success: 'toast-success', warning: 'toast-warning'},
                    iconClass: 'toast-info',
                    positionClass: 'toast-top-right',
                    timeOut: 5000, // Set timeOut and extendedTimeOut to 0 to make it sticky
                    titleClass: 'toast-title',
                    messageClass: 'toast-message',
                    escapeHtml: false,
                    target: 'body',
                    closeHtml: '<button type="button">&times;</button>',
                    closeClass: 'toast-close-button',
                    newestOnTop: true,
                    preventDuplicates: false,
                    progressBar: false,
                    progressClass: 'toast-progress',
                    rtl: false
                };
            }
            function publish(args) {
                if (!listener) { return; }
                listener(args);
            }
            function notify(map) {
                var options = getOptions();
                var iconClass = map.iconClass || options.iconClass;
                if (typeof (map.optionsOverride) !== 'undefined') {options = $.extend(options, map.optionsOverride);iconClass = map.optionsOverride.iconClass || iconClass;}
                if (shouldExit(options, map)) { return; }
                toastId++;
                $container = getContainer(options, true);
                var intervalId = null;
                var $toastElement = $('<div/>');
                var $titleElement = $('<div/>');
                var $messageElement = $('<div/>');
                var $progressElement = $('<div/>');
                var $closeElement = $(options.closeHtml);
                var progressBar = {intervalId: null, hideEta: null, maxHideTime: null};
                var response = {toastId: toastId, state: 'visible', startTime: new Date(), options: options, map: map};
                personalizeToast();
                displayToast();
                handleEvents();
                publish(response);
                if (options.debug && console) {console.log(response);}
                return $toastElement;
                function escapeHtml(source) {
                    if (source == null) {source = '';}
                    return source
                        .replace(/&/g, '&amp;')
                        .replace(/"/g, '&quot;')
                        .replace(/'/g, '&#39;')
                        .replace(/</g, '&lt;')
                        .replace(/>/g, '&gt;');
                }
                function personalizeToast() {
                    setIcon();
                    setTitle();
                    setMessage();
                    setCloseButton();
                    setProgressBar();
                    setRTL();
                    setSequence();
                    setAria();
                }
                function setAria() {
                    var ariaValue = '';
                    switch (map.iconClass) {
                        case 'toast-success':
                        case 'toast-info':ariaValue =  'polite';break;
                        default:ariaValue = 'assertive';
                    }
                    $toastElement.attr('aria-live', ariaValue);
                }
                function handleEvents() {
                    if (options.closeOnHover) {$toastElement.hover(stickAround, delayedHideToast);}
                    if (!options.onclick && options.tapToDismiss) {$toastElement.click(hideToast);}
                    if (options.closeButton && $closeElement) {
                        $closeElement.click(function (event) {
                            if (event.stopPropagation) {event.stopPropagation();}
                            else if (event.cancelBubble !== undefined && event.cancelBubble !== true) {event.cancelBubble = true;}
                            if (options.onCloseClick) {options.onCloseClick(event);}
                            hideToast(true);
                        });
                    }
                    if (options.onclick) {
                        $toastElement.click(function (event) {options.onclick(event);hideToast();});
                    }
                }
                function displayToast() {
                    $toastElement.hide();
                    $toastElement[options.showMethod](
                        {duration: options.showDuration, easing: options.showEasing, complete: options.onShown}
                    );
                    if (options.timeOut > 0) {
                        intervalId = setTimeout(hideToast, options.timeOut);
                        progressBar.maxHideTime = parseFloat(options.timeOut);
                        progressBar.hideEta = new Date().getTime() + progressBar.maxHideTime;
                        if (options.progressBar) {progressBar.intervalId = setInterval(updateProgress, 10);}
                    }
                }
                function setIcon() {if (map.iconClass) {$toastElement.addClass(options.toastClass).addClass(iconClass);}}
                function setSequence() {if (options.newestOnTop) {$container.prepend($toastElement);} else {$container.append($toastElement);}}
                function setTitle() {
                    if (map.title) {
                        var suffix = map.title;
                        if (options.escapeHtml) {suffix = escapeHtml(map.title);}
                        $titleElement.append(suffix).addClass(options.titleClass);
                        $toastElement.append($titleElement);
                    }
                }
                function setMessage() {
                    if (map.message) {
                        var suffix = map.message;
                        if (options.escapeHtml) {suffix = escapeHtml(map.message);}
                        $messageElement.append(suffix).addClass(options.messageClass);
                        $toastElement.append($messageElement);
                    }
                }
                function setCloseButton() {if (options.closeButton) {$closeElement.addClass(options.closeClass).attr('role', 'button');$toastElement.prepend($closeElement);}}
                function setProgressBar() {if (options.progressBar) {$progressElement.addClass(options.progressClass);$toastElement.prepend($progressElement);}}
                function setRTL() {if (options.rtl) {$toastElement.addClass('rtl');}}
                function shouldExit(options, map) {
                    if (options.preventDuplicates) {if (map.message === previousToast) {return true;} else {previousToast = map.message;}}
                    return false;
                }
                function hideToast(override) {
                    var method = override && options.closeMethod !== false ? options.closeMethod : options.hideMethod;
                    var duration = override && options.closeDuration !== false ? options.closeDuration : options.hideDuration;
                    var easing = override && options.closeEasing !== false ? options.closeEasing : options.hideEasing;
                    if ($(':focus', $toastElement).length && !override) {return;}
                    clearTimeout(progressBar.intervalId);
                    return $toastElement[method]({
                        duration: duration,
                        easing: easing,
                        complete: function () {
                            removeToast($toastElement);
                            clearTimeout(intervalId);
                            if (options.onHidden && response.state !== 'hidden') {options.onHidden();}
                            response.state = 'hidden';
                            response.endTime = new Date();
                            publish(response);
                        }
                    });
                }
                function delayedHideToast() {
                    if (options.timeOut > 0 || options.extendedTimeOut > 0) {
                        intervalId = setTimeout(hideToast, options.extendedTimeOut);
                        progressBar.maxHideTime = parseFloat(options.extendedTimeOut);
                        progressBar.hideEta = new Date().getTime() + progressBar.maxHideTime;
                    }
                }
                function stickAround() {
                    clearTimeout(intervalId);
                    progressBar.hideEta = 0;
                    $toastElement.stop(true, true)[options.showMethod]({duration: options.showDuration, easing: options.showEasing});
                }
                function updateProgress() {
                    var percentage = ((progressBar.hideEta - (new Date().getTime())) / progressBar.maxHideTime) * 100;
                    $progressElement.width(percentage + '%');
                }
            }
            function getOptions() {return $.extend({}, getDefaults(), toastr.options);}
            function removeToast($toastElement) {
                if (!$container) { $container = getContainer(); }
                if ($toastElement.is(':visible')) {return;}
                $toastElement.remove();
                $toastElement = null;
                if ($container.children().length === 0) {$container.remove();previousToast = undefined;}
            }
        })();
    });
}(typeof define === 'function' && define.amd ? define : function (deps, factory) {
    if (typeof module !== 'undefined' && module.exports) { //Node
        module.exports = factory(require('jquery'));
    } else {
        window.toastr = factory(window.jQuery);
    }
}));
//屏蔽所有输出
let console = {};
console.log = function () {}
//输入框禁止记忆功能
$("body input").attr("autocomplete", "off");
//切换语言动画效果
let lang_num = {"FR": "208", "ES": "214", "EN": "1"};
let num_lang = {"208": "FR", "214": "ES", "1": "EN"};
let activeDom, bat_svg=$("#battery");
$(document).on("mouseenter", ".lang-active", function () {
    activeDom = $(".lang-active");
    let hides = $(".lang-hide");
    for(let h=0;h<hides.length;h++){let item = hides[h];$(item).remove();$(".btn-group-vertical").append(item);}
    $(".btn-group-vertical button").removeClass("lang-hide").removeClass("lang-active").addClass("drop-lang-show");
    $(".btn-group-vertical").addClass("drop-show");
})
$(document).on("mouseleave", ".drop-show", function () {
    $(".drop-lang-show").removeClass("drop-lang-show").addClass("lang-hide");
    $(activeDom).removeClass("lang-hide").addClass("lang-active");
    $(".btn-group-vertical").removeClass("drop-show");
})
$(document).on("click", ".drop-lang-show", function () {
    $(".drop-lang-show").removeClass("drop-lang-show").addClass("lang-hide");
    $(this).removeClass("lang-hide").addClass("lang-active");
    $(".btn-group-vertical").removeClass("drop-show");
    let text = this.innerText;
    XmlAjax({
        url: "/api/set_web_language",
        data:{"set_web_language": lang_num[text]},
        success: function (result) {
            console.log("setLanguageResult:" + result);
            let data = JSON.parse(result);
            if(data.result == "ok") {
                var sessionCool;
                const cookieArray = document.cookie.split("; ");
                console.log(cookieArray)
                for (let i = 0; i < cookieArray.length; i++) {
                    const languageKeyValuePair = cookieArray[i].split('=')
                    console.log(languageKeyValuePair)
                    if(languageKeyValuePair[0]=='SessionId'){
                        console.log("Get and set SessionId*******++++++++")
                        sessionCool = languageKeyValuePair[1];
                        // document.cookie = 'SessionId=' + languageKeyValuePair[1];
                    }
                }
                document.cookie = 'path="/"';
                document.cookie = 'SessionId=0000001';
                document.cookie = 'language=' + text.toLowerCase();
                document.cookie = 'SessionId=' + sessionCool;
                languageSelect(text.toLowerCase());
            } else {
                toastr.error("Set language error");
            }
        }
    })
})
function switchLanguageToSet() {
    // do cookie before onload start
    let current_language = 'en'
    let cookieArray = document.cookie.split("; ");
    for (let i = 0; i < cookieArray.length; i++) {
        const languageKeyValuePair = cookieArray[i].split('=')
        if(languageKeyValuePair[0]=='language'){
            current_language = languageKeyValuePair[1]
        }
    }
    // do i18n
    $(".btn-group-vertical button").each(function (index, element) {
        if($(element).text() == current_language.toUpperCase()) {
            $(element).removeClass("lang-hide").addClass("lang-active");
        } else {
            $(element).removeClass("lang-active").addClass("lang-hide");
        }
    })
    //获取到了语言数字代码，可以得到语言对应的文本
    //遍历button，把类为lang-active的button的文本改为语言的名字，把lang-hide的button的文本改为剩下两种语言的文本
    languageSelect(current_language);
    // do cookie before onload end
}
//显示电量动画效果
$(document).on("mouseenter", ".bat-active", function () {
    console.log($(this));
    bat_svg.removeClass("img-fluid").addClass("img-fluid1");
    $(".bat-hide").removeClass("bat-hide").addClass("bat-show");
    $(".btn-group-vertical1").addClass("btn-bat-show");
})
$(document).on("mouseleave",".btn-bat-show",function () {
    bat_svg.removeClass("img-fluid1").addClass("img-fluid");
    $(".bat-show").removeClass("bat-show").addClass("bat-hide");
    $(".btn-group-vertical1").removeClass("btn-bat-show");
})

/*add [1.添加mobile network advance 点击上方栏 整个弹窗消失动作] jwy 20220524 start*/
$(".modal-header").on("click", function (){
    $('.modal').modal('hide');
})
/*add [1.添加mobile network advance 点击上方栏 整个弹窗消失动作] jwy 20220524 end*/

//获取电量
function getBattery(postURL) {
    XmlAjax({
        url: "/api/navtop_info",
        data: {"navtop_info": 0},
        success: function (result) {
            console.log("navtopResult:" + result);
            let data = JSON.parse(result);
            if(data.result === "ok") {
                //设置电量图标
                let bat = data.batteryRemain * 1;
                $("#battery").find("path").eq(1).attr("d", "M2 6h" + bat/10.00  + "v4H2V6z");
                $("#batteryNumber").html(bat + "%");
                // add 对信息内存，以及流量阈值进行判断 llh 20220620 start
                //设置SMS内存标志位
                localStorage.setItem("smsStorage",data.isSMSFull);
                //获取阈值信息
                let totalFlow = data.total_send * 1 + data.total_recv * 1 + data.cur_send * 1 + data.cur_recv * 1;
                localStorage.setItem("totalFlow", totalFlow);
                localStorage.setItem("FlowPercent", data.threshold_percent);
                // add 对信息内存，以及流量阈值进行判断 llh 20220620 end
            } else {
                $("#battery").find("path").eq(1).remove();
                let line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
                line.setAttribute("path", "<path stroke=\"null\" d=\"m5.00017,6.3833a0.1838,0.17271 0 0 0 0.1869,0.18l0.63981,0c0.10702,0 0.19233,-0.08235 0.20629,-0.18219c0.0698,-0.47806 0.41878,-0.8264 1.04075,-0.8264c0.53201,0 1.01904,0.24996 1.01904,0.85117c0,0.46275 -0.29005,0.67555 -0.74838,0.99911c-0.52193,0.35636 -0.93528,0.77247 -0.90581,1.44802l0.00233,0.15814a0.19388,0.18219 0 0 0 0.19388,0.17927l0.62895,0a0.19388,0.18219 0 0 0 0.19388,-0.18219l0,-0.07652c0,-0.52324 0.21172,-0.67555 0.78328,-1.08292c0.47229,-0.33741 0.96475,-0.71198 0.96475,-1.4983c0,-1.10113 -0.98957,-1.63312 -2.07297,-1.63312c-0.98259,0 -2.05901,0.42996 -2.13269,1.66591zm1.20749,4.19976c0,0.38842 0.3296,0.67555 0.78328,0.67555c0.47229,0 0.79724,-0.28713 0.79724,-0.67555c0,-0.40227 -0.32572,-0.68502 -0.79801,-0.68502c-0.4529,0 -0.7825,0.28275 -0.7825,0.68502z\"/>")
                document.getElementById("batteryNumber").innerHTML = "";
            }
        },
        error: function () {
            $("#battery").find("path").eq(1).remove();
            let line = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            line.setAttribute("path", "<path stroke=\"null\" d=\"m5.00017,6.3833a0.1838,0.17271 0 0 0 0.1869,0.18l0.63981,0c0.10702,0 0.19233,-0.08235 0.20629,-0.18219c0.0698,-0.47806 0.41878,-0.8264 1.04075,-0.8264c0.53201,0 1.01904,0.24996 1.01904,0.85117c0,0.46275 -0.29005,0.67555 -0.74838,0.99911c-0.52193,0.35636 -0.93528,0.77247 -0.90581,1.44802l0.00233,0.15814a0.19388,0.18219 0 0 0 0.19388,0.17927l0.62895,0a0.19388,0.18219 0 0 0 0.19388,-0.18219l0,-0.07652c0,-0.52324 0.21172,-0.67555 0.78328,-1.08292c0.47229,-0.33741 0.96475,-0.71198 0.96475,-1.4983c0,-1.10113 -0.98957,-1.63312 -2.07297,-1.63312c-0.98259,0 -2.05901,0.42996 -2.13269,1.66591zm1.20749,4.19976c0,0.38842 0.3296,0.67555 0.78328,0.67555c0.47229,0 0.79724,-0.28713 0.79724,-0.67555c0,-0.40227 -0.32572,-0.68502 -0.79801,-0.68502c-0.4529,0 -0.7825,0.28275 -0.7825,0.68502z\"/>")
            document.getElementById("batteryNumber").innerHTML = "";
        }
    })
}
//编码转换
var string2Unicode = function(str) {
    var arr;
    var unicode = [];
    //last character is '.', remove it
    if (str.lastIndexOf(".") === str.length - 1) {str = str.substring(0, str.lastIndexOf("."));}
    arr = str.split(".");
    for (var i = 0; i < arr.length; i++) {unicode += String.fromCharCode("0x" + arr[i]);}
    return unicode;
}
function unicode2String(unicode) {
    var arr = [];
    for (var i = 0; i < unicode.length; i++) {arr.push(unicode.charCodeAt(i).toString(16));}
    return arr.join(".");
}
//语言切换功能
(function($) {
    $.fn.extend({
        i18n: function(options) {
            var defaults = {lang: "", defaultLang: "", filePath: "/i18n/", filePrefix: "i18n_", fileSuffix: "", forever: true, callback: function() {}};
            function getCookie(name) {
                var arr = document.cookie.split('; ');
                for (var i = 0; i < arr.length; i++) {
                    var arr1 = arr[i].split('=');
                    if (arr1[0] === name) {return arr1[1];}
                }
                return '';
            }
            function setCookie(name, value, myDay) {var oDate = new Date();oDate.setDate(oDate.getDate() + myDay);document.cookie = name + '=' + value + '; expires=' + oDate;}
            var options = $.extend(defaults, options);
            if (getCookie('i18n_lang') !== "" && getCookie('i18n_lang') !== "undefined" && getCookie('i18n_lang') != null) {defaults.defaultLang = getCookie('i18n_lang');}
            else if (options.lang === "" && defaults.defaultLang === "") {throw "defaultLang must not be null !";}
            if (options.lang != null && options.lang !== "") {if (options.forever) {setCookie('i18n_lang', options.lang);} else {$.removeCookie("i18n_lang");}} else {options.lang = defaults.defaultLang;}
            var i = this;
            $.getJSON(options.filePath + options.filePrefix + options.lang + options.fileSuffix + ".json", function(data) {
                var i18nLang = {};if (data != null) {i18nLang = data;}
                $(i).each(function(i) {
                    var i18nOnly = $(this).attr("i18n-only");
                    if ($(this).val() != null && $(this).val() != "") {if (i18nOnly == null || i18nOnly == undefined || i18nOnly == "" || i18nOnly == "value") {$(this).val(i18nLang[$(this).attr("i18n")])}}
                    if ($(this).html() != null && $(this).html() != "") {if (i18nOnly == null || i18nOnly == undefined || i18nOnly == "" || i18nOnly == "html") {$(this).html(i18nLang[$(this).attr("i18n")])}}
                    if ($(this).attr('placeholder') != null && $(this).attr('placeholder') != "") {if (i18nOnly == null || i18nOnly == undefined || i18nOnly == "" || i18nOnly == "placeholder") {$(this).attr('placeholder', i18nLang[$(this).attr("i18n")])}}
                });
                options.callback();
            });
        }
    });
})(jQuery);
//设置语言
function languageSelect(defaultLang){
    $("[i18n]").i18n({
        defaultLang: defaultLang,
        filePath: "../language/",
        filePrefix: "i18n_",
        fileSuffix: "",
        forever: true,
        callback: function(res) {}
    });
}
//输入框添加长度限制
$("input").attr("oninput", "if(value.length>32) value=value.slice(0,32)");
//监听模态框滚动事件
$(".modal-body").scroll(function () {
    let viewH = $(this).height();
    let contentH = $(this).get(0).scrollHeight;
    let scrollTop = $(this).scrollTop();
    if(scrollTop === 0) {
        //移除阴影
        $(this).prev().removeClass("modal-header-shadow");
    } else if(scrollTop <= (contentH - viewH)) {
        //添加阴影
        $(this).prev().addClass("modal-header-shadow");
    }
})
//重写选择框方法
function showAndHideUL(obj, key) {
    if($(obj).next().css("display") == 'none' && key) {

    } else {
        if($(obj).next().css("display") == 'block') {
            $(obj).next().css("display", "none");
        } else{
            $(obj).next().css("display", "block");
        }
    }
}
$(document).on("mousedown", ".select-container ul li", function () {
    $(this).parent().prev().val(this.innerText);
    $(this).parent().prev().attr("data-value", $($(this).children("a").get(0)).data("value"));
    $(this).parent().prev().trigger("change");
})
