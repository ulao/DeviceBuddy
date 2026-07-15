// webusb.js
// WebUSB -> WebHID shadow interface
// Allows existing Device Buddy code to use WebUSB without changes


class WebUSBDevice
{
    constructor(device = null)
    {
        this.device = null;

        this.inputCallback = null;

        this.interfaceNumber = null;
        this.endpointIn = null;
        this.endpointOut = null;

        this.removed = false;

        this.setDevice(device);
    }


    setDevice(device)
	{
		while(device instanceof WebUSBDevice)
			device = device.device;

		this.device = device;
	}



	async getDevices()
	{
		const usb = await navigator.usb.getDevices();
		const hid = await navigator.hid.getDevices();

		return [
			...usb.map(d => new WebUSBDevice(d)),
			...hid.map(d => new WebUSBDevice(d))
		];
	}


    static async requestDevice()
    {
        const device = await navigator.usb.requestDevice(
        {
            filters:[]
        });

        return [new WebUSBDevice(device)];
    }



    // -----------------------------
    // HID compatible properties
    // -----------------------------

    get vendorId()
    {
        return this.device?.vendorId ?? 0;
    }


    get productId()
    {
        return this.device?.productId ?? 0;
    }


    get productName()
    {
        return this.device?.productName ?? "";
    }


    get opened()
    {
        return this.device?.opened ?? false;
    }



    // -----------------------------
    // Open
    // -----------------------------
    async open()
    {
        this.setDevice(this.device);


        if (!this.device)
            throw new Error("No USB device");


        if (!this.device.opened)
            await this.device.open();


        if (!this.device.configuration)
            await this.device.selectConfiguration(1);



        let found = false;


        for (const item of this.device.configuration.interfaces)
        {
            const iface = item.interface;


            for (const alt of iface.alternates)
            {
                if (!alt.endpoints.length)
                    continue;


                this.interfaceNumber = iface.interfaceNumber;


                for (const ep of alt.endpoints)
                {
                    if (ep.direction === "in")
                        this.endpointIn = ep.endpointNumber;


                    if (ep.direction === "out")
                        this.endpointOut = ep.endpointNumber;
                }


                found = true;
                break;
            }


            if (found)
                break;
        }


        if (!found)
            throw new Error("No USB endpoints found");



        await this.device.claimInterface(this.interfaceNumber);



        console.log(
            "USB shadow HID ready",
            this.vendorId,
            this.productId,
            "interface",
            this.interfaceNumber,
            "IN",
            this.endpointIn,
            "OUT",
            this.endpointOut
        );
    }




    // -----------------------------
    // HID input listener clone
    // -----------------------------
	addInputListener(callback)
	{
		this.inputCallback = callback;

		if (this.device.addEventListener)
		{
			this.device.addEventListener("inputreport", e =>
			{
				if (!this.inputCallback)
					return;

				this.inputCallback(
				{
					reportId:e.reportId,
					data:e.data
				});
			});

			return;
		}

		this.readLoop();
	}



    removeInputListener()
    {
        this.inputCallback = null;
    }

	async readLoop()
	{
		while(this.inputCallback && !this.removed)
		{
			try
			{
				// WebHID device
				if (this.device.receiveFeatureReport)
				{
					await new Promise(resolve => setTimeout(resolve, 10));
					continue;
				}


				// WebUSB device
				const result =
					await this.device.transferIn(
						this.endpointIn,
						64
					);


				if (result.data)
				{
					const event =
					{
						reportId: 0,
						data: new DataView(
							result.data.buffer,
							result.data.byteOffset,
							result.data.byteLength
						)
					};

					this.inputCallback(event);
				}
			}
			catch(e)
			{
				console.log("USB read stopped", e);
				break;
			}
		}
	}
	


    // -----------------------------
    // HID sendReport clone
    // -----------------------------
    async sendReport(id, data)
    {
        await this.device.transferOut(
            this.endpointOut,
            data
        );
    }




    // -----------------------------
    // HID feature report clone
    // -----------------------------
   async receiveFeature(id)
	{
		// WebHID path
		if (this.device.receiveFeatureReport)
		{
			const data = await this.device.receiveFeatureReport(id);

			return new Uint8Array(
				data.buffer,
				data.byteOffset,
				data.byteLength
			);
		}


		// WebUSB path
		const result =
			await this.device.controlTransferIn(
			{
				requestType:"class",
				recipient:"interface",
				request:0x01,
				value:(0x03 << 8) | id,
				index:this.interfaceNumber
			},
			64);


		if (!result.data)
			return new Uint8Array();


		return new Uint8Array(
			result.data.buffer,
			result.data.byteOffset,
			result.data.byteLength
		);
	}



    async sendFeature(id,data)
	{
		if (this.device.sendFeatureReport)
		{
			await this.device.sendFeatureReport(id, data);
			return;
		}


		await this.device.controlTransferOut(
		{
			requestType:"class",
			recipient:"interface",
			request:0x09,
			value:(0x03 << 8) | id,
			index:this.interfaceNumber
		},
		data);
	}
}