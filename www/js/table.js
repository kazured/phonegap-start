/**
 * @classdesc 登った情報を取り扱うクラス
 * @constructor
 * @param num {INTEGER} - この情報の番号
 * @param date {TEXT} - 登った日
 * @param place {TEXT} - 登った場所
 * @param grade {TEXT} - グレード
 * @param memo {TEXT} - メモ
 * @param pic {BLOB} - 写真
 */
function ClimbInfo(num,date,place,grade,memo,pic) {
  this.num = num;
  this.date = date;
  this.place = place;
  this.grade = grade;
  this.memo = memo;
  this.pic = pic;
}

/**
 * @classdesc 場所を取り扱うクラス
 * @constructor
 * @param num {INTEGER} - この情報の番号
 * @param place {TEXT} - 場所
 */
function ClimbPlace(num,place) {
  this.num = num;
  this.place = place;
}

/**
* 登録した情報の配列。
* @type {Array}
*/
var infos = [];

/**
* 登録した情報の配列。
* @type {Array}
*/
var infosOnDate = [];

/**
* 登録した場所の配列。
* @type {Array}
*/
var places = [];
var places_old = [];

//DDL
var CREATE_INFOS = "create table if not exists infos(num integer primary key autoincrement, date text,place text,grade text,memo text,pic text)";
var CREATE_PLACES = "create table if not exists places(num integer primary key, place text)";

//DML
var SELECT_INFOS_GET_NEW_100 = "select * from infos order by num asc limit 100";
var SELECT_INFOS_WHERE_DATE = "select * from infos order by num asc where date = ?";
var SELECT_PLACES = "select * from places order by num asc";

var INSERT_INFOS = "insert into infos (date,place,grade,memo,pic) values (?,?,?,?,?)";
var INSERT_PLACES = "insert into places (place) values (?)";
var INSERT_PLACE1 = "近所のジム";
var INSERT_PLACE2 = "その他";

var DELETE_INFOS_WHERE_NUM = "delete from infos where num = ?";
var DELETE_PLACES = "delete from places";
var DELETE_PLACES_WHERE_PLACE = "delete from places where place = ?";

/**
 * SQLite初期設定
 */
var startDB = function() {
  var rtn = true;
  var num = 0;
  var sFlg = window.localStorage.getItem("sFlg");

  window.sqlitePlugin.selfTest(function() {
    db = window.sqlitePlugin.openDatabase({name: 'memo.db', location: 'default'});

    if (sFlg == null) { //初めてのアクセス
      db.transaction(function(tx) {
        //infosテーブル作成
        tx.executeSql(CREATE_INFOS);
        //placeテーブル作成
        tx.executeSql(CREATE_PLACES);
      }, function(error) {
        //console.log('Transaction ERROR: ' + error.message);
        rtn = false;
      }, function() {
        db.transaction(function(tx2) {
          tx2.executeSql(INSERT_PLACES, [INSERT_PLACE1]);
          tx2.executeSql(INSERT_PLACES, [INSERT_PLACE2]);
        }, function(error) {
          //console.log('Transaction ERROR: ' + error.message);
          //エラー画面に移動
          $('body').pagecontainer('change', '#error');
          //rtn = false;
        }, function() {
          places[0] = new ClimbPlace(0,INSERT_PLACE1);
          places[1] = new ClimbPlace(1,INSERT_PLACE2);

          //localStorageにセット
          window.localStorage.getItem("sFlg","1");

          //ホーム画面に移動
          $('body').pagecontainer('change', '#home');
          //rtn = true;
        });
      });
    }
    else {
      //infosテーブルからデータ取得
      db.executeSql(SELECT_INFOS_GET_NEW_100, [], function(rs) {
        num = rs.rows.length;
        if (num > 0) {
          var infos2 = [];
          for(var x = 0; x < num; x++) {
            num = rs.rows.item(x).num;
            date = rs.rows.item(x).date;
            place = rs.rows.item(x).place;
            grade = rs.rows.item(x).grade;
            memo = rs.rows.item(x).memo;
            pic = rs.rows.item(x).pic;

            var info = new ClimbInfo(num,date,place,grade,memo,pic);
            infos2[x] = info;
          }
          infos = [].concat(info2);
        }
        //placesテーブルからデータ取得
        db.executeSql(SELECT_PLACES, [], function(rs2) {
          var places2 = [];
          for(var x = 0; x < num; x++) {
            num = rs2.rows.item(x).num;
            place = rs2.rows.item(x).place;

            var place = new ClimbPlace(num,place);
            places2[x] = place;
          }
          places = null;
          places = [].concat(places2);
          //ホーム画面に移動
          $('body').pagecontainer('change', '#home');
        }, function(error) {
          //エラー画面に移動
          $('body').pagecontainer('change', '#error');
        });
      }, function(error) {
        //エラー画面に移動
        $('body').pagecontainer('change', '#error');
      });
    }
  });


  //return rtn;
};

/**
 * infosテーブルから特定の日付のデータを取得する
 */

var getInfosOnDate = function(searchDate) {
  var infos2 = [];
  var num,date,place,grade,memo,pic;
  db.transaction(function (tx) {
    tx.executeSql(SELECT_INFOS_WHERE_DATE, [searchDate], function (tx, resultSet) {
      var info;
      for(var x = 0; x < resultSet.rows.length; x++) {
        num = resultSet.rows.item(x).num;
        date = resultSet.rows.item(x).date;
        place = resultSet.rows.item(x).place;
        memo = resultSet.rows.item(x).memo;
        pic = resultSet.rows.item(x).pic;

        info = new ClimbInfo(num,date,place,grade,memo,pic);
        infos2[x] = info;
      }
    },
    function (tx, error) {
      //console.log('SELECT error: ' + error.message);
    });
  }, function (error) {
    //console.log('transaction error: ' + error.message);
  }, function () {
    //console.log('transaction ok');
    infosOnDate = null;
    infosOnDate = [].concat(infos2);

    if (infosOnDate != null && infosOnDate.length > 0) {
      setInfoList('#infoList3',infosOnDate);
    }

    //#climb_calendar_searchに移動
    $('body').pagecontainer('change', '#climb_calendar_search');
  });
};

/**
 * placesテーブルのレコードをソート後のレコードに書き換える
 */
var sortPlaces = function() {
  db.transaction(function (tx) {
    tx.executeSql(DELETE_PLACES, [], function(tx, res) {
    },
    function(tx, error) {
      //console.log('INSERT error: ' + error.message);
      //エラー画面に移動
      $('body').pagecontainer('change', '#error');
    });
  }, function(error) {
    //console.log('transaction error: ' + error.message);
    //エラー画面に移動
    $('body').pagecontainer('change', '#error');
  }, function() {
    db.transaction(function(tx2) {
      for (var x = 0; x < places.length; x++) {
        tx2.executeSql(INSERT_PLACES, [places[x]]);
        places[x].num = x;
      }
    }, function(error) {
      //console.log('Transaction ERROR: ' + error.message);
      places = null;
      places = [].concat(places_old);
      //エラー画面に移動
      $('body').pagecontainer('change', '#error');
      //rtn = false;
    }, function() {
      //rtn = true;
      //最新のメモをリスト設定
      setNewInfo(infos);

      //過去のメモをリスト設定
      setInfoList("#infoList2",infos);

      //ホーム画面に移動
      $('body').pagecontainer('change', '#home');
    });
  });
};

/**
 * infosテーブルにメモを登録する
 */
var insertInfo = function(date,place,grade,memo,pic) {
  var num;
  db.transaction(function (tx) {
    tx.executeSql(INSERT_INFOS, [date, place, grade, memo, pic], function(tx, res) {
      //console.log("INSERT success");
      num = res.insertId;
    },
    function(tx, error) {
      //console.log('INSERT error: ' + error.message);
      num = -1;
    });
  }, function(error) {
    //console.log('transaction error: ' + error.message);
    //エラー画面に移動
    $('body').pagecontainer('change', '#error');
  }, function() {
    //console.log('transaction ok');
    //infosの先頭に追加
    var climbInfo = new ClimbInfo(num,date,place,grade,memo,pic);
    infos.unshift(climbInfo);
    if (infos.length == 101) {
      infos.pop();
    }

    //最新のメモをリスト設定
    setNewInfo(infos);

    //過去のメモをリスト設定
    setInfoList("#infoList2",infos);

    //ホーム画面に移動
    $('body').pagecontainer('change', '#home');
  });

};

/**
 * infosテーブルから１件削除する
 */
var deleteInfos = function(num) {
  db.transaction(function (tx) {
    tx.executeSql(DELETE_INFOS_WHERE_NUM, [num], function (tx, res) {
      //console.log("DELETE success ");
    },
    function (tx, error) {
      //console.log('DELETE error: ' + error.message);
    });
  }, function (error) {
    //console.log('transaction error: ' + error.message);
  }, function () {
    //infosから削除
    deleteInfoFromArray(num);

    //最新のメモをリスト設定
    setNewInfo(infos);

    //過去のメモをリスト設定
    setInfoList("#infoList2",infos);

    //ホーム画面に移動
    $('body').pagecontainer('change', '#home');
  });
};

/**
 * placesテーブルに場所を登録する
 */
var insertPlace = function(place) {
  var num;
  db.transaction(function (tx) {
    tx.executeSql(INSERT_PLACES, [place], function(tx, res) {
      //console.log("INSERT success");
      num = res.insertId;
    },
    function(tx, error) {
      //console.log('INSERT error: ' + error.message);
      num = -1;
    });
  }, function(error) {
    //console.log('transaction error: ' + error.message);
    //エラー画面に移動
    $('body').pagecontainer('change', '#error');
  }, function() {
    //console.log('transaction ok');
    //infosの先頭に追加
    var climbPlace = new ClimbPlace(num,place);
    places.unshift(climbPlace);

    //登った場所のリスト設定
    setPlaceList("#sortPlaceList");

    //登った場所のセレクトボックス設定
    setPlaceSelectBox('#new_climb_place');

    //登った場所のラジオボタン設定
    setPlaceRadio();

    //ホーム画面に移動
    $('body').pagecontainer('change', '#home');
  });
};

/**
 * placesテーブルから１件削除する
 */
var deletePlace = function(place) {
  db.transaction(function (tx) {
    tx.executeSql(DELETE_PLACES_WHERE_PLACE, [place], function (tx, res) {
      //console.log("DELETE success ");
    },
    function (tx, error) {
      //console.log('DELETE error: ' + error.message);
    });
  }, function (error) {
    //console.log('transaction error: ' + error.message);
  }, function () {
    //placesから削除
    deletePlaceFromArray(place);

    //登った場所のセレクトボックス設定
    setPlaceSelectBox('#new_climb_place');

    //登った場所のリスト設定
    setPlaceList();

    //登った場所のラジオボタン設定
    setPlaceRadio();
  });
};