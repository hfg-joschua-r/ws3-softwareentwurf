#include "Arduino.h"
#include "esp_camera.h"
#include "config.h"
#include <WiFi.h>
#include <WiFiClientSecure.h>
#include <base64.h>
#include <HTTPClient.h>

#define CAMERA_MODEL_AI_THINKER // Has PSRAM

//CAMERA_MODEL_AI_THINKER
#define PWDN_GPIO_NUM     32
#define RESET_GPIO_NUM    -1
#define XCLK_GPIO_NUM      0
#define SIOD_GPIO_NUM     26
#define SIOC_GPIO_NUM     27
#define Y9_GPIO_NUM       35
#define Y8_GPIO_NUM       34
#define Y7_GPIO_NUM       39
#define Y6_GPIO_NUM       36
#define Y5_GPIO_NUM       21
#define Y4_GPIO_NUM       19
#define Y3_GPIO_NUM       18
#define Y2_GPIO_NUM        5
#define VSYNC_GPIO_NUM    25
#define HREF_GPIO_NUM     23
#define PCLK_GPIO_NUM     22

#define LAMP 4

//Add these to Config.h
//#define WIFI_SSID "yourSSID"
//#define WIFI_PSD "yourPASSWORD"
//also needed: backend dataService ip:
//#define POST_URL "http://192.168.1.90:3000/api/imageUpload/123456"

const char* ssid = WIFI_SSID;
const char* password = WIFI_PSD;


RTC_DATA_ATTR int bootCount = 0;

const int timerInterval = 30000;    // time between each HTTP POST image
unsigned long previousMillis = 0;   // last time image was sent

void setup() {
  Serial.begin(115200);
  Serial.setDebugOutput(true);
  Serial.println();

  //Increment boot number and print it every reboot
  ++bootCount;
  Serial.println("Boot number: " + String(bootCount));
  //Print the wakeup reason for ESP32
  print_wakeup_reason();

  camera_config_t config;
  config.ledc_channel = LEDC_CHANNEL_0;
  config.ledc_timer = LEDC_TIMER_0;
  config.pin_d0 = Y2_GPIO_NUM;
  config.pin_d1 = Y3_GPIO_NUM;
  config.pin_d2 = Y4_GPIO_NUM;
  config.pin_d3 = Y5_GPIO_NUM;
  config.pin_d4 = Y6_GPIO_NUM;
  config.pin_d5 = Y7_GPIO_NUM;
  config.pin_d6 = Y8_GPIO_NUM;
  config.pin_d7 = Y9_GPIO_NUM;
  config.pin_xclk = XCLK_GPIO_NUM;
  config.pin_pclk = PCLK_GPIO_NUM;
  config.pin_vsync = VSYNC_GPIO_NUM;
  config.pin_href = HREF_GPIO_NUM;
  config.pin_sscb_sda = SIOD_GPIO_NUM;
  config.pin_sscb_scl = SIOC_GPIO_NUM;
  config.pin_pwdn = PWDN_GPIO_NUM;
  config.pin_reset = RESET_GPIO_NUM;
  config.xclk_freq_hz = 20000000;
  config.pixel_format = PIXFORMAT_JPEG;

  pinMode(LAMP, OUTPUT);
  // if PSRAM IC present, init with UXGA resolution and higher JPEG quality
  //                      for larger pre-allocated frame buffer.
  if(psramFound()){
    config.frame_size = FRAMESIZE_CIF;
    config.jpeg_quality = 10;
    config.fb_count = 2;
  } else {
    config.frame_size = FRAMESIZE_QVGA;
    config.jpeg_quality = 12;
    config.fb_count = 1;
  }

#if defined(CAMERA_MODEL_ESP_EYE)
  pinMode(13, INPUT_PULLUP);
  pinMode(14, INPUT_PULLUP);
#endif

  // camera init
  esp_err_t err = esp_camera_init(&config);
  if (err != ESP_OK) {
    Serial.printf("Camera init failed with error 0x%x", err);
    return;
  }


  #if defined(CAMERA_MODEL_M5STACK_WIDE)
    s->set_vflip(s, 1);
    s->set_hmirror(s, 1);
  #endif

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");
  
  sendPhoto();

  //Go to sleep for one Hour
  //ESP.deepSleep(3600e6);
  ESP.deepSleep(30e6);
  //toDo: check clock api to only take a picture once a day
 
}
//Function that prints the reason by which ESP32 has been awaken from sleep
void print_wakeup_reason(){
  esp_sleep_wakeup_cause_t wakeup_reason;
  wakeup_reason = esp_sleep_get_wakeup_cause();
  switch(wakeup_reason)
  {
    case 1  : Serial.println("Wakeup caused by external signal using RTC_IO"); break;
    case 2  : Serial.println("Wakeup caused by external signal using RTC_CNTL"); break;
    case 3  : Serial.println("Wakeup caused by touchpad"); break;
    case 4  : Serial.println("Wakeup caused by timer"); break;
    case 5  : Serial.println("Wakeup caused by ULP program"); break;
    default : Serial.println("Wakeup was not caused by deep sleep"); break;
  }
}

void loop(){}

void sendPhoto(){
  digitalWrite(LAMP, HIGH);
  // Capture picture
  camera_fb_t * fb = NULL;
  fb = esp_camera_fb_get();
   
  if(!fb) {
    Serial.println("Camera capture failed");
    return;
  } else {
    Serial.println("Camera capture OK");
  }

  size_t size = fb->len;
  String buffer = base64::encode((uint8_t *) fb->buf, fb->len);
  
  //String imgPayload = "{\"base64\": \"" + buffer + ",\"espID\": \"" + espID + "}";
  String imgPayload = "{\"base64\": \"" + buffer + "\",\"espID\": \"" + espID +"\"}";
  //String imgPayload = "{\"base64\":\"" + 558499999999 + ""\",\"content\":\"Just a message\",\"groupName\":\"Recipients_list\"}";

  buffer = "";
  // Uncomment this if you want to show the payload
  Serial.println(imgPayload);

  esp_camera_fb_return(fb);
  
  HTTPClient http;
  http.begin(POST_URL);
  http.addHeader("Content-Type", "application/json");      
  int httpResponseCode = http.POST(imgPayload);
  digitalWrite(LAMP, LOW);
  if(httpResponseCode>0){
    Serial.print(httpResponseCode);
    Serial.print(" Returned String: ");
    Serial.println(http.getString());
  } else {      
    Serial.print("POST Error: ");
    Serial.print(httpResponseCode);
  }                      
}