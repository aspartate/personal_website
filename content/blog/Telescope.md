---
title: "Astro-Imaging Telescope"
date: 2021-03-09T12:53:47-05:00
draft: false
---

This post will document progress on my efforts to build a dedicated astronomical imaging telescope with star tracking. I will divide the project into two parts: the optical tube assembly (OTA) and the tracking mount.

### 1. OTA.

The OTA is the most important bit, and potentially also the most finicky. Before we begin, it would be a good idea to review how a reflector telescope (the type that uses mirrors instead of lenses) works. Reflectors are a very popular choice for amateur telescope makers because of their relative simplicity and lack of chromatic abberation. (Mirrors do not produce chromatic abberation, but lenses do). The simplest reflector consists of two mirrors: a large primary mirror and a small secondary mirror. The primary mirror is curved to focus light at a point. The secondary mirror then bounces the light from the primary up into the eyepiece. Refer to the diagram below:


Most people think the point of a telescope is to magnify. However, this is not entirely true when it comes to astronomy, particularly for deep space objects (DSOs). Many DSOs are gigantic, but just too dim to be seen with the naked eye. For example, the Andromeda galaxy if viewed at full brightness would be many times the size of a full moon! Frankly, this blows my mind:

![Andromeda size.](images/telescope/andromeda.png)

So in the case of DSOs, telescopes are really meant to concentrate light. If you've ever seen the effects of a magnifying glass on sunlight, you'll recall that they can concentrate a harmless beam of sunshine into a damaging point of light capable of even setting things on fire (as well as ruining your eyes, so don't do this on purpose). This is the reason why it is highly recommended to NOT leave water bottles and similarly lens-shaped objects on windowsills, because a fire could start that way. A concave mirror, specifically in the shape of a parabola, works the same way: it focuses light to a point. The larger the mirror, the more light it can collect and thus focus. In a telescope, the primary mirror is basically beaming the light from a million stars straight into your eye, which sounds pretty cool (and dangerous) if you think about it. However, because these stars are so far away, we need this light to be concentrated in order to see it at all. A standard 6-inch wide primary mirror can gather 576 times as much light as the human eye, with an aperture of a quarter inch. (Do you see how we arrived at this calculation?)

The optics of telescopes are insanely precise. To give you an idea, a good-quality amateur-grade parabolic mirror is figured to a wavefront error of anywhere from 1/10 to 1/40 wave. This "wave" refers to the wavelength of light! In building the OTA, a good-quality primary mirror is not enough; we also need to make sure that the primary mirror is aligned ("collimated") with the secondary. 

Accordingly, the most expensive part of a telescope is typically the optics. The larger the mirror, the more difficult it is to manufacture and prices can rise exponentially with increases in diameter. In addition, the parabolic shape is harder to achieve than a spherical shape; therefore, on many cheaper telescopes you'll find that the mirror is in fact spherical. For high f/ ratios, the spherical shape approximates a parabola and so a spherical mirror is acceptable.

What is an f/ ratio? It is the focal length of the mirror divided by its diameter. A 6" mirror that is f/8 has a focal length of 48 inches, meaning that it focuses light to a point 48" from the center of the mirror. Therefore the telescope it sits in will need to have a length around 48 inches. An acceptable level of error is 1/8 wave deviation between the spherical and parabolic shapes. There is an equation to determine the minimum f/ ratio *F* (**[source](https://www.cloudynights.com/topic/42362-parabolic-v-spherical-mirrors/#entry550430)**):

![Spherical error equation.](https://latex.codecogs.com/gif.latex?\LARGE&space;F&space;=&space;\big[&space;88.6&space;D&space;\big]&space;^{1/3})

where D is the aperture in inches. On eBay, I found a 4.5 inch spherical mirror with a focal ratio of f/8. According to the equation above, the minimum focal ratio to permit the use of a spherical mirror is f/7.4. This mirror satisfies that threshold and also came with a secondary for only 30 bucks, so I purchased it with the intention of building my own scope.

The most important part of a reflector is the mirror cell, or the base that holds the mirror. This needs to be mounted within the body of the scope. Many amateur telescope makers use cardboard concrete forms (also known as sonotubes) for their telescope bodies, but I could not find one that would be a suitable diameter for a 4.5" mirror. However, I did have an empty paint can laying around, as well as a broken aluminum tripod.

![Paint can.](images/telescope/can_paint.jpg)

![Tripod.](images/telescope/tripod.jpg)

These could be the beginnings of a truss tube-style telescope such as this:

![Truss tube dob.](images/telescope/truss-tube-dob.jpg)

I don't think anyone has ever made a telescope out of a paint can before, so this will be interesting. The first step was to clean the paint out of the can. Peeling off dried paint is quite satisfying:

![Clean can.](images/telescope/can_clean.jpg)

It's a tad rusty but that's all right. I needed to cut the can in half: one half for the primary cell and one half for the secondary cell (which holdes the secondary mirror and eyepiece). I also needed to cut out the bottom. A jigsaw with a metal blade made quick work of the can. I was *very* glad I wore thick gloves and safety goggles, however. Steel shrapnel is nasty!

![Cut can.](images/telescope/can_cut.jpg)

I think the part with the handle would do well as the base of the telescope, since that's where the center of mass (CoM) is at and it would be convenient to pick up.

I also took apart the tripod and got 6 nice aluminum supports about 3 feet long. These can be arranged to form a truss structure.

![Aluminum tubes.](images/telescope/trusses.jpg)


To be continued!

### 2. Star tracking mount.

The mount should be a much easier build than the OTA. I already described the basics of this mount in **[an earlier post](https://aspartate.github.io/personal_website/blog/week-4-stepper-drive/)**, but here is a diagram to remind us what we are building:

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