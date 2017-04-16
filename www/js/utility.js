/**
 * Survey the size of image
 *
 * @param string src [optional]
 */
$.imageSize = function(src) {
  var imgSize = { w: 0, h: 0 };
  var img = new Image();
  img.src = src;
  imgSize.w = img.width;
  imgSize.h = img.height;
  return imgSize;
};

/**
 * Functions supported multibyte string
 */
$.isSurrogatePear = function( upper, lower ) {
  return 0xD800 <= upper && upper <= 0xDBFF && 0xDC00 <= lower && lower <= 0xDFFF;
};
$.mb_strlen = function( str ) {
  var ret = 0;
  for (var i = 0; i < str.length; i++,ret++) {
    var upper = str.charCodeAt(i);
    var lower = str.length > (i + 1) ? str.charCodeAt(i + 1) : 0;
    if ( $.isSurrogatePear( upper, lower ) ) { i++; }
  }
  return ret;
};
$.mb_substr = function( str, begin, end ) {
  var ret = '';
  for (var i = 0, len = 0; i < str.length; i++, len++) {
    var upper = str.charCodeAt(i);
    var lower = str.length > (i + 1) ? str.charCodeAt(i + 1) : 0;
    var s = '';
    if( $.isSurrogatePear( upper, lower ) ) {
      i++;
      s = String.fromCharCode( upper, lower );
    } else {
      s = String.fromCharCode( upper );
    }
    if ( begin <= len && len < end ) { ret += s; }
  }
  return ret;
};

/**
 * base64 encodeをデコードしてBlobオブジェクトにする
 * @return {Blob} Blobオブジェクトを返す
 */
function dataURItoBlob(dataURI) {
    var byteString = atob(dataURI.split(',')[1]);
    var ab = new ArrayBuffer(byteString.length);
    var ia = new Uint8Array(ab);
    for (var i = 0; i < byteString.length; i++) {
        ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], {type: 'image/png'});
}
