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
