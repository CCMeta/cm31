DESCRIPTION = "hello-sagereal program"
HOMEPAGE = "http://www.sagereal.com/"

#DEPENDS = "dbus glib-2.0 bluez5"
#RDEPENDS_${PN} = "dbus glib-2.0 bluez5"

LICENSE = "UNISOC"
SECTION = "bin"
LIC_FILES_CHKSUM = "file://COPYING;md5=d41d8cd98f00b204e9800998ecf8427e"
PV = "0.5"
PR = "r0"

#inherit autotools
inherit autotools-brokensep pkgconfig update-rc.d

PROVIDES = "hello-sagereal"

EXTERNALSRC = "${OEROOT}/source/sagereal/hello-sagereal"
EXTERNALSRC_BUILD = "${OEROOT}/source/sagereal/hello-sagereal"

INSANE_SKIP_${PN} += "already-stripped"

do_compile () {
}

do_install () {
    install -d ${D}${sysconfdir}/init.d
    install -m 0755 ${B}/cm31_api-init-wifi ${D}/${INIT_D_DIR}/cm31_api-init-wifi
}

INITSCRIPT_PACKAGES = "${PN}"
INITSCRIPT_NAME_${PN} = "cm31_api-init-wifi"
INITSCRIPT_PARAMS_${PN} = "defaults 99"

TARGET_CC_ARCH += "${LDFLAGS}"
