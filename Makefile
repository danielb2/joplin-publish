latest:
	npm run dist && /Applications/Joplin.app/Contents/MacOS/Joplin --env dev


debug:
	npm run dist && /Applications/Joplin.app/Contents/MacOS/Joplin --env dev --open-dev-tools --debug --log-level debug
