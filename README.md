TouchTalk AAC

What this is

TouchTalk is a touch based communication app for people who have trouble speaking, like people with cerebral palsy or other motor disabilities. You tap big buttons and the app says the word out loud for you. 

I started building this after I realized how difficult it was for people with disabilities, like my brother, to communicatea. I wanted to make something that was actually accessible(free), easy to use on a phone or tablet, and something a caregiver could set up in a few minutes without having to pay for anything or make an account.

Why I made it

A lot of the AAC apps that already exist cost money, need an account, or are kind of clunky to use. I wanted to make something free, that works right in the browser, that anyone could open on their phone and just start using. I also wanted it to be something I could keep improving based on real feedback instead of just guessing what people need.

How it works

You open the app and tap through categories like Feelings, Needs, Words, Actions, People, and a Core Words section. Tapping a button speaks the word out loud right away. You can build up a full sentence by tapping multiple buttons in a row, then hit the Speak button to say the whole thing. There is also a Quick Phrases section for full sentences you use a lot, like I want to go home or I need help please, so you do not have to build them word by word every time.

There is also a Type view if someone would rather just type out what they want to say instead of tapping symbols, and it will try to predict the next word as you go.

The emergency button is always visible no matter what screen you are on, because that is the one button that actually needs to be reachable at all times.

Customization

You can add your own categories and symbols, upload real photos instead of using emojis, make your own quick phrases, and delete or edit anything you do not need. Everything you add gets saved automatically so you do not lose it when you close the app.

You can also record your own voice for any button instead of using text to speech. This is useful for names, words in other languages, or anything the computer voice says wrong. You just hit record, say the word, and it plays your recording back instead of the robotic voice whenever that button gets tapped.

Accessibility stuff I added

Since this app is meant for people with motor disabilities, I tried to make it work for people who might have shaky hands or trouble tapping precisely. There is a hold to activate setting so a button only does something if you hold it down for a bit, which stops accidental taps from just brushing past a button. There is also a debounce setting so double taps from tremors do not trigger something twice. Button size can be changed to small, medium, large, or extra large depending on what someone needs. There is also an option to turn off the sound that plays on every single word tap if that gets annoying, so it only speaks when you hit the full Speak button. The whole goal is for the app to be really customizable by a caregiver for ease when the person with the disability is using it.

I also made sure there is no flashing or strobing animation anywhere in the app since that can be dangerous for people with photosensitive conditions. The emergency button used to flash but I changed it to a slow gentle glow instead once I learned flashing animations can trigger seizures.

Word prediction

There is a basic word prediction feature that suggests words based on common sentence starters, and it also learns from sentences you have said before so it gets better the more you use it. All of this happens on your device, nothing gets sent anywhere.

Backup and restore

Since everything is saved locally on your device and not on some server, I added a way to export all your data as a file and import it back later. This way if someone gets a new phone or wants a backup of their custom words and phrases, they do not lose everything.

Technical details

This is built with plain HTML, CSS, and JavaScript, no frameworks. I used the Web Speech API for the text to speech part and localStorage to save everything on the device. There is no backend, no database, no server, everything just runs in the browser.

Files

index.html is the actual app.
style.css handles all the styling and making it responsive on different screen sizes.
script.js has all the logic and functionality.
manifest.json and sw.js are what let you install the app to your home screen and use it offline like a real app.
landing.html is a separate marketing style page that explains what the app is for people visiting the site.
icons folder has the app icons.

Browser support

Works in Chrome, Safari, Edge, and Firefox on both desktop and mobile. You need a browser that supports the Web Speech API for the talking part to work.

How I built it

I started this in February 2026 to use what I was learning in my computer science classes on an actual real world problem instead of just doing homework assignments. I went through a bunch of versions of this app over a few weeks. I tested it with someone who actually has cerebral palsy and their feedback is basically the reason a lot of the app looks the way it does now, especially things like button size, how the categories are organized, and making the emergency button always reachable.

Along the way I looked at how real commercial AAC apps work, like Proloquo2Go and LAMP Words for Life, and used some of their ideas like the Fitzgerald Key color system, which is a pretty standard color coding ideology in AAC where pronouns, verbs, nouns, adjectives, and other word types each get their own color so people can learn where things are just from color and position, kind of like muscle memory on a keyboard.

Future plans

Things I might add later depending on more testing and feedback:
AI powered word prediction that is smarter than what is there now
support for multiple user profiles on one device
a way to export and share custom symbol sets with other people
better offline support since it is already a progressive web app but could be more reliable

Usage

Just open index.html in a browser and it works. There is also a live version you can visit and install straight to your phone like a real app, no app store needed.

About me

I am a junior in high school. I have been programming for about three years, mostly in Python and Java, and this is my first real web app and my first time actually trying to build something in the assistive technology space.

Thanks

Thank you to my little brother for helping me test this app.

License

Free to use for personal, educational, and non commercial purposes.
