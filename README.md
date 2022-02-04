# GrowTimeLapseHelper

Der GrowTimeLapseHelper hilft dir die Feuchtigkeit deiner Pflanzen zu überwachen und dabei noch eine schöne Zeitrafferaufnahme mit aktuellen Bildern aufzunehmen! Im Frontend ist es möglich die Bilder und den Verlauf der Feuchtigkeitswerte einzusehen, Bilder zu löschen und eine aktuelle Version der Timelapse anzusehen.

## Run
**Anmerkung:** Beim Ausführen des Projektes mit Docker kommt es zu Bugs mit Apex-Charts (die Charts werden doppelt gerendert). Dieser Bug ist bekannt, bisher jedoch noch nicht behoben. [Siehe hier](https://github.com/apexcharts/vue3-apexcharts/issues/3). Abseits der Docker-Container tritt dieser Fehler nicht auf.

Um das Projekt zum Laufen zu kriegen, muss die Docker-Engine laufen. Mit dem Shell Script  [StartAll.sh](https://github.com/hfg-joschua-r/ws3-softwareentwurf/blob/main/GTLH/startAll.sh) lassen sich alle Images der Services builden und in Containern starten. Auf dem ESP-32 muss der [takeAndSend.ino](https://github.com/hfg-joschua-r/ws3-softwareentwurf/blob/main/GTLH/ArduinoCode/takeAndSendImg/takeAndSendImg.ino) Code hochgeladen werden. Auf dem ESP8266, der [sensorESP.ino](https://github.com/hfg-joschua-r/ws3-softwareentwurf/blob/main/GTLH/ArduinoCode/sensorESP/sensorESP.ino) Code.


## Projektaufbau

![ProjektAufbau](https://i.ibb.co/XJQrR9k/Technischer-Aufbau2.png)

## Physische Schicht

Auf der physischen Schicht befinden sich zwei Micro-Controller. Der [ESP-32 mit Cam](https://www.amazon.de/RETTI-Esp32-Cam-Bluetooth-Entwicklungs-UnterstüTzung-schwarz/dp/B08MZV1TT9/ref=sr_1_5?__mk_de_DE=ÅMÅŽÕÑ&crid=7IWAZHF91X5J&keywords=esp32-cam&qid=1643972715&s=ce-de&sprefix=esp32-cam%2Celectronics%2C65&sr=1-5) ist dafür zuständig, in einem festgelegten Takt (momentan 1 Stunde) Bilder aufzunehmen und ans Backend mittels einem *Base64 String* zu senden. Der zweite ESP8266 ist mit einem Feuchtigkeitssensor verbunden, liest dessen Werte aus und sendet diese an einen seperaten Backend-endpoint über HTTP. 

>Die Growlampe, die ein Vollspektrum an Licht abgibt, simuliert Sonnenlicht für die Pflanzen und hilft diesen beim Wachsen. Diese wird momentan über eine Lampenfassung angeschlossen und sitzt abseits vom restlichen System. 

Diese Komponenten werden vereint in einem 3D-gedruckten Case, welches eine Aussparung für die Kamera und die Lampenfassung lässt.

![Rendering](https://i.ibb.co/wrMfqSr/rendering.gif)

## Backend

Das Backend erstreckt sich über **drei** verschiedene Services: Einen Userservice, einen Dataservice und einen Deviceservice.

### Dataservice
Der Dataservice ist dafür verantwortlich, Sensor- & Bilddaten von den beiden Microcontrollern entgegenzunehmen und diese in der Datenbank und beim Imagehoster zu speichern. Dabei gibt es vorallem zwei wichtige API-Endpoints: 
* `/api/sensorValues`
Nimmt Sensorwerte und die DeviceID entgegen, um einen Datenbankeintrag mit den Werten und einer Zeitangabe anzulegen. Bevor dies geschieht, wird erst ein request an den Deviceservice geschickt, um zu überprüfen, ob das Device registriert ist.
* `/api/imageUpload` 
Dieser Endpoint funktioniert sehr ähnlich wie der voran beschriebene Endpoint, mit dem Unterschied, dass er ein *Base64 String* entgegennimmt, diesen in ein *.jpg* konvertiert und dann bei [cloudinary](https://cloudinary.com/?utm_source=google&utm_medium=cpc&utm_campaign=Rbrand&utm_content=486819957357&utm_term=cloudinary&gclid=Cj0KCQiAuvOPBhDXARIsAKzLQ8G_LkepyspAf-NGcWVZpzcBGeWgN8I07c5ntNgZjVjeocdLNP25oiAaAnUKEALw_wcB) hochlädt. Der direkte Link zu dem Bild wird dann in der *moistureImg* collection gespeichert.

### Deviceservice 

Der Device Service verwaltet die registrierten Devices und bietet Endpoints, um Devices zu Claimen und zu authentifizieren.

* `/device/auth`
Hier wird die DeviceID einmal überprüft, ob diese in der Datenbank-Collection "registeredDevices" registriert ist. Das Device Objekt in der Datenbank besitzt einen Eintrag für einen Besitzter und eine Boolean *isClaimable*. Wenn das Device vorhanden ist und noch nicht geclaimed wurde, ist es nun 15 Minuten über das Frontend claimable.
* `/device/claim` 
Sofern das device claimable ist, ist es über diesen Endpoint möglich einen Device für sich zu claimen. *Anmerkung: dieser Endpoint ist obsolet und wird aus Sicherheitsgründen entfernt.*

### Userservice

Der Userservice bietet alle wichtigen Endpoints um dem Frontend alle Daten und Funktionen zu bieten, die es braucht. Die Folgende Sektion wird aufgeteilt in **Authentifizierungs-Endpoints** und **Data-Endpoints**.

#### Authentifizierungs-Endpoints

* `/api/register`
Entgegengenommen wird ein Username, eine Email-Adresse und ein Passwort. Letzteres wird direkt durch bcrypt gehashed und so in der Datenbank gespeichert.

* `/device/login`
Sollte das angegebene Passwort mit dem gehashten Passwort aus der Datenbank übereinstimmen, wird für den User ein [JWT-Token](https://github.com/hfg-joschua-r/ws3-softwareentwurf/blob/f0d5cd906e58f546cc307f84c7eef37449e7f703/GTLH/userservice/routes/routes.js#L49) generiert, welches dem User daraufhin zurückgegeben wird. 

#### Data-Endpoints

>Um diese Daten sicher zu halten, wird jeder der folgenden Requests erst durch die [isLoggedIn Middleware](https://github.com/hfg-joschua-r/ws3-softwareentwurf/blob/main/GTLH/userservice/middleware/users.js) geschickt. Diese überprüft das gegebene JWT Token, welches im *x-access-token* Header übergeben wird, mit dem gespeicherten JWT-Secret. 

* `/api/pairedDevices/:username`
Gibt alle Devices, die dem gegebenen Username zugeordnet sind zurück.
* `/api/lastValues/:deviceID`
Gibt die letzten 90 Werte für die gegebene Device-Id zurück.
* `/api/lastImages/:deviceID`
Gibt die letzten 50 Bilder für die zugehörige Device-Id zurück.
* `/api/pairDevice`
Schaut nach der gegeben Device-Id, sofern dieser claimable ist, kann der User diesen für sich beanspruchen. 
* `/api/deleteImage`
Nimmt eine Image-Url entgegen, und löscht den zugehörigen Eintrag in der Datenbank.
* `/api/nearestImg`
Sucht das näheste Image zu dem gegeben Timestamp und gibt dieses zurück.
* `/api/nearestVal`
Sucht den nähesten Moisture Wert zu dem gegeben Timestamp und gibt diesen zurück.

## Frontend

Im Frontend gibt es hauptsächlich vier verschiedene Seiten. Eine Login und eine Register Page, eine Profilansicht und das Home-Dashboard.

Auf dem Dashboard findet der User verschieden Darstellungen und Funktionen vor: 
* Eine historische Ansicht der Sensorwerte
    * Beim Klick auf einen der Werte wird das näheste Bild angezeigt.
* Den aktuellen Stand der Timelapse
    * Mit einem Klick hierauf pausiert diese.
* Alle Bilder in einem Karussell
    * Beim Klicken der Bilder erscheint der näheste Feuchtigkeitswert.
    * Mit dem Delete-Button wird das gewählte Bild gelöscht
* Ein Button um einen neues Device zu pairen 

> Beim Login wird das JWT-Token mitsamt username im local-storage gespeichert und folglich bei jedem HTTP-Request ans Backend im *x-access-token* Header mitgeschickt.

Hier ein [Demonstrationsvideo](https://www.youtube.com/watch?v=Sy01cNKw7Yw): 
[![Watch the video](https://img.youtube.com/vi/Sy01cNKw7Yw/default.jpg)](https://www.youtube.com/watch?v=Sy01cNKw7Yw)
## Weitere Features / Überlegungen

Was ich gern noch verbessern würde, wäre die Bildqualität. Da es bisher nur über den *Base64 String* funktioniert. Wenn man eventuell auf ein anders Protokoll wechseln würde, könnte es möglich sein, die Bilder auch anders zu verschicken. Das Problem liegt leider auch beim ESP32, da bei einem zu großen base64String der Speicher vollläuft. 
Verbesserungen könnten auch noch beim Case stattfinden, um dieses noch modularer zu gestalten. 
Auch eine automatische Bewässerung wär noch ein schönes Feature.

## Skalierung

Die Skalierbarkeit im Backend ist soweit gegeben, dass der primäre Punkt zur Verbesserung im Frontend liegt. Hier könnte man die Übersicht bei mehreren Sensoren durchaus verbessern. Wenn jeder Sensor noch eine Detailseite erhalten würde, wäre es übersichtlicher.

## About 
Dies ist ein Projekt aus dem Kurs *Softwareentwurf und Anwendung verteilter Systeme* von **Joschua Rothenbacher**.
