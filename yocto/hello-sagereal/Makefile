

CFLAGS = -Wall \
         -g \
         -O \
         -fPIC

LIBS = -lpthread

TARGET = $(OBJ_DIR)/hello-sagereal1

SRCS = src/main.c


hello-sagereal1:
	$(CC) $(CFLAGS) -o $(TARGET) $(SRCS)
	# cp src/wm24_api $(OBJ_DIR)/wm24_api
	# cp src/wm24_api-init $(OBJ_DIR)/wm24_api-init
	rm -f *.o

clean:
	rm -f hello-sagereal1 $(TARGET)

