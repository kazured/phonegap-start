var $html;
var $mask;
var LI_STR_LEN = 10;
var ERROR_MESSAGE = "システムエラーが発生しました";

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
  selectBox.selectmenu() ;
  selectBox.selectmenu("refresh") ;
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
    li.attr('data-value',elem.place);
    li.text(elem.place);
    li.wrapInner("<a href=\"#\"></a>")
    lis.push(li);
  });
  //    <li data-value="a"><a href="#">ベースキャンプ</a></li>

  placeList.append(lis);
  placeList.listview();
  placeList.listview('refresh');
};

/**
 * 登った場所の配列の並び替え
 */
var sortPlaceArray = function() {
  places = null;
  places = [];
  var climbPlace;
  var cnt = 0;
  $("#listview li").each(function(){
    climbPlace = new ClimbPlace(cnt,$(this).text())
    places.push(climbPlace);
    ++cnt;
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
    if ($.mb_strlen(memo) > LI_STR_LEN) {
      memo = $.mb_substr(memo,0,LI_STR_LEN) + "...";
    }
    p.text(memo);

    li.append(h2);
    li.append(p);
    lis.push(li);
  });
  //    <li data-value="a"><a href="#">ベースキャンプ</a></li>

  infoList.append(lis);
  infoList.listview();
  infoList.listview('refresh');
};

/**
 * 登った最新の情報を設定
 */
var setNewInfo = function(infos) {
  //最新の情報の設定場所を取得
  var li = $("#infoList1 li:last");
  var h2 = li.find("h2");
  var p = li.find("p");

  var memo;

  //最新のメモを１件設定
  if (infos.length >= 1) {
    h2.text(infos[0].date);
    memo = infos[0].memo;
    if ($.mb_strlen(memo) > LI_STR_LEN) {
      memo = $.mb_substr(memo,0,LI_STR_LEN) + "...";
    }
    p.text(memo);
  }
  else {
    h2.text('メモが登録されていません');
    p.text("");
  }

};

/**
 * 登った場所のラジオボタン設定
 */
var setPlaceRadio = function() {
  //fieldsetを設定するdivを取得
  var div = $('#placeDeleteRadio');

  //既存のfiledsetを削除
  //$('#placeDeleteRadio fieldset').remove();
  div.find('fieldset').remove();

  var fset = '<fieldset data-role="controlgroup" data-theme="b"><legend>削除する場所を選んでください</legend>';
  var inputs = '';
  var id = '';
  $.each(places, function (index, elem) {
    id = "placeRadio" + index;
    inputs  += '<input type="radio" name="placeRadio" id="'
        + id
        + '" value="'
        + elem.place
        + '"';
    if (index == 0) {
      inputs += " checked";
    }
    inputs  += '><label for="'
        + id
        + '">'
        + elem.place
        +'</label>';
  });
  div.html(fset+inputs+'</fieldset>');
  div.trigger("create");
};

/**
 * 登った場所を配列から削除
 */
var deletePlaceFromArray = function() {
  var value = $('input[name=placeRadio]:checked').val();
  var i;
  $.each(places, function (index, elem) {
    if (value == elem.place) {
      i = index;
    }
  });
  places.splice(i, 1);
};
