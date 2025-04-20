# 🏀 Sports Department Management App

A web application to manage sports item inventory and student issue/return records using:

- Node.js + Express
- MySQL
- EJS templates

## 📂 Features

- Student management
- Item inventory tracking
- Item issue & return records
- View complete history


## 🛠️ MySQL Schema

```sql
CREATE DATABASE sports_db;

USE sports_db;

CREATE TABLE Student (
    stud_id INT PRIMARY KEY,
    name VARCHAR(100),
    branch VARCHAR(50),
    year INT,
    contact_no VARCHAR(15),
    sports_id INT,
    isHosteller BOOLEAN,
    isSportStudent BOOLEAN
);

CREATE TABLE Items (
    item_id INT PRIMARY KEY,
    item_name VARCHAR(100),
    quantity_available INT
);

CREATE TABLE Issue_Records (
    record_id INT PRIMARY KEY, 
    stud_id INT,
    staff_incharge VARCHAR(100),
    date_of_issue DATE NOT NULL,
    date_of_return DATE,
    CHECK (
        date_of_return IS NULL OR date_of_return >= date_of_issue
    ),
    FOREIGN KEY (stud_id) REFERENCES Student(stud_id)
);

CREATE TABLE Item_Status (
    record_id INT,
    item_id INT,
    quantity_issued INT,
    PRIMARY KEY (record_id, item_id),
    FOREIGN KEY (record_id) REFERENCES Issue_Records(record_id),
    FOREIGN KEY (item_id) REFERENCES Items(item_id)
);

```

## 🚀 How to Run

1. Clone the repo  
2. Run `npm install`  
3. Create `sports_db` in MySQL using the provided schema  
4. Update MySQL credentials in `app.js`  
5. Run with `node app.js`  
6. Visit `http://localhost:3000`

