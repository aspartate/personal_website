---
title: "Astro-Imaging Telescope"
date: 2021-03-02T12:53:47-05:00
draft: false
---

This post will document progress on my efforts to build a dedicated astronomical imaging telescope with star tracking. I will divide the project into three parts: the optical tube assembly (OTA) and the tracking mount.

### 1. Star tracking mount.

The mount is a much easier build than the OTA, so let's start with that. I already described the basics of this mount in **[an earlier post](https://aspartate.github.io/personal_website/blog/week-4-stepper-drive/)**, but here is a diagram to remind us what we are building:

![Barn door tracker.](images/telescope/barndoor.jpg)

I've acquired a 100mm T8 lead screw which will be driven by the stepper motor and raise the platform. My first task is to design a gear in which I can press-fit the brass nut. As in the diagram above, this gear will be driven by a second, smaller gear, which is attached to the stepper motor.

![T8 screw and nut.](images/telescope/screw-and-nut.jpg)

Using the "ProGear" gear generator in TinkerCAD, I made a simple helical gear with a diameter of 48 mm. Four large holes serve to reduce filament use, and the center hole will fit the body of the nut. The four small pins align with the small holes in the flange of the nut and will be used to hold it in place.

![Large gear.](images/telescope/large-gear.png)

I exported the model as STL and loaded it into Cura for slicing. I'm using a custom profile for my Ender 3, with 0.2 mm layer height. Since I expect this part to be under a moderate amount of load, I chose 20% gyroid infill.

![Large gear slicing.](images/telescope/large-gear-slice.png)

Here are the files!
1. [Click to download STL](files/telescope/large-gear.stl)
2. [Click to download GCODE](files/telescope/large-gear.gcode)

The main advantage of 3D printing this part is that the helical gear teeth are much easier to fabricate than via traditional machining tools or casting. The holes in the gear could easily be made on a CNC, and the protruding pins could also be milled (although it would result in a significant waste of the surrounding material). But the teeth would need to be cut using a spiral mill, which is slow. Additive manufacturing is much more efficient for this part and results in minimal waste. But there are drawbacks:
* A 3D-printed part is less sturdy than a cast or milled metal part.
* The precision of 3D-printed parts may not be enough for applications which need tight clearances.
* If the helical angle were any steeper, it may be difficult to 3D print without supports.

For this slow-speed, moderate-load application, 3D printing gets the job done.