run:
	npm run dist && /Applications/Joplin.app/Contents/MacOS/Joplin --env dev


debug:
	npm run dist && /Applications/Joplin.app/Contents/MacOS/Joplin --env dev --open-dev-tools --debug --log-level debug

update:
	npm install -g yo generator-joplin
	npm run update

publish:
	npm publish

.PHONY: run debug update publish
