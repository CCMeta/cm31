#!/bin/bash

build_time=$(date "+%Y%m%d%H%M%S")
timename=$1+$2+${build_time}+timemsg.log

timedir=${PWD}/prebuilts/scripts
echo "" >> ${timedir}/${timename}
echo "---------------- hardware info ----------------" >> ${timedir}/${timename}
cat /proc/meminfo | grep MemFree >> ${timedir}/${timename}
cat /proc/meminfo | grep MemAvailable >> ${timedir}/${timename}
physical_id=`cat /proc/cpuinfo |grep "physical id"|sort |uniq|wc -l`
processor=`cat /proc/cpuinfo |grep "processor"|wc -l`
echo "physical CPU: ${physical_id}" >> ${timedir}/${timename}
echo "processor CPU: ${processor}" >> ${timedir}/${timename}
cat /proc/cpuinfo |grep "cores"|uniq >> ${timedir}/${timename}

echo "" >> ${timedir}/${timename}
echo "---------------- service info ----------------" >> ${timedir}/${timename}
echo "USERNAME: ${USER}" >> ${timedir}/${timename}
echo "HOSTNAME: ${HOSTNAME}" >> ${timedir}/${timename}
echo "ip info" >> ${timedir}/${timename}
ifconfig >> ${timedir}/${timename}

echo "" >> ${timedir}/${timename}
echo "---------------- build info ------------------" >> ${timedir}/${timename}
echo "pac name: $1 $2" >> ${timedir}/${timename}

echo "" >> ${timedir}/${timename}
echo "----------------- time info ------------------" >> ${timedir}/${timename}
echo "BUILD BEGIN: $(date "+%Y-%m-%d %H:%M:%S")" >> ${timedir}/${timename}
BEGIN_TIME=`date +%s`
btime=`date +%s`

long_help_message="
build.sh help message as below:
   -h, --help, ?    report help message
   -m, MACHINE      print MACHINENAME list
   -d, DISTRO       print DISTRONAME list
   -i, IMAGE        print IMAGENAME list
   -u, USER         print USERNAME list， [userdebug as default]

    ##--------------------------------------------------------------------##
    ## build.sh arguments include:                                        ##
    ##     MACHINENAME, DISTRONAME, IMAGENAME, USERNAME                   ##
    ##                                                                    ##
    ## build modle:                                                       ##
    ##    ./build.sh MACHINENAME+DISTRONAME+IMAGENAME USERNAME            ##
    ##                                                                    ##
    ## build sample:                                                      ##
    ##    ./build.sh sl8563-cpe-2h10+initgc+console userdebug             ##
    ##------------------------------------------------------------------- ##
"
machinelist=(sl8563-cpe sl8563-cpe-1c sl8563-cpe-2h10 sl8563-cpe-2h10-vsim sl8563-base ud710-ai ud710-base sl8541-base sl8521e-base ud710-96board t710-smartcoreboard sl8521e-smartcoreboard sl8541e-nand-marlin3lite sl8541e-nand-marlin2)
distrolist=(console tiny initgc)
imagelist=(console docker minimal tiny prerootfs wayland)
userlist=(userdebug user eng)

func_build_list ()
{
    names=$1
    echo "$2 list:"
    for ((i=0; i<${#names[*]}; i++))
    {
       echo ${names[$i]}
    }
    exit 0;
}

func_long_help_messge ()
{
    echo "$long_help_message"
    exit 0
}

func_help()
{
     for loop in $@
     do
         case $loop in
         ?|-h|*help)
                func_long_help_messge
                break
                ;;
         -m|MACHINE)
                func_build_list "${machinelist[*]}" "MACHINENAME"
                break
                ;;
         -d|DISTRO)
                func_build_list "${distrolist[*]}" "DISTRONAME"
                break
                ;;
         -i|IMAGE)
                func_build_list "${imagelist[*]}" "IMAGENAME"
                break
                ;;
         -u|USER)
                func_build_list "${userlist[*]}" "USERNAME"
                break
                ;;
         *)
                break
                ;;
         esac
     done
}

fun_change_image_rootfs_dir(){
    if [ ! -e "${ROOTFS_EXT4_GZ}" ];then
        echo "${ROOTFS_EXT4_GZ} is not exsit"
        return 1
    fi
    echo "begin mount ext4 for IMAGE_ROOTFS make has less difference"
    if [ ! -d "${EXT4_MOUNT_POINT}" ];then
        mkdir -p ${EXT4_MOUNT_POINT}
        rm -rf ${ROOTFS_EXT4_DIR}
        mkdir -p ${ROOTFS_EXT4_DIR}
    else
        echo "${EXT4_MOUNT_POINT} is exsit ,so umout and rm it first!"
        ext4fsdir="${SOURCEROOT}/${EXT4_MOUNT_POINT}"
        dirmountinfo=`df -h | grep ${ext4fsdir}`
        if [ -n "${dirmountinfo}" ];then
            echo "sudo umount ${EXT4_MOUNT_POINT}"
            sudo umount ${EXT4_MOUNT_POINT}
            if [ $? != 0 ]; then
                echo "The procedure of fun_make_image_rootfs_point is failed, shell error line: $LINENO"
                return 1
            fi
        fi
        echo "rm -rf ${EXT4_MOUNT_POINT}"
        rm -rf ${EXT4_MOUNT_POINT}
        if [ $? != 0 ]; then
            echo "The procedure of fun_make_image_rootfs_point is failed, shell error line: $LINENO"
            return 1
        fi
        mkdir -p ${EXT4_MOUNT_POINT}
        rm -rf ${ROOTFS_EXT4_DIR}
        mkdir -p ${ROOTFS_EXT4_DIR}
    fi
    FILE_USER=`ls -l | grep "${EXT4_MOUNT_POINT}" | awk '{print $3}'`
    echo "FILE_USER is ${FILE_USER}"
    FILE_USER_GROUP=`ls -l | grep "${EXT4_MOUNT_POINT}" | awk '{print $4}'`
    echo "FILE_USER_GROUP is ${FILE_USER_GROUP}"
    cp ${ROOTFS_EXT4_GZ} ${ROOTFS_EXT4}.gz
    gzip -d ${ROOTFS_EXT4}.gz
    chmod 777 ${ROOTFS_EXT4}
    echo "sudo mount -o loop ${ROOTFS_EXT4} ${EXT4_MOUNT_POINT}"
    sudo mount -o loop ${ROOTFS_EXT4} ${EXT4_MOUNT_POINT}
    if [ $? != 0 ]; then
        echo "The procedure of fun_make_image_rootfs_point is failed, shell error line: $LINENO"
        sudo umount ${EXT4_MOUNT_POINT}
        return 1
    fi
    if [ $? != 0 ]; then
        echo "The procedure of fun_make_image_rootfs_point is failed, shell error line: $LINENO"
        sudo umount ${EXT4_MOUNT_POINT}
        if [ $? != 0 ]; then
            echo "failed to umount ${EXT4_MOUNT_POINT},please umount it in manual: $LINENO"
            return 1
        fi
        return 1
    fi
    echo "sudo chown "${FILE_USER}" ${EXT4_MOUNT_POINT}"
    sudo chown "${FILE_USER}" ${EXT4_MOUNT_POINT}
    if [ $? != 0 ]; then
        echo "The procedure of fun_make_image_rootfs_point is failed, shell error line: $LINENO"
        sudo umount ${EXT4_MOUNT_POINT}
        if [ $? != 0 ]; then
            echo "failed to umount ${EXT4_MOUNT_POINT},please umount it in manual: $LINENO"
            return 1
        fi
        return 1
    fi
    echo `ls -l | grep "${EXT4_MOUNT_POINT}"`
    return 0
}

fun_change_image_rootfs_in_localconf(){
    echo "sed -i ${EXT4_MOUNT_POINT} to $SOURCEROOT/prebuilts/scripts/conf/local.conf"
    sed -i "/${EXT4_MOUNT_POINT}/d" $SOURCEROOT/prebuilts/scripts/conf/local.conf
        echo "IMAGE_ROOTFS=\"${NEW_IMAGE_ROOTFS_DIR}\"" >> conf/local.conf
    return 0
}

fun_post_change_image_rootfs_dir(){
    sed -i "/${EXT4_MOUNT_POINT}/d" $SOURCEROOT/prebuilts/scripts/conf/local.conf
    echo `pwd`
    cd ${SOURCEROOT}
    echo "sudo umount ${EXT4_MOUNT_POINT}"
    sudo umount ${EXT4_MOUNT_POINT}
    if [ $? != 0 ]; then
        echo "The procedure of fun_make_image_rootfs_point is failed, shell error line: $LINENO"
    fi
    echo "rm -rf ${EXT4_MOUNT_POINT}"
    rm -rf ${EXT4_MOUNT_POINT}
    if [ $? != 0 ]; then
        echo "The procedure of fun_make_image_rootfs_point is failed, shell error line: $LINENO"
    fi
    rm -rf ${ROOTFS_EXT4_DIR}
    cd -
}

fun_sign2(){
    cd ${SOURCEROOT}
    ext4fsdir="${SOURCEROOT}/${EXT4_MOUNT_POINT}"
    dirmountinfo=`df -h | grep ${ext4fsdir}`
    if [ -n "${dirmountinfo}" ];then
        echo "sudo umount ${EXT4_MOUNT_POINT} before crtl c "
        sudo umount ${EXT4_MOUNT_POINT}
    fi

    sed -i '/BB_NO_NETWORK=/d' $SOURCEROOT/prebuilts/scripts/conf/local.conf
    exit 0
}

func_help $1 $2

if [ "$(whoami)" = "root" ]; then
    echo "ERROR: do not use the BSP as root. Exiting..."
    exit 1
fi

DISTROSUFFIX=`echo $1 | awk -F+ '{print $2}'`
DISTRONAME=unisoc-`echo $1 | awk -F+ '{print $2}'`
IMAGESUFFIX=`echo $1 | awk -F+ '{print $3}'`
IMAGENAME=unisoc-`echo $1 | awk -F+ '{print $3}'`-image

TMP1=`echo $1 | awk -F+ '{print $1}'`
MACHINENAME=`echo $TMP1 | sed 's/_/-/g'`
MACHINESUFFIX=`echo ${MACHINENAME} | awk -F- '{print $1}'`

if [ "$IMAGENAME" == "" ]; then
    IMAGENAME=unisoc-console-image
fi

TMP4=`echo $1 | awk -F+ '{print $4}'`

if [[ $2 == "" ]] || [[ $2 == "userdebug" ]] || [[ $2 == "default" ]]; then
    USERDEBUG="userdebug"
elif [ $2 == "user" ]; then
    USERDEBUG="user"
elif [ $2 == "eng" ]; then
    USERDEBUG="eng"
else
    IMAGENAME=unisoc-`echo $1 | awk -F+ '{print $3}'`-$2
fi
export USERDEBUG=${USERDEBUG}

BB_NO_NETWORK_FLAG="0"
param_count=$#

for ((i=1;i<=${param_count};i++));
do
    eval j=\$$i
    if [[ $j == "offline" ]]; then
        BB_NO_NETWORK_FLAG="1"
    fi
done

if [[ ${TMP4} == "" ]] || [[ ${TMP4} == "sec" ]] || [[ ${TMP4} == "default" ]]; then
    SECBOOT_ENABLE="sec"
elif [ ${TMP4} == "nosec" ]; then
    SECBOOT_ENABLE="nosec"
else
    echo "Error: sec or nosec ?"
    exit 1
fi
export SECBOOT_ENABLE=${SECBOOT_ENABLE}

SOURCEROOT=$(pwd)
cd ${SOURCEROOT}

#------------------------20230724[ccmeta]-----------------------------------
CLEAN_ON=`echo $1 | awk -F+ '{print $5}'`

if [[ ${CLEAN_ON} == "clean" ]]; then
    echo "Cleaning old built folder..."
    rm -rf sstate-cache build-* out/target/product/${MACHINENAME} out/*timemsg.log
else
    echo "Do not clean"
fi
#---------------------------------------------------------------------------



EXT4_MOUNT_IMAGE_ROOTFS_NAME=${MACHINENAME}-${SECBOOT_ENABLE}-${USERDEBUG}.ext4
EXT4_MOUNT_POINT="ext4mountpoint"
ROOTFS_EXT4_GZ_DIR="./prebuilts/pac-binary/${MACHINESUFFIX}"
ROOTFS_EXT4_GZ="${ROOTFS_EXT4_GZ_DIR}/${EXT4_MOUNT_IMAGE_ROOTFS_NAME}.gz"
ROOTFS_EXT4_DIR="ext4fs"
ROOTFS_EXT4="${ROOTFS_EXT4_DIR}/rootfs.ext4"
NEW_IMAGE_ROOTFS_DIR="${SOURCEROOT}/${EXT4_MOUNT_POINT}/rootfs"

trap "fun_sign2" 1 2

fun_change_image_rootfs_dir
flag_change_image_rootfs_dir=$?

echo "MACHINENAME=${MACHINENAME} ,DISTRO=${DISTRONAME}, USERDEBUG=${USERDEBUG}, SECBOOT_ENABLE=${SECBOOT_ENABLE}"
export MACHINE=${MACHINENAME} && export DISTRO=${DISTRONAME} && export IMAGESUFFIX=${IMAGESUFFIX} && export USERDEBUG=${USERDEBUG} && source setup-environment build-${DISTRONAME}

sed -i '/USERDEBUG=/d' $SOURCEROOT/prebuilts/scripts/conf/local.conf
sed -i '/DATE_BUILD=/d' $SOURCEROOT/prebuilts/scripts/conf/local.conf
sed -i '/SECBOOT_ENABLE=/d' $SOURCEROOT/prebuilts/scripts/conf/local.conf
sed -i '/BB_NO_NETWORK=/d' $SOURCEROOT/prebuilts/scripts/conf/local.conf

if [ "${flag_change_image_rootfs_dir}" = 0 ];then
    echo "do fun_change_image_rootfs_in_localconf"
    fun_change_image_rootfs_in_localconf
else
    echo "no do fun_change_image_rootfs_in_localconf"
fi

if [ "$USERDEBUG" == "userdebug" ]; then
    echo 'USERDEBUG="userdebug"' >> conf/local.conf
	echo 'ENG_IT="userdebug"' >> conf/local.conf
elif [ "$USERDEBUG" == "user" ]; then
    echo 'USERDEBUG="user"' >> conf/local.conf
	echo 'ENG_IT="user"' >> conf/local.conf
elif [ "$USERDEBUG" == "eng" ]; then
    echo 'USERDEBUG="userdebug"' >> conf/local.conf
	echo 'ENG_IT="eng"' >> conf/local.conf
fi

if [ "$SECBOOT_ENABLE" == "sec" ]; then
    echo 'SECBOOT_ENABLE="sec"' >> conf/local.conf
elif [ "$SECBOOT_ENABLE" == "nosec" ]; then
    echo 'SECBOOT_ENABLE="nosec"' >> conf/local.conf
fi

if [ "$BB_NO_NETWORK_FLAG" == "1" ]; then
    echo 'BB_NO_NETWORK="1"' >> conf/local.conf
    $SOURCEROOT/prebuilts/scripts/offline-monitor.sh  $$  $SOURCEROOT/prebuilts/scripts/conf/local.conf &
elif [ "$BB_NO_NETWORK_FLAG" == "0" ]; then
    echo 'BB_NO_NETWORK="0"' >> conf/local.conf
fi

YEAR=`date +%g`
WEEK=`date +%V`
DAY=`date +%u`
HOUR=`date +%H`
MINUTE=`date +%M`
SECOND=`date +%S`
WEEK=$((10#$WEEK))

WEEK=$(printf "%02d" $WEEK)
DATE="W${YEAR}.${WEEK}.${DAY}:${HOUR}.${MINUTE}.${SECOND}"
echo $DATE
TMP2="DATE_BUILD="\"$DATE"\""
echo $TMP2 >> conf/local.conf

bitbake_assert()
{
    if [ $? != 0 ]; then
        echo "The procedure of bitbake is failed, shell error line: $1"
        sed -i '/BB_NO_NETWORK=/d' $SOURCEROOT/prebuilts/scripts/conf/local.conf
        exit 1
    fi
}
bitbake_assert_change_image_rootfs_dir()
{
    if [ $? != 0 ]; then
        echo "The procedure of bitbake is failed, shell error line: $1"
        if [ "${flag_change_image_rootfs_dir}" = 0 ];then
            echo "do fun_post_change_image_rootfs_dir"
            fun_post_change_image_rootfs_dir
        else
            echo "no no fun_post_change_image_rootfs_dir"
        fi
        sed -i '/BB_NO_NETWORK=/d' $SOURCEROOT/prebuilts/scripts/conf/local.conf
        exit 1
    fi
}

check_offline_building()
{
    if [ "$BB_NO_NETWORK_FLAG" == "1" ]; then
        bitbake $2 --runall=fetch
        if [ $? != 0 ]; then
            sed -i '/BB_NO_NETWORK=/d' $SOURCEROOT/prebuilts/scripts/conf/local.conf
            echo -e "\e[1;31m The offline building failed, please upload tarballs to source/tarballs. shell error line: $1\e[0m"
            exit 1
        fi
    fi
}

building_image()
{
    check_offline_building $1 $2
    bitbake $2
    bitbake_assert $1
}

echo "Build preparation: $(expr $(date +%s) - $btime)" >> ${timedir}/${timename} && btime=`date +%s`

echo "Start building process...${IMAGENAME}..."
building_image $LINENO ${IMAGENAME}

echo "Build ${IMAGENAME}: $(expr $(date +%s) - $btime)" >> ${timedir}/${timename} && btime=`date +%s`

if [ "${flag_change_image_rootfs_dir}" = 0 ];then
    echo "do fun_post_change_image_rootfs_dir"
    fun_post_change_image_rootfs_dir
else
    echo "no no fun_post_change_image_rootfs_dir"
fi

if [[ $3  == "sdk" ]]; then
    echo "Build sdk!"
    check_offline_building $LINENO ${IMAGENAME}
    bitbake ${IMAGENAME}  -c populate_sdk
    bitbake_assert $LINENO
    echo "Build  populate_sdk: $(expr $(date +%s) - $btime)" >> ${timedir}/${timename} && btime=`date +%s`
fi

if [ ${MACHINENAME} == "sl8563-cpe" ] || [ ${MACHINENAME} == "sl8563-cpe-1c" ] || [ ${MACHINENAME} == "sl8563-cpe-2h10" ] || [ ${MACHINENAME} == "sl8563-cpe-2h10-vsim" ] ||
   [ ${MACHINENAME} == "udx710-module" ] || [ ${MACHINENAME} == "udx710-base" ] || [ ${MACHINENAME} == "udx710-ecell" ] ||
   [ ${MACHINENAME} == "sl8521e-base" ] || [ ${MACHINENAME} == "sl8581e-3in1" ] || [ ${MACHINENAME} == "sl8581e-nand-marlin3e-mifi" ] || [ ${MACHINENAME} == "sl8521e-nand-marlin2" ] || [ ${MACHINENAME} == "sl8521e-3in1" ] ||
    [ ${MACHINENAME} == "sl8541e-3in1" ]  || [ ${MACHINENAME} == "sl8541e-emmc-marlin2" ] || [ ${MACHINENAME} == "sl8541e-smartpen64" ] || [ ${MACHINENAME} == "sl8541e-smartpen64-wifionly" ] || [ ${MACHINENAME} == "sl8541e-smartpen32" ] || [ ${MACHINENAME} == "sl8541e-smartpen32-wifionly" ] || [ ${MACHINENAME} == "sl8541e-emmc-marlin3lite" ] || [ ${MACHINENAME} == "sl8541e-emmc-marlin3e" ] ||
    [ ${MACHINENAME} == "udx710-module-pi" ] || [ ${MACHINENAME} == "sc9863a-1h10" ] ||
    [ ${MACHINENAME} == "sc9863a-smartcoreboard" ] || [ ${MACHINENAME} == "udx710-module-op" ] ||
    [ ${MACHINENAME} == "udx710-module-vddmodem-pi" ] || [ ${MACHINENAME} == "sl8521e-smartcoreboard" ] ||
    [ ${MACHINENAME} == "sl8541e-nand-marlin2" ] || [ ${MACHINENAME} == "sl8541e-nand-marlin3lite" ] ||
    [ ${MACHINENAME} == "udx710-module-op-pi" ] || [ ${MACHINENAME} == "udx710-mifi" ]; then

    building_image $LINENO prodnv
    echo "Build prodnv: $(expr $(date +%s) - $btime)" >> ${timedir}/${timename} && btime=`date +%s`

    building_image $LINENO userdata
    echo "Build userdata: $(expr $(date +%s) - $btime)" >> ${timedir}/${timename} && btime=`date +%s`

    building_image $LINENO swupdate-image
    echo "Build swupdate-image: $(expr $(date +%s) - $btime)" >> ${timedir}/${timename} && btime=`date +%s`

    building_image $LINENO recovery-img
    echo "Build recovery-img: $(expr $(date +%s) - $btime)" >> ${timedir}/${timename} && btime=`date +%s`

elif [ ${MACHINENAME} == "ud710-ai" ]; then
    building_image $LINENO prodnv
    echo "Build prodnv: $(expr $(date +%s) - $btime)" >> ${timedir}/${timename} && btime=`date +%s`

    building_image $LINENO swupdate-image
    echo "Build swupdate-image: $(expr $(date +%s) - $btime)" >> ${timedir}/${timename} && btime=`date +%s`

    building_image $LINENO recovery-img
    echo "Build recovery-img: $(expr $(date +%s) - $btime)" >> ${timedir}/${timename} && btime=`date +%s`

elif [ ${MACHINENAME} == "ud710-96board" ]; then
    building_image $LINENO swupdate-image
    echo "Build swupdate-image: $(expr $(date +%s) - $btime)" >> ${timedir}/${timename} && btime=`date +%s`

    building_image $LINENO recovery-img
    echo "Build recovery-img: $(expr $(date +%s) - $btime)" >> ${timedir}/${timename} && btime=`date +%s`

elif [ ${MACHINENAME} == "t710-smartcoreboard" ]; then
    # t710 not use android userdata.img
    building_image $LINENO userdata
    echo "Build userdata: $(expr $(date +%s) - $btime)" >> ${timedir}/${timename} && btime=`date +%s`

    building_image $LINENO swupdate-image
    echo "Build swupdate-image: $(expr $(date +%s) - $btime)" >> ${timedir}/${timename} && btime=`date +%s`

    building_image $LINENO recovery-img
    echo "Build recovery-img: $(expr $(date +%s) - $btime)" >> ${timedir}/${timename} && btime=`date +%s`

elif [ ${MACHINENAME} == "hypUd710-car-xen" ]; then
    building_image $LINENO xen-dom0-image
    echo "Build xen-dom0-image: $(expr $(date +%s) - $btime)" >> ${timedir}/${timename} && btime=`date +%s`
fi

cd ${SOURCEROOT}/prebuilts/scripts
if [ ${MACHINENAME} == "hypUd710-car-xen" ]; then
    sed -i '/BB_NO_NETWORK=/d' $SOURCEROOT/prebuilts/scripts/conf/local.conf
    source pac-xen.sh $1 $USERDEBUG
else
    sed -i '/BB_NO_NETWORK=/d' $SOURCEROOT/prebuilts/scripts/conf/local.conf
    source pac.sh $1 $USERDEBUG
fi
echo "Exac pac: $(expr $(date +%s) - $btime)" >> ${timedir}/${timename} && btime=`date +%s`


if [[ ${MACHINENAME} == "sl8563-cpe" ]] ||
   [[ ${MACHINENAME} == "sl8563-cpe-1c" ]] ||
   [[ ${MACHINENAME} == "sl8563-cpe-2h10" ]] ||
   [[ ${MACHINENAME} == "sl8563-cpe-2h10-vsim" ]] ||
   [[ ${MACHINENAME} == "sl8521e-base" ]] ||
   [[ ${MACHINENAME} == "sl8521e-smartcoreboard" ]] ||
   [[ ${MACHINENAME} == "sl8541e-nand-marlin2" ]] ||
   [[ ${MACHINENAME} == "sl8541e-nand-marlin3lite" ]] ||
   [[ ${MACHINENAME} == "sl8581e-3in1" ]] ||
   [[ ${MACHINENAME} == "sl8581e-nand-marlin3e-mifi" ]] ||
   [[ ${MACHINENAME} == "sl8521e-nand-marlin2" ]] ||
   [[ ${MACHINENAME} == "sl8521e-3in1" ]] ||
   [[ ${MACHINENAME} == "sl8541e-3in1" ]] ||
   [[ ${MACHINENAME} == "sl8541e-emmc-marlin2" ]] ||
   [[ ${MACHINENAME} == "sl8541e-emmc-marlin3lite" ]] ||
   [[ ${MACHINENAME} == "sl8541e-emmc-marlin3e" ]] ||
   [[ ${MACHINENAME} == "sl8541e-smartpen64" ]] ||
   [[ ${MACHINENAME} == "sl8541e-smartpen64-wifionly" ]] ||
   [[ ${MACHINENAME} == "sl8541e-smartpen32" ]] ||
   [[ ${MACHINENAME} == "sl8541e-smartpen32-wifionly" ]] ||
   [[ ${MACHINENAME} == "ud710-96board" ]] ||
   [[ ${MACHINENAME} == "t710-smartcoreboard" ]] ||
   [[ ${MACHINENAME} == "ud710-ai" ]] ||
   [[ ${MACHINENAME} == "udx710-base" ]] ||
   [[ ${MACHINENAME} == "udx710-ecell" ]] ||
   [[ ${MACHINENAME} == "sc9863a-smartcoreboard" ]] ||
   [[ ${MACHINENAME} == "sc9863a-1h10" ]] ||
   [[ ${MACHINENAME} == "udx710-module-op" ]] ||
   [[ ${MACHINENAME} == "udx710-module" ]] ||
   [[ ${MACHINENAME} == "udx710-module-pi" ]] ||
   [[ ${MACHINENAME} == "udx710-module-vddmodem-pi" ]] ||
   [[ ${MACHINENAME} == "udx710-module-op-pi" ]] ||
   [[ ${MACHINENAME} == "udx710-mifi" ]]; then
     if [[ $3  == "ota" ]]; then
         sed -i '/BB_NO_NETWORK=/d' $SOURCEROOT/prebuilts/scripts/conf/local.conf
         echo OTA START
         cd ${SOURCEROOT}/prebuilts/scripts
         source ota.sh "fullota" "auto"
         echo "ota.sh: $(expr $(date +%s) - $btime)" >> ${timedir}/${timename} && btime=`date +%s`
     fi
fi

sed -i '/BB_NO_NETWORK=/d' $SOURCEROOT/prebuilts/scripts/conf/local.conf

echo "Build END: $(date "+%Y-%m-%d %H:%M:%S")" >> ${timedir}/${timename}
END_TIME=`date +%s`
TOTAL_TIME_SEC=`expr $END_TIME - $BEGIN_TIME`
echo "TOTAL_TIME: $TOTAL_TIME_SEC" >> ${timedir}/${timename}

cd ${SOURCEROOT}/out/target/product/${MACHINENAME}
pac_size=`find . -name *.pac | xargs ls -sh`
echo "pac size: ${pac_size}" >> ${timedir}/${timename}

mv -f ${timedir}/${timename} ${SOURCEROOT}/out/
rm -rf ${timedir}/*timemsg.log
cat ${SOURCEROOT}/out/${timename}
