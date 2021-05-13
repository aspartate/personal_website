---
title: "Final Project"
date: 2021-04-26T02:40:45-05:00
draft: false
---

{{< rawhtml >}}
<iframe width="700" height="385" src="https://www.youtube-nocookie.com/embed/fKCS6ebLzv4?rel=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
<br>
<br>
{{< /rawhtml >}}


### 1. The idea.

The year was 2010. In a dazzling display of human ingenuity, the world was introduced to a $2 million grape-peeling machine.

{{< rawhtml >}}
<iframe width="700" height="385" src="https://www.youtube-nocookie.com/embed/KNHgeykDXFw?rel=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
<br>
<br>
{{< /rawhtml >}}

Though this came out more than a decade ago, I am fascinated by the concept of a remotely-controlled "avatar". Particularly in the field of healthcare, I think such robots will transform telemedicine and help bring much-needed treatment capabilities to regions with few trained physicians.

I want to build a robot arm avatar (the "Avatarm") which will allow me to perform surgery on a grape from another room. The system shall be comprised of three components:

* The control arm, with position encoded by potentiometers
* The Avatarm, driven by motors
* A camera feed transmitting live video from the perspective of the Avatarm

### 2. Proof of Concept.

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

As a result, I ultimately decided to go with the ESP-NOW protocol for direct board-to-board radio communication without WiFi. This was preliminarily demonstrated in **[Week 8](https://aspartate.github.io/personal_website/blog/week-8-espnow/)**. Although I was ultimately able to successfully achieve wireless servo control over ESP-NOW between the ESP32-CAM and Huzzah32, this required several rounds of debugging and a rather fussy workaround due to inherent limitations of the ESP32-CAM. Therefore I replicated this functionality on the NodeMCUs (using a tutorial from **[RandomNerd](https://RandomNerdTutorials.com/esp-now-esp8266-nodemcu-arduino-ide/)**), for a total of 4 servos all multiplexed to the single A0 ADC pin.

Here is the code on the transmitter side, and the wiring:

**[Click to view code](files/avatarm/transmitter_code.txt)**

![Transmitter wiring.](images/avatarm/transmitter-1.jpg)
![Transmitter wiring.](images/avatarm/transmitter-2.jpg)


Here is the code on the receiver side, and the wiring:

**[Click to view code](files/avatarm/receiver_code.txt)**

![Receiver wiring.](images/avatarm/receiver-1.jpg)
![Receiver wiring.](images/avatarm/receiver-2.jpg)

Now I have a functioning robot arm, with no lag! (Although it isn't very exciting...)

![A boring robot arm.](images/avatarm/ESPNOW-demo.gif)

Time to make this look spiffy!

### 3. CAD.

Now that I had the control system down, it was time to turn this into a proper robot arm. I've always really liked the aesthetic of KUKA robotics, and I found **[a 1:10 scale model of the KUKA KR150 on Thingiverse](https://www.thingiverse.com/thing:1629341)**, by user BlacklightShaman. This model was incredibly detailed, and I wanted to make it actually function. This would involve modifying the parts to actually fit servos and the microcontroller.

![.](images/avatarm/thingiverse.png)

I first scaled imported the major components of the arm to TinkerCAD and scaled them up to 150%. There were 4 major parts: the base, part A, part B, and part C (where A, B, C, are the movable parts of the arm from bottom to top). I decided on 150% scale after making measurements of the MG996R servo and finding a size at which a servo could comfortably fit at each joint. To help visualize the position of the servos at each joint, I downloaded a model of the MG996R servo from GrabCAD **[here](https://grabcad.com/library/servo-mg996r-3)**. Though the dimensions of the model did not match my servos exactly, it was still a big help in the design process.

![.](images/avatarm/tinkercad-import.png)

To mount the servo at each joint, I needed to make an indentation for the gearbox on one side and an indentation for the circular servo horn on the other side. I knew that these mounts had to be perfectly sized in order for my joints to work, so I printed a few dummy test pieces to test the fit. By the third iteration of the test pieces, I had a functional mount for both the servo body and the horn.

![.](images/avatarm/test-pieces-mg996r.jpg)

Now it was just a matter of installing the mount into each of the parts of the arm. I had to align the servo axle with the axis of rotation at each joint. To find the center of each joint, I made a transparent cylinder and did my best to line it up with existing circular features on the joint. I could then center-align other objects to this cylinder, meaning that they would be also aligned to the axis of rotation.

![.](images/avatarm/alignment.png)

Part A had a cavity on one side in which a faux stepper motor was meant to be printed and glued on. The geometry of this cavity made it difficult to work with, so I got rid of it in Meshmixer by deleting the polygons around the rim and healing using the Inspector tool.

![.](images/avatarm/fill-hole.png)
![.](images/avatarm/hole-filled.png)

Part C also had some irregular features which I similarly flattened in Meshmixer.

![.](images/avatarm/C-original.png)
![.](images/avatarm/C-flattened.png)

I made mounts for a total of 3 MG996R servos between the base, A, B, and C. This constituted a 3-axis arm, with a 2-axis shoulder (altitude and azimuth) and a 1-axis elbow. However, I wanted at a fourth axis (for wrist rotation), and potentially a fifth (to control a gripper). I chose to use SG90 servos for these because I was concerned that the MG996R servos may exert too much torque on the shoulder altitude joint. I decided to add only the wrist joint for now, with a gripper to be potentially added later. This meant I had to design and test a new mount for the SG90. Thanks to careful measurements with a caliper, I got a perfect fit on the first try!

![.](images/avatarm/test-piece-sg90.jpg)

Several more modifications to the base were needed. It was a rather large piece with lots of difficult overhangs, so I made it easier to print by trimming off each of the "feet" to be printed separately as well as the decorative features on the rear control box. I also wanted to make the control box serve its purpose by containing the NodeMCU as well as the tangle of wires that would inevitably emanate from it. I designed and tested a mount for the NodeMCU and hollowed out the control box until I had a decent-looking cavity for all the electronics. A **[NodeMCU model from GrabCAD](https://grabcad.com/library/nodemcu-esp8266-esp-12e-1)**, by user leirbag4, helped me plan out the dimensions:

![.](images/avatarm/control-box-mods.png)
![.](images/avatarm/test-piece-nodemcu.jpg)

Now, it was on to printing and assembly! I printed the base using black PLA and installed the motor and NodeMCU.

![.](images/avatarm/base-back.jpg)
![.](images/avatarm/base-front.jpg)
![.](images/avatarm/base-bottom.jpg)

Part A followed. I painted the KUKA logo black using a toothpick and some nail polish. Looking good!

![.](images/avatarm/A-unfinished-back.jpg)
![.](images/avatarm/A-unfinished-front.jpg)
![.](images/avatarm/A-finished-front.jpg)
![.](images/avatarm/A-and-base.jpg)

Next was Part B.

![.](images/avatarm/B-unfinished-back.jpg)
![.](images/avatarm/B-unfinished-front.jpg)
![.](images/avatarm/A-B-base-1.jpg)
![.](images/avatarm/A-B-base-2.jpg)
![.](images/avatarm/A-B-base-3.jpg)

All the cable management rings along Parts A and B definitely came in handy, even though they required lots of support to print. At this point I got excited by how it was starting to look like a proper robot arm and I wanted to see it move. This meant lots of wiring! The wiring diagram for the servos looks like this:

![.](images/avatarm/servo-wiring.png)

Since I could no longer use a breadboard with power and ground rails, I needed a way to split the single power and ground pins into 4 or 5 branches, one for each servo. I spliced together some male jumper cables with a female jumper cable to make 5-way splitters.

![.](images/avatarm/pin-splitter.jpg)

From then on it was relatively simple to connect the servos to the NodeMCU. Since this NodeMCU was the same one I used for the popsicle-stick prototype, it already had the code to receive signals from the transmitter module. Now that I had a proper robot arm, I figured I would have some fun with markers. Robot art, anyone?

![Art.](images/avatarm/art.gif)

As you can see, aside from missing the upper limb, the arm is not very intuitive to control using the potentiometers. But no worries, I'll build the controller arm next. For now, I'll print and add on Part C:

![.](images/avatarm/C-raw.jpg)

Part C had a rough time with supports, with me having enlist the help of tape and poster tack to keep a tower of support material from toppling over. Nonetheless, the print came out fine and I installed it with no issues. At this point the servos were still holding up impressively well under the weight of the arm even when fully extended, but just to be safe I installed an extension spring at the shoulder joint to reduce stress on the adjacent servo. For years I've been saving random bits of hardware such as screws and springs from things I've taken apart over the years, thinking that I'd find a use for them someday. Well, that day has come!

![.](images/avatarm/ABC-1.jpg)
![.](images/avatarm/ABC-2.jpg)


[//]: # "As of today (4/27), I am approximately 2 weeks away from the final presentation. I plan to leave a week for making the promo video and polishing up my documentation, so I need to finish building by May 7th. I plan to finish the output arm by the end of this Friday, and work on the input arm (which will be simpler and incorporate the potentiometers) through the weekend. This would conclude the minimal viable product, which is a robot arm that can be remotely controlled via a teaching arm. Depending on how well I meet this timeline, there are 2 potential upgrades I plan to make to this project. One is to figure out a way to record the position of the arm over a duration of time and replay them, so the arm can be 'taught'. Another is to use gyroscope/accelerometer sensors (such as the MPU6050) to detect the orientation of various joints of my own arm and use that information to control the orientation of the Avatarm."

Although the Avatarm is nearing completion, it's still missing the wrist joint. On the real KUKA KR150, the wrist joint actually has two axes of rotation:

![.](images/avatarm/wrist-model.png)

I could control one axis with the SG90 that is currently attached to Part C, but I would need another motor for the second axis and then one more for an actual gripper. I didn't want to deal with that many additional motors just yet, so for now I decided to stick with making the proximal end of the wrist joint. User yddf24 on Thingiverse kindly posted an easier-to-print version of the wrist joint **[here](https://www.thingiverse.com/thing:2492934/files)**. I wanted the wrist to be modular to allow me to easily add attachments later, so I further split the joint into threaded pieces as well as modified the base of the joint to accept the SG90 servo horn.

![.](images/avatarm/wrist-tinkercad.png)

For now, I just printed and installed the base of the joint:

![.](images/avatarm/wrist-base.jpg)

Now that the Avatarm was essentially complete, I needed a better way to control it!

### 4. The Control Arm.

The basic idea was that the position of each joint of the arm would be encoded by a potentiometer. The easiest way to do this would be to use a potentiometer as the axis of rotation of each joint. I needed the relative proportions of the controller arm to roughly approximate the dimensions of the Avatarm, to achieve more natural control. I originally though about redesigning the same pieces as for the Avatarm but to fit potentiometers instead of servos, but was reluctant to print such large pieces again (the arm used a total of about 350 grams of filament, over 30 hours of print time total). I also realized that the joints would not be very structurally sound with these rather small potentiometers supporting the entire weight of the arm. The other option I considered was to make a simplified, abstract version of the arm with "popsicle-stick" representations of each joint, but I didn't like the aesthetics of that. Eventually, I decided to make a second, scaled-down version of the Avatarm, with potentiometers instead of servos at each joint. This arm is half the size of the Avatarm (i.e. 75% the size of the original model from Thingiverse). I downloaded model of a **[10K potentiometer from GrabCAD](https://grabcad.com/library/10k-rotary-potentiometer-1)** (by user Pierre Gleizes) to aid in designing the joints.

![.](images/avatarm/control-arm-tinkercad.png)

I needed the joints to be friction-fit onto the potentiometer knob, so I designed and printed a few test pieces again:

![.](images/avatarm/potest.jpg)

For the wrist axis, the standard 10K potentiometer was too big and heavy. I managed to find a smaller plastic potentiometer and designed a slot for it at the wrist joint:

![.](images/avatarm/smallpot.png)

After printing the pieces and painting the lettering with a toothpick, it was time to wire it up. Here is the wiring diagram:

![.](images/avatarm/pot-wiring.png)

Again, I needed two splitters. One would split the ground pin to connect all the potentiometers, and the other would split the A0 ADC pin. The ground pin needed just a simple splitter which I made the same way as before. The A0 splitter, however, needed diodes to prevent current from one potentiometer traveling back up another. I made this odd-looking diode pyramid and spliced wires to it:

![.](images/avatarm/diode-pyramid.jpg)
![.](images/avatarm/diode-splitter.jpg)

I assembled the controller arm and transferred the wiring over from the breadboard with some Dupont cables, and made this monstrosity:

![.](images/avatarm/rats-nest.jpg)

I tested the controller, and it worked! However, the wires were really getting in the way and also falling off of their connections. The second problem was that the NodeMCU was just flopping around with nowhere to mount it. Since the base of this arm was not much bigger than the NodeMCU itself, I couldn't mount it at the location of the control box and so I had decided to remove the control box entirely. I reshaped that region to accomodate a modular platform for the NodeMCU, which looks like this:

![.](images/avatarm/controller-nodemcu-mount.png)

To solve the wiring problem, I realized that part of the issue was due to the Dupont cables being rather thick and unwieldy. I had some broken earbuds laying around, from which I was able to extract extremely thin wires. I replaced each of the Dupont cables with a headphone wire, and twisted them to make nice and tidy bundles. To connect the wires to the potentiometers, I made a twist connection at each leg and covered with heat-shrink tubing. I didn't solder anything because I wanted to just try things out for now.

![.](images/avatarm/elbow-pot.jpg)
![.](images/avatarm/wrist-pot.jpg)
![.](images/avatarm/pot-wiring-progress1.jpg)
![.](images/avatarm/pot-wiring-progress2.jpg)

Now it looks much better! I made some more robot art to commemorate the occasion.

![.](images/avatarm/art2.gif)

However, there were still a couple of issues. One was that although the wiring was much more organized than before, I was still not satisfied with how tangled things were in the back. Additionally, my splices on the controller arm sometimes lost connection, causing the potentiometer to report incorrect values and thus unpredictable motion in the Avatarm. All these connections really should be on a PCB, but I didn't have time to learn PCB design. So instead I decided to transfer the connections to perfboard.

I had never worked with perfboard before but it seemed straightforward enough. Perfboard is essentially a grid of solderable points which can be connected to components and to each other. First, I sketched some designs based on the wiring diagrams above, with two modifications. Firstly, on each perfboard I placed pins for 6 potentiometers/servos even though I only have four now. These extra pins will allow me to easily add more servos later with only firmware changes needed. In addition, I added two buttons on the controller board which are mapped to pins D7 and D8 to allow for added functionality later.

![.](images/avatarm/cb-diagrams.png)

The design was complicated by overlapping wires as well as the need to make several connections through the board itself. After some rather hacky soldering, I had two functional circuit boards! The controller board is missing a diode (I ran out) but it's okay for the time being since we aren't using that pin anyways.

![.](images/avatarm/cb-front.jpg)
![.](images/avatarm/cb-back.jpg)

Before & after:

![.](images/avatarm/tangled.jpg)
![.](images/avatarm/cb-mounted.jpg)

In the process of re-mounting the cables, the potentiometer-servo mapping changed (i.e., Potentiometer 1 no longer controlled Servo 1, etc.). Fortunately, this was a quick firmware fix. All I needed to do was shuffle some variables around.

**[Controller code](files/avatarm/controller_code.txt)**

**[Avatarm code](files/avatarm/avatarm_code.txt)**

### 5. End Effector

At this point, I had a functional robot arm that moved decently smoothly in four axes. However, the robot is still missing an end effector, and is not making much use of the wrist joint right now. First, I finished modifying and printing the other parts of the wrist joint:

![.](images/avatarm/wrist-complete.jpg)

The supinator-pronator joint is driven by the SG90 at the wrist, while the flexor-extensor joint is just held in place by a bolt. I embedded a hex nut at the end of the wrist, onto which various attachments can be screwed. In the picture above I've attached a simple decorative plate.  A way of mounting things (pens, scalpels, etc.) that doesn't involve duct tape is sorely needed. I modified user Dalek's **[pen mount for the Ender 3](https://www.thingiverse.com/thing:4100602)** to attach to the wrist and hold both writing and surgical implements (this is a surgery robot, after all).

![.](images/avatarm/holder-assembly.jpg)
![.](images/avatarm/holder-pen.jpg)
![.](images/avatarm/holder-scalpel.jpg)

I scaled down the wrist joint to fit the wrist potentiometer on the controller arm:

![.](images/avatarm/controller-wrist.jpg)

### 6. Firmware Calibration

Finally, I went back to the firmware to make some changes. One was to increase the precision of the servo joints. The precision of each joint is currently 1 degree of motion, using the standard servo.write() command. **[It is theoretically possible to increase the angular resolution to 0.1 degree using the servo.writeMicroseconds() command](http://goldsequence.blogspot.com/2016/06/rotation-with-less-than-1-degree.html)**, which I think will help with very precise tasks such as grape surgery. I followed the above tutorial to implement this, which involved just a few changes:
* The values sent from the potentiometer need to be from 0-1800 rather than 0-180. This simply meant adjusting the value on the map() function. 
* The potentiometer reading can be mapped to the appropriate pulse frequency on the receiver end and written to the servo using the servo.writeMicroseconds() function. In the prior version the reading was written directly to the servo using servo.write().
For practical purposes, this does not achieve anywhere near 0.1 degree precision due to the raw potentiometer reading only being 10-bit (0 to 1023) and the inherent sloppiness in the servo geartrains. However, there should be at least some performance improvement. I tested the resulting motion and it seemed maybe a little smoother, although I am highly susceptible to the placebo effect.

The other change I made was calibrating the angle mapping on the potentiometer. The previous strategy of mapping raw values directly to angle values (i.e. 0 -> 0 and 1023 -> 1800) resulted in some subtle issues because neither the potentiometer nor servo had a perfect 180-degree range of motion. Moving a joint on the controller arm by 70 degrees, for example, would only move the joint on the Avatarm by 60-ish degrees. This wasn't hugely noticeable, but would probably prevent our surgery bot from getting FDA approval. So through some trial-and-error, I adjusted the values on each of the map() functions such that the Avatarm more accurately approximated the motion of the controller arm. If you check out the updated controller code below, you'll notice that the final range of output values is much wider than 0-1800.

**[Updated controller code](files/avatarm/updated_controller_code.txt)**

After some further testing, I realized the arm would sometimes "jump" from its set position while at rest. I attributed this to the use of servo.writeMicroseconds() so on the receiver end I mapped it back own to a 0-180 degree range and went back to servo.write(). I also set initial servo values to the "home" positions. (These used to be set to some random number so the arm tended to punch me in the face if I turned it on before the controller.)

**[Updated Avatarm code](files/avatarm/updated_avatarm_code.txt)**

### 7. Final Product and Photo Gallery

![.](images/avatarm/done.jpg)
![.](images/avatarm/pg-avatarm-extended.jpg)
![.](images/avatarm/pg-controller-closeup.jpg)
![.](images/avatarm/pg-topview.jpg)
![.](images/avatarm/pg-sideview.jpg)

To demonstrate the precise and intuitive control that this machine affords, I made one final piece of robot art.

{{< rawhtml >}}
<iframe width="700" height="385" src="https://www.youtube-nocookie.com/embed/IB0fF9iGAfw?rel=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
<br>
<br>
{{< /rawhtml >}}

Finally, it is time to put this machine to the test. I ran out of regular grapes so I used a ~~chicken grape~~ egg instead to test out the surgical aptitude of the Avatarm. As you can see, perhaps some more R&D is necessary before this technology is released to the public.

{{< rawhtml >}}
<iframe width="700" height="385" src="https://www.youtube-nocookie.com/embed/zhRoPBNo_vg?rel=0" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
<br>
<br>
{{< /rawhtml >}}

### 8. Reflections & Future Plans

This was my first proper robotics project and I'm pretty happy with my progress so far. Besides learning to work with Arduino and servos, I also improved my CAD skills. Designing parts to fit together precisely required careful consideration of clearances as well as the limits of FDM 3D printing. Having not much experience in soldering, I was intimidated by fabricating my own circuit boards at first but found that with a little bit of patience it was quite fun. Overall, this project (and this class) really opened my mind to the world of electronic hardware and circuitry.

I'm thinking of this robot arm as a starting point for many future projects. One idea I would like to implement is to record arm positions over time and replay them, so the arm can be taught a sequence of motions. (The buttons on the controller circuit board were added for this purpose.) Another is to use gyroscope/accelerometer sensors (such as the MPU6050) to detect the orientation of various joints of my own arm and use that information to control the motion of the robot. With the addition of a gripper and ESP32-CAM, I think there are also some very cool computer vision applications that could be explored. I'm excited to work on this further!

### 8. Bill of Materials.

A lot of materials I had laying around already, but I've included links where you could find compatible parts. I suggest recovering parts from old electronics circuitry whenever possible, since you're not only improving your (de)soldering skills but also helping address the growing problem of electronics waste.

* ESP8266 NodeMCU Development Board: **[$10 for 3](https://www.amazon.com/dp/B07HF44GBT?psc=1&ref=ppx_yo2_dt_b_product_details)**. The reliability of these is kind of dodgy; I had a board fail on me. But otherwise they seem to be well-built.
* MG996R Metal Gear Servos: **[$19 for 5](https://www.amazon.com/dp/B081JN7C4M?psc=1&ref=ppx_yo2_dt_b_product_details)**. These are rated for 12 kg-cm at 6V. I'm actually powering them off a 5V power bank but they still hold up well.
* SG90 Plastic Gear Servos: **[$18 for 10](https://www.amazon.com/Micro-Helicopter-Airplane-Remote-Control/dp/B072V529YD/ref=sr_1_8?dchild=1&keywords=sg90+servo&qid=1619543945&sr=8-8)**. These were kindly provided by the PS70 teaching staff.
* Perfboard: **[$13.99 for 30 pieces](https://www.amazon.com/gp/product/B07CK3RCKS/ref=ppx_yo_dt_b_asin_title_o03_s00?ie=UTF8&psc=1)**, with header connectors included. Be careful when cutting these! Fiberglass splinters are no fun.
* 10K Potentiometers: **[$6 for 10](https://www.amazon.com/gp/product/B07CZXCBWD/ref=ox_sc_saved_title_1?smid=ATHZ0BI0D2RLH&psc=1)**. These were kindly provided by the PS70 teaching staff.
* Dupont Wire (M-M, M-F): **[$6 for 120](https://www.amazon.com/EDGELEC-Breadboard-Optional-Assorted-Multicolored/dp/B07GD2BWPY/ref=sr_1_3?dchild=1&keywords=dupont+cables&qid=1619543905&sr=8-3)**. I had these laying around already.
* PLA Filament: **[$20 per kg roll](https://www.amazon.com/Printer-Filament-SUNLU-Dimensional-Accuracy/dp/B07XG3RM58/ref=sr_1_3?dchild=1&keywords=pla%2Bfilament&qid=1619544207&sr=8-3&th=1)**. I used white and black, probably 500g of plastic in total, so about $10 worth.
* Various assorted small screws: **Free**. I had a lot of tiny screws laying around from various electronics I've taken apart and tried to fix over the years (some of them successfully...). If you have some unwanted electronics or toys laying around you can harvest screws from them.
* Diodes, buttons, and solid-core wire: **Free**. These were kindly provided by the PS70 teaching staff. You could desolder these from pretty much any unwanted circuit board.

### 9. STL Files

**Download parts for the Avatarm:**
1. [Base](files/avatarm/avatarm-base.stl)
2. [Base Feet 1](files/avatarm/avatarm-baseFeet1.stl)
3. [Base Feet 2](files/avatarm/avatarm-baseFeet2.stl)
4. [Base Feet 3](files/avatarm/avatarm-baseFeet3.stl)
5. [Base Feet 4](files/avatarm/avatarm-baseFeet4.stl)
6. [Base Back Panel (unused)](files/avatarm/avatarm-baseBackPanel.stl)
7. [Part A](files/avatarm/avatarm-partA.stl)
8. [Part B](files/avatarm/avatarm-partB.stl)
9. [Part C](files/avatarm/avatarm-partC.stl)
10. [Wrist Base](files/avatarm/avatarm-wristBase.stl)
11. [Wrist Joint Part A](files/avatarm/avatarm-wristA.stl)
12. [Wrist Joint Part B](files/avatarm/avatarm-wristB.stl)
13. [Wrist Joint Cap](files/avatarm/avatarm-wristCap.stl)
14. [Pen Mount Base](files/avatarm/avatarm-penBase.stl)
15. [Pen Mount Holder](files/avatarm/avatarm-penHolder.stl)

**Download parts for the controller:**
1. [Base](files/avatarm/controller-base.stl)
2. [Base Feet 1](files/avatarm/controller-baseFeet1.stl)
3. [Base Feet 2](files/avatarm/controller-baseFeet2.stl)
4. [Base Feet 3](files/avatarm/controller-baseFeet3.stl)
5. [Base Feet 4](files/avatarm/controller-baseFeet4.stl)
6. [NodeMCU mount](files/avatarm/controller-NodeMCUmount.stl)
7. [Part A](files/avatarm/controller-partA.stl)
8. [Part B](files/avatarm/controller-partB.stl)
9. [Part C](files/avatarm/controller-partC.stl)
10. [Wrist Joint Part A](files/avatarm/controller-wristA.stl)
11. [Wrist Joint Part B](files/avatarm/controller-wristB.stl)

[//]: # "Various helpful links: https://www.youtube.com/watch?v=uEd2B7fS8Eg, https://www.youtube.com/watch?v=zxBC1ivOVfM, https://www.youtube.com/watch?v=GC0gRdBpylw, https://www.instructables.com/Wireless-Servo-Control/, https://dronebotworkshop.com/esp32-servo/"

