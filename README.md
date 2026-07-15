# DeviceBuddy

**A universal controller diagnostic, display, and testing utility.**

<img src="https://github.com/user-attachments/assets/89fe4f43-66c1-4b2c-a019-4cc2914b3423" width="275">

---

## 🚧 Project Status 🚧

**DeviceBuddy is a work in progress.**

If you found this project, you probably stumbled across it early.  
It is new, expect bugs, missing features, and things changing frequently.

🌐 Online version:
https://ulao.github.io/DeviceBuddy/

Anyone interested in development can go to https://discord.gg/KvVWhwH3U and join the #DeviceBuddy discussion. 
https://discord.gg/KvVWhwH3U
or enter an issue on github.

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

- Bliss-Box API support partially implemented
- Tested with multiple controllers
- Windows support
- Linux support
- WebHID based controller communication

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
| Sega Genesis | ✅ |
| Atari Jaguar | ✅ |
| Neo Geo | ✅ |
| Nintendo Entertainment System | ✅ |
| Nintendo 64 | ✅ |
| Apple Pippin | ✅ |
| Sony PlayStation | ✅ |
| Sony PlayStation 4 | ✅ |
| Sega Saturn | ✅ |
| Super Nintendo | ✅ |
| TurboGrafx-16 | ✅ |
| Virtual Boy | ✅ |
| Xbox One | ✅ |
| Xbox 360 | ✅ |
| Xbox OG | ✅ |
| Switch0 | ✅ |


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

```text
SUBSYSTEM=="hidraw", ATTRS{idVendor}=="16d0", ATTRS{idProduct}=="0d04", MODE="0666"
```

For the updater:

```text
SUBSYSTEM=="hidraw", ATTRS{idVendor}=="16d0", ATTRS{idProduct}=="04fb", MODE="0666"
```

Reload rules:

```bash
sudo udevadm control --reload-rules
sudo udevadm trigger
```

---

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

## Controller Display

<img src="https://github.com/user-attachments/assets/f3785177-9d5e-40d9-b1cb-d2b50677a0b6">

## Diagnostics

<img src="https://github.com/user-attachments/assets/4c20a887-5e0e-4eca-971b-b80b0652f784">

## Mapping

<img src="https://github.com/user-attachments/assets/51fd8bda-1023-496c-9be9-25700b5f8dd7">

## Features

<img src="https://github.com/user-attachments/assets/5c1ed7e5-baa7-4d83-977d-53e5877cd470">

Bliss-Box LLC
Bliss-Box.com


