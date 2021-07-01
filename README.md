# Node.js simple file upload

### Dependencies
- express
- ejs
- fs
- multer
- mysql


### Run Node Server
```
> cd nodejs-simple-file-upload
> npm install
> npm start
```
### Run SQL Server
```
> Install XAMPP
> Run Apache and MySQL
> Create a DB named Items
> Create table using command 
CREATE TABLE `items`.`Item_table` ( `Item` VARCHAR(100) NULL , `Item_description` VARCHAR(100) NULL , `Item_price` VARCHAR(100) NULL , `Item_count` VARCHAR(100) NULL , `Vendor` VARCHAR(100) NULL , `Vendor_address` VARCHAR(100) NULL , `Total` VARCHAR(100) NULL , `Id` INT(100) NULL ) ENGINE = InnoDB;
```
### Attached file will be saved in the server in uploads folder.
The application will be served on `:3000`
