---
title: "Week 6 - Playing with Potentiometers"
date: 2021-03-07T21:15:31-05:00
draft: false
---

For my final project (**[link to documentation](https://aspartate.github.io/personal_website/blog/avatar/)**), I am building a robot arm. Therefore this week I wanted to learn how to control motors using a potentiometer. This was the beginning of a rather convoluted journey, but I learned a lot along the way...

I wanted to start with one stepper, controlled by one potentiometer. I found a **[tutorial](https://circuitdigest.com/microcontroller-projects/stepper-motor-control-with-potentiometer-arduino)** online for achieving this, and it used an interesting method of continuously checking for changes in the resistance of the potentiometer and applying a step in the same direction as the change. Immediately, I saw a problem with this setup. Because the speed of the stepper is fixed, it cannot vary to match the speed at which the potentiometer turns. Theoretically, if the sampling rate was infinite, this would not be a problem. But with a limited sampling rate I could see errors compounding over time, making precise control impossible.

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

Indeed, this simple script worked much better than what I had before. In hindsight this should have been rather obvious from the start haha. However, now I came across the second challenge: the noise in the potentiometer reading was causing the motor to vibrate in place. Though I tried filtering `delta_pot` to values above a certain magnitude, I ultimately could not eliminate the vibrations.

It was around this time that I also started considering the GPIO capacity of the Metro M0 Express: with only 14 digital pins, I could control a maximum of 3 steppers since the drivers I was using required 4 pins each. This was problematic as I hoped to achieve at least 4 degrees of freedom in my Avatarm. Moreover, I found that the steppers tend to get worryingly hot after a while, whether moving or not.

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