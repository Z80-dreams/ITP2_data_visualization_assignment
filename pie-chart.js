function PieChart(x, y, diameter) {

  this.x = x;
  this.y = y;
  this.diameter = diameter;
  this.labelSpace = 30;
  this.get_radians = function(data) {
    var total = sum(data);
    var radians = [];

    for (let i = 0; i < data.length; i++) {
      radians.push((data[i] / total) * TWO_PI);
    }

    return radians;
  };

  this.draw = function(data, labels, colours, title) {
    this.labels = labels;
    this.numberLabels = this.makeLegendData(data);
    // Test that data is not empty and that each input array is the
    // same length.
    if (data.length == 0) {
      alert('Data has length zero!');
    } else if (![this.labels, colours].every((array) => {
      return array.length == data.length;
    })) {
      alert(`Data (length: ${data.length})
Labels (length: ${this.labels.length})
Colours (length: ${colours.length})
Arrays must be the same length!`);
    }

    // https://p5js.org/examples/form-pie-chart.html

    this.angles = this.get_radians(data); //making public as I need it for writing label to center.
    var lastAngle = 0;
    var colour;

    for (var i = 0; i < data.length; i++) {
      if (colours) {
        colour = colours[i];
      } else {
        colour = map(i, 0, data.length, 0, 255);
      }

      fill(colour);
      stroke(0);
      strokeWeight(1);

      arc(this.x, this.y,
          this.diameter, this.diameter,
          lastAngle, lastAngle + this.angles[i] + 0.001); // Hack for 0!

      if (labels) {
        this.makeLegendItem(labels[i], i, colour);
      }

      lastAngle += this.angles[i];
    }

    if (title) {
      noStroke();
      textAlign('center', 'center');
      textSize(24);
      text(title, this.x, this.y - this.diameter * 0.6);
    }

    this.makeInnerCircle();
  };



  this.makeLegendItem = function(label, i, colour) {
    var x = this.x + 50 + this.diameter / 2;
    var y = this.y + (this.labelSpace * i) - this.diameter / 3;
    var boxWidth = this.labelSpace / 2;
    var boxHeight = this.labelSpace / 2;

    fill(colour);
    rect(x, y, boxWidth, boxHeight);

    fill('black');
    noStroke();
    textAlign('left', 'center');
    textSize(12);
    text(label, x + boxWidth + 10, y + boxWidth / 2);

  };

  this.makeInnerCircle = function() {
    push();
    fill(128);
    ellipse(this.x, this.y, (2*this.diameter)/3);
    pop();


  };

 this.checkMouse = function(mouseX, mouseY) {
   var mouseAngle = this.checkMouseAngle(mouseX, mouseY);
   if(mouseAngle) {
     push();
     textSize(32);
     fill(255);
     noStroke();
     compareWithAngle = 0;
     for(i=0; i<this.angles.length+1; i++) {
       if(mouseAngle > compareWithAngle && i<this.angles.length) { //make sure to not get unbounded
         compareWithAngle += this.angles[i];
       } else {
         text(this.labels[i-1], this.x, this.y-16);
         text(this.numberLabels[i-1], this.x, this.y + 16);
         break;
       }




     };

     pop();

   };
 };

  this.checkMouseAngle = function(mouseX, mouseY) {
    if(dist(this.x, this.y, mouseX, mouseY) < this.diameter/2) {
      var mouseVector = createVector(mouseX-this.x, mouseY-this.y);

      if(mouseY > this.y) {
        var refVector = createVector(1, 0);
        var mouseAngle = refVector.angleBetween(mouseVector);
      } else {
        var refVector = createVector(-1, 0);
        var mouseAngle = refVector.angleBetween(mouseVector) + PI;
      }

      return mouseAngle ;
    }
    else {
      return false;
    }
  };

  this.makeLegendData = function(data) {
    var legendData = [];
    for(i=0; i<data.length; i++) {
      legendData.push((round(data[i]*100)/100).toString() + "%");
    }

    return legendData;
  };
};
