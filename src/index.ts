import joplin from 'api';
import { ToolbarButtonLocation } from 'api/types';
import { Octokit } from "@octokit/core";


const internals = {
	onStart: null,
	registerCommands: null,
	registerMenu: null,
	registerToolbarButtons: null,
	octokit: new Octokit({
		auth: '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'
	})

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

			const files = {};
			files[currentNote.title] = { content: currentNote.body };

			await internals.octokit.request('POST /gists', {
				description: currentNote.title,
				'public': false,
				files,
				headers: {
					'X-GitHub-Api-Version': '2022-11-28'
				}
			})
		},
	});
}



joplin.plugins.register({
	onStart: internals.onStart,
});
