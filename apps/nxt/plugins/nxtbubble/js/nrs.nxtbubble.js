/**
 * @depends {nrs.js}
 */
var NRS = (function(NRS, $, undefined) {

  var setHeight = function() {
    var height = $(window).height() - 100;
    $('.p_nxtbubble_iframe').css('height', height+'px');
  }

  NRS.setup.p_nxtbubble = function() {

    setHeight();

    $(window).on('resize', function() {
      setHeight();
    });

  }

  return NRS;

}(NRS || {}, jQuery));
//@ sourceURL=nrs.nxtbubble.js

