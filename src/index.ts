import joplin from 'api';
import { ToolbarButtonLocation } from 'api/types';
const Util = require('util');
import { exec } from "child_process";
const pexec = Util.promisify(exec);
// const fs = require('fs').promises;



const internals = {
	onStart: null,
	registerCommands: null,
	registerMenu: null,
	registerToolbarButtons: null,
};

internals.registerToolbarButtons = async function () {

	await joplin.views.toolbarButtons.create('publishGistButton', 'publishGist', ToolbarButtonLocation.EditorToolbar);
};

internals.registerMenu = async function () {
	await joplin.views.menus.create('publish-menu', 'publish', [
			{ label: "Publish to Github Gist", commandName: "publishGist", accelerator: "CmdOrCtrl+Alt+D" },
		]);
};

internals.onStart = async function() {
	console.info('Hello world. Test plugin started!');
	 await internals.registerCommands();
	 // await internals.registerMenu();
	 await internals.registerToolbarButtons();
}

internals.registerCommands =  async function() {
	await joplin.commands.register({
		name: "publishGist",
		label: "Publish Note to Github",
		iconName: 'fas fa-external-link-alt',
		execute: async () => {
			const currentNote = await joplin.workspace.selectedNote();
			console.log(currentNote);
			// await fs.writeFile('filename.md', currentNote.body);
			// const res = await pexec("gh create gist filename.md");
			// console.log(res);
		},
	});
}



joplin.plugins.register({
	onStart: internals.onStart,
});
