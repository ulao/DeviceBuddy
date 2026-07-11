//Bliss-Box Device Buddy
//see Copyright in index.html
//https://bliss-box.com

  function BlissBox_lookUpName(id)
{
	if (id == 0  ) return "atari2600"  ;
	if (id == 1  ) return "COL"           ;
	if (id == 2  ) return "gx4000"        ;
	if (id == 3  ) return "SATURN_DIGITAL";
	if (id == 4  ) return "A7800"         ;
	if (id == 5  ) return "VEC"           ;
	if (id == 6  ) return "A5200"         ;
	if (id == 7  ) return "HPD"		      ;
	if (id == 8  ) return "SATURN_ANALOG" ;
	if (id == 9  ) return "gamecube"      ;
	if (id == 10 ) return "atmark" 		  ;
	if (id == 11 ) return "jaguar"	          ;
	if (id == 12 ) return "DRV_CNT" 	;
	if (id == 13 ) return "WII_NUNCHUK"  ;
	if (id == 14 ) return "INTELI" 		  ;
	if (id == 15 ) return "dreamcast" 	;
	if (id == 16 ) return "dreamcast"	    ;
	if (id == 17 ) return "NES"	          ;
	if (id == 18 ) return "GC_WHEEL"	;
	if (id == 19 ) return "nintendo64";
	if (id == 20 ) return "GEN_3" 		  ;
	if (id == 21 ) return "GEN_6" 		  ;
	if (id == 22 ) return "SMS"	          ;
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
	if (id == 240) return "playstation"	;
	
}

let bars = null;//interval for pressure bars
 

  function BlissBox_DeInit ()
{
	clearInterval( BlissBoxAdapterTimer);
	clearInterval(bars);
	bars=null;
}

  async function BlissBox_Init ()
{
	const html = await fetch("blissbox.html").then(r => r.text());
	document.getElementById("blissbox-container").innerHTML = html;
 
     BlissBoxAdapterTimer = setInterval(() => 
	{
        BlissBox_readBlissBoxAdapterInfo( );

    }, 500);
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
 
 async function getLatestVersion() {
    const response = await fetch("http://spawnlinux.ddns.net/Downloads/GPA/");
    const html = await response.text();

    const regex = /GPA\s+(\d+(?:\.\d+)*)\.zip/g;

    let match;
    let latest = null;

    while ((match = regex.exec(html)) !== null) {
        const version = match[1];

        if (!latest || compareVersions(version, latest) > 0) {
            latest = version;
        }
    }

    return latest;
}
function compareVersions(a, b) {
    const pa = a.split(".").map(Number);
    const pb = b.split(".").map(Number);

    const len = Math.max(pa.length, pb.length);

    for (let i = 0; i < len; i++) {
        const na = pa[i] || 0;
        const nb = pb[i] || 0;

        if (na > nb) return 1;
        if (na < nb) return -1;
    }

    return 0;
}

  async function BlissBox_getPressure( )
{
	if ( document.getElementById("controllerId").innerText != "121" )	return;

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
		await BlissBox_writeFeature( hid, 0x12, d);//setup pressure
		BlissBox_saveModes( hid);

	}
	
	pressureApply.onclick =  async () =>   {
		let d = [ 0x20, 0, 0, document.getElementById("pressureBtn1").selectedIndex + 2,
							  document.getElementById("pressureBtn2").selectedIndex + 2,
							  document.getElementById("pressureBtn3").selectedIndex + 2,
							  document.getElementById("pressureBtn4").selectedIndex + 2
							, 0 ];  
		await BlissBox_writeFeature( hid, 0x12, d);//setup pressure
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
  async function BlissBox_saveModes()
{
	let save_data = [ 1, 0, 0, 0xff, 1, 0, 0, 0 ]; //1 for save, need to fill in first byte with the bits/
	await BlissBox_writeFeature( hid, 0x12, save_data);
}
  async function BlissBox_rumbleTest()
{
	let d = [ 4, 0, 0, 2, 255, 200, 0, 0 ]; //Rid, type, 0, 0,  command, amount, loop, padding
	await BlissBox_writeFeature( hid, 0x12, d);	
}			
  async function BlissBox_restoreDefaults()
{			
	let def_data = [ 1, 0, 0, 0xff, 2, 0, 0, 0 ]; //2 restore defaults
	await BlissBox_writeFeature( hid, 0x12, def_data);
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
					}
	 
					
				}, 100);
			}
		} 
		else 
		{
			clearInterval(bars);
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

		let latest = await getLatestVersion();
		
		document.getElementById("controllerId").textContent = bytes[0];
		document.getElementById("major").textContent = bytes[2];
		document.getElementById("minor").textContent = ( latest.split(".")[1] < bytes[4]) ? bytes[4] + " Newer version avilable"  : bytes[4]  ;
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
				console.log("MemCard clicked");
				break;

			case "stick_range":
				console.log("Stick Range clicked");
				break;

			case "hotkey":
				console.log("Hotkey clicked");
				break;

			case "talk":
				console.log("Talk clicked");
				break;

			case "mapper":
				console.log("Mapper clicked");
				break;

			case "save":
				BlissBox_saveModes ();	
				break;

			case "defaults":
				BlissBox_restoreDefaults();
				break;

			case "pressure":
				BlissBox_getPressure ();
				break;

			case "eeprom":
				BlissBox_getEEProm (hid);				
				break;
		}
	});

		
}	
