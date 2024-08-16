# joplin-plugin-publish

This plugin provides an easy way to publish your notes on github using gist so that others can use and give feedback.

[What are gists?](https://docs.github.com/en/get-started/writing-on-github/editing-and-sharing-content-with-gists/creating-gists)

## settings

You'll need to get an auth code from github https://github.com/settings/tokens and you must specificy the gist scope for it to work

You can choose to publish gist as public or private

- `github auth token`: The github token you get from the link above
- `public`: The scope of the gist, either `public` or `private`. default is private
