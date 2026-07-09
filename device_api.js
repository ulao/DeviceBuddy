//Bliss-Box Device Buddy
//see Copyright in index.html
//https://bliss-box.com

// chrome.exe --allow-file-access-from-files --disable-web-security --user-data-dir="C:\temp\chrome_dev"
//"C:\Program Files\Opera\launcher.exe" --allow-file-access-from-files --disable-web-security --disable-site-isolation-trials --user-data-dir="C:\temp\opera_dev"
//"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe" --allow-file-access-from-files --disable-web-security --disable-site-isolation-trials --user-data-dir="C:\temp\edge_dev"



//firefox requres  CORS Everywhere to be installed and  privacy.file_unique_origin   changed to flause, kind of a pain
import { WebHIDDevice } from "./webhid.js";
import { BlissBox_readFeature } from "./bliss_box_api.js";
import { BlissBox_writeFeature } from "./bliss_box_api.js";
import { BlissBox_lookUpName } from "./bliss_box_api.js";
import { BlissBox_getPressure } from "./bliss_box_api.js";
import { BlissBox_getEEProm } from "./bliss_box_api.js";
import { BlissBox_saveModes } from "./bliss_box_api.js";
import { BlissBox_rumbleTest } from "./bliss_box_api.js";
import { BlissBox_restoreDefaults } from "./bliss_box_api.js";



document.getElementById("year").textContent = new Date().getFullYear();


const Controllers =
[
    { file:"3do",		   name:"3DO" },
    { file:"atari2600",	   name:"Atari 2600" },
    { file:"atari5200",	   name:"Atari 5200" },
    { file:"atari7800",	   name:"Atari 7800" },
    { file:"cdi",		   name:"Philips CD-i" },
    { file:"dreamcast",	   name:"Sega Dreamcast" },
    { file:"gamecube",	   name:"Nintendo GameCube" },
    { file:"genesis3",	   name:"Sega Genesis (3 Button)" },
    { file:"genesis6",	   name:"Sega Genesis (6 Button)" },
    { file:"jaguar",	   name:"Atari Jaguar" },
    { file:"neogeo",	   name:"Neo Geo" },
    { file:"nintendo",	   name:"Nintendo Entertainment System" },
    { file:"nintendo64",   name:"Nintendo 64" },
    { file:"pippin", 	   name:"Apple Pippin" },
    { file:"playstation",  name:"Sony PlayStation" },
    { file:"playstation4",  name:"Sony PlayStation 4" },
    { file:"saturn", 	   name:"Sega Saturn" },
    { file:"supernintendo",name:"Super Nintendo" },
    { file:"turbografx16", name:"TurboGrafx-16" },
    { file:"virtualboy",   name:"Virtual Boy" },
    { file:"atmark",name:"Attmark Pippin" } 
];

let currentController = "playstation"; 						//controller in use
let currentMapper = null;			   						//current loaded mapper
let controllerBody = null; 			   						//id for the controller html object
let activeInputListener = null;								//listner for hid
let layoutLoadToken = 0;									//duplicit loader preventor. 
let controllerParts = [];									//parts of the controlelr view
let BlissBoxAdapterTimer = null;							//how often we read Bliss-Box data. 
let isBlissBox = false;										//Bliss-Box flag
let devices = [];											//connected devices
let lastReport = "";										//log limmiter
const reportLines = [];										//log lines array
const hid = new WebHIDDevice();								//handel to webhid
const deviceListEl = document.getElementById("deviceList");	//html element
const connBtn = document.getElementById("connBtn");         //html element
const status = document.getElementById("status");           //html element
const devName = document.getElementById("devName");         //html element
const controller = document.getElementById("controller");   //html element

let bars = null;
init();

async function sendManualReport()
{
    const id = Number(document.getElementById("outId").value);
    const txt = document.getElementById("outBytes").value.trim();
    const bytes = txt ? txt.split(/\s+/).map(x => parseInt(x, 16)) : [];

    await hid.sendReport(id, new Uint8Array(bytes));

    log("Report Sent");
}


async function readFeature(value)
{
    const id = Number(document.getElementById("featId").value);
    const data = await hid.receiveFeature(id);

	
    log(toHex(data.buffer));
}

async function selectDevice(dev)
{
    try
    {

		const hidBox = document.getElementById("hidpressurebox");
		if (hidBox) {
			hidBox.classList.remove("show");
		}

		const bbBox = document.getElementById("BBpressurebox");
		if (bbBox) {
			bbBox.classList.remove("show");
		}
			
        if (hid.device && hid.device.opened)      await hid.device.close();
		clearInterval(BlissBoxAdapterTimer);
        BlissBoxAdapterTimer = null;
		document.getElementById("blissbox-container").innerHTML = "";
 	
		let name = dev.productName;
		//name patcher, 
		if (dev.vendorId == 0x054c && dev.productId == 0x05c4) currentController = name = "playstation4";

        if (!dev.opened)
		{
			try
			{
				await dev.open();
			}
			catch (e) 
			{
				const key = deviceKey(dev);

				// optionally also remove from UI list source if you want it gone visually
				devices = devices.filter(d => deviceKey(d) !== key);

				// re-render list so UI updates immediately
				renderDeviceList();

				connBtn.onclick();

				return; // THIS is required
			}
		}
 
        hid.device = dev;

        status.textContent = "Connected";
        status.style.color = "green";
        devName.textContent = name;
 
        if (activeInputListener)  hid.removeInputListener(activeInputListener);
 
        activeInputListener = onInputReport;
        hid.addInputListener(activeInputListener);
        await loadMapper();
        await loadControllerLayout(currentController);
        document.getElementById("selectOverlay")?.classList.add("hidden");


		isBlissBox = (dev.vendorId === 0x16d0);
		if (isBlissBox) BlissBoxInit(dev); else BlissBoxdeInit(dev); 
			
    }
    catch (e)
    {
        console.error(e);
    }
}

	
async function loadMapper()
{
    try
    {
        const key = "mapper_" + currentController;
        const cached = localStorage.getItem(key);
 

        if (cached && document.getElementById("mapperCustom").checked)
        {
            console.log("LOADING CUSTOM MAPPER FROM CACHE");
            currentMapper = parseMapper(cached);

            return true;
        }
 
		let res = null;
		res = await fetch("default.map", { cache: "no-store" });
	
        if (!res.ok) throw new Error("default.map missing");

        const text = await res.text();
 
  
        currentMapper = parseMapper(text);
 

        return true;
    }
    catch (e){   }
}

async function loadKnownDevices()
{
    const list = await navigator.hid.getDevices();

    devices = list.filter(dev =>
    {
        return dev.collections?.some(c =>
            c.usagePage === 0x01 &&
            (c.usage === 0x04 || c.usage === 0x05)
        );
    });

    renderDeviceList();
}

async function autoSelector(name)
{ 
 
	if (name.toLowerCase().includes("gamer-pro"))
	{
		const data = await BlissBox_readFeature(hid, 0x11);
		loadControllerLayout(BlissBox_lookUpName(data[0])); 		
	}
	else loadControllerLayout(name); 	
 
}


async function startup()
{
    await loadKnownDevices();

	navigator.hid.addEventListener("connect", async (event) => {
		const dev = event.device;
		await dev.open();
		await selectDevice(dev); 
	});

	navigator.hid.addEventListener("disconnect", (event) =>
	{
		if (hid.device && deviceKey(hid.device) === deviceKey(event.device))
		{
			clearInterval(BlissBoxAdapterTimer);
			BlissBoxAdapterTimer = null;
			hid.device = null;
		}
	});

    updateStatusHint();

}


async function loadControllerLayout(file)
{
    const myToken = ++layoutLoadToken;

    resetControllerUI();

    const url = "controllers/"+file+".layout";

    let text;

    // Load the controller file.
    try
    {
 
        const response = await fetch(url, { cache: "no-store" });
        if (!response.ok) throw new Error();
        text = await response.text();
    }
    catch
    {
        alert(
            `Unable to load controller layout.\n\n` +
            `Add the Missing file:\n${url}`  
        );

        return;
    }

    try
    {
        // Another load started while we were waiting.
        if (myToken !== layoutLoadToken)      return;

        const config = parseControllerText(text);

        buildController(config);
 
        controllerSelect.value = file;

        controller._bg.style.backgroundImage = `url(controller_images/${file}.png)`;

        document.getElementById("selectOverlay")?.classList.add("hidden");

        setReadyState();
    }
    catch (e)
    {
        console.error(e);

        alert(
            `Error processing controller layout.\n\n` +
            `${e.message}`
        );
    }
 
	const cached = localStorage.getItem( "mapper_" + currentController);
	if (cached)
	{ 
		document.getElementById("mapperCustom").checked = true;
		currentMapper = parseMapper(cached);
	} else document.getElementById("mapperDefault").checked = true;
		
}

async function readBlissBoxAdapterInfo()
{	
 
	try
	{
		const bytes = await BlissBox_readFeature(hid, 0x11);			
		if (bytes[0] == 121) 
		{
 			if ( bars == null )
			{
				bars = setInterval ( async () =>
				{
					if (! document.getElementById("BBpressurebox") ) return; 
					const bar = document.querySelectorAll(".BBbar");
					const p = await BlissBox_readFeature(hid, 0x15);
					for (let b = 0; b < 12; b++)
					{
						
						const level = Math.round(p[b+1] * 100 / 255); // 0-255 -> 0-100
						bar[b].style.setProperty("--level", level);
					}
				}, 100);
			}
		} 
		else 
		{
			clearInterval(bars);
		}

		if ( BlissBox_lookUpName(bytes[0]) != currentController ) 
		{
		
			controllerSelect.value = currentController = BlissBox_lookUpName(bytes[0]);
			loadControllerLayout(currentController);
		}
		
		if (bytes[0] == 121) 
		{ 
			document.getElementById("hidpressurebox").classList.add("show");
			document.getElementById("BBpressurebox").classList.add("show");
		}
		
		document.getElementById("controllerId").textContent = bytes[0];
		document.getElementById("major").textContent = bytes[2];
		document.getElementById("minor").textContent = bytes[4];
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
				BlissBox_rumbleTest(hid);
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
				BlissBox_saveModes (hid);	
				break;

			case "defaults":
				BlissBox_restoreDefaults(hid);
				break;

			case "pressure":
				BlissBox_getPressure (hid);
				break;

			case "eeprom":
				BlissBox_getEEProm (hid);				
				break;
		}
	});

		
}	

async function selectMapperFile()
{
    const input = document.createElement("input");

    input.type = "file";
    input.accept = ".map";

    return new Promise(resolve =>
    {
        input.onchange = async () =>
        {
            if (!input.files.length)
            {
                resolve(null);
                return;
            }

            const text = await input.files[0].text();
            resolve(text);
        };

        input.click();
    });
}

async function BBloadUI()
{ 
	const html = await fetch("blissbox.html").then(r => r.text());
	document.getElementById("blissbox-container").innerHTML = html;
}
	

function isBootloader(d)
{
    return d.vendorId === 0x04FB;
}
 
function downloadMapperTemplate( )
{
    const text =
`
{
    BTN_1=0:0
    BTN_2=0:0
    BTN_3=0:0
    BTN_4=0:0
    BTN_SELECT=0:0
    BTN_START=0:0
    BTN_L1=0:0
    BTN_R1=0:0
    BTN_L2=0:0
    BTN_R2=0:0
    BTN_5=0:0
    BTN_6=0:0
    BTN_7=0:0
    BTN_8=0:0
    BTN_L3=0:0
    BTN_R3=0:0
	BTN_MISC1=0:0
	BTN_MISC2=0:0
    BTN_HOME=0:0
    BTN_MISC3=0:0
    BTN_MISC4=0:0
    BTN_MISC5=0:0
    BTN_MISC6=0:0
    BTN_MISC7=0:0
	LEFTSTICK=0:0
	RIGHTSTICK=0:0
	LEFTTRIGGER=0
	RIGHTTRIGGER=0
	SLIDER=0
	DIAL=0
	POV=0:0,1,2,3,4,5,6,7
}
`;

    const blob = new Blob([text], { type: "text/plain" });

    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `default.map`;
    a.click();

    URL.revokeObjectURL(a.href);
}
function BlissBoxdeInit (dev)
{
	clearInterval(bars);
	bars=null;
}
function BlissBoxInit(dev)
{
	BBloadUI();
	
    BlissBoxAdapterTimer = setInterval(() => 
	{
        readBlissBoxAdapterInfo();

    }, 500);
}
	
function doCasech(text)
{
	if (currentController == null) return;
    const key = "mapper_" + currentController;
	localStorage.removeItem(key);
    localStorage.setItem(key, text);
}

function init()
{
	for (const controller of Controllers)
	{
		const option = document.createElement("option");

		option.value = controller.file;
		option.textContent = controller.name;

		controllerSelect.appendChild(option);
	}
	controllerSelect.value = currentController;
	loadControllerLayout(currentController);
		
	connBtn.onclick = async () => {
		try {
			const newDevices = await navigator.hid.requestDevice({
				filters: [
					{ usagePage: 0x01, usage: 0x05 }, // Gamepad
					{ usagePage: 0x01, usage: 0x04 }  // Joystick
				]
			});

			if (newDevices.length) {
				await selectDevice(newDevices[0]);
			}

			await loadKnownDevices();
		} catch (e) {
			console.warn(e);
		}
	}

	btnDownload.onclick =  async () =>   {
		document.getElementById("mapperCustom").checked = true;
		downloadMapperTemplate();
		const text = await selectMapperFile();
		if (!text) return false;
		currentMapper = parseMapper(text);
	}
	
	btnUpload.onclick =  async () => 	  {
		document.getElementById("mapperCustom").checked = true;
		const text = await selectMapperFile();
		if (!text) return false;
		currentMapper = parseMapper(text);
		doCasech(text);
	}
	btnClear.onclick =  async () => 	  {
		  localStorage.removeItem( "mapper_" + currentController);
			document.getElementById("mapperDefault").checked = true;
	}
			
	controllerSelect.addEventListener("change", (e) =>
	{

		loadControllerLayout(e.target.value);
	});
	
	window.addEventListener("DOMContentLoaded", () =>
	{
		startup();
	});
	loadKnownDevices(); 
 
	let start = setInterval ( async () =>
	{
		 selectDevice(devices[0])
		 clearInterval(start);
	}, 100);
	

	
}

function showPopup(message)
{
    const box = document.createElement("div");

    box.style.position = "fixed";
    box.style.left = "50%";
    box.style.top = "50%";
    box.style.transform = "translate(-50%, -50%)";
    box.style.background = "#222";
    box.style.color = "#fff";
    box.style.padding = "20px";
    box.style.border = "2px solid red";
    box.style.zIndex = "999999";
    box.style.fontFamily = "sans-serif";
    box.style.whiteSpace = "pre-line";

    box.textContent = message;

    document.body.appendChild(box);

    setTimeout(() => box.remove(), 4000);
}
function deviceKey(dev)
{
     return `${dev.vendorId}-${dev.productId}`;
}

function renderDeviceList()
{
    deviceListEl.innerHTML = "";

    if (!devices.length)
    {
        deviceListEl.textContent = "No devices found";
        return;
    }

    for (const dev of devices)
    {
        const btn = document.createElement("button");
        btn.textContent = dev.productName || "Unknown";

        btn.onclick = () => selectDevice(dev);

        deviceListEl.appendChild(btn);
    }
}


function updateStatusHint()
{
    if (devices.length > 0)
    {
        status.textContent = "Select Device";
        status.style.color = "orange";
    }
    else
    {
        status.textContent = "Click Load Device";
        status.style.color = "gray";
    }
}

function setReadyState()
{
    if (!hid.device || controllerParts.length === 0) return;

    const overlay = document.getElementById("selectOverlay");
    if (overlay) overlay.classList.add("hidden");

    status.textContent = "Ready";
    status.style.color = "green";
}
 
function resetControllerUI()
{
    controller.replaceChildren(); // stronger than innerHTML

    controllerParts.length = 0;

    pollLog.textContent = "";
}

function parseMapper(text)
{

    const lines = text.split(/\r?\n/)
        .map(l => l.trim())
        .filter(Boolean);

				
				
    const mapper =
    {
        button: {},
        trigger: {},
		analog: {},
        POV: {}
    };

    for (const line of lines)
    {

	
        // ignore comments and braces
        if (line.startsWith("//") || line === "{" || line === "}")
            continue;
 
        const [key, value] = line.split("=")
            .map(s => s.trim());

        if (!key || !value)
            continue;
	

		if (key.startsWith("POV"))
		{
		 		
			let [byte, data] = value.split(":");
			mapper.POV[key] =
			{
				byte,
				data
			};
            continue;
		}
        // Analog values
        if (key == "LEFTTRIGGER" || key == "RIGHTTRIGGER" )
        { 
 
			mapper.trigger[key] = Number(value);
 
            continue;
        }
		if (key == "LEFTSTICK" || key == "RIGHTSTICK" )
        { 
			let [x, y] = value.split(":").map(Number);
			mapper.analog[key] =
			{
				x,
				y
			};
            continue;
        }
		if ( key == "SLIDER" || key == "DIAL" )
        { 
            mapper.analog[key] = Number(value);
            continue;
        }

        // Buttons
       if (key.startsWith("BTN_"))
        {
            let [byte, bit] = value.split(":").map(Number);
			mapper.button[key] =
			{
				byte,
				bit
			};
        }
    }

    return mapper;
}
 
 
 
function onInputReport(e)
{
    if (!hid.device) return;
    let data = new Uint8Array(e.data.buffer, e.data.byteOffset, e.data.byteLength);
    logInputReport(e.reportId, data);
    updateControllerState(data);
	
	//special pressure data
	const box = document.getElementById("hidpressurebox");
	if (isBlissBox && box?.classList.contains("show"))
	{ 
		const bars = document.querySelectorAll(".hidbar");
		bars[0].style.setProperty("--level", Math.round(data[5] * 100 / 255));
		bars[1].style.setProperty("--level", Math.round(data[8] * 100 / 255));
		bars[2].style.setProperty("--level", Math.round(data[9] * 100 / 255));
		bars[3].style.setProperty("--level", Math.round(data[10] * 100 / 255));
	}
}
 
 

function onButtonDown(part)
{
    setActive(part.el, true);
}

function onButtonUp(part)
{
    setActive(part.el, false);
}
 
 

function updateControllerState(data)
{
	 if (!controllerParts?.length || !currentMapper?.analog)    return;
    for (const part of controllerParts)
    {
        if (part.type === "analog")
        {	
			//swapp for mapper. 
			if ( currentMapper.analog[part.id].x )  part.xByte = currentMapper.analog[part.id].x ;  
			if ( currentMapper.analog[part.id].y )  part.yByte = currentMapper.analog[part.id].y ;  
		 
            const x = byteToAxis(data[part.xByte], part);
            const y = byteToAxis(data[part.yByte], part);
			
			
			
            moveStick(part.el, part.invertX ? -x : x, part.invertY ? -y : y );
        }
		if (part.type === "trigger")
        {	
 
			if ( currentMapper.trigger[part.id].byte )  part.xByte = currentMapper.trigger[part.id].byte ;  
    
            rotate(part.el,   data[part.byte] );
        }
        else if (part.type === "button")
		{
			if ( currentMapper.button[part.id].byte  )   part.byte = currentMapper.button[part.id].byte ; 
			if ( currentMapper.button[part.id].bit  )    part.bit = currentMapper.button[part.id].bit ;   
 
			
			let pressed = readPressed(data, part);
			if (pressed) onButtonDown(part);
			else onButtonUp(part);
		}
        else if (part.type === "dpad")
        {
	
			if ( Number (currentMapper.POV[part.id].byte ))
			{ 
				part.byte = Number (currentMapper.POV[part.id].byte );
				let data = currentMapper.POV[part.id].data.split(",");
				part.upData=  data[0];
				part.uprightData= data[1];
				part.rightData=  data[2];
				part.downrightData=  data[3];
				part.downData=  data[4];
				part.downleftData=  data[5];
				part.leftData=  data[6];
				part.leftupData=  data[7];
			}
 
            const value = part.byte == null ? null : data[part.byte];
			if (value == null) continue;
			const dirs = part.directions;

			const match = (dir) => dirs[dir]?.values?.includes(value);

			let state = null;

			if (match("upright")) state = "upright";
			else if (match("downright")) state = "downright";
			else if (match("downleft")) state = "downleft";
			else if (match("leftup")) state = "leftup";
			else if (match("up")) state = "up";
			else if (match("down")) state = "down";
			else if (match("left")) state = "left";
			else if (match("right")) state = "right";

			applyDpadState(part, state);
        }
    }
}
    

 
function applyDpadState(part, state)
{
    const d = part.directions;

    // turn EVERYTHING off first
    setActive(d.up?.el, false);
    setActive(d.down?.el, false);
    setActive(d.left?.el, false);
    setActive(d.right?.el, false);
    setActive(d.upright?.el, false);
    setActive(d.downright?.el, false);
    setActive(d.downleft?.el, false);
    setActive(d.leftup?.el, false);

    // then only one thing turns on
    switch (state)
    {
        case "up":
            setActive(d.up?.el, true);
            break;

        case "down":
            setActive(d.down?.el, true);
            break;

        case "left":
            setActive(d.left?.el, true);
            break;

        case "right":
            setActive(d.right?.el, true);
            break;

        case "upright":
            setActive(d.upright?.el, true);
            break;

        case "downright":
            setActive(d.downright?.el, true);
            break;

        case "downleft":
            setActive(d.downleft?.el, true);
            break;

        case "leftup":
            setActive(d.leftup?.el, true);
            break;
    }
}
function buildController(config)
{ 
	
    const counts = { analog: 0, button: 0, dpad: 0, trigger: 0 };


    controllerParts = [];
    controller.innerHTML = "";

    controller.style.width = `${config.width}px`;
    controller.style.height = `${config.height}px`;
    controller.style.position = "relative"; // IMPORTANT

    // ===== BACKGROUND LAYER =====
    const bg = document.createElement("div");
    bg.className = "controller-bg";

    bg.style.position = "absolute";
    bg.style.inset = "0";
    bg.style.backgroundSize = "cover";
    bg.style.backgroundRepeat = "no-repeat";
    bg.style.backgroundPosition = "center";

	
    controller._bg = bg;

    // ===== BODY (UI layer) =====
    controllerBody = document.createElement("div");
	controllerBody.className = "body";

	
    // IMPORTANT: append BG FIRST, then body
    controller.appendChild(bg);
    controller.appendChild(controllerBody);

    for (const part of config.parts)
    {
        if (part.type === "analog" && counts.analog++ < 8)
            buildAnalog(part);

        else if (part.type === "button" && counts.button++ < 24)
            buildButton(part);

        else if (part.type === "dpad" && counts.dpad++ < 1)
            buildDpad(part);
			
		else if (part.type === "trigger" && counts.trigger++ < 2)
            buildTrigger(part);
    }
}


 
function buildAnalog(part)
{
    const el = document.createElement("div");

    const size = shapeSize(part.shapeType);

    el.id = part.id;
    el.className = `stick side-${part.side}`;

    applyShapeType(el, part);

    el.textContent = part.label;

    placeCenter(el, part.x, part.y, size.width, size.height);

    controllerBody.appendChild(el);

    const obj = { ...part, el };

	if (part.side === "left" && part.type === "analog")   controller.leftStickEl = el; 
	if (part.side === "right" && part.type === "analog")  controller.rightStickEl = el;
 
    controllerParts.push(obj);

}

function buildTrigger(part)
{
	const el = document.createElement("div");

    const size =
        part.width || part.height
        ? {
            width: numberValue(part.width, 32),
            height: numberValue(part.height, 32)
        }
        : shapeSize(part.shapeType);

    el.id = part.id;
    el.className = `trigger`;

    applyShapeType(el, part);
 
    placeCenter(el, part.x, part.y, size.width, size.height);

	let targetEl = el;

	controllerBody.appendChild(el);

    controllerParts.push({ ...part,  el: targetEl });
}

function shapeSize(shapeType)
{
    switch(shapeType.toLowerCase())
    {
        case "circle0":
            return { width: 15, height: 15 };
			
		case "circle1":
            return { width: 32, height: 32 };

        case "circle2":
            return { width: 40, height: 40 };

		case "circle3":
            return { width: 40, height: 40 };
			
        case "square":
            return { width: 32, height: 32 };

        case "rectangle1":
            return { width: 30, height: 10 };
		 
		case "rectangle3":
            return { width: 40, height: 40 };
			
		case "rectangle5":
            return { width: 130, height: 70 };
			
		case "rectangle4":
            return { width: 10, height: 25 };
			
		 case "triangle":
            return { width: 10, height: 10 };
			
		case "trianglel":
            return { width: 30, height: 30 };

		case "triangler":
            return { width: 30, height: 30 };
			
        case "rectangle2":
            return { width: 70, height: 20 };

        case "leftpointtriangle":
            return { width: 34, height: 34 };

        case "rightpointtriangle":
            return { width: 34, height: 34 };

        case "plus":
            return { width: 64, height: 64 };

        default:
            return { width: 32, height: 32 };
    }
}

function buildButton(part)
{
 
    const el = document.createElement("div");

    const size =
        part.width || part.height
        ? {
            width: numberValue(part.width, 32),
            height: numberValue(part.height, 32)
        }
        : shapeSize(part.shapeType);

    el.id = part.id;
    el.className = `button group-${part.group}`;

    applyShapeType(el, part);

    const label = document.createElement("span");
    label.className = "buttonLabel";
    label.textContent = part.label;

    el.appendChild(label);

    placeCenter(el, part.x, part.y, size.width, size.height);

	let targetEl = el;


	if (part.label === "R3")
	{
		el.style.display = "none";
		targetEl = controller.rightStickEl;
	}

	if (part.label === "L3")
	{
		el.style.display = "none";
		targetEl = controller.leftStickEl;
	}

	controllerBody.appendChild(el);

    controllerParts.push({ ...part,  el: targetEl });
}

function buildDpad(part)
{
 
    const el = document.createElement("div");
    const directions = {};
    const size =
        part.width || part.height
        ? {
            width: numberValue(part.width, 64),
            height: numberValue(part.height, 64)
        }
        : shapeSize(part.shapeType);

    el.id = part.id;
    el.className = `dpad arrange-${part.arrange}`;

    applyShapeType(el, part);
    placeCenter(el, part.x, part.y, size.width, size.height);

    const pieces = [
        ["up", "dpad-piece dpad-up"],
        ["upright", "dpad-piece dpad-diagonal dpad-upright"],
        ["right", "dpad-piece dpad-right"],
        ["downright", "dpad-piece dpad-diagonal dpad-downright"],
        ["down", "dpad-piece dpad-down"],
        ["downleft", "dpad-piece dpad-diagonal dpad-downleft"],
        ["left", "dpad-piece dpad-left"],
        ["leftup", "dpad-piece dpad-diagonal dpad-leftup"]
    ];

    for (const [direction, className] of pieces)
    {
        const piece = document.createElement("div");
        const binding = part.directions[direction] || { values: [] };

        piece.className = className;
        el.appendChild(piece);

        directions[direction] = {
            ...binding,
            el: piece
        };
    }

    controllerBody.appendChild(el);
    controllerParts.push({ ...part, el, directions });
}
function parseControllerText(text)
{
    const blocks = readBlocks(text);
    const config = { name: "Controller", width: 420, height: 260, parts: [] };

    for (const block of blocks)
    {
        const type = textValue(block.type).toLowerCase();
        if (!type || type === "controller")
        {
            config.name = textValue(block.name) || config.name;
            config.width = numberValue(block.width, config.width);
            config.height = numberValue(block.height, config.height);
            continue;
        }

        const part = normalizePart(block, config.parts.length + 1);

        if (part)
            config.parts.push(part);
    }

    return config;
}

function readBlocks(text)
{
    const blocks = [];
    let block = {};

    for (const rawLine of text.split(/\r?\n/))
    {
        const line = rawLine.replace(/\s+#.*$/, "").trim();

        if (!line)
        {
            pushBlock(blocks, block);
            block = {};
            continue;
        }

        const separator = line.indexOf(":");

        if (separator === -1)
            continue;

        const key = normalizeKey(line.slice(0, separator));
        const value = parseValue(line.slice(separator + 1));

        block[key] = value;
    }

    pushBlock(blocks, block);
    return blocks;
}

function pushBlock(blocks, block)
{
    if (Object.keys(block).length)
        blocks.push(block);
}

function applyShapeType(el, part)
{
    switch(part.shapeType.toLowerCase())
    {
		case "circle0":
            el.classList.add("shape-circle0");
            break;
        case "circle1":
            el.classList.add("shape-circle1");
            break;
		 case "circle2":
            el.classList.add("shape-circle2");
            break;
		 case "circle3":
            el.classList.add("shape-circle3");
            break;
        case "square":
            el.classList.add("shape-square");
            break;
		case "rectangle1":
            el.classList.add("shape-rectangle1");
            break;
        case "rectangle2":
            el.classList.add("shape-rectangle2");
            break;
		case "rectangle3":
            el.classList.add("shape-rectangle3");
            break;
		case "rectangle4":
            el.classList.add("shape-rectangle4");
            break;
		case "rectangle5":
            el.classList.add("shape-rectangle5");
            break;
        case "triangle":
            el.classList.add("shape-triangle");
            break;
		
		 case "trianglel":
            el.classList.add("shape-trianglel");
            break;
		
		 case "triangler":
            el.classList.add("shape-triangler");
            break;
			
        case "rectangle2":
            el.classList.add("shape-rectangle2");
            break;

        case "rightpointtriangle":
            el.classList.add("shape-rightPointTriangle");
            break;

        case "leftpointtriangle":
            el.classList.add("shape-leftPointTriangle");
            break;

        case "plus":
            el.classList.add("shape-plus");
            break;

        default:
            el.classList.add("shape-circle1");
            break;
    }
}

function collectNumbers(block, keys)
{
    const values = [];

    for (const key of keys)
    {
        const value = numberOrNull(block[key]);

        if (value != null)
            values.push(value);
    }

    return values;
}

function normalizePart(block, index)
{
    const type = textValue(block.type).toLowerCase();
 
    if (!["analog", "button", "dpad", "trigger"].includes(type))
        return null;
	if (block.id == undefined && block.type != undefined) alert("Laoyout " + currentController + " is missing its ID for: " +  block.type  );
    const part = {
        type,
        id: textValue(block.id),
        label: textValue(block.label  ),
        x: numberValue(block.x, defaultX(block, type)),
        y: numberValue(block.y, defaultY(block, type))
    };
	

	
	
 
	
    if (type === "analog")
    {
        part.shapeType = textValue(block.shapetype) || "circle2";
        part.side = textValue(block.side) || "left";
        part.xByte = numberValue(block.xbyte ?? block.bytex, 0);
        part.yByte = numberValue(block.ybyte ?? block.bytey, 1);
        part.invertX = booleanValue(block.invertx, false);
        part.invertY = booleanValue(block.inverty, false);
    }
	 if (type === "trigger")
    {
        part.shapeType = textValue(block.shapetype) || "trianglel";
        part.side = textValue(block.side) || "left";
        part.byte = numberValue(block.byte ?? block.byte, 0);
    }
    else if (type === "button")
	{
		part.shapeType = textValue(block.shapetype) || "circle1";
		part.group = textValue(block.group) || "face";
		part.byte = numberOrNull(block.byte);
		part.bit = numberOrNull(block.bit);
 
	}
    else if (type === "dpad")
    {
        part.shapeType = textValue(block.shapetype) || "plus";
        part.arrange = textValue(block.arrange) || "left";
        part.byte = numberOrNull(block.byte);
        part.directions = {
            up: { values: collectNumbers(block, ["updata", "upvalue", "leftupdata", "upleftdata"]) },
            upright: { values: collectNumbers(block, ["uprightdata", "uprightvalue"]) },
            right: { values: collectNumbers(block, ["rightdata", "rightvalue", "uprightdata", "downrightdata"]) },
            downright: { values: collectNumbers(block, ["downrightdata", "downrightvalue"]) },
            down: { values: collectNumbers(block, ["downdata", "downvalue", "downrightdata", "downleftdata"]) },
            downleft: { values: collectNumbers(block, ["downleftdata", "downleftvalue"]) },
            left: { values: collectNumbers(block, ["leftdata", "leftvalue", "downleftdata", "leftupdata", "upleftdata"]) },
            leftup: { values: collectNumbers(block, ["leftupdata", "leftupvalue", "upleftdata"]) }
        };
    }

    return part;
}

function readPressed(data, binding)
{
    const value = data[binding.byte] ?? 0;
    if (binding.bit != null)   return (value & (1 << binding.bit)) !== 0;
    return value !== 0;
}

function byteToAxis(value, part)
{
    if (value == null) return 0;
    return Math.max(-1, Math.min(1, (value - 128) /218));
}

function moveStick(el, x, y)
{
    el.style.transform = `translate(${x * 11}px, ${y * 11}px)`;
}
function rotate(el,a)
{
	let percent = (a / 255) * 100;
	if(a) el.classList.add("active" ); else el.classList.remove("active" );
    el.style.setProperty("--angle", `${a}%`);
}
function setActive(el, pressed)
{
    
    el.classList.toggle("active", pressed);
}

function placeCenter(el, x, y, width, height)
{
    el.style.width = `${width}px`;
    el.style.height = `${height}px`;
    el.style.left = `${x - width / 2}px`;
    el.style.top = `${y - height / 2}px`;
}
 

function defaultX(block, type)
{
    if (type === "analog")   return block.side === "right" ? 210 : 130;

    if (type === "dpad")
    {
        const arrange = textValue(block.arrange) || "left";
        if (arrange === "center") return 210;
        if (arrange === "right") return 325;
        return 95;
    }

    return 210;
}

function defaultY(block, type)
{
    if (type === "analog") return 160;
    if (type === "dpad") return 135;
    return 130;
}

function normalizeKey(key)
{
    return key.trim().toLowerCase().replace(/[\s_-]/g, "");
}

function parseValue(value)
{
    const clean = value.trim();

    if (/^(true|false)$/i.test(clean))
        return clean.toLowerCase() === "true";

    if (/^-?(0x[0-9a-f]+|\d+(\.\d+)?)$/i.test(clean))
        return Number(clean);

    return clean;
}

function textValue(value)
{
    if (value == null)
        return "";

    return String(value).trim();
}

function numberValue(value, fallback)
{
    const number = Number(value);

    return Number.isFinite(number) ? number : fallback;
}

function numberOrNull(value)
{
    if (value == null || value === "")
        return null;

    const number = Number(value);

    return Number.isFinite(number) ? number : null;
}

function booleanValue(value, fallback)
{
    if (typeof value === "boolean")
        return value;

    if (value == null || value === "")
        return fallback;

    return String(value).toLowerCase() === "true";
}

function logInputReport(reportId, data)
{
    const hex = toHex(data);

    // Only log when the report changes
    if (hex === lastReport)
        return;

    lastReport = hex;

    const time = new Date().toISOString().slice(11, 19);

    reportLines.push(
        `[${time}] RID 0x${reportId.toString(16).toUpperCase()}: ${hex}`
    );

    // Keep only the newest 10 reports
    if (reportLines.length > 100)
        reportLines.shift();

    pollLog.textContent = reportLines.join("\n");
    pollLog.scrollTop = pollLog.scrollHeight;
}


function toHex(buffer)
{
    return [...new Uint8Array(buffer)]
        .map(x => x.toString(16).padStart(2, "0"))
        .join(" ");
}

