var ven, ren;
var canvas_number = 10;
var urls = [];
var finished = 0;

function getDataFromCanvas(ctx, canvasName){
    var w = 256, h = 256;
    // Send pixels to server
    toServer(false, "None", "None", -1, 9, ctx.getImageData(0, 0, w, h).data);

    console.log("CTX: " + "-1");
}

function getData(gl, canvasName, id){
    var canvas = document.getElementById(canvasName);
    var WebGL;
    if(canvas.getContext('webgl'))
        WebGL = true;
    else
        WebGL = false;

    var pixels = new Uint8Array(256*256*4);
    gl.readPixels(0,0,256,256, gl.RGBA, gl.UNSIGNED_BYTE, pixels);

    var debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
    if(debugInfo){
        ven = gl.getParameter(debugInfo.UNMASKED_VENDOR_WEBGL);
        ren = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);
    }else{
        console.log("debugInfo is not accessable");
        ven = 'No debug Info';
        ren = 'No debug Info';
    }
    if(canvasName == 'texture_simple')
        toServer(WebGL, ven, ren, pixels.hashCode(), 0, pixels);
    else if(canvasName == 'texture_susan')
        toServer(WebGL, ven, ren, pixels.hashCode(), 1, pixels);
    else if(canvasName == 'simple_light_simple')
        toServer(WebGL, ven, ren, pixels.hashCode(), 2, pixels);
    else if(canvasName == 'simple_light_susan')
        toServer(WebGL, ven, ren, pixels.hashCode(), 3, pixels);
    else if(canvasName == 'more_light_simple')
        toServer(WebGL, ven, ren, pixels.hashCode(), 4, pixels);
    else if(canvasName == 'more_light_susan')
        toServer(WebGL, ven, ren, pixels.hashCode(), 5, pixels);
    else if(canvasName == 'transparent_simple')
        toServer(WebGL, ven, ren, pixels.hashCode(), 6, pixels);
    else if(canvasName == 'transparent_susan') {
        toServer(WebGL, ven, ren, pixels.hashCode(), 7, pixels);
    } else if (canvasName == 'vid_can_gl') {
        toServer(WebGL, ven, ren, pixels.hashCode(), 8, pixels);
    }

    console.log(canvasName + ": " + pixels.hashCode());
}

function toServer(WebGL, inc, gpu, hash, id, dataurl){ //send messages to server and receive messages from server
    urls[id] = dataurl;
    finished ++;
    if(finished < canvas_number) return;

    var pixels = "";
    for(var i = 0;i < canvas_number;++ i){
        pixels += stringify(urls[i]);
        if(i != canvas_number - 1) pixels += ' ';
    }
    postData = {WebGL: WebGL, inc: inc, gpu: gpu, hash: hash, pixels: pixels};

    $.ajax({
        url:"http://52.90.197.136/collect.py",
        dataType:"html",
        type: 'POST',
        data: JSON.stringify(postData),
        success:function(data) {
            alert(data);
        }
    });
}

stringify = function(array) {
    var str = '[';
    for (var i = 0, len = array.length; i < len; ++i) {
        if(i) str += ',';
        str += array[i].toString();
    }
    str += ']';
    return str;
}

Uint8Array.prototype.hashCode = function() {
    var hash = 0, i, chr, len;
    if (this.length === 0) return hash;
    for (i = 0, len = this.length; i < len; i++) {
        chr   = this[i];
        hash  = ((hash << 5) - hash) + chr;
        hash |= 0; // Convert to 32bit integer
    }
    return hash;
}