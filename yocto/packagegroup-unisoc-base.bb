SUMMARY = "Organize packages to avoid duplication across all images"

PACKAGE_ARCH = "${MACHINE_ARCH}"
inherit packagegroup

# packages which content depend on MACHINE_FEATURES need to be MACHINE_ARCH
#
# if you want to use a distro feature control a package ,you cam write as this example
# RDEPENDS_packagegroup-unisoc-console += "${@bb.utils.contains('DISTRO_FEATURES', 'distrofeaturename', 'packagename', '',d)}"
# if you want to use a machine feature control a package ,you can write like this
# RDEPENDS_packagegroup-unisoc-console += "${@bb.utils.contains('MACHINE_FEATURES', 'machinefeaturename', 'packagename', '',d)}"

# if you want to add a single package ,this is a example
# SUMMARY_packagegroup-base-wifi = "WiFi support"
# RDEPENDS_packagegroup-base-wifi = "\
# ${VIRTUAL-RUNTIME_wireless-tools} \
# wpa-supplicant"
#
# and then add thie package to PACKAGES arg and PROVIDES.

PROVIDES = "${PACKAGES}"

PACKAGES = ' \
    packagegroup-unisoc-base \
    packagegroup-unisoc-base-debug \
    ${@bb.utils.contains('DEBUG_TOOLS_FLAG','yes','','packagegroup-unisoc-base-debug-user',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'connman', 'packagegroup-unisoc-base-connman', '',d)} \
	${@bb.utils.contains('MACHINE_FEATURES', 'smartlink', 'packagegroup-unisoc-base-smartlink', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'networkutils', 'packagegroup-unisoc-base-networkutils', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'wpa-supplicant', 'packagegroup-unisoc-base-wpa-supplicant', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'modem', 'packagegroup-unisoc-base-modem', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'trusty','packagegroup-unisoc-base-trusty', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'radio', 'packagegroup-unisoc-base-radio', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'production','packagegroup-unisoc-base-production', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'storage','packagegroup-unisoc-base-storage', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'tsupplicant','packagegroup-unisoc-base-tsupplicant', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'aprd','packagegroup-unisoc-base-aprd', '',d)} \
    packagegroup-unisoc-base-rgbled \
    ${@bb.utils.contains('MACHINE_FEATURES', 'hello-sagereal', 'packagegroup-unisoc-base-hello-sagereal', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'bt-tool', 'packagegroup-unisoc-base-bt-tool', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'engpc', 'packagegroup-unisoc-base-engpc', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'factorytest', 'packagegroup-unisoc-base-factorytest', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'nativemmi', 'packagegroup-unisoc-base-nativemmi', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'engmodeapp', 'packagegroup-unisoc-base-engmodeapp', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'runtimetest', 'packagegroup-unisoc-base-runtimetest', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'charge', 'packagegroup-unisoc-base-charge', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'pm', 'packagegroup-unisoc-base-pm', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'orca-deamon', 'packagegroup-unisoc-base-orca-deamon', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'ecell-socket', 'packagegroup-unisoc-base-ecell-socket', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'service-plugins', 'packagegroup-unisoc-base-service-plugins', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'usbcontrol', 'packagegroup-unisoc-base-usbcontrol', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'aqtool', 'packagegroup-unisoc-base-aqtool', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'gnss-ota', 'packagegroup-unisoc-base-gnss-ota', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'unisoc-gpsd', 'packagegroup-unisoc-base-unisoc-gpsd', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'geoclue', 'packagegroup-unisoc-base-geoclue', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'pppdial', 'packagegroup-unisoc-base-pppdial', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'pppd', 'packagegroup-unisoc-base-pppd', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'netfuns', 'packagegroup-unisoc-base-netfuns', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'terminal', 'packagegroup-unisoc-base-terminal', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'alsa', 'packagegroup-unisoc-base-alsa', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'pulseaudio', 'packagegroup-unisoc-base-pulseaudio', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'gstreamer', 'packagegroup-unisoc-base-gstreamer', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'video', 'packagegroup-unisoc-base-video', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'jpeg', 'packagegroup-unisoc-base-jpeg', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'memion', 'packagegroup-unisoc-base-memion', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'libcamera', 'packagegroup-unisoc-base-libcamera', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'libbt', 'packagegroup-unisoc-base-libbt', '',d)} \
	${@bb.utils.contains('MACHINE_FEATURES', 'wcnini-marlin2', 'packagegroup-unisoc-base-wcnini-marlin2', '',d)} \
	${@bb.utils.contains('MACHINE_FEATURES', 'wcnini-marlin3lite', 'packagegroup-unisoc-base-wcnini-marlin3lite', '',d)} \
	${@bb.utils.contains('MACHINE_FEATURES', 'wcnini-marlin3e', 'packagegroup-unisoc-base-wcnini-marlin3e', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'hciattach', 'packagegroup-unisoc-base-hciattach', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'gnss', 'packagegroup-unisoc-base-gnss', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'libopdm', 'packagegroup-unisoc-base-libopdm', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'cmccdm', 'packagegroup-unisoc-base-cmccdm', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'ctcc', 'packagegroup-unisoc-base-ctcc', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'libctcc', 'packagegroup-unisoc-base-libctcc', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'rfkill', 'packagegroup-unisoc-base-rfkill', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'benchmark', 'packagegroup-unisoc-base-benchmark', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'xen-tools', 'packagegroup-unisoc-base-xen-tools', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'sleepwakeup', 'packagegroup-unisoc-base-sleepwakeup-tool', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'wifitest-sc2332', 'packagegroup-unisoc-base-wifitest-sc2332', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'wifitest-sc2355', 'packagegroup-unisoc-base-wifitest-sc2355', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'upower', 'packagegroup-unisoc-base-upower', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'powersave', 'packagegroup-unisoc-base-powersave', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'powerd', 'packagegroup-unisoc-base-powerd', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'mali-midgard', 'packagegroup-unisoc-base-midgard', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'audio', 'packagegroup-unisoc-base-audio', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'audio-phoenix', 'packagegroup-unisoc-base-audio-phoenix', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'pvr-rogue', 'packagegroup-unisoc-base-pvr-rogue', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'rogue-vz', 'packagegroup-unisoc-base-rogue-vz', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'bluetooth', 'packagegroup-unisoc-base-bluetooth', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'localtime', 'packagegroup-unisoc-base-localtime', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'ntpdaemon', 'packagegroup-unisoc-base-ntpdaemon', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'ota-adapter', 'packagegroup-unisoc-base-ota-adapter', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'fs_tools', 'packagegroup-unisoc-base-fs-debug-tools', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'audiohal', 'packagegroup-unisoc-base-audiohal', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'audiohal-phoenix', 'packagegroup-unisoc-base-audiohal-phoenix', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'voicecall', 'packagegroup-unisoc-base-voicecall', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'libgstcamera', 'packagegroup-unisoc-base-libgstcamera', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'ocp8137', 'packagegroup-unisoc-base-ocp8137', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'sc2721s', 'packagegroup-unisoc-base-sc2721s', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'userdata-resize2fs', 'packagegroup-unisoc-base-userdata-resize2fs', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'libjsonc', 'packagegroup-unisoc-base-libjsonc', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'libbqbbt', 'packagegroup-unisoc-base-libbqbbt', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'inireader', 'packagegroup-unisoc-base-inireader', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'vorbis-tools', 'packagegroup-unisoc-base-vorbis-tools', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'r8125', 'packagegroup-unisoc-base-r8125', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'libgomp', 'packagegroup-unisoc-base-libgomp', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'libsensorclassic', 'packagegroup-unisoc-base-libsensorclassic', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'batterymanager', 'packagegroup-unisoc-base-batterymanager', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'sttest', 'packagegroup-unisoc-base-sttest', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'qtdemo', 'packagegroup-unisoc-base-qtdemo', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'qtdialor', 'packagegroup-unisoc-base-qtdialor', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'qtwifidemo', 'packagegroup-unisoc-base-qtwifidemo', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'qtgsensor', 'packagegroup-unisoc-base-qtgsensor', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'qtsysnotify', 'packagegroup-unisoc-base-qtsysnotify', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'qtpbapdemo', 'packagegroup-unisoc-base-qtpbapdemo', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'reserve-space', 'packagegroup-unisoc-base-reserve-space', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'watermark', 'packagegroup-unisoc-base-libwatermark', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'sysdump', 'packagegroup-unisoc-base-sysdump', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'hostapd', 'packagegroup-unisoc-base-hostapd', '',d)} \
'

SUMMARY_packagegroup-unisoc-base-propertys = "aprd packages"
RDEPENDS_packagegroup-unisoc-base-aprd = " \
    aprd \
"

SUMMARY_packagegroup-unisoc-base-bt-tool = "bt-tool api for sl8563-base"
RDEPENDS_packagegroup-unisoc-base-bt-tool= "\
    bt-tool \
"
SUMMARY_packagegroup-unisoc-base-sysdump = "export minidump log and sysdump status change"
RDEPENDS_packagegroup-unisoc-base-sysdump = "\
    minidump \
    systemdebuggerd \
"
# this package group not used
RDEPENDS_packagegroup-unisoc-base = "\
    packagegroup-unisoc-base-debug \
    ${@bb.utils.contains('DEBUG_TOOLS_FLAG','yes','','packagegroup-unisoc-base-debug-user',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'connman', 'packagegroup-unisoc-base-connman', '',d)} \
	${@bb.utils.contains('MACHINE_FEATURES', 'smartlink', 'packagegroup-unisoc-base-smartlink', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'networkutils', 'packagegroup-unisoc-base-networkutils', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'modem', 'packagegroup-unisoc-base-modem', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'radio', 'packagegroup-unisoc-base-radio', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'engpc', 'packagegroup-unisoc-base-engpc', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'usbcontrol', 'packagegroup-unisoc-base-usbcontrol', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'service-plugins', 'packagegroup-unisoc-base-service-plugins', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'aqtool', 'packagegroup-unisoc-base-aqtool', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'gnss-ota', 'packagegroup-unisoc-base-gnss-ota', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'orca-deamon', 'packagegroup-unisoc-base-orca-deamon', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'ecell-socket', 'packagegroup-unisoc-base-ecell-socket', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'unisoc-gpsd', 'packagegroup-unisoc-base-unisoc-gpsd', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'geoclue', 'packagegroup-unisoc-base-geoclue', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'cmccdm', 'packagegroup-unisoc-base-cmccdm', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'ctcc', 'packagegroup-unisoc-base-ctcc', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'libctcc', 'packagegroup-unisoc-base-libctcc', '',d)} \
    packagegroup-unisoc-base-rgbled \
    ${@bb.utils.contains('MACHINE_FEATURES', 'pppdial', 'packagegroup-unisoc-base-pppdial', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'pppd', 'packagegroup-unisoc-base-pppd', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'netfuns', 'packagegroup-unisoc-base-netfuns', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'benchmark', 'packagegroup-unisoc-base-benchmark', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'sleepwakeup', 'packagegroup-unisoc-base-sleepwakeup-tool', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'ota-adapter', 'packagegroup-unisoc-base-ota-adapter', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'libjsonc', 'packagegroup-unisoc-base-libjsonc', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'inireader', 'packagegroup-unisoc-base-inireader', '',d)} \
	${@bb.utils.contains('MACHINE_FEATURES', 'batterymanager', 'packagegroup-unisoc-base-batterymanager', '',d)} \
"
# add unisoc debug function here, 'user' image not include
SUMMARY_packagegroup-unisoc-base-debug = "debug packages for debug function and image"
RDEPENDS_packagegroup-unisoc-base-debug = " \
    lookat \
    getevent \
    memtester \
    costmem \
    procps \
    perf \
    ${@bb.utils.contains('MACHINE_FEATURES', 'benchmark', 'packagegroup-unisoc-base-benchmark', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'sleepwakeup', 'packagegroup-unisoc-base-sleepwakeup-tool', '',d)} \
    ${@bb.utils.contains('DISTRO_FEATURES', 'sysvinit', 'sysv-initscript', '',d)} \
"

# add unisoc debug function here
SUMMARY_packagegroup-unisoc-base-debug-user = "debug packages, depend on MACHINE_FEATURES in user image"
RDEPENDS_packagegroup-unisoc-base-debug-user = " \
    smem \
"

SUMMARY_packagegroup-unisoc-base-connman = "Network connection management"
RDEPENDS_packagegroup-unisoc-base-connman= "\
    connman-client \
    connman \
    curl \
    libconnman \
    connmantest \
    smartlink-client \
    smartlink-client-test \
"


SUMMARY_packagegroup-unisoc-base-smartlink = "smartlink"
RDEPENDS_packagegroup-unisoc-base-smartlink= "\
    linuxptp \
"

SUMMARY_packagegroup-unisoc-base-networkutils = "Network Utilities"
RDEPENDS_packagegroup-unisoc-base-networkutils= "\
    tcpdump \
    bridge-utils \
    ebtables \
    iputils \
    vlan \
"

SUMMARY_packagegroup-unisoc-base-wnifi = "WiFi wpa-supplicant support"
RDEPENDS_packagegroup-unisoc-base-wpa-supplicant = "\
    wpa-supplicant \
"

SUMMARY = "modem service packages for 8563 and others which need this "
RDEPENDS_packagegroup-unisoc-base-modem = " \
    modem-utils \
    modem-control \
    slogmodem \
    nvitem \
    refnotify \
    modem-propctl \
	libmodeminictl \
"

SUMMARY = "terminal service packages for 8563 and others which need this "
RDEPENDS_packagegroup-unisoc-base-terminal = " \
    atrouter \
    at-router \
    iniparser \
    libyoctominiap \
    ${@bb.utils.contains('PREFERRED_VERSION_atrouter', '0.1', '', 'libcptransport',d)} \
    libatcommon \
    unisoc-reboot \
"

SUMMARY = "socket for udx710-ecell"
RDEPENDS_packagegroup-unisoc-base-ecell-socket = " \
    libsocketap \
"
SUMMARY = "ota adapter for udx710-ecell"
RDEPENDS_packagegroup-unisoc-base-ota-adapter = " \
    ota-adapter \
    unitest \
    libotaadaptersocket \
    libotaadapter \
"

SUMMARY = "orca deamon for udx710 700M "
RDEPENDS_packagegroup-unisoc-base-orca-deamon = " \
    led-deamon \
    liborcaled \
    test-entry \
    keyevent-deamon \
"

SUMMARY = "service-plugins for yocto common"
RDEPENDS_packagegroup-unisoc-base-service-plugins = " \
    service-plugins \
"

SUMMARY_packagegroup-unisoc-base-inireader = "ini file read, set and dump"
RDEPENDS_packagegroup-unisoc-base-inireader = " \
    inireader \
"

SUMMARY_packagegroup-unisoc-base-radio = "radio packages including ofono ril and xmlparser"
RDEPENDS_packagegroup-unisoc-base-radio = " \
    ofono \
    rilutils \
    rilsprd \
    sprd-ril \
    sprdrild \
    rilmbim \
    mbim-daemon \
    appdemo \
"

SUMMARY_packagegroup-unisoc-base-rgbled = "rgbled api for sl8563-cpe"
RDEPENDS_packagegroup-unisoc-base-rgbled= "\
    rgbled \
    ${@bb.utils.contains('USERDEBUG', 'userdebug', 'rgbled-demo', '',d)} \
"

SUMMARY_packagegroup-unisoc-base-engpc = "engpc for cali && factory test"
RDEPENDS_packagegroup-unisoc-base-engpc= "\
    libtcard \
    engpc-srv \
    engpc-adapt \
    engpc-ctl \
    atci \
    libmiscdata \
    librtc \
    libgpio \
    libkpd \
    liblkv \
    libapopt \
    libcharge \
    libapcomm\
    libftmode \
    libapdeepsleep \
    libtsxdata \
    libfactoryreset \
    libfactorysensor \
    liborca \
    libtp \
    librebootcmd \
    libregulator \
    libchipid \
    libnefuse \
    libetb \
    libusbtypec \
    libadc \
    libautotestwifi \
    libpartinfo \
    libsensor \
    ${@bb.utils.contains('DISTRO_FEATURES', 'wayland', 'liblcdnpi', '',d)} \
"

SUMMARY_packagegroup-unisoc-base-sttest = "system test"
RDEPENDS_packagegroup-unisoc-base-sttest = "\
    libsttest \
"
SUMMARY_packagegroup-unisoc-base-qtdemo = "qt demo collect"
RDEPENDS_packagegroup-unisoc-base-qtdemo = "\
    qtcamerademo \
    qtusbcamera \
    qtgpsdemo \
    qtlauncher \
"

SUMMARY_packagegroup-unisoc-base-qtdialor = "qt demo qtdialor for PSD"
RDEPENDS_packagegroup-unisoc-base-qtdialor = "\
    qtdialor \
"

SUMMARY_packagegroup-unisoc-base-qtgsensor = "qt demo qtgsensor for PSD"
RDEPENDS_packagegroup-unisoc-base-qtgsensor = "\
    qtgsensor \
"
SUMMARY_packagegroup-unisoc-base-qtpbapdemo = "qt pbapdemo "
RDEPENDS_packagegroup-unisoc-base-qtpbapdemo = "\
    qtpbapdemo \
"

SUMMARY_packagegroup-unisoc-base-qtwifidemo = "qt wifi demo"
RDEPENDS_packagegroup-unisoc-base-qtwifidemo = "\
    qtwifidemo \
"

SUMMARY_packagegroup-unisoc-base-qtsysnotify = "qt demo qtsysnotify for PSD"
RDEPENDS_packagegroup-unisoc-base-qtsysnotify = "\
    qtsysnotify \
"

SUMMARY_packagegroup-unisoc-base-libwatermark = "libwatermark"
RDEPENDS_packagegroup-unisoc-base-libwatermark = "\
    libwatermark \
"

SUMMARY_packagegroup-unisoc-base-pm = "Power management"
RDEPENDS_packagegroup-unisoc-base-pm = "\
    pm \
"

SUMMARY_packagegroup-unisoc-base-factorytest = "factory test"
RDEPENDS_packagegroup-unisoc-base-factorytest = "\
    factorytest \
    factoryradiotest \
"

SUMMARY_packagegroup-unisoc-base-nativemmi = "nativemmi module for factorytest"
RDEPENDS_packagegroup-unisoc-base-nativemmi = "\
    nativemmi \
"

SUMMARY_packagegroup-unisoc-base-runtimetest = "runtimetest module for agingtest"
RDEPENDS_packagegroup-unisoc-base-runtimetest = "\
    runtimetest \
    runtimetestui \
"
SUMMARY_packagegroup-unisoc-base-charge = "power off charge"
RDEPENDS_packagegroup-unisoc-base-charge = "\
    charge \
"

SUMMARY_packagegroup-unisoc-base-usbcontrol = "usbcontrol for monitor && enum"
RDEPENDS_packagegroup-unisoc-base-usbcontrol= "\
    usbcontrol \
    umtp-responder \
"

SUMMARY_packagegroup-unisoc-base-aqtool = "aqtool for orca"
RDEPENDS_packagegroup-unisoc-base-aqtool= "\
    pcieupdate \
"

# add unisoc trusty function here
SUMMARY_packagegroup-unisoc-base-trusty = "trusty packages"
RDEPENDS_packagegroup-unisoc-base-trusty = " \
    libtrusty \
"

SUMMARY_packagegroup-unisoc-base-pppdial = "pppdial for sl8563"
RDEPENDS_packagegroup-unisoc-base-pppdial= "\
    pppdial \
"

SUMMARY_packagegroup-unisoc-base-pppd = "pppd packages"
RDEPENDS_packagegroup-unisoc-base-pppd= "\
    ppp \
    radvd \
"

SUMMARY_packagegroup-unisoc-base-netfuns = "netfuns packages"
RDEPENDS_packagegroup-unisoc-base-netfuns= "\
    ipv6drophop \
"

# add unisoc production function here
SUMMARY_packagegroup-unisoc-base-production = "production packages"
RDEPENDS_packagegroup-unisoc-base-production = " \
    libteeproduction \
    libdynamicproduction \
    libcheckx \
    libgetuid \
"

# add unisoc secure storage function here
SUMMARY_packagegroup-unisoc-base-storage = "secure storage packages"
RDEPENDS_packagegroup-unisoc-base-storage = " \
    sprdstorage \
    libsprdtrustystorage \
"

# add unisoc tsupplicant function here
SUMMARY_packagegroup-unisoc-base-tsupplicant = "tsupplicant packages"
RDEPENDS_packagegroup-unisoc-base-tsupplicant = " \
    tsupplicant \
"


#alsa lib group
SUMMARY_packagegroup-unisoc-base-alsa = "alsa packages"
RDEPENDS_packagegroup-unisoc-base-alsa = " \
    alsa-lib \
    alsa-utils \
    alsa-plugins \
"

#pulseaudio group
SUMMARY_packagegroup-unisoc-base-pulseaudio = "pulseaudio packages"
RDEPENDS_packagegroup-unisoc-base-pulseaudio = " \
    libpulsecore \
    pulseaudio-dev \
    pulseaudio-server \
    libpulse-simple \
    audiodaemon \
    paconfig \
"

#gstreamer group
SUMMARY_packagegroup-unisoc-base-gstreamer = "gstreamer packages"
RDEPENDS_packagegroup-unisoc-base-gstreamer = " \
    gstreamer1.0 \
    gstreamer1.0-plugins-good \
    gstreamer1.0-plugins-bad \
    gstreamer1.0-plugins-base \
    gstreamer1.0-meta-base \
    gstreamer1.0-plugins-ugly \
    gstreamer1.0-libav \
    gstreamer1.0-omx \
"
#jpg codes group
SUMMARY_packagegroup-unisoc-base-jpeg = "jpeg codecs packages"
RDEPENDS_packagegroup-unisoc-base-jpeg = " \
    libjpegencswsprd \
    libjpeghwsprd \
"
#video codes group
SUMMARY_packagegroup-unisoc-base-video = "video codecs packages"
RDEPENDS_packagegroup-unisoc-base-video = " \
    libsprdomxcore \
    ${ADD_OMX_AVC_DEC_HW} \
    ${ADD_OMX_AVC_DEC_SW} \
    ${ADD_OMX_AVC_ENC_HW} \
    ${ADD_OMX_HEVC_DEC_HW} \
    ${ADD_OMX_HEVC_ENC_HW} \
    ${ADD_OMX_M4V_H263_DEC_HW} \
    ${ADD_OMX_M4V_H263_DEC_SW} \
    ${ADD_OMX_M4V_H263_ENC_SW} \
    ${ADD_OMX_VP8_DEC_HW} \
    ${ADD_OMX_VP9_DEC_HW} \
    ${ADD_UTEST_AVC_DEC} \
    ${ADD_UTEST_AVC_ENC} \
    ${ADD_UTEST_HEVC_DEC} \
    ${ADD_UTEST_HEVC_ENC} \
    ${ADD_UTEST_M4V_H263_DEC} \
    ${ADD_UTEST_M4V_H263_ENC} \
    ${ADD_UTEST_VP8_DEC} \
    ${ADD_UTEST_VP9_DEC} \
    ${ADD_STGFRT_AVC_DEC} \
    ${ADD_STGFRT_AVC_ENC} \
    ${ADD_STGFRT_HEVC_DEC} \
    ${ADD_STGFRT_HEVC_ENC} \
    ${ADD_STGFRT_M4V_H263_DEC} \
    ${ADD_STGFRT_M4V_H263_ENC} \
    ${ADD_STGFRT_VP8_DEC} \
    ${ADD_STGFRT_VP9_DEC} \
    utestvideodec \
    utestvideoenc \
"

#memion group
SUMMARY_packagegroup-unisoc-base-memion = "memion packages"
RDEPENDS_packagegroup-unisoc-base-memion = " \
    libmemion \
"

#libcamera group
SUMMARY_packagegroup-unisoc-base-libcamera = "libcamera packages"
RDEPENDS_packagegroup-unisoc-base-libcamera = " \
    libcamcommon \
    libcamsensor \
    libcam-otp-parser \
    libcam-af-drv \
    libispalg \
    libcamdrv \
    libcampm \
    libcam-tuning-param \
    libcam-otp-drv \
    libcam-sensor-drv \
    libcamoem \
    libcppdrv \
    sprd-cpp \
    sprd-sensor \
    sprd-flash-drv \
    sprd-camera \
    v4l2camera \
    minicamera \
    libcamv4l2adapter \
    libcam-ini-parser \
    libcamcalitest \
    camxmlparser \
    camlib \
    libcamv4l2yuv2rgb \
    isptuning \
    unittest \
    libcamfactorytest \
    multicamera \
    highfpscamera \
    ${@bb.utils.contains('CAMERA_BOARD', 'sl8541-base', 'multistreams', '',d)} \
"
#libgstcamera group
SUMMARY_packagegroup-unisoc-base-libgstcamera = "camera gstreamer packages"
RDEPENDS_packagegroup-unisoc-base-libgstcamera = " \
    libgstcamera \
"

#flash factory test group
SUMMARY_packagegroup-unisoc-base-ocp8137 = "flash ic ocp8137"
RDEPENDS_packagegroup-unisoc-base-ocp8137 = "\
    flash-ic-ocp8137 \
"
SUMMARY_packagegroup-unisoc-base-sc2721s = "flash ic sc2721s"
RDEPENDS_packagegroup-unisoc-base-sc2721s = "\
    flash-ic-sc2721s \
"

SUMMARY_packagegroup-unisoc-base-libbt = "vendor bluetooth module"
RDEPENDS_packagegroup-unisoc-base-libbt = "\
    libbt \
    btsuite \
    libbteut \
    libengbt \
"

SUMMARY_packagegroup-unisoc-base-wcnini-marlin2 = "vendor wcn marlin2 module"
RDEPENDS_packagegroup-unisoc-base-wcnini-marlin2 = "\
    wcnini-marlin2 \
"

SUMMARY_packagegroup-unisoc-base-wcnini-marlin3lite = "vendor wcn marlin3lite module"
RDEPENDS_packagegroup-unisoc-base-wcnini-marlin3lite = "\
    wcnini-marlin3lite \
"

SUMMARY_packagegroup-unisoc-base-wcnini-marlin3e = "vendor wcn marlin3e module"
RDEPENDS_packagegroup-unisoc-base-wcnini-marlin3e = "\
    wcnini-marlin3e \
"

SUMMARY_packagegroup-unisoc-base-hciattach = "bluez5 hciattach"
RDEPENDS_packagegroup-unisoc-base-hciattach= "\
    hciattach \
"

SUMMARY_packagegroup-unisoc-base-bluetooth = "bluetooth"
RDEPENDS_packagegroup-unisoc-base-bluetooth = "\
    bluez5 \
"

SUMMARY_packagegroup-unisoc-base-gnss = "gnss & agnss package"
RDEPENDS_packagegroup-unisoc-base-gnss = "\
    gnss \
"

#libopdm group
SUMMARY_packagegroup-unisoc-base-libopdm = "operator dm utility lib"
RDEPENDS_packagegroup-unisoc-base-libopdm = " \
    opdmutility \
"

#cmccdm group
SUMMARY_packagegroup-unisoc-base-cmccdm = "cmcc dm"
RDEPENDS_packagegroup-unisoc-base-cmccdm = " \
    cmccdm \
    opdmutility \
    cmccdmsdk \
"
#ctcc iotdm group
SUMMARY_packagegroup-unisoc-base-ctcc = "ctcc iotdm"
RDEPENDS_packagegroup-unisoc-base-ctcc = " \
    regservice \
    regdaemon \
"
#ctcc iotdm libgroup
SUMMARY_packagegroup-unisoc-base-libctcc = "ctcc iotdm lib"
RDEPENDS_packagegroup-unisoc-base-libctcc = " \
    json-c \
"

#rfkill group
SUMMARY_packagegroup-unisoc-base-rfkill = "rfkill module"
RDEPENDS_packagegroup-unisoc-base-rfkill = " \
    rfkill \
"

# add unisoc-gnss-ota
SUMMARY_packagegroup-unisoc-base-gnss-ota = "gnss-ota test, depend on MACHINE_FEATURES in user image"
RDEPENDS_packagegroup-unisoc-base-gnss-ota = " \
    gnss-ota \
"

# add unisoc-gpsd and gpsd function here
SUMMARY_packagegroup-unisoc-base-unisoc-gpsd = "unisoc-gpsd and gpsd packages, depend on MACHINE_FEATURES in user image"
RDEPENDS_packagegroup-unisoc-base-unisoc-gpsd = " \
    unisoc-gpsd \
    gpsd \
    test-unisoc-gpsd \
"

# add geoclue function here
SUMMARY_packagegroup-unisoc-base-geoclue = "geoclue packages, depend on MACHINE_FEATURES in user image"
RDEPENDS_packagegroup-unisoc-base-geoclue = " \
    geoclue \
"

# add benchmark function here
SUMMARY_packagegroup-unisoc-base-benchmark = "benchmark packages "
RDEPENDS_packagegroup-unisoc-base-benchmark = " \
    bonnie++ \
    dhrystone \
    fio \
    linpack \
    lmbench \
    sysbench \
    tinymembench \
    whetstone \
    ${@bb.utils.contains('IPERF_VERSION', 'iperf2', 'iperf2', 'iperf3',d)} \
    flashtest \
"

#audio group
SUMMARY_packagegroup-unisoc-base-audio = "audio packages"
RDEPENDS_packagegroup-unisoc-base-audio = " \
    audiospeex \
    audionpitest \
    audioutil \
    audionpi \
"

#audio-phoenix group
SUMMARY_packagegroup-unisoc-base-audio-phoenix = "audio-phoenix packages"
RDEPENDS_packagegroup-unisoc-base-audio-phoenix = " \
    audiospeex-phoenix \
    audionpitest-phoenix \
    audioutil-phoenix \
    audionpi-phoenix \
"

#audiohal group
SUMMARY_packagegroup-unisoc-base-audiohal = "audiohal packages"
RDEPENDS_packagegroup-unisoc-base-audiohal = " \
    audiohal \
    tinyxml \
    voice \
    audiominiap \
"

#audiohal-phoenix group
SUMMARY_packagegroup-unisoc-base-audiohal-phoenix = "audiohal-phoenix packages"
RDEPENDS_packagegroup-unisoc-base-audiohal-phoenix = " \
    audiohaltest \
    audiohal-phoenix \
    tinyxml-phoenix \
    audioparamteser \
"

#voicecall group
SUMMARY_packagegroup-unisoc-base-voicecall = "voicecall packages"
RDEPENDS_packagegroup-unisoc-base-voicecall = " \
    voicecall \
    voicecalltest \
    voicecall-monitor \
    audiovoicedaemon \
    voicecall-device \
"

# add xen-tools function here
SUMMARY_packagegroup-unisoc-base-xen-tools = "xen tools"
RDEPENDS_packagegroup-unisoc-base-xen-tools = "\
    xen-tools-console \
    xen-tools-dbg \
    xen-tools-dev \
    xen-tools-devd \
    xen-tools-flask-tools \
    xen-tools-fsimage \
    xen-tools-init-xenstore-dom \
    xen-tools-libfsimage \
    xen-tools-libfsimage-dev \
    xen-tools-libxencall \
    xen-tools-libxencall-dev \
    xen-tools-libxenctrl \
    xen-tools-libxenctrl-dev \
    xen-tools-libxendevicemodel \
    xen-tools-libxendevicemodel-dev \
    xen-tools-libxenevtchn \
    xen-tools-libxenevtchn-dev \
    xen-tools-libxenforeignmemory \
    xen-tools-libxenforeignmemory-dev \
    xen-tools-libxengnttab \
    xen-tools-libxengnttab-dev \
    xen-tools-libxenguest \
    xen-tools-libxenguest-dev \
    xen-tools-libxenlight \
    xen-tools-libxenlight-dev \
    xen-tools-libxenstat \
    xen-tools-libxenstat-dev \
    xen-tools-libxenstore \
    xen-tools-libxenstore-dev \
    xen-tools-libxentoolcore \
    xen-tools-libxentoolcore-dev \
    xen-tools-libxentoollog \
    xen-tools-libxentoollog-dev \
    xen-tools-libxenvchan \
    xen-tools-libxenvchan-dev \
    xen-tools-libxlutil \
    xen-tools-libxlutil-dev \
    xen-tools-livepatch \
    xen-tools-misc \
    xen-tools-remus \
    xen-tools-scripts-block \
    xen-tools-scripts-common \
    xen-tools-scripts-network \
    xen-tools-staticdev \
    xen-tools-volatiles \
    xen-tools-xencommons \
    xen-tools-xendomains \
    xen-tools-xenmon \
    xen-tools-xenpmd \
    xen-tools-xenstat \
    xen-tools-xenstore \
    xen-tools-xenstored \
    xen-tools-xentrace \
    xen-tools-xen-watchdog \
    xen-tools-xl \
    xen-tools-xl-examples \
    domu-guest \
"

# add sleepwakeup-tool here
SUMMARY_packagegroup-unisoc-base-sleepwakeup-tool = "sleepwakeup tools"
RDEPENDS_packagegroup-unisoc-base-sleepwakeup-tool = "\
    sleepwakeup \
"

#wifi factory test group: sc2332
SUMMARY_packagegroup-unisoc-base-wifitest-sc2332 = "wifi factory test group , sc2332"
RDEPENDS_packagegroup-unisoc-base-wifitest-sc2332 = "\
    iwnpi-sc2332 \
    libwifieut-sc2332 \
"

#wifi factory test group: sc2355
SUMMARY_packagegroup-unisoc-base-wifitest-sc2355 = "wifi factory test group , sc2355"
RDEPENDS_packagegroup-unisoc-base-wifitest-sc2355 = "\
    iwnpi-sc2355 \
    libwifieut-sc2355 \
"

# upower
SUMMARY_packagegroup-unisoc-base-upower = "upower"
RDEPENDS_packagegroup-unisoc-base-upower = "\
    upower \
    suspendblocker \
"

# pm-powersave
SUMMARY_packagegroup-unisoc-base-powersave = "powersave"
RDEPENDS_packagegroup-unisoc-base-powersave = "\
    powersave \
"

# pm-powerd
SUMMARY_packagegroup-unisoc-base-powerd = "powerd"
RDEPENDS_packagegroup-unisoc-base-powerd = "\
    powerd \
"

# mali midgard gpu
SUMMARY_packagegroup-unisoc-base-midgard = "Mali Midgard GPU Kernel and User Space Drivers"
RDEPENDS_packagegroup-unisoc-base-midgard = "\
    midgard \
    libmidgard \
"

# Imgtec PowerVR Rogue GPU
SUMMARY_packagegroup-unisoc-base-pvr-rogue = "IMG PowerVR Rogue GPU Kernel & User Space Drivers"
RDEPENDS_packagegroup-unisoc-base-pvr-rogue = "\
    rogue-km \
    rogue-um \
"
# IMG Rogue gpu VZ
SUMMARY_packagegroup-unisoc-base-rogue-vz = "IMG Rogue GPU VZ Drivers"
RDEPENDS_packagegroup-unisoc-base-rogue-vz = "\
    rogue-vz-km \
    rogue-vz-um \
"
# localtime
SUMMARY_packagegroup-unisoc-base-localtime = "add local time modules"
RDEPENDS_packagegroup-unisoc-base-localtime = "\
    tzdata \
    ntp    \
"
# ntp_daemon
SUMMARY_packagegroup-unisoc-base-ntpdaemon = "restart ntp when wifi connected"
RDEPENDS_packagegroup-unisoc-base-ntpdaemon = "\
    ntpdaemon \
"

# fs debug tools
SUMMARY_packagegroup-unisoc-base-fs-debug-tools = "add fs debug tools"
RDEPENDS_packagegroup-unisoc-base-fs-debug-tools = "\
    e2fsprogs\
    e2fsprogs-resize2fs \
"

SUMMARY_packagegroup-unisoc-base-userdata-resize2fs = "auto resize userdata space "
RDEPENDS_packagegroup-unisoc-base-userdata-resize2fs = " \
    resize2fs-script \
"

#libjson-c
SUMMARY_packagegroup-unisoc-base-libjsonc = "libjsonc"
RDEPENDS_packagegroup-unisoc-base-libjsonc = " \
    json-c \
"
#libbqbbt
SUMMARY_packagegroup-unisoc-base-libbqbbt = "libbqbbt"
RDEPENDS_packagegroup-unisoc-base-libbqbbt = " \
    libbqbbt \
"

SUMMARY_packagegroup-unisoc-base-vorbis-tools = "vorbis-tools packages"
RDEPENDS_packagegroup-unisoc-base-vorbis-tools = " \
    vorbis-tools \
    libao \
"

SUMMARY_packagegroup-unisoc-base-r8125 = "Unisoc r8125 drivers"
RDEPENDS_packagegroup-unisoc-base-r8125 = "\
    r8125 \
"

SUMMARY_packagegroup-unisoc-base-libgomp = "for Unisoc sl8541 smartpen"
RDEPENDS_packagegroup-unisoc-base-libgomp = "\
    libgomp \
"
# for sensorhub
SUMMARY_packagegroup-unisoc-base-libsensorhub = "libsensorhub"
RDEPENDS_packagegroup-unisoc-base-libsensorhub = "\
     libsensorhub \
"

# for sensorclassic
SUMMARY_packagegroup-unisoc-base-libsensorclassic = "libsensorclassic"
RDEPENDS_packagegroup-unisoc-base-libsensorclassic = "\
     libsensorclassic \
"
# hostapd
SUMMARY_packagegroup-unisoc-base-hostapd = "wifi SoftAP supported"
RDEPENDS_packagegroup-unisoc-base-hostapd = "\
    hostapd \
"

# for batterymanager
SUMMARY_packagegroup-unisoc-base-batterymanager = "batterymanager"
RDEPENDS_packagegroup-unisoc-base-batterymanager = "\
     batterymanager \
"

# for hello sagereal
SUMMARY_packagegroup-unisoc-base-hello-sagereal = "hello sagereal"
RDEPENDS_packagegroup-unisoc-base-hello-sagereal = "\
    hello-sagereal \
"

SUMMARY_packagegroup-unisoc-base-engmodeapp = "engmodeapp for debug"
RDEPENDS_packagegroup-unisoc-base-engmodeapp= "\
    engmodeapp \
"

SUMMARY_packagegroup-unisoc-base-reserve-space = "reserve space"
RDEPENDS_packagegroup-unisoc-base-reserve-space= "\
    reserve-space \
"
