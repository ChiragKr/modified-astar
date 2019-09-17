// How many columns and rows?
var cols = 50;
var rows = 50;

// This will the 2D array
var grid = new Array(cols);

// Open and closed set
var openSet = new PriorityQueue();
var closedSet = [];

// Start and end
var start;
var end;

// Current node
var current;
var neighbors;

// Width and height of each cell of grid
var w, h;

// The road taken
var path = [];
var depth;
var closestSpot = undefined;

function setup() {
  var canvas = createCanvas(700, 700);

  console.log('A*');

  // Grid cell size
  w = width / cols;
  h = height / rows;

  // Making a 2D array
  for (var i = 0; i < cols; i++) {
    grid[i] = new Array(rows);
  }

  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      grid[i][j] = new Spot(i, j);
    }
  }

  // building wall
  // for(var j = floor((1*rows)/3); j < floor((2*rows)/3); ++j){
  //   grid[floor((2*cols)/3)][j].wall = true;
  // }

  // for(var i = floor((1*cols)/3); i < ceil((2*cols)/3); ++i){
  //   grid[i][floor((2*rows)/3)].wall = true;
  // }

  // All the neighbors
  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      grid[i][j].addNeighbors(grid);
    }
  }

  // Start and end
  start = grid[0][0];
  end = grid[cols - 1][rows - 1];
  start.wall = false;
  end.wall = false;

  current = start;
  openSet.enqueue(start, start.f)
  depth = 5;
}

function heuristic(a, b) {
  var d = dist(a.i, a.j, b.i, b.j);
  return d;
}

function no_heuristic(a, b){
  return 0;
}

function reconstruct_path(current){
  // building path as a list
  total_path = [];
  while(current)
  {
    total_path.push(current)
    current = current.previous;  
  }
  return total_path
}

function modified_expand(S, depth){
  if(!closedSet.includes(S))
    closedSet.push(S);

  var temp1 = [S];
  while(depth > 0){
    var temp2 = []
    while(temp1.length){
      var C = temp1.shift()
      if (C === end){
        temp1.push(C);
        return temp1;
      }

      temp3 = C.neighbors.filter(
        function(x){
          return (((!closedSet.includes(x)) 
            || (x.g>C.g+1)) && !x.wall);
      });
      
      temp3.forEach(function(t, index){
        t.g = C.g + 1;
        t.previous = C;
        if(!closedSet.includes(t))
          closedSet.push(t);
      });

      temp2 = temp2.concat(temp3);
    }
    depth -= 1;
    temp1 = temp2;
  }
  return temp1;
}

function modified_astar(heuristic) {

  if (current !== end) {
    neighbors = modified_expand(current, depth);

    neighbors.forEach(function(t, index){
      t.h = heuristic(t, end);
      t.f = t.g + t.h
      openSet.enqueue(t, t.f);
    });

    if(openSet.isEmpty()){
      console.log('no solution');
      current = closestSpot;
      noLoop();
    }

    current = (openSet.dequeue())["element"];

  } else {
    noLoop();
    console.log("DONE!");
    console.log('PATH LENGTH: ',
      total_path.length);
  }
}

function draw() {

  // calling astar in each draw loop
  modified_astar(heuristic);

  // Draw current state of everything
  background(255);

  for (var i = 0; i < cols; i++) {
    for (var j = 0; j < rows; j++) {
      grid[i][j].show();
    }
  }

  for (var i = 0; i < closedSet.length; i++) {
    closedSet[i].show(color(255, 0, 0, 50));
  }

  for (var i = 0; i < openSet.items.length; i++) {
    openSet.items[i]["element"].show(color(0, 255, 0, 50));
  }

  // Find the path by working backwards
  var path = reconstruct_path(current);

  // Drawing path as continuous line
  noFill();
  stroke(0, 0, 255);
  strokeWeight(w / 2);
  beginShape();
  for (var i = 0; i < path.length; i++) {
    vertex(path[i].i * w + w / 2, path[i].j * h + h / 2);
  }
  endShape();
}
