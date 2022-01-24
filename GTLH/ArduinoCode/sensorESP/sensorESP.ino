//Soil moisture Sensor Pin
#define sensorPin A0
//Luft qualitäts pegel. der Mq3 sensor misst Gas-Werte in der Luft, wenn dieser über 100 Liegt kann man von belasteter Luft ausgehen (frisch gelüftet = 70, Lange Fenster zu + stickig = 130)
#define airQualityPin 14
#include "config.h"
#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
char* ssid = WIFI_SSID;
char* password = WIFI_PSD;

//für das moisture mapping
int wetVal = 295;
int dryVal = 513;

void setup() {
  // put your setup code here, to run once:
  Serial.begin(115200);
  pinMode(sensorPin, INPUT);
  pinMode(airQualityPin, INPUT);

  //Der m3 Sensor muss aufheizen, deswegen diese 10 sekunden pause.
  delay(10000);
  WiFi.begin(ssid, password);
  Serial.print("Mit WiFi ");
  Serial.print(ssid);
  Serial.println(" verbinden.");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi verbunden");

  getData();
  //deep sleep entspricht einer Stunde (3600 sekunden)
  ESP.deepSleep(900e6);
  //ESP.deepSleep(180e6);
}

void loop() {}

void getData(){
  WiFiClient client;
  int moisture = analogRead(sensorPin);
  moisture = map(moisture, dryVal, wetVal, 0, 100);
  Serial.println(moisture);
  int airQual = digitalRead(airQualityPin);
  String a = String(moisture);
  String b = String(airQual);
  
  String postString = "{\"moisture\": \"" + a + "\",\"airQual\": \"" + b + "\",\"espID\": \"" + espID +"\"}";
  Serial.println(postString);
  HTTPClient http;
  http.begin(client, POST_URL);
  http.addHeader("Content-Type", "application/json");
  int httpResponseCode = http.POST(postString);

   if(httpResponseCode>0){
    Serial.print(httpResponseCode);
    Serial.print(" Returned String: ");
    Serial.println(http.getString());
  } else {      
    Serial.print("POST Error: ");
    Serial.print(httpResponseCode);
  }                      
  
}
