#include <lvgl.h>
#include <TFT_eSPI.h>
#include <WiFi.h>
#include <ui.h>

static const uint16_t screenWidth  = 320;
static const uint16_t screenHeight = 240;

static lv_disp_draw_buf_t draw_buf;
static lv_color_t buf[ screenWidth * screenHeight / 10 ];

TFT_eSPI tft = TFT_eSPI(screenWidth, screenHeight);

#if LV_USE_LOG != 0
void my_print(const char * buf)
{
    Serial.printf(buf);
    Serial.flush();
}
#endif

void my_disp_flush(lv_disp_drv_t *disp, const lv_area_t *area, lv_color_t *color_p)
{
    uint32_t w = ( area->x2 - area->x1 + 1 );
    uint32_t h = ( area->y2 - area->y1 + 1 );

    tft.startWrite();
    tft.setAddrWindow(area->x1, area->y1, w, h);
    tft.pushColors((uint16_t *)&color_p->full, w * h, true);
    tft.endWrite();

    lv_disp_flush_ready(disp);
}

void my_touchpad_read(lv_indev_drv_t *indev_driver, lv_indev_data_t *data)
{
    uint16_t touchX = 0, touchY = 0;
    bool touched = tft.getTouch(&touchX, &touchY, 600);

    if (!touched) {
        data->state = LV_INDEV_STATE_REL;
    } else {
        data->state = LV_INDEV_STATE_PR;
        data->point.x = touchX;
        data->point.y = touchY;
    }
}

void update_wifi_status(bool connected)
{
    if (connected) {
        lv_obj_clear_flag(ui_imgwifistatus, LV_OBJ_FLAG_HIDDEN);
        lv_obj_add_flag(ui_Image3, LV_OBJ_FLAG_HIDDEN);
    } else {
        lv_obj_clear_flag(ui_Image3, LV_OBJ_FLAG_HIDDEN);
        lv_obj_add_flag(ui_imgwifistatus, LV_OBJ_FLAG_HIDDEN);
    }
}

void setup()
{
    Serial.begin(115200);
    lv_init();

#if LV_USE_LOG != 0
    lv_log_register_print_cb(my_print);
#endif

    tft.begin();
    tft.setRotation(3);
    lv_disp_draw_buf_init(&draw_buf, buf, NULL, screenWidth * screenHeight / 10);

    static lv_disp_drv_t disp_drv;
    lv_disp_drv_init(&disp_drv);
    disp_drv.hor_res = screenWidth;
    disp_drv.ver_res = screenHeight;
    disp_drv.flush_cb = my_disp_flush;
    disp_drv.draw_buf = &draw_buf;
    lv_disp_drv_register(&disp_drv);

    static lv_indev_drv_t indev_drv;
    lv_indev_drv_init(&indev_drv);
    indev_drv.type = LV_INDEV_TYPE_POINTER;
    indev_drv.read_cb = my_touchpad_read;
    lv_indev_drv_register(&indev_drv);

    ui_init();
    WiFi.begin("SSID", "PASSWORD");

    delay(5000);
    if (WiFi.status() == WL_CONNECTED) {
        update_wifi_status(true);
    } else {
        update_wifi_status(false);
    }

    reset_standby_timer();
    Serial.println("Setup done");
}

void loop()
{
    static bool wifi_prev = false;
    bool wifi_curr = (WiFi.status() == WL_CONNECTED);

    if (wifi_curr != wifi_prev) {
        update_wifi_status(wifi_curr);
        wifi_prev = wifi_curr;
    }

    lv_timer_handler();
    delay(5);

    uint16_t touchX, touchY;
    if (tft.getTouch(&touchX, &touchY)) {
        reset_standby_timer();
    }
}
