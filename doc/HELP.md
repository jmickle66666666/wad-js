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

Clicking on ![trash](./static/trash.svg) will remove all the uploaded WADs from the list.

Clicking on ![code file](./static/codefile.svg) will export all the uploaded WADs as a JSON file that can be imported to wadJS later.

## WAD Name and Metadata

On this panel, you can see some data about the WAD, including its type (IWAD vs PWAD) and the size of the uploaded binary file.

You can also change the filename to your convenience, but it can not be empty.

Clicking on ![trash](./static/trash.svg) will remove the WAD from your list.

Clicking on ![code file](./static/codefile.svg) will export the WADs as a JSON file that can be imported to wadJS later.

## Lump Types

You can select the type of lumps you wish to view within a selected WAD.

Typical categories are "Maps", "Sounds", "Sprites", etc. If you do not find a lump in the expected category, you can always take a look into "Uncategorized", where you will find miscellani lumps along unsupported lump types.

## WAD Lumps

This part of the application shows details about the lumps that belong to a specific type.

If the WAD was provided the right palette, you should be able to view graphics in details.

## Settings

In the settings menu, you can adjust the behavior of wadJS:
* Play music in a loop: Turning this feature ON means that the media player will continue playing music once it reaches the end of a track.

* Play next available track: Turning this feature ON means that the player will cycle through all the music in your uploaded WADs.
