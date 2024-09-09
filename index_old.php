<?php
$folderName = uniqid("generated_folder_", true);

$folderPath = "./$folderName/";
mkdir($folderPath);

chmod($folderPath, 0777);

$htmlFilename = uniqid("generated_", true) . ".html";
$cssFilename = "index.css";
$jsFilename = uniqid("generated_", true) . ".js";

$htmlContent = '
<!DOCTYPE html>
<html>
<head>
  <link rel="stylesheet" href="index.css" />
</head>
<body>
  <script src="plotly.js"></script>
  <script src="index.js"></script>
</body>

</html>
';

// Source path of the CSS file to be copied
$cssSourcePath = "css/index.css";
copy($cssSourcePath, $folderPath . $cssFilename);

/* code for adding plotly.js file in this code  */
$jsSourcePath = "js/plotly.js";
copy($jsSourcePath, $folderPath . "plotly.js");

/* code for adding userinput.text file in the new folder */
$userinput = "userinput/input.txt";
copy($userinput, $folderPath . "input.txt");


$jsSourcePath = "js/index.js";
$jsContentFromFile = file_get_contents($jsSourcePath);


$pattern = '/function\s+updateChart\s*\((.*?)\)\s*\{([^}]+)\}/s';
if (preg_match($pattern, $jsContentFromFile, $matches)) {
  $passdataFunctionCode = "function updateChart(" . $matches[1] . ") {" . $matches[2] . "}";

  file_put_contents($folderPath . "index.js", $passdataFunctionCode);

  echo "Function 'passdata()' code extracted and saved successfully to index.js in the generated folder: $folderPath";
} else {
  // If passdata() function is not found, display an error message
  echo "Error: passdata() function not found in the JavaScript file.";
}


// Manipulate the content as needed (for example, here we're appending some additional JavaScript code)
// $jsContent = $jsContentFromFile . "
// // Additional JavaScript code
// console.log('This code was added dynamically!');
// ";

// Save the fixed HTML and JavaScript files to the folder
file_put_contents($folderPath . "fixed.html", $htmlContent);
// file_put_contents($folderPath . "index.js", $jsContent);

// Output success message with the folder path
echo "Fixed HTML, CSS, and JavaScript files generated successfully! Folder created at: $folderPath";
