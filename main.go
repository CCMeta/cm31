package main // Look README.md

import (
	"embed"
	"encoding/json"
	"fmt"
	"io/fs"
	"math/rand"
	"net/http"
	"net/url"
	"os"
	"os/exec"
	"strconv"
	"strings"

	"github.com/kataras/iris/v12"
)

//go:embed html/*
var embed_FS embed.FS

// custom data for user settings
var _settings iris.Map

func DoneAsync() chan int {
	r := make(chan int)
	go func() {
		// enable gadget
		exe_cmd("connmanctl enable gadget && connmanctl tether gadget on")

		// enable wifi
		exe_cmd("connmanctl enable wifi")
		tether_wifi := fmt.Sprintf("connmanctl tether wifi on \"%v\" wpa2 \"%v\" ",
			_settings["wifi_SSIDName"],
			_settings["wifi_password"],
		)
		println(tether_wifi)
		exe_cmd(tether_wifi)
		// 妈了比这里有bug！
		r <- 1
	}()
	return r
}

func init_system() {
	println("init_system() Start")

	// load settings
	// exe_cmd("touch _settings.toml")
	json.Unmarshal(exe_cmd("cat _settings.toml"), &_settings)

	// enable connmanctl async
	DoneAsync()

	// enable other such as danmon process?
	println("init_system() Finish")
}

func save_setting() {
	file_data, _ := json.MarshalIndent(&_settings, "", "  ")
	os.WriteFile("_settings.toml", file_data, fs.ModePerm)
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
			if len(page) < 4 {
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

		firmwarewVersion := exe_cmd("cat /etc/version")
		serialNumber := exe_cmd("cat /etc/version")
		imei := exe_cmd("cat /etc/version")
		//parse imsi of sim card

		imsi := exe_cmd("cat /etc/version")

		mac_addr := exe_cmd("cat /etc/version")

		wanIP_text := exe_cmd("(ifconfig tether) | grep 'inet addr:'")

		wanIP := ""
		if len(wanIP_text) > 1 {
			wanIP = strings.Split(strings.Trim(string(wanIP_text), " "), "  ")[0]
		}

		ctx.JSON(iris.Map{
			"result":           "ok",
			"serialNumber":     valFilter(serialNumber),
			"imei":             strings.ReplaceAll(valFilter(imei), "Device IMEI:", ""),
			"imsi":             valFilter(imsi),
			"hardwareVersion":  "1.0.0",
			"softwarewVersion": "随便自定义??",
			"firmwarewVersion": valFilter(firmwarewVersion),
			"webUIVersion":     "随便自定义1_1_1",
			"mac":              valFilter(mac_addr),
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
		mac_addr := exe_cmd("(ifconfig usb0) | grep 'HWaddr '")
		ctx.JSON(iris.Map{
			"result":        "ok",
			"status":        1,
			"apIsolation":   _settings["wifi_apIsolation"],
			"mac_addr":      string((mac_addr[len(mac_addr)-20 : len(mac_addr)-3])),
			"hideSSID":      _settings["wifi_hideSSID"],
			"SSIDName":      _settings["wifi_SSIDName"],
			"bandwidthMode": _settings["wifi_bandwidthMode"],
			"channel":       _settings["wifi_channel"],
			"security":      _settings["wifi_security"],
			"password":      _settings["wifi_password"],
			// "autoSleep":     0,
		})
	case `save_wifi_settings`:
		params := PostJsonDecoder(ctx, `save_wifi_settings`)

		// reset wifi with new params
		// TBC
		// TBC
		// TBC

		//save
		_settings["wifi_password"] = params["password"]
		_settings["wifi_security"] = params["security"]
		_settings["wifi_channel"] = params["channel"]
		_settings["wifi_hideSSID"] = params["hideSSID"]
		_settings["wifi_SSIDName"] = params["SSIDName"]
		_settings["wifi_bandwidthMode"] = params["bandwidthMode"]
		save_setting()
		ctx.JSON(iris.Map{
			"result":  "ok",
			"message": "ok",
		})
	case `set_ap_isolation`:
		params := PostJsonDecoder(ctx, `set_ap_isolation`)

		// reset wifi with new params
		// TBC
		// TBC
		// TBC
		// TBC

		//save
		_settings["wifi_apIsolation"] = params["set_ap_isolation"]
		save_setting()
		ctx.JSON(iris.Map{
			"result":  "ok",
			"message": "ok",
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

		ctx.JSON(iris.Map{
			"result":         "ok",
			"message":        "success!",
			"status":         _settings["data_threshold_status"],
			"thresholdValue": _settings["data_threshold_value"],
			"resetDay":       _settings["data_threshold_resetDay"],
			"runTime":        uptime,
		})
	case `set_data_threshold`:
		params := PostJsonDecoder(ctx, `set_data_threshold`)
		_settings["data_threshold_status"] = params["status"]
		_settings["data_threshold_value"] = params["thresholdValue"]
		_settings["data_threshold_resetDay"] = params["resetDay"]
		ctx.JSON(iris.Map{
			"result":  "ok",
			"message": "ok",
		})
	case `get_web_language`:
		ctx.JSON(iris.Map{
			"result":   "ok",
			"language": _settings["language"],
			"message":  _settings["language"],
		})
	case `set_web_language`:
		params := PostJsonDecoder(ctx, `set_web_language`)
		_settings["language"] = params["set_web_language"]
		save_setting()
		ctx.JSON(iris.Map{
			"result":  "ok",
			"message": _settings["language"],
		})
	case `flowrate_record`:
		cur_recv := exe_cmd("cat /sys/class/net/tether/statistics/rx_bytes")
		cur_send := exe_cmd("cat /sys/class/net/tether/statistics/tx_bytes")
		total_send := _settings["total_send"]
		total_recv := _settings["total_recv"]
		ctx.JSON(iris.Map{
			"result":     "ok",
			"total_send": total_send,
			"total_recv": total_recv,
			"cur_send":   valFilter(cur_send),
			"cur_recv":   valFilter(cur_recv),
		})
	case `navtop_info`:
		batteryRemain := exe_cmd("cat /sys/class/power_supply/battery/capacity")
		apStatus := exe_cmd("ifconfig ap0 | grep RUNNING")

		ctx.JSON(iris.Map{
			"result":            "ok",
			"batteryRemain":     valFilter(batteryRemain),
			"language":          _settings["language"],
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
			cur_recv := exe_cmd("cat /sys/class/net/tether/statistics/rx_bytes")
			cur_send := exe_cmd("cat /sys/class/net/tether/statistics/tx_bytes")
			cur_send_int, _ := strconv.Atoi(valFilter(cur_send))
			cur_recv_int, _ := strconv.Atoi(valFilter(cur_recv))

			// total_send := _settings["total_send"].(int)
			if total_send, ok := _settings["total_send"].(string); ok {
				total_send_int, _ := strconv.Atoi(total_send)
				_settings["total_send"] = string(rune(total_send_int + cur_send_int))
			} else {
				println("I AM UPSET!")
			}
			if total_recv, ok := _settings["total_recv"].(string); ok {
				total_recv_int, _ := strconv.Atoi(total_recv)
				_settings["total_recv"] = string(rune(total_recv_int + cur_recv_int))
			} else {
				println("I AM UPSET!")
			}
			save_setting()

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
