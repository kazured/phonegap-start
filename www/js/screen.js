var $html;
var $mask;

/**
 * ローディングの表示開始
 */
var startLoading = function() {
  $html.append($mask);
  $.mobile.loading( "show", {
    text: $.mobile.loader.prototype.options.text,
    textVisible: false,
    theme: $.mobile.loader.prototype.options.theme,
    textonly: false,
    html: ""
  });
};

/**
 * ローディングの表示終了
 */
var stopLoading = function() {
  $.mobile.loading( "hide" );
  $('.mask').remove();
};

/**
 * 登った場所のセレクトボックス設定
 */
var setPlaceSelectBox = function(idName) {
  //セレクトボックス指定
  var selectBox = $(idName);

  //セレクトボックスの子要素削除
  selectBox.children().remove();

  // コールバック関数の引数の順序が $.each と異なることに注意。
  var options = $.map(places, function (elem, index) {
    var option = $('<option>', { value: elem, text: elem });
    return option;
  });

  selectBox.append(options);
};

/**
 * 登った場所のリスト設定
 */
var setPlaceList = function() {
  //リスト指定
  var placeList = $('#listview');

  //リストの子要素削除
  placeList.children().remove();

  // コールバック関数の引数の順序が $.each と異なることに注意。
  var lis = [];
  var li;
  $.each(places, function (index, elem) {
    li = $('<li>');
    li.attr('data-value',elem);
    li.text(elem);
    li.wrapInner("<a href=\"#\"></a>")
    lis.push(li);
  });
  //    <li data-value="a"><a href="#">ベースキャンプ</a></li>

  placeList.append(lis);
};

/**
 * 登った場所の配列の並び替え
 */
var sortPlaceArray = function() {
  places = null;
  places = [];
  $("#listview li").each(function(){
    places.push($(this).text());
  });
};

/**
 * 登った情報のリスト設定
 */
var setInfoList = function(id,infos) {
  //リスト指定
  var infoList = $(id);

  //リストの子要素削除
  infoList.children().remove();

  // コールバック関数の引数の順序が $.each と異なることに注意。
  var lis = [];
  var li;
  var h2;
  var p;
  var memo;
  $.each(infos, function (index, elem) {
    li = $('<li>');
    h2 = $('<h2>');
    h2.text(elem.date);

    p = $('<p>');
    memo = elem.memo;
    if ($.mb_strlen(memo) > 5) {
      memo = $.mb_substr(memo,0,5) + "...";
    }
    p.text(memo);

    li.append(h2);
    li.append(p);
    lis.push(li);
  });
  //    <li data-value="a"><a href="#">ベースキャンプ</a></li>

  infoList.append(lis);
};

