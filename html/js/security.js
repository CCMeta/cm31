// let $secTip1 = $("#sec-tip1"), $secTip2 = $("#sec-tip2"),$secTip3 = $("#sec-tip3"),$secTip4 = $("#sec-tip4"),$secTip5 = $("#sec-tip5"),
//     $secTip6 = $("#sec-tip6"),$secTip7 = $("#sec-tip7"),$secTip8 = $("#sec-tip8"),$secTip10 = $("#sec-tip10");

let $Modal = $(".modal"), $main = $(".main");
$Modal.on("shown.bs.modal", function () {$main.addClass("blur");})
$Modal.on("hidden.bs.modal", function () {$main.removeClass("blur");})
window.onload = function () {
    if(localStorage.getItem("pin")==="lock"){window.location.href = "login.html";}
    else {/**getLanguage('security.html');**/getBattery("/security.html");GetNetwork();getPINSetting();}
}

//Firewall关闭时，IPFilter和PingFilter默认关闭，并且不可点击
//Firewall开启时，IPFilter开启时获取IPFilter列表，关闭时Add按钮不可点击
//Firewall开启时，点击开关改变状态时，在没有改变完成时，将按钮置为不可点击
let $firewall = $("#firewallSwitch"), $IPFilter = $("#filterSwitch"), $ping = $("#pingSwitch"), IPStatus = false, $filterList = $(".filter-row");
function setSwitchStatus( ipStatus, pingStatus) {
    if(ipStatus){$IPFilter.removeAttr("disabled");$IPFilter.next().removeClass("choose-label3");}
    else {$IPFilter.attr("disabled", "true");$IPFilter.next().addClass("choose-label3");}
    if(pingStatus) {$ping.removeAttr("disabled");$ping.next().removeClass("choose-label3");}
    else {$ping.attr("disabled", "true");$ping.next().addClass("choose-label3");}
}
$IPFilter.on("change", function () {
    if($(this).prop("checked")) {GetIPFilter();$filterList.css("display", "block");}
    else {$filterList.css("display", "none");}
})
$firewall.on("change", function () {
    if($(this).prop("checked")) {
        setSwitchStatus(true, true);
    } else {
        $IPFilter.prop("checked", false);$ping.prop("checked",false);
        setSwitchStatus(false, false);
        $filterList.css("display", "none");
    }
})
$("#firewallSwitch,#filterSwitch,#pingSwitch").on("click", function () {
    $firewall.attr("disabled", "true");
    setSwitchStatus(false, false);
    saveProtect();
})
// //获取protection信息
$("#protectModal").on("show.bs.modal", function () {
    XmlAjax({
        url: "/api/get_protection_setting",
        data:{"get_protection_setting":1},
        success: function (result) {
            console.log("getProtectResult:" + result);
            let data = JSON.parse(result);
            if(data.firewall === 1) {
                $firewall.prop("checked", true);
                setSwitchStatus(true, true);
            } else {
                $firewall.prop("checked", false);$IPFilter.prop("checked", false);$ping.prop("checked",false);
                setSwitchStatus(false, false);
            }
            if(data.IPFilterSwitch === 1) {
                $IPFilter.prop("checked", true);IPStatus=true;GetIPFilter();$filterList.css("display", "block");
            } else {
                $IPFilter.prop("checked", false);IPStatus = false;$filterList.css("display", "none");
            }
            if(data.pingDeactivation === 1) {$ping.prop("checked",true)} else {$ping.prop("checked",false);}
        }
    })
})
//保存protection信息
function saveProtect() {
    let pinS = $ping.prop("checked") ? 1 : 0, ipS = $IPFilter.prop("checked") ? 1 : 0, fireS = $firewall.prop("checked") ? 1 : 0;
    if(fireS===0) {pinS = 0; ipS = 0;}
    XmlAjax({
        url: "/api/save_protection_setting",
        data: {"save_protection_setting":JSON.stringify({
                "pingDeactivation":pinS,
                "IPFilterSwitch":ipS,
                "firewall":fireS
            })},
        success: function (result) {
            console.log("SaveProtectResult:" + result);
            $firewall.removeAttr("disabled");$firewall.next().removeClass("choose-label3");
            if($firewall.prop("checked")) {
                $IPFilter.next().removeClass("choose-label3");$ping.next().removeClass("choose-label3");
                $IPFilter.removeAttr("disabled");$ping.removeAttr("disabled");
            }
            // toastr.success("$(sec-tip1).html()");
        },
        error: function () {
            toastr.error("$(sec-tip2).html()");
        }
    })
}
//获取IP Filter信息
let $ipAdress = $("#ipAddress"), $lanPort = $("#lanPort"), $wanAddress = $("#wanAddress"), $wanPort = $("#wanPort"), $filterType = $("#filterType"), $filterTbody = $("#filterTable");
$filterType.on("change", function () {
    if($(this).val() == "ICMP") {
        $lanPort.attr("disabled", "disabled");$wanPort.attr("disabled", "disabled");
        $lanPort.val("0");$wanPort.val("0");
    } else {
        $lanPort.removeAttr("disabled");$wanPort.removeAttr("disabled");
    }
})
function GetIPFilter() {
    XmlAjax({
        url: "/api/get_ip_filter",
        data: {"get_ip_filter":1},
        success: function (result) {
            console.log("getIPFilterResult:" + result);
            let data = JSON.parse(result);
            $filterTbody.html("");
            data.filters.forEach(function (item) {
                let protocol;
                if(item.protocol === "6") {protocol="TCP";} else if(item.protocol==="17") {protocol="UDP";} else {protocol="ICMP";}
                $filterTbody.append('<tr><td>' + item.lan_ip + '</td>' +
                    '<td>' + item.lan_port + '</td>' +
                    '<td>' + item.wan_ip+ '</td>' +
                    '<td>' +item.wan_port + '</td>' +
                    '<td>'+ protocol +'</td>' +
                    '<td>' +
                    '<button class="btn btnClear" onclick="delFilterFunction(this)" data-index="' + item.index + '">' +
                    '<svg width="21" height="21" viewBox="0 0 21 21" fill="none">' +
                    '<path fill-rule="evenodd" clip-rule="evenodd" d="M18.0496 6.68182H2.95041V18.3967C2.95041 19.8345 4.11595 21 5.55372 21H15.4463C16.884 21 18.0496 19.8345 18.0496 18.3967V6.68182ZM7.20248 11.1508C7.20248 10.7914 6.9111 10.5 6.55165 10.5C6.19221 10.5 5.90083 10.7914 5.90083 11.1508V16.531C5.90083 16.8904 6.19221 17.1818 6.55165 17.1818C6.9111 17.1818 7.20248 16.8904 7.20248 16.531V11.1508ZM14.7087 10.5C15.0681 10.5 15.3595 10.7914 15.3595 11.1508V16.531C15.3595 16.8904 15.0681 17.1818 14.7087 17.1818C14.3492 17.1818 14.0579 16.8904 14.0579 16.531V11.1508C14.0579 10.7914 14.3492 10.5 14.7087 10.5ZM11.281 11.1508C11.281 10.7914 10.9896 10.5 10.6302 10.5C10.2707 10.5 9.97934 10.7914 9.97934 11.1508V16.531C9.97934 16.8904 10.2707 17.1818 10.6302 17.1818C10.9896 17.1818 11.281 16.8904 11.281 16.531V11.1508Z" fill="#FF4646"/>' +
                    '<path d="M20.25 3.74939H16.5006V2.25C16.5006 1.00756 15.501 0 14.2672 0H6.74877C5.50695 0 4.49939 1.00756 4.49939 2.24939V3.74877H0.75C0.334832 3.74877 0 4.08361 0 4.49877C0 4.91394 0.334832 5.24877 0.75 5.24877H20.25C20.6652 5.24877 21 4.91394 21 4.49877C21 4.08361 20.6652 3.74877 20.25 3.74877V3.74939Z" fill="#FF4646"/>' +
                    '</svg>' +
                    '</button>' +
                    '</td>' +
                    '</tr>')
            })
        },
        error: function () {
            $filterTbody.html("");
        }
    })
}
//添加Filter
let $addFilterModal = $("#addFilterModal");
$addFilterModal.on("hidden.bs.modal", function () {$("#protectModal").css("display", "block");$(".main").addClass("blur");})
$addFilterModal.on("show.bs.modal", function () {$("#protectModal").css("display", "none");$("#addFilterModal input").val("");})
function addIPFilter() {
    var re =  /^([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/;
    let ipAddress = $ipAdress.val(), lanPort = $lanPort.val(), wanAddress = $wanAddress.val(), wanPort = $wanPort.val(), filterType = $filterType.val();
    if(ipAddress==='' || lanPort==='' || wanAddress==='' || wanPort==='' || filterType==='' || filterType == undefined){
        toastr.error($("#sec-tip3").html());
    } else if(!re.test(ipAddress) || !re.test(wanAddress)){
        toastr.error($("#sec-tip4").html());
    } else {
        XmlAjax({
            url: "/api/save_ip_filter",
            data: {"save_ip_filter": JSON.stringify({
                    "operate":"add","lan_ip":ipAddress,"lan_port":lanPort,
                    "wan_ip":wanAddress, "wan_port":wanPort,"protocol":filterType
                })},
            success: function (result) {
                console.log("addIPFilterResult:" + result);
                let data = JSON.parse(result);
                if(data.result === "ok") {
                    GetIPFilter();
                    $addFilterModal.modal("hide");
                    toastr.success($("#sec-tip5").html());
                }
            },
            error: function () {
                toastr.error($("#sec-tip2").html());
            }
        })
    }
}

//删除IPFilter
let index, delDOM;
$("#delFilterModal").on("hidden.bs.modal", function () {$("#protectModal").removeClass("blur1");$(".main").addClass("blur");})
function delFilterFunction(obj) {
    index = $(obj).data("index");
    delDOM = $(obj).parent().parent();
    $("#delFilterModal").modal("show");
    $("#protectModal").addClass("blur1");
}
function delIPFilter() {
    if(index===null || typeof index==="undefined") {
        toastr.warning($("#sec-tip14").html());
    } else {
        XmlAjax({
            url: "/api/save_ip_filter",
            data: {"save_ip_filter": JSON.stringify({"operate": "del", "index": index})},
            success:function (result) {
                console.log("delIPFilterResult:" + result);
                let data = JSON.parse(result);
                if(data.result === "ok") {
                    delDOM.remove();
                    GetIPFilter();
                    $("#delFilterModal").modal("hide");
                    toastr.success($("#sec-tip6").html());
                } else {
                    toastr.error($("#sec-tip2").html());
                }
            },
            error:function () {
                toastr.error($("#sec-tip2").html());
            }
        })
    }
}
//获取SIM卡PIN配置信息
let $pinModal = $("#simPinModal");

$("#simPinInputModal,#simPinChangeModal").on("shown.bs.modal", function () {
    $("#simPinModal").css("display", "none");
}).on("hidden.bs.modal", function(){
    $("#pinInput").val('');
    $("#simPinChangeModal input").val('');
    $("#simPinModal").css("display", "flex");
    $(".main").addClass("blur");
})

function getPINSetting() {
    $("#pinInput").val("");
    $("#pinTip").html('')
    XmlAjax({
        url: "/api/get_pin_setting",
        data: {"get_pin_setting": 1},
        success: function (result) {
            console.log("getPINResult:" + result);
            let data = JSON.parse(result);
            if(data.pinEnabled === 0) {
                $(".changPIN").css("display", 'none');
                $("#pin_switch").prop("checked", true);
            } else {
                $(".changPIN").css("display", 'flex');
                $("#pin_switch").prop("checked", false);
            }
            $("#remainNumber").html(data.pinRemain);
        }
    })
}

$("#pin_switch").on("change", function () {
    let status = !$(this).prop("checked");
    $("#simPinInputModal").modal("show");
    $(this).prop("checked", status);
})
//设置PIN信息,有3种情况:
// 1、pinFlag==1，已开启校验
// 2、pinFlag==-1，已关闭校验 pinstatus && pinenabled都为0
// 3、pinFlag==2，已开启校验，且通过检验
function savePIN() {
    $("#pinTip").html('')
    let code = $("#pinInput").val();
    if(code.length < 4 || code.length > 8 ) {
        toastr.warning($("#sec-tip7").html());
    } else {
        XmlAjax({
            url: "/api/operate_pin",
            data: {"operate_pin" :JSON.stringify({"pinEnabled": $("#pin_switch").prop("checked") ? 1 : 0,"pinCode": code})},
            success: function (result) {
                console.log("setPINResult:" + result);
                let data = JSON.parse(result);
                if(data.result==="ok"){
                    let operateResult = data.operateResult;
                    $("#remainNumber").html(data.falseRemain);
                    if(operateResult === "0") {
                        //操作成功
                        if(data.functionType == "2") {
                            //关闭成功
                            $(".changPIN").css("display", 'none');
                            toastr.success($("#sec-tip11").html());
                            $("#pin_switch").prop("checked", true);
                        } else {
                            //开启成功
                            $(".changPIN").css("display", 'flex');
                            toastr.success($("#sec-tip12").html());
                            $("#pin_switch").prop("checked", false);
                        }
                        $("#simPinInputModal").modal("hide")
                    } else if(operateResult === "5"){
                        //操作失败，此错误为密码错误
                        $("#pinTip").html($("#sec-tip13").html())
                    } else {
                        //其他错误
                        toastr.error($("#sec-tip2").html());
                    }
                } else {
                    $("#remainNumber").html(data.falseRemain);
                    if(data.message == 'Attempts is not enough') {
                        //尝试次数不足
                        toastr.error($("#sec-tip15").html());
                    } else {
                        toastr.error($("#sec-tip2").html());
                    }
                }
            },
            error: function () {
                toastr.error($("#sec-tip2").html());
            }
        })
    }
}
function changePINCode() {
    let currentP = $("#currentPIN").val(), password = $("#newPIN").val(), rePassword = $("#newPIN2").val();
    if(!currentP || !password || !rePassword) {toastr.error($("#sec-tip3").html());}
    else if (password !== rePassword) {toastr.error($("#sec-tip8").html());}
    else if (password.length < 4 || password.length > 8) {toastr.error($("#sec-tip7").html());}
    else {
        XmlAjax({
            url: "/api/change_pin",
            data: {"change_pin": JSON.stringify({"pinOldCode": currentP, "pinNewCode": password})},
            success: function (result) {
                console.log("ChangePINCodeResult:" + result);
                let data = JSON.parse(result);
                $("#simPinChangeModal input").val("");
                if(data.result==="ok") {
                    if(data.operateResult == "0") {
                        //修改成功
                        toastr.success($("#sec-tip1").html());
                        $("#simPinChangeModal").modal("hide");
                    } else {
                        //PIN码错误
                        toastr.error($("#sec-tip13").html());
                    }
                } else if(data.result === "fail"){
                    if(data.message == 'Attempts is not enough') {
                        $("#simPinChangeModal").modal("hide");
                        //尝试次数不足
                        toastr.error($("#sec-tip15").html());
                    } else {
                        toastr.error($("#sec-tip2").html());
                    }
                } else {
                    toastr.error($("#sec-tip2").html());
                }
            },
            error: function () {toastr.error($("#sec-tip2").html());}
        })
    }
}
let simStatus = 1;
function GetNetwork(){
    XmlAjax({
        url: "/api/network_info",
        data: {"network_info": 0},
        success: function(result) {
            console.log("networkResult:" + result);
            let data = JSON.parse(result);
            if(data.result === "ok") {if(data.simStatusInfo==="No SIM") {simStatus=0;}}
        },
    });
}
//检查有无插卡
function simCheck(){if(simStatus===1){$("#simPinModal").modal("show");} else {$("#simTipModal").modal("show");}}

//获取黑名单列表
function getmacList() {
    XmlAjax({
        url: "/api/get_black_list",
        data: {"get_black_list": 1},
        success: function (result) {
            console.log("getmacResult:" + result);
            let data = JSON.parse(result);
            $("#macTable").html("");
            if(data.result == "ok") {
                if(data.totalNum == 0) {
                    $("#macTable").append('<tr class="apn-tr">' +
                        '<td></td>'+
                        '<td></td>' +
                        '<td width="69px"></td>'+
                        '</tr>');
                } else{
                    data.devices.forEach(function (item,index) {
                        let trash = '<button class="btn btn1" data-toggle="modal" data-target="#delmacModal" onclick="delmac(this)" data-index="' + item.index + '">' +
                            '<svg width="21" height="21" viewBox="0 0 21 21" fill="none">' +
                            '<path fill-rule="evenodd" clip-rule="evenodd" d="M18.0496 6.68182H2.95041V18.3967C2.95041 19.8345 4.11595 21 5.55372 21H15.4463C16.884 21 18.0496 19.8345 18.0496 18.3967V6.68182ZM7.20248 11.1508C7.20248 10.7914 6.9111 10.5 6.55165 10.5C6.19221 10.5 5.90083' +
                            ' 10.7914 5.90083 11.1508V16.531C5.90083 16.8904 6.19221 17.1818 6.55165 17.1818C6.9111 17.1818 7.20248 16.8904 7.20248 16.531V11.1508ZM14.7087 10.5C15.0681 10.5 15.3595 10.7914 15.3595 11.1508V16.531C15.3595 16.8904 15.0681 17.1818 14.7087 17.1818C14.3492 17.1818 14.0579 16.8904 14.0579 16.531V11.1508C14.0579 10.7914 14.3492 10.5 14.7087 10.5ZM11.281 11.1508C11.281 10.7914 10.9896 10.5 10.6302 10.5C10.2707 10.5 9.97934 10.7914 9.97934 11.1508V16.531C9.97934 16.8904 10.2707 17.1818 10.6302 17.1818C10.9896 17.1818 11.281 16.8904 11.281 16.531V11.1508Z" fill="#FF4646"/>'+
                            '<path d="M20.25 3.74939H16.5006V2.25C16.5006 1.00756 15.501 0 14.2672 0H6.74877C5.50695 0 4.49939 1.00756 4.49939 2.24939V3.74877H0.75C0.334832 3.74877 0 4.08361 0 4.49877C0 4.91394 0.334832 5.24877 0.75 5.24877H20.25C20.6652 5.24877 21 4.91394 21 4.49877C21 4.08361 20.6652 3.74877 20.25 3.74877V3.74939Z" fill="#FF4646"/>' +
                            '</svg>' +
                            '</button>';
                        $("#macTable").append('<tr class="apn-tr">' +
                            '<td class="apn-td td-left">'+ item.host_name+'</td>'+
                            '<td class="apn-td td-right">'+item.mac+'</td>' +
                            '<td width="69px">'+ trash +'</td>'+
                            '</tr>');
                    })
                }
            }
        },
        error: function () {
            $("#macTable").html("");
        }
    })
}
$("#macModal").on("show.bs.modal", function () {
    getmacList();
})
//删除MAC
let delmacIndex;
function delmac(obj) {delmacIndex = $(obj).data("index");}
function deletemac() {
    XmlAjax({
        url: "/api/blk_rm",
        data: {"blk_rm":delmacIndex},
        success: function (result) {
            getmacList();
            toastr.success($("#sec-tip1").html());
            $("#delmacModal").modal("hide");
        },
        error: function () {toastr.error($("#ad-tip2").html());}
    })
}

//获取已经连接的设备
function GetConnectDevice() {
    XmlAjax({
        url: "/api/connected_devices",
        data: {"connected_devices": 0},
        success: function (result) {
            console.log("connected_device_Result:\n" + result);
            let data = JSON.parse(result);
            if(data.result==="ok") {
                $("#addmacTable").html("");
                //遍历获取设备的数量
                data.devices.forEach(function (item, index) {
                    if(item.usbShare != "1"){
                        let addbutton = "<button class=\"btn btn1\" onclick=\"addmac(this)\" data-index=\"" + index + "\">+</button>";
                        $("#addmacTable").append('<tr><td class="td-left" width="380px">'+ item.hostName +'</td><td class="td-right" width="380px">'+ item.mac_addr +'</td>+<td width="90px">'+addbutton+'</td></tr>');
                    }
                })
            }
        },
        error: function () {
            $("#addmacTable").html("");
        }
    })
}
/*增加mac*/
function addmac(obj) {
    let addmacIndex = $(obj).data("index");
    XmlAjax({
        url: "/api/blk_list",
        data:{"blk_list" :addmacIndex},
        success:function (result) {
            console.log("addmacResult:" + result);
            let data = JSON.parse(result);
            if(data.result === "ok") {
                $("#addMACModal").modal("hide");
                getmacList();
                toastr.success($("#sec-tip1").html());
            } else {
                toastr.error($("#sec-tip2").html());
            }
        }
    })
}
$("#addMACModal").on("show.bs.modal", function(){
    GetConnectDevice();
    $("#macModal").css("display", "none");
}).on("hidden.bs.modal", function(){
    $("#addmacTable").html("");
    $("#macModal").css("display", "flex");
    $(".main").addClass("blur");
})

$("#delmacModal").on("show.bs.modal", function(){
  $("#macModal").css("display", "none");
}).on("hidden.bs.modal", function(){
    $("#macModal").css("display", "flex");
    $(".main").addClass("blur");
})
