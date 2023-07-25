# docker build -t cm31_api . 
# docker run --rm -it -p 8080:8080 cm31_api:latest
FROM golang:latest AS builder
RUN apt-get update
ENV GO111MODULE=on \
    CGO_ENABLED=0 \
    GOOS=linux \
    GOARCH=amd64
WORKDIR /go/src/app
COPY go.mod .
RUN go mod download
COPY . .
RUN go install

FROM scratch
COPY --from=builder /go/bin/cm31_api .
ENTRYPOINT ["./cm31_api"]