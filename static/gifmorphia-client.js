var controller = new Leap.Controller();

// controller.EnableGesture('swipe');

var rangeBounds = {
  x: [999,0],
  y: [999,0],
  z: [999,0]
};

var rangeMaximums = {
  x: 500,
  y: 100,
  z: 100
};

var decayRate = 0.35;

function getSeconds() {
  return new Date() / 1000;
}

var lastHandMovement = getSeconds();

controller.on('connect', function() {
  console.log("Successfully connected.");
});

controller.on('frame', function(frame) {

  if ( frame.gestures.length > 0 ) {
    console.log( frame.gestures[0] )
  }


  if ( frame.hands.length > 0 ) {

        var hand = frame.hands[0];
        var position = hand.stabilizedPalmPosition;
        var pos = {
          x: position[0],
          y: position[2],
          z: position[1]          
        }

        $.each([ 'x', 'y', 'z' ], function(index,n) {
      
          // Set high and low range bounds
          if ( pos[n] < rangeBounds[n][0] ) 
            rangeBounds[n][0] = pos[n];
          if ( pos[n] > rangeBounds[n][1] ) 
            rangeBounds[n][1] = pos[n];

          var percentage = ( ( pos[n] - rangeBounds[n][0] ) / rangeBounds[n][1] );

          $( '#' + n + 'Graph' ).css( 'width', ( percentage * 100 ) + '%' );

          $( '#' + n ).val( Math.round( percentage * rangeMaximums[n] ) );

        });

        lastHandMovement = getSeconds();
  }

});

// Decay Rate
setInterval(function() {
  if ( getSeconds() - lastHandMovement > 1 ) {

    $.each([ 'x', 'y', 'z' ], function(index,n) {

      $( '#' + n ).val( Math.round( decayRate * $( '#' + n ).val() ) );

    });
    $('#x').change();

  }
}, 500);



// Change Rate
setInterval(function() {
  if ( getSeconds() - lastHandMovement <= 1 ) {
    $('#x').change();
  }
}, 1000);

controller.connect();

$( document ).ready(function() {

  $('#variables').on('change', 'input', function(e) {
    e.preventDefault();
    var queryString = 'x=' + $('#x').val()+ '&y=' + $('#y').val()+ '&z=' + $('#z').val();
    // console.log( queryString );
    $('#gif').attr('src', '/image?' + queryString);
  });

  $( document ).keypress(function() {
    console.log('hat');
    $.getJSON('/swap');
  });

});