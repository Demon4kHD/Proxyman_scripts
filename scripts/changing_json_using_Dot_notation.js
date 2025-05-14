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
                  currentBody[key] = {}; // Создаем объект, если его нет
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

// let sharedState = {changeJSON: [{path: "items.0.route.type", value: "rating"}, {path: "items.1.route.type", value: 'null'}]}
// let body = {
//   "items": [
//     {
//       "id": 45802849,
//       "guid": "1292ac2d-563c-450e-9291-47b50ea8da5c",
//       "title": "Заказ создан",
//       "body": "Стоимость заказа: 1984.00 ₽ (в том числе доставка 199.00 ₽)",
//       "unread": false,
//       "route": {
//         "type": "order",
//         "value": {
//           "id": 221938397
//         }
//       },
//       "createdAt": "2025-04-24T12:10:18+03:00"
//     },
//     {
//       "id": 45645756,
//       "guid": "26c20e43-dadb-4087-b177-027acf549cb8",
//       "title": "Заказ 221667292 выполнен",
//       "body": "Если понравилось, можете оценить заказ и оставить чаевые курьеру",
//       "unread": false,
//       "route": {
//         "type": "rating",
//         "value": {
//           "id": 221667292
//         }
//       },
//       "createdAt": "2025-04-18T14:17:13+03:00"
//     },
//     {
//       "id": 45645437,
//       "guid": "2b3761c6-a752-4830-b827-775f8e41d764",
//       "title": "Мы уже близко ;)",
//       "body": "Курьер Игорь завершил предыдущий заказ и направляется к Вам.",
//       "unread": false,
//       "route": {
//         "type": "order",
//         "value": {
//           "id": 221667292
//         }
//       },
//       "createdAt": "2025-04-18T14:08:19+03:00"
//     }
//   ],
//   "pagination": {
//     "perPage": 20,
//     "currentPage": 1,
//     "totalPages": 1
//   }
// } 

// console.log(changingJSON(sharedState.changeJSON, body))