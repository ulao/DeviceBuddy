let LEFTSTICK  = 0;
let RIGHTSTICK = 1;
let POV        = 2;
let START      = 3;
let BTN_4      = 4;
let BTN_1      = 5;
let BTN_3      = 6;
let BTN_2      = 7;
let BTN_L1     = 8;
let BTN_R1     = 9;
let SELECT     = 10;
let LEFTTRIGGER  = 11;
let RIGHTTRIGGER = 12;

let autoVersion = null;
let autoRules  = [];
let counter=1;
let previousController = ""
 
 async function selectFile()
{
    const input = document.createElement("input");

    input.type = "file";
    input.accept = ".atm";

    return new Promise(resolve =>
    {
        let finished = false;

        const finish = value =>
        {
            if (finished) return;
            finished = true;

            input.remove();
            resolve(value);
        };

        input.onchange = async () =>
        {
            if (!input.files.length)
            {
                finish(null);
                return;
            }

            const text = await input.files[0].text();
            finish(text);
        };

        input.oncancel = () =>
        {
            finish(null);
        };

        input.click();
    });
}

async function auto_Init()
{ 
	
	let file = await selectFile();
	if (!file) return false;
	
	auto_Parse(file);
	
	return file;
   
}


function auto_Parse(file) // parse the file and see what vars will be watched
{
    // Get version from [ ... ]
    const versionMatch = file.match(/\[([^\]]+)\]/);
    autoVersion = versionMatch ? versionMatch[1].trim() : null;

    // Get everything inside when { ... }
    const whenMatch = [...file.matchAll(/when\s*\{([\s\S]*?)\}/g)];

    autoRules = [];

	// Get everything inside do { ... }
    const doMatch = file.matchAll(/do\s*\{([\s\S]*?)\}/g);
    const doMatches = [...doMatch];
		
    for (let i = 0; i < whenMatch.length; i++)
    {
        let autoWhen = [];
        let autoDo = [];

        const lines = whenMatch[i][1].split("\n");
        for (let line of lines)
        {
            line = line.trim();
            if (!line || line.startsWith(";")) continue; //comments
            
            if (line === "and" || line === "or")
            {
                autoWhen.push(line);
                continue;
            }

            const math = line.match(/^(.+?)\s*(=|!=|>=|<=|>|<)\s*(.+)$/); 

            if (math)
            {
                autoWhen.push({
                    variable: math[1].trim(),
                    operator: math[2],
                    value: math[3].trim()
                });
            }
        }



        if (doMatches[i])
        {
             const doData = doMatches[i][1];

            const doJSMatches = [...doData.matchAll(/DOJS\s*<<<([\s\S]*?)>>>/g)]; 

            let doDataWithoutJS = doData.replace(/DOJS\s*<<<([\s\S]*?)>>>/g, "");

            const lines = doDataWithoutJS.split("\n"); 
            for (let line of lines)
            {
                line = line.trim();
                if (!line || line.startsWith(";")) continue; //comments

				if (doJSMatches.length)
				{
					if (!confirm("This ATM file contains executable JavaScript (DOJS).\n\nIf you got this file from another person, it may be unsafe.\n\nDo you want to continue?"))
					{
						return false;
					}
				}
			
                const match = line.match(/^([A-Za-z_]+)(?:->(0x[0-9A-Fa-f]+|\d+))?(?:\((.*?)\))?$/);

                if (match)
                {
                    const command = match[1];
                    const id = match[2] !== undefined ? Number(match[2]) : undefined;

                    let parms = [];

                    if (match[3])
                    {
                        parms = match[3].split(",").map(p =>
                        {
                            p = p.trim();
                            if (!isNaN(p)) return Number(p);
                            return p;
                        });
                    }

                    autoDo.push({
                        command: command,
                        id: id,
                        parms: parms
                    });
                }
            }
			
			for (const match of doJSMatches)  
            {
                autoDo.push({ 
                    command: "DOJS", 
                    id: undefined, 
                    parms: [match[1].trim()]  
                });
            }
			
        }

        autoRules.push({
            when: autoWhen,
            do: autoDo
        });
    }
}

async function auto_Run()
{
 
	for (const rule of autoRules)
	{
		let result = null;
		let logic = "and";
		
		for (const condition of rule.when)
		{
			if (condition === "and" || condition === "or")
			{
				logic = condition;
				continue;
			}

			const actualValue = eval(condition.variable);
			const wantedValue = condition.value;
 
			let conditionResult = false;
 
 
			if (condition.operator === "=") conditionResult = actualValue == wantedValue;

			if (condition.operator === "!=") conditionResult = actualValue != wantedValue;

			if (condition.operator === ">") conditionResult = actualValue > wantedValue;

			if (condition.operator === "<") conditionResult = actualValue < wantedValue;

			if (condition.operator === ">=") conditionResult = actualValue >= wantedValue;

			if (condition.operator === "<=") conditionResult = actualValue <= wantedValue;

			if (result === null) result = conditionResult;
	 
			else if (logic === "and") result = result && conditionResult;
	 
			else if (logic === "or") result = result || conditionResult;
		 	
	}
 
		
		if (result)
		{
	
 
			for (const action of rule.do)
			{
				//because of all the awaits this need to be here. 
				if ( previousController != currentController)  { previousController = currentController; }  

				if (action.command === "API_WRITE")
				{
					let _data = new Uint8Array(200);
					
					_data[0] = action.parms[0];			
					for (let i = 0; i < action.parms.length && i < 192; i++)
					{
						_data[2 + i] = action.parms[i];
					}
					await BlissBox_writeFeature(action.id, _data);
					
					currentControllerOLD = ""; //tells screen to update on DeviceBuddy
 
				}

				if (action.command === "API_READ")
				{
					await BlissBox_readFeature(action.id);
				}

				if (action.command === "RANGE")
				{				
					await sendAndCalcRange(action.parms[0],action.parms[1]);
				}
				if (action.command === "RUMBLE")
				{
					BlissBox_rumbleTest();
				}
				
				if (action.command === "DOJS")
				{
					 eval(action.parms[0]);
				}
			}
		}
	}
}



