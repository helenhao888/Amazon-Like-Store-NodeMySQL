var mysql = require("mysql");
var inquirer = require("inquirer");
var chalk = require("chalk");
var numeral = require('numeral');
//read and set envioronment varibles with dotenv package
require("dotenv").config();
var keys = require("./keys");
const cTable = require("console.table");

var itemArr=[];

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

    inquirer.prompt([{
        name:"action",
        type:"list",
        message:"What would you like to do?",        
        choices:[
                 "View Products for Sale",
                 "View Low Inventory",
                 "Add to Inventory",
                 "Add New Product",
                 "Exit"
        ]
    }]).then(function(answer){

        switch(answer.action){
            case "View Products for Sale" : viewProduct();
                                            break;
            case "View Low Inventory"     : viewInventory();
                                            break;   
            case "Add to Inventory"       : queryProduct();
                                            break;
            case "Add New Product"        : addProduct();
                                            break;     
            case "Exit"                   : process.exit();                                                                                         
        }

    })
}

function viewProduct(){

    connection.query("select item_id,product_name, concat('$',format(price,2)) as price,                 stock_quantity from products", function(err,res){
        
          if (err) throw err;
          console.table(res);

          listOptions();
    })
}



function viewInventory(){
    connection.query("select item_id,product_name, concat('$',format(price,2)) as price,     stock_quantity from products where stock_quantity < ?", 
    [5],function(err,res){

        if (err) throw err;
        
        if(res.length >0 ){
            console.log("The following itmes are in low inventory, please add them !");
            console.table(res);           
        }else{
            console.log("No low inventory found!");
        }   
        listOptions();
    })
}

function addInventory(){
   
    inquirer.prompt([{
        name:"choice",
        message:"Please select the product you want to add more",
        type:"rawlist",
        choices: itemArr
    },{
        name:"number",
        type:"input",
        message:"Please input the quantity you want to add :",
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
    }]).then(function(answer){

        var itemId = answer.choice.split(" ")[0];    
        updateInventory(itemId,answer.number);
    })
}


// * If a manager selects `Add New Product`, it should allow the manager to add a completely new product to the store.
function addProduct(){
   
   inquirer.prompt([{
         name:"name",
         type:"input",
         message:"Please input the product name you want to add:"
       },
       {
        name:"department",
        type:"input",
        message:"Please input the department name :"
      },
       {
         name:"price",
         type:"input",
         message:"Please input the product price :",
       
         transformer:function(answers,flags){
             var priceConv = numeral(answers).format('$0,0.00');
             return priceConv;
         }
       },
       {
        name:"number",
        type:"input",
        message:"Please input the quantity you want to add :",
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
   ]).then(function(res){       

       console.log("res",res.number);
       insertProduct(res.name,res.department,res.price,res.number);
      
   })
}

function queryProduct(){

    itemArr=[];
    connection.query("select item_id, product_name from products",
        function(err,res){
            
            if (err) throw err;
            res.forEach( xProduct => {
                itemArr.push(xProduct.item_id+" "+xProduct.product_name);
             });
             
             console.log("item arr",itemArr);
             addInventory();
        })
}

function updateInventory(id,number){

   connection.query("select price,stock_quantity from products where ?",
             {item_id:id},function(err,res){
      
      if(err) throw err;
      var quantity = parseInt(res[0].stock_quantity)+parseInt(number);      

      
      connection.query("update products set ? where ?",
        [{stock_quantity:quantity},
        {item_id:id}],function(error){
            if (error) throw error;
            console.log("Product inventory added successfuly!");
            console.log("The total number of this product id "+id +
                        "is "+quantity+" now !");
                    
            listOptions();
        })
      })
  
}

function insertProduct(name,department,price,number){

    connection.query("insert into products set ?",
               {
                product_name: name,
                department_name: department,
                price: price,
                stock_quantity: number
               },
               function(err,res){

                   if(err)  throw err;
                   console.log("res",res);
                   console.log("Product added successfully!");
                   listOptions();
               })
   
}