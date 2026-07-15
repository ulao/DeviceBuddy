//Bliss-Box Device Buddy
//see Copyright in index.html
//https://bliss-box.com

  function BlissBox_lookUpName(id)
{
	if (id == 0  ) return "atari2600"  ;
	if (id == 1  ) return "coleco"           ;
	if (id == 2  ) return "gx4000"        ;
	if (id == 3  ) return "saturn";
	if (id == 4  ) return "A7800"         ;
	if (id == 5  ) return "vectrex"           ;
	if (id == 6  ) return "atari5200"         ;
	if (id == 7  ) return "HPD"		      ;
	if (id == 8  ) return "saturnanalog" ;
	if (id == 9  ) return "gamecube"      ;
	if (id == 10 ) return "atmark" 		  ;
	if (id == 11 ) return "jaguar" ;
	if (id == 12 ) return "drivigncontroller" 	;
	if (id == 13 ) return "nuncheck"  ;
	if (id == 14 ) return "intellivition" 		  ;
	if (id == 15 ) return "dreamcast" 	;
	if (id == 16 ) return "dreamcast"	    ;
	if (id == 17 ) return "nintendo"	          ;
	if (id == 18 ) return "gaemcubewheel"	;
	if (id == 19 ) return "nintendo64";
	if (id == 20 ) return "genisis3" 		  ;
	if (id == 21 ) return "genisis3" 		  ;
	if (id == 22 ) return "mastersystem"	          ;
	if (id == 23 ) return "TG16" 		;
	if (id == 24 ) return "CD32"		;
	if (id == 25 ) return "3DO"	;
	if (id == 26 ) return "PC_FX"         ;
	if (id == 27 ) return "SNES"		  ;
	if (id == 28 ) return "NES_GUN" 	;
	if (id == 29 ) return "virtualboy" 		  ;
	if (id == 30 ) return "arkanoid" ;
	if (id == 31 ) return "WII_CLASSIC"  ;
	if (id == 32 ) return "WII_MPLUS"     ;
	if (id == 33 ) return "CDI" 		;
	if (id == 34 ) return "SAC" 		;
	if (id == 35 ) return "DC_TWIN"		  ;
	if (id == 36 ) return "NES_POWERPAD" ;
	if (id == 37 ) return "THREE_DO_ANALOG";
	if (id == 38 ) return "GRAVIS_EX" 	  ;
	if (id == 39 ) return "MSSW" 		;
	if (id == 40 ) return "HAMMERHEAD"	  ;
	if (id == 41 ) return "PADDLES" 	;
	if (id == 42 ) return "BALLY" 		  ;
	if (id == 43 ) return "ATARI_KEYPAD" ;
	if (id == 45 ) return "SPEEK" 		  ;
	if (id == 46 ) return "PC_GAMEPAD"  ;
	if (id == 47 ) return "SNESS_NTT"	;
	if (id == 48 ) return "COL_FLASH_BACK";
	if (id == 49 ) return "NEO" 		;
	if (id == 50 ) return "A5200_TB" 	;
	if (id == 51 ) return "PSX_NEGCON" 	  ;
	if (id == 127) return "PSX_JOGCON"	  ;
	if (id == 52 ) return "FC_NES" 		  ;
	if (id == 53 ) return "FC_ARKANOID" ;
	if (id == 54 ) return "TG16_6BUTTON";
	if (id == 55 ) return "WII_DRUM"     ;
	if (id == 56 ) return "ARCADE"		  ;
	if (id == 57 ) return "SUPERGUN"	;
	if (id == 58 ) return "SATURN_GUN"	  ;
	if (id == 59 ) return "SMS_GUN"		  ;
	if (id == 60 ) return "DC_GUN"		  ;
	if (id == 61 ) return "PADDLES_GEMINI";
	if (id == 62)  return "DC_PAD_RF"  	  ;
	if (id == 63 ) return "FC_POWERPAD"  ;
	if (id == 64 ) return "ATARI_TB" 	;
	if (id == 65 ) return "playstation"	  ;
	if (id == 66 ) return "TOWNS"		  ;
	if (id == 67 ) return "WII_GUITAR"  ;
	if (id == 68 ) return "WII_DJHERO"  ;
	if (id == 69 ) return "WII_TABLET"	  ;
	if (id == 71 ) return "FC_NTT"		  ;
	if (id == 72 ) return "FAIRC"		;
	if (id == 73 ) return "DC_FP"		;
	if (id == 74 ) return "DC_MARACA"	;
	if (id == 75 ) return "PSX_GUITAR"  ;
	if (id == 77 ) return "A7800FB"		  ;
	if (id == 78 ) return "XE1_AP"		  ;
	if (id == 79 ) return "COL_WHEEL"	;  
	if (id == 83 ) return "playstation" ;
	if (id == 115) return "playstation" ;
	if (id == 119) return "playstation" ;
	if (id == 121) return "playstation" ;
 
	
}

let bars = null;//interval for pressure bars

async function GPA_CMD(dev, High, Low, Action1, action2, count, dataBuffer, startAddr)
{
    let report = new Uint8Array(64);
    report.fill(0xff);
    report[0] = 3;
    report[1] = High;
    report[2] = Low;
    report[3] = Action1;
    report[4] = action2;
    report[5] = count;
    for (let d = 7; d < count + 1; d++)
	{
		report[d-1] = dataBuffer[startAddr + d - 7];
	}
    await dev.sendReport(0, report);
    return false;
}


async function updateDevice(dev)
{
    let player = 1;
    console.log("Updating GPA player:", player);

    if (!dev.opened) await dev.open();

    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".hex";

    const file = await new Promise(resolve =>
    {
        input.onchange = () => resolve(input.files[0]);
        input.click();
    });

    if (!file) return false;

    let dataBuffer = new Uint8Array(65792);
    dataBuffer.fill(0xff);

    let startAddress = dataBuffer.length;
    let endAddress = 0;

    let hexText = await file.text();

    for (let line of hexText.split(/\r?\n/))
    {
        if (!line.startsWith(":")) continue;

        let len = parseInt(line.substr(1,2),16);
        let addr = parseInt(line.substr(3,4),16);
        let type = parseInt(line.substr(7,2),16);

        if (type != 0) continue;

        for (let i=0;i<len;i++) 
            dataBuffer[addr+i] = parseInt(line.substr(9+i*2,2),16);

        if (startAddress > addr) startAddress = addr;
        if (endAddress < addr + len) endAddress = addr + len;
    }
    startAddress &= ~127;
    endAddress = (endAddress + 127) & ~127;
	await GPA_CMD(dev, 0, 0, 3, 17, 7, dataBuffer, 0);
	let marker = 0;
	while (startAddress < endAddress)
	{
	    let percent = (startAddress / endAddress) * 100;
		document.getElementById("BBUpdateProgressBar").style.width = percent + "%";
	
		await GPA_CMD(dev, startAddress & 0xff, (startAddress >> 8) & 0xff, 1, 0, 64, dataBuffer, startAddress);
		startAddress += 58;

		await GPA_CMD(dev, startAddress & 0xff, (startAddress >> 8) & 0xff, 1, 0, 64, dataBuffer, startAddress);
		startAddress += 58;

		await GPA_CMD(dev, startAddress & 0xff, (startAddress >> 8) & 0xff, 1, 0, 18, dataBuffer, startAddress);
		startAddress += 12;

		await GPA_CMD(dev, marker & 0xff, (marker >> 8) & 0xff, 5, 17, 7, dataBuffer);
		marker += 0x80;

		await GPA_CMD(dev, marker & 0xff, (marker >> 8) & 0xff, 3, 17, 7, dataBuffer);
	}


    let reset = new Uint8Array(64);
    reset.fill(0xff);
    reset[0] = 5;

    await dev.sendReport(0, reset);

    console.log("GPA update complete");

    return false;
}

function BlissBox_DeInit ()
{
	clearInterval( BlissBoxAdapterTimer);
	clearInterval(bars);
	bars=null;
	document.getElementById("BBUPDATE").style.display = "block";
}

async function BlissBox_Init ()
{

 
	let restore = document.getElementById("BBUPDATE").onclick = async() =>
	{
		document.getElementById("BBUpdatePopup").style.display = "block";	 
		document.getElementById("BBUpdate").textContent = "Pair"; 
		document.getElementById("BBUpdate").onclick =  async  () =>
		{
			const newDevice = await navigator.hid.requestDevice(
			{
				filters:
				[
					{ vendorId: 0x16d0,	productId: 0x04fb },//updater
				]
			});
			if (newDevice[0].vendorId == 0x16d0 && newDevice[0].productId == 0x04fb  ) document.getElementById("BBUpdate").textContent = "Update"; 
			document.getElementById("BBUpdate").onclick =  async  () =>
			{
				document.getElementById("BBUPDATE").onclick = restore;
				await updateDevice(newDevice[0])
 
				document.getElementById("BBUpdateProgressBar").style.width = "100%";
				document.getElementById("BBUpdatePopup").style.display = "none";

			};
		};
	}
	
	
	const html = await fetch("blissbox.html").then(r => r.text());
	document.getElementById("blissbox-container").innerHTML = html;
 
    BlissBoxAdapterTimer = setInterval(() => 
	{
		if (hid.device.removed) removeInterval( this );
		BlissBox_readBlissBoxAdapterInfo( );

    }, 500);
	
	document.getElementById("BBTalkSend").onclick = async () =>
	{
		const sendLine = document.getElementById("inputTalk").value.split(",");

		const bytes = new Uint8Array(sendLine.length + 1);
		bytes[0] = sendLine.length;

		for (let i = 0; i < sendLine.length; i++)
		{
			let value = sendLine[i].trim().replace(/^0x/i, "");

			const num = parseInt(value, 16);

			if (isNaN(num))
			{
				alert(`Invalid hex byte: ${sendLine[i]}`);
				return;
			}

			bytes[i + 1] = num;
		}
		
		//fix data report
		let data = new Uint8Array(8);
		//data[0] = 0x12;//ReportID
        data[0] = 0x25;//command
        data[1] = 0;// (1=pos,0 for header )
        data[2] = (bytes[0] >> 8) & 0xFF ;//size - expects int here so move to little endian even though its only 8 bits. 
        data[3] = (bytes[0] & 0xFF);//size
        data[4] = 1;//use case native
        if (sendLine.length > 1) data[5] = bytes[1]; 
        if (sendLine.length > 2) data[6] = bytes[2];  
		await BlissBox_writeFeature(0x12, new Uint8Array(data));//send header
		if (bytes[0] > 2)//send in sets of 5 bytes if over 2 bytes
		{
			let c = 3;//Where data starts. 
			let size = bytes[0];
			let pos = 2;//First two have data 0,1, so pos is now 2
			size -= 2;//already sent 2
			size += 1;//array starts at 0
			let remainder = false;
			if (size % 5 > 0) remainder = true;//if a remainder exists add one
			size =   Math.floor(size/ 5);//how many lines
			if (remainder == true) size++;
			if (size == 0) size = 1;//there is only one line. 
			for (let s = 0; s < size; s++)
			{
				data[2] = 0;data[3] = 0;data[4] = 0;data[5] = 0;data[6] = 0;//clear
				if (s == (size-1) ) { data[1] = 0xff; } else {data[1] = pos; pos += 5; }
				if (c < sendLine.length) data[2] = bytes[c]; c++;
				if (c < sendLine.length) data[3] = bytes[c]; c++;
				if (c < sendLine.length) data[4] = bytes[c]; c++;
				if (c < sendLine.length) data[5] = bytes[c]; c++;
				if (c < sendLine.length) data[6] = bytes[c]; c++;
				 await  BlissBox_writeFeature(0x12, new Uint8Array(data)); //loop while true as true means busy. 
			}
		}

 
		let timer=0;
		let reply = 0;
		for ( ; timer < 10; timer++)
		{
			reply = await BlissBox_readFeature(0x16);
			if (reply[0]-3 == Number(document.getElementById("player").textContent) && reply[1] == 1) break; //1= use case native. 
				
		}
		if (timer == 10) alert("Failed to get reply from Talk to Function");
		else 
		{
			logInputReport("Sent to Controller    ", bytes.slice(1));
			logInputReport("Replay From Controller", reply.slice(3) );
		}
	};
		
 	document.querySelector("#hsd").addEventListener("click", function()
	{
		const value = this.querySelector(".value");
		value.textContent = (value.textContent === "ON") ? "OFF" : "ON";
		BlissBox_setModes();
	});
 
 	document.querySelector("#udlr").addEventListener("click", function()
	{
		const value = this.querySelector(".value");
		value.textContent = (value.textContent === "ON") ? "OFF" : "ON";
		BlissBox_setModes();
	});
 
 	document.querySelector("#dac").addEventListener("click", function()
	{
		const value = this.querySelector(".value");
		value.textContent = (value.textContent === "ON") ? "OFF" : "ON";
		BlissBox_setModes();
	});
 
 	document.querySelector("#apd").addEventListener("click", function()
	{
		const value = this.querySelector(".value");
		value.textContent = (value.textContent === "ON") ? "OFF" : "ON";
		BlissBox_setModes();
	});

}
async function BlissBox_writeFeature (id, data)  
{ 
 	await  hid.sendFeature(id,  new Uint8Array(data) );	
}

async function BlissBox_readFeature(id)
{
    const data = await  hid.receiveFeature(id);
    return new Uint8Array(data.buffer || data);
}

async function BlissBox_getPressure( )
{

	const data = await BlissBox_readFeature(  0x17);
	document.getElementById("pressureBtn1").selectedIndex = data[12]-1;
	document.getElementById("pressureBtn2").selectedIndex = data[13]-1;
	document.getElementById("pressureBtn3").selectedIndex = data[14]-1;
	document.getElementById("pressureBtn4").selectedIndex = data[15]-1;
	document.getElementById("BBPressurePopup").style.display = "block";
	

	pressureSave.onclick =  async () =>   {
		let d = [ 0x20, 0, 0, document.getElementById("pressureBtn1").selectedIndex + 1,
							  document.getElementById("pressureBtn2").selectedIndex + 1,
							  document.getElementById("pressureBtn3").selectedIndex + 1,
							  document.getElementById("pressureBtn4").selectedIndex + 1
							, 0 ];  
		await BlissBox_writeFeature(  0x12, d);//setup pressure
		BlissBox_save( );

	}
	
	pressureApply.onclick =  async () =>   {
		let d = [ 0x20, 0, 0, document.getElementById("pressureBtn1").selectedIndex + 2,
							  document.getElementById("pressureBtn2").selectedIndex + 2,
							  document.getElementById("pressureBtn3").selectedIndex + 2,
							  document.getElementById("pressureBtn4").selectedIndex + 2
							, 0 ];  
		await BlissBox_writeFeature(  0x12, d);//setup pressure
	}
}
async function BlissBox_getEEProm()
{
	document.getElementById("BBeepromPopup").style.display = "block";
	const data = await BlissBox_readFeature(  0x17);
	document.querySelectorAll(".BBhex").forEach((el, i) => {
		el.value = data[i] ?? "00";
	});
}
async function BlissBox_save()
{
	let save_data = [ 1, 0, 0, 0xff, 1, 0, 0, 0 ]; //1 for save, need to fill in first byte with the bits/
	await BlissBox_writeFeature(  0x12, save_data);
}
async function BlissBox_setModes( )
{
	let modes = 0;
	if ( document.querySelector("#hsd  .value").textContent == "ON" ) modes |= 0x08; else  modes &= ~0x08;
	if ( document.querySelector("#udlr .value").textContent == "ON" ) modes |= 0x10; else  modes &= ~0x10;
	if ( document.querySelector("#dac  .value").textContent == "ON" ) modes |= 0x20; else  modes &= ~0x20;
	if ( document.querySelector("#apd  .value").textContent == "ON" ) modes |= 0x40; else  modes &= ~0x40;
 
	let save_data = [ 1, 0, 0, modes, 0, 0, 0, 0 ]; //1 for save, need to fill in first byte with the bits/
	await BlissBox_writeFeature(  0x12, save_data);
}
async function BlissBox_rumbleTest()
{
	let d = [ 4, 0, 0, 2, 255, 200, 0, 0 ]; //Rid, type, 0, 0,  command, amount, loop, padding
	await BlissBox_writeFeature(  0x12, d);	
}			
async function BlissBox_restoreDefaults()
{			
	let def_data = [ 1, 0, 0, 0xff, 2, 0, 0, 0 ]; //2 restore defaults
	await BlissBox_writeFeature(  0x12, def_data);
}
async function BlissBox_hotKey()
{			
	let def_data = [ 0x80, 0, 0, 0, 0, 0, 0, 0 ]; //2 restore defaults
	await BlissBox_writeFeature(  0x12, def_data);
}


async function BlissBox_range()
{		
	const data = await BlissBox_readFeature(  0x17);
 
	if ( data[11] & 1) document.getElementById("chkN64").checked = true       ; else  document.getElementById("chkN64").checked = false;
	if ( data[11] & 2)document.getElementById("chkNunChuck").checked = true   ; else  document.getElementById("chkNunChuck").checked = false;
	if ( data[11] & 4) document.getElementById("chkGameCube").checked = true  ; else  document.getElementById("chkGameCube").checked = false;
	if ( data[11] & 8) document.getElementById("chkAtari5200").checked = true ; else  document.getElementById("chkAtari5200").checked= false;

	
	document.getElementById("BBRangePopup").style.display = "block";	 
	document.getElementById("txtRightLimit").onkeyup   = (event) =>
	{
		if ( Number(document.getElementById("txtRightLimit").value) > 128 ) document.getElementById("txtRightLimit").value = 128  ;
		if ( Number(document.getElementById("txtRightLimit").value) < 0 ) document.getElementById("txtRightLimit").value = 0  ;
	}
	document.getElementById("txtLeftLimit").onkeyup   = (event) =>
	{
		if ( Number(document.getElementById("txtLeftLimit").value) > -1 ) document.getElementById("txtLeftLimit").value = -1  ;
		if ( Number(document.getElementById("txtLeftLimit").value) < -128 ) document.getElementById("txtLeftLimit").value = -128   ;
	}
	document.getElementById("btnDefaultValues").onclick = () =>
	{
		document.getElementById("txtLeftLimit").value = -128;
		document.getElementById("txtRightLimit").value = 128;
	};
	document.getElementById("btnN64").onclick = () =>
	{
		document.getElementById("txtRightLimit").value = 80;
		document.getElementById("txtLeftLimit").value = -80;
	}
	document.getElementById("btnGC").onclick = () =>
	{
		document.getElementById("txtRightLimit").value = 95;
		document.getElementById("txtLeftLimit").value = -95;
	}
	document.getElementById("btnAtari").onclick = () =>
	{
		document.getElementById("txtRightLimit").value = 98;
		document.getElementById("txtLeftLimit").value = -98;
	}
	document.getElementById("btnWii").onclick = () =>
	{
		document.getElementById("txtRightLimit").value= 95;
		document.getElementById("txtLeftLimit").value = -95;
	}
	document.getElementById("btnSetControllers").onclick = () =>
	{
		let bit=0;
		if (document.getElementById("chkN64").checked) bit |= 1;
		if (document.getElementById("chkNunChuck").checked) bit |= 2;
		if (document.getElementById("chkGameCube").checked) bit |= 4;
		if (document.getElementById("chkAtari5200").checked) bit |= 8;
		
		let def_data = [ 6, 0, 0, bit, 0, 0, 0, 0 ]; //2 restore defaults
		BlissBox_writeFeature(  0x12, def_data);
		 
	}
	document.getElementById("btnCurrentValues").onclick = () =>
	{
		const physicalMin = 0;
		const physicalMax = 255;
		const userMin = Number(document.getElementById("txtLeftLimit").value);
		const userMax = Number(document.getElementById("txtRightLimit").value);
		const rangeData = new Uint8Array(257);
		rangeData[0] = 0xFF; //size
		let count = 1;
		for (let division = 1; division < 257; division++) 
		
		{
			if (division === 128) rangeData[division] = 128;
			if (division < userMin + 128) rangeData[division] = 0;	else if (division > userMax + 128) rangeData[division] = 255;
			else 
			{
				let result = ((physicalMin - physicalMax) / (userMin - userMax) * count) - 1;
				let test = Math.round(result);
				if (test > 255) result = 255;
				rangeData[division] = Math.trunc(result);
				count++;
			}
		}
 
	
		//fix data report
		let data = new Uint8Array(8);
        data[0] = 0x25;//command
        data[1] = 0;// (1=pos,0 for header )
        data[2] = 0; ;//size 
        data[3] = 0xFF;//size
        data[4] = 2;//use case range
        data[5] = rangeData[1]; 
        data[6] = rangeData[2];  
		  BlissBox_writeFeature(0x12, new Uint8Array(data));//send header
		
		let c = 3;//Where data starts. 
		let size = 0xFF;
		let pos = 2;//First two have data 0,1, so pos is now 2
		size -= 2;//already sent 2
		size += 1;//array starts at 0
		size = Math.floor(size/ 5);//how many lines
		for (let s = 0; s < size; s++)
		{
			data[2] = 0;data[3] = 0;data[4] = 0;data[5] = 0;data[6] = 0;//clear
			if (s == (size-1) ) { data[1] = 0xff; } else {data[1] = pos; pos += 5; }
			if (c < 257) data[2] = rangeData[c]; c++;
			if (c < 257) data[3] = rangeData[c]; c++;
			if (c < 257) data[4] = rangeData[c]; c++;
			if (c < 257) data[5] = rangeData[c]; c++;
			if (c < 257) data[6] = rangeData[c]; c++;
			    BlissBox_writeFeature(0x12, new Uint8Array(data)); //loop while true as true means busy. 
		}

	};
	
	
}
async function BlissBox_readBlissBoxAdapterInfo( )
{	
 
	try
	{
		const bytes = await BlissBox_readFeature(  0x11);		
	
		if (bytes[0] == 121) 
		{
 			if ( bars == null )
			{
 
				bars = setInterval ( async () =>
				{
					if (! document.getElementById("BBpressurebox") ) return; 
					const bar = document.querySelectorAll(".BBbar");
					try
					{
						const p = await BlissBox_readFeature(  0x15);
						for (let b = 0; b < 12; b++)
						{
							
							const level = Math.round(p[b+1] * 100 / 255); // 0-255 -> 0-100
							bar[b].style.setProperty("--level", level);
						}
					}
					catch (e) 
					{
						clearInterval(bars);
						bars = null
					}
	 
					
				}, 100);
			}
		} 
		else 
		{
			clearInterval(bars);
			bars = null
		}

		if ( BlissBox_lookUpName(bytes[0]) !=  currentController ) 
		{
		
			controllerSelect.value =  currentController = BlissBox_lookUpName(bytes[0]);
			loadControllerLayout( currentController);
		}
		
		if (bytes[0] == 121) 
		{ 
			document.getElementById("hidpressurebox").classList.add("show");
			document.getElementById("BBpressurebox").classList.add("show");
		}

		document.getElementById("controllerId").textContent = bytes[0];
		document.getElementById("major").textContent = bytes[2];
		document.getElementById("minor").textContent =  bytes[4]  ;
		document.getElementById("player").textContent = bytes[3]-3;

		document.querySelector("#hsd .value").textContent = bytes[1] & 0x08 ? "ON" : "OFF";//Hotswap Disable
		document.querySelector("#udlr .value").textContent = bytes[1] & 0x10 ? "ON" : "OFF";//UDLR mode
		document.querySelector("#dac .value").textContent = bytes[1] & 0x20 ? "ON" : "OFF";//Analog to D-pad Or Disable all combos(
		document.querySelector("#apd .value").textContent = bytes[1] & 0x40 ? "ON" : "OFF";//Bit 6: Autopause Disab
		document.querySelector("#dmo .value").textContent = bytes[1] & 0x80 ? "ON" : "OFF";//Bit 7: d-pad only mode
	}
	catch (e) 
	{ 
		console.warn("Adapter read failed:", e);
	}
	
	document.querySelector(".BBbutton-grid").addEventListener("click", async  (e) => 
	{
		const btn = e.target.closest("button");
		if (!btn) return;

		const action = btn.dataset.action;

		switch (action) {
			case "rumble":
				BlissBox_rumbleTest();
				break;
				
			case "memcard":
				alert("Unsupported at the moment as this is a bit of an everkill, use the API tool. ");
				break;

			case "stick_range":
				BlissBox_range();
				break;

			case "hotkey":
				BlissBox_hotKey();
				break;

			case "talk":
				if ( document.getElementById("controllerId").innerText != "9" || //maybe better to use layout name?
				document.getElementById("controllerId").innerText != "16" ||
				document.getElementById("controllerId").innerText != "16" ||
				document.getElementById("controllerId").innerText != "18" ||
				document.getElementById("controllerId").innerText != "19" ||
				document.getElementById("controllerId").innerText != "35" ||
				document.getElementById("controllerId").innerText != "83" ||
				document.getElementById("controllerId").innerText != "115" ||
				document.getElementById("controllerId").innerText != "119" ||
				document.getElementById("controllerId").innerText != "121" ||
				document.getElementById("controllerId").innerText != "75" ||
				document.getElementById("controllerId").innerText != "73" ||
				document.getElementById("controllerId").innerText != "74" )
 
					document.getElementById("BBTalkPopup").style.display = "block";	 
				break;

			case "mapper":
				alert("Unsupported at the moment as this tool has its own mapping, use the API tool. ");
				break;

			case "save":
				BlissBox_saveModes ();	
				break;

			case "defaults":
				BlissBox_restoreDefaults();
				break;

			case "pressure":
				if ( document.getElementById("controllerId").innerText != "121" ) BlissBox_getPressure ();
				break;

			case "eeprom":
				BlissBox_getEEProm (hid);				
				break;
		}
	});
 	
}	

 