## v0.1.33: Media Session API

* Giving a try to Media Session and hopefully give some ability to control playback of MIDIs from the notification screen on your decvices :)

## v0.1.32: Text lumps

* We're trying to get the data out of these WADs, right? Well, this time, we're working on getting text info out of them. With the `textConverter`, wadJS will attempt to convert any uncategorized lump to text so that the user can see what's inside.

## v0.1.31: Play MIDIs from the same WAD

* The MIDI player is now able to play MIDIs in the same WAD as the lump that is currently being played. Next, I'll add the abilitiy to play all MIDIS from all WADs. Because this MIDI player is gonna be fancy! 🍌🍌🍌

## v0.1.30: Settings and MIDI loop

* I've tweaked the "helper bar" that appears at the bottom. The `^` icon has now been changed for something like `⚙️`. That's right, wadJS now has settings. They're only for the MIDI player right now, but I've been thinking about that for a while, so I'm happy :)

* The MIDI player got some hotfixing and also was given the ability to play the same track repeatedly. Yeehaw!

## v0.1.29: Improved MIDI player

* I thought that the current MIDI player was cool, but I felt like it cool be better. I've been working on converting the code to modern JavaScript and add functionalities that I wish were present on the initial version. With a more robust event system and error handling, I hope to create a better user experience. I also want to take further advantage of the AudioContext API to add functionalities to the player such as a simple playlist system and display the actual duration of a track.

## v0.1.27 and v0.1.28: Preparing for more workers

* The UI now has a "global message" component that can show info and error messages. This comes handy when things are happening in the background or for issues that affect the whole app. There wasn't any logical place to show this kind of info before.

* The app now handles the lack of support of `OffscreenCanvas` by displaying a message. It's not really an option to run the app without this feature, so a browser that is not compatible with `OffscreenCanvas` is pretty much a dealbreaker.

* The MIDI player now has bigger buttons. Easier to click on 'em on a mobile device.

* Now that I am more familiar with web workers, I refactored the code that handles the tasks they execute. The goal is to make the code as reusable as possible to easily create new types of workers. The end goal is to have this app convert anything you throw at it, namely sounds, maps, scripts, etc., but that's a long ways away. Right now, a big step after this one would be to parse the entire WAD for a certain file format instead of limiting the workers to a specific lump type (for example, the "simple image converter" only looks in flat lumps, but this file format also exists in menu lumps for Heretic).

## v0.1.26: Image worker

* Flats are now outsourced to workers when processing WADs. This allows to upload files much faster and also update the UI much faster so that you can browse the data without having to wait for the images to be processed and rendered.

## v0.1.25: MIDI playback adjustments

* I upgraded the MIDIjs script. As a result, I was able to implement more playback functionalities. Namely, pause and resume. I decided to add this behavior to the "portable" MIDI player that appears at the bottom of the screen, to keep the MIDI lumps simple.

## v0.1.24: MIDI conversion queue

* Now that we have a nice-looking MIDI player, it was time to tackle a better way to send tasks to our MIDI-conversion worker. Once a WAD is uploaded, the app will look for MUS lumps in it and add them to a queue that is processed by the worker. The worker will check for more lumps to convert after it is done with the current one until the queue is empty. Next, I'm hoping to prioritize the wad and lumps that are currently being displayed on the screen.

## v0.1.23: MIDI player

* It was time to make playing MIDI convenient, so I added a little widget at the bottom of the screen to help always have a look at what's playing. That way, you can browse away from your WAD MIDIs and still be able to silence or restart the song you are currently playing.
* Also did some minor changes to make the error component more resilient (it won't blow up the app if no error was provided to the component).
* I added some comments in the code when it comes to parsing lumps.

## v0.1.22: Web Workers, MUS and MIDI

* You can now play WAD songs as MIDIs (if compatible; MP3 are not handled yet). This one was a little bit of a doozy. As I chose to use the localForage library instead of the localStorage API, I ran into more size limitations when I worked on parsing Doom original music data (MUS). As a result, I decided to let web workers handle the conversion of these music lumps into MIDI files. Works like a charm. Could use some optimization. The only, significant downside is that these MIDI files have to be regenerated every time the user reloads the page.
* Thanks to jmickle66666666 for writing the code to handle the conversion from MUS to MIDI. I unhesitatingly implemented his code into wadJS and am very, very grateful for the time I was able to save this way!

## v0.1.21: JSON Export/Import (2)

* Fix bug where the file would not appear in the list of uploaded file immediately.
* Refactor the handling of lump instances when restoring WAD files from a JSON object.
* Allow to import multiple JSON files.
* Invite user to report bugs when errors occur.

## v0.1.20: JSON Export/Import

* wadJS is now capable of exporting the processed WAD files to JSON. This will be helpful to create quick copies of a WAD without compiling it. It will also be instrumental in sharing these assets in a lightweight format among users or to help debug errors in the application! :)

## v0.1.19: The magic rocket

* Very important update. Would probably be considered MVP, but it was a lot of fun to code: I added a little animation while uploading WADs to the application. Don't be surprise if you see a rocket crossing your screen when you add your favorite WAD :)

## v0.1.18: IWADs and PWADs

* Since we are diving into displaying graphical assets, it was time to make a distinction between Internal WADs and Patch WADs. The application now separates the two categories on the UI and allows users to link PWADs to already-uploaded IWAD. As a result, it will still be possible to display graphics from PWADs without any palettes data. Yay!

## v0.1.17: Image reader

* Thanks to jmickle66666666's code, I was able to improve easily the logic to parse most images within WADs. As a result, wadJS is now able to display sprites and patches.
* I've used this opportunity to refactor some code on the UI side.
* I've also surfaced the texture lumps. Right now, the app is not able to recreate the image but we're getting there :)

## v0.1.16: Patch names

* You can now consult the PNAMES lump to see a list of all the patches within the WAD.
* I did some preliminary work to parse patch lumps.

## v0.1.15: Flats

* You can now see thumbnails of the flats when browsing your WADs. When you click on a particular flat, an enlarged version of the flat is shown.

## v0.1.14: Moved to localForage + PLAYPAL and COLORMAP

* I ran into issues with the size limits of the localStorage API pretty quickly, so I outsourced the task of saving WADs to local memory to a libray called localForage.
* Implemented logic to parse palettes and colormaps from WADs.

## v0.1.13: Lump views

* Lumps are now broken down by category in the UI. This should help avoid long lists of lumps and simplify browsing. Also, it should improve the performances of the app when it re-renders.

## v0.1.12: Patch lumps

* Patch lumps are now marked as such. This update paves the way to detect other types of lump.

## v0.1.11: Group map lumps together

* With this new update, lumps such as "THINGS", "VERTEXES" (sic! the plural of vertex is vertices...), "LINEDEFS", etc., are now grouped under the lump that holds the name of the map. As a result, the lumps in question do not show up in the list anymore but they will soon once I focus more on the map lumps.

## v0.1.10: Selectable lumps

* You can now click on a lump to see more details about it.
* Additionally, if you reload the page, the application will focus your browser view to the appropriate wad or lump details, so you can resume right where you left.
* From a data model perspective, lumps now have their own class, which means that they have their own set of methods, separate from the Wad class.

## v0.1.9: Display WAD lumps

* When you click on an uploaded lump, a whole list of the lumps within the file will now be displayed below the WAD name.

## v0.1.8: Better error handling for upload

* I made the upload of files more resilient in order to get more visibility on possible issues and errors that show up when adding WADs to your list.

## v0.1.7: Handle multiple files

* The uploader can now upload multiple files at once from your device.

## v0.1.6: Handle ZIP/PK3 files

* The uploader is now able to extract a WAD from a zipped file.

## v0.1.5: Remote WAD upload

* I've added the code and UI to upload WAD files from a URL. No need to access your device anymore to manipulate your WADs :)