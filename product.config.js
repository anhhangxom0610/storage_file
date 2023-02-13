module.exports = {
    name: "my-dtg-product",
    sides: {
      front: {
        layers: {
          shadow: "img/creo3001-shadow.png",
          highlight: "img/creo3001-shadow2.png",
          mask: "img/creo3001-mask.png"
        },
        boundingBox: {
          position: {
            x: 35,
            y: 20
          },
          sizeScalePercentage: 30
        }
      },
      back: {
        layers: {
          shadow: "img/creo3001-shadow-back.png",
          mask: "img/creo3001-mask-back.png"
        },
        boundingBox: {
          position: {
            x: 35,
            y: 20
          },
          sizeScalePercentage: 30
        }
      }
    },
    printSize: {
      width: 12,
      height: 16,
      units: "inches",
      resolution: 100
    },
    colors: [
      "#ffffff",
      "#1c332d",
      "#36a461",
      "#b43531",
      "#db2573",
      "#e8c3cc",
      "#443235",
      "#5c3344",
      "#412f56",
      "#242c45",
      "#242c45",
      "#21528d",
      "#19669c",
      "#baccd8",
      "#000000",
      "#baccd8",
      "#2b2b2b",
      "#6a6a6a",
      "#bebebe"
    ]
  };
  
