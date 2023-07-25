let $netTip1 = $("#netTip1"), $netTip2 = $("#netTip2"), simStatus = 1;
/*模态框弹出背景模糊效果*/
let $main = $(".main");
$(".modal").on("shown.bs.modal", function () { $main.addClass("blur"); })
$(".modal").on("hidden.bs.modal", function () { $main.removeClass("blur"); })
/*DNS开启、关闭按钮动画  DHCP Server开启关闭时动画*/
let $dns_switch = $("#dns_switch"), $primaryDNS = $("#primaryDNS"), $secDNS = $("#secDNS");
let $dhcp_switch = $("#dhcp_switch"), $dhcp_addr1 = $("#dhcp_addr1"), $dhcp_addr2 = $("#dhcp_addr2"), $dhcp_select = $("#dhcp_select");
$dns_switch.on("change", function () { checkDNS(); })
function checkDNS() { if ($dns_switch.prop("checked")) { $(".dns").css("visibility", "visible"); } else { $(".dns").css("visibility", "hidden"); } }
let t1, $MobileModal = $("#mobileModal");
//modify for DHCP Setting luolihua 20220527 start
//提交DHCP时弹出新的模态框提示
$("#tips").on("click", function () {
    if ($("#dhcp_addr1").val() === "" || $("#dhcp_addr1").val() === null || $("#dhcp_addr2").val() === "" || $("#dhcp_addr2").val() === null) {
        toastr.error($("#net-tip3").html());
    } else if ($("#dhcp_addr1").val() * 1 >= $("#dhcp_addr2").val() * 1) {
        toastr.error($("#net-tip4").html());
    } else {
        $("#dhcpTipModal").modal("show");
        $("#dhcpModal").addClass("blur1");
    }
})
//modify for DHCP Setting luolihua 20220527 end
$("#rebootTipModal,#dhcpTipModal").on("show.bs.modal", function () { $("#dhcpModal").addClass("blur1"); })
$("#rebootTipModal,#dhcpTipModal").on("hidden.bs.modal", function () { $("#dhcpModal").removeClass("blur1"); $(".main").addClass("blur"); })
//modify modal show llh 20220601 start
$("#delThrModal,#setThrModal").on("show.bs.modal", function () { $("#mobileModal").css("display", "none"); })
$("#delThrModal,#setThrModal").on("hidden.bs.modal", function () { $("#mobileModal").css("display", "block"); $(".main").addClass("blur"); })
//modify modal show llh 20220601 end
// //弹框时先加载静态信息
window.onload = function () {
    if (localStorage.getItem("pin") === "lock") { window.location.href = "login.html"; }
    else {/**getLanguage('main.html');**/getBattery("/main.html"); GetConnectDevice(); GetNetwork();/**getDNS();**/ }
}
//弹出MobileNetwork页面时获取信息,定时获取上传、下载速度以及信号强度
$MobileModal.on("show.bs.modal", function () {
    GetNetwork(); GetNetworkSettings(); openMobileNetwork(); getConnectionMode();
    setTimeout(function () { getDataThreshold(); }, 300);
    t1 = setInterval(openMobileNetwork, 3000);
})
$MobileModal.on("hidden.bs.modal", function () { clearInterval(t1); clearInterval(t2); })
//关闭Configuration页面时更新信息
// $("#configModal").on("hide.bs.modal",function () {GetNetworkConfig();getDNS();/**checkDNS();**/})
//关闭LocalNetwork页面时更新信息
$("#localModal").on("hide.bs.modal", function () { GetConnectDevice(); })
//弹出DHCP页面时获取信息
$("#dhcpModal").on("show.bs.modal", function () { GetDHCP(); })

/*add [1.添加connection mode 点击消失开启动作 2、添加按钮动态效果] jwy 20220513
       [3.切换到auto时，停止搜索网络 4.更改按钮监听事件写法] llh start*/
$("#connectSelect").on("change", function () {
    if ($("#connectSelect").val() === "Manual") {
        $("#connectionModeDialog").css("display", "block");
        startSearchNetwork();
    } else {
        stopSearchNetwork();
        $(".connectionRefresh").css("visibility", "hidden");
        $("#connectionModeDialog").css("display", "none");
    }
})
$(document).on("click", '.connectionModeSettings > button', function () {
    $(this).addClass("buttonSwitch").siblings().removeClass('buttonSwitch');
})
/*add [1.添加connection mode 点击消失开启动作] jwy 20220513 end*/

/*add for dataThreshold llh 20220601 start*/
$("#threshold_switch").on("change", function () {
    if ($(this).prop("checked")) { $(".dataThr-tr").css("display", "table-row"); } else { $(".dataThr-tr").css("display", "none"); }
})
/*add for dataThreshold llh 20220601 end*/
//获取网络名称、信号强度、网络类型
let $strength2 = $(".strength2"), $strength3 = $(".strength3"), $strengthText = $("#strengthText");
let global_cur_send,global_cur_recv
function openMobileNetwork() { 
    // GetNetworkSpeed(); 
    GetNetwork(); 
    getThr(); 
}
//未插卡则提示
function mobileCheck() { if (simStatus === 1) { $MobileModal.modal("show"); } else { $("#simTipModal").modal("show"); } }
function GetNetwork() {
    XmlAjax({
        url: "/api/network_info",
        data: { "network_info": 0 },
        success: function (result) {
            console.log("networkResult:" + result);
            let data = JSON.parse(result);
            if (data.result === "ok") {
                $('#operatorName').html(data.networkName);
                $('#lte').html(data.networkType);
                if (data.simStatus === false) {
                    $('#simStatus').html("Off");
                    $('#simStatusSvg').css("fill", "grey");
                } else {
                    $('#simStatus').html("On");
                    $('#simStatusSvg').css("fill", "#80FF00");
                }
                switch (data.signalStrength) {
                    case "0": $strength2.css('fill', '#ed9e40'); $strength3.css('fill', '#ed9e40'); $strengthText.text('0'); break;
                    case "1": $strength2.css('fill', '#ed9e40'); $strength3.css('fill', '#ed9e40'); $strengthText.text('1'); break;
                    case "2": $strength2.css('fill', '#90ea42'); $strength3.css('fill', '#90ea42'); $strengthText.text('2'); break;
                    case "3": $strength2.css('fill', '#90ea42'); $strength3.css('fill', '#90ea42'); $strengthText.text('3'); break;
                    case "4": $strength2.css('fill', '#20E264'); $strength3.css('fill', '#20e264'); $strengthText.text('4'); break;
                    case "5": $strength2.css('fill', '#20E264'); $strength3.css('fill', '#20e264'); $strengthText.text('5'); break;
                    default: break;
                }
                data.signalStrength = parseInt(data.signalStrength)
                $strengthText.text(data.signalStrength > -75 ? 5 : data.signalStrength > -85 ? 4 : data.signalStrength > -95 ? 3 : data.signalStrength > -99 ? 2 : 1);
                if (data.simStatusInfo === "No SIM") { simStatus = 0; }
            }
        },
        error: function () { toastr.error($("#net-tip2").html()); }
    });
}
//获取上传和下载速度
function GetNetworkSpeed() {
    XmlAjax({
        url: "/api/network_speed",
        data: { "network_speed": 0 },
        success: function (result) {
            console.log("speedResult:" + result);
            let data = JSON.parse(result);
            // let upload = (data.upload*1.0/100).toFixed(2);
            // let download = (data.download*1.0/100).toFixed(2);
            if (data.result === "ok") {
                let upload = SpeedCal(data.upload), download = SpeedCal(data.download);
                $("#upSpeed").html(upload[0]); $("#upUnit").html(upload[1]);
                $("#downSpeed").html(download[0]); $("#downUnit").html(download[1]);
            }
        },
        error: function () { toastr.error($("#net-tip2").html()); }
    })
}
//处理速度
function SpeedCal(speed) {
    let finalSpeed, units;
    speed = speed * 1;
    if (!speed || speed === 0) return [0, 'B/S'];
    const unit = 1024;
    const sizes = ['B/S', 'KB/S', 'MB/S', 'GB/S', 'TB/S', 'PB/S', 'EB/S', 'ZB/S', 'YB/S'];
    const times = Math.floor(Math.log(speed * 10) / Math.log(unit));
    finalSpeed = (speed / Math.pow(unit, times)).toFixed(2);
    units = sizes[times + sizes.indexOf('B/S')];
    return [finalSpeed, units];
}
function ThreCal(speed) {
    let finalSpeed, units;
    speed = speed * 1;
    if (!speed || speed === 0) return [0, 'B'];
    const unit = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
    const times = Math.floor(Math.log(speed * 10) / Math.log(unit));
    finalSpeed = (speed / Math.pow(unit, times)).toFixed(2);
    units = sizes[times + sizes.indexOf('B')];
    return [finalSpeed, units];
}
//获取网络设置信息
let $dataSwitch = $('#data_switch'), $roamSwitch = $('#roam_switch'), $netSelect = $("#netSelect");
function GetNetworkSettings() {
    XmlAjax({
        url: "/api/network_setting",
        data: { "network_setting": 0 },
        success: function (result) {
            console.log("network_setting:" + result);
            let data = JSON.parse(result);
            if (data.result === "ok") {
                if (data.gprsStatus === "0") { $dataSwitch.prop('checked', false); } else { $dataSwitch.prop('checked', true); }
                if (data.roamingStatus === "0") { $roamSwitch.prop('checked', false); } else { $roamSwitch.prop('checked', true); }
                //redmine bug 140176 by luolihua 20220520 start
                if (data.networkMode === "0") { $netSelect.val("4G/3G"); $netSelect.attr("data-value", "0"); }
                else if (data.networkMode === "1") { $netSelect.val("4G"); $netSelect.attr("data-value", "1"); }
                else { $netSelect.val("3G"); $netSelect.attr("data-value", "2"); }
                //redmine bug 140176 by luolihua 20220520 end
            } else {
                toastr.error($("#net-tip2").html());
            }
        },
    })
}
//设置网络信息
/*modify for set button by llh 20220601 start*/
let dataThr = $("#threshold_switch"), dataThrList = $(".dataThr-tr"), $dataTime = $("#data-time"), $dataThrValue = $("#dataThrevalue");
let $totalValue = $("#totalValue"), $usedValue = $("#usedValue"), $dataDate = $("#dataDate"), $planData = $("#planData"), $dataUnit = $("#dataUnit"), usedThreshold;
let networkFlag = true, dataThresholdFlag = true, connectionFlag = true;
function setNetwork() {
    let mode = $("#connectSelect").val();
    let network = $(".buttonSwitch").data("index");
    if (mode === "Manual" && network === undefined && refreshFlag) {
        //选择手动模式，但是未选择网络
        toastr.error($("#net-tip5").html());
    } else {
        setOtherNetwork();
        //先停止搜索，避免出错
        XmlAjax({
            url: "/api/abort_search_network",
            data: { "abort_search_network": "1" },
            success: function (result) {
                console.log("StopSearchNetworkResult:\n" + result);
                let data = JSON.parse(result);
                console.log("Stop search network and set network");
                setTimeout(function () {
                    if (networkFlag && dataThresholdFlag && connectionFlag) { toastr.success($("#net-tip1").html()); }
                    else {
                        if (!networkFlag) { toastr.error($("#net-tip6").html()); }
                        if (!dataThresholdFlag) { toastr.error($("#net-tip7").html()); }
                        if (!connectionFlag) { toastr.error($("#net-tip8").html()); }
                    }
                }, 1000);
            }
        })
    }
}
function setOtherNetwork() {
    //设置其他
    XmlAjax({
        url: "/api/set_network_config",
        data: { "set_network_config": JSON.stringify({ "gprsStatus": $dataSwitch.prop("checked") ? 1 : 0, "roamingStatus": $roamSwitch.prop("checked") ? 1 : 0, "networkMode": $netSelect.attr("data-value") }) },
        success: function (result) {
            console.log("network_setting:" + result);
            let data = JSON.parse(result);
            if (data.result !== "ok") { networkFlag = false }
            setTimeout(function () {
                if (networkFlag && dataThresholdFlag && connectionFlag) { toastr.success($("#net-tip1").html()); }
                else {
                    if (!networkFlag) { toastr.error($("#net-tip6").html()); }
                    if (!dataThresholdFlag) { toastr.error($("#net-tip7").html()); }
                    if (!connectionFlag) { toastr.error($("#net-tip8").html()); }
                }
            }, 1000);
        },
    })
    //设置阈值
    SetThreshold();
    //设置connection mode
    if (refreshFlag || $("#connectSelect").val() === "Auto") { setNetworkManual(); }
}
/*modify for set button by llh 20220601 end*/

//获取连接的设备
let $deviceTable = $("#deviceTable"), deviceList = [], nowPage, deviceListGroup = [];
$(".btnPage").mouseover(function () {
    $(this).children("svg").children("path").attr("stroke", "#4d68ee").attr("stroke-opacity", "1");
}).mouseout(function () {
    $(this).children("svg").children("path").attr("stroke", "#fff").attr("stroke-opacity", "0.3");
})
$("#prevDevice").on("click", function () {
    if (nowPage === 2) {
        nowPage = 1;
        changePageDevice(0);
    } else {
        toastr.error($("#net-tip12").html());
    }
})
$("#nextDevice").on("click", function () {
    if (nowPage === 1) {
        nowPage = 2;
        changePageDevice(1);
    } else {
        toastr.error($("#net-tip11").html());
    }

})
function GetConnectDevice() {
    deviceList = [];
    deviceListGroup = [];
    XmlAjax({
        url: "/api/connected_devices",
        data: { "connected_devices": 0 },
        success: function (result) {
            console.log("connected_device_Result:\n" + result);
            let data = JSON.parse(result);
            if (data.result === "ok") {
                $deviceTable.html("");
                let Num = data.totalNum * 1;
                if (Num === 0) {
                    for (let i = 0; i < 4; i++) { $deviceTable.append('<tr><td></td><td></td><td></td></tr>'); }
                } else {
                    //遍历获取设备的数量
                    data.devices.forEach(function (item) {
                        if (item.usbShare === "1") {
                            $("#usbTable").html("");
                            $("#usbTable").append('<tr><td>' + item.hostName + '</td><td>' + item.ip_addr + '</td><td>' + item.mac_addr + '</td></tr>');
                        } else {
                            deviceList.push(item);
                        }
                    })
                    for (let p = 0; p < deviceList.length; p += 4) {
                        deviceListGroup.push(deviceList.slice(p, p + 4));
                    }
                    console.log(deviceListGroup);
                    //填充表格
                    nowPage = 1;
                    changePageDevice(0);
                }
            }
        },
        error: function () {
            $("#usbTable").html("");
            $deviceTable.html("");
            for (let i = 0; i < 4; i++) { $deviceTable.append('<tr><td></td><td></td><td></td><td></td></tr>'); }
        }
    })
}
function changePageDevice(page) {
    $deviceTable.html("");
    if (deviceList.length <= 4) {
        //如果连接数量小于等于4
        $(".btnPage").css("visibility", "hidden");
        deviceList.forEach(function (item) {
            $deviceTable.append('<tr><td>' + item.hostName + '</td><td>' + item.ip_addr + '</td><td>' + item.mac_addr + '</td></tr>');
        })
        // for (let i = 0; i < (4 - deviceList.length); i++) {$deviceTable.append('<tr><td></td><td></td><td></td></tr>');}
    } else {
        //连接数量大于4
        $(".btnPage").css("visibility", "visible");
        for (let k = 0; k < deviceListGroup[page].length; k++) {
            let deviceGroup = deviceListGroup[page];
            $deviceTable.append('<tr><td>' + deviceGroup[k].hostName + '</td><td>' + deviceGroup[k].ip_addr + '</td><td>' + deviceGroup[k].mac_addr + '</td></tr>');
        }
    }
}
//获取DHCP信息
function GetDHCP() {
    XmlAjax({
        url: "/api/get_dhcp_setting",
        data: { "get_dhcp_setting": 0 },
        success: function (result) {
            console.log("dhcp_Result:\n" + result);
            let data = JSON.parse(result);
            if (data.dhcpStatus === "0") { $("#dhcp_switch").prop("checked", false); } else { $("#dhcp_switch").prop("checked", true); }
            let ipAddr = data.ipAddr.split(".");
            $("#lan_addr1").val(ipAddr[2]);
            $("#lan_addr2").val(ipAddr[3]);
            // $("#dhcp_ip").html(data.ipAddr);
            let start = data.startIP, end = data.endIP;
            start = start.substr(start.lastIndexOf(".") + 1,);
            end = end.substr(end.lastIndexOf(".") + 1,);
            $("#dhcp_addr1").val(start);
            $("#dhcp_addr2").val(end);
            $("#dhcp_select").val(data.leaseTime);
            $("#dhcp_prefix").html("192.168." + ipAddr[2] + ". ");
        }
    })
}
//设置DHCP
$("#lan_addr1").bind("input propertychange", function () {
    $("#dhcp_prefix").html("192.168." + $(this).val() + ". ");
})
function setDHCP() {
    //modify for DHCP Setting luolihua 20220622 start
    $("#dhcpTipModal").modal("hide");
    $("#rebootTipModal").modal("show");
    let dhcp_addr1 = $("#dhcp_addr1").val(), dhcp_addr2 = $("#dhcp_addr2").val(), lan_addr1 = $("#lan_addr1").val(), lan_addr2 = $("#lan_addr2").val(), dhcp_prefix = $("#dhcp_prefix").html().trim();
    if (dhcp_addr1 && dhcp_addr2 && lan_addr1 && lan_addr2) {
        let start = dhcp_prefix + dhcp_addr1, end = dhcp_prefix + dhcp_addr2, dhcp_switch = $("#dhcp_switch").prop("checked"), dhcp_select = $("#dhcp_select").val();
        let dhcp_status = dhcp_switch ? "1" : "0";
        let ipAddr = "192.168." + lan_addr1 + "." + lan_addr2;
        console.log(JSON.stringify({ "ipAddr": ipAddr, "startIP": start, "endIP": end, "gateway": ipAddr, "dhcpStatus": dhcp_status, "leaseTime": dhcp_select, "reboot": 1 }));
        setTimeout(function () {
            window.location.href = "http://" + ipAddr;
        }, 7000);
        XmlAjax({
            url: "/api/save_dhcp",
            data: { "save_dhcp": JSON.stringify({ "ipAddr": ipAddr, "startIP": start, "endIP": end, "gateway": ipAddr, "dhcpStatus": 1, "leaseTime": dhcp_select, "reboot": 1 }) },
            success: function (result) { console.log("setDHCPResult:" + result); },
            error: function () { toastr.error($("#net-tip2").html()); }
        })
    } else {
        toastr.error($("#net-tip13").html());
    }
    //modify for DHCP Setting luolihua 20220622 end
}
//控制密码显示与隐藏
let showFlag = 0, $show = $("#showPassword"), $hide = $("#hidePassword");
$("#control").on("click", function () {
    if (showFlag === 0) { $show.css("display", "block"); $hide.css("display", "none"); $("#pincode").attr("type", "text"); showFlag = 1; }
    else { $show.css("display", "none"); $hide.css("display", "block"); $("#pincode").attr("type", "password"); showFlag = 0; }
})
//获取阈值
function getThr() {
    XmlAjax({
        url: "/api/flowrate_record",
        data: { "flowrate_record": 1 },
        success: function (result) {
            console.log("getThreshold_Result:\n" + result);
            let data = JSON.parse(result);
            if (data.total_send === "") { data.total_send = 0; }
            if (data.total_recv === "") { data.total_recv = 0; }
            if (data.cur_send === "") { data.cur_send = 0; }
            if (data.cur_recv === "") { data.cur_recv = 0; }
            let total = data.total_send * 1 + data.total_recv * 1 + data.cur_recv * 1 + data.cur_send * 1;
            usedThreshold = total;
            total = ThreCal(total);
            let current = data.cur_recv * 1 + data.cur_send * 1;
            current = ThreCal(current);
            $("#totalThre").html(total[0]); $("#totalUnit").html(total[1]);
            $("#sessionThre").html(current[0]); $("#sessionUnit").html(current[1]);
            $usedValue.html(total[0] + "\xa0" + total[1]);
            if (global_cur_recv && global_cur_send) {
                const download = SpeedCal(parseInt(
                    (data.cur_recv - global_cur_recv) / 3
                ))
                const upload = SpeedCal(parseInt(
                    (data.cur_send - global_cur_send) / 3
                ))

                $("#upSpeed").html(upload[0]); $("#upUnit").html(upload[1]);
                $("#downSpeed").html(download[0]); $("#downUnit").html(download[1]);
            }
            global_cur_recv = data.cur_recv
            global_cur_send = data.cur_send
        }
    })
}
//清空阈值
function clearThre() {
    XmlAjax({
        url: "/api/network",
        data: { "clear_flowrate": 1 },
        success: function (result) {
            console.log("ClearThreshold_Result:\n" + result);
            let data = JSON.parse(result);
            $("#delThrModal").modal("hide");
            getThr();
        }
    })
}
/*add for DataThreshold by luolihua start 20220523*/
function timeFormat(ms) {
    let h = Math.floor(ms / 1000 / 60 / 60)
    let m = Math.floor(ms / 1000 / 60)
    let s = Math.floor(ms / 1000)
    if (h === 1) {
        // 当时间刚好是60分钟时，让它以mm:ss格式显示,即显示60:00,而不是显示01:00:00
        if (m / 60 === 1 && s % 60 === 0) {
            h = '00'
            m = '60:'
        } else {
            h = '01:'
            m = addZero(m % 60) + ':'
        }
        s = addZero(s % 60)
    } else {
        // h = h === 0 ? '' : addZero(h) + ':'
        h = addZero(h) + ':'
        m = addZero(m % 60) + ':'
        s = addZero(s % 60)
    }
    return h + m + s
}
function addZero(n) {
    return n < 10 ? '0' + n : n
}
//获取流量阈值配置信息
let t2, dataTimeValue;
function getDataThreshold() {
    XmlAjax({
        url: "/api/get_data_threshold",
        data: { "get_data_threshold": 1 },
        success: function (result) {
            console.log("getDataThresholdResult:\n" + result);
            let data = JSON.parse(result);
            if (data.result === "ok") {
                if (data.status === "0") {
                    dataThr.prop("checked", false);
                    dataThrList.css("display", "none");
                    $dataTime.html("00:00:00");
                    $totalValue.html("10 MB");
                } else {
                    let threshold = data.thresholdValue * 1;
                    if (threshold >= 1024) {
                        $totalValue.html(threshold / 1024 + " GB");
                        $planData.val(threshold / 1024);
                        $dataUnit.val("GB");
                    } else {
                        $totalValue.html(threshold + " MB");
                        $planData.val(threshold);
                        $dataUnit.val("MB");
                    }
                    dataTimeValue = data.runTime;
                    $dataTime.html(timeFormat(data.runTime));
                    if (t2) { clearInterval(t2); }
                    t2 = setInterval(function () { addTimeValue(); }, 1000);
                    $dataDate.val(data.resetDay);
                    let percent = (usedThreshold / (threshold * 1024 * 1024)).toFixed(2);
                    $dataThrValue.attr("max", 1);
                    $dataThrValue.attr("value", percent);
                    dataThr.prop("checked", true);
                    dataThrList.css("display", "table-row");
                }
            } else {
                dataThr.prop("checked", false);
                dataThrList.css("display", "none");
            }
        }
    })
}
function addTimeValue() {
    dataTimeValue = dataTimeValue * 1 + 1000;
    $dataTime.html(timeFormat(dataTimeValue));
}
/*add by llh 20220601*/
function SetThreshold() {
    let flag = dataThr.prop("checked") ? 1 : 0;
    let planData, dataDate;
    if (flag === 1) {
        if ($planData.val() * 1 < 10 && $dataUnit.val() === "MB") { planData = 10; } else { planData = $planData.val(); }
        planData = $dataUnit.val() === "MB" ? planData : planData * 1024;
        dataDate = $dataDate.val();
    } else {
        planData = 10;
        dataDate = 1;
    }
    XmlAjax({
        url: "/api/set_data_threshold",
        data: { "set_data_threshold": JSON.stringify({ "status": flag, "thresholdValue": planData, "resetDay": dataDate }) },
        success: function (result) {
            console.log("setDataThresholdResult:\n" + result);
            let data = JSON.parse(result);
            if (data.result !== "ok") {
                dataThresholdFlag = false;
            } else {
                setTimeout(function () {
                    getDataThreshold();
                }, 500);
            }
        }
    })
}
/*add for DataThreshold by luolihua end 20220523*/
/*add for Connection mode by llh 20220601 start*/
//$(".connectionIcon") 搜索图标
//$(".connectionModeSettings") 网络选项
//$(".connectionModeTable_search") 分页图标
//$(".connectionRefresh") 刷新按钮
let mcc, mnc, refreshFlag = false, networkType;
function getConnectionMode() {
    XmlAjax({
        url: "/api/get_connection_mode",
        data: { "get_connection_mode": "1" },
        success: function (result) {
            console.log("getConnectionModeResult:\n" + result);
            let data = JSON.parse(result);
            if (data.result === "ok") {
                if (data.selectMode === "1") {//Auto
                    $("#connectSelect").val("Auto");
                    $("#connectionModeDialog").css("display", "none");
                } else {//Manual
                    $(".connectionIcon").css("display", "none");
                    $("#connectSelect").val("Manual");
                    $("#connectionModeDialog").css("display", "block");
                    $(".connectionRefresh").css("visibility", "visible");
                    $(".connectionBtn").css("visibility", "hidden");
                    mcc = data.mcc;
                    mnc = data.mnc;
                    networkType = data.rat;
                    let signal = data.rat === "16" ? "4G" : "3G";
                    $(".connectionModeSettings").html("");
                    $(".connectionModeSettings").append(
                        '<button class="settingsButton buttonSwitch">' +
                        string2Unicode(data.networkName) + '\xa0' + signal + '</button>'
                    )
                }
            }
        }
    })
}
//开始搜索网络
function startSearchNetwork() {
    refreshFlag = true;
    $(".connectionModeSettings").css("display", "none");
    $(".connectionIcon").css("display", "block");
    $(".connectionRefresh").css("visibility", "hidden");
    $(".connectionBtn").css("visibility", "hidden");
    XmlAjax({
        url: "/api/start_search_network",
        data: { "start_search_network": "1" },
        success: function (result) {
            console.log("searchNetworkResult:\n" + result);
            let data = JSON.parse(result);
            if (data.result === "ok") {
                if (data.searchStatus === "0") {
                    setTimeout(function () {
                        getNetworkList();
                    }, 5000);
                } else {
                    setTimeout(function () {
                        getNetworkList();
                    }, 5000);
                }
            } else {
                $(".connectionIcon").css("display", "none");
                $(".connectionModeSettings").css("display", "block");
                toastr.error($("#net-tip2").html());
            }
        }
    })
}
//取消搜索网络
function stopSearchNetwork() {
    XmlAjax({
        url: "/api/abort_search_network",
        data: { "abort_search_network": "1" },
        success: function (result) {
            console.log("StopSearchNetworkResult:\n" + result);
            let data = JSON.parse(result);
            if (data.result === "ok") {
                console.log("Stop search network");
            } else {
                toastr.error($("#net-tip2").html());
            }
        }
    })
}
//获取网络列表
let ListGroup = [], page = 0, maxPage = 0;
function getNetworkList() {
    ListGroup = [];
    XmlAjax({
        url: "/api/get_network_list",
        data: { "get_network_list": "1" },
        success: function (result) {
            console.log("getNetworkListResult:\n" + result);
            let data = JSON.parse(result);
            if (data.result === "ok") {
                let list = data.plmnInfo;
                //只要返回列表，就显示刷新按钮
                $(".connectionRefresh").css("visibility", "visible");
                if (list.length === 0) {
                    //列表为空
                    // $("#connectSelect").val("1");
                    toastr.error($("#net-tip9").html());
                } else if (list.length > 5) {
                    //长度大于5，需要分页
                    $(".connectionBtn").css("visibility", "visible");
                    for (let k = 0; k < list.length; k = k + 5) {
                        ListGroup.push(list.slice(k, k + 5));
                        $(".connectionModeTable_search").css("display", "block");
                    }
                    maxPage = ListGroup.length;
                    generateDom(ListGroup[0]);
                } else {
                    //不需要分页
                    $(".connectionBtn").css("visibility", "hidden");
                    $(".connectionModeTable_search").css("display", "block");
                    generateDom(list);
                }
                $(".connectionIcon").css("display", "none");
                $(".connectionModeSettings").css("display", "block");
            } else if (data.result === "fail2") {
                if (data.status === "0") {
                    $(".connectionIcon").css("display", "none");
                    $("#connectSelect").val("Auto");
                    toastr.erro($("#net-tip10").html());
                } else {
                    setTimeout(function () {
                        getNetworkList();
                    }, 5000);
                }
            } else {
                toastr.error($("#net-tip2").html());
            }
        }
    })
}
function generateDom(list) {
    $(".connectionModeSettings").html("");
    let signal;
    list.forEach(function (network) {
        console.log(network);
        signal = network.rat === "16" ? "4G" : "3G";
        if (network.isRegistered === "1") {
            $(".connectionModeSettings").append(
                '<button class="settingsButton buttonSwitch" data-index="' + network.index + '">' +
                string2Unicode(network.networkName) + '\xa0\xa0' + signal + '\xa0\xa0' + '(available)' + '</button>'
            )
        } else if (network.isForbidden === "1") {
            $(".connectionModeSettings").append(
                '<button class="settingsButton" data-index="' + network.index + '" disabled>' +
                string2Unicode(network.networkName) + '\xa0\xa0' + signal + '\xa0\xa0' + '(forbidden)' + '</button>'
            )
        } else {
            $(".connectionModeSettings").append(
                '<button class="settingsButton" data-index="' + network.index + '">' +
                string2Unicode(network.networkName) + '\xa0\xa0' + signal + '\xa0\xa0' + '(available)' + '</button>'
            )
        }
    })
}
//手动设置网络
function setNetworkManual() {
    let mode = $("#connectSelect").val() === "Auto" ? 1 : 0;
    let network = $(".buttonSwitch").data("index");
    XmlAjax({
        url: "/api/select_connection_mode",
        data: { "select_connection_mode": JSON.stringify({ "select_mode": mode, "plmnIndex": network }) },
        success: function (result) {
            console.log("setConnectionModeResult:\n" + result);
            let data = JSON.parse(result);
            if (data.result !== "ok") {
                connectionFlag = false;
            }
        }
    })
}
//分页
$("#prevDevice1").on("click", function () {
    if (page === 0) {
        toastr.warning($("#net-tip12").html());
    } else {
        page += 1;
        generateDom(ListGroup[page]);
    }
})
$("#prevDevice2").on("click", function () {
    if (page === maxPage) {
        toastr.warning($("#net-tip12").html());
    } else {
        page -= 1;
        generateDom(ListGroup[page]);
    }
})
/*add for Connection mode by llh 20220601 end*/



