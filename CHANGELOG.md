
## v0.1.14: Moved to localForage + PLAYPAL

* I ran into issues with the size limits of the localStorage API pretty quickly, so I outsourced the task of saving WADs to local memory to a libray called localForage.
* I started working on parsing the palette lumps. There's plenty to do there.

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