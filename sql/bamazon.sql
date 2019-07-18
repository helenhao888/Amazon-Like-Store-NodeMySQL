 DROP DATABASE IF EXISTS bamazon;
 CREATE DATABASE bamazon;
 USE bamazon;

CREATE TABLE products (
    item_id INT NOT NULL AUTO_INCREMENT ,
    product_name VARCHAR(50) NOT NULL,
    department_name VARCHAR(30) NOT NULL,
    price  DECIMAL(10,2),
    stock_quantity INT(10),
    product_sales DECIMAL(20,2) DEFAULT 0,
    update_stamp  DATETIME,
    PRIMARY KEY(item_id)
);

CREATE TABLE departments(
    department_id CHAR(4) NOT NULL,
    department_name VARCHAR(30) NOT NULL,
    over_head_costs INT(8),
    PRIMARY KEY(department_id)
);

INSERT INTO departments (department_id, department_name,over_head_costs )
            VALUES ("0001","Computers",10001);
INSERT INTO departments (department_id, department_name,over_head_costs )
            VALUES ("0002","Movies",20002);                     
INSERT INTO departments (department_id, department_name,over_head_costs )
            VALUES ("0003","Books",3003);  
INSERT INTO departments (department_id, department_name,over_head_costs )
            VALUES ("0004","Toys",4004);  

INSERT INTO products (product_name,department_name,price,stock_quantity,
                  update_stamp) 
            VALUES ("Dell laptop","Computers",1000.5,200,"2019-07-14 02:01:01");      
 
INSERT INTO products (product_name,department_name,price,stock_quantity,
                  update_stamp) 
            VALUES ("Lenovo laptop","Computers",1100.6,200,"2019-07-14 02:01:01"); 

INSERT INTO products (product_name,department_name,price,stock_quantity,
                  update_stamp) 
            VALUES ("HP laptop","Computers",900,200,"2019-07-14 02:01:01");

INSERT INTO products (product_name,department_name,price,stock_quantity,
                  update_stamp) 
            VALUES ("Lego Set","Toys",30.01,300,"2019-07-14 02:01:01");           
INSERT INTO products (product_name,department_name,price,stock_quantity,
        update_stamp) 
            VALUES ("Disney Story","Toys",35.01,300,"2019-07-14 02:01:01");  

INSERT INTO products (product_name,department_name,price,stock_quantity,
        update_stamp) 
            VALUES ("Baby Slide","Toys",35.01,300,"2019-07-14 02:01:01");  

INSERT INTO products (product_name,department_name,price,stock_quantity,
        update_stamp) 
            VALUES ("Social Study book","Books",15.08,400,"2019-07-14 02:01:01");  

INSERT INTO products (product_name,department_name,price,stock_quantity,
        update_stamp) 
            VALUES ("Geography book","Books",12.28,400,"2019-07-14 02:01:01"); 

INSERT INTO products (product_name,department_name,price,stock_quantity,
        update_stamp) 
            VALUES ("History book","Books",15.28,400,"2019-07-14 02:01:01");    

INSERT INTO products (product_name,department_name,price,stock_quantity,
        update_stamp) 
            VALUES ("Fairy Tales","Books",18.28,400,"2019-07-14 02:01:01");        


