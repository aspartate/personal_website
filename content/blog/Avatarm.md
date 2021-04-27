---
title: "Final Project"
date: 2021-04-26T02:40:45-05:00
draft: false
---

This post will continuously document progress on my final project for PS70.

Have you seen the video where a doctor performed surgery on a grape via robot?

{{< youtube id="KNHgeykDXFw" >}}
&NewLine;

Though this came out more than a decade ago, I am fascinated by the concept of a remotely-controlled "avatar" robot. Particularly in the field of healthcare, I think such robots will transform telemedicine and help bring much-needed treatment capabilities to regions with few trained physicians. More generally, robots represent the idea of expanding human capabilities beyond the limits of our physical bodies, and will surely play a huge role in our future.

### 1. The idea.

I want to build a robot arm avatar (the "Avatarm") which will allow me to perform surgery on a grape from another room. As a realistic goal, I shall consider the surgery successful if I can cut the grape into thirds. The system shall be comprised of three components:

* The control arm, with position encoded by potentiometers
* The Avatarm, driven by motors
* A camera feed transmitting live video from the perspective of the Avatarm

### 2. The electronics.

I'm comfortable enough with 3D design/printing that I do not expect huge challenges in making the mechanical (plastic) parts of the arms. In a worst-case scenario, I have hot glue and popsicle sticks ready to deploy. However, the electronics are a bit more iffy. Therefore I want to make sure I can get the potentiometer-motor control system working before starting on the mechanical bits. I began experimenting with various control systems starting with Week 6, and after chasing a few red herrings I settled on using servo motors controlled over ESP-NOW communication. But for the sake of completeness, I am summarizing my journey below, and including the links to more detailed documentation of my (mis)adventures.

First, I tried to control a stepper motor using a potentiometer (**[Week 6 documentation](https://aspartate.github.io/personal_website/blog/week-6-stepperpot/)**). Though this ended up being somewhat successful, I realized that it faced the following limitations:
* Because the 28BYJ-48 steppers I was using were unipolar, they had 5 wires and required the use of the ULN2003 driver. This in turn translates to 4 control pins on the microcontroller. Because the Avatarm needs at least 4 degrees of freedom (and potentially 5 if I can manage it), I would need at least 16 GPIO pins to control all the motors. Even if the board I used had enough pins, it would be a hassle to wire. Bipolar motors like the NEMA17 have 4 wires and therefore can be driven by boards like the DRV8834 which only require 2 control pins. However, the NEMA17 is too heavy for a simple direct-drive robot arm mechanism. The 28BYJ-48 steppers could be modded to bipolar mode (which I did in **[Week 10](https://aspartate.github.io/personal_website/blog/week-10-closed-loop-stepper/)**), but this was a tad finicky and not as reliable as I would have liked.
* I had naively thought that steppers had more torque than servos because the steppers are made of metal and "looked beefier". It turns out that this is not true. Even the tiny SG90 servos have torque comparable to that of the unmodded 28BYJ-48 steppers, and larger servos such as the MG996R are stronger than both by an order of magnitude. Note that these estimates are complicated by the fact that stepper torque is highly dependent on motor speed, but they generally hold true.
* The lack of closed-loop feedback for steppers is a larger problem than I had anticipated. The lack of torque means that skipped steps are likely, so accurate positioning is not possible. The microcontroller controls the stepper by telling it to "move X steps in Y direction", rather than "move to position X", so the microcontroller has no way of knowing if the stepper is actually in position X or in position X - 1 (if a step is skipped). I achieved closed-loop stepper control in **[Week 10](https://aspartate.github.io/personal_website/blog/week-10-closed-loop-stepper/)**, but this requires additional potentiometers as well as more mechanical complexity.
* Steppers are slow.

![Try 2.](images/avatarm/try-2.gif)

Due to these limitations, I ultimately decided to use servos instead of steppers. This is demonstrated in **[Week 6](https://aspartate.github.io/personal_website/blog/week-6-stepperpot/)** and **[Week 7](https://aspartate.github.io/personal_website/blog/week-7-input-output/)**. I purchased MG996R steppers for their higher torque (listed as 12 kg cm). The next challenge was achieving wireless control. To do that, I needed to get two microcontrollers to talk to each other. Due to reasons detailed in my **[Week 9 documentation](https://aspartate.github.io/personal_website/blog/week-9-cloud/)**, I chose NodeMCUs as my microcontrollers.

I initially wanted to implement this over a cloud database (Firebase) which would allow the two boards to communicate anywhere in the world as long as both were connected to WiFi. Though ideal in theory, it turned out that the somewhat unpredictable lag between the transmitter/receiver microcontrollers and Firebase made this implementation impractical. This lag ranged from a few milliseconds to several seconds, and appeared to be very dependent on the quality of the WiFi connection. Below is one of the better runs:

![Testing.](images/week9-cloud/testing.gif)

As a result, I ultimately decided to go with the ESP-NOW protocol for direct board-to-board radio communication without WiFi. This was preliminarily demonstrated in **[Week 8](https://aspartate.github.io/personal_website/blog/week-8-espnow/)**. Although I was ultimately able to successfully achieve wireless servo control over ESP-NOW between the ESP32-CAM and Huzzah32, this required several rounds of debugging and a rather fussy workaround due to inherent limitations of the ESP32-CAM. Therefore I replicated this functionality on the NodeMCUs (using a tutorial from **[RandomNerd](https://RandomNerdTutorials.com/esp-now-esp8266-nodemcu-arduino-ide/)**), for a total of 4 servos all multiplexed to the single A0 ADC pin.

Here is the code on the transmitter side, and the wiring:

```python
/*
  Rui Santos
  Complete project details at https://RandomNerdTutorials.com/esp-now-esp8266-nodemcu-arduino-ide/
  
  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files.
  
  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.
*/

#include <ESP8266WiFi.h>
#include <espnow.h>

// REPLACE WITH RECEIVER MAC Address
uint8_t broadcastAddress[] = {0x00, 0x00, 0x00, 0x00, 0x00, 0x00};

// Structure example to send data
// Must match the receiver structure
typedef struct struct_message {
  int val_1;
  int val_2;
  int val_3;
  int val_4;
} struct_message;

// Create a struct_message called myData
struct_message myData;

int val_pot1 = 0;
int val_pot2 = 0;
int val_pot3 = 0;
int val_pot4 = 0;

unsigned long lastTime = 0;  
unsigned long timerDelay = 50;  // send readings timer

// Callback when data is sent
void OnDataSent(uint8_t *mac_addr, uint8_t sendStatus) {
  Serial.print("Last Packet Send Status: ");
  if (sendStatus == 0){
    Serial.println("Delivery success");
  }
  else{
    Serial.println("Delivery fail");
  }
}
 
void setup() {
  // Init Serial Monitor
  Serial.begin(74880);
    
  pinMode(D1, OUTPUT);
  pinMode(D2, OUTPUT);
  pinMode(D3, OUTPUT);
  pinMode(D4, OUTPUT);
  
  // Set device as a Wi-Fi Station
  WiFi.mode(WIFI_STA);

  // Init ESP-NOW
  if (esp_now_init() != 0) {
    Serial.println("Error initializing ESP-NOW");
    return;
  }

  // Once ESPNow is successfully Init, we will register for Send CB to
  // get the status of Trasnmitted packet
  esp_now_set_self_role(ESP_NOW_ROLE_CONTROLLER);
  esp_now_register_send_cb(OnDataSent);
  
  // Register peer
  esp_now_add_peer(broadcastAddress, ESP_NOW_ROLE_SLAVE, 1, NULL, 0);
}
 
void loop() {
  digitalWrite(D1, HIGH);
  digitalWrite(D2, LOW);
  digitalWrite(D3, LOW);
  digitalWrite(D4, LOW);
  val_pot1 = map(analogRead(A0), 0, 1024, 0, 180);
  delay(5);

  digitalWrite(D1, LOW);
  digitalWrite(D2, HIGH);
  digitalWrite(D3, LOW);
  digitalWrite(D4, LOW);
  val_pot2 = map(analogRead(A0), 0, 1024, 0, 180);
  delay(5);

  digitalWrite(D1, LOW);
  digitalWrite(D2, LOW);
  digitalWrite(D3, HIGH);
  digitalWrite(D4, LOW);
  val_pot3 = map(analogRead(A0), 0, 1024, 0, 180);
  delay(5);

  digitalWrite(D1, LOW);
  digitalWrite(D2, LOW);
  digitalWrite(D3, LOW);
  digitalWrite(D4, HIGH);
  val_pot4 = map(analogRead(A0), 0, 1024, 0, 180);
  delay(5);

//  Serial.println(val_pot1);
//  Serial.println(val_pot2);
//  Serial.println(val_pot3);
//  Serial.println(val_pot4);

  if ((millis() - lastTime) > timerDelay) {
    // Set values to send
    myData.val_1 = val_pot1;
    myData.val_2 = val_pot2;
    myData.val_3 = val_pot3;
    myData.val_4 = val_pot4;

    // Send message via ESP-NOW
    esp_now_send(broadcastAddress, (uint8_t *) &myData, sizeof(myData));

    lastTime = millis();
  }
}
```
![Transmitter wiring.](images/avatarm/transmitter-1.jpg)
![Transmitter wiring.](images/avatarm/transmitter-2.jpg)


Here is the code on the receiver side, and the wiring:

```python
/*
  Rui Santos
  Complete project details at https://RandomNerdTutorials.com/esp-now-esp8266-nodemcu-arduino-ide/
  
  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files.
  
  The above copyright notice and this permission notice shall be included in all
  copies or substantial portions of the Software.
*/

#include <ESP8266WiFi.h>
#include <espnow.h>
#include <Servo.h>

int val_pot1;
int val_pot2;
int val_pot3;
int val_pot4;

int pin_servo1 = D1;
int pin_servo2 = D2;
int pin_servo3 = D3;
int pin_servo4 = D4;

Servo servo1;
Servo servo2;
Servo servo3;
Servo servo4;

// Structure example to receive data must match the sender structure
typedef struct struct_message {
  int val_1;
  int val_2;
  int val_3;
  int val_4;
} struct_message;

// Create a struct_message called myData
struct_message myData;

// Callback function that will be executed when data is received
void OnDataRecv(uint8_t * mac, uint8_t *incomingData, uint8_t len) {
  memcpy(&myData, incomingData, sizeof(myData));
  val_pot1 = myData.val_1;
  val_pot2 = myData.val_2;
  val_pot3 = myData.val_3;
  val_pot4 = myData.val_4;
  
  servo1.write(180 - val_pot1);
  servo2.write(180 - val_pot2);
  servo3.write(180 - val_pot3);
  servo4.write(180 - val_pot4);
  
  Serial.println(val_pot1);
  Serial.println(val_pot2);
  Serial.println(val_pot3);
  Serial.println(val_pot4);
}
 
void setup() {
  // Initialize Serial Monitor
  Serial.begin(74880);

  pinMode(pin_servo1, OUTPUT);
  servo1.attach(pin_servo1);
  pinMode(pin_servo2, OUTPUT);
  servo2.attach(pin_servo2);
  pinMode(pin_servo3, OUTPUT);
  servo3.attach(pin_servo3);
  pinMode(pin_servo4, OUTPUT);
  servo4.attach(pin_servo4);

  Serial.print("ESP8266 Board MAC Address:  ");
  Serial.println(WiFi.macAddress());
  
  // Set device as a Wi-Fi Station
  WiFi.mode(WIFI_STA);

  // Init ESP-NOW
  if (esp_now_init() != 0) {
    Serial.println("Error initializing ESP-NOW");
    return;
  }
  
  // Once ESPNow is successfully Init, we will register for recv CB to get recv packer info
  esp_now_set_self_role(ESP_NOW_ROLE_SLAVE);
  esp_now_register_recv_cb(OnDataRecv);
}

void loop() {
  
}
```

![Receiver wiring.](images/avatarm/receiver-1.jpg)
![Receiver wiring.](images/avatarm/receiver-2.jpg)

Now I have a functioning robot arm, with no lag! (Although it isn't very exciting...)

![A boring robot arm.](images/avatarm/ESPNOW-demo.gif)

Time to make this look spiffy!

### 3. CAD.

Now that I had the control system down, it was up to my CAD skills to turn this into a proper robot arm. I've always really liked the aesthetic of KUKA robotics, and I found **[a 1:10 scale model of the KUKA KR150 on Thingiverse](https://www.thingiverse.com/thing:1629341)**, by user BlacklightShaman. This model was incredibly detailed, and I wanted to make it actually function. This would involve modifying the parts to actually fit servos and the microcontroller.

![.](images/avatarm/thingiverse.png)

I first scaled imported the major components of the arm to TinkerCAD and scaled them up to 150%. There were 4 major parts: the base, part A, part B, and part C (where A, B, C, are the movable parts of the arm from bottom to top). I decided on 150% scale after making measurements of the MG996R servo and finding a size at which a servo could comfortable fit at each joint.

![.](images/avatarm/tinkercad-import.png)

To mount the servo at each joint, I needed to make a custom 


Part A had a cavity on one side in which a faux stepper motor was meant to be printed and glued on. The geometry of this cavity made it difficult to work with, so I got rid of it in Meshmixer by deleting the polygons around the rim and healing using the Inspector tool.

![.](images/avatarm/fill-hole.png)
![.](images/avatarm/hole-filled.png)

I had to make servo mounts in line with the axis of rotation at each joint. To find the center of each joint, I made a transparent cylinder and did my best to line it up with existing circular features on the joint. I could then center-align other objects to this cylinder, meaning that they would be also aligned to the axis of rotation. 

![.](images/avatarm/alignment.png)

To part C, I added a couple of cable management rings which were extracted from part B.

![.](images/avatarm/cable-management-ring.png)


### 4. Future Plans

As of today (4/27), I am approximately 2 weeks away from the final presentation. I plan to leave a week for making the promo video and polishing up my documentation, so I need to finish building by May 7th. I plan to finish the output arm by the end this Friday, and work on the input arm (which will be simpler and incorporate the potentiometers) through the weekend. This would conclude the minimal viable product, which is a robot arm that can be remotely controlled via a teaching arm.

Depending on how well I meet this timeline, there are 2 potential upgrades I plan to make to this project. One is to figure out a way to record the position of the arm over a duration of time and replay them, so the arm can be "taught". Another is to use gyroscope/accelerometer sensors (such as the MPU6050) to detect the orientation of various joints of my own arm and use that information to control the orientation of the Avatarm.


### Photo Gallery.

![.](images/avatarm/A-unfinished-back.jpg)
![.](images/avatarm/A-unfinished-front.jpg)
![.](images/avatarm/A-finished-front.jpg)


![.](images/avatarm/B-unfinished-back.jpg)
![.](images/avatarm/B-unfinished-front.jpg)

![.](images/avatarm/base-back.jpg)
![.](images/avatarm/base-front.jpg)
![.](images/avatarm/base-bottom.jpg)


![.](images/avatarm/A-and-base.jpg)
![.](images/avatarm/A-B-base-1.jpg)
![.](images/avatarm/A-B-base-2.jpg)
![.](images/avatarm/A-B-base-3.jpg)




### 5. Bill of Materials.

* [ESP8266 NodeMCU Development Board](https://www.amazon.com/dp/B07HF44GBT?psc=1&ref=ppx_yo2_dt_b_product_details): **$10 for 3**
* [MG996R Metal Gear Servos](https://www.amazon.com/dp/B081JN7C4M?psc=1&ref=ppx_yo2_dt_b_product_details): **$19 for 5**
* [SG90 Plastic Gear Servos](https://www.amazon.com/Micro-Helicopter-Airplane-Remote-Control/dp/B072V529YD/ref=sr_1_8?dchild=1&keywords=sg90+servo&qid=1619543945&sr=8-8): **$18 for 10** (these were kindly provided by the PS70 teaching staff)
* [10K Potentiometers](https://www.amazon.com/gp/product/B07CZXCBWD/ref=ox_sc_saved_title_1?smid=ATHZ0BI0D2RLH&psc=1): **$6 for 10** (these were kindly provided by the PS70 teaching staff)
* [Dupont Wire (M-M, M-F)](https://www.amazon.com/EDGELEC-Breadboard-Optional-Assorted-Multicolored/dp/B07GD2BWPY/ref=sr_1_3?dchild=1&keywords=dupont+cables&qid=1619543905&sr=8-3): **$6 for 120** (I had these laying around already)
* [PLA Filament](https://www.amazon.com/Printer-Filament-SUNLU-Dimensional-Accuracy/dp/B07XG3RM58/ref=sr_1_3?dchild=1&keywords=pla%2Bfilament&qid=1619544207&sr=8-3&th=1): **$20 per kg roll** (I used white and black, probably 500g of plastic in total, so about $10 worth.)
* Various assorted small screws: **Free** (I had a lot of tiny screws laying around from various electronics I've tried to fix over the years (some of them successfully...))


Various helpful links:
* https://www.youtube.com/watch?v=uEd2B7fS8Eg
* https://www.youtube.com/watch?v=zxBC1ivOVfM
* https://www.youtube.com/watch?v=GC0gRdBpylw
* https://www.instructables.com/Wireless-Servo-Control/
* https://dronebotworkshop.com/esp32-servo/


