# Specs

## General goal

The aim of this app is to allow users to view and edit the content of Doom WAD files regardless of their Operating System and device.

## Why is it important?

Because many tools that are useful to the members of the Doom community only run on Windows or could use a better user experience.

## How will wadJS achieve this goal?

The app will be written purely in JavaScript and fully contained in the user's client. No back end will be necessary to store user data.


The website will be hosted on GitHub Pages servers for free. The integration with GitHub will allow faster development cycles. New versions of the app will be made available within seconds after compilation.

## Scope of this project

This app will emphasize a great experience thanks to modern JavaScript features such as Workers, OffscreenCanvas, MediaSession, AudioContext, and more. Additional technologies will ensure that the content is responsive and fits all screen sizes. The code will also follow a11y standards to improve acessibility.

wadJS will be at least capable of unpacking the following IWADs: doom.wad, doom1.wad, doom2.wad, tnt.wad, plutonia.wad, freedoom1.wad, freedoom2.wad, heretic.wad, and hexen.wad. More IWADs (Chex Quest, Strife, etc.) might be supported in the future.

The app will also be able to unpack PWADs that are vanilla compatible. It will unpack non-vanilla compatible PWADs within certain limits.

## Limits

Due to the use of bleeding edge features, the app primary goal is not to be compatible with older browsers such as Internet Explorer.

Given the fact that the app is contained within the limits of the browser, the amount of user data stored in memory might be limited. We remain convinced that modern clients can handle the task at hand here and we will research ways to circumvent these limits.

Since target users are gamers with fast machines, wasJS will not be too concerned with the high amount of operations and computations it requires to successfully binary data to objects that can be rendered in a human-friendly format.

## User Interface first


