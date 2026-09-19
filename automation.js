let autoVersion = null;
let autoWhen = {};
let autoDo = [];
let counter=1;

async function selectFile()
{
    const input = document.createElement("input");

    input.type = "file";
    input.accept = ".atm";

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
    const whenMatch = file.match(/when\s*\{([\s\S]*?)\}/);

    autoWhen = [];

    if (whenMatch)
    {
        const lines = whenMatch[1].split("\n");
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
    }
	
	// Get everything inside when { ... }
	const doMatch = file.match(/do\s*\{([\s\S]*?)\}/);
	
	autoDo = [];
	if (doMatch)
	{
		const lines = doMatch[1].split("\n");
		for (let line of lines)
		{
			line = line.trim();
			if (!line || line.startsWith(";")) continue; //comments
			
			const match = line.match(/^([A-Za-z_]+)(?:->(0x[0-9A-Fa-f]+|\d+))?(?:\((.*?)\))?$/);

			if (match)
			{
				const command = match[1];
				const id = Number(match[2]);

				let parms = [];

				if (match[3])
				{
					parms = match[3].split(",").map(p =>
					{
						p = p.trim();
						if (!isNaN(p))	return Number(p);
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
	}
}



async function auto_Run()
{
    let result = true;
    let logic = "and";
	
	if  (counter)  { counter --;  return; }
	
    for (const condition of autoWhen)
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

        if (logic === "and") result = result && conditionResult;

        if (logic === "or") result = result || conditionResult;
		
			
			
    }
 
 
    if (result)
    {

        for (const action of autoDo)
        {
	
            if (action.command === "API_WRITE")
            {
                let _data = action.parms;
                await BlissBox_writeFeature(action.id, _data);
            }

            if (action.command === "API_READ")
            {
                await BlissBox_readFeature(action.id);
            }

            if (action.command === "RANGE")
            {
				currentControllerOLD = currentController;  //set before await to prevent anther. 
				await sendAndCalcRange(action.parms[0],action.parms[1]);
			}
 
        }
    }
}



