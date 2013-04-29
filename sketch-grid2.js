

function sketch(p) {
  var g = {
    ready: false,
  };


  console.log("Runningish");
  p.setup = function() {
    g.font = p.createFont("Helvetica", 32);
    p.textFont(g.font);
    console.log("Setup");
    $.getScript("/graphing/configs/permission_TOPANDTOTAL_category_grid.js",function(data) {
      g.config = eval(data);
      console.log(g.config);
      p.size(g.config.width*g.config.density, g.config.height*g.config.density);
      $(p.externals.canvas).width(g.config.width);
      $(p.externals.canvas).height(g.config.height);

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
    p.scale(2,2);
    p.width = g.config.width;
    p.height = g.config.height;

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
        var entry = g.data[rows[row].name][cols[col].name];
        //console.log("Col: "+col+" entry: "+entry);
        //console.log(entry);

        if (entry) {
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
        }


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
    p.stroke(100);
    p.strokeWeight(1);
    for (var y = 0; y<numrows+1; y++) {
      p.line(0, y*rowheight, width, y*rowheight);
    }
    for (var x = 0; x<numcols+1; x++) {
      p.line(x*colwidth, 0, x*colwidth, height);
    }
  }

  function getCols(x, data) {
    var cols = [];
    $.each(x.keys, function(index,val) {
      console.log("entry: "+val.display);
      if (val.display) {
        cols.push(val);//{key:val.name, display:val});//[val.name] = val;
      }
    });
    return cols;
  }
  function getRows(y, data) {
    var rows = [];
    if (g.config.y.keys_from_data) {
      for (key in data) {
        rows.push({name:key, display:key});//[key] = key;
      }
    } else {
      $.each(y.keys, function(index,val) {
        console.log("entry: "+val.display);
        if (val.display) {
          rows.push(val);//{key:val.name, display:val});//[val.name] = val;
        }
      });
    }
    return rows;
  }

  function drawText(cols, rows, padding, gwidth, gheight) {
    p.fill(0);
    p.textFont(g.font, 32);
    p.textAlign(p.CENTER, p.BASELINE);
    p.text(g.config.title, 0, 10, p.width, padding.top);

    p.textAlign(p.RIGHT, p.TOP);
    var centered = false;
    var fontsize = 0;
    var rowheight = (gheight)/Object.size(rows); 
    if (g.config.y.display) {
      fontsize = g.config.y.display.size;
      centered = g.config.y.display.centered;
    } else {
      fontsize = rowheight*0.8;
    }
    p.textFont(g.font, fontsize);
    var rownum = 0;
    //console.log(rowheight);
    for (row in rows) {
      if (centered) {
        p.text(rows[row].display, 0, padding.top+rownum*rowheight+rowheight/2-fontsize/2, padding.left-5, rowheight);
      } else {
        p.text(rows[row].display, 0, padding.top+rownum*rowheight, padding.left-5, rowheight*2);
      }
      rownum += 1;
    }

    p.textAlign(p.CENTER, p.TOP);
    var colwidth = (gwidth)/Object.size(cols); 
    var rotated = false;
    if (g.config.x.display) {
      fontsize = g.config.x.display.size;
      centered = g.config.x.display.centered;
      rotated = g.config.x.display.rotated;
    } else {
      fontsize = rowheight*0.8;
    }
    p.textFont(g.font, fontsize);
    var colnum = 0;
    if (rotated) {
      p.textAlign(p.LEFT, p.TOP);
      for (col in cols) {
        p.pushMatrix();
        p.translate(padding.left+colwidth*colnum, padding.top+gheight);
        p.rotate(p.HALF_PI);
        p.text(cols[col].display, 5, -colwidth+colwidth/2-fontsize/2, padding.bottom-5, rowheight*2);
        colnum += 1;
        p.popMatrix();
      }
    } else {
      for (col in cols) {
        p.pushMatrix();
        p.translate(padding.left+colwidth*colnum, padding.top+gheight);
        p.text(cols[col].display, 0, 0, colwidth, rowheight*2);
        colnum += 1;
        p.popMatrix();
      }
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
