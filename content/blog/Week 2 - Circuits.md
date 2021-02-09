---
title: "Week 2 - Intro to Electronics"
date: 2021-02-09T12:05:15-05:00
draft: false
---

This is an introduction to working with electronic circuits. As a simple exercise, we will calculate the current across an LED in various configurations. The current can be calculated by using Ohm's Law:

![Ohm's Law.](https://latex.codecogs.com/gif.latex?I&space;=&space;\frac{\Delta&space;V}{R})

We will use both TinkerCAD circuit simulations and real-world measurements, and compare.

Power supply: 3.3 V pin on Metro M0/Arduino

### 1. No resistor.

First, we will determine the current through a single LED bulb with no resistor. The TinkerCAD diagram looks like this:

![No resistor - TinkerCAD.](images/week2-circuits/noresistor-tinkercad.png)

It seems like this is too much current, as the LED blows out. So we will not do a real-world experiment for this case.

### 2. Single 1k ohm resistor.

Let's add a resistor!

![1k resistor - TinkerCAD.](images/week2-circuits/1kresistor-tinkercad.png)

Here, we see that the voltage across the LED is 1.84V. We know that the resistance is 1000 ohms, so Ohm's Law gives a current of **0.00184 A, or 1.84 mA**.

Let's try this IRL:

![1k resistor - IRL.](images/week2-circuits/1kresistor.jpg)

The measured voltage is **2.63 V**, which is pretty different from the theoretical value of 1.84 V. I'm not sure what's wrong here...

### 2. Two 1k ohm resistors, in series.

Adding another 1k ohm resistor in series to the circuit gives the following:

![Two 1k resistors in series - TinkerCAD.](images/week2-circuits/seriesresistors-tinkercad.png)

The voltage drops by a little bit, to 1.81 V. The net resistance for resistors in series is the sum of the individual resistances, so we have R = 2000 ohms. Therefore Ohm's Law gives a current of **0.91 mA**.

Putting theory to practice:

![Two 1k resistors in series - IRL.](images/week2-circuits/seriesresistors.jpg)

The measured voltage is **2.60 V**. Again, very different from the theoretical value of 1.81 V, but it did decrease from the single resistor setup.

### 3. Two 1k ohm resistors, in parallel.

Adding another 1k ohm resistor in series to the circuit gives the following:

![Two 1k resistors in parallel - TinkerCAD.](images/week2-circuits/parallelresistors-tinkercad.png)

The voltage increases by a little bit, to 1.88 V. The net resistance for resistors in series is given by the following:

![Net resistance in parallel.](https://latex.codecogs.com/gif.latex?R&space;=&space;\frac{1}{1/R_1&space;&plus;&space;1/R_2}&space;=&space;\frac{1}{1/1000&space;&plus;&space;1/1000}&space;=&space;500&space;\text{&space;}&space;\Omega)

Therefore Ohm's Law gives a current of **3.76 mA**.

On the breadboard:

![Two 1k resistors in parallel - IRL.](images/week2-circuits/parallelresistors.jpg)

The measured voltage is **2.66 V**. This is slightly higher than the single resistor baseline, as expected, but does not match the theoretical value.

### Conclusions.

**Setup**              |**TinkerCAD**|  **IRL**
-----------------------|-------------|---------
=================|===========|========
**Single Resistor**    |   1.84 V    |   2.63 V
**Series Resistors**   |   1.81 V    |   2.60 V
**Parallel Resistors** |   1.88 V    |   2.66 V

&NewLine;

Compared to the baseline single resistor setup, the series resistors setup had a slightly decreased voltage and the parallel resistors setup had a slightly increased voltage in both the simulation and real-world measurements. This makes sense because placing resistors in series increases net resistance, while placing resistors in parallel decreases net resistance. Surprisingly, the voltage drop across the LED did not change much as the net resistance in the circuit varied. The current, however, did change dramatically. This should have translated to a difference in LED brightness, but I did not perceive an obvious difference in either the TinkerCAD or real-world setups.

Reasons for the voltage differences between TinkerCAD and real-world measurements could perhaps be attributed to...