---
title: "Week 3 - Kinetic Sculpture"
date: 2021-02-11T16:14:41-05:00
draft: false
---

For this project my task was to make a kinetic sculpture using principles of mechanical design. I've always been fascinated by the concept of time, and wanted to make something that, like Christopher Nolan movies, could provoke reevaluation of our relationship with time. I also really like clocks (especially old mechanical clocks). So, the natural choice for me was to do something with pendulums.

In particular, I wanted to try to make a perpetually swinging pendulum, oscillating at a much slower speed than constrained by gravity. This would be achieved by a pair of magnets: one in the pendulum bob and one hidden in the base. To enhance the "mystery" aspect of the motion, I wanted to expose as little of the mechanism as possible. Below are several versions of my idea:

![Kinetic sculpture concept.](images/week3-sculpture/sculpture-concept.png)

### 1. An early roadblock.

I really liked the rightmost design, but the motion of the base magnet proved to be a real challenge. In particular, the magnet needed to oscillate in an arc, with all linkages located on the convex side of the arc. This would have been far easier to implement with linkages on the concave side, as in the coulisse mechanism below:

{{< youtube id="dPEBbcDiWNs" >}}
&NewLine;

However, the hollow center of the design meant that this mechanism was not possible. Therefore, I spent a good amount of time designing a curved rack & pinion mechanism, but in order for this to work the direction of travel needed to reverse at each end of the travel path. Though this would have been easy to implement using an Arduino, I wanted this sculpture to be microcontroller-free and, in the spirit of kinetic art, allow for the motor to be easily replaced by a spring or falling weight if need be.

My first thought was to make a reciprocating rack-and-pinion mechanism, which allows for back-and-forth motion from constant rotary motion. However, in this mechanism the range of motion is limited by the diameter of the pinion, making it unsuitable for my purposes. 

{{< youtube id="zae2ZePQTwQ" >}}
&NewLine;

A polarity-reversing switch at the center of the base could be activated as the rack moved to each extreme, causing the motor to switch direction and move the rack in the other direction. Searching online, I found that DPDT (double-pole-double-throw) toggle switches seemed to fit the bill, but I needed a bistable one (ON-ON) without the center OFF position. This was not easily obtained online. Therefore, I fell down a rabbit hole of sorts trying to design my own 3D-printable DPDT switch.

![DPDT concept.](images/week3-sculpture/dpdt-concept.png)

I did in fact come up with a reasonable-looking design, but at this point I realized that I only had several days to make this happen and I estimated just perfecting the switch would take up a good chunk of that time. In the end, a calculated decision was made to abandon this design in favor of a simpler coulisse mechanism. This mechanism necessitated using the first design in the concept sketch above.

### 2. Taking shape.

An advantage of the coulisse mechanism is that it is fairly simple and looks to be fool-proof. Also, due to the nature of the crank mechanism, the motion of the arm approximates the motion of a swinging pendulum. Namely, the velocity of the arm is greater when passing through the central plane than at each extreme. One slight drawback is that one direction of the arm motion is necessarily faster than the other, as the distance from the crank pin to the arm pivot varies. However, I hoped that this would not be very obvious at the slow speed I planned to operate this sculpture.

The next step was to CAD. I am fortunate to have a 3D printer at home, so I could print most of my parts. I decided to go with TinkerCAD because even though I would like to practice my Fusion skills, I am much faster operating in TinkerCAD. I started with a low-fidelity prototype and gradually added complexity. Here is what I came up with:

![Outer view.](images/week3-sculpture/cad-outer-view.png)

The mechanism:

![Mechanism.](images/week3-sculpture/cad-mechanism.png)

The N20 motor from the kit drives the worm gear, which turns the main coulisse gear. The coulisse gear drives the arm, and a rod extends from the arm on which a small neodymium magnet is glued. As this rod oscillates, the magnet traces the path of an arc and the pendulum bob (with its own magnet inside) follows. For all the rods in the design I wanted to use wooden dowels, since I had them on hand and rods are notoriously hard to 3D print. There are a total of 7 printed pieces.

### 3. Testing.

I first printed out the coulisse gear and worm gear to test the fit. It was pretty good. The worm gear hole for the motor shaft was a bit small, but I widened it out with a screwdriver.

![Gear fit.](images/week3-sculpture/gear-fit.jpg)

Next, I printed out the rest of the parts and put it all together. The outer shell and motor mount required hot glue. The wooden dowels (which I cut to size using a hand saw) required some coaxing to go into the friction-fit holes, but the clearance was just right on the moving parts. Next, I glued on two 3mm x 6mm neodymium magnets: one on the oscillating rod, and one inside the pendulum bob. Finally, I tied the pendulum bob to the top rod using some thread.

![Finished.](images/week3-sculpture/finished.jpg)

### 3. Circuitry.

For some control over the speed of the pendulum, I made a simple circuit with a potentiometer in series with the motor. The middle pin goes to ground, and one of the side pins is connected to the positive supply. This is a 10K ohm potentiometer, which was a bit too much to allow for a large range of adjustability. A potentiometer with smaller resistance would be ideal here.

![Circuit.](images/week3-sculpture/circuit.jpg)

### 4. Finished!

It works! I mounted it to the wall with a bit of poster tack.

![Front view.](images/week3-sculpture/front-view.gif)

![Side view.](images/week3-sculpture/side-view.gif)

Also works upside down. Kind of looks like a balloon.

![Upside down.](images/week3-sculpture/upside-down-gif.gif)

Here is a view of the mechanism:

![Mechanism.](images/week3-sculpture/mechanism-gif.gif)

Here it is on slow mode, adjusted using the potentiometer:

![Slow mode.](images/week3-sculpture/slowmode-gif.gif)

Overall, I am pleased with how this turned out. It is noisier than I would like, which is likely a consequence of slop in the gears as well as the rather imprecise nature of the wood-and-plastic mechanism. If I were to redesign this, I would make more (and smaller) gear teeth and replace the wooden dowels with brass rods. Lastly, though the motor by itself was pretty quiet, once mounted inside the shell the noise was amplified. I think a geared brushless motor might be best here.

### 5. Measurements & calculations

As part of this assignment we were also asked to measure the voltage using the Metro M0 Express analog-to-digital conversion (ADC) function. ADC on the M0 converts analog voltages to a digital 10-bit number (0 to 1023). This number is directly proportional to the voltage.

The first step is to load the `analogReadSerial` script into the Arduino IDE:

![Default script.](images/week3-sculpture/analogreadserial.png)

I edited this script to convert the 10-bit `sensorValue` to a voltage, using a reference voltage of 5V.

![Default script.](images/week3-sculpture/analogreadvoltage.png)

Then I uploaded the script to the M0, and rewired the circuit as shown below. This should give the voltage drop across the motor.

![Slow mode.](images/week3-sculpture/m0-circuit-gif.gif)

The reading on the serial monitor could be varied from 0.03 (stop) to 5V (full speed), although the voltage dropped very quickly from 5 V with minimal adjustments to the potentiometer. This is probably due to the rheostat wiring configuration of the potentiometer, which is not ideal for motor speed control. At around 2V and below, the motor would not run. Wiring it in the voltage divider configuration may yield better results.

Let's calculate the current through the circuit then the potentiometer is cranked to 50 ohms (as determined by multimeter). The voltage drop across the potentiometer is 1V. Using Ohm's Law, the current through the potentiometer is around 20 mA. The current through the motor should be the same as the current through the potentiometer, so the current through the motor in this setup is also **20 mA**. This is consistent with the amperage rating of the N20 motor. 

Interestingly, I noticed that the voltage drop across the potentiometer (as measured by multimeter) and the voltage drop across the motor (as measured by ADC) did not always add up to 5V. When the potentiometer was adjusted to a relatively low but still substantial resistance (0-50 ohms), the serial monitor would still read 5.00 V while the multimeter would read a nonzero voltage.
