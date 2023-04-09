const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const format = require("date-fns/format");

const app = express();

const dbPath = path.join(__dirname, "todoApplication.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is running at http://localhost:3000/");
    });
  } catch (error) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/todos/", async (request, response) => {
  const { status } = request.query;
  //   console.log(status);
  const getTodos = `
    SELECT
        * 
     FROM
        todo
     WHERE 
        status LIKE '${status}'
    `;
  const todosList = await db.all(getTodos);
  response.send(todosList);
});

app.get("/todos/", async (request, response) => {
  const { priority } = request.query;
  //   console.log(request.query);
  const getPriority = `
    SELECT
        * 
     FROM
        todo
     WHERE 
        priority = '${priority}'
    `;
  const todosListPriority = await db.all(getPriority);
  response.send(todosListPriority);
});

app.get("/todos/", async (request, response) => {
  const { priority, status } = request.query;

  const getPriorityAndStatus = `
    SELECT
        * 
     FROM
        todo
     WHERE 
        priority LIKE '%${priority}%'
        AND status LIKE '%${status}%'
    `;
  const todosListPriorityAndStatus = await db.all(getPriorityAndStatus);
  response.send(todosListPriorityAndStatus);
});

app.get("/todos/", async (request, response) => {
  const { search_q } = request.query;
  const getList = `
    SELECT 
        * 
     FROM 
        table 
     WHERE 
        todo LIKE '%${search_q}%'
    `;
  const list = await db.all(getList);
  response.send(list);
});

app.get("/todos/", async (request, response) => {
  const { category, status } = request.query;

  const getList2 = `
    SELECT
        * 
     FROM
        todo
     WHERE 
        category LIKE '%${category}%'
        AND status LIKE '%${status}%'
    `;
  const workAndCategory = await db.all(getList2);
  response.send(workAndCategory);
});

app.get("/todos/", async (request, response) => {
  const { category } = request.query;
  const getList3 = `
    SELECT 
        * 
     FROM 
        table 
     WHERE 
        category LIKE '%${category}%';
    `;
  const categoryList = await db.all(getList3);
  response.send(categoryList);
});

app.get("/todos/", async (request, response) => {
  const { category, priority } = request.query;
  const getList4 = `
    SELECT
        * 
     FROM
        todo
     WHERE 
        category LIKE '%${category}%'
        AND priority LIKE '%${priority}%'
    `;
  const categoryAndPriority = await db.all(getList4);
  response.send(categoryAndPriority);
});

module.exports = app;
