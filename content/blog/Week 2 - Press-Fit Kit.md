---
title: "Week 2 - Press-Fit Kit"
date: 2021-02-03T00:27:44-05:00
draft: false
---

For this project we were asked to work in pairs make a press-fit kit out of 2D shapes in cardboard. My partner Jessica and I decided to make a truncated icosahedron (more commonly known as a soccer ball). We chose this shape because it consists of 2 side elements: hexagons and pentagons, and one of us could work on each. After googling around a bit we found an online example of what we wanted to achieve:

![Example icosahedron.](images/week2-pressfit/example-icosahedron.jpg)

We are using a technique called **parametric modeling**, which allows us to create shapes based on given parameters. We can then adjust the parameters to adjust the shape without changing the overall structure. To coordinate between Jessica and I, we made sure that both of us used the following parameters:

```python
edge_length = 40 mm #this is the side length of each polygon
thickness = 4.3 mm #thickness of the cardboard
kerf = 0.5 mm #width of path carved out by laser
finger_count = 4 #the number of fingers on each edge
fillet_radius = 1 mm #radius of finger filleting
```

![Parameters.](images/week2-pressfit/parameters.png)

### 1. Modeling the hexagon.

My job is to make the hexagon component of this press-fit kit. I decided to start with a hexagon base and add the fingers on later:

![Parameters.](images/week2-pressfit/hexagon.png)

In addition, to speed things up I decided to ignore the kerf for now and add the fingers as perfect squares. The side length of each square is `edge_length/(2*finger_count)`. I will later widen the squares to account for the kerf and achieve a press fit.

I first made the fingers on one side, and will rotate this for the other sides.

![Finger squares.](images/week2-pressfit/finger-1.png)

I then widened the fingers by moving each vertical edge by a value of `kerf/2` in either direction.

![Fingers widened.](images/week2-pressfit/finger-2.png)

Next, I rotated the fingers about the center of the hexagon to complete the shape.

![Fingers done.](images/week2-pressfit/finger-done.png)

Extrude to `thickness`, and we have the 3D shape! All that's left to do now is fillet the outer edges of the fingers.

![Hexagon done.](images/week2-pressfit/hexagon-done.png)

Project the object onto a sketch and save as DXF, and we're done! Here is the DXF file:

[Click to download DXF](files/week2-pressfit/press_fit_hexagon.dxf)

### 2. Modeling the pentagon.

Jessica modeled the pentagon using a similar workflow, to get the following:

![Pentagon done.](images/sample_image.png)

### 3. Laser-cut & construct.

After laser-cutting 20 hexagons and 12 pentagons, we made a soccer ball!

![Soccer ball.](images/sample_image.png)