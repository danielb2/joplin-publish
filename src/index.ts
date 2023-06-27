import joplin from 'api';
import { ToolbarButtonLocation, SettingItemType, ModelType } from 'api/types';
import { Octokit } from "@octokit/core";

// useful links
// https://joplinapp.org/api/references/plugin_api/classes/joplindata.html
// https://docs.github.com/en/rest/gists/gists?apiVersion=2022-11-28

const internals = {
	onStart: null,
	registerCommands: null,
	registerMenu: null,
	registerToolbarButtons: null,
	registerSettings: null,
	octokit: null,
	initOctokit: null,
	gistDialog: null,
};


internals.registerSettings = async function () {

	await joplin.settings.registerSection('Publish', {
		label: 'Publish To Web',
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
	internals.gistDialog = await joplin.views.dialogs.create('gistDialog');
}

internals.registerCommands =  async function() {
	await joplin.commands.register({
		name: "publishGist",
		label: "Publish Note to Github",
		iconName: 'fab fa-github fa-fw',
		execute: async () => {
			const currentNote = await joplin.workspace.selectedNote();

			const files = {};
			files[`${currentNote.title}.md`] = { content: currentNote.body };

			const gist_id = await joplin.data.userDataGet(ModelType.Note, currentNote.id, 'publish2web.gist_id')

			let url = 'POST /gists'

			const options:Record<string, any> = {
				description: currentNote.title,
				public: false,
				files,
				headers: {
					'X-GitHub-Api-Version': '2022-11-28'
				}
			};

			if (gist_id) {
				url = `PATCH /gists/${gist_id}`
				delete options.public;
			}

			try {
				const res = await internals.octokit.request(url, options)

				await joplin.data.userDataSet(ModelType.Note, currentNote.id, 'publish2web.gist_id', res.data.id);
				await joplin.commands.execute('openItem', res.data.html_url);
			} catch (e) {
				if (e == 'HttpError: Not Found') {
					e = 'Gist not found. It got deleted? try again and we will make a new one. Together :)'
					await joplin.data.userDataDelete(ModelType.Note, currentNote.id, 'publish2web.gist_id');
				}
				console.log(e)
				await joplin.views.dialogs.setHtml(internals.gistDialog, `<p>${e}</p>`);
				await joplin.views.dialogs.setButtons(internals.gistDialog, [
					{ id: "ok", title: "OK" },
				]);
				await joplin.views.dialogs.open(internals.gistDialog);
			}

		},
	});
}



joplin.plugins.register({
	onStart: internals.onStart,
});
