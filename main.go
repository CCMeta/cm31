package main // Look README.md

import (
	"embed"
	"encoding/json"
	"fmt"
	"math/rand"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"strconv"
	"strings"

	"github.com/kataras/iris/v12"
)

// do not remove any comment!!!! prev go:embed!!!!!!!It is for build
// do not remove any comment!!!! prev go:embed!!!!!!!It is for build
// do not remove any comment!!!! prev go:embed!!!!!!!It is for build
//
//go:embed html/*
var embed_FS embed.FS

// custom data for user settings
var _settings iris.Map

func init_system() {
	println("init_system() Start")

	// load settings
	exe_cmd("touch _settings.toml")
	_settings = iris.TOML("_settings.toml").Other

	// enable gadget
	exe_cmd("connmanctl enable gadget && connmanctl tether gadget on")
	// exe_cmd("connmanctl tether gadget on")

	// enable wifi
	exe_cmd("connmanctl enable wifi")
	tether_wifi := fmt.Sprintf("connmanctl tether wifi on \"%v\" wpa2 \"%v\" ",
		_settings["wifi_ssid"],
		_settings["wifi_password"],
	)
	// println(tether_wifi)
	exe_cmd(tether_wifi)

	// enable other such as danmon process?
	println("init_system() Finish")
}

func main() {

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
			if len(page) < 1 {
				page = "main.html"
			}
			ctx.View(page)
		})
		// html.Post("/{action}", dispatcher)
	}

	/*************************Starting Server****************************/
	host_addr := fmt.Sprintf("0.0.0.0:%s", getenv("PORT", "80"))
	app.Listen(host_addr)
}

func getenv(key string, def string) string {
	v := os.Getenv(key)
	if v == "" {
		return def
	}

	return v
}

func dispatcher(ctx iris.Context) {

	action := ctx.Params().Get("action")
	switch action {

	case `get_device_info`:

		firmwarewVersion := exe_cmd("getprop ro.mediatek.version.release")
		serialNumber := exe_cmd("getprop ro.serialno")
		imei := exe_cmd("cmd phone get-imei 0")
		siminfo_buf := exe_cmd("content query --uri content://telephony/siminfo | head -1")
		//parse imsi of sim card

		imsi := strings.Split(valFilter(siminfo_buf), ",")[49]

		mac_addr := exe_cmd("cmd phone get-imei 0")

		wanIP_text := exe_cmd("(ifconfig ccmni0 && ifconfig ccmni1) | grep 'inet addr:'")

		wanIP := ""
		if len(wanIP_text) > 1 {
			wanIP = strings.ReplaceAll(
				strings.ReplaceAll(valFilter(wanIP_text), "inet addr:", ""),
				"  Mask:255.0.0.0", "")
		}

		ctx.JSON(iris.Map{
			"result":           "ok",
			"serialNumber":     valFilter(serialNumber),
			"imei":             strings.ReplaceAll(valFilter(imei), "Device IMEI:", ""),
			"imsi":             imsi,
			"hardwareVersion":  "1.0.0",
			"softwarewVersion": "随便自定义??",
			"firmwarewVersion": valFilter(firmwarewVersion),
			"webUIVersion":     "随便自定义1_1_1",
			"mac":              mac_addr,
			"wanIP":            wanIP,
		})
	case `get_pin_setting`:
		pinRemain := exe_cmd("getprop vendor.gsm.sim.retry.pin1")
		pinEnabled := exe_cmd("getprop gsm.slot1.num.pin1")
		pinStatus := exe_cmd("getprop gsm.slot1.num.pin1")
		_pinRemain, _ := strconv.Atoi(valFilter(pinRemain[:len(pinRemain)-1]))
		_pinEnabled, _ := strconv.Atoi(valFilter(pinEnabled[:len(pinEnabled)-1]))
		_pinStatus, _ := strconv.Atoi(valFilter(pinStatus[:len(pinStatus)-1]))

		ctx.JSON(iris.Map{
			"result":     "ok",
			"pinRemain":  _pinRemain,
			"pinEnabled": _pinEnabled,
			"pinStatus":  _pinStatus,
		})
	case `get_wifi_settings`:

		mac_addr := exe_cmd("getprop gsm.slot1.num.pin1")

		ctx.JSON(iris.Map{
			"result":        "ok",
			"status":        1,
			"apIsolation":   _settings["wifi_apIsolation"],
			"mac_addr":      mac_addr,
			"hideSSID":      _settings["wifi_hideSSID"],
			"SSIDName":      _settings["wifi_ssid"],
			"bandwidthMode": _settings["wifi_bandwidthMode"],
			"channel":       _settings["wifi_channel"],
			"security":      _settings["wifi_security"],
			"password":      _settings["wifi_password"],
			// "autoSleep":     0,
		})
	case `ip`:
		clients := exe_cmd("ip -4 neigh | grep ap0 | grep REACHABLE")
		ctx.WriteString(valFilter(clients))
	case `connected_devices`:
		//ip neigh show dev ap0
		clients_buf := exe_cmd("ip -4 neigh show")
		devices := []iris.Map{}
		clients_list := strings.Split(valFilter(clients_buf), "\n")

		for i, v := range clients_list {
			client_map := strings.Split(v, " ")
			if len(client_map) > 2 {
				device := iris.Map{
					"index":    i,
					"hostName": client_map[2],
					"ip_addr":  client_map[0],
					"mac_addr": client_map[2],
					"usbShare": "0",
				}
				devices = append(devices, device)
			}
		}

		ctx.JSON(iris.Map{
			"result":   "ok",
			"totalNum": len(devices),
			"devices":  devices,
		})
	case `get_data_threshold`:
		uptime_byte := exe_cmd("cat /proc/uptime")
		uptime := strings.ReplaceAll(strings.Split(valFilter(uptime_byte), " ")[0], ".", "00")
		data_threshold_status := exe_cmd("getprop persist.sagereal.data_threshold_status")
		data_threshold_value := exe_cmd("getprop persist.sagereal.data_threshold_value")
		data_threshold_resetDay := exe_cmd("getprop persist.sagereal.data_threshold_resetDay")

		ctx.JSON(iris.Map{
			"result":         "ok",
			"message":        "success!",
			"status":         valFilter(data_threshold_status),
			"thresholdValue": valFilter(data_threshold_value),
			"resetDay":       valFilter(data_threshold_resetDay),
			"runTime":        uptime,
		})
	case `set_data_threshold`:
		params := PostJsonDecoder(ctx, `set_data_threshold`)
		exe_cmd(fmt.Sprintf("setprop persist.sagereal.data_threshold_status %v", params["status"]))
		exe_cmd(fmt.Sprintf("setprop persist.sagereal.data_threshold_value %v", params["thresholdValue"]))
		exe_cmd(fmt.Sprintf("setprop persist.sagereal.data_threshold_resetDay %v", params["resetDay"]))
		ctx.JSON(iris.Map{
			"result":  "ok",
			"message": "ok",
		})
	case `get_web_language`:
		language := exe_cmd("getprop persist.sagereal.language")
		ctx.JSON(iris.Map{
			"result":   "ok",
			"language": valFilter(language),
			"message":  valFilter(language),
		})
	case `set_web_language`:
		params := PostJsonDecoder(ctx, `set_web_language`)
		exe_cmd(fmt.Sprintf("setprop persist.sagereal.language %v", params["set_web_language"]))
		ctx.JSON(iris.Map{
			"result":  "ok",
			"message": params["set_web_language"],
		})
	case `flowrate_record`:
		/**
		{
		  "cur_recv": "MTY4MDYxMTAK",
		  "cur_send": "MzU3Mzc4MQo=",
		  "result": "ok",
		  "total_recv": "Cg==",
		  "total_send": "Cg=="
		}
		*/
		cur_recv := exe_cmd("cat /sys/class/net/wlan0/statistics/rx_bytes")
		cur_send := exe_cmd("cat /sys/class/net/wlan0/statistics/tx_bytes")
		total_send := exe_cmd("getprop persist.sagereal.total_send")
		total_recv := exe_cmd("getprop persist.sagereal.total_recv")
		if len(valFilter(total_send)) < 1 || len(valFilter(total_recv)) < 1 {
			exe_cmd("setprop persist.sagereal.total_send 0")
			exe_cmd("setprop persist.sagereal.total_recv 0")
		}
		// body := fmt.Sprintf(`{	"result": "ok",	"upload": "%v","download": "%v"}`, upload, download)
		// ctx.WritevalFilter(body)
		ctx.JSON(iris.Map{
			"result":     "ok",
			"total_send": valFilter(total_send),
			"total_recv": valFilter(total_recv),
			"cur_send":   valFilter(cur_send),
			"cur_recv":   valFilter(cur_recv),
		})
	case `navtop_info`:
		batteryRemain := exe_cmd("dumpsys battery get level")
		apStatus := exe_cmd("ifconfig ap0 | grep RUNNING")

		ctx.JSON(iris.Map{
			"result":            "ok",
			"batteryRemain":     valFilter(batteryRemain),
			"language":          "en",
			"tobeReadSMS":       "1",
			"totalNumSMS":       "14",
			"isSMSFull":         "0",
			"total_send":        "3450",
			"total_recv":        "3207",
			"cur_send":          "8029",
			"cur_recv":          "5014",
			"threshold_percent": "90",
			"apStatus":          strings.Contains(valFilter(apStatus), "RUNNING"),
		})
	case `set_network_config`:
		params := PostJsonDecoder(ctx, `set_network_config`)

		// 11 = 4G
		// 9 = 4G/3G
		// 3 = 3G
		switch params["networkMode"] {
		case "0":
			params["networkMode"] = "9"
		case "1":
			params["networkMode"] = "11"
		case "2":
			params["networkMode"] = "3"
		default:
			ctx.StopWithText(500, "param error")
			return
		}

		gprsStatus := fmt.Sprintf("settings put global mobile_data1 %v", params["gprsStatus"])
		roamingStatus := fmt.Sprintf("settings put global data_roaming1 %v", params["roamingStatus"])
		networkType := fmt.Sprintf("settings put global preferred_network_mode %v", params["networkMode"])
		exe_cmd(gprsStatus)
		exe_cmd(networkType)
		exe_cmd(roamingStatus)
		ctx.JSON(iris.Map{
			"result": "ok",
		})
	case `network_setting`:
		roamingStatus := exe_cmd("settings get global data_roaming1")
		networkType := exe_cmd("settings get global preferred_network_mode")
		gprsStatus := exe_cmd("settings get global mobile_data1")
		_networkType := ""
		switch valFilter(networkType) {
		case "9":
			_networkType = "0"
		case "11":
			_networkType = "1"
		case "3":
			_networkType = "2"
		case "33,33":
			_networkType = "33"
		default:
			_networkType = valFilter(networkType)
			// ctx.StopWithText(500, "param error"+valFilter(networkType))
			// return
		}
		ctx.JSON(iris.Map{
			"result":        "ok",
			"gprsStatus":    valFilter(gprsStatus),
			"roamingStatus": valFilter(roamingStatus),
			"networkMode":   _networkType,
		})
	case `network_info`:

		networkName := exe_cmd("hostname")
		networkType := exe_cmd("getprop gsm.network.type")
		simStatus := exe_cmd("getprop gsm.sim.state")
		gprsStatus := exe_cmd("settings get global mobile_data1")
		signalStrength := exe_cmd("getprop vendor.ril.nw.signalstrength.lte.1")
		ctx.JSON(iris.Map{
			"result":         "ok",
			"networkName":    valFilter(networkName),
			"networkType":    valFilter(networkType),
			"simStatus":      strings.Contains(valFilter(simStatus), "LOADED"),
			"gprsStatus":     valFilter(gprsStatus),
			"signalStrength": strings.Split(valFilter(signalStrength), ",")[0],
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
		params := PostJsonDecoder(ctx, `restart`)
		if params["restart"] == "1" {

			// combine total traffic to system-props
			cur_recv := exe_cmd("cat /sys/class/net/wlan0/statistics/rx_bytes")
			cur_send := exe_cmd("cat /sys/class/net/wlan0/statistics/tx_bytes")
			total_send := exe_cmd("getprop persist.sagereal.total_send")
			total_recv := exe_cmd("getprop persist.sagereal.total_recv")
			total_send_int, _ := strconv.Atoi(valFilter(total_send))
			cur_send_int, _ := strconv.Atoi(valFilter(cur_send))
			total_recv_int, _ := strconv.Atoi(valFilter(total_recv))
			cur_recv_int, _ := strconv.Atoi(valFilter(cur_recv))
			total_send_cmd := fmt.Sprintf("setprop persist.sagereal.total_send %d", total_send_int+cur_send_int)
			total_recv_cmd := fmt.Sprintf("setprop persist.sagereal.total_recv %d", total_recv_int+cur_recv_int)
			exe_cmd(total_send_cmd)
			exe_cmd(total_recv_cmd)

			//async
			go exe_cmd("sleep 5 && reboot")
		}
		ctx.JSON(iris.Map{
			"result": "ok",
			"params": params["restart"],
		})
	default:
		ctx.WriteString("REQUEST IS FAILED BY action = " + action)
	}

	ctx.StatusCode(200)
}

func PostJsonDecoder(ctx iris.Context, action string) map[string]interface{} {
	temp := make(iris.Map)
	var body_buffer []byte
	body_buffer, _ = ctx.GetBody()
	values, _ := url.ParseQuery(valFilter(body_buffer))

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

func valFilter(val []byte) string {
	return strings.TrimRight(string(val), "\n")
}

func exe_cmd(cmd string) []byte {
	// res, err := exec.Command("sh", "-c", cmd).Output()
	res, err := exec.Command("sh", "-c", cmd).Output()
	if err != nil {
		println(err.Error())
		return nil
	}
	return res
}
