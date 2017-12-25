var cellSize = 40; //grid width 
var canvas = document.getElementById('scene');
var c_width = canvas.width; 
var c_height = canvas.height;

var img_width = 30; 
var img_height = 30;

/*initialize canvas with 640 X 640*/
var ctx = canvas.getContext('2d');
ctx.clearRect(0, 0, c_width, c_height);

/*draw the grid within canvas*/
ctx.strokeStyle = "#ddd";
for(i=0; i<=c_width; i+=cellSize) {
	ctx.moveTo(i,0); ctx.lineTo(i, c_height);ctx.stroke();
}
for(i=0; i<=c_height; i+=cellSize) {
	ctx.moveTo(0,i); ctx.lineTo(c_width, i);ctx.stroke();
}

/*-------------------creating arrays for initial map-----------------------*/
/*converting 2 dimensions to array*/
var cell = []; //256 elements
var empty = []; //193 elements
var prospected  = []; // prospected
var installed = []; //pump was installed
for (var i = 0; i < 16; i++)
	for (var j = 0; j < 16; j++) {
		cell.push(i + j*16);
		empty.push(i + j*16);
	}

var grid = []; //196 elements
for (var i = 1; i < 15; i++)
		for (var j = 1; j < 15; j++)
			grid.push(i*16 + j);

/*planting 7 oil cells on map*/
var oil = []; //7 elements
while (oil.length < 7) {
	var index = Math.floor(Math.random()*grid.length); //choosing random number from 1 to 196
	oil.push(grid[index]);

	var x = grid[index]%16;
	var y = parseInt(grid[index]/16);
	
	grid = grid.filter(num => {
		x1 = num%16;
		y1 = parseInt(num/16);
		return (x1 < (x-2) || x1 > (x+2) ) || (y1 < (y-2) || (y1 > y+2));
	});
}

/*choosing two cities*/
var cities = [];
while (cities.length < 2) {
	index = Math.floor(Math.random()*grid.length);
	cities.push(grid[index]);

	var x = grid[index]%16;
	var y = parseInt(grid[index]/16);

	grid = grid.filter(num => {
		x1 = num%16;
		y1 = parseInt(num/16);
			return (x1 != x && y1 != y);
	});
}
/*creating adjacent array*/
var adjacent = [];
for (var i = 0; i < oil.length; i++) {
	adjacent.push(oil[i]-1);
	adjacent.push(oil[i]-15);
	adjacent.push(oil[i]-16);
	adjacent.push(oil[i]-17);
	adjacent.push(oil[i]+1);
	adjacent.push(oil[i]+15);
	adjacent.push(oil[i]+16);
	adjacent.push(oil[i]+17);
}

/*creating empty array*/
_.pullAll(empty, adjacent);
_.pullAll(empty, oil);
_.pullAll(empty, cities);
/*--------------creating truck object--------------------*/

/*uploading truck_image*/
var truck_img = new Image();
truck_img.src = 'img/truck.png';

/*converting array to position*/
function position_x(x) {
	return x%16*40+5;
}
function position_y(x) {
	return parseInt(x/16)*40+5;
}

/*drawing initial truck*/
var ini_pos = 46;
var initial_truck = document.getElementById('truck');

ctx.drawImage(initial_truck, position_x(ini_pos),position_y(ini_pos), img_width, img_height);

/*drawing initial cities*/
var initial_city1 = document.getElementById('city1');
var initial_city2 = document.getElementById('city2');
ctx.drawImage(initial_city1, position_x(cities[0]), position_y(cities[0]), img_width, img_height);
ctx.drawImage(initial_city2, position_x(cities[1]), position_y(cities[1]), img_width, img_height);

/*definition truck object*/
var truck = {
    body: truck_img,
    new_pos: ini_pos,
    old_pos: ini_pos,
    speed_x: 1,
    speed_y: 16,
    available_capacity:20,
    move: function(direction) { 
        var speed_x = this.speed_x;
        var speed_y = this.speed_y;
        switch (direction) {
        	case 'L':
        		this.old_pos = this.new_pos;
        		this.new_pos -= this.speed_x;
        		drawTruck(truck);
        		break;	
        	case 'R':
        		this.old_pos = this.new_pos;
        		this.new_pos += this.speed_x;
        		drawTruck(truck);
        		break;	
        	case 'U':
        		this.old_pos = this.new_pos;
        		this.new_pos -= this.speed_y;
        		drawTruck(truck);
        		break;	
        	case 'D':
        		this.old_pos = this.new_pos;
        		this.new_pos += this.speed_y;
        		drawTruck(truck);
        		break;	
        }
    }
}
/*detection keydown*/
function control_truck (event) {
    switch (event.keyCode) {
        case 37:
            truck.move('L');
            break;
        case 39:
            truck.move('R');
            break;
        case 38:
            truck.move('U');
            break;
        case 40:
            truck.move('D');
            break;
    }
}
var total = 0; //total collected oil
/*moving truck as followed keyCode*/
function drawTruck(truck) {
   	if ((truck.new_pos%16 == 0 && (truck.old_pos == truck.new_pos-1)
        || (truck.new_pos%16 == 15 && truck.old_pos == truck.new_pos+1)
		|| truck.new_pos > 256 ) 
        || truck.new_pos < 0) {
		truck.new_pos = truck.old_pos;
	}
    if (prospected.indexOf(truck.new_pos) !== -1) {
        truck.new_pos = truck.old_pos;
    }
    if (prospected.indexOf(truck.old_pos) == -1 && installed.indexOf(truck.old_pos) == -1) {
	   ctx.clearRect(position_x(truck.old_pos), position_y(truck.old_pos), img_width, img_height);
    }
    if (installed.indexOf(truck.old_pos) !== -1) {
        ctx.clearRect(position_x(truck.old_pos), position_y(truck.old_pos), img_width, img_height);
        ctx.drawImage(pump_img[installed.indexOf(truck.old_pos)], position_x(truck.old_pos), position_y(truck.old_pos), img_width, img_height);       
    }
    if (cities.indexOf(truck.old_pos) !== -1) {
        ctx.clearRect(position_x(truck.old_pos), position_y(truck.old_pos), img_width, img_height);
        ctx.drawImage(city1, position_x(truck.old_pos), position_y(truck.old_pos), img_width, img_height);       
        total += (20-truck.available_capacity);
        document.getElementById('total').innerHTML = total;
        document.getElementById('capacity').innerHTML = 0;
        truck.available_capacity = 20;
    }
	ctx.drawImage(truck.body, position_x(truck.new_pos), position_y(truck.new_pos), img_width, img_height);
}

/*to detect status of current position*/
// var detected_array = [];
function detect_status(current_pos) {
    if (oil.indexOf(current_pos) !== -1) {
        oil = oil.filter(num => num != current_pos);
        return 1;
    }
    if (adjacent.indexOf(current_pos) !== -1) {
        adjacent = adjacent.filter(num => num !=current_pos);
        return 2;
    }
    if (empty.indexOf(current_pos) !== -1){
        empty = empty.filter(num => num != current_pos);
        return 3;
    }
    // if (_.some(pumps, current_pos) == true)
    //     return 4;
    // if (_.some(prospected, current_pos) == true)
    //     return 5;
}

/*when drill button is clicked*/
var empty_img = document.getElementById('empty');
var adjacent_img = document.getElementById('adjacent');
var pump_num = 0; //number of pumps 1~7
var pump_img = []; //img to draw pump 1~7

var pump_count = []; //installed pump array 1~7
var count = []; //number to count 1~30
for (var i = 1; i <= 7; i++) {
  count.push(0);
}
function drill() { 
    var status = detect_status(truck.new_pos);
    switch (status) {
        case 1:
            pump_img.push(document.getElementById('pump'+pump_num));
            ctx.drawImage(pump_img[pump_num], position_x(truck.new_pos), position_y(truck.new_pos), img_width, img_height);
            installed.push(truck.new_pos);
            /*pump_numth pump starts counting*/
            start_count(pump_num);
            pump_num += 1;
            break;
        case 2:
            ctx.drawImage(adjacent_img, position_x(truck.new_pos), position_y(truck.new_pos), img_width, img_height);
            prospected.push(truck.new_pos);
            break;
        case 3:
            ctx.drawImage(empty_img, position_x(truck.new_pos), position_y(truck.new_pos), img_width, img_height);
            prospected.push(truck.new_pos);
            break;
    }
}
function start_count(pump_num) {
    pump_count[pump_num] = setInterval(function() {
        document.getElementById('count'+pump_num).innerHTML = count[pump_num];
        count[pump_num]++;
        if (count[pump_num] > 30)
            clearInterval(pump_count[pump_num]);
    }, 1000);
}

/*when the fillup button is clicked on pump*/
function fillUp() {
    var num = installed.indexOf(truck.new_pos);
    console.log(num);
    if ( num == -1)
        return
    else {
        if (count[num] >= truck.available_capacity && truck.available_capacity != 0) {
            count[num] -= truck.available_capacity;
            truck.available_capacity = 0;
            document.getElementById('capacity').innerHTML = (20 - truck.available_capacity);
            clearInterval(pump_count[num]);
            start_count(num);
        }
        if (count[num] < truck.available_capacity) {
            truck.available_capacity -= count[num];
            count[num] = 0;
            document.getElementById('capacity').innerHTML = (20 - truck.available_capacity);
            clearInterval(pump_count[num]);
            start_count(num);
        }
    }
    console.log(truck.available_capacity);
    console.log(count[num]);
}
window.addEventListener('keydown', control_truck, false);
