---
title: "Week 11 - USB Communication"
date: 2021-04-11T23:56:10-04:00
draft: false
---

This assignment this week was to get a microcontroller to communicate with a controller over USB. A popular way of visualizing sensor input from a microcontroller is p5, which is a Javascript-based software that can run in the browser. Because I was brand new to p5 at the time, I decided to start with a bare-bones tutorial:

{{< youtube id="feL_-clJQMs" >}}
&NewLine;

This tutorial involved controlling a shape drawn in the Chrome browser using a button connected to a microcontroller. First, I implemented the circuit and code on the NodeMCU. In the tutorial, a manual pullup resistor was used but since most boards (including the NodeMCU) have internal pullup resistors available on certain pins, I used `pinMode(pin, INPUT_PULLUP)` instead to simplify the wiring. One caveat is that the NodeMCU only has internal pullup resistors on pins GPIO 0-15, while pin 16 (D0) only has a pull-down resistor. Additionally, GPIO 0 (D3), GPIO 2 (D4), and GPIO 15 (D8)have various limitations so it's best to avoid them. Therefore I connected one leg of a pushbutton switch to D1 and the other leg to GND. The code is very simple:

```python
const int switchPin = 2;
int switchVal = 0;

void setup() {
  pinMode(switchPin, INPUT_PULLUP);
  Serial.begin(74800);
}

void loop() {
  switchVal = digitalRead(switchPin);
  Serial.println(switchVal);
  delay(10);
}
```

Checking the serial monitor, I confirmed that pressing the button indeed changes the serial output from 1 to 0. The next step was to install the program p5.serialcontrol from **[here](https://github.com/p5-serial/p5.serialcontrol/releases/tag/0.1.2)**, which establishes the connection between the browser and the serial monitor. The p5 code is available **[here](https://editor.p5js.org/shfitz/sketches/Aongj2UK)**, as a bundle of 3 sketch files: index.html, sketch.js, and style.css. The only one that needs editing for the tutorial to work is sketch.js, where line 14 needs to be edited so the correct serial (COM) port is opened.

```python
// serial communication between a microcontroller with a switch on pin 2
// arduino code can be found here : https://gist.github.com/shfitz/7fd206b7db4e0e6416a443d61c8c988e

let serial; // variable for the serial object
let latestData = "waiting for data"; // variable to hold the data

function setup() {
  createCanvas(windowWidth, windowHeight);
  // serial constructor
  serial = new p5.SerialPort();
  // get a list of all connected serial devices
  serial.list();
  // serial port to use - you'll need to change this
  serial.open('COM6');
  // callback for when the sketchs connects to the server
  serial.on('connected', serverConnected);
  // callback to print the list of serial devices
  serial.on('list', gotList);
  // what to do when we get serial data
  serial.on('data', gotData);
  // what to do when there's an error
  serial.on('error', gotError);
  // when to do when the serial port opens
  serial.on('open', gotOpen);
  // what to do when the port closes
  serial.on('close', gotClose);
}

function serverConnected() {
  print("Connected to Server");
}

// list the ports
function gotList(thelist) {
  print("List of Serial Ports:");

  for (let i = 0; i < thelist.length; i++) {
    print(i + " " + thelist[i]);
  }
}

function gotOpen() {
  print("Serial Port is Open");
}

function gotClose() {
  print("Serial Port is Closed");
  latestData = "Serial Port is Closed";
}

function gotError(theerror) {
  print(theerror);
}

// when data is received in the serial buffer

function gotData() {
  let currentString = serial.readLine(); // store the data in a variable
  trim(currentString); // get rid of whitespace
  if (!currentString) return; // if there's nothing in there, ignore it
  console.log(currentString); // print it out
  latestData = currentString; // save it to the global variable
}

function draw() {
  background(255, 255, 255);
  fill(0, 0, 0);
  text(latestData, 10, 10); // print the data to the sketch

  // in this example, we are reciving a 0 and a 1
  // if the button is not pressed we get a 0
  if (latestData == 0) {
    ellipse(width / 2, height / 2, 100, 100);
  } else { // if it is pressed, we get a 1
    rectMode(CENTER);
    rect(width / 2, height / 2, 100, 100);
  }
}
```

After getting all the code ready and opening the COM port in p5.serialcontrol, the sketch didn't work. I realized that this was because my NodeMCU communicates at 74800 baud, whereas p5.serialcontrol runs at 9600 baud. As far as I'm aware, neither of these are easily changed. The easiest solution was to reupload the code to another board at 9600 baud, and I used the Metro M0 Express with pin 2 as the input pin. This made the p5 sketch run successfully.

![Simple tutorial.](images/week11-usb/simpletutorial.gif)

Next, I wanted to try a different input sensor. I've always wanted to experiment with flex sensors, but they are pretty expensive. Thankfully, people have figured out how to make flex sensors with Velostat, which is a conductive carbon-infused plastic film that changes resistance when pressure is applied. Several tutorials exist for these DIY flex sensors, an example being **[this one](https://www.instructables.com/DIY-Bend-Sensor-Using-only-Velostat-and-Masking-T/)**. I adapted the instructions from the tutorial to make an even simpler version using duct tape, aluminum foil, and a single strip of Velostat.

First, cut a 1 cm-wide strip of Velostat. It can be any length, but mine was around 10 cm. Then cut 2 pieces of aluminum foil that are slightly shorter and thinner than the Velostat strip. Then cut 2 pieces of duct tape that are longer and wider than the Velostat strip. Exact dimensions don't matter. Finally, strip the ends of 2 wires. I used a Dupont wire so it can be easily plugged into a breadboard.

![Step 1.](images/week11-usb/step1.jpg)

Assemble the tape, foil, and wires like so:

![Step 2.](images/week11-usb/step2.jpg)

Place the Velostat over one of the tape assemblies, making sure to completely cover the foil strip. No part of the foil should be exposed.

![Step 3.](images/week11-usb/step3.jpg)

Finally, sandwich the two tape assemblies together and trim the edges with a pair of scissors (but don't trim all the way to the Velostat). Your flex sensor is complete! You can test it out by hooking it up to a multimeter in resistance mode and bending it around.

![Done.](images/week11-usb/done.jpg)

In order to get readings from a microcontroller, the flex sensor can't simply be hooked up with one end in an ADC pin and the other end in 3V. It needs to be in a voltage divider orientation, so we need 3 "legs" (like a potentiometer). Follow the below diagram, courtesy of **[Sparkfun](https://learn.sparkfun.com/tutorials/flex-sensor-hookup-guide/all)**. The yellow wire is the one that should be connected to the ADC pin on your microcontroller.

![Wiring.](images/week11-usb/flex-wiring.png)

Now, using a simple sketch like the one below, we can visualize the flex sensor readings in the serial plotter:

```python
const int inputPin = A0;
int value = 0;

void setup() {
  pinMode(inputPin, INPUT);
  Serial.begin(9600);
}

void loop() {
  value = analogRead(inputPin);

  Serial.println(value);

  delay(10);
}
```

![Flex sensor data.](images/week11-usb/flex-data.gif)

Now that our flex sensor works, we can adapt the p5 sketch.js to visualize the data in the browser:

```python
// serial communication between a microcontroller with a switch on pin 2
// arduino code can be found here : https://gist.github.com/shfitz/7fd206b7db4e0e6416a443d61c8c988e

let serial; // variable for the serial object
let latestData = "waiting for data"; // variable to hold the data

function setup() {
  createCanvas(windowWidth, windowHeight);
  // serial constructor
  serial = new p5.SerialPort();
  // get a list of all connected serial devices
  serial.list();
  // serial port to use - you'll need to change this
  serial.open('COM6');
  // callback for when the sketchs connects to the server
  serial.on('connected', serverConnected);
  // callback to print the list of serial devices
  serial.on('list', gotList);
  // what to do when we get serial data
  serial.on('data', gotData);
  // what to do when there's an error
  serial.on('error', gotError);
  // when to do when the serial port opens
  serial.on('open', gotOpen);
  // what to do when the port closes
  serial.on('close', gotClose);
}

function serverConnected() {
  print("Connected to Server");
}

// list the ports
function gotList(thelist) {
  print("List of Serial Ports:");

  for (let i = 0; i < thelist.length; i++) {
    print(i + " " + thelist[i]);
  }
}

function gotOpen() {
  print("Serial Port is Open");
}

function gotClose() {
  print("Serial Port is Closed");
  latestData = "Serial Port is Closed";
}

function gotError(theerror) {
  print(theerror);
}

// when data is received in the serial buffer

function gotData() {
  let currentString = serial.readLine(); // store the data in a variable
  trim(currentString); // get rid of whitespace
  if (!currentString) return; // if there's nothing in there, ignore it
  console.log(currentString); // print it out
  latestData = currentString; // save it to the global variable
}

function draw() {
  background(255, 255, 255);
  fill(0, 0, 0);
  text(latestData, 10, 10); // print the data to the sketch
  ellipse(width / 2, height / 2, latestData, latestData);
}
```

![Flex sensor in browser.](images/week11-usb/flex-p5.gif)