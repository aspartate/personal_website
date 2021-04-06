---
title: "Week 10 - DIY Closed-Loop Stepper"
date: 2021-04-05T19:21:05-04:00
draft: false
---

One of the disadvantages of stepper motors is that they are typically open-loop, meaning that the microcontroller does not get feedback as to the position of the stepper. This is a problem because these motors have generally low torque and can easily skip steps, so errors can build up over many movements and result in undesired behavior. However, commercially available closed-loop steppers are fairly expensive (the cheapest ones I found were about $30). Since I had several 5V 28-BYJ48 steppers from a previous project, I wanted to see if they could be converted to closed-loop steppers by utilizing potentiometers for positional feedback. If successful, this would be a very cost-effective way of getting closed-loop steppers, with the limitation of having a range of motion only about 180 degrees (depending on the potentiometer). In addition, we learned how to use the DRV8835 bipolar stepper drivers with NEMA17 steppers in class, and I wanted to see if I could modify the unipolar 28-BYJ48 steppers so they could use the same driver. The advantage of using the DRV8834 drivers is that it can be controlled by only 2 GPIO pins: one for step rate and one for direction. Moreover, it is claimed that converting the 28-BYJ48 from unipolar to bipolar can triple the torque.

As it turns out, this was fairly simple. I followed this Youtube tutorial:

{{< youtube id="pOMRzBdshEY" >}}
&NewLine;

Basically, to convert the 28-BYJ48 from unipolar to bipolar you just need to open up the blue cover of the motor and cut a groove in the middle trace of the PCB. Then, the blue cover can be replaced and the red wire removed completely. The remaining 4 wires are defined in the following way (**[source](https://www.youtube.com/watch?v=qI2NulbQGOQ)**):

![28-BYJ48 bipolar mode wiring.](images/week10-stepper/bipolar-wiring.png)

The DRV8834 stepper drivers can be wired like so:

![DRV8834 wiring.](images/week10-stepper/DRV8834-wiring.png)

Importantly, the current-limiting trimpot on the DRV8834 needs to be adjusted because the 28-BYJ48 steppers run on very little current (100 mA). This can be done by following the instructions on the **[product documentation](https://www.pololu.com/product/2134)**. Afterwards, I wrote a quick script to make the stepper run at a constant speed but with direction controlled by the position of a potentiometer. Here, the motor turns clockwise when the potentiometer value is greater than 92 (on a 0 to 180 mapped scale) and counterclockwise when the potentiometer value is less than 88. The motor is stopped when the potentiometer value is equal to any value in the range [88, 92].

```python
const int pin_step = D1;
const int pin_dir = D2;
const int pin_encpot = A0;
int val_encpot = 0;

void setup() {
  Serial.begin(74800);
  pinMode(pin_step, OUTPUT);
  pinMode(pin_dir, OUTPUT);

}

void loop() {
  val_encpot = map(analogRead(pin_encpot), 0, 1024, 0, 180);
  Serial.println(val_encpot);

  if (val_encpot < 88) {
    digitalWrite(pin_dir, HIGH);
    motorRun();
  }

  if (val_encpot > 92) {
    digitalWrite(pin_dir, LOW);
    motorRun();
  }

}

void motorRun() {
  digitalWrite(pin_step, LOW);
  delay(1);
  digitalWrite(pin_step, HIGH);
  delay(1);
}

```
![Initial test.](images/week10-stepper/initial-test.gif)

Though the modified 28-BYJ48 did spin, it was rather slow. I timed one rotation of the motor at 16 seconds. I do expect this motor to be slower than the NEMA17, because it has a plastic gearbox which results in 2048 steps per rotation. However, less than 4 RPM is too slow. In addition, the torque seemed oddly weak, perhaps even weaker than the unmodified 28-BYJ48. My hypothesis is that this was because I might not be driving the motor in full-step mode, or I somehow set the current limit wrong. This is something that I plan to debug later.

The next step is to couple the rotation of the stepper to the rotation of the potentiometer. I did this in a somewhat hasty fashion using some of the plastic parts from the kit and hot glue. The goal of this setup is so that the potentiometer provides immediate position feedback to the stepper, and therefore the stepper should maintain the position of the potentiometer no matter how the former is rotated. As you can see, this worked surprisingly well:

![Test 2.](images/week10-stepper/maintain-position-2.gif)
![Test 3.](images/week10-stepper/maintain-position-1.gif)

Next, I added a second potentiometer to control the desired position of the one connected to the motor. This was achieved by reading the control potentiometer from pin A0 and mapping to a range of 0 to 180 degrees, then setting this value to the "goal value" for the encoding potentiometer (`encpot`). However, because the NodeMCU only has one ADC pin and I needed to read from two potentiometers at once, I had to multiplex pin A0 again as described in my **[Week 9 post](https://aspartate.github.io/personal_website/blog/week-9-cloud/)**:

```python
const int pin_step = D1;
const int pin_dir = D2;
const int pin_encpot = D3;
const int pin_conpot = D4;
const int pin_input_pot = A0;
int val_encpot = 0;
int val_conpot = 0;

void setup() {
  Serial.begin(74800);
  pinMode(pin_step, OUTPUT);
  pinMode(pin_dir, OUTPUT);
  
  pinMode(pin_encpot, OUTPUT);
  pinMode(pin_conpot, OUTPUT);
}

void loop() {
  digitalWrite(pin_encpot, HIGH);
  digitalWrite(pin_conpot, LOW);
  val_encpot = map(analogRead(pin_input_pot), 0, 1024, 0, 180);
  
  digitalWrite(pin_encpot, LOW);
  digitalWrite(pin_conpot, HIGH);
  val_conpot = map(analogRead(pin_input_pot), 0, 1024, 0, 180);

  Serial.print("Encoder: ");
  Serial.println(val_encpot);
  Serial.print("Comntroller: ");
  Serial.println(val_conpot);

  if (val_encpot < val_conpot-1) {
    digitalWrite(pin_dir, HIGH);
    motorRun();
  }

  if (val_encpot > val_conpot+1) {
    digitalWrite(pin_dir, LOW);
    motorRun();
  }

}

void motorRun() {
  digitalWrite(pin_step, LOW);
  delay(1);
  digitalWrite(pin_step, HIGH);
  delay(1);
}

```

![Finished closed-loop stepper.](images/week10-stepper/finished-1.gif)

![Finished closed-loop stepper.](images/week10-stepper/finished-2.gif)

![Finished closed-loop stepper wiring.](images/week10-stepper/wiring.jpg)