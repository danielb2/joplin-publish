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
		'GithubPublic': {
			value: false,
			type: SettingItemType.Bool,
			section: 'Publish',
			public: true,
			label: 'public',
			description: `If you want to publish your notes as public gist, check this box.`
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
			// Insert Table of Contents where [toc], if found
			const preparedBody = insertTableOfContents(currentNote.body);
			files[`${currentNote.title}.md`] = { content: preparedBody };

			const gist_id = await joplin.data.userDataGet(ModelType.Note, currentNote.id, 'publish2web.gist_id')

			let url = 'POST /gists'

			const options:Record<string, any> = {
				description: currentNote.title,
				public: await joplin.settings.value('GithubPublic'),
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

// Helper to replace [toc] with generated TOC (case-insensitive)
function insertTableOfContents(markdown: string): string {
	const tocRegex = /\[toc\]/gi;
	const headingRegex = /^(#{1,6})\s+(.+?)$/gm;
	const headings = [];
	let match;

	while ((match = headingRegex.exec(markdown)) !== null) {
		headings.push({
			level: match[1].length,
			text: match[2].trim(),
			anchor: match[2].trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-')
		});
	}

	if (headings.length === 0) return markdown.replace(tocRegex, '');

	let toc = headings.map(h => {
		return `${'  '.repeat(h.level - 1)}- [${h.text}](#${h.anchor})`;
	}).join('\n');

	return markdown.replace(tocRegex, toc);
}


joplin.plugins.register({
	onStart: internals.onStart,
});
