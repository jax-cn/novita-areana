# Using the Screen Capture API

Limited availability

This feature is not Baseline because it does not work in some of the most widely-used browsers.

- [Learn more](https://developer.mozilla.org/en-US/docs/Glossary/Baseline/Compatibility)
- [See full compatibility](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture#browser_compatibility)
- [Report feedback](https://survey.alchemer.com/s3/7634825/MDN-baseline-feedback?page=%2Fen-US%2Fdocs%2FWeb%2FAPI%2FScreen_Capture_API%2FUsing_Screen_Capture&level=not)

In this article, we will examine how to use the Screen Capture API and its [`getDisplayMedia()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia "getDisplayMedia()") method to capture part or all of a screen for streaming, recording, or sharing during a [WebRTC](https://developer.mozilla.org/en-US/docs/Web/API/WebRTC_API) conference session.

**Note:**
It may be useful to note that recent versions of the [WebRTC adapter.js shim](https://github.com/webrtcHacks/adapter) include implementations of `getDisplayMedia()` to enable screen sharing on browsers that support it but do not implement the current standard API. This works with at least Chrome, Edge, and Firefox.

## In this article

- [Capturing screen contents](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture#capturing_screen_contents)
- [Using the captured stream](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture#using_the_captured_stream)
- [Examples](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture#examples)
- [Security](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture#security)
- [Browser compatibility](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture#browser_compatibility)
- [See also](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture#see_also)

## [Capturing screen contents](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture\#capturing_screen_contents)

Capturing screen contents as a live [`MediaStream`](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream) is initiated by calling [`navigator.mediaDevices.getDisplayMedia()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia "navigator.mediaDevices.getDisplayMedia()"), which returns a promise that resolves to a stream containing the live screen contents. The `displayMediaOptions` object referenced in the below examples might look something like this:

jsCopy

```
const displayMediaOptions = {
  video: {
    displaySurface: "browser",
  },
  audio: {
    suppressLocalAudioPlayback: false,
  },
  preferCurrentTab: false,
  selfBrowserSurface: "exclude",
  systemAudio: "include",
  surfaceSwitching: "include",
  monitorTypeSurfaces: "include",
};
```

### [Starting screen capture: `async`/`await` style](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture\#starting_screen_capture_asyncawait_style)

jsCopy

```
async function startCapture(displayMediaOptions) {
  let captureStream = null;

  try {
    captureStream =
      await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
  } catch (err) {
    console.error(`Error: ${err}`);
  }
  return captureStream;
}
```

You can write this code either using an asynchronous function and the [`await`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await) operator, as shown above, or using the [`Promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) directly, as seen below.

### [Starting screen capture: `Promise` style](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture\#starting_screen_capture_promise_style)

jsCopy

```
function startCapture(displayMediaOptions) {
  return navigator.mediaDevices
    .getDisplayMedia(displayMediaOptions)
    .catch((err) => {
      console.error(err);
      return null;
    });
}
```

Either way, the [user agent](https://developer.mozilla.org/en-US/docs/Glossary/User_agent) responds by presenting a user interface that prompts the user to choose the screen area to share. Both of these implementations of `startCapture()` return the [`MediaStream`](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream) containing the captured display imagery.

See [Options and constraints](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture#options_and_constraints), below, for more on both how to specify the type of surface you want as well as other ways to adjust the resulting stream.

### [Example of a window allowing the user to select a display surface to capture](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture\#example_of_a_window_allowing_the_user_to_select_a_display_surface_to_capture)

![Screenshot of Chrome's window for picking a source surface](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture/chrome-screen-capture-window.png)

You can then use the captured stream, `captureStream`, for anything that accepts a stream as input. The [examples](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture#examples) below show a few ways to make use of the stream.

### [Visible vs. logical display surfaces](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture\#visible_vs._logical_display_surfaces)

For the purposes of the Screen Capture API, a **display surface** is any content object that can be selected by the API for sharing purposes. Sharing surfaces include the contents of a browser tab, a complete window, and a monitor (or group of monitors combined together into one surface).

There are two types of display surface. A **visible display surface** is a surface which is entirely visible on the screen, such as the frontmost window or tab, or the entire screen.

A **logical display surface** is one which is in part or completely obscured, either by being overlapped by another object to some extent, or by being entirely hidden or offscreen. How these are handled by the Screen Capture API varies. Generally, the browser will provide an image which obscures the hidden portion of the logical display surface in some way, such as by blurring or replacing with a color or pattern. This is done for security reasons, as the content that cannot be seen by the user may contain data which they do not want to share.

A user agent might allow the capture of the entire content of an obscured window after gaining permission from the user to do so. In this case, the user agent may include the obscured content, either by getting the current contents of the hidden portion of the window or by presenting the most-recently-visible contents if the current contents are not available.

### [Options and constraints](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture\#options_and_constraints)

The options object passed into [`getDisplayMedia()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia "getDisplayMedia()") is used to set options for the resulting stream.

The `video` and `audio` objects passed into the options object can also hold additional constraints particular to those media tracks. See [Properties of shared screen tracks](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints#instance_properties_of_shared_screen_tracks) for details about additional constraints for configuring a screen-capture stream that are added to [`MediaTrackConstraints`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints), [`MediaTrackSupportedConstraints`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackSupportedConstraints), and [`MediaTrackSettings`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackSettings)).

None of the constraints are applied in any way until after the content to capture has been selected. The constraints alter what you see in the resulting stream. For example, if you specify a [`width`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/width "width") constraint for the video, it's applied by scaling the video after the user selects the area to share. It doesn't establish a restriction on the size of the source itself.

**Note:**
Constraints _never_ cause changes to the list of sources available for capture by the Screen Sharing API. This ensures that web applications can't force the user to share specific content by restricting the source list until only one item is left.

While display capture is in effect, the machine which is sharing screen contents will display some form of indicator so the user is aware that sharing is taking place.

**Note:**
For privacy and security reasons, screen sharing sources are not enumerable using [`enumerateDevices()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/enumerateDevices "enumerateDevices()"). Related to this, the [`devicechange`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/devicechange_event "devicechange") event is never sent when there are changes to the sources available for `getDisplayMedia()`.

### [Capturing shared audio](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture\#capturing_shared_audio)

[`getDisplayMedia()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia "getDisplayMedia()") is most commonly used to capture video of a user's screen (or parts thereof). However, [user agents](https://developer.mozilla.org/en-US/docs/Glossary/User_agent) may allow the capture of audio along with the video content. The source of this audio might be the selected window, the entire computer's audio system, or the user's microphone (or a combination of all of the above).

Before starting a project that will require sharing of audio, be sure to check the [browser compatibility](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia#browser_compatibility) for `getDisplayMedia()` to see if the browsers you wish compatibility with have support for audio in captured screen streams.

To request that the screen be shared with included audio, the options passed into `getDisplayMedia()` might look like this:

jsCopy

```
const displayMediaOptions = {
  video: true,
  audio: true,
};
```

This allows the user total freedom to select whatever they want, within the limits of what the user agent supports. This could be refined further by specifying additional options, and constraints inside the `audio` and `video` objects:

jsCopy

```
const displayMediaOptions = {
  video: {
    displaySurface: "window",
  },
  audio: {
    echoCancellation: true,
    noiseSuppression: true,
    sampleRate: 44100,
    suppressLocalAudioPlayback: true,
  },
  surfaceSwitching: "include",
  selfBrowserSurface: "exclude",
  systemAudio: "exclude",
};
```

In this example the display surface captured is to be the whole window. The audio track should ideally have noise suppression and echo cancellation features enabled, as well as an ideal audio sample rate of 44.1kHz, and suppression of local audio playback.

In addition, the app is hinting to the user agent that it should:

- Provide a control during screen sharing to allow the user to dynamically switch the shared tab.
- Hide the current tab from the list of options presented to the user when capture is requested.
- Not include the system audio among the possible audio sources offered to the user.

Capturing audio is always optional, and even when web content requests a stream with both audio and video, the returned [`MediaStream`](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream) may still have only one video track, with no audio.

## [Using the captured stream](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture\#using_the_captured_stream)

The [`promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) returned by [`getDisplayMedia()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia "getDisplayMedia()") resolves to a [`MediaStream`](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream) that contains at least one video stream that contains the screen or screen area, and which is adjusted or filtered based upon the constraints specified when `getDisplayMedia()` was called.

### [Potential risks](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture\#potential_risks)

Privacy and security issues surrounding screen sharing are usually not overly serious, but they do exist. The largest potential issue is users inadvertently sharing content they did not wish to share.

For example, privacy and/or security violations can easily occur if the user is sharing their screen and a visible background window happens to contain personal information, or if their password manager is visible in the shared stream. This effect can be amplified when capturing logical display surfaces, which may contain content that the user doesn't know about at all, let alone see.

User agents which take privacy seriously should obfuscate content that is not actually visible onscreen, unless authorization has been given to share that content specifically.

### [Authorizing capture of display contents](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture\#authorizing_capture_of_display_contents)

Before streaming of captured screen contents can begin, the [user agent](https://developer.mozilla.org/en-US/docs/Glossary/User_agent) will ask the user to confirm the sharing request, and to select the content to share.

## [Examples](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture\#examples)

### [Streaming screen capture](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture\#streaming_screen_capture)

In this example, the contents of the captured screen area are streamed into a [`<video>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video) element on the same page.

#### JavaScript

There isn't all that much code needed in order to make this work, and if you're familiar with using [`getUserMedia()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getUserMedia "getUserMedia()") to capture video from a camera, you'll find [`getDisplayMedia()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia "getDisplayMedia()") to be very familiar.

##### Setup

First, some constants are set up to reference the elements on the page to which we'll need access: the [`<video>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video) into which the captured screen contents will be streamed, a box into which logged output will be drawn, and the start and stop buttons that will turn on and off capture of screen imagery.

The object `displayMediaOptions` contains the options to pass into `getDisplayMedia()`; here, the [`displaySurface`](https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackConstraints/displaySurface "displaySurface") property is set to `window`, indicating that the whole window should be captured.

Finally, event listeners are established to detect user clicks on the start and stop buttons.

jsCopyPlay

```
const videoElem = document.getElementById("video");
const logElem = document.getElementById("log");
const startElem = document.getElementById("start");
const stopElem = document.getElementById("stop");

// Options for getDisplayMedia()

const displayMediaOptions = {
  video: {
    displaySurface: "window",
  },
  audio: false,
};

// Set event listeners for the start and stop buttons
startElem.addEventListener("click", (evt) => {
  startCapture();
});

stopElem.addEventListener("click", (evt) => {
  stopCapture();
});
```

##### Logging content

This example overrides certain [`console`](https://developer.mozilla.org/en-US/docs/Web/API/console) methods to output their messages to the [`<pre>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/pre) block whose ID is `log`.

jsCopyPlay

```
console.log = (msg) => (logElem.textContent = `${logElem.textContent}\n${msg}`);
console.error = (msg) =>
  (logElem.textContent = `${logElem.textContent}\nError: ${msg}`);
```

This allows us to use [`console.log()`](https://developer.mozilla.org/en-US/docs/Web/API/console/log_static "console.log()") and [`console.error()`](https://developer.mozilla.org/en-US/docs/Web/API/console/error_static "console.error()") to log information to the log box in the document.

##### Starting display capture

The `startCapture()` method, below, starts the capture of a [`MediaStream`](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream) whose contents are taken from a user-selected area of the screen. `startCapture()` is called when the "Start Capture" button is clicked.

jsCopyPlay

```
async function startCapture() {
  logElem.textContent = "";

  try {
    videoElem.srcObject =
      await navigator.mediaDevices.getDisplayMedia(displayMediaOptions);
    dumpOptionsInfo();
  } catch (err) {
    console.error(err);
  }
}
```

After clearing the contents of the log in order to get rid of any leftover text from the previous attempt to connect, `startCapture()` calls [`getDisplayMedia()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaDevices/getDisplayMedia "getDisplayMedia()"), passing into it the constraints object defined by `displayMediaOptions`. Using [`await`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/await), the following line of code does not get executed until after the [`promise`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise) returned by `getDisplayMedia()` resolves. Upon resolution, the promise returns a [`MediaStream`](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream), which will stream the contents of the screen, window, or other region selected by the user.

The stream is connected to the [`<video>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video) element by storing the returned `MediaStream` into the element's [`srcObject`](https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/srcObject "srcObject").

The `dumpOptionsInfo()` function—which we will look at in a moment—dumps information about the stream to the log box for educational purposes.

If any of that fails, the [`catch()`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/try...catch) clause outputs an error message to the log box.

##### Stopping display capture

The `stopCapture()` method is called when the "Stop Capture" button is clicked. It stops the stream by getting its track list using [`MediaStream.getTracks()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream/getTracks), then calling each track's [`stop()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/stop "stop()") method. Once that's done, `srcObject` is set to `null` to make sure it's understood by anyone interested that there's no stream connected.

jsCopyPlay

```
function stopCapture(evt) {
  let tracks = videoElem.srcObject.getTracks();

  tracks.forEach((track) => track.stop());
  videoElem.srcObject = null;
}
```

##### Dumping configuration information

For informational purposes, the `startCapture()` method shown above calls a method named `dumpOptions()`, which outputs the current track settings as well as the constraints that were placed upon the stream when it was created.

jsCopyPlay

```
function dumpOptionsInfo() {
  const videoTrack = videoElem.srcObject.getVideoTracks()[0];

  console.log("Track settings:");
  console.log(JSON.stringify(videoTrack.getSettings(), null, 2));
  console.log("Track constraints:");
  console.log(JSON.stringify(videoTrack.getConstraints(), null, 2));
}
```

The track list is obtained by calling [`getVideoTracks()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream/getVideoTracks "getVideoTracks()") on the captured screen's [`MediaStream`](https://developer.mozilla.org/en-US/docs/Web/API/MediaStream). The settings currently in effect are obtained using [`getSettings()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/getSettings "getSettings()") and the established constraints are gotten with [`getConstraints()`](https://developer.mozilla.org/en-US/docs/Web/API/MediaStreamTrack/getConstraints "getConstraints()")

#### HTML

The HTML starts with an introductory paragraph, then gets into the meat of things.

htmlCopyPlay

```
<p>
  This example shows you the contents of the selected part of your display.
  Click the Start Capture button to begin.
</p>

<p>
  <button id="start">Start Capture</button>&nbsp;<button id="stop">
    Stop Capture
  </button>
</p>

<video id="video" autoplay></video>
<br />

<strong>Log:</strong>
<br />
<pre id="log"></pre>
```

The key parts of the HTML are:

1. A [`<button>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/button) labeled "Start Capture" which, when clicked, calls the `startCapture()` function to request access to, and begin capturing, screen contents.
2. A second button, "Stop Capture", which upon being clicked calls `stopCapture()` to terminate capture of screen contents.
3. A [`<video>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/video) into which the captured screen contents are streamed.
4. A [`<pre>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/pre) block into which logged text is placed by the intercepted [`console`](https://developer.mozilla.org/en-US/docs/Web/API/console) method.

#### CSS

The CSS is entirely cosmetic in this example. The video is given a border, and its width is set to occupy nearly the entire available horizontal space (`width: 98%`). [`max-width`](https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Properties/max-width) is set to `860px` to set an absolute upper limit on the video's size,

cssCopyPlay

```
#video {
  border: 1px solid #999999;
  width: 98%;
  max-width: 860px;
}

#log {
  width: 25rem;
  height: 15rem;
  border: 1px solid black;
  padding: 0.5rem;
  overflow: scroll;
}
```

#### Result

The final product looks like this. If your browser supports Screen Capture API, clicking "Start Capture" will present the [user agent's](https://developer.mozilla.org/en-US/docs/Glossary/User_agent) interface for selecting a screen, window, or tab to share.

Play

This example shows you the contents of the selected part of your display.
Click the Start Capture button to begin.

Start Capture
Stop Capture


**Log:**

```

```

## [Security](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture\#security)

In order to function when [Permissions Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Permissions_Policy) is enabled, you will need the `display-capture` permission. This can be done using the [`Permissions-Policy`](https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Permissions-Policy) [HTTP](https://developer.mozilla.org/en-US/docs/Glossary/HTTP) header or—if you're using the Screen Capture API in an [`<iframe>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe), the `<iframe>` element's [`allow`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe#allow) attribute.

For example, this line in the HTTP headers will enable Screen Capture API for the document and any embedded [`<iframe>`](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/iframe) elements that are loaded from the same origin:

httpCopy

```
Permissions-Policy: display-capture=(self)
```

If you're performing screen capture within an `<iframe>`, you can request permission just for that frame, which is clearly more secure than requesting permission more generally:

htmlCopy

```
<iframe src="https://mycode.example.net/etc" allow="display-capture"> </iframe>
```

## [Browser compatibility](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture\#browser_compatibility)

[Report problems with this compatibility data](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture# "Report an issue with this compatibility data") •
[View data on GitHub](https://github.com/mdn/browser-compat-data/tree/main/api/MediaDevices.json "File: ⁨api/MediaDevices.json⁩")

|  | desktop | mobile |
| --- | --- | --- |
|  | Chrome | Edge | Firefox | Opera | Safari | Chrome Android | Firefox for Android | Opera Android | Safari on iOS | Samsung Internet | WebView Android | WebView on iOS |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `getDisplayMedia()` | Chrome – Full support<br>Chrome72 | Edge – Full support<br>Edge79<br>more | Firefox – Full support<br>Firefox66<br>more | Opera – Full support<br>Opera60 | Safari – Full support<br>Safari13 | Chrome Android – No support<br>Chrome AndroidNo<br> <br>footnote | Firefox for Android – No support<br>Firefox for AndroidNo<br> <br>footnote | Opera Android – No support<br>Opera AndroidNo<br> <br>footnote | Safari on iOS – No support<br>Safari on iOSNo | Samsung Internet – No support<br>Samsung InternetNo<br> <br>footnote | WebView Android – No support<br>WebView AndroidNo<br> <br>footnote | WebView on iOS – No support<br>WebView on iOSNo |
| [Audio capture support](https://developer.mozilla.org/en-US/docs/Web/API/Screen_Capture_API/Using_Screen_Capture#capturing_shared_audio) | Chrome – Full support<br>Chrome74<br>footnote | Edge – Full support<br>Edge79<br>footnote | Firefox – No support<br>FirefoxNo | Opera – Full support<br>Opera62<br>footnote | Safari – No support<br>SafariNo | Chrome Android – No support<br>Chrome AndroidNo | Firefox for Android – No support<br>Firefox for AndroidNo | Opera Android – No support<br>Opera AndroidNo | Safari on iOS – No support<br>Safari on iOSNo | Samsung Internet – No support<br>Samsung InternetNo | WebView Android – No support<br>WebView AndroidNo | WebView on iOS – No support<br>WebView on iOSNo |
| `controller` option<br>Experimental | Chrome – Full support<br>Chrome109 | Edge – Full support<br>Edge109 | Firefox – No support<br>FirefoxNo | Opera – Full support<br>Opera95 | Safari – No support<br>SafariNo | Chrome Android – No support<br>Chrome AndroidNo | Firefox for Android – No support<br>Firefox for AndroidNo | Opera Android – No support<br>Opera AndroidNo | Safari on iOS – No support<br>Safari on iOSNo | Samsung Internet – No support<br>Samsung InternetNo | WebView Android – No support<br>WebView AndroidNo | WebView on iOS – No support<br>WebView on iOSNo |
| `monitorTypeSurfaces` option<br>Experimental | Chrome – Full support<br>Chrome119<br>footnote | Edge – Full support<br>Edge119<br>footnote | Firefox – No support<br>FirefoxNo | Opera – Full support<br>Opera105<br>footnote | Safari – No support<br>SafariNo | Chrome Android – No support<br>Chrome AndroidNo | Firefox for Android – No support<br>Firefox for AndroidNo | Opera Android – No support<br>Opera AndroidNo | Safari on iOS – No support<br>Safari on iOSNo | Samsung Internet – No support<br>Samsung InternetNo | WebView Android – No support<br>WebView AndroidNo | WebView on iOS – No support<br>WebView on iOSNo |
| `preferCurrentTab` option<br>ExperimentalNon-standard | Chrome – Full support<br>Chrome94<br>footnote | Edge – Full support<br>Edge94<br>footnote | Firefox – No support<br>FirefoxNo | Opera – Full support<br>Opera80<br>footnote | Safari – No support<br>SafariNo | Chrome Android – No support<br>Chrome AndroidNo | Firefox for Android – No support<br>Firefox for AndroidNo | Opera Android – No support<br>Opera AndroidNo | Safari on iOS – No support<br>Safari on iOSNo | Samsung Internet – No support<br>Samsung InternetNo | WebView Android – No support<br>WebView AndroidNo | WebView on iOS – No support<br>WebView on iOSNo |
| `selfBrowserSurface` option<br>Experimental | Chrome – Full support<br>Chrome112<br>footnotemore | Edge – Full support<br>Edge112<br>footnotemore | Firefox – No support<br>FirefoxNo | Opera – Full support<br>Opera98<br>footnotemore | Safari – No support<br>SafariNo | Chrome Android – No support<br>Chrome AndroidNo | Firefox for Android – No support<br>Firefox for AndroidNo | Opera Android – No support<br>Opera AndroidNo | Safari on iOS – No support<br>Safari on iOSNo | Samsung Internet – No support<br>Samsung InternetNo | WebView Android – No support<br>WebView AndroidNo | WebView on iOS – No support<br>WebView on iOSNo |
| `surfaceSwitching` option<br>Experimental | Chrome – Full support<br>Chrome107<br>footnote | Edge – Full support<br>Edge107<br>footnote | Firefox – No support<br>FirefoxNo | Opera – Full support<br>Opera93<br>footnote | Safari – No support<br>SafariNo | Chrome Android – No support<br>Chrome AndroidNo | Firefox for Android – No support<br>Firefox for AndroidNo | Opera Android – No support<br>Opera AndroidNo | Safari on iOS – No support<br>Safari on iOSNo | Samsung Internet – No support<br>Samsung InternetNo | WebView Android – No support<br>WebView AndroidNo | WebView on iOS – No support<br>WebView on iOSNo |
| `systemAudio` option<br>Experimental | Chrome – Full support<br>Chrome105<br>footnote | Edge – Full support<br>Edge105<br>footnote | Firefox – No support<br>FirefoxNo | Opera – Full support<br>Opera91<br>footnote | Safari – No support<br>SafariNo | Chrome Android – No support<br>Chrome AndroidNo | Firefox for Android – No support<br>Firefox for AndroidNo | Opera Android – No support<br>Opera AndroidNo | Safari on iOS – No support<br>Safari on iOSNo | Samsung Internet – No support<br>Samsung InternetNo | WebView Android – No support<br>WebView AndroidNo | WebView on iOS – No support<br>WebView on iOSNo |
| `windowAudio` option<br>Experimental | Chrome – Partial support<br>Chrome141 | Edge – No support<br>Edge141 – 142 | Firefox – No support<br>FirefoxNo | Opera – Partial support<br>Opera125 | Safari – No support<br>SafariNo | Chrome Android – No support<br>Chrome AndroidNo | Firefox for Android – No support<br>Firefox for AndroidNo | Opera Android – No support<br>Opera AndroidNo | Safari on iOS – No support<br>Safari on iOSNo | Samsung Internet – No support<br>Samsung InternetNo | WebView Android – No support<br>WebView AndroidNo | WebView on iOS – No support<br>WebView on iOSNo |
