---
title: "Week 8 - ESP-NOW Servo Control"
date: 2021-03-23T12:59:58-04:00
draft: false
---

The assignment for this week was to implement an input/output system over the ESP-NOW radio protocol. I had access to two ESP32 boards: the ESP32-CAM and the Huzzah32. The CAM was a source of many hours of debugging because it does not appear to be optimized for GPIO. Therefore I plan to repeat this project with a standard ESP32 Dev Board or ESP8266, which should be much more straightforward.

I followed **[this tutorial](https://randomnerdtutorials.com/esp-now-esp32-arduino-ide/)** to set up ESP-NOW. First, I set the CAM as the sender and the Huzzah32 as the receiver. I did get ESP32 up and running with minimal fuss, and the default packet of information (containing a character, integer, float, string, and boolean) was sent from the Huzzah to the CAM reliably as long as both were turned on.

I then wanted to modify the code to accept the reading from a potentiometer as input. This is where my troubles with the CAM began. While running ESP-NOW, I could not get the CAM to accept an analog input via `analogRead` regardless of which pin I used. When I turned off ESP-NOW, `analogRead` would work fine. After several hours of research and trying to find a workaround, I concluded that there must be some conflict with analog-to-digital conversion (ADC) and WiFi on the CAM. I'm not sure of ESP-NOW technically counts as WiFi or not, but it does use the WiFi library so I figured that was the source of my problems.

At one point while debugging the CAM I got tired of having to short the GPIO0/GND pins by attaching and removing a jumper every time I wanted to flash new code. Therefore I made a pushbutton device that I could just leave on the two pins and press (along with the RESET button) when flashing code. This was simply a pushbutton attached to two Dupont connectors (sacrificed from a jumper cable) and wrapped in some electrical tape:

![Pushbutton jumper.](images/week8-radio/pushbutton_jumper.jpg)

Eventually I decided to switch the receiver and sender identities, so that the CAM was now the receiver. This meant I could use the Huzzah to read the potentiometer value, and that worked well. My code involved minimal changes from the tutorial, only replacing one of the values in the data packet with an `analogRead` from pin 32. Here is the code:

```python
/*
  Rui Santos
  Complete project details at https://RandomNerdTutorials.com/esp-now-esp32-arduino-ide/
  
  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files.
  
  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.
*/

#include <esp_now.h>
#include <WiFi.h>

uint8_t broadcastAddress[] = {0x00, 0x00, 0x00, 0x00, 0x00, 0x00}; // REPLACE WITH YOUR RECEIVER MAC Address

int potpin = 32;
int pot = 0;

// Structure example to send data
// Must match the receiver structure
typedef struct struct_message {
  char a[32];
  int b;
  float c;
  String d;
  bool e;
} struct_message;

// Create a struct_message called myData
struct_message myData;
 
void setup() {
  // Init Serial Monitor
  Serial.begin(115200);
 
  // Set device as a Wi-Fi Station
  WiFi.mode(WIFI_STA);

  // Init ESP-NOW
  if (esp_now_init() != ESP_OK) {
    Serial.println("Error initializing ESP-NOW");
    return;
  }

  // Once ESPNow is successfully Init, we will register for Send CB to
  // get the status of Trasnmitted packet
  esp_now_register_send_cb(OnDataSent);
  
  // Register peer
  esp_now_peer_info_t peerInfo;
  memcpy(peerInfo.peer_addr, broadcastAddress, 6);
  peerInfo.channel = 0;  
  peerInfo.encrypt = false;
  
  // Add peer        
  if (esp_now_add_peer(&peerInfo) != ESP_OK){
    Serial.println("Failed to add peer");
    return;
  }
}
 
void loop() {
  pot = map(analogRead(potpin), 0, 4095, 0, 180);
  Serial.println("Potentiometer reading:");
  Serial.println(pot);
  
  // Set values to send
  strcpy(myData.a, "THIS IS A CHAR");
  myData.b = pot;
  myData.c = 1.2;
  myData.d = "Hello";
  myData.e = false;

  // Send message via ESP-NOW
  esp_err_t result = esp_now_send(broadcastAddress, (uint8_t *) &myData, sizeof(myData));
   
  if (result == ESP_OK) {
    Serial.println("Sent with success");
  }
  else {
    Serial.println("Error sending the data");
  }
  delay(20);
}


// callback when data is sent
void OnDataSent(const uint8_t *mac_addr, esp_now_send_status_t status) {
  Serial.print("\r\nLast Packet Send Status:\t");
  Serial.println(status == ESP_NOW_SEND_SUCCESS ? "Delivery Success" : "Delivery Fail");
}
```

I could reliably get the values from the potentiometeron the Huzzah to be output on the CAM serial monitor.

![Potentiometer input.](images/week8-radio/input_pot.gif)
![Serial monitor output.](images/week8-radio/output_sm.gif)

The next step was to use the potentiometer value received by the CAM (with a range of 0-180) to drive a servo. Alas, the CAM again debunked my illusions of this being a straightforward task. I tried both the `<esp32-hal-ledc.h>` and `ESP32Servo.h` libraries, but neither would work, even on a fresh sketch without ESP-NOW. The servo would either not budge at all or emit a whining sound that told me it was not happy. Both the CAM and the servo would also get concerningly hot.

To be debugged...