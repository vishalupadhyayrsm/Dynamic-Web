<?php
$folderName = uniqid("new_web", true);
$folderPath = "./$folderName/";
mkdir($folderPath);
chmod($folderPath, 0777);

// Code for creating the HTML file 
$htmlContent = '
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="index.css" />
  <style>
    .grid-container {
      display: grid;
      grid-template-columns: repeat(12, 1fr); /* Fixed columns */
      grid-gap: 10px;
    }
    .cell {
      border: 1px solid black;
      padding: 10px;
    }
    .chart-container {
      width: 100%;
      height: auto; /* You can adjust the height as needed */
    }
  </style>
</head>
<body>
  <div class="grid-container" id="cell-values">';

$cssSourcePath = "css/index.css";
$cssFilename = "index.css";
copy($cssSourcePath, $folderPath . $cssFilename);

// Copy Plotly.js file to the generated folder
$jsSourcePath = "js/plotly.js";
copy($jsSourcePath, $folderPath . "plotly.js");
// File path to your CSV file
$csvFilePath = 'data.csv';
$data = [];
// Read the CSV file line by line
if (($handle = fopen($csvFilePath, 'r')) !== false) {
  while (($line = fgets($handle)) !== false) {
    $pairs = explode(',', $line);
    $row = [];
    foreach ($pairs as $pair) {
      list($key, $value) = explode('=', $pair);
      $key = trim($key);
      $value = trim($value);
      $row[$key] = $value;
    }
    $data[] = $row;
  }
  fclose($handle);
}
array_shift($data);
if (empty(end($data))) {
  array_pop($data);
}

// Initialize JavaScript content
$jsContent = '';

// Iterate through the data to generate HTML content and JavaScript for charts
foreach ($data as $row) {
  $element = $row['element'];
  $r1 = $row['r1'];
  $r2 = $row['r2'];
  $col1 = $row['col1'];
  $col2 = $row['col2'];
  $chart = $row['chart'];
  $charttitle = $row['charttitle'];
  $xAxis = $row['xAxis'];
  $yAxis = $row['yAxis'];
  $url = $row['url'];
  $text = $row['text'];

  // Construct HTML content for the cell
  $htmlContent .= "<div class='cell' style='grid-column: span " . ($col2 - $col1 + 1) . "; grid-row: $r1 / span " . ($r2 - $r1 + 1) . ";'>";
  $htmlContent .= "<h3 style='text-align:center'>Element: $element</h3>";

  if (!empty($chart)) {
    $htmlContent .= "<div class='chart-container' id='chart_$element'></div><br>";

    // JavaScript code for fetching data and updating the chart at regular intervals
    $jsContent .= "
        function fetchDataAndUpdateChart_$element() {
            fetch('$url')
              .then(response => response.text()) 
              .then(data => {
                var xData = data.split(',').map(parseFloat); 
                var yData = data.split(',').map(parseFloat);
                console.log(yData);
                var plotData = [];
                
                switch ('$chart') {
                  case 'scatter':
                    plotData.push({ x: xData, y: yData, type: 'scatter' });
                    break;
                  case 'bar':
                    plotData.push({ x:['giraffes', 'orangutans', 'monkeys'], y: [20, 14, 23], type: 'bar' });
                    break;
                case 'line':
                    plotData.push({ x: xData, y: yData, type: 'line' });
                    break;
                case 'pie':
                    plotData.push({ x: xData, y: yData, type: 'pie' });
                    break;
                default:
                break;    
                }
        
                var layout_$element = {
                  title: '$charttitle',
                  xaxis: {
                    title: '$xAxis',
                  },
                  yaxis: {
                    title: '$yAxis',
                  },
                  showlegend: true,
                };
        
                Plotly.newPlot('chart_$element', plotData, layout_$element, {responsive: true});
              })
              .catch(error => console.error('Error fetching data:', error));
        }

        // Fetch data and update chart initially
        fetchDataAndUpdateChart_$element();

        // Set interval to fetch data and update chart every 5 seconds (adjust as needed)
        setInterval(fetchDataAndUpdateChart_$element, 5000); // Update every 5 seconds
        ";
  }

  $htmlContent .= "</div>";
}

$htmlContent .= '</div>
<script src="https://cdn.plot.ly/plotly-latest.min.js"></script>
<script src="index.js"></script>
<script>
' . $jsContent . '
</script>
</body>
</html>';

// Save HTML file to the generated folder
file_put_contents($folderPath . "index.html", $htmlContent);

// Output success message with the folder path
echo "index HTML, CSS, and JavaScript files generated successfully! Folder created at: $folderPath";
