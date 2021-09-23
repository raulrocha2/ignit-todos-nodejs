const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');
const { response, request } = require('express');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];


// Midleware 
function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  user = users.find((user) => user.username === username);

  if (!user) {
    return response.status(400).send({ error: 'Mensagem do erro' })
  }
  request.user = user;
  return next();
}

// Midleware 
function getTodoById(request, response, next) {
  const { id } = request.params;
  const { user } = request;

  const todo = user.todos.filter((todo) => todo.id === id);

  const indexOfTodo = user.todos.findIndex((todo) => todo.id === id);

  if (!todo.length) {

    return response.status(404).send({ error: 'Mensagem do erro' })
  }
  request.todo = todo;
  request.indexOfTodo = indexOfTodo;
  return next();
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some((user) =>
    user.username === username
  );

  if (userAlreadyExists) {
    return response.status(400).json({ error: "User Already exists" });
  }

  users.push({
    id: uuidv4(),
    name,
    username,
    todos: []
  })

  user = users.find((user) => user.username === username);

  return response.status(201).json(user)
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;
  return response.json(user.todos)
});

app.post('/todos', checksExistsUserAccount, (request, response) => {

  const { title, deadline } = request.body;
  const { user } = request;

  const todo = {

    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date()
  }

  user.todos.push(todo);
  return response.status(201).json(todo);
});

app.put('/todos/:id', checksExistsUserAccount, getTodoById, (request, response) => {

  const { title, deadline } = request.body;
  const { todo } = request;

  todo[0].title = title;
  todo[0].deadline = new Date(deadline);

  return response.json(todo[0]);
});

app.patch('/todos/:id/done', checksExistsUserAccount, getTodoById, (request, response) => {

  const { todo } = request;
  todo[0].done = !todo[0].done;
  return response.json(todo[0]);
});

app.delete('/todos/:id', checksExistsUserAccount, getTodoById, (request, response) => {

  const { user, indexOfTodo } = request;

  user.todos.splice(indexOfTodo, 1);

  return response.status(204).json();
});

module.exports = app;