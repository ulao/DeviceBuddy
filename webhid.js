//Bliss-Box Device Buddy
//see Copyright in index.html
//https://bliss-box.com

class WebHIDDevice
{
    constructor()
    {
        this.device = null;
    }

    // Connect to a HID device.
    //
    // If the user has already granted permission, reconnect automatically.
    // Otherwise, show the browser's device picker.
    async connect(filters = [])
    {
        let devices = await navigator.hid.getDevices(); // Check for previously authorized devices.
        if (!devices.length)        // No authorized devices? Ask the user to select one.
        {
            devices = await navigator.hid.requestDevice({ filters });
            if (!devices.length) return false;  // User cancelled the dialog.
        }     
        this.device = devices[0];   // Use the first selected device.
        if (!this.device.opened) await this.device.open();    // Open the device if it isn't already open.
        return true;
    }

	async sendFeature(reportId, data) // Send a feature report to the device.
	{
		return await this.device.sendFeatureReport(reportId, data);
	}

    async receiveFeature(reportId)   // Read a feature report from the device.
    {
        const dataView = await this.device.receiveFeatureReport(reportId);

        const bytes = new Uint8Array // Convert the DataView into a byte array.
		(
            dataView.buffer,
            dataView.byteOffset,
            dataView.byteLength
        );
        let b = Array.from(bytes);      // Make a mutable copy.

        // -----------------------------------------------------------------
        // WebHID Bug Workaround
        //
        // Some browsers occasionally return a 5-byte feature report shifted
        // left by one byte:
        //
        // Expected: 00 80 04 04 55
        // Returned: 80 04 04 55 00
        //
        // Detect this pattern and rotate the data back into the correct order.
        // -----------------------------------------------------------------
        const shiftDetected = (b.length === 5 && b[0] & 0x80 && b[4] === 0x00);

        if (shiftDetected)
        {
            b =
            [
                b[4],
                b[0],
                b[1],
                b[2],
                b[3]
            ];
        }

        return new Uint8Array(b);
    }

  
    addInputListener(callback)  // Register for incoming input reports.
    {
        this.device.addEventListener("inputreport", callback);
    }


    removeInputListener(callback)    // Remove a previously registered input report listener.
    {
		if (this.device && callback)
		{
			this.device.removeEventListener("inputreport", callback);
		}
    }

 
    get productName()   // Device information.
    {
        return this.device.productName;
    }

    get vendorId()
    {
        return this.device.vendorId;
    }

    get productId()
    {
        return this.device.productId;
    }
}