

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

/**
 * SQLite初期設定
 * @return {boolean} 処理が成功したらtrue、失敗したらfalseを返す
 */
var startDB = function() {
  var rtn = true;
  var num = 0;
  var sFlg = window.localStorage.getItem("sFlg");

  window.sqlitePlugin.selfTest(function() {
    db = window.sqlitePlugin.openDatabase({name: 'memo.db', location: 'default'});
alert("window.sqlitePlugin.selfTest:" + rtn);

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
alert("テーブル作成完了:" + rtn);
        db.transaction(function(tx2) {
          tx2.executeSql(INSERT_PLACES, [INSERT_PLACE1]);
          tx2.executeSql(INSERT_PLACES, [INSERT_PLACE2]);
        }, function(error) {
          //console.log('Transaction ERROR: ' + error.message);
          //エラー画面に移動
          $('body').pagecontainer('change', '#error');
          //rtn = false;
        }, function() {
alert("insert:"+rtn);
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
  alert("infos num:"+num);
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

/*
    //placesテーブル作成、データ登録
    db.executeSql(CREATE_PLACES, [], function(rs1) {
      // テーブル作成成功
      // データ取得のSQL実行
      db.executeSql(SELECT_PLACES, [], function(rs2) {
        num = rs2.rows.length;
alert("num:"+num);
        if (num == 0) {
          db.transaction(function(tx) {
            tx.executeSql(INSERT_PLACES, [INSERT_PLACE1]);
            tx.executeSql(INSERT_PLACES, [INSERT_PLACE2]);
          }, function(error) {
            //console.log('Transaction ERROR: ' + error.message);
            rtn = false;
          }, function() {
alert("insert:"+rtn);
            places[0] = new ClimbPlace(0,INSERT_PLACE1);
            places[1] = new ClimbPlace(1,INSERT_PLACE2);
            rtn = true;
          });
        }
        else {
          var places2 = [];
          for(var x = 0; x < num; x++) {
            num = rs2.rows.item(x).num;
            place = rs2.rows.item(x).place;

            var place = new ClimbPlace(num,place);
            places2[x] = place;
          }
          places = null;
          places = [].concat(places2);
          rtn = true;
        }
      });
    }, function(error) {
      rtn = false;
    });
alert("places rtn:"+rtn);

    //infosテーブル作成
    db.executeSql(CREATE_INFOS, [], function(rs1) {
        // テーブル作成成功
        // データ取得のSQL実行
        db.executeSql(SELECT_INFOS_GET_NEW_100, [], function(rs2) {
          num = rs2.rows.length;
alert("infos num:"+num);
          if (num > 0) {
            var infos2 = [];
            for(var x = 0; x < num; x++) {
                num = rs2.rows.item(x).num;
                date = rs2.rows.item(x).date;
                place = rs2.rows.item(x).place;
                grade = rs2.rows.item(x).grade;
                memo = rs2.rows.item(x).memo;
                pic = rs2.rows.item(x).pic;

                var info = new ClimbInfo(num,date,place,grade,memo,pic);
                infos2[x] = info;
            }
            infos = null;
            infos = [].concat(info2);
            rtn = true;
          }
        });
      }, function(error) {
      rtn = false;
    });

alert("infos rtn:"+rtn);
*/

/*
    //テーブル作成
    db.transaction(function(tx) {
      //infosテーブル作成
      tx.executeSql(CREATE_INFOS);
      //placeテーブル作成
      tx.executeSql(CREATE_PLACES);
    }, function(error) {
      //console.log('Transaction ERROR: ' + error.message);
      rtn = false;
    }, function() {
      alert("テーブル作成完了:" + rtn);
      db.executeSql(SELECT_PLACES, [], function (rs) {
        //pNum = rs.rows.item(0).mycount;
  alert("num前");
  alert("num後"+rs.rows.length);
        num = rs.rows.length;
        rtn = true;
      },
      function (error) {
        //console.log('SELECT error: ' + error.message);
        rtn = false;
      });
    });

    //placeテーブルにデータ設定
    alert("num:"+num);
    alert("rtn:"+rtn);
    if (rtn && num == 0) {
      db.transaction(function(tx) {
        tx.executeSql(INSERT_PLACES, [INSERT_PLACE1]);
        tx.executeSql(INSERT_PLACES, [INSERT_PLACE2]);
      }, function(error) {
        //console.log('Transaction ERROR: ' + error.message);
        rtn = false;
      }, function() {
        rtn = true;
      });
    }
    */
  });


  //return rtn;
};

/**
 * infosテーブルから100件のデータを取得する
 * @return {boolean} 処理が成功したらtrue、失敗したらfalseを返す
 */
var getInfos = function() {
  var rtn;
  var infos2 = [];
  var num,date,place,grade,memo,pic;
  db.transaction(function (tx) {
    tx.executeSql(SELECT_INFOS_GET_NEW_100, [], function (tx, resultSet) {
      for(var x = 0; x < resultSet.rows.length; x++) {
        num = resultSet.rows.item(x).num;
        date = resultSet.rows.item(x).date;
        place = resultSet.rows.item(x).place;
        grade = resultSet.rows.item(x).grade;
        memo = resultSet.rows.item(x).memo;
        pic = resultSet.rows.item(x).pic;

        var info = new ClimbInfo(num,date,place,grade,memo,pic);
        infos2[x] = info;
      }
    },
    function (tx, error) {
      //console.log('SELECT error: ' + error.message);
      rtn = false;
    });
  }, function (error) {
    //console.log('transaction error: ' + error.message);
    rtn = false;
  }, function () {
    //console.log('transaction ok');
    if (infos2.length > 0) {
      infos = null;
      infos = [].concat(infos2);
    }
    rtn = true;
  });

  return rtn;
};

/**
 * infosテーブルから特定の日付のデータを取得する
 * @return {boolean} 処理が成功したらtrue、失敗したらfalseを返す
 */

var getInfosOnDate = function(searchDate) {
  var rtn;
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
      rtn = false;
    });
  }, function (error) {
    //console.log('transaction error: ' + error.message);
    rtn = false;
  }, function () {
    //console.log('transaction ok');
    infosOnDate = null;
    infosOnDate = [].concat(infos2);
    rtn = true;
  });

  return rtn;
};

/**
 * placesテーブルからデータを取得する
 * @return {boolean} 処理が成功したらtrue、失敗したらfalseを返す
 */

var getPlaces = function() {
  var rtn;
  var places2 = [];
  var num,place;
  db.transaction(function (tx) {
    tx.executeSql(SELECT_PLACES, [], function (tx, resultSet) {
      for(var x = 0; x < resultSet.rows.length; x++) {
        num = resultSet.rows.item(x).num;
        place = resultSet.rows.item(x).place;

        place = new ClimbPlace(num,place);
        place2[x] = place;
alert(place.num + "," + place.place);
      }
    },
    function (tx, error) {
      //console.log('SELECT error: ' + error.message);
      rtn = false;
    });
  }, function (error) {
    //console.log('transaction error: ' + error.message);
    rtn = false;
  }, function () {
    //console.log('transaction ok');
    places = null;
    places = [].concat(places2);
    rtn = true;
  });

  return rtn;
};

/**
 * placesテーブルからデータを削除する
 * @return {boolean} 処理が成功したらtrue、失敗したらfalseを返す
 */
var deletePlaces = function() {
  var rtn;
  db.transaction(function (tx) {
    tx.executeSql(query, [], function (tx, res) {
      //console.log("DELETE success ");
      rtn = true;
    },
    function (tx, error) {
      //console.log('DELETE error: ' + error.message);
      rtn = false;
    });
  }, function (error) {
    //console.log('transaction error: ' + error.message);
    rtn = false;
  }, function () {
    //console.log('transaction ok');
    rtn = true;
  });

  return rtn;
 };

/**
 * infosテーブルにメモを登録する
 * @return {INTEGER} 処理が成功したら追加されたレコードの番号(num?)、失敗したら-1を返す
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
    num = -1;
  }, function() {
    //console.log('transaction ok');
  });

  return num;
};

/**
 * placesテーブルに場所を登録する
 * @return {INTEGER} 処理が成功したら追加されたレコードの番号(num?)、失敗したら-1を返す
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
    num = -1;
  }, function() {
    //console.log('transaction ok');
  });

  return num;
};
