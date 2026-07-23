# DeviceBuddy

**A universal controller diagnostic, display, and testing utility.**  The next-generation GamePad Viewer built on WebHID and WebUSB.

<img src="https://github.com/user-attachments/assets/89fe4f43-66c1-4b2c-a019-4cc2914b3423" width="275">

---

## 🚧 Project Status 🚧

**DeviceBuddy is a work in progress.**

If you found this project, you probably stumbled across it early.  
It is new, so expect bugs, missing features, and frequent changes, missing features, and things changing frequently.

🌐 Online version:
https://ulao.github.io/DeviceBuddy/

Anyone interested in development can go to https://discord.gg/KvVWhwH3U and join the #DeviceBuddy discussion. 
or enter an issue on GitHub.

---

## About

DeviceBuddy is a quick and flexible controller utility designed to replace the many limited controller testers currently available.

The goal is to support as many controllers as possible while remaining configurable and expandable.

This is **not an exclusive Bliss-Box tool**. Support will be added for any controller hardware that can be identified and communicated with.

---

## Current Version

### V1.1 - Hello World Release

This is the first public version.

Current status:

- Bliss-Box API support is implemented, including device flashing. 
- Tested with multiple controllers
- Windows support
- Linux support
- WebHID/WebHID controller communication

---
### Why WebHID or WebUSB and not Gamepad API ?
The Gamepad API is great, and there are many excellent gamepad testers available that use it. Device Buddy takes a different approach.

The Gamepad API is designed to expose standard controller inputs—buttons, analog sticks, but it doesn't provide access to advanced USB HID features such as control transfers, feature reports, or vendor-specific data. Because of these limitations, browser-based tools have traditionally been unable to fully configure, map, or communicate with advanced controller adapters.

By using WebHID/WebUSB instead of the Gamepad API, Device Buddy can communicate directly with supported hardware. This makes it possible to perform advanced mapping, configure device settings, update firmware, and access features that were previously only available through desktop software.

As a result, industry-leading adapters such as Bliss-Box and Raphnet can now be fully configured and managed directly from a web browser—no software installation required.

---

## Supported Controllers

| System | Support |
|---|---|
| 3DO | ✅ |
| Atari 2600 | ✅ |
| Atari 5200 | ✅ |
| Atari 7800 | ✅ |
| Philips CD-i | ✅ |
| Sega Dreamcast | ✅ |
| Nintendo GameCube | ✅ |
| Sega Genesis 3/6 | ✅ |
| Atari Jaguar | ✅ |
| Neo Geo | ✅ |
| Nintendo Entertainment System | ✅ |
| Nintendo 64 | ✅ |
| Nintendo wii chuck | ✅ |
| Nintendo wii classic controller | ✅ |
| Apple Pippin | ✅ |
| Sony PlayStation | ✅ |
| Sony PlayStation 4 | ✅ |
| Sega Saturn /3d | ✅ |
| Super Nintendo | ✅ |
| TurboGrafx-16 | ✅ |
| Virtual Boy | ✅ |
| Xbox One | ✅ |
| Xbox 360 | ✅ |
| Xbox OG | ✅ |
| Switch | ✅ |


---

# Windows Notes

If you download the source and want to run DeviceBuddy locally, Chromium-based browsers are required.

Tested browsers:

- Chrome
- Opera
- Edge

Launch with:

### Chrome
```cmd
chrome.exe --allow-file-access-from-files --disable-web-security --user-data-dir="C:\temp\chrome_dev"
```

### Opera
```cmd
"C:\Program Files\Opera\launcher.exe" --allow-file-access-from-files --disable-web-security --disable-site-isolation-trials --user-data-dir="C:\temp\opera_dev"
```

### Edge
```cmd
"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --allow-file-access-from-files --disable-web-security --disable-site-isolation-trials --user-data-dir="C:\temp\edge_dev"
```

---

# Linux Notes

Linux users may need HID permissions.

Find your device name:

```
mcs-gamer-pro
```

Create:

```
sudo nano /etc/udev/rules.d/99-mcs-gamer-pro.rules
```

Add:

exmaple Bliss-Box port 1
```text
SUBSYSTEM=="hidraw", ATTRS{idVendor}=="16d0", ATTRS{idProduct}=="0d04", MODE="0666"
```

example Bliss-Box bootloader updater:

```text
SUBSYSTEM=="hidraw", ATTRS{idVendor}=="16d0", ATTRS{idProduct}=="04fb", MODE="0666"
```

Reload rules:

```bash
sudo udevadm control --reload-rules
sudo udevadm trigger
```

---

# OBS overlay
Within the app you can press Scroll Lock to hide everything except the controller. You can also choose your own controller fill color.

In OBS, use Window Capture for the browser window.

<img width="250" height="52" alt="image" src="https://github.com/user-attachments/assets/f69e79c2-7edd-4b21-b91a-d5a6658e0e6a" />


To crop, hold Alt while dragging the edges of the source to crop the image.

<img width="264" height="214" alt="image" src="https://github.com/user-attachments/assets/3792ce6d-9ec0-4768-be74-fb1c241746c6" />

Right-click your Window Capture source in OBS and choose Filters
.Click the + button under Effect Filters (on the bottom left).
Select Color Key (do not choose Chroma Key) and name it.
Choose Custom Color from the Key Color Type.
Set the Key Color Type to Custom Color
.Click Select Color, choose pure White, and click OK.
If done correctly, you'll have a controller overlay.

<img width="690" height="730" alt="image" src="https://github.com/user-attachments/assets/df62e294-a54b-4c15-9622-c50f7baeee4b" />

if done right you will have a comtroller overlay

<img width="465" height="265" alt="image" src="https://github.com/user-attachments/assets/c3df7bbd-0f1a-4737-9292-5180e2623e8f" />


# License

This project is not open source.

Copyright (c) 2026 Bliss-Box LLC

Permission to use, modify, or redistribute this code is granted only if:

- This copyright notice remains.
- The Bliss-Box logo remains visible.
- A visible link to https://bliss-box.com remains on the page.
- Derivative works continue to display this attribution.

Bliss-Box® and the Bliss-Box logo are trademarks of Bliss-Box LLC.

All rights reserved.

---

# Screenshots

## Controller Display with fill options

<img width="1178" height="1024" alt="image" src="https://github.com/user-attachments/assets/b5a3be4b-01cb-471c-96c4-f603973a04e6" />
<img width="446" height="259" alt="image" src="https://github.com/user-attachments/assets/2f08272b-1dea-4030-81c0-4ccb8ddb1a14" />
<img width="430" height="269" alt="image" src="https://github.com/user-attachments/assets/98c84ea2-c38c-4557-a87d-9683aab58dcf" />


## Diagnostics

<img src="https://github.com/user-attachments/assets/4c20a887-5e0e-4eca-971b-b80b0652f784">
<img width="938" height="600" alt="image" src="https://github.com/user-attachments/assets/a448c8a6-c063-46a6-a875-ad03b4801a54" />


## Mapping

<img src="https://github.com/user-attachments/assets/51fd8bda-1023-496c-9be9-25700b5f8dd7">
<img width="633" height="663" alt="image" src="https://github.com/user-attachments/assets/5a9c8ffb-2234-4b5b-9561-80b075914e4a" />
<img width="392" height="596" alt="image" src="https://github.com/user-attachments/assets/6e561d3c-0b93-4f68-8022-082ea25e1ac7" />



## Features

<img src="https://github.com/user-attachments/assets/5c1ed7e5-baa7-4d83-977d-53e5877cd470">
<img width="947" height="276" alt="image" src="https://github.com/user-attachments/assets/a1a1d9f7-14e3-432a-9594-d12ce6db9087" />
<img width="633" height="444" alt="image" src="https://github.com/user-attachments/assets/bd0057c9-c4ec-4f54-8f4a-58cb73556eca" />
<img width="383" height="226" alt="image" src="https://github.com/user-attachments/assets/a4772a71-a79b-46c0-b118-f832b54b083a" />


# 🎮 What is Bliss-Box?

**Bliss-Box makes old and new game hardware work together.**

Whether it's a controller from the 1980s, or an arcade stick you built yourself, Bliss-Box products let you connect the controller you love to the system you want to play.

Instead of replacing your favorite controllers, **Bliss-Box gives them a new life.**

---

# 🚀 Three Ways Bliss-Box Makes Gaming Better

## 🎮 Input Adapters

### Use almost any controller on your PC.

Plug classic console controllers, arcade sticks, fight sticks, racing wheels, and specialty controllers into a single USB adapter.

- ✅ No soldering
- ✅ No complicated setup
- ✅ Just play
- ✅ Lowest lag posible

Perfect for:

- Steam
- RetroArch
- MAME
- FPGA systems
- Emulators
- Modern PC games

---

## 🔄 Bridge Adapters

### Make controllers and consoles speak the same language.

Bridge adapters translate one controller protocol into another in real time.

For example, use a USB controller on hardware that normally doesn't support USB—or connect controllers between entirely different gaming ecosystems.

> Think of it as a **universal interpreter for game controllers.**

---

## ⚡ Specialty Adapters

### Do things other adapters simply can't.

Products like the **Bliss-Box Air** and **Bliss-Box Blender** solve unique controller challenges that standard adapters ignore.

Whether it's wireless connectivity, combining multiple controller technologies, or enabling specialized hardware, these devices are designed for gamers who want maximum flexibility.

---

# ⭐ Why Gamers Choose Bliss-Box

## ✔ Use the controller you already love

Keep using your favorite controller instead of buying a replacement.

---

## ✔ Huge controller compatibility

Support for **100+ controller types** spanning decades of gaming history.

---

## ✔ Built for enthusiasts

Ideal for:

- Retro gamers
- Arcade builders
- Speedrunners
- FPGA users
- Collectors
- Hardware developers

---

## ✔ Low latency

Fast, responsive performance designed specifically for gaming—not generic USB conversion.

---

## ✔ Constantly evolving

New controller support and firmware updates continue to expand what the hardware can do.

---

## ✔ Designed by gamers

Every product is created by someone who actually uses classic gaming hardware—not just someone selling adapters.

---

## ✔ Do what the controller can

At Bliss-Box, we believe you should be able to use your controller to its full potential. Whenever possible, we push beyond the standard limitations to support advanced features such as pressure-sensitive buttons, gyroscopes, LCD displays, memory card access, and much more.

Take a look at the source code behind Device Buddy to see what's possible with the API. Its straightforward interface makes it easy to access powerful controller features that are typically unavailable through conventional gamepad APIs.

Our goal is simple: give developers and gamers complete access to their hardware so they can enjoy the best possible gaming experience.

---

# 🌟 The Bliss-Box Difference

Many adapters solve only **one problem**:

> *"This controller works on this console."*

**Bliss-Box is different.**

It is an entire ecosystem built around one idea:

> ## **Every great controller deserves to work everywhere.**

Whether you're preserving gaming history, building the ultimate arcade cabinet, speedrunning with original hardware, or simply playing with the controller that feels best in your hands, **Bliss-Box removes the barriers between generations of gaming.**



Bliss-Box LLC
Bliss-Box.com](https://bliss-box.com)


