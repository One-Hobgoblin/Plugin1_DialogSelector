/*:
* @plugindesc This is the first plugin for the plugin tutorial series
* @author LMPGames
*
*
* @param Settings
* @desc Contains all of the main plugin settings
*
*
* @param Enable Dialog System
* @desc When enabled, turns on the dialog system
* @type boolean
* @default false
* @on Enable
* @off Disable
* @parent Settings
*
*
* @param Text Game Variable
* @desc Assigns a game variable to be used to store dialog text
* @type variable
* @default 1
* @parent Settings
*
*
* @param Dialog Settings
* @desc Contains all of the dialog settings
*
*
* @param Map Data
* @desc A map containing npc dialog data per map
* @type struct<MapData>[]
* @default []
* @parent Dialog Settings
*
*
* @param Default Dialog
* @desc The dialog returned when an invalid value is used in the GetDialog plugin command
* @type text
* @default Hello, \\P[0]
* @parent Dialog Settings
*
*
* @param Unconfigured NPC Dialog
* @desc The dialog returned when an invlaid map or npc is used with the system.
* @type text
* @default <Wordwrap>This map or npc has not been configured in the Dialog Selector plugin configuration data.\nTest new line
* @parent Dialog Settings
*
*
* @help
* For more information on how to use this plugin, please see the
* GitHub page:
*
* https://github.com/Geowil/Plugin1_DialogSelector
*/

/*~struct~MapData:
* @param Map Id
* @desc Stores the ID of the map this data is related to
* @type number
* @min 1
* @default 1
*
*
* @param Npc List
* @desc Stores npc data for npcs on the current map
* @type struct<NpcData>[]
* @default []
*/

/*~struct~NpcData:
* @param Npc Id
* @desc Stores the ID of the npc this data is related to
* @type number
* @min 1
* @default 1
*
*
* @param Dialog List
* @desc List of dialog data configuration objects
* @type struct<DialogData>[]
* @default []
*/

/*~struct~DialogData:
* @param Conditions
* @desc List of switches that when true, will allow the dialog to be displayed
* @type switch[]
* @default []
*
*
* @param Dialog
* @desc Dialog text to be displayed
* @type text
* @default ""
*/

var tutorial_DialogSelectorParams = PluginManager.parameters("TutorialPlugin1_DialogSelector");
var enableDialogSystem = (tutorial_DialogSelectorParams["Enable Dialog System"] == "true");
var textVariableId = parseInt(tutorial_DialogSelectorParams["Text Game Variable"]);
var mapData = JSON.parse(tutorial_DialogSelectorParams["Map Data"]);
var defaultDialog = tutorial_DialogSelectorParams["Default Dialog"];
var unconfigDialog = tutorial_DialogSelectorParams["Unconfigured NPC Dialog"];

var parsedMapData = [];
var mapDataHasBeenParsed = false;

/* Data Manager Functions */
var tutorialDialogSelectorDatabaseManager_IsMapLoaded = DataManager.isMapLoaded;
DataManager.isMapLoaded = function() {
	let mapIsLoaded = tutorialDialogSelectorDatabaseManager_IsMapLoaded.call(this);
	if (mapIsLoaded) {
		if (!mapDataHasBeenParsed) {
			processMapData();
			mapDataHasBeenParsed = true;
			$gameSystem.toggleDialogSystem(enableDialogSystem);
		}
	}
	return mapIsLoaded;
};

/* Plugin Commands */
var tutorialDialogSelectorGameInterpreter_pluginCommand = Game_Interpreter.prototype.pluginCommand;
Game_Interpreter.prototype.pluginCommand = function(command, args){
	if (command === "Tutorial.DialogSelector") {
		for (let arg of args) {
			command += " " + arg;
		}

		let matches = [];
		if (command.match(/Tutorial.DialogSelector[ ]EnableDialogSystem[ ](?:(\w+)|(\d+))/)) {
			matches = ((/Tutorial.DialogSelector[ ]EnableDialogSystem[ ](?:(\w+)|(\d+))/).exec(command) || []);
			if (matches.length > 1) {
				$gameSystem.toggleDialogSystem(matches[1]);
			}
		} else if (command.match(/Tutorial.DialogSelector[ ]GetDialog[ ](\d+)[ ](\d+)/)) {
			matches = ((/Tutorial.DialogSelector[ ]GetDialog[ ](\d+)[ ](\d)/).exec(command) || []);
			if (matches.length > 2) {
				$gameSystem.setDialogVariable(matches[1], matches[2]);
			}
		}
	} else {
		tutorialDialogSelectorGameInterpreter_pluginCommand.call(this, command, args);
	}
}


/* Game System Functions */
Game_System.prototype.toggleDialogSystem = function(dialogSystemEnabled){
	let bSystemEnabled = false;
	if (dialogSystemEnabled.constructor == String) {
		dialogSystemEnabled = dialogSystemEnabled.toLowerCase();
	}

	switch(dialogSystemEnabled) {
		case 1:
		case "true":
		case true:
			bSystemEnabled = true;
			break;

		default:
			break;
	}

	this.bDialogSystemEnabled = bSystemEnabled;
}

Game_System.prototype.isDialogSystemEnabled = function(){
	return this.bDialogSystemEnabled == true;
}

Game_System.prototype.setDialogVariable = function(mapId, npcId){
	let paramIsInvalid = false;
	if (mapId && mapId > 0 &&
		$gameMap._mapId == mapId)
	{
		let map = parsedMapData.find(map => map && map["Map Id"] == mapId);
		if (map) {
			if (npcId && npcId > 0) {
				let events = $gameMap._events;
				let npcs = map["Npc List"];

				let event = events.find(event => event && event._eventId == npcId);
				let npc = npcs.find(npc => npc && npc["Npc Id"] == npcId);
				if (event && npc) {
					let dialogWasSelected = false;
					let dialogObjectList = JSON.parse(JSON.stringify(npc["Dialog List"]));
					dialogObjectList.reverse();
					for (let dialogObject of dialogObjectList) {
						let conditionList = dialogObject.Conditions;
						conditionList = conditionList.map(ele => {
							return Number(ele);
						});

						let gameSwitches = $gameSwitches._data;
						let conditions = gameSwitches.filter((swt, idx) => conditionList.includes(idx));
						if (conditionList.length == conditions.length) {
							let trueConditions = conditions.filter(swt => swt === true);
							if (trueConditions.length == conditions.length) {
								$gameVariables.setValue(textVariableId, dialogObject.Dialog);
								dialogWasSelected = true;
								break;
							}
						}
					}

					if (!dialogWasSelected) {
						$gameVariables.setValue(textVariableId, defaultDialog);
					}
				} else {
					paramIsInvalid = true;
				}
			} else {
				paramIsInvalid = true;
			}
		} else {
			paramIsInvalid = true;
		}
	} else {
		paramIsInvalid = true;
	}

	if (paramIsInvalid) {
		$gameVariables.setValue(textVariableId, unconfigDialog);
	}
}

/* Utility Functions */
function processMapData(){
	for (let data of mapData) {
		parsedMapData.push(parseMapData(data));
	}

	console.log("Parsed Map Data: ", parsedMapData);
}

function parseMapData(dataString){
	let data = JSON.parse(dataString);
	for (let key in data) {
		let value = data[key];
		if (value.substr(0, 2) == '[\"' ||
			value.substr(0, 2) == '[]' ||
			value.substr(0, 2) == '{\"' ||
			value.substr(0, 2) == '{}')
		{
			data[key] = parseMapData(value);
		}
	}

	return data;
}