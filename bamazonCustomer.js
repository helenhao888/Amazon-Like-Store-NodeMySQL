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

  displayProduct();

})

function displayProduct(){

  //when select ,convert price to display format
    connection.query("select item_id,product_name,concat('$',format(price,2)) as price from products",
      function(err,res){

        if (err) throw err;
        // Log all results of the SELECT statement  
        console.log(res);      
        console.table(res);
        res.forEach( xProduct => {
           choiceArr.push(xProduct.item_id+" "+xProduct.product_name);
        });
       
        inquirerCustomer();
        
    });
}


function inquirerCustomer(){

  inquirer.prompt({
      name: "action",
      type: "list",
      message: "What would you like to do?",
      choices: [
        "Buy products",        
        "Exit"
    ]
  })
  .then(function(answer) {

       if(answer.action === "Exit"){
          connection.end();
       }else if(answer.action === "Buy products"){
          inquirerProduct();
       }      
  })
}

function inquirerProduct(){

  inquirer.prompt([
       {
          name:"choice",
          message:"Please select the product you wanto buy",
          type:"rawlist",
          choices: choiceArr},       
       {
          name:"quantity",
          message:"Please input how many you want",
          type:"input",
          validate: function(value){
            //only numbers are allowed to input
            var pass = value.match(
              /^[0-9]{1,10}$/
            );
            if(pass){
                return true;
            }
            return "Please input one valid number";
           }
       }
      ]).then(function(answer){
      console.log(answer);
      var productId = answer.choice.split(" ")[0];
      console.log("product id ",productId);
      updateProduct(productId,answer.quantity);

  })
}


function updateProduct(id,number){

  connection.query("select price,stock_quantity from products where ?",
             {item_id:id},function(err,res){
      
      if(err) throw err;
      
      var cost = parseInt(number)*parseFloat(res[0].price);
      var quantity = parseInt(res[0].stock_quantity)-parseInt(number);      

      if(res.stock_quantity < number){
         console.log("Insufficient quantity!")
         inquirerCustomer();
      }else{
         connection.query("update products set ? where ?",
               [{stock_quantity:quantity,product_sales:cost},
                {item_id:id}],function(error){
                 if (error) throw error;
                 console.log("product updated");
                 console.log("Your order has been processed successfuly!"+
                              "\nYour total cost is $"+cost.toLocaleString("en"));
                           
                 inquirerCustomer();
               })
      }
  })

  
}