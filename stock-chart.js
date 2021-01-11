function StockChart() {

  // Name for the visualisation to appear in the menu bar.
  this.name = 'Stock Chart';

  // Each visualisation must have a unique ID with no special
  // characters.
  this.id = 'stock-chart';

  //Chart types
  var chartTypes = ['bar', 'candle', 'open/close'];

  // Names for each axis.
  this.xAxisLabel = 'year';
  this.yAxisLabelValue = '$';
  this.yAxisLabelVolume = "Volume";

  var marginSize = 35;

  // Layout object to store all common plot layout parameters and
  // methods.
  this.layoutUpper = {
    marginSize: marginSize,
    inChartMargin: 10, // Not px, the margin here is in dollars.

    // Locations of margin positions. Left and bottom have double margin
    // size due to axis and tick labels.
    leftMargin: marginSize * 2,
    rightMargin: width - marginSize,
    topMargin: marginSize,
    bottomMargin: 2*height/3,
    pad: 5,

    plotWidth: function() {
      return this.rightMargin - this.leftMargin;
    },

    plotHeight: function() {
      return this.bottomMargin - this.topMargin;
    },

    // Boolean to enable/disable background grid.
    grid: true,


    // Number of axis tick labels to draw so that they are not drawn on
    // top of one another.
    numXTickLabels: 8,
    numYTickLabels: 8,
    maxBarWidth: 20
  };


  this.layoutLower = {
    marginSize: marginSize,
    inChartMargin: 0.25, //not in px, the margin here is % or highest # of transactions.

    // Locations of margin positions. Left and bottom have double margin
    // size due to axis and tick labels.
    leftMargin: marginSize * 2,
    rightMargin: width - marginSize,
    topMargin: this.layoutUpper.bottomMargin+20,
    bottomMargin: height - marginSize,
    pad: 5,

    plotWidth: function() {
      return this.rightMargin - this.leftMargin;
    },

    plotHeight: function() {
      return this.bottomMargin - this.topMargin;
    },

    // Boolean to enable/disable background grid.
    grid: true,


    // Number of axis tick labels to draw so that they are not drawn on
    // top of one another.
    numXTickLabels: 8,
    numYTickLabels: 4,
    maxBarWidth: 20
  };


  var stockData = {
      changed: false,
      symbol: "",
      name: "",
      date: [],
      volume: [],
      open: [],
      close: [],
      high: [],
      low: []
  };

  // Property to represent whether data has been loaded.
  this.loaded = false;

  // Preload the data. This function is called automatically by the
  // gallery when a visualisation is added.
  this.preload = function() {

    this.indexData = loadTable(
      './data/stock-chart/ticker-symbols.csv', 'csv');

      var dataPath = './data/stock-chart/AAPL.csv'; // Loading in Apple as temporary datafile.
      this.stockDataTable = loadTable(dataPath, 'csv', 'header',
      // Callback function to set the value
      // this.loaded to true.
      function(table) {
        self.loaded = true;
      });

  };

  this.setup = function() {

    // Get initial values to work with.
    stockData.date = this.stockDataTable.getColumn('Date');
    stockData.volume = this.stockDataTable.getColumn('Volume');
    stockData.open = this.stockDataTable.getColumn('Open');
    stockData.close = this.stockDataTable.getColumn('Close/Last');
    stockData.high = this.stockDataTable.getColumn('High');
    stockData.low = this.stockDataTable.getColumn('Low');

    stockData.symbol = this.indexData.getString(0, 0);
    stockData.name = this.indexData.getString(0, 1);

    // Create a select DOM element.
    this.select = createSelect();
    this.startDateSelector = createSelect();
    this.endDateSelector = createSelect();
    this.chartTypeSelector = createSelect();

    // Set select position.
    this.select.position(this.layoutUpper.leftMargin, 10 + Gallery.getTopMargin);
    this.startDateSelector.position(this.layoutUpper.leftMargin+300, 10 + Gallery.getTopMargin);
    this.endDateSelector.position(this.layoutUpper.leftMargin+500, 10 + Gallery.getTopMargin);
    this.chartTypeSelector.position(this.layoutUpper.leftMargin+700, 10 + Gallery.getTopMargin);




    // Fill the options with all ticker symbols.
    this.select.option("Select a stock to begin", -1);
    for(i=0; i<this.indexData.rows.length; i++)
    {
        if(this.indexData.rows[i] != "")
        {
            this.select.option(this.indexData.getString(i, 1), this.indexData.getString(i, 0));
        }

    }


    // Fill all dates
    this.startDateSelector.option("Select a start date too", -1);
    this.endDateSelector.option("Select an end date too", -1);
    for(i=0; i<stockData.date.length; i++) {
      this.startDateSelector.option(stockData.date[i], i);
      this.endDateSelector.option(stockData.date[i], i);
    }


    // Get min and max data for year, volume and $. This is to be updated on the fly when user selects different dates.
    this.minDate = stockData.date[stockData.date.length-1]; //Assume first date is at the bottom.
    this.maxDate = stockData.date[0];

    this.minValue = min(stockData.low);
    this.maxValue = max(stockData.high);

    this.minVolume = min(stockData.volume);
    this.maxVolume = max(stockData.volume);


    //Fill in chart types.
    this.chartTypeSelector.option("Select chart type here");
    for(i=0; i<chartTypes.length; i++) {
      this.chartTypeSelector.option(chartTypes[i]);
    }






  };

  this.destroy = function() {
    if(this.endDateSelector) {
        this.endDateSelector.remove();
    }
    if(this.startDateSelector) {
        this.startDateSelector.remove();
    }
    if(this.select) {
        this.select.remove();
    }


  };

  this.draw = function() {


    //Select which data file to load in.
    this.select.changed(this.loadNewDataSet);

    // Get min and max data for year, volume and $.
    this.minDate = stockData.date[stockData.date.length-1]; //Assume first date is at the bottom.
    this.maxDate = stockData.date[0];

    this.minValue = min(stockData.low);
    this.maxValue = max(stockData.high);

    this.minVolume = min(stockData.volume);
    this.maxVolume = max(stockData.volume);



    // Modify the name of the company in the datastructure.

    if(stockData.changed) {

      for(i = 0; i<this.indexData.rows.length; i++)
      {
        if(this.indexData.getString(i, 0) == stockData.symbol) {
          stockData.name = this.indexData.getString(i, 1);
          break;
        }
      }

      stockData.changed = false;
      //To make sure we don't run this loop more than necessary.
    }




    // Check to see that dates don't overlap.
    var daysApart = this.endDateSelector.value() - this.startDateSelector.value()
    if(daysApart < 0) {
      push();
      textSize(32);
      fill(0);
      text("Start date must be prior to end date!", 2*width/3, height/2);
      pop();
    }



    // Draw all y-axis tick labels.
    drawYAxisTickLabels(this.minValue,
                        this.maxValue,
                        this.layoutUpper,
                        this.mapValueToHeight.bind(this),
                        1);

    drawYAxisTickLabels(this.minVolume,
                        this.maxVolume,
                        this.layoutLower,
                        this.mapVolumeToHeight.bind(this),
                        1);


    // Draw x and y axis.
    drawAxis(this.layoutUpper);
    drawAxis(this.layoutLower);

    // Get values for years
    this.startDay = this.startDateSelector.value();
    this.endDay = this.endDateSelector.value();
    this.endDay++//minimum of one day must be displayed.

    this.updateChart();

    //Setting parameters for printing

    var chartWidth = this.layoutUpper.rightMargin - this.layoutUpper.leftMargin;
    var noOfEntries = (this.endDay - this.startDay) + 1;
    var entryWidth = min(chartWidth/noOfEntries, this.layoutUpper.maxBarWidth); //Getting the width of each.




    for(i=this.startDay; i<=this.endDay; i++) {
      var high = this.mapValueToHeight(stockData.high[i]);
      var low = this.mapValueToHeight(stockData.low[i]);
      var open = this.mapValueToHeight(stockData.open[i]);
      var close = this.mapValueToHeight(stockData.close[i]);
      var volume = this.mapVolumeToHeight(stockData.volume[i]);
      var chartType = this.chartTypeSelector.value();
      var x = this.mapDaysToWidth(i);


      this.stockChartIcons(x, entryWidth, high, low, open, close, volume, chartType, this.layoutUpper, this.layoutLower);
    }

    //stockChartIcons()


  };

  this.updateChart = function() {
    // Adjusting the min and max values after date has been set.
    var tempMinValue = [];
    var tempMaxValue = [];
    var tempVolume = [];

    for(i=this.startDay; i<=this.endDay; i++) {
      tempMaxValue.push(stockData.high[i]);
      tempMinValue.push(stockData.low[i]);
      tempVolume.push(stockData.volume[i]);
    }

    this.minValue = min(tempMinValue)-this.layoutUpper.inChartMargin;
    this.maxValue = max(tempMaxValue)+this.layoutUpper.inChartMargin;
    this.minVolume = min(tempVolume)*(1-this.layoutLower.inChartMargin);
    this.maxVolume = max(tempVolume)*(1+this.layoutLower.inChartMargin);
  };

  this.loadNewDataSet = function() {
    var dataPath = './data/stock-chart/' + this.value() + '.csv';
    var stockDataTable = loadTable(dataPath, 'csv', 'header', function(){

      stockData.date = stockDataTable.getColumn('Date');
      stockData.volume = stockDataTable.getColumn('Volume');
      stockData.open = stockDataTable.getColumn('Open');
      stockData.close = stockDataTable.getColumn('Close/Last');
      stockData.high = stockDataTable.getColumn('High');
      stockData.low = stockDataTable.getColumn('Low');
    });
    stockData.symbol = this.value();
    stockData.changed = true;

  };

  this.stockChartIcons = function(x, defaultWidth, high, low, open, close, volume, chartType, layoutUpper, layoutLower) {

    if(chartType == 'bar') {
      push();
      stroke(0);
      strokeWeight(1);
      fill(128);
      rect(x, layoutUpper.bottomMargin-close, defaultWidth, close);
      pop();
    } else if(chartType == 'candle') {
      push();
      stroke(0);
      strokeWeight(3);
      line(x+defaultWidth/2, high, x+defaultWidth/2, low);
      strokeWeight(1);

      // Set green for rising close, red for otherwise.
      if(open > close) {
        fill(0, 128, 0);
      } else {
        fill(128, 0, 0);
      }


      rect((x), close, defaultWidth, open-close);

      pop();
    } else if(chartType == 'open/close') {
      push();
      stroke(0);
      strokeWeight(3);
      line(x+defaultWidth/2, high, x+defaultWidth/2, low);
      strokeWeight(1);
      line(x, open, x+defaultWidth/2, open);
      line(x+defaultWidth/2, close, x+defaultWidth, close);
      pop();
    }

    // The lower volume chart is always bar-type.
    push();
    stroke(0);
    strokeWeight(1);
    fill(64);
    rect(x, layoutLower.bottomMargin-(height-volume), defaultWidth, height-volume);
    pop();

  };


  this.mapDaysToWidth = function(value) {

    return map(value,
               this.startDay,
               this.endDay,
               this.layoutUpper.leftMargin,   // Draw left-to-right from margin.
               this.layoutUpper.rightMargin);
  };

  this.mapValueToHeight = function(value) {
    return map(value,
               this.minValue,
               this.maxValue,
               this.layoutUpper.bottomMargin, // Lower values at bottom.
               this.layoutUpper.topMargin);   // Higher values at top.
  };

  this.mapVolumeToHeight = function(value) {
    return map(value,
               this.minVolume,
               this.maxVolume,
               this.layoutLower.bottomMargin, // Lower values at bottom.
               this.layoutLower.topMargin);   // Higher values at top.
  };


}
