---
title: "OTA with Huzzah32"
date: 2021-03-18T16:53:56-05:00
draft: false
---

Annoyed with having to connect cables to your computer every time you want to push a code update to your Huzzah32? Well, there's this wonderful thing called Arduino OTA (over-the-air) which allows you to upload wirelessly from your home network. This would come in especially handy if, for example, your board is sealed inside some contraption you just 3D-printed.

One of the disadvantages of OTA is that you have to include the code for OTA as part of every sketch you upload. This allows OTA functionality to be used for the next sketch. However, this means that anything you want to upload, even a simple blink sketch, is cluttered up by over 100 lines of rather messy functions and CSS styling. I combined **[this tutorial](https://lastminuteengineers.com/esp32-ota-web-updater-arduino-ide/)** and **[this video](https://www.youtube.com/watch?v=1pwqS_NUG7Q)** to make a (hopefully) comprehensive and simplified workflow for OTA on the Huzzah32 board.


### 1. First Upload.

The first upload needs to be via USB, since you need the OTA program running on the board in order to wirelessly upload future programs. Open in a new Arduino sketch and paste in the following, without any changes:

```python
#include <WiFi.h>
#include <WiFiClient.h>
#include <WebServer.h>
#include <ESPmDNS.h>
#include <Update.h>
#include "OTA.h"

void setup() {
  Serial.begin(115200);
  setupOTA(); // always include this line

  // Space for custom code
}

void loop() {
  server.handleClient(); // always include this line

  // Space for custom code
}
```

In the top right of the IDE, click the dropdown arrow and select "New Tab". Name this tab "OTA.h". The .h identifies this as a *header* file, which you'll notice is "included" in the code above. The purpose of this header file is to define a function `setupOTA()` which can be called from the main tab to set up the local web server. Paste the following code into the new tab:

```python
#include <WiFi.h>
#include <WiFiClient.h>
#include <WebServer.h>
#include <ESPmDNS.h>
#include <Update.h>

const char* host = "esp32";
const char* ssid = "XXXXXXXXXXXXXXXXXXXXX";
const char* password = "XXXXXXXXXXXXXXXXXXX";
WebServer server(80);

/* Style */
String style =
"<style>#file-input,input{width:100%;height:44px;border-radius:4px;margin:10px auto;font-size:15px}"
"input{background:#f1f1f1;border:0;padding:0 15px}body{background:#3498db;font-family:sans-serif;font-size:14px;color:#777}"
"#file-input{padding:0;border:1px solid #ddd;line-height:44px;text-align:left;display:block;cursor:pointer}"
"#bar,#prgbar{background-color:#f1f1f1;border-radius:10px}#bar{background-color:#3498db;width:0%;height:10px}"
"form{background:#fff;max-width:258px;margin:75px auto;padding:30px;border-radius:5px;text-align:center}"
".btn{background:#3498db;color:#fff;cursor:pointer}</style>";

/* Login page */
String loginIndex = 
"<form name=loginForm>"
"<h1>ESP32 Login</h1>"
"<input name=userid placeholder='User ID'> "
"<input name=pwd placeholder=Password type=Password> "
"<input type=submit onclick=check(this.form) class=btn value=Login></form>"
"<script>"
"function check(form) {"
"if(form.userid.value=='admin' && form.pwd.value=='admin')"
"{window.open('/serverIndex')}"
"else"
"{alert('Error Password or Username')}"
"}"
"</script>" + style;
 
/* Server Index Page */
String serverIndex = 
"<script src='https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js'></script>"
"<form method='POST' action='#' enctype='multipart/form-data' id='upload_form'>"
"<input type='file' name='update' id='file' onchange='sub(this)' style=display:none>"
"<label id='file-input' for='file'>   Choose file...</label>"
"<input type='submit' class=btn value='Update'>"
"<br><br>"
"<div id='prg'></div>"
"<br><div id='prgbar'><div id='bar'></div></div><br></form>"
"<script>"
"function sub(obj){"
"var fileName = obj.value.split('\\\\');"
"document.getElementById('file-input').innerHTML = '   '+ fileName[fileName.length-1];"
"};"
"$('form').submit(function(e){"
"e.preventDefault();"
"var form = $('#upload_form')[0];"
"var data = new FormData(form);"
"$.ajax({"
"url: '/update',"
"type: 'POST',"
"data: data,"
"contentType: false,"
"processData:false,"
"xhr: function() {"
"var xhr = new window.XMLHttpRequest();"
"xhr.upload.addEventListener('progress', function(evt) {"
"if (evt.lengthComputable) {"
"var per = evt.loaded / evt.total;"
"$('#prg').html('progress: ' + Math.round(per*100) + '%');"
"$('#bar').css('width',Math.round(per*100) + '%');"
"}"
"}, false);"
"return xhr;"
"},"
"success:function(d, s) {"
"console.log('success!') "
"},"
"error: function (a, b, c) {"
"}"
"});"
"});"
"</script>" + style;

/* setup function */
void setupOTA() {
  // Connect to WiFi network
  WiFi.begin(ssid, password);
  Serial.println("");

  // Wait for connection
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.print("Connected to ");
  Serial.println(ssid);
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());

  /*use mdns for host name resolution*/
  if (!MDNS.begin(host)) { //http://esp32.local
    Serial.println("Error setting up MDNS responder!");
    while (1) {
      delay(1000);
    }
  }
  Serial.println("mDNS responder started");
  /*return index page which is stored in serverIndex */
  server.on("/", HTTP_GET, []() {
    server.sendHeader("Connection", "close");
    server.send(200, "text/html", loginIndex);
  });
  server.on("/serverIndex", HTTP_GET, []() {
    server.sendHeader("Connection", "close");
    server.send(200, "text/html", serverIndex);
  });
  /*handling uploading firmware file */
  server.on("/update", HTTP_POST, []() {
    server.sendHeader("Connection", "close");
    server.send(200, "text/plain", (Update.hasError()) ? "FAIL" : "OK");
    ESP.restart();
  }, []() {
    HTTPUpload& upload = server.upload();
    if (upload.status == UPLOAD_FILE_START) {
      Serial.printf("Update: %s\n", upload.filename.c_str());
      if (!Update.begin(UPDATE_SIZE_UNKNOWN)) { //start with max available size
        Update.printError(Serial);
      }
    } else if (upload.status == UPLOAD_FILE_WRITE) {
      /* flashing firmware to ESP*/
      if (Update.write(upload.buf, upload.currentSize) != upload.currentSize) {
        Update.printError(Serial);
      }
    } else if (upload.status == UPLOAD_FILE_END) {
      if (Update.end(true)) { //true to set the size to the current progress
        Serial.printf("Update Success: %u\nRebooting...\n", upload.totalSize);
      } else {
        Update.printError(Serial);
      }
    }
  });
  server.begin();
}
```

Change the lines of Xs to your WiFi SSID and password, respectively. Save the sketch and go to "Sketch" > "Show Sketch Folder". You should see 2 items: an Arduino file and an H file. Then connect your Huzzah32 to the computer and click upload from the IDE.

Next, open the Serial Monitor and press the reset button on the Huzzah. After a while, you should see an IP address pop up. If you get stuck at this step, double-check your SSID and password or move to an area with better WiFi.

Paste that IP address into your browser address bar and you should see the following page:

![Login page.](images/huzzah32-ota/login-page.png)

The username and password are both "admin". (This can be changed in the OTA.h code above.) **Note that this portal is not secure anyways, since the login page can be bypassed by going to the URL of the next page directly.**

You should now see the following:

![Upload page.](images/huzzah32-ota/upload-page.png)

If so, you have successfully set up OTA on your Huzzah32. Bookmark either the login page or upload page for future reference. Disconnect it from the computer and plug the microUSB cable into a battery pack or wall adapter. Time for the fun part!

### 2. Wireless Uploading

Refresh the login or upload page and verify that the portal shows up. If so, your Huzzah32 is connected to your WiFi network and is ready to receive code. Go back to your Arduino sketch and put whatever code you want in the designated spaces in the first tab (labeled "Space for custom code"). Do not touch the second tab (OTA.h). If you'd like a simple blink sketch to experiment with, clear everything in your main tab and copy-paste the following into it:

```python
#include <WiFi.h>
#include <WiFiClient.h>
#include <WebServer.h>
#include <ESPmDNS.h>
#include <Update.h>
#include "OTA.h"

//Blinking an LED with millis
const int led = 21; // Huzzah32 GPIO pin to which LED is connected
unsigned long previousMillis = 0;  // will store last time LED was updated
const long interval = 1000;  // interval at which to blink (milliseconds)
int ledState = LOW;  // ledState used to set the LED

void setup() {
  Serial.begin(115200);
  setupOTA(); //always include
  
  pinMode(led, OUTPUT);
}

void loop() {
  server.handleClient(); //always include
  
  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= interval) {
  	previousMillis = currentMillis;
  	ledState = not(ledState);
  	digitalWrite(led,  ledState);
  }
}
```
After saving, go to "Sketch" > "Export compiled Binary". Then go to "Sketch" > "Show Sketch Folder" to see if the binary file (.BIN) is there. Upload the binary file into the upload page in your browser, and click "Update".

![Uploading.](images/huzzah32-ota/uploading.png)

When the progress bar reaches 100%, your code has been successfully uploaded. If your Huzzah32 isn't doing anything, double-check that your pin definitions are correct. Refer to the helpful diagram below, courtesy of the **[Makeability Lab](https://makeabilitylab.github.io/physcomp/esp32/pot-fade.html#the-code)**:

![Huzzah32 Pin Definitions.](images/huzzah32-ota/huzzah32-pins.png)

For all code updates in the future, just make a copy of the entire Arduino sketch folder (make sure to include the OTA.h file, though you can delete the binary file) and change the custom code part in the main tab. One caveat to be mindful of: **always** use `millis()` instead of `delay()`, because the latter will interfere with the WiFi.

Enjoy your new wireless Huzzah32! From now on, as long as it is powered on and within range of the stored network, you can upload code through the browser portal.