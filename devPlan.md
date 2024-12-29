Documento copiado de: https://github.com/Geowil/Plugin1_DialogSelector/blob/master/dialog%20selector%20dev%20plan.txt

User Story:
As a developer, I want to display NPC dialog from a plugin.

Requirements:
Write a plugin
Plugin Settings:
Dialog Map
Map of objects containing a Map Id and a list of Npc data.

    			Npc data list is a list of objects containing the NPC Id and a list of that NPC's dialog data.

    			Dialog data list is a list of objects containing the dialog for an NPC along with the conditions (switch id list)
    			underwhich that dialog should be shown.
    			/*[
    				{
    					mapId: 1,
    					npcData: [
    						{
    							npcId: 1,
    							dialogData: [
    								{
    									conditions: [1, 2, 3, 4],
    									dialog: "Test Dialog 1"
    								},
    								...
    							]
    						},
    						...
    					],
    				},
    				{
    					mapId: 2
    					...
    				},
    				...
    			]*/

    		Default Dialog
    			Text
    			Used when no valid dialog can be selected

    		Unconfigured NPC Dialog
    			Text
    			Used when the Dialog System is invoked on an npc or on a npc in a map
    			that is not configuired in the plugin.

    		Enable Dialog System
    			Boolean
    			Able to turn the system on and off via script call or plugin command

    		Text Variable
    			Game Variable
    			Able to store selected text to display

    	Plugin Commands:
    		EnableDialogSystem
    			Parameters:
    				Boolean
    					True/False
    			Allows the dialog system to be disabled or enabled from in-game through a plugin command.

    		GetDialog
    			Parameters:
    				Integer
    					Used to set the Map Id

    				Integer
    					Used to specify the NPC Id

    				Integer
    					Used to get the next dialog to show

    	Script Calls:
    		toggleDialogSystem
    			Paramter:
    				Boolean - systemEnabled
    			Allows the dialog system to be disabled or enabled from in-game through a script call.

    		isDialogSystemEnabled
    			No parameters
    			Returns value of Enable Dialog System plugin setting

    	Notetag:
    		None

    How should this be used?
    	In the NPC event, have a plugin command that will send an index to the plugin.  This index will be used
    	to get the dialog to show and then store it in a game variable.


    Edge Case:
    	An invalid index is passed to the plugin using GetDialog plugin command
    		Problem:
    			It will cause undefined to be displayed in the text box

    		Handling:
    			Implement a default line of dialog to be displayed when an invalid index is passed or when there is no
    			dialog list set up in the plugin settings.

    	Attempting to use the dialog system when the system has been disabled through the plugin command or script call.
    		Problem:
    			Dialog system is disabled so no text (or undefined) will be returned

    		Handling:
    			Implement a script call to determine if the dialog system is enabled or not.

    	An invalid Map Id is passed into the plugin using GetDialog plugin command
    		Problem:
    			It will likely cause the game to crash.

    		Handling:
    			Check if the Map Id is a valid integer
    			Check if the Map Id matches the map
    				If not the same, end processing

    	An invalid NPC Id is passed into the plugin using GetDialog plugin command
    		Problem:
    			It will cause an undefiend to be displayed or will crash the game.

    		Handling:
    			Check if the NPC Id is a valid integer
    			Check if the NPC exists in the current map
