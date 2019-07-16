var mysql = require("mysql");
var inquirer = require("inquirer");
var chalk = require("chalk");
//read and set envioronment varibles with dotenv package
require("dotenv").config();
var keys = require("./keys");
const cTable = require("console.table");

var choiceArr=[];

// create the connection information for the sql database
var connection = mysql.createConnection({
  host: "localhost",
  port: 3306,
  user: "root",
  password: keys.db.passwd,
  database: "bamazon"
});

// connect to the mysql server and sql database
connection.connect(function(err){

  if(err) throw err;

  listOptions();

})

function listOptions(){

    inquirer.prompt({
        name="choice",
        type="list",
        message="What would you like to do?",        
        choices=[
                 "View Products for Sale",
                 "View Low Inventory",
                 "Add to Inventory",
                 "Add New Product",
                 "Exit"
        ]
    }).then(function(answer){

        switch(answer.choice){
            case "View Products for Sale" : viewProduct();
                                            break;
            case "View Low Inventory"     : viewInventory();
                                            break;   
            case "Add to Inventory"       : addInventory();
                                            break;
            case "Add New Product"        : addProduct();
                                            break;     
            case "Exit"                   : process.exit();                                                                                         
        }

    })
}

function viewProduct(){

    connection.query("select item_id,product_name, price, quantity from products",
        function(err,res){
        
          if (err) throw err;
          console.table(res);

          listOptions();
    })
}


// * If a manager selects `View Low Inventory`, then it should list all items with an inventory count lower than five.

// * If a manager selects `Add to Inventory`, your app should display a prompt that will let the manager "add more" of any item currently in the store.

// * If a manager selects `Add New Product`, it should allow the manager to add a completely new product to the store.
function viewInventory(){
    connection.query("select item_id,product_name, price, quantity from products where ? < ?", [quantity, 5],function(err,res){

        console.log()
        console.table(res);
    })
}

function addInventory(){

}

function addProduct(){

}