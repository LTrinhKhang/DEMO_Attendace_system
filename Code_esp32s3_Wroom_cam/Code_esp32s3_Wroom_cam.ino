#include "esp_camera.h"
#include "WiFi.h"
#include "esp_http_server.h"
#include <HTTPClient.h>

// 🛜 Thông tin WiFi (Thay đổi nếu cần)
const char* ssid = "Qi";
const char* password = "00000000";
const char* serverUrl = "http://your_server_ip:5500/wifi-status"; // IP Server Node.js

// 📌 Cấu hình chân GPIO theo sơ đồ của bạn
#define PWDN_GPIO   -1
#define RESET_GPIO  -1
#define XCLK_GPIO   15
#define SIOD_GPIO   4
#define SIOC_GPIO   5

#define Y9_GPIO     16
#define Y8_GPIO     17
#define Y7_GPIO     18
#define Y6_GPIO     12
#define Y5_GPIO     10
#define Y4_GPIO     8
#define Y3_GPIO     9
#define Y2_GPIO     11
#define VSYNC_GPIO  6
#define HREF_GPIO   7
#define PCLK_GPIO   13

httpd_handle_t stream_httpd = NULL;
bool lastWiFiStatus = false;

// 📸 Xử lý camera stream
esp_err_t stream_handler(httpd_req_t *req) {
    char part_buf[64];
    camera_fb_t *fb = NULL;
    esp_err_t res = ESP_OK;

    httpd_resp_set_type(req, "multipart/x-mixed-replace; boundary=frame");

    while (true) {
        fb = esp_camera_fb_get();
        if (!fb) {
            Serial.println("⚠️ Lỗi lấy ảnh từ camera!");
            res = ESP_FAIL;
            break;
        }

        int header_len = snprintf(part_buf, 64,
            "--frame\r\nContent-Type: image/jpeg\r\nContent-Length: %d\r\n\r\n",
            fb->len);
        res = httpd_resp_send_chunk(req, part_buf, header_len);
        if (res == ESP_OK) {
            res = httpd_resp_send_chunk(req, (const char *)fb->buf, fb->len);
        }
        if (res == ESP_OK) {
            res = httpd_resp_send_chunk(req, "\r\n", 2);
        }

        esp_camera_fb_return(fb);
        if (res != ESP_OK) {
            break;
        }

        delay(50);  // Giảm tải CPU
    }
    return res;
}

// 🌐 Khởi động WebServer phục vụ ảnh từ Camera
void startCameraServer() {
    httpd_config_t config = HTTPD_DEFAULT_CONFIG();
    httpd_start(&stream_httpd, &config);

    httpd_uri_t uri_handler = {
        .uri       = "/",
        .method    = HTTP_GET,
        .handler   = stream_handler,
        .user_ctx  = NULL
    };

    httpd_register_uri_handler(stream_httpd, &uri_handler);
    Serial.println("✅ Camera server started! Truy cập: http://[ESP32-IP]");
}

// 📡 Gửi trạng thái WiFi về Server
void sendWiFiStatus(bool status) {
    if (WiFi.status() == WL_CONNECTED) {
        HTTPClient http;
        http.begin(serverUrl);
        http.addHeader("Content-Type", "application/json");

        String payload = "{\"connected\": " + String(status ? "true" : "false") + "}";
        int httpResponseCode = http.POST(payload);
        Serial.println("📡 WiFi Status Sent: " + payload);
        http.end();
    }
}

// 🔄 Kiểm tra WiFi và gửi trạng thái nếu thay đổi
void checkWiFiStatus() {
    bool currentStatus = (WiFi.status() == WL_CONNECTED);

    if (currentStatus != lastWiFiStatus) {
        sendWiFiStatus(currentStatus);
        lastWiFiStatus = currentStatus;
    }

    if (!currentStatus) {
        Serial.println("⚠️ Mất kết nối WiFi! Đang thử lại...");
        WiFi.disconnect();
        WiFi.begin(ssid, password);
    }
}

void setup() {
    Serial.begin(115200);
    Serial.println("\n🚀 Khởi động ESP32-S3 Camera...");

    if (!psramFound()) {
        Serial.println("⚠️ Cảnh báo: PSRAM không có, sử dụng cấu hình thấp!");
    }
    
    Serial.printf("📢 Free heap trước khi khởi tạo camera: %d bytes\n", esp_get_free_heap_size());

    // **Cấu hình camera**
    camera_config_t config;
    config.ledc_channel = LEDC_CHANNEL_0;
    config.ledc_timer = LEDC_TIMER_0;
    config.pin_d0 = Y2_GPIO;
    config.pin_d1 = Y3_GPIO;
    config.pin_d2 = Y4_GPIO;
    config.pin_d3 = Y5_GPIO;
    config.pin_d4 = Y6_GPIO;
    config.pin_d5 = Y7_GPIO;
    config.pin_d6 = Y8_GPIO;
    config.pin_d7 = Y9_GPIO;
    config.pin_xclk = XCLK_GPIO;
    config.pin_pclk = PCLK_GPIO;
    config.pin_vsync = VSYNC_GPIO;
    config.pin_href = HREF_GPIO;
    config.pin_sscb_sda = SIOD_GPIO;
    config.pin_sscb_scl = SIOC_GPIO;
    config.pin_pwdn = PWDN_GPIO;
    config.pin_reset = RESET_GPIO;
    config.xclk_freq_hz = 20000000;
    config.pixel_format = PIXFORMAT_JPEG;

    // **Tối ưu RAM khi PSRAM không có**
    config.frame_size = FRAMESIZE_QVGA;
    config.jpeg_quality = 12;
    config.fb_count = 1;
    config.fb_location = CAMERA_FB_IN_DRAM;

    // **Khởi động camera**
    esp_err_t err = esp_camera_init(&config);
    if (err != ESP_OK) {
        Serial.printf("❌ Lỗi khởi tạo camera! Mã lỗi: 0x%x\n", err);
        return;
    }

    Serial.printf("📢 Free heap sau khi khởi tạo camera: %d bytes\n", esp_get_free_heap_size());

    // **Kết nối WiFi**
    WiFi.begin(ssid, password);
    Serial.print("⏳ Đang kết nối WiFi");
    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\n✅ Kết nối WiFi thành công!");
    Serial.print("📡 Địa chỉ IP của ESP32-S3: ");
    Serial.println(WiFi.localIP());

    // **Gửi trạng thái WiFi ban đầu**
    sendWiFiStatus(true);

    // **Khởi động server camera**
    startCameraServer();
}

void loop() {
    checkWiFiStatus();
    delay(10000);
}
