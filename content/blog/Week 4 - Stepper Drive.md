---
title: "Week 4: Stepper Motor Drive"
date: 2021-02-23T12:05:34-05:00
draft: false
---

The night sky is truly fascinating to behold. I'm fortunate to live in a place with relatively little light pollution and there's plenty of stars visible on clear nights. So while stuck at home I've enjoyed stargazing. Lately I've been trying my hand at astrophotography, and I've gotten decent results by using my phone to take photos through an old pair of binoculars mounted on a tripod.

I'm especially interested in imaging deep sky objects (DSOs), such as nebulae and galaxies. To think that the light from these objects has taken millions of years to reach me boggles my mind. The challenge with DSOs is that they're very faint, so unless you're looking through a really wide telescope (sometimes called a "light bucket") you can't see much detail with your eyes. Cameras, on the other hand, can *accumulate* light: the longer a camera sensor is exposed to an object, the more light (and hence detail) you're able to collect. This can be achieved in two ways: increasing exposure time directly, or taking a bunch of photos of the same object and using special software to combine them. Astrophotography typically involves a combination of these strategies.

Either way, however, we need the object to say in the field of view of the camera. As the Earth rotates, the sky appears to move in the opposite direction. Over the course of an imaging session (can be anywhere from several minutes to several hours), the object we're imaging can move a significant amount. Although you can manually move the camera (or telescope, or binoculars) to follow the object, this is tedious and not feasible for long exposure shots. So amateur astronomers have come up with plenty of ways to automate this task.

The simplest star-tracking solution I've found is a barn door tracker. So-called because it looks like a hinged door, the barn door tracker slowly opens with the help of a motorized threaded rod. By carefully setting the speed and pointing the hinge at Polaris, anything mounted on the top face of the tracker will remain stationary with respect to the sky.

![A barn door tracker.](images/week4-stepper/barndoor.jpg)

Since our assignment this week was to create a program on a microcontroller, I decided to create the motor drive component of a barn door tracker. Although I considered using a simple DC motor, I opted for a stepper motor instead for more precise speed control and higher torque. I also wanted this tracker to be driven by a portable battery pack, so I needed a stepper motor that could run on 5V. I purchased the following stepper and driver board:

![5V stepper & driver.](images/week4-stepper/stepper.png)

These things are pretty cheap, about $2 for the motor+driver. They seem like a handy alternative to the larger NEMA17 steppers, so you might see more of these pop up in a future project! They are unipolar, so they have 5 wires (bipolar motors have 4). This video does a really nice job explaining the basics of steppers:

{{< youtube id="0qwrnUeSpYQ" >}}
&NewLine;

In terms of a minimal functionality all I needed was for the stepper motor to spin at a given speed. But since this is fairly trivial to implement, I decided to do something a bit fancier and add a pushbutton to control the stepper. In particular, I wanted the motor to start spinning when I push the button, stop spinning when I push it again, and cycle through this pattern. The difficult part of this job is sensing the *past state* of the pushbutton, instead of only the current state. Pushbuttons can change the state of a circuit by closing a connection, but typically the button needs to be held down to sustain the change. I wanted state changes to be effected by a temporary button push.

My initial attempt involved making variables for `motor_state` and for `button_state`. `motor_state` controls whether the motor is spinning (`motor_state = 1`) or stopped (`motor_state = -1`). `button_state` is the current state of the button. Since my button is in a pullup configuration, the default (unpressed) state is HIGH (`button_state = 1`). Therefore, I made `button_state` reverse the sign of `motor_state` whenever the microcontroller sensed that the button was pressed (`button_state = 0`).


I first modeled my circuit in TinkerCAD. For simplicity, I am first testing the button functionality on an LED instead of a stepper motor. Therefore `motor_state` below actually refers to the state of the LED.

![LED Test 1.](images/week4-stepper/tinkertest-1.png)

```python
//Include the Arduino Stepper Library
#include <Stepper.h>
 
// Define Constants
const int buttonPin = 2; // number of pushbutton input pin

// Define Variables
int button_state = 0; // current state of button
int button_prev_state = 0; // previous state of button
int motor_state = -1; // state of motor

void setup()
{
  pinMode(buttonPin, INPUT_PULLUP);
  Serial.begin(9600);
}
 
void loop()
{
  motorState();
  motorRun();
  Serial.print(motor_state);
  Serial.println();
}

//========================================================

void motorState() {
  button_state = digitalRead(buttonPin);
  if (button_state == 0) {
    motor_state = -1*motor_state;
  } else {
    motor_state = motor_state;
  }
}

void motorRun() {
  if (motor_state == 1) {
    digitalWrite(13, HIGH);
  } else {
    digitalWrite(13, LOW);
  }
}
```

This actually kind of worked, as the LED sometimes cycled on and off when I pressed the button. However, this code was not reliable. Using `Serial.print()` to debug, I realized that `motor_state` was rapidly cycling between -1 and 1 whenever the button was pressed down, making it essentially a 50% chance that it would be in the desired state when the button was released.

![Nice try.](images/week4-stepper/nice-try.gif)

Upon further research, I discovered that temporary pushbutton transitions needed something called a *debounce*, which polls the button twice in rapid succession to determine state changes. After scouring web forums for an embarrassingly long time, I found a rather elegant implementation of detecting pushbutton transitions in one of the Arduino built-in examples (StateChangeDetection). From here, it was only a matter of adding the code for initializing and running the stepper motor.

```python
/*
  State change detection (edge detection)

  Often, you don't need to know the state of a digital input all the time, but
  you just need to know when the input changes from one state to another.
  For example, you want to know when a button goes from OFF to ON. This is called
  state change detection, or edge detection.

  This example shows how to detect when a button or button changes from off to on
  and on to off.

  The circuit:
  - pushbutton attached to pin 2 from +5V
  - 10 kilohm resistor attached to pin 2 from ground
  - LED attached from pin 13 to ground (or use the built-in LED on most
    Arduino boards)

  created  27 Sep 2005
  modified 30 Aug 2011
  by Tom Igoe

  This example code is in the public domain.

  http://www.arduino.cc/en/Tutorial/ButtonStateChange
*/

#include <Stepper.h>

// this constant won't change:
const int  buttonPin = 2;    // the pin that the pushbutton is attached to
const int ledPin = 13; // LED indicator
const float STEPS_PER_REV = 32; // Number of steps per internal motor revolution 
const float GEAR_RED = 64; //  Amount of Gear Reduction

// Variables will change:
int buttonPushCounter = 0;   // counter for the number of button presses
int buttonState = 0;         // current state of the button
int lastButtonState = 0;     // previous state of the button
Stepper steppermotor(STEPS_PER_REV, 8, 10, 9, 11); // Create Instance of Stepper Class
// Specify Pins used for motor coils (the pins used are 8,9,10,11 connected to ULN2003 Motor Driver In1, In2, In3, In4 
// Pins entered in sequence 1-3-2-4 for proper step sequencing

void setup() {
  // initialize the button pin as a input:
  pinMode(buttonPin, INPUT_PULLUP);
  // initialize the LED as an output:
  pinMode(ledPin, OUTPUT);
  // initialize serial communication:
  Serial.begin(9600);
}


void loop() {
  // read the pushbutton input pin:
  buttonState = digitalRead(buttonPin);

  // compare the buttonState to its previous state
  if (buttonState != lastButtonState) {
    // if the state has changed, increment the counter
    if (buttonState == HIGH) {
      // if the current state is HIGH then the button went from off to on:
      buttonPushCounter++;
      Serial.println("on");
      Serial.print("number of button pushes: ");
      Serial.println(buttonPushCounter);
    } else {
      // if the current state is LOW then the button went from on to off:
      Serial.println("off");
    }
    // Delay a little bit to avoid bouncing
    delay(50);
  }
  // save the current state as the last state, for next time through the loop
  lastButtonState = buttonState;


  // turns on the LED every four button pushes by checking the modulo of the
  // button push counter. the modulo function gives you the remainder of the
  // division of two numbers:
  if (buttonPushCounter % 2 == 0) {
    digitalWrite(ledPin, HIGH);
    motorRun();
  } else {
    digitalWrite(ledPin, LOW);
  }

}


// ==========================================

void motorRun() {
    steppermotor.setSpeed(600);
    steppermotor.step(1); 
}
```

I tested this code in TinkerCAD. Because the stepper motor I'm using and its driver don't exist as pre-made components in TinkerCAD Circuits, I used a stepper motor simulator circuit built from scratch by a user named JeanPaulPetillon. The four LEDs represent the poles of a stepper. I added in a pushbutton and LED, made sure the pins were correct, and it worked!

![Test 2.](images/week4-stepper/tinkertest-2.png)

The only thing left to do now is test this IRL!  I also tested varying the speed of the motor using `steppermotor.setSpeed()` and that works too.

![Finished.](images/week4-stepper/yay.gif)

Stay tuned for more updates on the star tracker!