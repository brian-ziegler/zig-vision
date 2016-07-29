# zig-vision

### Bookmarklet
```
javascript:(function(){
    $("head").append("
        <script src='https://rawgit.com/brian-ziegler/zig-vision/master/index.js'></script>
        <link rel='stylesheet' href='https://rawgit.com/brian-ziegler/zig-vision/master/index.css' type='text/css' />
    ");
})();
```

### Dev Bookmarklet
```
javascript:{
    $("head").append("<link rel='stylesheet' href='https://rawgit.com/brian-ziegler/zig-vision/master/index.css' type='text/css' />");
<<< Insert JS Code Here >>> 
};void(0);
```

### A Note On Scan Frequency
Anything less than 12s tends to start seeing some throttling from pokevision.com

### Useful Scan Point Patterns
```
Small - [{"deg":0,"dist":0}]
Medium - [{"deg":0,"dist":0},{"deg":0,"dist":216.5},{"deg":60,"dist":216.5},{"deg":120,"dist":216.5},{"deg":180,"dist":216.5},{"deg":240,"dist":216.5},{"deg":300,"dist":216.5}]
Large - [{"deg":0,"dist":0},{"deg":0,"dist":216.5},{"deg":60,"dist":216.5},{"deg":120,"dist":216.5},{"deg":180,"dist":216.5},{"deg":240,"dist":216.5},{"deg":300,"dist":216.5},{"deg":0,"dist":433},{"deg":30,"dist":375},{"deg":60,"dist":433},{"deg":90,"dist":375},{"deg":120,"dist":433},{"deg":150,"dist":375},{"deg":180,"dist":433},{"deg":210,"dist":375},{"deg":240,"dist":433},{"deg":270,"dist":375},{"deg":300,"dist":433},{"deg":330,"dist":375}]
```

### Pushbullet Info
See [pushbullet.com] (https://www.pushbullet.com/)

### Scan Redius vs. Notification Radius
Scanning happens against the actual Pokemon Go service.  It appears that their scan radius is 125m, and this value is hard coded in the app.  
However, pokevision maintains its own repository of pokemon that they have found through user scanning.  As we look around their service we will see other pokemon that other users have found through scanning.  The radius on this is much larger than 125m, more like 1000m (??).
I use my own defined notification radius to limit what will actuall trigger a notification to get sent.

