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
  host: keys.db.host,
  port: keys.db.port,
  user: keys.db.user,
  password: keys.db.passwd,
  database: keys.db.db
});

// connect to the mysql server and sql database
connection.connect(function(err){

  if(err) throw err;

  displayProduct();

})

function displayProduct(){

  console.log(chalk.gray("\n---------Product List ---------\n"));
  //when select ,convert price to display format
    connection.query("select item_id,product_name,concat('$',format(price,2)) as price from products",
      function(err,res){

        if (err) throw err;
        // Log all results of the SELECT statement  
            
        console.table(res);
        res.forEach( xProduct => {
           choiceArr.push(xProduct.item_id+" "+xProduct.product_name);
        });
       
        inquirerCustomer();
        
    });
}

//main menu for customer
function inquirerCustomer(){

  inquirer.prompt({
      name: "action",
      type: "list",
      message: "\n\nWhat would you like to do?",
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

//inquirer customer's demand on buying product
function inquirerProduct(){

  inquirer.prompt([
       {
          name:"choice",
          message:"Please select the product you want to buy",
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
      
      var productId = answer.choice.split(" ")[0];
     
      updateProduct(productId,answer.quantity);

  })
}

//update products table's stock quantity and product sales columns
function updateProduct(id,number){

  connection.query("select price,stock_quantity,product_sales from products where ?",
             {item_id:id},function(err,res){
      
      if(err) throw err;
      
      console.log("product sales",)
      var cost = parseInt(number)*res[0].price;
      var totalCost=res[0].product_sales+cost;
      var quantity = res[0].stock_quantity-parseInt(number);      
       
      if(quantity < 0){
         console.log(chalk.red.bold("Insufficient quantity!"));
         inquirerCustomer();
      }else{
         connection.query("update products set ? where ?",
               [{stock_quantity:quantity,product_sales:totalCost},
                {item_id:id}],function(error){
                 if (error) throw error;
                 console.log(chalk.blue("product updated!"));
                 console.log(chalk.blue("Your order has been processed successfuly!"+
                              "\nYour total cost is $"+cost.toLocaleString("en")));
                               
                 inquirerCustomer();
               })
      }
  })

  
}