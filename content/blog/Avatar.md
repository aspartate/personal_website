---
title: "Final Project"
date: 2021-03-09T02:40:45-05:00
draft: false
---

This post will continuously document progress on my final project for PS70.

Have you seen the video where a doctor performed surgery on a grape via robot?

{{< youtube id="KNHgeykDXFw" >}}
&NewLine;

Though this came out more than a decade ago, I am fascinated by the concept of a remotely-controlled "avatar" robot. Particularly in the field of healthcare, I think such robots will transform telemedicine and help bring much-needed treatment capabilities to regions with few trained physicians. More generally, robots represent the idea of expanding human capabilities beyond the limits of our physical bodies, and will surely play a huge role in our future.

### 1. The idea.

I want to build a robot arm avatar (the "Avatarm") which will allow me to perform surgery on a grape from another room. As a realistic goal, I shall consider the surgery successful if I can cut the grape into thirds. The system shall be comprised of three components:

* The control arm
* The Avatarm
* A camera feed transmitting live video from the perspective of the Avatarm

I initially plan to use stepper motors because they can generate higher torque than servos, though if the lack of closed-loop feedback turns out to be an issue I may change to servos. For encoding position of the control arm, I will use potentiometers.

### 2. The electronics.

I'm comfortable enough with 3D design/printing that I do not expect insurmountable challenges in making the mechanical (plastic) parts of the arms. In a worst-case scenario, I have hot glue and popsicle sticks ready to deploy. However, the electronics are a bit more iffy. Therefore I want to make sure I can get the potentiometer-stepper motor control system working before starting on the mechanical bits.

Let's start with one stepper, controlled by one potentiometer. I found a **[tutorial](https://circuitdigest.com/microcontroller-projects/stepper-motor-control-with-potentiometer-arduino)** online for achieving this, and it used an interesting method of continuously checking for changes in the resistance of the potentiometer and applying a step in the same direction as the change. Immediately, I saw a problem with this setup. Because the speed of the stepper is fixed, it cannot vary to match the speed at which the potentiometer turns. Theoretically, if the sampling rate was infinite, this would not be a problem. But with a limited sampling rate I could see errors compounding over time, making precise control impossible.

Nonetheless, I figured it couldn't hurt to try:

![Initial code.](images/avatarm/code-1.png)
![First try.](images/avatarm/first-try.gif)
![Serial plotter.](images/avatarm/code-1-SM.gif)

As you can see, my hypothesis about the speed was correct. The speed at which the stepper moved did change with the speed of the potentiometer. In addition, I noticed via the serial plotter that the potentiometer that even when held still, there were tiny fluctuations in resistance which caused the motor to vibrate in place. And finally, for some reason the maximum resistance would only go up to 500 and turning the potentiometer past that point would not do anything to the motor. A lot of problems for sure, but let's tackle them one by one.

The most important issue is the speed control. Currently, the speed of the motor is fixed at 200. Apparently that is the maximum speed for the motor I'm using. In addition, the number of steps per sample is fixed at 5 steps in either direction, depending on the sign of the change in resistance. So every time we sample, we need the change in resistance to be positively correlated with either the step size or the motor speed. The step size is easier to change, so let's do that.

First, to get an idea of how the change in resistance is affected by the speed at which I rotate the potentiometer, I defined a new variable `delta_pot`. I also renamed the variables to more sensible names, changed them to floats, and remapped the potentiometer reading from 0 to 1024 (instead of 500) for maximum resolution. I then plotted `delta_pot` as I rotated the potentiometer at various speeds and directions. As expected, I got different `delta_pot` values for different speeds. This suggests that `delta_pot` could be used to control `stepsize`.

![Code 2 SM.](images/avatarm/code-2-SM.png)
![Code 2.](images/avatarm/code-2.png)

I realized the sign of `delta_pot` indicates the direction of motion, so there was no need for an if statement in the code. In fact, the structure could be greatly simplified to the following:

```python
#include <Stepper.h> // Include the header file

// change this to the number of steps on your motor
#define STEPS 32

// create an instance of the stepper class using the steps and pins
Stepper stepper(STEPS, 8, 10, 9, 11);

float pot_old = 0;
float pot_new = 0;
int stepsize = 1;
float delta_pot = 0;

void setup() {
  Serial.begin(9600);
  stepper.setSpeed(500);
}

void loop() {

pot_new = analogRead(A0);
delta_pot = pot_new - pot_old;

stepper.step(int(stepsize*delta_pot));
pot_old = pot_new;

Serial.println(delta_pot); //for debugging
}
```

![Try 2.](images/avatarm/try-2.gif)

Indeed, this simple script worked much better than what I had before. In hindsight this should have been rather obvious from the start haha. However, now I came across the second challenge: the noise in the potentiometer reading was causing the motor to vibrate in place. Though I tried filtering `delta_pot` to values above a certain magnitude, I ultimately could not eliminate the vibrations. It was around this time that I also started considering the GPIO capacity of the Metro M0 Express: with only 14 digital pins, I could control a maximum of 3 steppers since the drivers I was using required 4 pins each. This was problematic as I hoped to achieve at least 4 degrees of freedom in my Avatarm. Moreover, I found that the steppers tend to get worryingly hot after a while, whether moving or not.

At this point servos seemed like a more and more attractive option. They only needed one control pin each, and some preliminary testing verified that the "vibrating-in-place" symptom plaguing my steppers was nearly absent in my SG90 servos. My preconceptions about the torque of servos compared to steppers were shattered when I found that servos can have even larger torque than steppers, especially larger metal-geared servos such as the MG996r. This is probably why the vast majority of hobby robot arms use servos...sigh. Well, at least I learned something, and I'll find another use for my 28-BYJ48 steppers soon enough.

It was fairly trivial to implement the same functionality as above using servos, especially with **[abundant online tutorials](https://www.arduino.cc/en/tutorial/knob)**:

```python
#include <Servo.h>

Servo myservo;  // create servo object to control a servo

int potpin = A0;  // analog pin used to connect the potentiometer
int val;    // variable to read the value from the analog pin

void setup() {
  myservo.attach(9);  // attaches the servo on pin 9 to the servo object
}

void loop() {
  val = analogRead(potpin);            // reads the value of the potentiometer (value between 0 and 1023)
  val = map(val, 0, 1023, 0, 180);     // scale it to use it with the servo (value between 0 and 180)
  myservo.write(val);                  // sets the servo position according to the scaled value
  delay(15);                           // waits for the servo to get there
```

![Try 3.](images/avatarm/try-3.gif)



The next step is to achieve this wirelessly, over a WiFi server if possible or at least 2.4 GHz radio. I found **[here](https://www.homemade-circuits.com/wireless-servo-motor-control-using/)** a nice tutorial on how to achieve the latter with Arduino Unos and some NRF24L01 modules, but I didn't have either component handy and I really wanted the ability to be able to control the Avatarm from anywhere in the world with WiFi. Since I had 2 WiFi-enabled ESP32 boards, the Huzzah and the ESP32-CAM, I figured they would be able to make this happen. (It is worth noting that ESP-NOW, a non-WiFi communications protocol for ESP32s, already has an impressive range of 480 meters, so in case the WiFi server did not work out this would be my backup plan.)

Various helpful links:
* https://www.youtube.com/watch?v=uEd2B7fS8Eg
* https://www.youtube.com/watch?v=zxBC1ivOVfM
* https://www.youtube.com/watch?v=GC0gRdBpylw
* https://www.instructables.com/Wireless-Servo-Control/
* https://dronebotworkshop.com/esp32-servo/
