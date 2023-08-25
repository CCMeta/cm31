package main // Look README.md

import (
	"embed"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"io/fs"
	"math/rand"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"regexp"
	"strconv"
	"strings"
	"time"

	"github.com/kataras/iris/v12"
)

//go:embed html/*
var embed_FS embed.FS

// custom data for user settings
var g_settings iris.Map

// Part of init_system
func init_connman() chan int {
	r := make(chan int)
	go func() {
		// 20230802 fit unisoc bug, sleep about 3min to wait system init completly
		time.Sleep(120 * time.Second)

		// enable wifi
		time.Sleep(10 * time.Second)
		exe_cmd("connmanctl enable wifi")
		time.Sleep(10 * time.Second)
		restart_wifi()

		// enable gadget
		time.Sleep(10 * time.Second)
		exe_cmd("connmanctl enable gadget")
		time.Sleep(10 * time.Second)
		exe_cmd("connmanctl tether gadget on")

		// tether_wifi := fmt.Sprintf("connmanctl tether wifi on \"%v\" wpa2 \"%v\" ",
		// 	g_settings["wifi_SSIDName"],
		// 	g_settings["wifi_password"],
		// )
		// println(`tether_wifi : `, tether_wifi)
		// exe_cmd(tether_wifi)
		r <- (1) // This <- is so ugly
	}()
	return r
}

// Need init before run application
func init_system() {
	println("init_system() Start")

	// load settings.json
	// exe_cmd("touch _settings.json")
	json.Unmarshal(exe_cmd("cat _settings.json"), &g_settings)

	//load setting store in RAM
	go func() {
		//initial
		dbus_result := ""
		dbus_method := ""

		//SimManager
		dbus_method = "org.ofono.SimManager.GetProperties"
		dbus_result = exe_dbus(dbus_method)
		g_settings["sys_iccid"] = parser_regexp(dbus_result,
			`string "CardIdentifier"         variant             string "(.*?)"      \)`,
		)
		g_settings["sys_imsi"] = parser_regexp(dbus_result,
			`string "SubscriberIdentity"         variant             string "(.*?)"      \)`,
		)

		//NetworkRegistration
		dbus_method = "org.ofono.NetworkRegistration.GetProperties"
		dbus_result = exe_dbus(dbus_method)
		g_settings["sys_networkName"] = parser_regexp(dbus_result,
			`string "Name"         variant             string "(.*?)"      \)`,
		)
		g_settings["sys_signalStrength"] = parser_regexp(dbus_result,
			`string "StrengthDbm"         variant             int32 (.*?)      \)`,
		)

		// we truly need to save this miscs to file keep it to end???
		save_setting()
	}()

	// enable connmanctl async
	init_connman()

	// enable other such as danmon process?
	println("init_system() Finish")
}

// Run application
func main() {

	// init before app run
	init_system()

	app := iris.Default()
	assets := iris.PrefixDir("html", http.FS(embed_FS))
	app.RegisterView(iris.HTML(assets, ".html"))
	app.HandleDir("/", assets)

	/*************************Custom Routers****************************/

	// for data api files
	api := app.Party("/api")
	{
		api.Use(iris.Compression)
		api.Get("/{action}", dispatcher)
		api.Post("/{action}", dispatcher)
	}

	// for static html files
	html := app.Party("/")
	{
		html.Use(iris.Compression)
		html.Get("/{page}", func(ctx iris.Context) {
			page := ctx.Params().Get("page")
			if !strings.Contains(page, ".html") {
				page = "main.html"
			}
			if page != "login.html" {
				is_login := session_checker(ctx)
				if !is_login {
					ctx.Redirect("/login.html")
				}
			}
			ctx.View(page)
		})
		// html.Post("/{action}", dispatcher)
	}

	/*************************Starting Server****************************/
	app.Listen("0.0.0.0:80")
}

// mainline to dispatch HTTP request and into case, then response
func dispatcher(ctx iris.Context) {

	//initial for dbus
	dbus_result := ""
	dbus_method := ""
	dbus_args := ""

	action := ctx.Params().Get("action")
	// session check
	switch action {
	case `get_web_language`:
	case `get_pin_setting`:
	case `login`:
	case `operate_pin`:
		break
	default:
		is_login := session_checker(ctx)
		if !is_login {
			ctx.Redirect("/login.html")
			return
		}
	}
	// main
	switch action {
	case `start_diagnostics`:
		// start_diagnostics={"diagnosticStatus":1,"ip_address":"8.8.8.8","interval":200,"count":4}&
		// ping 1217.0.0.21 -i 0.1 -c 3
		params := postJsonDecoder(ctx, `start_diagnostics`)
		ip_address := fmt.Sprint(params["ip_address"])
		interval := fmt.Sprint(params["interval"])
		count := fmt.Sprint(params["count"])
		diagnosticsResult := exe_cmd(fmt.Sprintf("ping %v -i %v -c %v", ip_address, interval, count))
		ctx.JSON(iris.Map{
			"result":            "ok",
			"diagnosticsResult": parser_byte(diagnosticsResult),
			"diagnosticStatus":  0,
		})
	case `login_password`:
		//login_password={"password":"MTIz","newPassword":"YXNk"}&
		params := postJsonDecoder(ctx, `login_password`)
		pwd, err := base64.RawStdEncoding.DecodeString(strings.Trim(fmt.Sprint(params["password"]), "="))
		if err != nil {
			println(err.Error())
			return
		}
		if string(pwd) == fmt.Sprint(g_settings["pwd"]) {
			new_pwd, _ := base64.RawStdEncoding.DecodeString(strings.Trim(fmt.Sprint(params["newPassword"]), "="))
			g_settings["pwd"] = string(new_pwd)
			save_setting()
			ctx.JSON(iris.Map{
				"result":  "ok",
				"message": "success!",
			})
		} else {
			ctx.JSON(iris.Map{
				"result":  "fail",
				"message": "wrong password",
			})
		}
	case `login`:
		params := postJsonDecoder(ctx, `web_login`)
		// println(`fmt.Sprint(params["passwd"])`, fmt.Sprint(params["passwd"]))
		// println(`fmt.Sprint(params["passwd"])`, len(fmt.Sprint(params["passwd"])))
		pwd, err := base64.RawStdEncoding.DecodeString(strings.Trim(fmt.Sprint(params["passwd"]), "="))
		if err != nil {
			println(err.Error())
			return
		}
		sid := ""
		if string(pwd) == fmt.Sprint(g_settings["pwd"]) {
			g_settings["sid"] = rand.Int31()
			save_setting()
			sid = fmt.Sprint(g_settings["sid"])
			// println(`sid = fmt.Sprint(g_settings["sid"])`)
		}

		ctx.JSON(iris.Map{
			"result":  "ok",
			"message": "success!",
			"session": sid,
		})
	case `get_device_info`:
		//Modem
		dbus_method = "org.ofono.Modem.GetProperties"
		dbus_result = exe_dbus(dbus_method)
		imei := parser_regexp(dbus_result,
			`string "Serial"         variant             string "(.*?)"      \)`,
		)
		revision := parser_regexp(dbus_result,
			`string "Revision"         variant             string "(.*?)"      \)`,
		)

		//SimManager
		dbus_method = "org.ofono.SimManager.GetProperties"
		dbus_result = exe_dbus(dbus_method)
		iccid := parser_regexp(dbus_result,
			`string "CardIdentifier"         variant             string "(.*?)"      \)`,
		)
		imsi := parser_regexp(dbus_result,
			`string "SubscriberIdentity"         variant             string "(.*?)"      \)`,
		)

		firmwarewVersion := parser_byte(exe_cmd("cat /etc/version"))
		//parse imsi of sim card

		mac_addr := parser_regexp(
			parser_byte(exe_cmd("ifconfig tether")),
			`Link encap:Ethernet  HWaddr (.*?)\n`,
		)

		wanIP := parser_regexp(
			parser_byte(exe_cmd(`ifconfig tether`)),
			`inet addr:(.*?)  `,
		)

		ctx.JSON(iris.Map{
			"result":           "ok",
			"serialNumber":     iccid,
			"imei":             imei,
			"imsi":             imsi,
			"hardwareVersion":  revision,
			"softwarewVersion": "随便自定义??",
			"firmwarewVersion": firmwarewVersion,
			"webUIVersion":     "随便自定义1_1_1",
			"mac":              mac_addr,
			"wanIP":            wanIP,
		})
	case `get_wifi_settings`:
		ctx.JSON(iris.Map{
			"result":        "ok",
			"status":        g_settings["wifi_status"],
			"apIsolation":   g_settings["wifi_apIsolation"],
			"hideSSID":      g_settings["wifi_hideSSID"],
			"SSIDName":      g_settings["wifi_SSIDName"],
			"bandwidthMode": g_settings["wifi_bandwidthMode"],
			"channel":       g_settings["wifi_channel"],
			"security":      g_settings["wifi_security"],
			"password":      g_settings["wifi_password"],
			// "autoSleep":     0,
		})
	case `save_wifi_settings`:
		params := postJsonDecoder(ctx, `save_wifi_settings`)

		//save
		// g_settings["wifi_band"] = params["band"]
		g_settings["wifi_status"] = params["status"]
		g_settings["wifi_password"] = params["password"]
		g_settings["wifi_security"] = params["security"]
		g_settings["wifi_channel"] = params["channel"]
		g_settings["wifi_hideSSID"] = params["hideSSID"]
		g_settings["wifi_SSIDName"] = params["SSIDName"]
		g_settings["wifi_bandwidthMode"] = params["bandwidthMode"]
		// g_settings["wifi_5G_bandwidthMode"] = params["5G_bandwidthMode"]
		// g_settings["wifi_5G_channel"] = params["5G_channel"]
		// g_settings["wifi_5G_security"] = params["5G_security"]
		save_setting()
		// reset wifi with new params
		go restart_wifi()

		ctx.JSON(iris.Map{
			"result":  "ok",
			"message": "ok",
		})
	case `set_ap_isolation`:
		params := postJsonDecoder(ctx, `set_ap_isolation`)

		// reset wifi with new params
		// TBC
		// TBC
		// TBC
		// TBC

		//save
		g_settings["wifi_apIsolation"] = params["set_ap_isolation"]
		save_setting()
		ctx.JSON(iris.Map{
			"result":      "ok",
			"message":     "ok",
			"apIsolation": g_settings["wifi_apIsolation"],
		})
	case `ip`:
		clients := exe_cmd("ip -4 neigh | grep ap0 | grep REACHABLE")
		ctx.WriteString(parser_byte(clients))
	case `connected_devices`:
		//ip neigh show dev ap0
		// clients_buf := exe_cmd("ip -4 neigh show")
		// devices := []iris.Map{}
		// clients_list := strings.Split(parser_byte(clients_buf), "\n")

		// for i, v := range clients_list {
		// 	client_map := strings.Split(v, " ")
		// 	if len(client_map) > 2 {
		// 		device := iris.Map{
		// 			"index":    i,
		// 			"hostName": client_map[2],
		// 			"ip_addr":  client_map[0],
		// 			"mac_addr": client_map[2],
		// 			"usbShare": "0",
		// 		}
		// 		devices = append(devices, device)
		// 	}
		// }

		ctx.JSON(iris.Map{
			"result": "ok",
			// "totalNum": len(devices),
			// "devices":  devices,
		})
	case `get_data_threshold`:
		uptime_byte := exe_cmd("cat /proc/uptime")
		uptime := strings.ReplaceAll(strings.Split(parser_byte(uptime_byte), " ")[0], ".", "00")

		ctx.JSON(iris.Map{
			"result":         "ok",
			"message":        "success!",
			"status":         fmt.Sprint(g_settings["data_threshold_status"]),
			"thresholdValue": fmt.Sprint(g_settings["data_threshold_value"]),
			"resetDay":       fmt.Sprint(g_settings["data_threshold_resetDay"]),
			"runTime":        uptime,
		})
	case `set_data_threshold`:
		params := postJsonDecoder(ctx, `set_data_threshold`)
		g_settings["data_threshold_status"] = params["status"]
		g_settings["data_threshold_value"] = params["thresholdValue"]
		g_settings["data_threshold_resetDay"] = params["resetDay"]
		save_setting()
		ctx.JSON(iris.Map{
			"result":  "ok",
			"message": "ok",
		})
	case `get_web_language`:
		ctx.JSON(iris.Map{
			"result":   "ok",
			"language": g_settings["language"],
			"message":  g_settings["language"],
		})
	case `set_web_language`:
		params := postJsonDecoder(ctx, `set_web_language`)
		g_settings["language"] = params["set_web_language"]
		save_setting()
		ctx.JSON(iris.Map{
			"result":  "ok",
			"message": g_settings["language"],
		})
	case `flowrate_record`:
		cur_recv := exe_cmd("cat /sys/class/net/tether/statistics/rx_bytes")
		cur_send := exe_cmd("cat /sys/class/net/tether/statistics/tx_bytes")
		total_send := g_settings["total_send"]
		total_recv := g_settings["total_recv"]
		ctx.JSON(iris.Map{
			"result":     "ok",
			"total_send": total_send,
			"total_recv": total_recv,
			"cur_send":   parser_byte(cur_send),
			"cur_recv":   parser_byte(cur_recv),
		})
	case `navtop_info`:
		batteryRemain := exe_cmd("cat /sys/class/power_supply/battery/capacity")
		apStatus := exe_cmd("ifconfig wlan0 | grep RUNNING")

		ctx.JSON(iris.Map{
			"result":            "ok",
			"batteryRemain":     parser_byte(batteryRemain),
			"language":          g_settings["language"],
			"tobeReadSMS":       "1",
			"totalNumSMS":       "14",
			"isSMSFull":         "0",
			"total_send":        "3450",
			"total_recv":        "3207",
			"cur_send":          "8029",
			"cur_recv":          "5014",
			"threshold_percent": "90",
			"apStatus":          strings.Contains(parser_byte(apStatus), "RUNNING"),
		})
	case `set_network_config`:
		params := postJsonDecoder(ctx, `set_network_config`)

		networkType := ""
		switch params["networkMode"] {
		case "0":
			networkType = "LTE/GSM/WCDMA auto"
		case "1":
			networkType = "LTE only"
		case "2":
			networkType = "GSM/WCDMA auto"
		default:
			ctx.StopWithText(500, "param error")
			return
		}

		roamingStatus := fmt.Sprint(params["roamingStatus"])
		switch roamingStatus {
		case "0":
			roamingStatus = "false"
		case "1":
			roamingStatus = "true"
		default:
			println("roamingStatus = %v", roamingStatus)
			ctx.StopWithText(500, "param error")
			return
		}

		//RadioSettings
		dbus_method = "org.ofono.ConnectionManager.SetProperty"
		dbus_args = fmt.Sprintf(`string:"RoamingAllowed" variant:boolean:%v`, roamingStatus)
		exe_dbus(dbus_method, dbus_args)

		//ConnectionManager
		dbus_method = "org.ofono.RadioSettings.SetProperty"
		dbus_args = fmt.Sprintf(`string:"TechnologyPreference" variant:string:"%v"`, networkType)
		exe_dbus(dbus_method, dbus_args)

		// gprsStatus := fmt.Sprintf("settings put global mobile_data1 %v", params["gprsStatus"])
		// exe_cmd(gprsStatus)
		ctx.JSON(iris.Map{
			"result": "ok",
		})
	case `network_setting`:
		//RadioSettings
		dbus_method = "org.ofono.RadioSettings.GetProperties"
		dbus_result = exe_dbus(dbus_method)
		networkType := parser_regexp(dbus_result,
			`string "TechnologyPreference"         variant             string "(.*?)"      \)`,
		)

		//ConnectionManager
		dbus_method = "org.ofono.ConnectionManager.GetProperties"
		dbus_result = exe_dbus(dbus_method)
		roamingStatus := parser_regexp(dbus_result,
			`string "RoamingAllowed"         variant             boolean (.*?)      \)`,
		)
		switch roamingStatus {
		case "false":
			roamingStatus = "0"
		default:
			roamingStatus = "1"
		}
		// TBC
		// gprsStatus := exe_cmd("settings get global mobile_data1")
		//
		//
		//
		//

		switch networkType {
		case "LTE/GSM/WCDMA auto":
			networkType = "0"
		case "LTE only":
			networkType = "1"
		case "GSM/WCDMA auto":
			networkType = "2"
		default:
		}
		ctx.JSON(iris.Map{
			"result": "ok",
			// "gprsStatus":    parser_byte(gprsStatus),
			"roamingStatus": roamingStatus,
			"networkMode":   networkType,
		})
	case `network_info`:
		//NetworkRegistration
		dbus_method = "org.ofono.NetworkRegistration.GetProperties"
		dbus_result = exe_dbus(dbus_method)
		networkName := parser_regexp(dbus_result,
			`string "Name"         variant             string "(.*?)"      \)`,
		)
		networkType := parser_regexp(dbus_result,
			`string "Technology"         variant             string "(.*?)"      \)`,
		)
		signalStrength := parser_regexp(dbus_result,
			`string "StrengthDbm"         variant             int32 (.*?)      \)`,
		)
		//powered: 1, status: 3, pin_required: 0, IMSI: 460110113516405, ICCID: 89860316244593211737, MCC: 460, MNC: 11, msisdn: /, pin_lock(0), retries: 3-10-0-0-0
		// "simStatusInfo": "SIM OK", //SIM OK, SIM Registration Failed, SIM PIN Blocked, No SIM Card
		//SimManager
		dbus_method = "org.ofono.SimManager.GetProperties"
		dbus_result = exe_dbus(dbus_method)
		powered := parser_regexp(dbus_result,
			`string "Powered"         variant             boolean (.*?)      \)`,
		)
		present := parser_regexp(dbus_result,
			`string "Present"         variant             boolean (.*?)      \)`,
		)
		pinRequired := parser_regexp(dbus_result,
			`string "PinRequired"         variant             string "(.*?)"      \)`,
		)

		// default status
		simStatusInfo := "SIM Registration Failed"
		simStatus := 2
		if powered == "true" &&
			present == "true" &&
			pinRequired == "none" {
			// status = OK
			simStatus = 0
			simStatusInfo = "SIM OK"
		} else if powered == "true" &&
			present == "false" {
			// status = NO SIM
			simStatus = 7
			simStatusInfo = "No SIM"
		} else if powered == "true" &&
			present == "true" {
			// status = PIN
			simStatus = 3
			simStatusInfo = "SIM PIN Blocked"
		}

		ctx.JSON(iris.Map{
			"result":      "ok",
			"networkName": networkName,
			"networkType": networkType,
			//0 ok, 2 registion failed, 3 pin blocked, 7 sim not insert
			"simStatus":      simStatus,
			"simStatusInfo":  simStatusInfo,
			"signalStrength": "-" + signalStrength,
		})
	case `network_speed`:
		upload := rand.Int31()
		download := rand.Int31()
		ctx.JSON(iris.Map{
			"result":   "ok",
			"upload":   upload,
			"download": download,
		})
	case `restart`:
		params := postJsonDecoder(ctx, `restart`)
		if params["restart"] == "1" {

			// combine total traffic to system-props
			cur_recv := exe_cmd("cat /sys/class/net/tether/statistics/rx_bytes")
			cur_send := exe_cmd("cat /sys/class/net/tether/statistics/tx_bytes")
			cur_send_int, _ := strconv.Atoi(parser_byte(cur_send))
			cur_recv_int, _ := strconv.Atoi(parser_byte(cur_recv))

			total_send_int, _ := strconv.Atoi(fmt.Sprint(g_settings["total_send"]))
			g_settings["total_send"] = strconv.Itoa(total_send_int + cur_send_int)

			total_recv_int, _ := strconv.Atoi(fmt.Sprint(g_settings["total_recv"]))
			g_settings["total_recv"] = strconv.Itoa(total_recv_int + cur_recv_int)

			save_setting()

			//async
			go exe_cmd("sleep 5 && reboot")
		}
		ctx.JSON(iris.Map{
			"result": "ok",
			"params": params["restart"],
		})
	case `reset_factory`:
		params := postJsonDecoder(ctx, `reset_factory`)
		if params["reset"] == "1" {
			exe_cmd("sleep 5 && fw_setenv mode boot-recovery && fw_setenv wipe-data 1 && reboot -f")
		}
		ctx.JSON(iris.Map{
			"result": "ok",
		})
	case `clear_flowrate`:
		params := postJsonDecoder(ctx, `clear_flowrate`)
		if params["clear_flowrate"] == "1" {
			g_settings["total_send"] = "0"
			g_settings["total_recv"] = "0"
			save_setting()
		}
		ctx.JSON(iris.Map{
			"result": "ok",
		})
	case `get_pin_setting`:
		//SimManager
		dbus_method = "org.ofono.SimManager.GetProperties"
		dbus_result = exe_dbus(dbus_method)

		_pinEnabled := parser_regexp(dbus_result,
			`string "LockedPins"         variant             array (.*?)      \)`,
		)
		// println("_pinEnabled", _pinEnabled)

		_pinStatus := parser_regexp(dbus_result,
			`string "PinRequired"         variant             string "(.*?)"      \)`,
		)
		// println("_pinStatus", _pinStatus)

		_pinRemain := parser_regexp(dbus_result,
			`string "Retries"         variant             array \[               dict entry\(                  string \"pin\"                  byte (.*?)               \)            \]      \)`,
		)
		pinRemain, err := strconv.Atoi(_pinRemain)
		if err != nil {
			// no value
			pinRemain = 0
		}
		// println("_pinRemain", _pinRemain)

		ctx.JSON(iris.Map{
			"result":     "ok",
			"pinRemain":  pinRemain,
			"pinEnabled": strings.Count(_pinEnabled, `string "pin"`),
			"pinStatus":  1 - strings.Count(_pinStatus, `none`),
		})
	case `operate_pin`:
		/*
			LockPin enable
			UnlockPin disable
			EnterPin verify
			ResetPin fuckpuk
			ChangePin change
		*/
		params := postJsonDecoder(ctx, `operate_pin`)
		//{"pinEnabled":1,"pinCode":"1234"}
		pincode := params[`pinCode`]
		// println(`fmt.Sprint(params[pinEnabled]`, fmt.Sprint(params[`pinEnabled`]))
		switch fmt.Sprint(params[`pinEnabled`]) {
		case `0`:
			// to disable pin lock
			dbus_method = "org.ofono.SimManager.UnlockPin"
		case `1`:
			// to enable pin lock
			dbus_method = "org.ofono.SimManager.LockPin"
		default:
			// to verify pin lock. this value is nil should be.
			dbus_method = "org.ofono.SimManager.EnterPin"
		}
		dbus_args = fmt.Sprintf(`string:"pin" string:"%v"`, pincode)
		dbus_result = exe_dbus(dbus_method, dbus_args)

		operateResult := `0`
		if strings.Contains(dbus_result, "Operation failed") {
			println(`dbus_result`, dbus_result)
			operateResult = `5`
		}
		ctx.JSON(iris.Map{
			"result":        "ok",
			"message":       "success!",
			"operateResult": operateResult,
		})
	case `change_pin`:
		/*
			LockPin enable
			UnlockPin disable
			EnterPin verify
			ResetPin fuckpuk
			ChangePin change
		*/
		params := postJsonDecoder(ctx, `change_pin`)
		//{"pinEnabled":1,"pinCode":"1234"}
		old_pin := params[`pinOldCode`]
		new_pin := params[`pinNewCode`]
		dbus_method = "org.ofono.SimManager.ChangePin"
		dbus_args = fmt.Sprintf(`string:"pin" string:"%v" string:"%v"`, old_pin, new_pin)
		dbus_result = exe_dbus(dbus_method, dbus_args)
		operateResult := `0`
		if strings.Contains(dbus_result, "Operation failed") {
			println(`dbus_result`, dbus_result)
			operateResult = `5`
		}
		ctx.JSON(iris.Map{
			"result":        "ok",
			"message":       "success!",
			"operateResult": operateResult,
		})
	default:
		ctx.WriteString("REQUEST IS FAILED BY action = " + action)
	}

	ctx.StatusCode(200)
}

// struct of restart wifi
func restart_wifi() {
	exe_cmd(`connmanctl apmanager disable wlan0`)
	const _PREFIX = "connmanctl apmanager set wlan0"

	time.Sleep(1 * time.Second)
	exe_cmd(fmt.Sprintf(`%v SSID %v`, _PREFIX, g_settings[`wifi_SSIDName`]))
	exe_cmd(fmt.Sprintf(`%v Hidden %v`, _PREFIX, fmt.Sprint(g_settings[`wifi_hideSSID`]) == `1`))
	exe_cmd(fmt.Sprintf(`%v Passphrase %v`, _PREFIX, g_settings[`wifi_password`]))
	exe_cmd(fmt.Sprintf(`%v Band %v`, _PREFIX, g_settings[`wifi_band`]))
	/*
	   CountryCode = CN
	   ACS = False
	   AutoStart = False
	   ACL = Blacklist
	   MaxStaion = 0
	   BroadcastInterval = 100ms
	   UplinkLimit = 0
	   DownlinkLimit = 0
	   RSSIAlarm = -100dBm
	   StationList = [  ]
	   Blacklist = [  ]
	   Whitelist = [  ]
	   UseWPS = True
	*/
	if fmt.Sprint(g_settings[`wifi_band`]) == "5GHz" {
		exe_cmd(fmt.Sprintf(`%v Mode %v`, _PREFIX, g_settings[`wifi_5G_mode`]))
		exe_cmd(fmt.Sprintf(`%v Bandwidth %v`, _PREFIX, `20MHz`))
		exe_cmd(fmt.Sprintf(`%v Channel %v`, _PREFIX, g_settings[`wifi_5G_channel`]))
		// exe_cmd(fmt.Sprintf(`%v Protocol %v`, g_settings[`wifi_5G_security`]))
		// 0 : "none"
		// 1 : "wpa2"
		// where is wpa3
	} else {
		exe_cmd(fmt.Sprintf(`%v Mode %v`, _PREFIX, g_settings[`wifi_mode`]))
		exe_cmd(fmt.Sprintf(`%v Bandwidth %v`, _PREFIX, `20MHz`))
		exe_cmd(fmt.Sprintf(`%v Channel %v`, _PREFIX, g_settings[`wifi_channel`]))
		// exe_cmd(fmt.Sprintf(`%v Protocol %v`, g_settings[`wifi_security`]))
		// 0 : "none"
		// 1 : "wpa2"
		// where is wpa3
	}
	time.Sleep(1 * time.Second)

	if fmt.Sprint(g_settings[`wifi_status`]) == `1` {
		exe_cmd(`connmanctl apmanager enable wlan0`)
	}
}

// check context session right or not
func session_checker(ctx iris.Context) bool {
	sid := ctx.GetCookie("SessionId")
	return sid == fmt.Sprint(g_settings["sid"])
}

// Toolkit for parse URL query param only post method
func postJsonDecoder(ctx iris.Context, action string) map[string]interface{} {
	temp := make(iris.Map)
	var body_buffer []byte
	body_buffer, _ = ctx.GetBody()
	values, _ := url.ParseQuery(parser_byte(body_buffer))

	err := json.Unmarshal([]byte(values.Get(action)), &temp)
	if err != nil {
		// this is only for int value but not jsons
		// if values.Get(action) is not like {blablabla}
		return iris.Map{
			action: values.Get(action),
		}
	}
	return temp
}

// Toolkit for trans byte to string
func parser_byte(val []byte) string {
	return strings.TrimRight(string(val), "\n")
}

// Toolkit for execute comman command
func exe_cmd(cmd string) []byte {
	// res, err := exec.Command("sh", "-c", cmd).Output()
	res, err := exec.Command("sh", "-c", cmd).CombinedOutput()
	if err != nil {
		fmt.Println()
		fmt.Printf("[ERROR] CMD: %v \n MSG: %v \n", cmd, err.Error())
		// println(`res:`, len(res))
		return res
	}
	return res
}

// Toolkit for parse string key between two words
func parser_regexp(exe_result string, reg string) string {
	regexp_result := regexp.MustCompile(reg).FindStringSubmatch(exe_result)
	if len(regexp_result) > 1 {
		return regexp_result[1]
	}
	return ""
}

// Toolkit for execute dbus command
func exe_dbus(dbus_method string, args ...string) string {
	dbus_dest := "org.ofono"
	dbus_path := "/ril_0"
	if len(args) == 0 {
		args = append(args, "")
	}
	result := parser_byte(exe_cmd(fmt.Sprintf("dbus-send --system --print-reply --dest=%v %v %v %v", dbus_dest, dbus_path, dbus_method, args[0])))
	return strings.ReplaceAll(result, "\n", "")
}

// Toolkit for save setting
func save_setting() {
	file_data, _ := json.MarshalIndent(&g_settings, "", "  ")
	os.WriteFile("_settings.json", file_data, fs.ModePerm)
}
