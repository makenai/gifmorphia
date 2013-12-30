var http       = require('http')
  , fs         = require('fs')
  , st         = require('st')
  , url        = require('url')
  , omggif     = require('./lib/omggif')

function GifMorphia() {
 
  this.server = http.createServer( function(req, res) {
    this.handler(req, res)
  }.bind(this))

  this.server.listen(8080)
  console.log('Listening on http://localhost:8080')
}

GifMorphia.prototype = {

  // TODO why does it cache
  handler: function( req, res ) {
    var mount = st({
      cache: false,
      index: 'index.html',
      path: __dirname + '/static',
    })
    if ( req.url.indexOf('/gif') == 0 )
      return this.handle_gif(req, res)
    mount(req, res);
  },

  handle_gif: function( req, res ) {

    var in_buffer = fs.readFileSync('gifs/pizza3.gif'),
      gr = new omggif.GifReader(in_buffer),
      frames = gr.numFrames(),
      out_buffer = new Buffer( in_buffer.length + 1024 ), // account for extra space after messing up LZW ratio with shifts
      parsed = url.parse(req.url, true)

    // TODO handle local and global palettes correctly
    var frame = gr.getFrame(1)

    if ( colorShift = parsed.query['a'] ) {
      frame.palette = frame.palette.concat( frame.palette.splice(0,colorShift) );
    }

    // TODO get default delay
    var delay = 0;
    if ( delayFactor = parsed.query['x'] ) {
      delay = delayFactor;
    }
 
    var gf = new omggif.GifWriter(out_buffer, gr.width, gr.height, { palette: frame.palette, loop: 0 });
    for (var i=0;i<gr.numFrames();i++) {
      frame = gr.getFrame(i)

      // TODO fix lockup bug on pizza.gif
      if ( pixelShift = parsed.query['b'] ) {
        frame.pixels = frame.pixels.concat( frame.pixels.splice(0,pixelShift) );
      }

      gf.addFrame( frame.x, frame.y, frame.width, frame.height, frame.pixels, { delay: delay });   
    }
   
    res.writeHead(200, {'Content-Type': 'image/gif'})
    res.end( out_buffer.slice( 0, gf.end() ) )
  }

}

var app = new GifMorphia()