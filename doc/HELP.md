## Uploader

Use the WAD Uploader to add files you want to inspect with wadJS. Supported file formats are `.wad`, `.zip`, `.pk3`, and `.json`.

You can upload multiple files from your device.

Alternatively, you can upload one file at a time from the Internet by entering a URL and also specify the name of the file. It is recommended to add the file extension to the file name (e.g., "doom1.wad") for clarity.

Zipped files (including PK3s) must contain only one WAD file to be processed. The handling of compressed files containing more than one WAD file or nested zipped files will be added at a later date.

You can import JSON copies of WAD files that were created via the wadJS export functionality. JSON files are more lightweight than WAD files and they are already parsed. This means that uploading an exported WAD is faster than re-uploading the original binary file. Exporting your WADs as JSON is a great way to back up your work and restore it quickly as needed.

You can upload a file with the same name multiple times. This allows you to compare different versions of a WAD.

Additionally, all the files you upload to wadJS are kept in the memory of your device's browser. This means that you can close the web page or refresh it without having to reupload all your files afterwards.

Please note that it is usually necessary to use an IWAD as a reference when loading a PWAD, especially if the PWAD does not have data concerning the play palettes. If you do not link your PWADs to an IWAD, you might not be able to preview certain resources such as sprites, textures, patches, etc. If you link a PWAD to the incorrect IWAD, the colors of its graphic assets might be weird depending on the play palettes of the IWAD. To remedy to this issue, make sure that you upload the necessary IWAD first, and then select this IWAD when uploading PWADs.

## Uploaded WADs

This list of uploaded WADs allows you to browse between the different WADs you have added to wadJS.

The WADs of the same type (IWADs a.k.a Internal Wads and PWADs a.k.a Patch Wads) are displayed in their own group. This allows for more clarity on your list of uploaded WADs.

Clicking on <img src="./static/trash.svg"> will remove all the uploaded WADs from the list.

Clicking on <svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" height="18" width="18"><path fill="black" d="M369.941 97.941l-83.882-83.882A48 48 0 0 0 252.118 0H48C21.49 0 0 21.49 0 48v416c0 26.51 21.49 48 48 48h288c26.51 0 48-21.49 48-48V131.882a48 48 0 0 0-14.059-33.941zm-22.627 22.628a15.89 15.89 0 0 1 4.195 7.431H256V32.491a15.88 15.88 0 0 1 7.431 4.195l83.883 83.883zM336 480H48c-8.837 0-16-7.163-16-16V48c0-8.837 7.163-16 16-16h176v104c0 13.255 10.745 24 24 24h104v304c0 8.837-7.163 16-16 16zm-161.471-67.404l-25.928-7.527a5.1 5.1 0 0 1-3.476-6.32l58.027-199.869a5.1 5.1 0 0 1 6.32-3.476l25.927 7.527a5.1 5.1 0 0 1 3.476 6.32L180.849 409.12a5.1 5.1 0 0 1-6.32 3.476zm-48.446-47.674l18.492-19.724a5.101 5.101 0 0 0-.351-7.317L105.725 304l38.498-33.881a5.1 5.1 0 0 0 .351-7.317l-18.492-19.724a5.1 5.1 0 0 0-7.209-.233L57.61 300.279a5.1 5.1 0 0 0 0 7.441l61.263 57.434a5.1 5.1 0 0 0 7.21-.232zm139.043.232l61.262-57.434a5.1 5.1 0 0 0 0-7.441l-61.262-57.434a5.1 5.1 0 0 0-7.209.233l-18.492 19.724a5.101 5.101 0 0 0 .351 7.317L278.275 304l-38.499 33.881a5.1 5.1 0 0 0-.351 7.317l18.492 19.724a5.1 5.1 0 0 0 7.209.232z"></path></svg> will export all the uploaded WADs as a JSON file that can be imported to wadJS later.

## WAD Name and Metadata

On this panel, you can see some data about the WAD, including its type (IWAD vs PWAD) and the size of the uploaded binary file.

You can also change the filename to your convenience, but it can not be empty.

Clicking on <svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" height="18" width="18"><path fill="black" d="M296 432h16a8 8 0 0 0 8-8V152a8 8 0 0 0-8-8h-16a8 8 0 0 0-8 8v272a8 8 0 0 0 8 8zm-160 0h16a8 8 0 0 0 8-8V152a8 8 0 0 0-8-8h-16a8 8 0 0 0-8 8v272a8 8 0 0 0 8 8zM440 64H336l-33.6-44.8A48 48 0 0 0 264 0h-80a48 48 0 0 0-38.4 19.2L112 64H8a8 8 0 0 0-8 8v16a8 8 0 0 0 8 8h24v368a48 48 0 0 0 48 48h288a48 48 0 0 0 48-48V96h24a8 8 0 0 0 8-8V72a8 8 0 0 0-8-8zM171.2 38.4A16.1 16.1 0 0 1 184 32h80a16.1 16.1 0 0 1 12.8 6.4L296 64H152zM384 464a16 16 0 0 1-16 16H80a16 16 0 0 1-16-16V96h320zm-168-32h16a8 8 0 0 0 8-8V152a8 8 0 0 0-8-8h-16a8 8 0 0 0-8 8v272a8 8 0 0 0 8 8z"></path></svg> will remove the WAD from your list.

Clicking on <svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" height="18" width="18"><path fill="black" d="M369.941 97.941l-83.882-83.882A48 48 0 0 0 252.118 0H48C21.49 0 0 21.49 0 48v416c0 26.51 21.49 48 48 48h288c26.51 0 48-21.49 48-48V131.882a48 48 0 0 0-14.059-33.941zm-22.627 22.628a15.89 15.89 0 0 1 4.195 7.431H256V32.491a15.88 15.88 0 0 1 7.431 4.195l83.883 83.883zM336 480H48c-8.837 0-16-7.163-16-16V48c0-8.837 7.163-16 16-16h176v104c0 13.255 10.745 24 24 24h104v304c0 8.837-7.163 16-16 16zm-161.471-67.404l-25.928-7.527a5.1 5.1 0 0 1-3.476-6.32l58.027-199.869a5.1 5.1 0 0 1 6.32-3.476l25.927 7.527a5.1 5.1 0 0 1 3.476 6.32L180.849 409.12a5.1 5.1 0 0 1-6.32 3.476zm-48.446-47.674l18.492-19.724a5.101 5.101 0 0 0-.351-7.317L105.725 304l38.498-33.881a5.1 5.1 0 0 0 .351-7.317l-18.492-19.724a5.1 5.1 0 0 0-7.209-.233L57.61 300.279a5.1 5.1 0 0 0 0 7.441l61.263 57.434a5.1 5.1 0 0 0 7.21-.232zm139.043.232l61.262-57.434a5.1 5.1 0 0 0 0-7.441l-61.262-57.434a5.1 5.1 0 0 0-7.209.233l-18.492 19.724a5.101 5.101 0 0 0 .351 7.317L278.275 304l-38.499 33.881a5.1 5.1 0 0 0-.351 7.317l18.492 19.724a5.1 5.1 0 0 0 7.209.232z"></path></svg> will export the WADs as a JSON file that can be imported to wadJS later.

## Lump Types

You can select the type of lumps you wish to view within a selected WAD.

Typical categories are "Maps", "Sounds", "Sprites", etc. If you do not find a lump in the expected category, you can always take a look into "Uncategorized", where you will find miscellani lumps along unsupported lump types.

## WAD Lumps

This part of the application shows details about the lumps that belong to a specific type.

If the WAD was provided the right palette, you should be able to view graphics in details.

## Settings

In the settings menu, you can adjust the behavior of wadJS:
* Play music in a loop: Turning this feature ON means that the media player will not stop playing music until you click on <svg role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" height="18" width="18">
        <path fill="black" d="M400 32H48C21.5 32 0 53.5 0 80v352c0 26.5 21.5 48 48 48h352c26.5 0 48-21.5 48-48V80c0-26.5-21.5-48-48-48z" />
    </svg>.
* Play next available track: Turning this feature ON means that the player will cycle through all the music in your uploaded WADs.
