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
var SELECT_INFOS_WHERE_DATE = "select * from infos where date = ? order by num asc";
var SELECT_PLACES = "select * from places order by num asc";

var INSERT_INFOS = "insert into infos (date,place,grade,memo,pic) values (?,?,?,?,?)";
var INSERT_PLACES = "insert into places (place) values (?)";
var INSERT_PLACE1 = "近所のジム";
var INSERT_PLACE2 = "その他";

var DELETE_INFOS_WHERE_NUM = "delete from infos where num = ?";
var DELETE_PLACES = "delete from places";
var DELETE_PLACES_WHERE_PLACE = "delete from places where place = ?";

var UPDATE_INFOS = "update infos set date = ?,place = ?,grade = ?,memo = ?,pic = ? where num = ?";

/**
 * SQLite終了
 */
function closeDB() {
  db.close(function () {
    console.log("DB closed!");
  }, function (error) {
    console.log("Error closing DB:" + error.message);
  });
}

/**
 * SQLite初期設定
 */
var startDB = function() {
  var resultNum = 0;
  var sFlg = window.localStorage.getItem("sFlg");
  var num,date,place,grade,memo,pic;

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
      }, function() {
        db.transaction(function(tx2) {
          tx2.executeSql(INSERT_PLACES, [INSERT_PLACE1]);
          tx2.executeSql(INSERT_PLACES, [INSERT_PLACE2]);
        }, function(error) {
          //console.log('Transaction ERROR: ' + error.message);
          closeDB();
          //エラー画面に移動
          $('body').pagecontainer('change', '#error');
          //rtn = false;
        }, function() {
          places[0] = new ClimbPlace(0,INSERT_PLACE1);
          places[1] = new ClimbPlace(1,INSERT_PLACE2);

          //localStorageにセット
          window.localStorage.setItem("sFlg","1");

          //ホーム画面に移動
          $('body').pagecontainer('change', '#home');
          //rtn = true;
        });
      });
    }
    else {
      //infosテーブルからデータ取得
      db.executeSql(SELECT_INFOS_GET_NEW_100, [], function(rs) {
        resultNum = rs.rows.length;
        if (resultNum > 0) {
          var infos2 = [];
          for(var x = 0; x < resultNum; x++) {
            num = rs.rows.item(x).num;
            date = rs.rows.item(x).date;
            place = rs.rows.item(x).place;
            grade = rs.rows.item(x).grade;
            memo = rs.rows.item(x).memo;
            pic = rs.rows.item(x).pic;

            var info = new ClimbInfo(num,date,place,grade,memo,pic);
            infos2[x] = info;
          }
          infos = infos2.concat();


        }
        //placesテーブルからデータ取得
        db.executeSql(SELECT_PLACES, [], function(rs2) {
          resultNum = rs2.rows.length;
          var places2 = [];
          for(var x = 0; x < resultNum; x++) {
            num = rs2.rows.item(x).num;
            place = rs2.rows.item(x).place;

            var climbPlace = new ClimbPlace(num,place);
            places2[x] = climbPlace;
          }
          places = places2.concat();
          //ホーム画面に移動
          $('body').pagecontainer('change', '#home');
        }, function(error) {
          closeDB();
          //エラー画面に移動
          $('body').pagecontainer('change', '#error');
        });
      }, function(error) {
        closeDB();
        //エラー画面に移動
        $('body').pagecontainer('change', '#error');
      });
    }
  });
};

/**
 * infosテーブルから特定の日付のデータを取得する
 */
var getInfosOnDate = function(searchDate) {
  var infos2 = [];
  var num,date,place,grade,memo,pic;

  db.executeSql(SELECT_INFOS_WHERE_DATE, [searchDate], function (rs) {
    var info;
    var len = rs.rows.length;
    for ( var x = 0; x < len; x++) {
      num = rs.rows.item(x).num;
      date = rs.rows.item(x).date;
      place = rs.rows.item(x).place;
      grade = rs.rows.item(x).grade;
      memo = rs.rows.item(x).memo;
      pic = rs.rows.item(x).pic;

      info = new ClimbInfo(num,date,place,grade,memo,pic);
      infos2[x] = info;
    }
    //console.log('transaction ok');
    infosOnDate = null;
    infosOnDate = infos2.concat();
    if (infosOnDate != null && infosOnDate.length > 0) {
      setInfoList('#infoList3',infosOnDate);
    }
    else {
      infosOnDate = [];
      info = new ClimbInfo(0,'0件です','','','','');
      infosOnDate[0] = info;
      setInfoList('#infoList3',infosOnDate);
    }

    //#climb_calendar_searchに移動
    $('body').pagecontainer('change', '#climb_calendar');
  },
  function (tx, error) {
    //console.log('SELECT error: ' + error.message);
    closeDB();
    //エラー画面に移動
    $('body').pagecontainer('change', '#error');
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
      closeDB();
      //エラー画面に移動
      $('body').pagecontainer('change', '#error');
    });
  }, function(error) {
    closeDB();
    //エラー画面に移動
    $('body').pagecontainer('change', '#error');
  }, function() {
    db.transaction(function(tx2) {
      for (var x = 0; x < places.length; x++) {
        tx2.executeSql(INSERT_PLACES, [places[x]]);
        places[x].num = x;
      }
    }, function(error) {
      places = null;
      places = places_old.concat();
      closeDB();
      //エラー画面に移動
      $('body').pagecontainer('change', '#error');
    }, function() {
      //登った場所のリスト設定
      setPlaceList("#sortPlaceList");

      //登った場所のセレクトボックス設定
      setPlaceSelectBox('#new_climb_place');
      setPlaceSelectBox('#update_climb_place');

      //登った場所のラジオボタン設定
      setPlaceRadio();

      //ホーム画面に移動
      $('body').pagecontainer('change', '#home');
    });
  });
};

/**
 * infosテーブルにメモを登録する
 */
var insertInfo = function(date,place,grade,memo,pic) {
  db.transaction(function (tx) {
    tx.executeSql(INSERT_INFOS, [date, place, grade, memo, pic], function(tx, res) {
      num = res.insertId;
    },
    function(tx, error) {
      closeDB();
      //エラー画面に移動
      $('body').pagecontainer('change', '#error');
    });
  }, function(error) {
    closeDB();
    //エラー画面に移動
    $('body').pagecontainer('change', '#error');
  }, function() {
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
var deleteInfo = function(num) {
  db.transaction(function (tx) {
    tx.executeSql(DELETE_INFOS_WHERE_NUM, [num], function (tx, res) {
      //infosから削除
      deleteInfoFromArray(num);

      //最新のメモをリスト設定
      setNewInfo(infos);

      //過去のメモをリスト設定
      setInfoList("#infoList2",infos);

      //カレンダーで探すリストの初期化
      $('infoList3').children().remove();
    },
    function (tx, error) {
      closeDB();
      //エラー画面に移動
      $('body').pagecontainer('change', '#error');
    });
  }, function (error) {
    closeDB();
    //エラー画面に移動
    $('body').pagecontainer('change', '#error');
  }, function () {
    //ホーム画面に移動
    $('body').pagecontainer('change', '#home');
  });
};

/**
 * infosテーブルのメモを更新する
 */
var updateInfo = function(index,num,date,place,grade,memo,pic) {
  db.transaction(function (tx) {
    tx.executeSql(UPDATE_INFOS, [date, place, grade, memo, pic, num], function(tx, res) {
      //infosの先頭に追加
      var climbInfo = new ClimbInfo(num,date,place,grade,memo,pic);
      infos[index] = climbInfo;
    },
    function(tx, error) {
      closeDB();
      //エラー画面に移動
      $('body').pagecontainer('change', '#error');
    });
  }, function(error) {
    closeDB();
    //エラー画面に移動
    $('body').pagecontainer('change', '#error');
  }, function() {
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
      num = res.insertId;
    },
    function(tx, error) {
      closeDB();
      //エラー画面に移動
      $('body').pagecontainer('change', '#error');
    });
  }, function(error) {
    closeDB();
    //エラー画面に移動
    $('body').pagecontainer('change', '#error');
  }, function() {
    //infosに追加
    var climbPlace = new ClimbPlace(num,place);
    places.push(climbPlace);

    //登った場所のリスト設定
    setPlaceList("#sortPlaceList");

    //登った場所のセレクトボックス設定
    setPlaceSelectBox('#new_climb_place');
    setPlaceSelectBox('#update_climb_place');

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
      //placesから削除
      deletePlaceFromArray(place);

      //登った場所のセレクトボックス設定
      setPlaceSelectBox('#new_climb_place');
      setPlaceSelectBox('#update_climb_place');

      //登った場所のリスト設定
      setPlaceList();

      //登った場所のラジオボタン設定
      setPlaceRadio();
    },
    function (tx, error) {
      closeDB();
      //エラー画面に移動
      $('body').pagecontainer('change', '#error');
    });
  }, function (error) {
    closeDB();
    //エラー画面に移動
    $('body').pagecontainer('change', '#error');
  }, function () {
    //ホーム画面に移動
    $('body').pagecontainer('change', '#home');
  });
};