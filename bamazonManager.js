var mysql = require("mysql");
var inquirer = require("inquirer");
var chalk = require("chalk");
var numeral = require('numeral');
//read and set envioronment varibles with dotenv package
require("dotenv").config();
var keys = require("./keys");
const cTable = require("console.table");

var itemArr=[];
const costRate=0.8;
const lowInventoryNum =5;

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

  listOptions();

})

//the main options for the manager
function listOptions(){

    inquirer.prompt([{
        name:"action",
        type:"list",
        message:"\n\nWhat would you like to do?",        
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

//list all the products' information retrieved from products table
function viewProduct(){

    console.log(chalk.gray("\n---------Product List ---------\n"));

    connection.query("select item_id,product_name, concat('$',format(price,2)) as price,                 stock_quantity from products", function(err,res){
        
          if (err) throw err;

          console.table(res);
          listOptions();
    })
}


//select products table to get the products whose stock_quantity is in lower status
function viewInventory(){
    connection.query("select item_id,product_name, concat('$',format(price,2)) as price,     stock_quantity from products where stock_quantity < ?", 
    [lowInventoryNum],function(err,res){

        if (err) throw err;
        
        if(res.length >0 ){
            console.log(chalk.yellow("\nThe following itmes are in low inventory, please add them !"));
            console.table(res);           
        }else{
            console.log(chalk.green("\nNo low inventory found!"));
        }   
        listOptions();
    })
}

//add the stock quantity for the selected product , then update the department's over_head_cost
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
        //when add a new product, first check the product's department exists in the 
        //departments table. If it exists, continue to insert product and update 
        //department's over head cost.If it doesn't exist, display incorrect department or need supervisor to add the new department
         checkDepartment(res.name,res.department,res.price,res.number);
      
   })
}

//get all the item id and product name from products table
function queryProduct(){

    itemArr=[];
    connection.query("select item_id, product_name from products",
        function(err,res){
            
            if (err) throw err;
            res.forEach( xProduct => {
                itemArr.push(xProduct.item_id+" "+xProduct.product_name);
             });             
            
             addInventory();
        })
}

//when add a product's stock quantity, update products table
function updateInventory(id,number){

   connection.query("select price,department_name,stock_quantity from products where ?",
             {item_id:id},function(err,res){
      
      if(err) throw err;
      var quantity = parseInt(res[0].stock_quantity)+parseInt(number);      
      var cost = parseInt(number) * res[0].price;
      
      connection.query("update products set ? where ?",
        [{stock_quantity:quantity},
        {item_id:id}],function(error){
            if (error) throw error;
            console.log(chalk.blue("\nProduct inventory added successfuly!"));
            console.log(chalk.blue("\nThe total number of this product id "+id +
                        " is "+quantity+" now !"));
            updateDepartment(res[0].department_name,cost);        
            
        })
      })
  
}

//check if the department name exists in departments table
function checkDepartment(name,department,price,number){

    connection.query("select department_name,count(*) as count from departments where ?",
        {
            department_name:department
        },function(err,res){
            if(err) throw err;
            
            if(res[0].count != 0){
                //if the department name exists in departments table, insert the new product
                insertProduct(name,department,price,number);
            }else{
                console.log(chalk.red("\nThe deparment "+department+" doesn't exist in departments table!"));
                console.log(chalk.red("Please check your input or ask a supervisor to add a new department!"));
                listOptions();
            }
        })
}

//add a new product to products table
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
                   var cost=price*number*costRate;
                   //when add a product, update the product's deparment's over head cost
                   updateDepartment(department,cost);
                   console.log(chalk.blue("\nProduct "+name+" added successfully!"));
               })
}

//update department's over head costs 
function updateDepartment(department,cost){

    connection.query("update departments set over_head_costs = over_head_costs + ? where ?",
    [
        cost,
    {
        department_name:department
    }]
    ,function(err,res){

        if (err) throw err;

        console.log(chalk.blue("\nDepartment "+department+"'s over head cost has been updated successfully!"));
        

        listOptions();
    })
}