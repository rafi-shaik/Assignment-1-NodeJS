const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const format = require("date-fns/format");
const isValid = require("date-fns/isValid");

const app = express();
app.use(express.json());

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
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const statusValues = ["TO DO", "IN PROGRESS", "DONE"];
const priorityValues = ["HIGH", "MEDIUM", "LOW"];
const categoryValues = ["WORK", "HOME", "LEARNING"];

const hasStatus = (query) => {
  return query.status !== undefined;
};

const hasPriority = (query) => {
  return query.priority !== undefined;
};

const hasPriorityAndStatus = (query) => {
  return query.priority !== undefined && query.status !== undefined;
};

const hasCategory = (query) => {
  return query.category !== undefined;
};

const hasCategoryAndStatus = (query) => {
  return query.category !== undefined && query.status !== undefined;
};

const hasCategoryAndPriority = (query) => {
  return query.category !== undefined && query.priority !== undefined;
};

const changeCase = (array) => {
  const result = array.map((each) => ({
    id: each.id,
    todo: each.todo,
    priority: each.priority,
    status: each.status,
    category: each.category,
    dueDate: each.due_date,
  }));
  return result;
};

// API 1 GET Todos
app.get("/todos/", async (request, response) => {
  const { status, priority, category, search_q = "" } = request.query;

  let getTodosQuery = null;

  switch (true) {
    case hasStatus(request.query):
      let result1 = statusValues.includes(status);
      if (result1) {
        getTodosQuery = `
        SELECT
            * 
        FROM
            todo
        WHERE 
            todo LIKE '%${search_q}%'
            AND status = '${status}';`;
        const todosList = await db.all(getTodosQuery);
        response.send(changeCase(todosList));
      } else {
        response.status(400);
        response.send("Invalid Todo Status");
      }
      break;

    case hasPriority(request.query):
      let result2 = priorityValues.includes(priority);
      if (result2) {
        getTodosQuery = ` 
            SELECT 
                *
             FROM
                todo
             WHERE 
                todo LIKE '%${search_q}%'
                AND priority = '${priority}';`;
        const todosList = await db.all(getTodosQuery);
        response.send(changeCase(todosList));
      } else {
        response.status(400);
        response.send("Invalid Todo Priority");
      }
      break;

    case hasPriorityAndStatus(request.query):
      const res1 = priorityValues.includes(priority);
      const res2 = statusValues.includes(status);
      if (res1 && res2) {
        getTodosQuery = `
            SELECT 
                *
            FROM 
                todo
            WHERE 
                todo LIKE '%${search_q}%'
                AND status = '${status}'
                AND priority = '${priority}';`;
        const todosList = await db.all(getTodosQuery);
        response.send(changeCase(todosList));
      } else {
        if (res1 === false) {
          response.status(400);
          response.send("Invalid Todo Priority");
        } else if (res2 === false) {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      }
      break;

    case hasCategory(request.query):
      const result3 = categoryValues.includes(category);
      if (result3) {
        getTodosQuery = ` 
            SELECT 
                *
             FROM
                todo
             WHERE 
                todo LIKE '%${search_q}%'
                AND category = '${category}';`;
        const todosList = await db.all(getTodosQuery);
        response.send(changeCase(todosList));
      } else {
        response.status(400);
        response.send("Invalid Todo Category");
      }
      break;

    case hasCategoryAndStatus(request.query):
      const res3 = categoryValues.includes(category);
      const res4 = statusValues.includes(status);
      if (res3 && res4) {
        getTodosQuery = ` 
            SELECT 
                *
             FROM
                todo
             WHERE 
                todo LIKE '%${search_q}%'
                AND category = '${category}'
                AND status = '${status}'`;
        const todosList = await db.all(getTodosQuery);
        response.send(changeCase(todosList));
      } else {
        if (res3 === false) {
          response.status(400);
          response.send("Invalid Todo Category");
        } else if (res4 === false) {
          response.status(400);
          response.send("Invalid Todo Status");
        }
      }
      break;

    case hasCategoryAndPriority(request.query):
      const res5 = categoryValues.includes(category);
      const res6 = priorityValues.includes(priority);
      if (res5 && res6) {
        getTodosQuery = ` 
            SELECT 
                *
             FROM
                todo
             WHERE 
                todo LIKE '%${search_q}%'
                AND category = '${category}'
                AND priority = '${priority}'`;
        const todosList = await db.all(getTodosQuery);
        response.send(changeCase(todosList));
      } else {
        if (res5 === false) {
          response.status(400);
          response.send("Invalid Todo Category");
        } else if (res6 === false) {
          response.status(400);
          response.send("Invalid Todo Priority");
        }
      }
      break;

    default:
      getTodosQuery = ` 
            SELECT 
                *
             FROM
                todo
             WHERE 
                todo LIKE '%${search_q}%'`;
      const todosList = await db.all(getTodosQuery);
      response.send(changeCase(todosList));
  }
});

//API 2 GET a particular Todo
app.get("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const getTodoQuery = `
    SELECT
        *
     FROM
        todo
     WHERE
        id = ${todoId};`;
  const todoObj = await db.get(getTodoQuery);
  const result = {
    id: todoObj.id,
    todo: todoObj.todo,
    priority: todoObj.priority,
    status: todoObj.status,
    category: todoObj.category,
    dueDate: todoObj.due_date,
  };
  response.send(result);
});

//API 3 GET specific date Todos
app.get("/agenda/", async (request, response) => {
  const { date } = request.query;
  const dateResult = isValid(new Date(date));

  if (dateResult === true) {
    const formattedDate = format(new Date(date), "yyyy-MM-dd");
    const getTodosQuery = `
    SELECT 
        *
     FROM
        todo
     WHERE
        due_date = '${formattedDate}';`;
    const todosList = await db.all(getTodosQuery);
    response.send(changeCase(todosList));
  } else {
    response.status(400);
    response.send("Invalid Due Date");
  }
});

// API 4 Create a new Todo
app.post("/todos/", async (request, response) => {
  const { id, todo, priority, status, category, dueDate } = request.body;
  const isDateValid = isValid(new Date(dueDate));

  if (statusValues.includes(status) === false) {
    response.status(400);
    response.send("Invalid Todo Status");
  } else if (categoryValues.includes(category) === false) {
    response.status(400);
    response.send("Invalid Todo Category");
  } else if (priorityValues.includes(priority) === false) {
    response.status(400);
    response.send("Invalid Todo Priority");
  } else if (isDateValid === false) {
    response.status(400);
    response.send("Invalid Due Date");
  } else {
    const formattedDate = format(new Date(dueDate), "yyyy-MM-dd");
    const createNewTodo = `
    INSERT INTO
        todo (id, todo, priority, status, category, due_date)
    VALUES
    (${id}, '${todo}', '${priority}', '${status}', '${category}', '${formattedDate}');`;
    await db.run(createNewTodo);
    response.send("Todo Successfully Added");
  }
});

//API 5 Update a specific Todo
app.put("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const detailsTobeUpdated = request.body;
  let updatedColumn = "";

  switch (true) {
    case detailsTobeUpdated.status !== undefined:
      updatedColumn = "Status";
      break;

    case detailsTobeUpdated.priority !== undefined:
      updatedColumn = "Priority";
      break;

    case detailsTobeUpdated.category !== undefined:
      updatedColumn = "Category";
      break;

    case detailsTobeUpdated.todo !== undefined:
      updatedColumn = "Todo";
      break;

    case detailsTobeUpdated.dueDate !== undefined:
      updatedColumn = "Due Date";
      break;
  }

  const getRequiredTodoQuery = `
    SELECT
        *
     FROM
        todo
     WHERE id = ${todoId}`;
  const requiredTodo = await db.get(getRequiredTodoQuery);

  const {
    todo = requiredTodo.todo,
    status = requiredTodo.status,
    priority = requiredTodo.priority,
    category = requiredTodo.category,
    dueDate = requiredTodo.due_date,
  } = request.body;

  const isDateValid = isValid(new Date(dueDate));

  if (statusValues.includes(status) === false) {
    response.status(400);
    response.send("Invalid Todo Status");
  } else if (categoryValues.includes(category) === false) {
    response.status(400);
    response.send("Invalid Todo Category");
  } else if (priorityValues.includes(priority) === false) {
    response.status(400);
    response.send("Invalid Todo Priority");
  } else if (isDateValid === false) {
    response.status(400);
    response.send("Invalid Due Date");
  } else {
    const updateTodoQuery = ` 
    UPDATE 
        todo
     SET
        todo = '${todo}',
        priority = '${priority}',
        status = '${status}',
        category = '${category}',
        due_date = '${dueDate}'
    WHERE
        id = ${todoId};`;
    await db.run(updateTodoQuery);
    response.send(`${updatedColumn} Updated`);
  }
});

//API 6 DELETE a Todo
app.delete("/todos/:todoId/", async (request, response) => {
  const { todoId } = request.params;
  const deleteTodo = `
    DELETE FROM
        todo
     WHERE 
        id = ${todoId};`;
  await db.run(deleteTodo);
  response.send("Todo Deleted");
});

module.exports = app;
