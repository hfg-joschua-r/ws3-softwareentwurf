#include <ESP8266WiFi.h>
#include <PubSubClient.h>

const unsigned int MOISTURE_PIN = 2;
const int bits = 10;
const int interval = 6000;

//connection:
char *SSID = "prettyFlyForAWifi24";
char *PSK = "ulmIstSchoen";
char *MQTT_BROKER = "193.196.159.141";
char *MQTT_CLIENT_ID = "josch_esp";
char *TOPIC="/sweavs/josch";

unsigned int moisture;

WiFiClient espClient;
PubSubClient client(espClient);
char msg[50];
String clientId;

void setup()
{
  pinMode(MOISTURE_PIN, INPUT);
  Serial.begin(115200);
  connect_wifi();
  client.setServer(MQTT_BROKER, 1883);

  //own mac:
  clientId = composeClientID();
  Serial.print("clientID: ");
  Serial.println(clientId);
}

void connect_wifi()
{
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(SSID);

  WiFi.begin(SSID, PSK);
  while (WiFi.status() != WL_CONNECTED)
  {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void reconnect()
{
  while (!client.connected())
  {
    Serial.print("Reconnecting...");
    if (!client.connect(MQTT_CLIENT_ID))
    {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" retrying in 5 seconds");
      delay(5000);
    }
  }
}

void loop()
{
  moisture = analogRead(MOISTURE_PIN);
  Serial.print("Moisture: ");
  Serial.println(moisture);
  if (!client.connected())
  {
    reconnect();
  }
  client.loop();

  String output = "{\"mac\":\"" + clientId + "\",\"val\":" + moisture + "}";
  String(output).toCharArray(msg, 50);
  client.publish(TOPIC, msg);
  delay(interval);
}

String composeClientID()
{
  uint8_t mac[6];
  WiFi.macAddress(mac);
  clientId += macToStr(mac);
  return clientId;
}

String macToStr(const uint8_t *mac)
{
  String result;
  for (int i = 0; i < 6; ++i)
  {
    result += String(mac[i], 16);
    if (i < 5)
      result += ':';
  }
  return result;
}
