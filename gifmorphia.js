var http       = require('http')
  , fs         = require('fs')
  , st         = require('st')
  , omggif      = require('./lib/omggif')

function GifMorphia() {
 
  this.server = http.createServer( function(req, res) {
    this.handler(req, res)
  }.bind(this))

  this.server.listen(1338)
  console.log('Listening on http://localhost:1338')
}

GifMorphia.prototype = {

  handler: function( req, res ) {
    var mount = st({
      cache: false,
      index: 'index.html',
      path: __dirname + '/static',
    })
    if ( req.url == '/gif' )
      return this.handle_gif(req, res)
    mount(req, res);
  },

  handle_gif: function( req, res ) {

    var in_buffer = fs.readFileSync('gifs/pizza.gif'),
      gr = new omggif.GifReader(in_buffer),
      frames = gr.numFrames(),
      out_buffer = new Buffer( in_buffer.length )

    // TODO handle local and global palettes correctly
    var frame = gr.getFrame(1)
    var gf = new omggif.GifWriter(out_buffer, gr.width, gr.height, { palette: frame.palette, loop: 0 });
    for (var i=0;i<gr.numFrames();i++) {
      frame = gr.getFrame(i)
      gf.addFrame( frame.x, frame.y, frame.width, frame.height, frame.pixels );   
    }
   
    res.writeHead(200, {'Content-Type': 'image/gif'})
    res.end( out_buffer.slice( 0, gf.end() ) )
  }

}

var app = new GifMorphia()