

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
var CREATE_INFOS = "create table if not exists infos(num integer primary key autoincrement, date text,place text,grade text,memo test,pic blob)";
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
  var rtn;

  window.sqlitePlugin.selfTest(function() {
    db = window.sqlitePlugin.openDatabase({name: 'memo.db', location: 'default'});

    //テーブル作成
    db.transaction(function(tx) {
      //infosテーブル作成
      tx.executeSql(CREATE_INFOS),[],function(res) {
        //infosテーブル作成成功
        //placeテーブル作成
        tx.executeSql(CREATE_PLACES),[],function(res) {
          //placesテーブル作成成功
        }, function(error) {
          rtn = false
          alert("create places ng");
        }
      }, function(error) {
        rtn = false;
        alert("create infos ng");
      }
    }, function(error) {
      //console.log('Transaction ERROR: ' + error.message);
      rtn = false;
    }, function() {
      rtn = true;
      alert("create ok");
    });

    //placesテーブルにデータ挿入
    if (rtn) {
      tx.executeSql(INSERT_PLACES),[INSERT_PLACE1],function(res) {
        //placesテーブル 1件目データ挿入成功
        //alert("1件目:" + res.insertNum);
        /*
        tx.executeSql(INSERT_PLACES),[INSERT_PLACE2],function(res) {
          //placesテーブル 2件目データ挿入成功
          alert("2件目:" + res.insertNum);
        }, function(error) {
          rtn = false
        }
        */
      }, function(error) {
        rtn = false
      }
    }

  });

  return rtn;
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
    infos = null;
    infos = [].concat(infos2);
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
      for(var x = 0; x < resultSet.rows.length; x++) {
        num = resultSet.rows.item(x).num;
        date = resultSet.rows.item(x).date;
        place = resultSet.rows.item(x).place;
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

        var place = new ClimbPlace(num,place);
        place2[x] = place;
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
