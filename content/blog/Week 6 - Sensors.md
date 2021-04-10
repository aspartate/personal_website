---
title: "Week 6 - Capacitive Sensing"
date: 2021-03-07T21:15:31-05:00
draft: false
---

The goal of this week was to learn how to use sensors in Arduino, with a focus on capacitive sensors. I wanted to do something related to my final project, so I decided to follow a tutorial on making a 3D capacitive motion tracker. I thought that this may have potential applications in hand tracking for the purposes of controlling a robot arm via inverse kinematics.

This is a rather popular project, with tutorials by Make: Magazine as well as others. **[This instructable](https://www.instructables.com/DIY-3D-Controller/)** also gives a nice explanation of the concept. The hardware components are simple, and though the code looked complicated I thought I would try my best to understand it. The stock code comes with a Processing widget (first time I've heard of this programming language) that shows the position of your hand in real time. Eventually, I wanted to modify the code to extract coordinates of the hand.

{{< youtube id="ikD_3Vemkf0" >}}
&NewLine;

### 1. Hardware.

The bulk of the hardware is three cardboard squares partially covered by foil. These were simple enough to make:

![Squares.](images/week6-sensors/squares.jpg)

As you can see, I started off taping the edges of the foil with electrical tape but realized it was easier to just stick the foil to the cardboard by double-sided tape on the corners.

![Frame.](images/week6-sensors/frame.jpg)

I cut an opening at the junction of the three faces to allow the wires to pass through. Theoretically, I should be using shielded wires but I thought regular Dupont wires were enough for a proof of concept.

![Hole.](images/week6-sensors/hole.jpg)

Here is the wiring. Those are 1M ohm resistors coming from the power rail, and 10K ohm resistors in between the wires. The wires go into pins 8, 9, and 10.


### 2. Software.

There are two pieces of code needed to make this work: the Arduino script and the Processing script. Both can be downloaded from this rather old GitHub repo **[here](https://github.com/Make-Magazine/3DInterface)**. We also need to download and install the Processing IDE **[here](https://processing.org/)**.

Here is where I ran into trouble. Upon trying to verify the Arduino script, I ran into an error: *lvalue required as left operand of assignment*.

![Arduino error 1.](images/week6-sensors/arduino_error_1.png)

It seemed like PORTB was an undefined variable, which confused me. Confident that the writer of this code could not have overlooked something so simple, I thought there must be another explanation. Some Googling told me that this was an example of controlling Arduino pins using port registers, which is apparently **[60 times (!) faster than using `digitalWrite`](https://electronoobs.com/eng_arduino_tut130.php)**. This made sense because we want the sampling rate to be really high to achieve near-real time detection. It appeared the port register control needed to use syntax like `PORTB = B00000000` instead of `PORTB = 0`. I presumed the 8 zeros represent a byte. So I changed that in the script, and...it was fixed!

But lo and behold there was another error.

![Arduino error 2.](images/week6-sensors/arduino_error_2.png)

Now it seems like `PINB` is not a declared variable. As far as I knew, `PINB` had something to do with the register control and did not have to be defined. Perhaps somehow the Arduino was not recognizing that `PINB` referred to a pin? At this point it was in the wee hours of the morning and I had a 75 minute presentation due for class the next day, so I decided to come back to it later.