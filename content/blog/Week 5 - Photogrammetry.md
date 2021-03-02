---
title: "Week 5 - Photogrammetry"
date: 2021-03-02T10:56:04-05:00
draft: false
---

Photogrammetry is the 3D reconstruction of an object in the real world using images captured from a camera. Many images are captured of an object from different angles, and special software can be used to estimate the 3D shape of the object. I tried quite a few software options and many did not work with my computer. I finally found success in a program called [3DF Zephyr](https://www.3dflow.net/technology/documents/3df-zephyr-tutorials/), which works without the need for an NVIDIA GPU and also has the ability to extract images directly from a video. Below is my experience with 3DF Zephyr.

I decided to scan this cool-looking rock I have:

![Cool rock.](images/week5-photogrammetry/rock.png)

From my preliminary testing with other photogrammetry software, I realized that the image capturing process is actually fairly time-intensive. I happened to have a small solar-powered turntable, so I took advantange of this as well as 3DF Zephyr's ability to analyze videos and captured a video of the rock as it rotated under a lamp:

![Rock rotating.](images/week5-photogrammetry/rock-rotate.gif)

I uploaded the video to 3DF Zephyr and selected parameters for image extraction:

![Image extraction.](images/week5-photogrammetry/image-extract.png)

These images were automatically saved to the directory containing the video. For some reason, all images were rotated 90 degrees so I fixed them using the handy batch rotate tool in Windows 10:

![Batch rotate.](images/week5-photogrammetry/batch-rotate.png)

I loaded these back into a new project in 3DF Zephyr. Zephyr also has a really cool masking tool called Masquerade, which provides assisted masking of the background so you get minimal noise in your final reconstruction. It automatically applied the mask after the first one, and did a pretty good job:

![Masquerade.](images/week5-photogrammetry/masquerade.png)

After hopping through a few more confirmation screens, I ran the sparse point cloud extraction, followed by the dense point cloud and mesh extraction, and finally the textured mesh generation. Here is the result! Notice that the face of the rock touching the turntable was not well reconstructed; this could be fixed by taking another video of the rock in a different orientation to collect more data points on that face. Otherwise, the reconstruction is pretty good!

![Final render.](images/week5-photogrammetry/final.gif)

[Click to download OBJ (mesh only)](files/week5-photogrammetry/Rock.obj)