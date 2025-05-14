let helpers = { 
  comment: '',
  returnArr: [],
  
  addBodyParams: function(testValues = {}, body = {}) {
      const newBody = {}
      
      const mergeObjects = (target, source) => {
          for (let key in source) {
              if (source.hasOwnProperty(key)) {
                  if (typeof source[key] === 'object' && source[key] !== null) {
                      if (!target[key]) {
                          target[key] = {}
                      }
                      mergeObjects(target[key], source[key])
                  } else {
                      target[key] = source[key]
                  }
              }
          }
      };
      
      mergeObjects(newBody, body)
      
      mergeObjects(newBody, testValues)
      
      // Формируем комментарий
      this.comment = 'Заменены параметры: '
      for (let key in testValues) {
          if (testValues.hasOwnProperty(key)) {
              this.comment += `${key}: ${testValues[key]}, `
          }
      }
      
      return [newBody, this.comment]
  }
}
