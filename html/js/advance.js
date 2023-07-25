let $apnName = $("#apnName"), $apnGateway = $("#apn_gateway"), $apnIpType = $("#apn_ipType"), $apnAuthType = $("#authType"), $userName = $("#userName"), $password = $("#password");
let $apnPoint = $("#apn_point"), $apnPort = $("#apn_port"), $apnHomepage = $("#apn_homepage"), $apnDNS = $("#apn_dns"), $apnNetType = $("#apn_netType"), $apnSwitch = $("#apnSwitch");
/*模态框弹出背景模糊效果*/
let $mobileModal = $(".modal"), $main = $(".main");
$mobileModal.on("shown.bs.modal", function () {$main.addClass("blur");})
$mobileModal.on("hidden.bs.modal", function () {$main.removeClass("blur");})

/*添加APN时弹出新的模态框*/
$(".apnModals").on("shown.bs.modal",function () {$("#apnModal").css("display","none").removeClass("blur1");})
$(".apnModals").on("hidden.bs.modal", function () {$("#apnModal").css("display","block");$(".main").addClass("blur");})

/*弹出Dia弹框时清空输入*/
$("#diagModal").on("show.bs.modal",function () {
    $("#diagModal input").val("");$("#diagModal textarea").val("");
})
window.onload = function () {getBattery("/advance_network.html");GetNetwork();}
let updateIndex, apnFlag;
/*点击添加APN按钮*/
$("#addAPN").on("click", function () {
    apnFlag = 0;
    $("#addApnModal input").removeAttr("disabled");$("#addApnModal select").removeAttr("disabled");$apnSwitch.prop("checked", false);
    $("#addApnModal input").val('');$("#addApnModal select").val('');$("#addApnModal").modal("show");$("#apnModal").addClass("blur1");
})
//切换APN状态时，改变输入框的状态
// $apnSwitch.on("change", function () {
//     if(apnFlag===1) {
//         if ($apnSwitch.prop("checked")) {$("#addApnModal input").removeAttr("disabled");$("#addApnModal select").removeAttr("disabled");}
//         else {$("#addApnModal input").attr("disabled", "disabled");$("#addApnModal select").attr("disabled", "disabled");$apnSwitch.removeAttr("disabled");}
//     }
// })
/*单击td，显示apn详细信息*/
$(document).on("click",".apn-td",function () {
    apnFlag = 1;
    let $parent = $(this).parent();
    updateIndex = $parent.data("index");
    $apnName.val($parent.children("td").eq(0).text());
    $apnGateway.val($parent.children("td").eq(1).text());
    if($parent.data("iptype")=="0") {$apnIpType.val("IPV4");} else if ($parent.data("iptype")=="1") {$apnIpType.val("IPV6");} else {$apnIpType.val("IPV4V6");}
    $apnIpType.attr("data-value", $parent.data("iptype"));
    if ($parent.data("authtype")=="0") {$apnAuthType.val("PAP");} else if ($parent.data("authtype")=="1") {$apnAuthType.val("CHAP");}
    else if ($parent.data("authtype")=="2") {$apnAuthType.val("PAP CHAP");} else {$apnAuthType.val("NONE");}
    $apnAuthType.attr("data-value", $parent.data("authtype"));
    $userName.val($parent.data("name"));
    $password.val($parent.data("pwd"));
    $apnPoint.val($parent.data("point"));
    $apnPort.val($parent.data("port"));
    $apnHomepage.val($parent.data("homepage"));
    $apnDNS.val($parent.data("dns"));
    $apnNetType.val($parent.data("nettype")=="0" ? "WAP" : "HTTP");
    $apnNetType.attr("data-value", $parent.data("nettype"));
    if($parent.data("select") === 1) {$apnSwitch.prop("checked", true);} else {$apnSwitch.prop("checked", false);}
    // if ($apnSwitch.prop("checked")) {$("#addApnModal input").removeAttr("disabled");$("#addApnModal select").removeAttr("disabled");}
    // else {$("#addApnModal input").attr("disabled", "disabled");$("#addApnModal select").attr("disabled", "disabled");$apnSwitch.removeAttr("disabled");}
    $("#addApnModal").modal('show');
})

/*修改APN或者增加APN*/
function addOrUpdateAPN() {
    if($apnName.val() === "" || $apnName.val() === null) {
        toastr.error($("#ad-tip12").html());
    } else {
        let apnName = unicode2String($apnName.val()), gateWay = $apnGateway.val(), ipType = $apnIpType.attr("data-value"), authType = $apnAuthType.attr("data-value"), point = $apnPoint.val(), port = $apnPort.val(), homepage = $apnHomepage,
            userName = $userName.val(), pwd = $password.val(), apnStatus = $apnSwitch.prop("checked"), dns = $apnDNS.val(), netType = $apnNetType.attr("data-value"), index;
        if(apnFlag === 0) {index = -1;} else {index=updateIndex;}
        XmlAjax({
            url: "/api/save_apn",
            data:{"save_apn" :
                    JSON.stringify({"sim_index":0,"apn_index":index,"apn_selected":apnStatus,"apn_name":apnName, "apn_user_name":userName, "apn_passwd":pwd,"apn_access_point":point,
                        "apn_gateway":gateWay, "apn_port":port,"apn_homepage":homepage,"apn_dns":dns,"apn_auth_type":authType,"apn_ip_type":ipType,"apn_network_type":netType})
            },
            success:function (result) {
                console.log("addOrUpdateAPNResult:" + result);
                let data = JSON.parse(result);
                if(data.result === "success") {
                    getAPNList();
                    $("#addApnModal").modal("hide");
                    if(apnFlag===0){toastr.success($("#ad-tip3").html());} else {toastr.success($("#ad-tip4").html());}
                }
            }
        })
    }
}
//获取APN配置列表
function getAPNList() {
    XmlAjax({
        url: "/api/get_apn_list",
        data: {"get_apn_list": 0},
        success: function (result) {
            console.log("getAPNResult:" + result);
            let data = JSON.parse(result);
            $("#apnTable").html("");
            data.apns.forEach(function (item,index) {
                let trash = '<button class="btn btn1" data-toggle="modal" data-target="#delAPNModal" onclick="delAPN(this)" data-index="' + item.apn_index + '">' +
                    '<svg width="21" height="21" viewBox="0 0 21 21" fill="none">' +
                    '<path fill-rule="evenodd" clip-rule="evenodd" d="M18.0496 6.68182H2.95041V18.3967C2.95041 19.8345 4.11595 21 5.55372 21H15.4463C16.884 21 18.0496 19.8345 18.0496 18.3967V6.68182ZM7.20248 11.1508C7.20248 10.7914 6.9111 10.5 6.55165 10.5C6.19221 10.5 5.90083' +
                    ' 10.7914 5.90083 11.1508V16.531C5.90083 16.8904 6.19221 17.1818 6.55165 17.1818C6.9111 17.1818 7.20248 16.8904 7.20248 16.531V11.1508ZM14.7087 10.5C15.0681 10.5 15.3595 10.7914 15.3595 11.1508V16.531C15.3595 16.8904 15.0681 17.1818 14.7087 17.1818C14.3492 17.1818 14.0579 16.8904 14.0579 16.531V11.1508C14.0579 10.7914 14.3492 10.5 14.7087 10.5ZM11.281 11.1508C11.281 10.7914 10.9896 10.5 10.6302 10.5C10.2707 10.5 9.97934 10.7914 9.97934 11.1508V16.531C9.97934 16.8904 10.2707 17.1818 10.6302 17.1818C10.9896 17.1818 11.281 16.8904 11.281 16.531V11.1508Z" fill="#FF4646"/>'+
                    '<path d="M20.25 3.74939H16.5006V2.25C16.5006 1.00756 15.501 0 14.2672 0H6.74877C5.50695 0 4.49939 1.00756 4.49939 2.24939V3.74877H0.75C0.334832 3.74877 0 4.08361 0 4.49877C0 4.91394 0.334832 5.24877 0.75 5.24877H20.25C20.6652 5.24877 21 4.91394 21 4.49877C21 4.08361 20.6652 3.74877 20.25 3.74877V3.74939Z" fill="#FF4646"/>' +
                    '</svg>' +
                    '</button>';
                let name = string2Unicode(item.apn_name);
                if(data.apn_selected * 1 === index) {
                    $("#apnTable").append('<tr class="apn-tr apn-default" data-name="'+ item.apn_user_name + '" data-pwd="' + item.apn_passwd + '" data-point="' + item.apn_access_point +
                        '" data-nettype="' + item.apn_network_type + '" data-port="' + item.apn_port + '" data-homepage="' + item.apn_homepage + '" data-dns="' + item.apn_dns +
                        '" data-iptype="' + item.apn_ip_type + '" data-authtype="' + item.apn_auth_type + '" data-index="' + item.apn_index  +'" data-select="1">' +
                        '<td class="apn-td td-left"><label class="apn-name">'+ name +'</label></td><td class="apn-td td-right"><label class="apn-name">'+ item.apn_gateway +'</label></td><td width="69px"></td></tr>');
                } else {
                    $("#apnTable").append('<tr class="apn-tr" data-name="'+ item.apn_user_name + '" data-pwd="' + item.apn_passwd + '" data-point="' + item.apn_access_point +
                        '" data-nettype="' + item.apn_network_type + '" data-port="' + item.apn_port + '" data-homepage="' + item.apn_homepage + '" data-dns="' + item.apn_dns +
                        '" data-iptype="' + item.apn_ip_type + '" data-authtype="' + item.apn_auth_type + '" data-select="0" data-index="' + item.apn_index +'">' +
                        '<td class="apn-td td-left"><label class="apn-name">'+name+'</label></td>'+
                        '<td class="apn-td td-right"><label class="apn-name">'+item.apn_gateway+'</label></td>' +
                        '<td width="69px">'+ trash +'</td>'+
                        '</tr>');
                }
            })
        },
        error: function () {
            $("#apnTable").html("");
        }
    })
}
$("#apnModal").on("show.bs.modal", function () {
    getAPNList();
})
//删除APN配置
let delAPNIndex, delAPNDom;
function delAPN(obj) {delAPNIndex = $(obj).data("index");delAPNDom=$(obj).parent()}
function deleteAPN() {
    XmlAjax({
        url: "/api/del_apn",
        data: {"del_apn":JSON.stringify({"sim_index": 0,"apn_index": delAPNIndex})},
        success: function (result) {getAPNList();toastr.success($("#ad-tip5").html());$("#delAPNModal").modal("hide");},
        error: function () {toastr.error($("#ad-tip2").html());}
    })
}
//启动诊断模式
let timeout = 0, diagStatus = 1;
$("#startDiag").on("click", function () {
    var re =  /^([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.([0-9]|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])$/;
    let interval = $("#interval").val() * 1, count = $("#count").val() * 1;
    if( $("#targetIP").val() && interval && count) {
        if(!re.test($("#targetIP").val())) {
            toastr.error($("#ad-tip6").html());
        } else {
            if(interval < 200) {
                toastr.warning($("#ad-tip7").html());
            }else if( count > 100) {
                toastr.warning($("#ad-tip8").html());
            } else {
                timeout = interval;
                XmlAjax({
                    url: "/api/start_diagnostics",
                    data:{"start_diagnostics" :JSON.stringify({"diagnosticStatus":1,"ip_address":$("#targetIP").val(),"interval":interval,"count":count})},
                    success: function (result) {
                        console.log("StartDiagResult:" + result);
                        let data = JSON.parse(result);
                        if(data.result==="ok") {
                            $("#diagResult").val('');
                            setTimeout(function () {GetDiagResult();},interval);
                        } else {
                            toastr.error($("#ad-tip2").html());
                        }
                    }
                })
            }
        }
    } else {
        toastr.error($("#ad-tip9").html());
    }
})
//停止诊断模式
$("#stopDiag").on("click", function () {
    XmlAjax({
        url: "/api/stop_diagnostics",
        data:{"stop_diagnostics":0},
        success: function (result) {
            console.log("stopDiagResult:" + result);
            let data = JSON.parse(result);
            if(data.result === "ok") {
                console.log("Stop Diagnostic");
            } else {
                if(diagStatus === 0) {
                    toastr.error($("#ad-tip10").html());
                } else {
                    toastr.error($("#ad-tip2").html());
                }
            }
        }
    })
})
//获取诊断结果
function GetDiagResult(){
    XmlAjax({
        url: "/api/get_diagnostics_result",
        data:{"get_diagnostics_result":1},
        success: function (result) {
            console.log("getDiagResult:" + result);
            let data = JSON.parse(result);
            if(data.result === "ok") {
                let val , diagLog = data.diagnosticsResult;
                if(diagLog !== "") {val = diagLog.replaceAll(";;", "\n");}
                $("#diagResult").val(val);
                $("#diagResult")[0].scrollTop = $("#diagResult")[0].scrollHeight;
                if(data.diagnosticStatus === 1) {
                    diagStatus = 1;
                    setTimeout(function () {GetDiagResult();},timeout);
                } else {
                    diagStatus = 0;
                }
            } else if(data.result === "fail2") {
                toastr.error($("#ad-tip11").html());
            } else {
                toastr.error($("#ad-tip2").html());
            }
        }
    })
}
//刷新诊断结果
function RefreshDiagResult() {$("#diagResult").val("");GetDiagResult();}
//检查有无插卡
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
function simCheck(mes){
    if(simStatus===1){
        if(mes==="apn") {
            $("#apnModal").modal("show");
        } else {
            $("#diagModal").modal("show");
        }
    } else {
        $("#simTipModal").modal("show");
    }
}