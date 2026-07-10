//Bliss-Box Device Buddy
//see Copyright in index.html
//https://bliss-box.com
export function BlissBox_lookUpName(id)
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
	if (id == 9  ) return "gamecube"            ;
	if (id == 10 ) return "atmark" 		  ;
	if (id == 11 ) return "JAG"	          ;
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
	if (id == 25 ) return "THREE_DO"	;
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

export async function BlissBox_writeFeature (hid, id, data)  
{ 
	await hid.sendFeature(id,  new Uint8Array(data) );	
}

export async function BlissBox_readFeature(hid, id)
{
    const data = await hid.receiveFeature(id);
    return new Uint8Array(data.buffer || data);
}

export async function BlissBox_getPressure(hid)
{
	if ( document.getElementById("controllerId").innerText != "121" )	return;

	const data = await BlissBox_readFeature(hid, 0x17);
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
		await BlissBox_writeFeature(hid, 0x12, d);//setup pressure
		BlissBox_saveModes(hid);

	}
	
	pressureApply.onclick =  async () =>   {
		let d = [ 0x20, 0, 0, document.getElementById("pressureBtn1").selectedIndex + 2,
							  document.getElementById("pressureBtn2").selectedIndex + 2,
							  document.getElementById("pressureBtn3").selectedIndex + 2,
							  document.getElementById("pressureBtn4").selectedIndex + 2
							, 0 ];  
		await BlissBox_writeFeature(hid, 0x12, d);//setup pressure
	}
}
export async function BlissBox_getEEProm(hid)
{
	document.getElementById("BBeepromPopup").style.display = "block";
	const data = await BlissBox_readFeature(hid, 0x17);
	document.querySelectorAll(".BBhex").forEach((el, i) => {
		el.value = data[i] ?? "00";
	});
}
export async function BlissBox_saveModes(hid)
{
	let save_data = [ 1, 0, 0, 0xff, 1, 0, 0, 0 ]; //1 for save, need to fill in first byte with the bits/
	await BlissBox_writeFeature(hid, 0x12, save_data);
}
export async function BlissBox_rumbleTest(hid)
{
	let d = [ 4, 0, 0, 2, 255, 200, 0, 0 ]; //Rid, type, 0, 0,  command, amount, loop, padding
	await BlissBox_writeFeature(hid, 0x12, d);	
}			
export async function BlissBox_restoreDefaults(hid)
{			
	let def_data = [ 1, 0, 0, 0xff, 2, 0, 0, 0 ]; //2 restore defaults
	await BlissBox_writeFeature(hid, 0x12, def_data);
}