---
title: "Week 7 - Input/Output"
date: 2021-03-11T16:50:16-05:00
draft: true
---


The assignment this week was to create an input-output system, preferably using millis() for timing. Since we recently learned to use the Adafruit TFT display in lab, I decided to build upon my work for the final project to have the TFT display the motor angle. This turned out to be not as simple as simply mashing together the TFT code from **[here](https://learn.adafruit.com/adafruit-1-14-240x135-color-tft-breakout/arduino-wiring-test)** with the servo code from **[here](https://www.arduino.cc/en/tutorial/knob)**.

I wanted the display to update at a certain framerate (10 Hz) so the numbers are actually visible on screen for an appreciable amount of time. This required the use of the millis() function so that the display updates at a rate independently of the servo position/potentiometer sampling rate. Other minor changes included setting the screen to landscape mode (`tft.setRotation(1)`), defining the appropriate character and string variables to display motor angle, and customizing the text style. Below is what I tried:

```python
#include <Servo.h>
#include <Adafruit_GFX.h>    // Core graphics library
#include <Adafruit_ST7735.h> // Hardware-specific library for ST7735
#include <Adafruit_ST7789.h> // Hardware-specific library for ST7789
#include <SPI.h>

#define TFT_CS        10
#define TFT_RST        -1 // Or set to -1 and connect to Arduino RESET pin
#define TFT_DC         8
Adafruit_ST7789 tft = Adafruit_ST7789(TFT_CS, TFT_DC, TFT_RST);

Servo myservo;  // create servo object to control a servo

int potpin = A0;  // analog pin used to connect the potentiometer
int val;    // variable to read the value from the analog pin

int update_interval = 100;
unsigned long current_millis = 0;
unsigned long previous_millis = 0;
char pos_print[4];  // Initialize character array for printing on TFT

void setup() {
  myservo.attach(9);  // attaches the servo on pin 9 to the servo object
  Serial.begin(9600);
  tft.init(135, 240);
  tft.fillScreen(ST77XX_BLACK);
  tft.setRotation(1);
}

void loop() {
  current_millis = millis();
  val = map(analogRead(potpin), 0, 1023, 0, 180);     // scale it to use it with the servo (value between 0 and 180)
  myservo.write(val);                  // sets the servo position according to the scaled value

  if (current_millis - previous_millis >= update_interval){
    tft.fillScreen(ST77XX_BLACK);
    String pos = String(val);
    pos.toCharArray(pos_print, 4);
    TFTwrite(pos_print, ST77XX_WHITE);
    Serial.println(pos_print);
    previous_millis = current_millis;
  }
}

void TFTwrite(char *text, uint16_t color) {
  tft.setCursor(0, 0);
  tft.setTextColor(color);
  tft.setTextSize(5);
  tft.setTextWrap(true);
  tft.print(text);
}
```
![Jerky movement.](images/week7-io/jerky.gif)

Notice the jerky movement on the servo and the less-than ideal refresh behavior of the TFT. After some diagnosing, I found that both problems had a common cause: the slowness of `tft.fillScreen(ST77XX_BLACK)` meant that every time the screen refreshed, it would visibly turn black and keep the servo from responding to potentiometer movements. Some Googling gave me a solution: replace `tft.fillScreen(ST77XX_BLACK)` with the more efficient `TFTwrite(pos_print, ST77XX_BLACK)`, which prints the stored pos_print value in black pixels and thus effectively erases the previous screen output without having to change every pixel. This resulted in the following:

```python
#include <Servo.h>
#include <Adafruit_GFX.h>    // Core graphics library
#include <Adafruit_ST7735.h> // Hardware-specific library for ST7735
#include <Adafruit_ST7789.h> // Hardware-specific library for ST7789
#include <SPI.h>

#define TFT_CS        10
#define TFT_RST        -1 // Or set to -1 and connect to Arduino RESET pin
#define TFT_DC         8
Adafruit_ST7789 tft = Adafruit_ST7789(TFT_CS, TFT_DC, TFT_RST);

Servo myservo;  // create servo object to control a servo

int potpin = A0;  // analog pin used to connect the potentiometer
int val;    // variable to read the value from the analog pin

int update_interval = 100;
unsigned long current_millis = 0;
unsigned long previous_millis = 0;
char pos_print[4];  // Initialize character array for printing on TFT

void setup() {
  myservo.attach(9);  // attaches the servo on pin 9 to the servo object
  Serial.begin(9600);
  tft.init(135, 240);
  tft.fillScreen(ST77XX_BLACK);
  tft.setRotation(1);
}

void loop() {
  current_millis = millis();
  val = map(analogRead(potpin), 0, 1023, 0, 180);     // scale it to use it with the servo (value between 0 and 180)
  myservo.write(val);                  // sets the servo position according to the scaled value

  if (current_millis - previous_millis >= update_interval){
    TFTwrite(pos_print, ST77XX_BLACK);
    String pos = String(val);
    pos.toCharArray(pos_print, 4);
    TFTwrite(pos_print, ST77XX_WHITE);
    Serial.println(pos_print);
    previous_millis = current_millis;
  }
}

void TFTwrite(char *text, uint16_t color) {
  tft.setCursor(0, 0);
  tft.setTextColor(color);
  tft.setTextSize(5);
  tft.setTextWrap(true);
  tft.print(text);
}
```

![Smooth movement.](images/week7-io/smooth.gif)

As you can see, this works much better: the servo rotation is smooth and responsive, and the screen is perfectly readable. Prior result shown again for comparison:

![Jerky movement.](images/week7-io/jerky.gif)
