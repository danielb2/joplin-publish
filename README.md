# joplin-plugin-publish

This plugin provides an easy way to publish your notes on github using gist so that others can use and give feedback.

[What are gists?](https://docs.github.com/en/get-started/writing-on-github/editing-and-sharing-content-with-gists/creating-gists)

## settings

You'll need to get an auth code from github https://github.com/settings/tokens and you must specificy the gist scope for it to work

You can choose to publish gist as public or private. if you need to change the
scope, you can delete the gist, change the setting, and make a new one. Once
it's published as a scope, that's it.

- `github auth token`: The github token you get from the link above
- `public`: The scope of the gist, either `public` or `private`. default is private


My first plugin. Sometimes I've wanted to share a note, and I ended up putting it into evernote so I could do that easily.

This plugin will publish a note as a Github Gist [^Gist]´

[^Gist]: Gists provide a simple way to share code snippets (in this case, notes) with others. Every gist is a Git repository, which means that it can be forked and cloned. If you are signed in to GitHub when you create a gist, the gist will be associated with your account and you will see it in your list of gists when you navigate to your gist home page.



You can install it via the Joplin plugin system.

# Why?

- You can easily share notes and update without having Joplin Cloud share
- The version history that github allows is better than the version diff (which must be enabled) that Joplin nativly supports
- Allows readers to make comments on content you share
- update a note instead of creating a new each time



# Requirements

You need to create an auth token with gist scope here: [github.com/settngs/tokens](https://github.com/settings/tokens)

# Usage

After you have the token, click the github icon on your note ![a248f4beef612b778c834aba3ef3589feb3e2cbf](https://github.com/user-attachments/assets/0b334ada-0109-4bdf-a541-29f8736c8ee5)


# to do 
- upload referenced images


# example

https://gist.github.com/danielb2/51430701b35539eb4f2e5ac70f1293f3


# Change log
- version 1.2.0 (2024.08.16) can now choose public or private gist instead of only private
- version 1.1.0 (2023.06.27) adds ability to modify gists. Clicking the github button will now update a gist thanks to  https://github.com/laurent22/joplin/issues/8080 being implemented
