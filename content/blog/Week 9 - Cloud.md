---
title: "Week 9 - The Cloud"
date: 2021-03-25T16:11:36-04:00
draft: false
---

The assignment this week was to control a microcontroller over Bluetooth or Wifi. This was a perfect opportunity to make progress on my final project (the Avatarm) since my goal was to achieve remote control of the robot arm from anywhere in the world with WiFi. In lab, we learned how to control an LED on a Huzzah from a web portal via a Firebase real-time database.

![Firebase LED demo.](images/week9-cloud/LED-demo.gif)

I really liked how intuitive and reliable Firebase was, so I decided to build on it and see if I could 1) control a servo instead of an LED and 2) send commands from another microcontroller instead of a web portal. At the time, however, I only had two WiFi-enabled microcontrollers: the Huzzah32 and ESP32-CAM from the kit. As evidenced by my previous posts, the ESP32-CAM gave me more than its fair share of trouble. Besides the need to use an FTDI programmer and manually flash the code every time, the WiFi library on the ESP32-CAM does not play nice with `analogRead` or `digitalWrite`, which is rather inconvenient for my purposes.

I foresaw many more hours of painful debugging in the future if I were to keep using the CAM, so I instead purchased several ESP8266 NodeMCUs (v1.0). These were less than $4 each, a small price to pay for not having to deal with the ESP32-CAM any more. The NodeMCUs have a microUSB interface with automatic code flashing and many pins to work with, replicating most of the functionality of the Huzzah32 but at a much cheaper price. The only downside that I knew of was the presence of only one analog-to-digital converter (ADC) pin on the NodeMCU (see below pinout courtesy of **[RandomNerd](https://randomnerdtutorials.com/esp8266-pinout-reference-gpios/
)**), which means that reading from multiple sensors is a bit more complicated. However, I came across a tutorial to multiplex this single pin so that reading from two (or more) potentiometers is possible. I'll get into the strategy later; it's really cool.

![NodeMCU pinout.](images/week9-cloud/nodemcu-pinout.png)

Now that I had a couple of NodeMCUs, I thought I might as well use it for both the sender and the receiver. So I lightly tweaked the LED code to make sure that the NodeMCU could talk to Firebase. One issue I ran into was if I moved the NodeMCU to a different part of the house, it would disconnect from the WiFi network. This is because my room gets WiFi from an extender with its own network SSID. I tried using the WifiMulti example sketch to enable the NodeMCU to memorize different networks, but it didn't work. However, I came across this fantastic workaround posted by user J-M-L on the **[Arduino forums](https://forum.arduino.cc/index.php?topic=455414.0)**, based on the WifiScan example sketch. It basically stores a list of known SSIDs and passwords and compares it against the results of a scan for available networks, then connects to a matched network. This means that every time I turn on the NodeMCU (or press RESET), it would connect to an available network, as long as that network was previously stored on the device. 

Because the code was a bit bulky to include in the body of the Arduino script, I packaged it into a header file that can be included as a separate tab and called with the function `wifiConnect()`. In addition, I wanted a visual indication of when the NodeMCU was scanning for networks as well as when it was connected. From **[this blog post](https://lowvoltage.github.io/2017/07/09/Onboard-LEDs-NodeMCU-Got-Two)**, I found that the NodeMCU has 2 onboard LEDs (which made me like this board even more), attached to pins 2 and 6. Moreover, they are powered by inverse logic, meaning that the LED is lit when the corresponding pin is OFF and vice versa. Therefore, I made one of the LEDs light up when initializing and searching and attached a second yellow LED which turns on when the network is connected. The below header file needs to be placed into the same folder as the main script, and included with `#include "wifiConnect.h"`. The function can be called with `wifiConnect()` in the `setup()` portion of the code.

```python
// This code is adapted from user J-M-L at https://forum.arduino.cc/index.php?topic=455414.0

#include "ESP8266WiFi.h"

int pin_builtinLEDchip = 2;
int pin_builtinLEDusb = 16;

// DEFINE HERE THE KNOWN NETWORKS
const char* KNOWN_SSID[] = {
                            "XXXXXXXXX",
                            "XXXXXXXXX", 
                            "XXXXXXXXX"
                            };
const char* KNOWN_PASSWORD[] = {
                                "XXXXXXXXX", 
                                "XXXXXXXXX", 
                                "XXXXXXXXX"
                                };

// DON'T TOUCH THE BELOW CODE
const int   KNOWN_SSID_COUNT = sizeof(KNOWN_SSID) / sizeof(KNOWN_SSID[0]); // number of known networks

void wifiConnect() {
  pinMode(pin_builtinLEDusb, OUTPUT);
  boolean wifiFound = false;
  int i, n;

  Serial.begin(74800);

  // ----------------------------------------------------------------
  // Set WiFi to station mode and disconnect from an AP if it was previously connected
  // ----------------------------------------------------------------
  WiFi.mode(WIFI_STA);
  WiFi.disconnect();

  // ----------------------------------------------------------------
  // WiFi.scanNetworks will return the number of networks found
  // ----------------------------------------------------------------
  Serial.println(F("Scanning for networks..."));
  int nbVisibleNetworks = WiFi.scanNetworks();
  Serial.println(F("Scan complete."));
  if (nbVisibleNetworks == 0) {
    Serial.println(F("No networks found. Hang in there, I'm trying again."));
    while (true); // Auto launch the Soft WDT reset via infinite while loop
  }

  // ----------------------------------------------------------------
  // if you arrive here at least some networks are visible
  // ----------------------------------------------------------------
  Serial.print(nbVisibleNetworks);
  Serial.println(" network(s) found.");
  

  // ----------------------------------------------------------------
  // check if we recognize one by comparing the visible networks
  // one by one with our list of known networks
  // ----------------------------------------------------------------
  for (i = 0; i < nbVisibleNetworks; ++i) {
    Serial.print("Testing ");
    Serial.println(WiFi.SSID(i)); // Print current SSID
    for (n = 0; n < KNOWN_SSID_COUNT; n++) { // walk through the list of known SSID and check for a match
      if (strcmp(KNOWN_SSID[n], WiFi.SSID(i).c_str())) {
        Serial.print(F("Not matching "));  // not sure what this line does
        Serial.println(KNOWN_SSID[n]);
      } else { // we got a match
        wifiFound = true;
        break; // n is the network index we found
      }
    } // end for each known wifi SSID
    if (wifiFound) break; // break from the "for each visible network" loop
  } // end for each visible network

  if (!wifiFound) {
    Serial.println(F("No known networks found. Hang in there, I'm trying again."));
    while (true); // Auto launch the Soft WDT reset via infinite while loop
  }

  // ----------------------------------------------------------------
  // if you arrive here you found 1 known SSID
  // ----------------------------------------------------------------
  Serial.print(F("\nConnecting to "));
  Serial.println(KNOWN_SSID[n]);

  // ----------------------------------------------------------------
  // We try to connect to the WiFi network we found
  // ----------------------------------------------------------------
  WiFi.begin(KNOWN_SSID[n], KNOWN_PASSWORD[n]);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
    digitalWrite(pin_builtinLEDusb, LOW);  // Turn on builtin USB 
  }
  Serial.println("");

  // ----------------------------------------------------------------
  // SUCCESS, you are connected to the known WiFi network
  // ----------------------------------------------------------------
  Serial.print(F("WiFi connected, your IP address is: "));
  Serial.println(WiFi.localIP());

  digitalWrite(pin_builtinLEDusb, HIGH);
}
```

The next step was to get multiplexing to work. Pin A0 is the only ADC pin on the NodeMCU, and I wanted to be able to control my robot arm with multiple potentiometers, one for each joint. I found **[this tutorial](https://create.arduino.cc/projecthub/e_s_c/how-to-read-multiple-analog-values-using-one-analog-pin-f5f6db)** which presented a surprisingly elegant solution: connecting the middle pin of both potentiometers to A0 and reading from each one in rapid succession. Reading each potentiometer individually was possible because power is supplied by one of the GPIO pins, so each potentiometer could be "switched on" or "switched off" by driving its corresponding pin to HIGH or LOW. This happens fast enough that the two potentiometers are essentially being read simultaneously. There is one subtlety, however: in order to avoid current from one potentiometer traveling back up the other potentiometer and creating a short, a diode is placed between each of the center pins and pin A0. Here is the diagram from the tutorial:

![ADC multiplexing on the NodeMCU.](images/week9-cloud/ADC-multiplex.png)

In order to upload the positional information from each potentiometer, all I needed to do was use `Firebase.set()` to write it to the corresponding directory ("/POT_1" or "/POT_2"). Here is my code:

```python
#include <FirebaseESP8266.h>                        // firebase library
#include "wifiConnect.h"

#define FIREBASE_HOST "XXXXXXXXXXXXXXXXX"  // the project name address from firebase id
#define FIREBASE_AUTH "XXXXXXXXXXXXXXX"    // the secret key generated from firebase

int pin_3V_pot1 = 5;
int pin_3V_pot2 = 4;

int val_pot1 = 0;                                          // value of potentiometer reading
int val_pot2 = 0;
int pin_input_pot = A0;                                         // This is the only ADC pin available on the ESP8266 NodeMCU

//Define FirebaseESP32 data object
FirebaseData firebaseData;

void setup() {
  pinMode(pin_3V_pot1, OUTPUT);
  pinMode(pin_3V_pot2, OUTPUT);
  
  wifiConnect();  // Calls the wifiConnect.h header

  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);                  // connect to firebase
  Firebase.reconnectWiFi(true);
}

void loop() {
  digitalWrite(pin_3V_pot1, HIGH); // Turn D1 On
  digitalWrite(pin_3V_pot2, LOW); // Turn D2 Off
  val_pot1 = map(analogRead(pin_input_pot), 50, 850, 0, 180);
  delay(10);
  
  digitalWrite(pin_3V_pot2, HIGH); // Turn D1 On
  digitalWrite(pin_3V_pot1, LOW); // Turn D2 Off
  val_pot2 = map(analogRead(pin_input_pot), 50, 850, 0, 180);
  delay(10);
  
  Firebase.set(firebaseData, "/POT_1", val_pot1);             
  Firebase.set(firebaseData, "/POT_2", val_pot2);  

  Serial.print("POT_1 = ");
  Serial.println(val_pot1);
  Serial.print("POT_2 = ");
  Serial.println(val_pot2);
}
```

Next, I needed to build the receiving end of the system, also controlled by a NodeMCU. This was actually simpler, as the microcontroller just needed to read the data from the correct Firebase directory and write it to a servo. I purchased MG996R servos (about $4 each) for the Avatarm, because they seemed to provide a good amount of torque (listed 12 kg/cm), about ten times as much as the small SG90 servos. I used the "Servo.h" library to drive the servos, and it was fairly straightforward. For WiFi, I just had to include the same header file as above.

```python
#include <FirebaseESP8266.h>                        // firebase library
#include "wifiConnect.h"

#include <Servo.h>

#define FIREBASE_HOST "XXXXXXXXXXXXXx"  // the project name address from firebase id
#define FIREBASE_AUTH "XXXXXXXXXXXXXx"  // the secret key generated from firebase

int pos_servo1 = 0;                                          // value of potentiometer reading
int pos_servo2 = 0;

int pin_servo1 = 5;
int pin_servo2 = 4;

Servo servo1;
Servo servo2;

//Define FirebaseESP32 data object
FirebaseData firebaseData;

void setup() {
  pinMode(pin_servo1, OUTPUT);
  pinMode(pin_servo2, OUTPUT);
  servo1.attach(pin_servo1);
  servo2.attach(pin_servo2);

  wifiConnect();  // Calls the wifiConnect.h header
  
  Firebase.begin(FIREBASE_HOST, FIREBASE_AUTH);                  // connect to firebase
  Firebase.reconnectWiFi(true);
}

void loop() {

  Firebase.get(firebaseData, "/POT_1");                  
  pos_servo1 = firebaseData.intData();
  servo1.write(180-pos_servo1);

  Firebase.get(firebaseData, "/POT_2");                    
  pos_servo2 = firebaseData.intData();
  servo2.write(180-pos_servo2);
}
```

Indeed, it works! To see if the servos can perform well under load, I cobbled together an "arm" using binder clips and some extra parts from the laser-cut kit. I was pleased with how well the WiFi indicators worked. However, there is a somewhat inconsistent lag. It seems to depend on the quality of my internet connection, but in the best-case scenario I was able to shave this lag down to less than a second.

![Testing.](images/week9-cloud/testing.gif)

I present to you my greatest invention: the Dueling Chair. Perfect for professors who need to fend off hordes of sleep-deprived students during office hours!

![Dueling chair.](images/week9-cloud/dueling-chair.gif)