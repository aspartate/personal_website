---
title: "Final Project"
date: 2021-04-09T02:40:45-05:00
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

As a result, I ultimately decided to go with the ESP-NOW protocol for direct board-to-board radio communication without WiFi. This was preliminarily demonstrated in **[Week 8](https://aspartate.github.io/personal_website/blog/week-8-espnow/)**


Various helpful links:
* https://www.youtube.com/watch?v=uEd2B7fS8Eg
* https://www.youtube.com/watch?v=zxBC1ivOVfM
* https://www.youtube.com/watch?v=GC0gRdBpylw
* https://www.instructables.com/Wireless-Servo-Control/
* https://dronebotworkshop.com/esp32-servo/


