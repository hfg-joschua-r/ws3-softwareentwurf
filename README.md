# GrowTimeLapseHelper

![ProjektAufbau](https://i.ibb.co/XJQrR9k/Technischer-Aufbau2.png)

## Physische Schicht

Auf der physischen Schicht befinden sich zwei Micro-Controller. Der [ESP-32 mit Cam](https://www.amazon.de/RETTI-Esp32-Cam-Bluetooth-Entwicklungs-UnterstüTzung-schwarz/dp/B08MZV1TT9/ref=sr_1_5?__mk_de_DE=ÅMÅŽÕÑ&crid=7IWAZHF91X5J&keywords=esp32-cam&qid=1643972715&s=ce-de&sprefix=esp32-cam%2Celectronics%2C65&sr=1-5) ist dafür zuständig, in einem festgelegten Takt (momentan 1 Stunde) Bilder aufzunehmen und ans Backend mittels einem Base64 String zu senden. Der zweite ESP8266 ist mit einem Feuchtigkeitssensor verbunden, liest dessen Werte aus und sendet diese an einen seperaten Backend endpoint. 

Die Growlampe, die ein Vollspektrum an Licht abgibt, simuliert Sonnenlicht für die Pflanzen und hilft diesen beim Wachsen. Diese wird momentan über eine Lampenfassung angeschlossen und sitzt abseits vom restlichen System. 

Diese Komponenten werden vereint in einem 3D-gedruckten Case, welches eine Aussparung für die Kamera lässt & 
