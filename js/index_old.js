/* code for getting winodw screen size and width  */
function handleScreenSizeChange() {
  var screenWidth =
    window.innerWidth ||
    document.documentElement.clientWidth ||
    document.body.clientWidth;
  // console.log("Screen width: " + screenWidth + "px");
  adjustMatrixLayout(screenWidth);
}

// Function to adjust the matrix layout based on screen width
function adjustMatrixLayout(screenWidth) {
  var numColumns = 3;
  if (screenWidth < 768) {
    numColumns = 1;
  } else if (screenWidth < 1024) {
    numColumns = 2;
  }
  var container = document.querySelector(".grid-container");
  if (container) {
    container.style.gridTemplateColumns = `repeat(${numColumns}, 1fr)`;
  }
}
//event listener for screen resize
window.addEventListener("resize", handleScreenSizeChange);
handleScreenSizeChange();

/* code for reading the text file  
    textfile format is like give below
    (
    m=10,n= 12,
    element=1,r1=2,r2=2,col1=2,col2=5,chart=piechart,url="listed url",refresh=3,
    element=2,r1=3,r2=4,col1=8,col2=11,chart=barchart,url="listed url",refresh=3,
    element=3,r1=7,r2=9,col1=4,col2=8,chart=barchart,url="listed url",refresh=3
    1. first row should be the same user can only change the m value 
    2. Afterthat user can add as many row as he want in the give format
    )
    */
const fileUrl = "userinput/input.txt";
fetch(fileUrl)
  .then((response) => {
    if (!response.ok) {
      throw new Error("Error fetching the file");
    }
    return response.text();
  })
  .then((data) => {
    /* passing the data that we fetch from the text file  */
    passdata(data);
  })
  .catch((error) => {
    console.error("Error reading the file:", error);
  });

// function for creating matrix
function passdata(data) {
  var chartType, textType, urlValue, refreshValue;
  var urlandrefresh = [];
  var arraydata = data.split("\n");
  // console.log(arraydata);
  const mergedCells = [];
  const [mValue, nValue] = arraydata[0].split(",");
  let m, n;

  for (let i = 1; i < arraydata.length; i++) {
    const cellData = arraydata[i].split(",");
    const mergedCell = {};

    for (let j = 0; j < cellData.length; j++) {
      const [key, value] = cellData[j].split("=");
      mergedCell[key] = value;

      if (key === "chart") {
        chartType = value;
      } else if (key === "text") {
        textType = value;
      } else if (key === "url") {
        urlValue = value;
      } else if (key === "refresh") {
        refreshValue = value;
      } else if (key === "model") {
        modelname = value;
        // console.log(modelname);
      }
    }
    // combinig the url and refresh value
    if (urlValue !== undefined && refreshValue !== undefined) {
      urlandrefresh.push({
        url: urlValue,
        refresh: refreshValue,
        chart: chartType,
      });
    }
    // console.log(urlandrefresh);

    const { r1, r2, col1, col2 } = mergedCell;
    mergedCells.push({
      rowStart: parseInt(r1),
      rowEnd: parseInt(r2),
      colStart: parseInt(col1),
      colEnd: parseInt(col2),
      content: `Merge ${i}`,
      chartType: chartType,
      text: textType,
      modelname: modelname,
    });
  }
  // console.log(mergedCells)
  m = parseInt(mValue.split("=")[1]); // no of row
  n = parseInt(nValue.split("=")[1]); // no of col

  const container = document.createElement("div");
  container.classList.add("grid-container");

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      const mergedCell = mergedCells.find(
        (cell) =>
          i + 1 >= cell.rowStart &&
          i + 1 <= cell.rowEnd &&
          j + 1 >= cell.colStart &&
          j + 1 <= cell.colEnd
      );

      const gridItem = document.createElement("div");
      gridItem.classList.add("grid-item");
      // console.log(mergedCell)
      if (mergedCell) {
        gridItem.style.gridColumn = `${mergedCell.colStart} / ${
          mergedCell.colEnd + 1
        }`;
        gridItem.style.gridRow = `${mergedCell.rowStart} / ${
          mergedCell.rowEnd + 1
        }`;
        gridItem.classList.add("merged-cell");

        var chartContainer = document.createElement("div");
        chartContainer.id = `chartContainer${i + 1}`;
        gridItem.appendChild(chartContainer);

        var mergedCellWidth, mergedCellHeight;
        setTimeout(() => {
          mergedCellWidth = gridItem.offsetWidth;
          mergedCellHeight = gridItem.offsetHeight;
        }, 0);

        if (mergedCell.chartType) {
          // console.log(urlandrefresh)
          fetchDataAndUpdateChart(
            urlandrefresh,
            0,
            mergedCell.chartType,
            chartContainer
          );
        } else if (mergedCell.text) {
          var textElement = document.createElement("p");
          textElement.textContent = mergedCell.text;
          gridItem.appendChild(textElement);
        } else if (mergedCell.modelname) {
          const renderer = new THREE.WebGLRenderer({ antialias: true });
          var modelContainer = document.createElement("div");
          modelContainer.id = mergedCell.modelname;
          modelContainer.style.width = "400px";
          modelContainer.style.height = "400px";
          gridItem.appendChild(modelContainer);

          const scene = new THREE.Scene();
          const loader = new THREE.GLTFLoader();

          const camera = new THREE.PerspectiveCamera(
            32,
            modelContainer.style.width / modelContainer.style.height,
            0.9,
            1000
          );
          const controls = new THREE.OrbitControls(camera, renderer.domElement);

          renderer.setSize(
            modelContainer.style.width,
            modelContainer.style.height
          );
          camera.position.set(12, 4, 0);
          camera.position.z = 2;
          camera.updateProjectionMatrix();
          gridItem.appendChild(renderer.domElement);
          model_Name = `model/${mergedCell.modelname}.glb`;
          // Rest of the code remains the same
          loader.load(
            `${model_Name}`,
            function (gltf) {
              const model = gltf.scene;
              console.log(model);
              // model.scale.set(.90, .90, .90);
              scene.add(model);

              // const spotLight = new THREE.SpotLight(0xffffff);
              // spotLight.castShadow = true;
              // spotLight.position.set(10, 50, 80);
              // scene.add(spotLight);

              // const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
              // scene.add(ambientLight);

              // const dirLight = new THREE.DirectionalLight(0xefefff, 1.5);
              // dirLight.position.set(500, 100, 10);
              // scene.add(dirLight);

              function spindle() {
                requestAnimationFrame(spindle);
                renderer.render(scene, camera);
              }

              spindle();
            },
            undefined,
            function (error) {
              console.log("loading scene error");
              console.error(error);
            }
          );
        } else {
          gridItem.style.border = "none";
        }
      }
      container.appendChild(gridItem);
    }
  }
  document.body.appendChild(container);
}
/* function for getting data from every url */
function fetchDataAndUpdateChart(
  urlandrefresh,
  index,
  chartType,
  chartContainer
) {
  if (index >= urlandrefresh.length) {
    return;
  }
  const { url, refresh, chart } = urlandrefresh[index];
  if (url && chart) {
    // console.log(chart)
    fetch(url)
      .then((response) => response.text())
      .then((data) => {
        // console.log(data)
        var x, y;
        switch (chart) {
          case "bar":
            x = data.split(",").map((value) => parseFloat(value));
            // y = Array.from({ length: 3 }, () => Math.floor(Math.random() * 100));
            y = data.split(",").map((value) => parseFloat(value));
            break;
          case "pie":
            y = data.split(",").map((value) => parseFloat(value));
            break;
          case "line":
            x = data.split(",").map((_, index) => index + 1);
            y = data.split(",").map((value) => parseFloat(value));
            break;
          case "scatter":
            x = data.split(",").map((_, index) => index + 1);
            y = data.split(",").map((value) => parseFloat(value));
            break;
          case "bubble":
            x = data.split(",").map((_, index) => index + 1);
            y = data.split(",").map((value) => parseFloat(value));
            break;
          case "box":
            y = data.split(",").map((value) => parseFloat(value));
            break;
          default:
            console.error("Invalid chart type.");
            break;
        }
        updateChart(chartType, chartContainer, x, y);
        // fetchDataAndUpdateChart(urlandrefresh, index + 1, chartType, chartContainer);
      })
      .catch((error) => {
        console.error(`Error fetching data from ${url}:`, error);
      });
    // .finally(() => {
    //   setTimeout(() => {
    //    fetchDataAndUpdateChart(urlandrefresh, index + 1, chartType, chartContainer);
    //   }, refresh * 1000);
    // });
  } else {
    console.error(
      `URL or chart type missing at index ${index}. Skipping the blank url or chart type`
    );
  }
}

/* code for creating chart as well as updating the data in every chart */
function updateChart(chartType, chartContainer, x, y) {
  console.log(y);
  switch (chartType) {
    case "bar":
      var chartData = [
        {
          x: x,
          y: y,
          type: "bar",
        },
      ];
      // console.log(chartType,chartData)
      Plotly.newPlot(chartContainer, chartData, { type: "bar" });
      break;
    case "pie":
      var chartData = [
        {
          values: y,
          labels: x,
          type: "pie",
        },
      ];
      Plotly.newPlot(chartContainer, chartData, { type: "pie" });
      break;
    case "line":
      var chartData = [{ x: x, y: y, type: "line" }];
      Plotly.newPlot(chartContainer, chartData, { type: "line" });
      break;
    case "scatter":
      var chartData = [
        {
          x: x,
          y: y,
          mode: "markers",
          type: "scatter",
        },
      ];
      Plotly.newPlot(chartContainer, chartData, { type: "scatter" });
      break;
    case "bubble":
      var chartData = [
        {
          x: x,
          y: y,
          mode: "markers",
          marker: {
            size: [40, 60, 80, 100],
          },
        },
      ];
      Plotly.newPlot(chartContainer, chartData, { type: "bubble" });
      break;
    case "box":
      var chartData = [
        {
          y: y,
          boxpoints: "all",
          jitter: 0.3,
          pointpos: -1.8,
          type: "box",
        },
      ];
      Plotly.newPlot(chartContainer, chartData, { type: "box" });
      break;
    default:
      console.error("Invalid chart type.");
  }
}

/* function for converting gievn string into an array  */
function convertStringToArray(inputString) {
  const elements = inputString.split(",").map(Number);
  const resultArray = [];
  for (let i = 0; i < elements.length; i += 3) {
    const subArray = [elements[i], elements[i + 1], elements[i + 2]];
    resultArray.push(subArray);
  }
  return resultArray;
}
