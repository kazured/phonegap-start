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
    var option = $('<option>', { value: elem.place, text: elem.place });
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
    climbPlace = new ClimbPlace(cnt,$(this).text());
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

/**
 * テストデータを設定する
 */
var setTestData = function() {
  //テストデータ
  var pic0 = "data:image/png;base64,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";
  var memo0 = "１２３４５６７８９０１２３４５６７８９０";
  var memo1 = "あいうえおかきくけこさしすせそたちつてと";
  var memo2 = "aあiいuうeえoおaかiきuくeけoこaさiしuすeせoそaたiちuつeてoと";

  infos[0] = new ClimbInfo(1,"2017/04/01","近所のジム","6級",memo0,pic0);
  infos[1] = new ClimbInfo(2,"2017/04/02","その他","5級",memo1,pic0);
  infos[2] = new ClimbInfo(3,"2017/04/03","近所のジム","4級",memo2,pic0);

  places[0] = new ClimbPlace(1,"-");
  places[1] = new ClimbPlace(2,"近所のジム");
  places[2] = new ClimbPlace(3,"その他");

};