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

require ${OEROOT}/layers/meta-unisoc/recipes-devtools/adbd/adbd.inc

PROVIDES = "${PACKAGES}"

PACKAGES = ' \
    packagegroup-unisoc-console \
'

DEBUG_USER = "${@bb.utils.contains('MACHINE_FEATURES', 'debug-user',bb.utils.contains('DEBUG_TOOLS_FLAG','yes','','packagegroup-unisoc-base-debug-user',d), '',d)}"

RDEPENDS_packagegroup-unisoc-console ??= "\
    kernel-modules \
    os-release \
    ${@bb.utils.contains('DISTRO_FEATURES', 'lsb', 'lsb', '', d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'watchdog', 'watchdog', '', d)} \
    ${@bb.utils.contains('ADB_SRC_MODE', 'customer', '', 'adbd', d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'lrzsz', 'lrzsz', '', d)} \
    ${@bb.utils.contains('USERDEBUG', 'userdebug', 'packagegroup-unisoc-base-debug', '', d)} \
    ${@bb.utils.contains('USERDEBUG', 'userdebug', bb.utils.contains('DEBUG_TOOLS_FLAG','yes','','packagegroup-unisoc-base-debug-user',d), DEBUG_USER, d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'connman', 'packagegroup-unisoc-base-connman', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'ntpdaemon', 'packagegroup-unisoc-base-ntpdaemon', '',d)} \
	${@bb.utils.contains('MACHINE_FEATURES', 'smartlink', 'packagegroup-unisoc-base-smartlink', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'wpa-supplicant', 'packagegroup-unisoc-base-wpa-supplicant', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'modem', 'packagegroup-unisoc-base-modem', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'trusty','packagegroup-unisoc-base-trusty', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'radio', 'packagegroup-unisoc-base-radio', '',d)} \
    ${@bb.utils.contains('DISTRO_FEATURES', 'ram', 'ram', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'rgbled', 'packagegroup-unisoc-base-rgbled', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'bt-tool', 'packagegroup-unisoc-base-bt-tool', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'keyevent', 'keyevent', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'autoreboot', 'autoreboot', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'usbcontrol', 'packagegroup-unisoc-base-usbcontrol', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'aqtool', 'packagegroup-unisoc-base-aqtool', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'gnss-ota', 'packagegroup-unisoc-base-gnss-ota', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'unisoc-gpsd', 'packagegroup-unisoc-base-unisoc-gpsd', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'orca-deamon', 'packagegroup-unisoc-base-orca-deamon', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'service-plugins', 'packagegroup-unisoc-base-service-plugins', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'geoclue', 'packagegroup-unisoc-base-geoclue', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'engpc', 'packagegroup-unisoc-base-engpc', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'factorytest', 'packagegroup-unisoc-base-factorytest', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'nativemmi', 'packagegroup-unisoc-base-nativemmi', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'engmodeapp', 'packagegroup-unisoc-base-engmodeapp', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'runtimetest', 'packagegroup-unisoc-base-runtimetest', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'charge', 'packagegroup-unisoc-base-charge', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'production', 'packagegroup-unisoc-base-production', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'storage','packagegroup-unisoc-base-storage', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'tsupplicant','packagegroup-unisoc-base-tsupplicant', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'pm', 'packagegroup-unisoc-base-pm', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'hello-sagereal', 'packagegroup-unisoc-base-hello-sagereal', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'powerd', 'packagegroup-unisoc-base-powerd', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'terminal', 'packagegroup-unisoc-base-terminal', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'ecell-socket', 'packagegroup-unisoc-base-ecell-socket', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'thermald', 'thermald', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'pppdial', 'packagegroup-unisoc-base-pppdial', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'pppd', 'packagegroup-unisoc-base-pppd', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'netfuns', 'packagegroup-unisoc-base-netfuns', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'fsckmsdos', 'fsckmsdos', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'alsa', 'packagegroup-unisoc-base-alsa', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'pulseaudio', 'packagegroup-unisoc-base-pulseaudio', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'tinyalsa', 'tinyalsa', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'native_gzip', 'gzip', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'gstreamer', 'packagegroup-unisoc-base-gstreamer', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'aprd', 'packagegroup-unisoc-base-aprd', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'video', 'packagegroup-unisoc-base-video', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'jpeg', 'packagegroup-unisoc-base-jpeg', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'memion', 'packagegroup-unisoc-base-memion', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'libcamera', 'packagegroup-unisoc-base-libcamera', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'audiocmp', 'audiocmp', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'audio', 'packagegroup-unisoc-base-audio', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'audio-phoenix', 'packagegroup-unisoc-base-audio-phoenix', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'audiohal', 'packagegroup-unisoc-base-audiohal', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'audiohal-phoenix', 'packagegroup-unisoc-base-audiohal-phoenix', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'voicecall', 'packagegroup-unisoc-base-voicecall', '',d)} \
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
    ${@bb.utils.contains('MACHINE_FEATURES', 'xen-tools', 'packagegroup-unisoc-base-xen-tools', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'wifitest-sc2332', 'packagegroup-unisoc-base-wifitest-sc2332', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'wifitest-sc2355', 'packagegroup-unisoc-base-wifitest-sc2355', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'upower', 'packagegroup-unisoc-base-upower', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'pvr-rogue', 'packagegroup-unisoc-base-pvr-rogue', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'rogue-vz', 'packagegroup-unisoc-base-rogue-vz', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'bluetooth', 'packagegroup-unisoc-base-bluetooth', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'localtime', 'packagegroup-unisoc-base-localtime', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'networkutils', 'packagegroup-unisoc-base-networkutils', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'ota-adapter', 'packagegroup-unisoc-base-ota-adapter', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'fs_tools', 'packagegroup-unisoc-base-fs-debug-tools', '',d)} \
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
    ${@bb.utils.contains('MACHINE_FEATURES', 'libsensorhub', 'packagegroup-unisoc-base-libsensorhub', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'batterymanager', 'packagegroup-unisoc-base-batterymanager', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'sttest', 'packagegroup-unisoc-base-sttest', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'qtdemo', 'packagegroup-unisoc-base-qtdemo', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'qtdialor', 'packagegroup-unisoc-base-qtdialor', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'qtgsensor', 'packagegroup-unisoc-base-qtgsensor', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'qtsysnotify', 'packagegroup-unisoc-base-qtsysnotify', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'qtpbapdemo', 'packagegroup-unisoc-base-qtpbapdemo', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'qtwifidemo', 'packagegroup-unisoc-base-qtwifidemo', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'reserve-space', 'packagegroup-unisoc-base-reserve-space', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'watermark', 'packagegroup-unisoc-base-libwatermark', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'sysdump', 'packagegroup-unisoc-base-sysdump', '',d)} \
    ${@bb.utils.contains('MACHINE_FEATURES', 'hostapd', 'packagegroup-unisoc-base-hostapd', '',d)} \
"
