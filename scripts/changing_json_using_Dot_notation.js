function changingJSON(arrayChangesParams, body) {
  let newArrayChangesParams = [];
  let paramsValue = [];

  for (let arrayElement of arrayChangesParams) {
      newArrayChangesParams.push(arrayElement.path.split('.').map(element => {
          return isNaN(element) ? element : Number(element);
      }));
      paramsValue.push(arrayElement.value);
  }

  for (let i = 0; i < newArrayChangesParams.length; i++) {
      let currentBody = body;
      for (let j = 0; j < newArrayChangesParams[i].length; j++) {
          const key = newArrayChangesParams[i][j];
          if (j < newArrayChangesParams[i].length - 1) {
              if (!currentBody[key]) {
                  currentBody[key] = {};
              }
              currentBody = currentBody[key];
          } else {
              currentBody[key] = paramsValue[i];
            }
        }
    }

  return body;
}

sharedState.changeJSON = [{path: "items.0.route.type", value: "rating"}, {path: "items.1.route.type", value: null}]
let body = {
  "items": [
    {
      "route": {
        "type": "order", 
        "orderId": 123456
      },
      "link": "ya.ru"
    }, 
    {
      "route": {
        "type": "rating", 
        "orderId": 123456
      },
      "link": "ya.ru"
    }
  ],
  "message": "It`s ok request"
}

// Calling a function and entering replacement parameters 
// Вызов функции и ввод параметров замены
let newBody = changingJSON(sharedState.changeJSON, body)
