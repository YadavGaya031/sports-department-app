// app.js
const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const app = express();
require('dotenv').config();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  multipleStatements: true
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL DB');
});

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/students', (req, res) => {
  db.query('SELECT * FROM Student', (err, students) => {
    if (err) throw err;
    res.render('students', { students });
  });
});

app.post('/students/add', (req, res) => {
  const { stud_id, name, branch, year, contact_no, sports_id, isHosteller, isSportStudent } = req.body;
  db.query('INSERT INTO Student VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
    stud_id, name, branch, year, contact_no, sports_id, isHosteller === 'on', isSportStudent === 'on'
  ], (err) => {
    if (err) throw err;
    res.redirect('/students');
  });
});

app.get('/items', (req, res) => {
  db.query('SELECT * FROM Items', (err, items) => {
    if (err) throw err;
    res.render('items', { items });
  });
});

app.post('/items/add', (req, res) => {
  const { item_id, item_name, quantity_available } = req.body;
  db.query('INSERT INTO Items VALUES (?, ?, ?)', [item_id, item_name, quantity_available], (err) => {
    if (err) throw err;
    res.redirect('/items');
  });
});

app.get('/issue', (req, res) => {
  db.query('SELECT * FROM Student; SELECT * FROM Items', (err, results) => {
    if (err) throw err;
    res.render('issue-form', { students: results[0], items: results[1] });
  });
});

app.post('/issue', (req, res) => {
  const { record_id, stud_id, staff_incharge, date_of_issue, items } = req.body;
  db.query('INSERT INTO Issue_Records VALUES (?, ?, ?, ?, NULL)', [record_id, stud_id, staff_incharge, date_of_issue], (err) => {
    if (err) throw err;
    const itemArray = JSON.parse(items);
    itemArray.forEach(item => {
      db.query('INSERT INTO Item_Status VALUES (?, ?, ?)', [record_id, item.item_id, item.quantity], (err) => {
        if (err) throw err;
      });
    });
    res.redirect('/records');
  });
});

app.get('/return', (req, res) => {
  db.query('SELECT * FROM Issue_Records WHERE date_of_return IS NULL', (err, records) => {
    if (err) throw err;
    res.render('return-form', { records });
  });
});

app.post('/return', (req, res) => {
  const { record_id, date_of_return } = req.body;
  db.query('UPDATE Issue_Records SET date_of_return = ? WHERE record_id = ?', [date_of_return, record_id], (err) => {
    if (err) throw err;
    res.redirect('/records');
  });
});

app.get('/records', (req, res) => {
  const sql = `SELECT ir.*, s.name AS student_name FROM Issue_Records ir JOIN Student s ON ir.stud_id = s.stud_id`;
  db.query(sql, (err, records) => {
    if (err) throw err;
    res.render('records', { records });
  });
});

app.get('/student/:id', (req, res) => {
  const stud_id = req.params.id;
  const sql = `SELECT ir.*, i.item_name, ist.quantity_issued FROM Issue_Records ir 
               JOIN Item_Status ist ON ir.record_id = ist.record_id
               JOIN Items i ON ist.item_id = i.item_id
               WHERE ir.stud_id = ?`;
  db.query(sql, [stud_id], (err, records) => {
    if (err) throw err;
    res.render('student-record', { records, stud_id });
  });
});

app.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
