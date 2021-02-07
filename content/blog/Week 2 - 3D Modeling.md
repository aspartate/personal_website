---
title: "Week 2: 3D Modeling"
date: 2021-02-02T01:47:17-05:00
draft: false
---

For this project we were asked to model two real-world components in Fusion 360 and create an assembly. I decided to model a PVC bulkhead which I had recently purchased for a hydroponics project. The bulkhead came without a nut, however, so I decided to model & 3D print one myself. Because this was my first time working with Fusion (I previously did all modeling in TinkerCAD), I figured this bulkhead offered a good mix of features to model without being too complicated.

![The bulkhead.](images/week2-bulkhead/bulkhead.png)

The bulkhead consists of a threaded **stem** and a **barb**, separated by a **hexagonal prism**. I'll tackle each of these separately.

### 1. Modeling the stem.

First, I measured the pertinent dimensions of the stem and threads using calipers. I got the following values:
* Outer diameter including threads: 27 mm
* Outer diameter not including threads: 22.6 mm
* Depth of threads: (27 - 22.6)/2 = 2.2 mm
* Distance between threads: 1.75 mm
* Inner diameter: 18.15 mm
* Total stem length: 17.6 mm
* Length of threaded portion: 16 mm

I found that Fusion had a built-in threads option, but it came with all these standard presets which did not offer enough customization for my purposes. Finally, I found this guy on Youtube who taught me how to use the "Coil" function. His tutorial is pretty good, check it out below:

{{< youtube id="N8xL32uV0SA" >}}

&NewLine;

I made a hollow shell, representing the stem without threads:

![Hollow shell.](images/week2-bulkhead/hollow-shell.png)

Then I created a coil like so:

![Threaded shell.](images/week2-bulkhead/threaded-shell.png)

I double-checked that the threads were going in the right direction! Good habit to have.

How to get rid of the thread sticking out the bottom? Simply create a sketch on the bottom face and extrude to cut:

![Trim threads.](images/week2-bulkhead/trim-threads.png)

Done! With a nice flat surface for joining later.

![Stem done.](images/week2-bulkhead/stem-done.png)


### 2. Modeling the barb.

The barb is shaped somewhat like a 4-tiered Christmas tree. Here are some measurements:
* Barb shaft outer diameter: 19.5 mm
* Barb shaft tip outer diameter: 17.1 mm
* Barb shaft inner diameter: 15 mm
* Barb flare outer diameter: 21.5 mm
* Width of bottom 3 barbs: 4 mm
* Distance between barbs: 4 mm

First, I drew the profile of the barb as a sketch:

![Barb profile.](images/week2-bulkhead/barb-profile.png)

Then I could revolve it to obtain the solid barb:

![Solid barb.](images/week2-bulkhead/barb-revolve.png)

Finally, I extruded a circle to cut out the center:

![Solid barb.](images/week2-bulkhead/barb-finished.png)

### 3. Modeling the hexagonal prism.

The prism is a relatively simple affair. The only two pertinent measurements are below:
* Diameter: 32.5 mm
* Height: 6.4 mm

I made this prism and rounded the vertical edges.

![The prism.](images/week2-bulkhead/prism.png)

Next, I added a hole with the same diameter as the hole in the barb. I then filleted one side of the hole (with radius 1.5 mm) to reduce the turbulence of the flow, since the hole in the stem is larger (18.15 mm) than the hole in the barb (15 mm).

![The prism with hole.](images/week2-bulkhead/prism-hole.png)

### 4. Finishing the bulkhead.

The final step in modeling the bulkhead is to combine everything into one piece. Here it is:

![The bulkhead model.](images/week2-bulkhead/bulkhead-done.png)

### 5. Designing the nut.

To make the nut, first I made a hexagonal prism with radius 20 mm, and cut a hole in it equivalent to the size of the threadless stem (diameter 22.6 mm).

![The pre-proto-nut.](images/week2-bulkhead/nut-with-hole.png)

Because I had a custom thread profile, I couldn't make the threaded hole using the native thread presets in the "Hole" function. So I instead duplicated the bulkhead, expanded by 0.5 mm in the X- and Y-axes for clearance, and cut out the threads from the nut.

![The proto-nut.](images/week2-bulkhead/nut-with-threads.png)

Let's check the clearance using the Section Analysis tool:

![Section analysis.](images/week2-bulkhead/section-analysis.png)

Looking good! Now let's make the nut just a bit fancier by chamfering & filleting the edges:

![Finished nut.](images/week2-bulkhead/nut-done.png)


### 6. Finished!

![Finished components.](images/week2-bulkhead/assembly-done.png)

[Download bulkhead as STL](files/week2-bulkhead/bulkhead.stl)

[Download nut as STL](files/week2-bulkhead/nut.stl)