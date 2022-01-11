let socket
let color = '#FFF'
let strokeWidth = 4

function setup() {
	// Creating canvas
	const cv = createCanvas(50, 50);
	cv.position(000, 000);
	cv.background(1);

	// Start the socket connection
	socket = io.connect('http://localhost:3000')

	// Callback function
	socket.on('mouse', function(data) {
		stroke(data.color);
		strokeWeight(data.strokeWidth);
		line(data.x, data.y, data.px, data.py);
	});
}

function mouseDragged() {
	// Draw
	stroke(color);
	strokeWeight(strokeWidth);
	line(mouseX, mouseY, pmouseX, pmouseY);

	// Send the mouse coordinates
	sendmouse(mouseX, mouseY, pmouseX, pmouseY);
}

// Sending data to the socket
function sendmouse(x, y, pX, pY) {
	const data = {
		x: x,
		y: y,
		px: pX,
		py: pY,
		color: color,
		strokeWidth: strokeWidth,
	}

	socket.emit('mouse', data);
}