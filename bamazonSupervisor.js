var mysql = require("mysql");
var inquirer = require("inquirer");
var chalk = require("chalk");
var numeral = require('numeral');
//read and set envioronment varibles with dotenv package
require("dotenv").config();
var keys = require("./keys");
const cTable = require("console.table");


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

function listOptions(){

    inquirer.prompt([{
        name:"action",
        type:"list",
        message:"\n\nWhat would you like to do?",        
        choices:[
                 "View Product Sales by Department",
                 "Create New Department",                
                 "Exit"
        ]
    }]).then(function(answer){

        switch(answer.action){
            case "View Product Sales by Department" 
                                          : viewProduct();
                                            break;
            case "Create New Department"  : addDepartment();
                                            break;      
            case "Exit"                   : process.exit();  
                                            break;                                                                                       
        }

    })
}

//join products and departments tables to dispaly the total costs , sales and profit info
function viewProduct(){

    var queryS= "select department_id, department_name, over_head_costs, product_sales,";
    queryS +=           "(product_sales - over_head_costs) as total_profit ";
    queryS +=   "from (";
    queryS +=         "select a.department_id, a.department_name, ";
    queryS +=                "sum(a.over_head_costs) as over_head_costs,";
    queryS +=                "sum(b.product_sales) as product_sales ";
    queryS +=         " from departments as a ";
    queryS +=         "left join products as b on (a.department_name = b.department_name) ";
    queryS +=         "GROUP BY department_id ";
    queryS +=         "order by department_id ";
    queryS +=         ") subq   ; "

   

    connection.query(queryS, function(err,res){
        
          if (err) throw err;
          console.table(res);

          listOptions();
    })
}

//add a new department
function addDepartment(){

    inquirer.prompt([
        {
            name:"departId",
            type:"input",
            message:"Please input the department id you want to add:",
            validate:function(value){
                //department id must be 4 characters
                var pass = value.match(/^[0-9a-zA-Z]{4,4}$/
                  );
                  if(pass){
                      return true;
                  }
                  return "Please input one 4 characters department id including numbers and letters!";
                 }
        },
        {
            name:"departName",
            type:"input",
            message:"Please input the department name you want to add:"
        
    }]).then(function(answers){
        
        connection.query("insert into departments set ?",
            {
               department_id: answers.departId,
               department_name: answers.departName,
               over_head_costs:0
            },function(err,res){

                if (err)  throw err;
          
                console.log(chalk.blue("Created department "+answers.departName+" successfully!"));
                listOptions();

        })
    })
}