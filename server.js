var express = require('express');
var multer  = require('multer');
var fs  = require('fs');
var mysql = require('mysql');

var app = express();
app.set('view engine', 'ejs');

app.get('/', (req, res) => {
    res.render('index');
});


//File Upload
var storage = multer.diskStorage({
    destination: function (req, file, callback) {
        var dir = './uploads';
        if (!fs.existsSync(dir)){
            fs.mkdirSync(dir);
        }
        callback(null, dir);
    },
    filename: function (req, file, callback) {
        callback(null, file.originalname);
    }
});
var upload = multer({storage: storage}).array('files', 12);
app.post('/upload', function (req, res, next) {
    upload(req, res, function (err) {
        if (err) {
            return res.end("Something went wrong:(");
        }
        try {
            if(!fs.existsSync('./uploads/data.tsv')){
                res.end("No or Incorrect File format");
            }
            var data = fs.readFileSync('./uploads/data.tsv', 'utf8');
            console.log(data + "this is data");
            var sum = checkSum(data);
            console.log(sum == 114802.93);
            if(sum == 114802.93){
                res.end("Data Uploaded Successfully !! User Total Revenue is : " + sum);
                sendDataToSQL(parsedData);
                removeFileOnUpload();
            }
            else{
                res.end("Sum Differs By " + 114802.93 - sum + " Ideal sum should be 114802.93, Data is still saved in the DB");
                sendDataToSQL(parsedData);    
                removeFileOnUpload();
            }

        } catch (err) {
            console.error(err)
        }
    });
    res.writeHeader(200, {"Content-Type": "text/html"});  
    res.write(`<nav><a class="btn btn-primary" href="/"> Add Another TSV</a></nav>`);  
})
var parsedData = [];
var checkSum = function(tsv){
    var lines=tsv.split("\n");
 
    var result = [];
    let sum = 0;
 
    var headers=lines[0].split("\t");
    //console.log(headers);
 
    for(var i=1;i<lines.length;i++){
        var obj = {};
        var currentline=lines[i].split("\t");
    
        for(var j=0;j<headers.length;j++){
            obj[headers[j]] = currentline[j];
        }
        if(!isNaN(obj["Item_price"]) && !isNaN(obj["Item_count"])){
            sum += Number(obj["Item_price"]) * Number(obj["Item_count"]);
            obj["Id"] = i;
            obj["Total"] = (Number(obj["Item_price"]) * Number(obj["Item_count"])).toFixed(2);
        }
        if(obj["Item_price"] && obj["Item_price"] != null)
            result.push(obj);
    }
  
  //return result; //JavaScript object
  //res.end(sum);
  sum = sum.toFixed(2);
  console.log(sum + "checkSum");
  parsedData = result;
  return sum;
}
var removeFileOnUpload = function(){
    var path = './uploads';
    if (fs.existsSync(path)) {
        const files = fs.readdirSync(path)
    
        if (files.length > 0) {
          files.forEach(function(filename) {
            if (fs.statSync(path + "/" + filename).isDirectory()) {
              removeDir(path + "/" + filename)
            } else {
              fs.unlinkSync(path + "/" + filename)
            }
          })
          fs.rmdirSync(path)
        } else {
          fs.rmdirSync(path)
        }
      } else {
        console.log("Directory path not found.")
      }
};
//File Upload End

//SQL Connection
const pool  = mysql.createPool({
    connectionLimit : 10,
    host            : 'localhost',
    user            : 'root',
    password        : '',
    database        : 'Items'
})

var deleteExistingRecords = async function(){
     pool.getConnection(async (err, connection) => {
        console.log("inside");
        if(err) throw err;
        await connection.query('DELETE FROM item_table', (err, rows) => {
        connection.release() // return the connection to pool    
        if (!err) {
            console.log("Deleted");
        } else {
            console.log(err)
        }
        console.log('The data from item table are: \n', rows)

        })
    })
}
var sendDataToSQL = async function(parsedData){
    await deleteExistingRecords();
    pool.getConnection((err, connection) => {
        console.log("inside");
        if(err) throw err;
        var x = 1;
        for(var i = 0 ; i < parsedData.length ; i++){
            connection.query('INSERT INTO item_table SET ?', parsedData[i], (err, rows) => {
            if (!err) {
                console.log("Success "+ x++);
            } else {
                console.log(err)
            }
            //console.log('The data from item table are: \n', rows)

            })
        }
        connection.release() // return the connection to pool
    })
}

app.listen(3000);
