//Bliss-Box Device Buddy
//see Copyright in index.html
//https://bliss-box.com

export class WebHIDDevice
{
    constructor()
    {
        this.device = null;
    }


    // Connect to a previously authorized HID device.
    //
    // This is safe to call during startup.
    // It will NOT show the browser device picker.
    async connect(filters = [])
    {
        if (!navigator.hid)
            return false;

        const devices = await navigator.hid.getDevices();

        if (!devices.length)
            return false;

        this.device = devices[0];

        if (!this.device.opened)
            await this.device.open();

        return true;
    }


    // Request permission to use a HID device.
    //
    // This MUST be called from a user action
    // (button click, menu selection, etc.)
    async request(filters = [])
    {
        if (!navigator.hid)
            return false;

        const devices = await navigator.hid.requestDevice({ filters });

        if (!devices.length)
            return false;

        this.device = devices[0];

        if (!this.device.opened)
            await this.device.open();

        return true;
    }


    async sendFeature(reportId, data) // Send a feature report to the device.
    {
        return await this.device.sendFeatureReport(reportId, data);
    }


    async receiveFeature(reportId)   // Read a feature report from the device.
    {
        const dataView = await this.device.receiveFeatureReport(reportId);

        const bytes = new Uint8Array
        (
            dataView.buffer,
            dataView.byteOffset,
            dataView.byteLength
        );

        let b = Array.from(bytes);


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
        const shiftDetected = 
        (
            b.length === 5 &&
            b[0] === 0x80 &&
            b[4] === 0x00
        );

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


    // Register for incoming input reports.
    addInputListener(callback)
    {
        if (this.device)
            this.device.addEventListener("inputreport", callback);
    }


    // Remove a previously registered input report listener.
    removeInputListener(callback)
    {
        if (this.device)
            this.device.removeEventListener("inputreport", callback);
    }


    // Device information.
    get productName()
    {
        return this.device?.productName ?? "";
    }


    get vendorId()
    {
        return this.device?.vendorId ?? 0;
    }


    get productId()
    {
        return this.device?.productId ?? 0;
    }
}