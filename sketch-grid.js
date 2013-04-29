

function sketch(p) {
  var g = {
    ready: false,
  };


  console.log("Runningish");
  p.setup = function() {
    g.font = p.createFont("Helvetica", 32);
    p.textFont(g.font);
    console.log("Setup");
    $.getScript("/graphing/configs/permission_category_grid.js",function(data) {
      g.config = eval(data);
      console.log(g.config);
      p.size(g.config.width, g.config.height);
      $.getJSON(config.dataurl, function(newdata) {
        g.data = newdata;
        console.log(g.data);
        drawGraph(g.data, g.config); 
      });
    });
    $("#download").click(function() {
      p.save();
    });
  };

  p.draw = function() {
  };

  function drawGraph() {
    p.background(255);

    var cols = getCols(g.config.x, g.data);
    var numcols = Object.size(cols);
    var rows = getRows(g.config.y, g.data);
    var numrows = Object.size(rows);

    var padding = g.config.padding;
    var gwidth = p.width - padding.left - padding.right;
    var gheight = p.height - padding.top - padding.bottom;
    p.pushMatrix();
    p.translate(padding.left, padding.top);
    drawActualGraph(rows, cols, gwidth, gheight); 
    p.popMatrix();

    drawText(cols, rows, padding, gwidth, gheight);
  }

  function drawActualGraph(rows, cols, width, height) {
    var numcols = Object.size(cols);
    var numrows = Object.size(rows);

    var colwidth = width/numcols;
    var rowheight = height/numrows;

    p.noStroke();

    var rownum = 0;
    for (row in rows) {
      var colnum = 0;
      for (col in cols) {
        var entryx = colwidth*colnum;
        var entryy = rowheight*rownum;
        var entry = g.data[row][col];

        p.pushMatrix();
        p.pushStyle();
        p.translate(entryx, entryy);
        if (cols[col].draw) {
          cols[col].draw(p, g, entry, colwidth, rowheight);
        } else {
          config.x.draw(p, g, entry, colwidth, rowheight);
        }
        p.popStyle();
        p.popMatrix();


        colnum += 1;
      }
      rownum += 1;
    }
    drawGrid(numcols, numrows, width, height);
  }

  function drawGrid(numcols, numrows, width, height) {
    var colwidth = width/numcols;
    var rowheight = height/numrows;
    p.noFill();
    p.stroke(0);
    p.strokeWeight(1);
    for (var y = 0; y<numrows+1; y++) {
      p.line(0, y*rowheight, width, y*rowheight);
    }
    for (var x = 0; x<numcols+1; x++) {
      p.line(x*colwidth, 0, x*colwidth, height);
    }
  }

  function getCols(x, data) {
    var cols = {};
    $.each(x.keys, function(index,val) {
      if (val.display) {
        cols[val.name] = val;
      }
    });
    return cols;
  }
  function getRows(y, data) {
    var rows = {};
    for (key in data) {
      rows[key] = key;
    }
    return rows;
  }

  function drawText(cols, rows, padding, gwidth, gheight) {
    p.fill(0);
    p.textFont(g.font, 32);
    p.textAlign(p.CENTER, p.BASELINE);
    p.text(g.config.title, 0, 10, p.width, padding.top);

    p.textAlign(p.RIGHT, p.TOP);
    var rowheight = (gheight)/Object.size(rows); 
    p.textFont(g.font, rowheight*0.8);
    var rownum = 0;
    console.log(rowheight);
    for (row in rows) {
      p.text(row, 0, padding.top+rownum*rowheight, padding.left-5, rowheight*2);
      rownum += 1;
    }

    p.textAlign(p.CENTER, p.TOP);
    var colwidth = (gwidth)/Object.size(cols); 
    p.textFont(g.font, rowheight*0.8);
    var colnum = 0;
    for (col in cols) {
      p.text(cols[col].display, padding.left + colwidth*colnum, padding.top+gheight, colwidth, rowheight*2);
      colnum += 1;

    }

  }


}

console.log("Starting");
$(function() {
  var canvas = document.getElementById("gridgraph");
  var processingInstance = new Processing(canvas, sketch);
});



Object.size = function(obj) {
    var size = 0, key;
    for (key in obj) {
        if (obj.hasOwnProperty(key)) size++;
    }
    return size;
};
