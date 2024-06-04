# stashapp_plugin_background_images
Stash App plugin to display randomized background images from your collection in the UI.

## Description
This Stash App plugin sets a dynamic full-page background image in the Stash app UI. Using images from your collection, this plugin will retrieve & set an image as the page background to add extra eye candy for loading states and general browsing. This plugin can be used with any Stash theme but works best with themes that utilize transparency for elements ([like my custom Plex theme](https://github.com/ed36080666/stashapp_theme_plex_redux)).

### Examples
- [Example Image 1](/assets/example_img.JPG)
- [Example Image 2](/assets/example_img1.JPG)
- [Example GIF default theme](/assets/example_gif.gif)
- [Example GIF Plex theme](/assets/example_plex.gif)

## How it Works
You will create either a tag -OR- gallery which the plugin will use to retrieve a random image and display as a background. After tagging or adding your images to a gallery, you will set the ID of the entity (tag or gallery) in the plugin settings and on page load the plugin will query an image at random from the given ID and set it as the background.

## Installation
1. Go to Settings > Plugins > Available Plugins > Add Source:  ([image](/assets/settings.JPG))
2. At the bottom of the "Available Plugins" list click: "Add Source" and paste the [raw index.yml file](https://raw.githubusercontent.com/ed36080666/stashapp_plugin_background_images/main/index.yml) in the root directory of this repo ([image](/assets/settings1.JPG))
3. Select and install the plugin from the "Available Plugins" section [image](/assets/settings2.JPG)
4. Scroll to the "Plugins" section, configure the plugin, and click the "Enable" button.

#### 2 ways to configure this plugin
1. *(default)* Display a random background image from a given tag -OR- gallery on every page in the Stash UI.
2. *(optional)* Display a random background image on every page *except* when viewing a specific performer page. With "Unique Performer Images" enabled, the plugin will retrieve a background image containing the performer. By default, performer-specific images will use the same source as the global backgrounds but can be configured to pull from an entirely separate source (e.g. global backgrounds come from a gallery and the performer-specific images use a tag).

### Basic Configuration
#### Global Backgrounds
Determine the source you will use to source the background:

1. **USING TAG:** Create a tag and assign it to all of the images you would like to use as global backgrounds. Find the ID of the tag and enter it into the `Global Background Source ID` option in the plugin settings. Ensure the `GLOBAL BACKGROUND GALLERY MODE` option is **disabled**. Tag ID can be found in the page URL when viewing the specific tag's page.

2. **USING GALLERY:** Create a new gallery and add all of the images you would like to use as global backgrounds. Find the ID of the gallery and enter it into the `Global Background Source ID` option in the plugin settings. Ensure the `GLOBAL BACKGROUND GALLERY MODE` option is **enabled**. Gallery ID can be found in the page URL when viewing the specific gallery's page.

#### Unique Performer Images *(optional)*
When `Unique Performer Images` is enabled, this plugin will retrieve and set different a background image containing the viewed performer when viewing a performer's page. If an image containing the performer can not be found, no background image will be displayed.

When this mode is enabled, you should also set the source where the unique performer images are pulled. This can be the same source as global backgrounds or an entirely different source. `Performer Background Gallery Mode` and `Performer Source ID` will be configured in the same way as the global images (see instructions: 1 + 2 above).

## Example
In this example, the global background images are pulled from a `gallery` with an ID of `251`. Unique performer images is enabled, and when viewing a performer page, the plugin will retrieve images of the viewed performer that are tagged using a `tag` with an ID of `1154`.

![image](/assets/config.JPG)
