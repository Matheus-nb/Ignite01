const express = require('express');
const cors = require('cors');
const { v4: uuidv4 } = require('uuid');

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
  const { username } = request.headers;

  const user = users.find(thisUser => thisUser.username === username);

  if(!user) {
    return response.status(404).json({
      error: 'User not found!',
    });
  };

  request.user = user;

  return next();
}

function checkExistsTodo(todos, id) {
  const todoSpecs = todos.find(thisTodo => thisTodo.id === id);
  
  return todoSpecs;
}

app.post('/users', (request, response) => {
  const { name, username } = request.body;

  const userAlreadyExists = users.some(
    thisUser => thisUser.username === username,
  );

  if(userAlreadyExists) {
    return response.status(400).json({
      error: 'User already exists!',
    });
  };

  const user = {
    id: uuidv4(),
    name,
    username,
    todos: [],
  };

  users.push(user);

  return response.status(201).json(user);
});

app.get('/todos', checksExistsUserAccount, (request, response) => {
  const { user } = request;

  return response.json(user.todos);
});

app.post('/todos', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { user } = request;

  const todoSpecs = {
    id: uuidv4(),
    title,
    done: false,
    deadline: new Date(deadline),
    created_at: new Date(),
  };

  user.todos.push(todoSpecs);

  return response.status(201).json(todoSpecs);
});

app.put('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { title, deadline } = request.body;
  const { id } = request.params;
  const { user } = request;

  const todoSpecs = checkExistsTodo(user.todos, id);

  if(!todoSpecs) {
    return response.status(404).json({
      error: 'Todo not found!',
    });
  };

  todoSpecs.title = title;
  todoSpecs.deadline = deadline;

  return response.status(201).json(todoSpecs);
});

app.patch('/todos/:id/done', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoSpecs = checkExistsTodo(user.todos, id);

  if(!todoSpecs) {
    return response.status(404).json({
      error: 'Todo not found!',
    });
  };

  todoSpecs.done = true;

  return response.status(201).json(todoSpecs);
});

app.delete('/todos/:id', checksExistsUserAccount, (request, response) => {
  const { id } = request.params;
  const { user } = request;

  const todoSpecs = checkExistsTodo(user.todos, id);

  if(!todoSpecs) {
    return response.status(404).json({
      error: 'Todo not found!',
    });
  };

  user.todos.splice(user.todos.indexOf(todoSpecs), 1);

  return response.status(204).send();
});

module.exports = app;