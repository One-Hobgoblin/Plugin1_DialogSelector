/*:
* @plugindesc Core plugin for plugins created by LMPGames
* @author LMPGames
*
* @help
*
*/

var tutorialCore = {};


//Core Plugin Params
tutorialCore.coreParams = {};


//Core Plugin Settings
tutorialCore.coreSettings = {};
tutorialCore.coreSettings.plugins = [
	{
		name: "TutorialPlugin1_DialogSelector",
		installed: false
	},
	{
		name: "TutorialPlugin3_WeaponBonuses",
		installed: false
	}
];

//Plugin Settings
tutorialCore.pluginSettings = {};


//Plugin Parameteres
tutorialCore.pluginParams = {};


//Plugin Data
tutorialCore.pluginData = {};


//Plugin Database Data
tutorialCore.pluginDatabaseData = {
	actors: [],
	armor: [],
	classes: [],
	items: [],
	skills: [],
	states: [],
	weapons: []
};


//Plugin Notetag Data
tutorialCore.pluginNotetagData = {
	actorData: [],
	armorData: [],
	classData: [],
	itemData: [],
	skillData: [],
	stateData: [],
	weaponData: []
};


//Common Plugin Settings
tutorialCore.settings = {};


//Static Values
tutorialCore.statics = {
	staticObjects: {},
	staticLists: {}
};


//Utility Functions
tutorialCore.functions = {};
tutorialCore.functions.parseMapData = (dataString) => {
	let data = JSON.parse(dataString);
	for (let key in data) {
		let value = data[key];
		if (value.substr(0, 2) == '[\"' ||
			value.substr(0, 2) == '[]' ||
			value.substr(0, 2) == '{\"' ||
			value.substr(0, 2) == '{}')
		{
			data[key] = tutorialCore.functions.parseMapData(value);
		}
	}

	return data;
};


/* Core Plugin Function */
/* Aliases */
/* DataManager */
var tutorialPlugin_DataManager_MakeSaveContents = DataManager.makeSaveContents;
DataManager.makeSaveContents = function(){
	let contents = tutorialPlugin_DataManager_MakeSaveContents.call(this);
	contents.tutorialCore = {};
	contents.tutorialCore.coreSettings.plugins = {};
	contents.tutorialCore.pluginData = {};
	contents.tutorialCore.pluginNotetagData = {};
	contents.tutorialCore.pluginDatabaseData = {};
	getPluginDatabaseData();

	contents.tutorialCore.coreSettings.plugins = tutorialCore.coreSettings.plugins;
	contents.tutorialCore.pluginData = tutorialCore.pluginData;
	contents.tutorialCore.pluginNotetagData = tutorialCore.pluginNotetagData;

	return contents;
};

var tutorialPlugin_DataManager_ExtractSaveContents = DataManager.extractSaveContents;
DataManager.extractSaveContents = function(contents){
	tutorialPlugin_DataManager_ExtractSaveContents.apply(this, arguments);
	loadCoreData(contents);
	processPluginDatabaseData();
	clearPluginDatabaseData();
};

var tutorialPlugin_DataManager_IsDatabaseLoaded = DataManager.isDatabaseLoaded;
DataManager.isDatabaseLoaded = function(){
	if (!tutorialPlugin_DataManager_IsDatabaseLoaded.call(this)) {
		return false;
	}

	processNoteTags();
	return true;
};


/* Core Functions */
function getPluginDatabaseData(){
	let actors = [];
	let armor = [];
	let classes = [];
	let items = [];
	let skills = [];
	let states = [];
	let weapons = [];

	tutorialCore.pluginDatabaseData.actors = actors;
	tutorialCore.pluginDatabaseData.armor = armor;
	tutorialCore.pluginDatabaseData.classes = classes;
	tutorialCore.pluginDatabaseData.items = items;
	tutorialCore.pluginDatabaseData.skills = skills;
	tutorialCore.pluginDatabaseData.states = states;
	tutorialCore.pluginDatabaseData.weapons = weapons;
};

function loadCoreData(contents){
	tutorialCore.pluginData = contents.tutorialCore.pluginData;
	tutorialCore.coreSettings.plugins = contents.tutorialCore.coreSettings.plugins;
	tutorialCore.pluginNotetagData = contents.tutorialCore.pluginNotetagData;
	tutorialCore.pluginDatabaseData = contents.tutorialCore.pluginDatabaseData;
};

function processPluginDatabaseData(){
	if (tutorialCore.pluginDatabaseData.actors.length > 0) {
		$dataActors = $dataActors.concat(tutorialCore.pluginDatabaseData.actors);
	}

	if (tutorialCore.pluginDatabaseData.armor.length > 0) {
		$dataArmors = $dataArmors.concat(tutorialCore.pluginDatabaseData.armor);
	}

	if (tutorialCore.pluginDatabaseData.classes.length > 0) {
		$dataClasses = $dataClasses.concat(tutorialCore.pluginDatabaseData.classes);
	}

	if (tutorialCore.pluginDatabaseData.items.length > 0) {
		$dataItems = $dataItems.concat(tutorialCore.pluginDatabaseData.items);
	}

	if (tutorialCore.pluginDatabaseData.skills.length > 0) {
		$dataSkills = $dataSkills.concat(tutorialCore.pluginDatabaseData.skills);
	}

	if (tutorialCore.pluginDatabaseData.states.length > 0) {
		$dataStates = $dataStates.concat(tutorialCore.pluginDatabaseData.states);
	}

	if (tutorialCore.pluginDatabaseData.weapons.length > 0) {
		$dataWeapons = $dataWeapons.concat(tutorialCore.pluginDatabaseData.weapons);
	}
};

function clearPluginDatabaseData(){
	tutorialCore.pluginDatabaseData.actors = [];
	tutorialCore.pluginDatabaseData.armor = [];
	tutorialCore.pluginDatabaseData.classes = [];
	tutorialCore.pluginDatabaseData.items = [];
	tutorialCore.pluginDatabaseData.skills = [];
	tutorialCore.pluginDatabaseData.states = [];
	tutorialCore.pluginDatabaseData.weapons = [];
};

function processNoteTags(){
	detectInstalledPlugins();
	let pluginNames = getInstalledPlugins();
	tutorialCore.pluginNotetagData.weaponData = processWeaponNoteTags(pluginNames);
};

function detectInstalledPlugins(){
	for (let plugin of $plugins) {
		let pluginData = tutorialCore.coreSettings.plugins.find(plug => plug && plug.name == plugin.name && plugin.status);
		if (pluginData) {
			pluginData.installed = true;
		}
	}
};

function getInstalledPlugins(){
	return tutorialCore.coreSettings.plugins.filter(plugin => plugin && plugin.installed)
		.reduce((names, plugin) => {
			names.push(plugin.name);
			return names;
		}, []);

};

function processWeaponNoteTags(pluginNames) {
	let weaponNotetagData = [];
	let nullIdTracker = 0;
	for (let weapon of $dataWeapons) {
		if (weapon) {
			weaponNotetagData[weapon.id] = {};
			weaponNotetagData[weapon.id].id = weapon.id;
			if (weapon.note && weapon.note.length > 0) {
				for (let tag of pluginNames) {
					if (weapon.note.includes(tag)) {
						let noteData = weapon.note.split(/[\r\n]+/);
						if (noteData && noteData.length > 0) {
							let inPluginSettings = false;
							let endNoteTagReached = false;

							if (tag == "TutorialPlugin3_WeaponBonuses") {
								weaponNotetagData[weapon.id].bonus = 0.0;
								weaponNotetagData[weapon.id].bonusFormula = "";
								weaponNotetagData[weapon.id].skillTypeId = 0;
							}

							let openingTag = "<" + tag + ">";
							let closingTag = "</" + tag + ">";
							for (let noteLine of noteData) {
								switch (noteLine) {
									case openingTag:
										inPluginSettings = true;
										break;

									case closingTag:
										endNoteTagReached = true;
										break;

									default:
										if (inPluginSettings) {
											let noteLineData = noteLine.split(":");
											if (noteLineData[0] == "Bonus") {
												weaponNotetagData[weapon.id].bonus = parseFloat(noteLineData[1]);
											} else if (noteLineData[0] == "BonusFormula") {
												weaponNotetagData[weapon.id].bonusFormula = noteLineData[1];
											} else if (noteLineData[0] == "SkillType") {
												weaponNotetagData[weapon.id].skillTypeId = parseInt(noteLineData[1]);
											}
										}
										break;
								}

								if (inPluginSettings && endNoteTagReached) {
									break;
								}
							}

						}
					}
				}
			}
		} else {
			weaponNotetagData[nullIdTracker] = undefined;
		}

		nullIdTracker++;
	}

	return weaponNotetagData;
};