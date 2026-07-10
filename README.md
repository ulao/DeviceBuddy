# DeviceBuddy
Diag, display, and your ontroller anywhere. 
_____________________________________________________________________________________________________________
If you came here, chances are you just stumbled on to this. Or maybe got a invite, its new, do not expect much!
_____________________________________________________________________________________________________________


DeviceBuddy is a W.I.P of a quick and handy device utility for controllers. I pla to replace all the crappy non-flex able controller testers out there. This will not be an exclusive Bliss-Box tool. This one will support everything I can figure out and be configurable. 

V 1.1: This is the Hello World version, expected to be full of bugs and errors. I have maybe parts of the Bliss-Box API ready, and tested a few controllers. Linux and Windows are working. 

Windows Notes:
if you download the source and want to run locally I got 3 browsers to work. They are chrom based 
 
 chrome.exe --allow-file-access-from-files --disable-web-security --user-data-dir="C:\temp\chrome_dev"
 C:\Program Files\Opera\launcher.exe" --allow-file-access-from-files --disable-web-security --disable-site-isolation-trials --user-data-dir="C:\temp\opera_dev"
 "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --allow-file-access-from-files --disable-web-security --disable-site-isolation-trials --user-data-dir="C:\temp\edge_dev"

For  Linux users, web or stand alone you must find the name of the device or devies i.e "mcs-gamer-pro"edit this file:    sudo nano /etc/udev/rules.d/99-mcs-gamer-pro.rules
add this line:    SUBSYSTEM=="hidraw", ATTRS{idVendor}=="16d0", ATTRS{idProduct}=="0d04", MODE="0666"

Or at least I did, and to make chrome work in standalone more, requires a shiton if figuring out.  And there are many ways to install chrome, so use chat GPT. 
Linces: If you do not agree contact Bliss-Box directly to find a suitable solution for you use case. 
Bliss-Box Device Buddy
Copyright (c) 2026 Bliss-Box LLC
https://bliss-box.com

This code is NOT open source. Permission to use, modify, or redistribute this code is granted only if:
- This copyright notice remains.
- The Bliss-Box logo remains visible.
- A visible link to https://bliss-box.com remains on the page.
- Derivative works continue to display this attribution.

Bliss-Box® and the Bliss-Box logo are trademarks of Bliss-Box LLC.

Copyright © 2026 Bliss-Box LLC. All rights reserved.

Permission to use, modify, or redistribute this code is granted only if this copyright notice,
the Bliss-Box logo, and a visible link to https://bliss-box.com remain intact on all copies and derivative works.
Any use that does not comply with these terms is unauthorized and may constitute copyright infringement. 
Bliss-Box LLC reserves all legal rights and remedies. Bliss-Box® and the Bliss-Box logo are trademarks of Bliss-Box LLC.
 


