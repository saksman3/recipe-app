const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

let recipes = [
  { id: 1, name: 'Pasta', ingredients: ['pasta', 'tomato sauce', 'cheese'], instructions: 'Boil pasta, add sauce, sprinkle cheese.' },
  { id: 2, name: 'Pancakes', ingredients: ['flour', 'milk', 'eggs', 'sugar'], instructions: 'Mix ingredients, cook on griddle.' }
];

// Health check endpoint
app.get('/', (req, res) => {
    res.status(200).send('Healthy');
  });
// Get all recipes
app.get('/recipes', (req, res) => {
  res.json(recipes);
});

// Get a single recipe by ID
app.get('/recipes/:id', (req, res) => {
  const recipe = recipes.find(r => r.id === parseInt(req.params.id));
  if (recipe) {
    res.json(recipe);
  } else {
    res.status(404).send('Recipe not found');
  }
});

// Create a new recipe
app.post('/recipes', (req, res) => {
  const newRecipe = {
    id: recipes.length + 1,
    name: req.body.name,
    ingredients: req.body.ingredients,
    instructions: req.body.instructions
  };
  recipes.push(newRecipe);
  res.status(201).json(newRecipe);
});

// Update an existing recipe
app.put('/recipes/:id', (req, res) => {
  const recipe = recipes.find(r => r.id === parseInt(req.params.id));
  if (recipe) {
    recipe.name = req.body.name;
    recipe.ingredients = req.body.ingredients;
    recipe.instructions = req.body.instructions;
    res.json(recipe);
  } else {
    res.status(404).send('Recipe not found');
  }
});

// Delete a recipe
app.delete('/recipes/:id', (req, res) => {
  recipes = recipes.filter(r => r.id !== parseInt(req.params.id));
  res.status(204).send();
});

app.listen(port, () => {
  console.log(`Recipe sharing app listening at http://localhost:${port}`);
});
