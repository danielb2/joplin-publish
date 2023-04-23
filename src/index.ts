import joplin from 'api';
import { ToolbarButtonLocation, SettingItemType } from 'api/types';
import { Octokit } from "@octokit/core";


const internals = {
	onStart: null,
	registerCommands: null,
	registerMenu: null,
	registerToolbarButtons: null,
	registerSettings: null,
	octokit: null,
	initOctokit: null,
};


internals.registerSettings = async function () {

	await joplin.settings.registerSection('Publish', {
			label: 'Publish',
			iconName: 'fas fa-calendar-day',
		});

		
		await joplin.settings.registerSettings({

			'GithubAuthToken': {
				value: '',
				type: SettingItemType.String,
				section: 'Publish',
				public: true,
				label: 'github auth token',
				description: `Get your token from https://github.com/settings/tokens`
			},
		});
};

internals.registerToolbarButtons = async function () {

	await joplin.views.toolbarButtons.create('publishGistButton', 'publishGist', ToolbarButtonLocation.EditorToolbar);
};

internals.initOctokit = async function () {
	 internals.octokit =  new Octokit({
		 auth: await joplin.settings.value('GithubAuthToken'),
	 })
}

internals.registerMenu = async function () {
	await joplin.views.menus.create('publish-menu', 'publish', [
			{ label: "Publish to Github Gist", commandName: "publishGist", accelerator: "CmdOrCtrl+Alt+D" },
		]);
};

internals.onStart = async function() {
	 await internals.registerCommands();
	 // await internals.registerMenu();
	 await internals.registerToolbarButtons();
	 await internals.registerSettings();

	 await internals.initOctokit();

	 joplin.settings.onChange(async (event: any) => {
		 if (event.keys.indexOf("GithubAuthToken") !== -1) {
			 console.log("Github Auth Token changed");
			 await internals.initOctokit();
		 }
	 });
}

internals.registerCommands =  async function() {
	await joplin.commands.register({
		name: "publishGist",
		label: "Publish Note to Github",
		iconName: 'fas fa-external-link-alt',
		execute: async () => {
			const currentNote = await joplin.workspace.selectedNote();

			const files = {};
			files[`${currentNote.title}.md`] = { content: currentNote.body };

			try {
				const res = await internals.octokit.request('POST /gists', {
					description: currentNote.title,
					'public': false,
					files,
					headers: {
						'X-GitHub-Api-Version': '2022-11-28'
					}
				})
			console.log(res);
			} catch (e) {
				alert(e);
			}

		},
	});
}



joplin.plugins.register({
	onStart: internals.onStart,
});
