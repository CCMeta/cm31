

CFLAGS = -Wall \
         -g \
         -O \
         -fPIC

LIBS = -lpthread

TARGET = $(OBJ_DIR)/hello-sagereal1

SRCS = src/main.c


hello-sagereal1:
	$(CC) $(CFLAGS) -o $(TARGET) $(SRCS)
	# cp src/cm31_api $(OBJ_DIR)/cm31_api
	# cp src/cm31_api-init $(OBJ_DIR)/cm31_api-init
	rm -f *.o

clean:
	rm -f hello-sagereal1 $(TARGET)

