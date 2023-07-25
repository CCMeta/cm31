# WM24 README

## TAKE CARE

要小心！！这个wm24_api的可执行文件需要这个本地目录
所以我们需要先cd到这个目录 再执行这个 否则就会出现找不到资源的问题

``` text
在开始编译之前，需要设定全局的go env，
- GOARCH=arm64 // 目标架构
- GOOS=linux // 目标操作系统
- CGO_ENABLED=0 // 保持静态链接
shell: go env -w CGO_ENABLED=0
shell: go env -w GOARCH=arm64
shell: go env -w GOOS=linux
```

``` text
build: go build -o wm24
```

## CONFIGS

- persist.sagereal.total_send
- persist.sagereal.total_recv
- persist.sagereal.data_threshold_status
- persist.sagereal.data_threshold_value
- persist.sagereal.data_threshold_resetDay
- persist.sagereal.language
