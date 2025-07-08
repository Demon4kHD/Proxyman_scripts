const ENV = {
    allArray: '@all',
    operators: [
        'addComment', 'changeValue', 'deleteParameter', 'searchAndComment', 'searchAndChange', 'searchAndDelete'
    ],
    errorColor: 'red',
    nonFatalErrorColor: 'yellow',
    nonFatalErrorMessageArray: ['В объекте', 'отсутствует параметр', '\nПроверьте JSON и сценарий или проигнорируйте'],
    errorMessageArray: ['Ошибка: В объекте', 'отсутсвтует обязательный элемент']
}

function HandlerForEditingObject(target, script){
    this.target = {...target}
    this.script = script
    this.color = 'red'
    this.comment = ''
    this.errorMassages = []
    this.scriptOperatorsArray = Object.getOwnPropertyNames(this.script)

    this.searchParamAndGetValue = function(){
        //
    }

    this.addErrorMessage = function(type, element, textMessages){
        let message = {
            'type': type, // Non-Fatal, Warning
            'element': element,
            'text': textMessages
        }

        this.errorMassages.push(message)
    }


    // Требует доработки
    this.addComment = function(key, value){
        this.comment += this.errorMassage == [] ? `${key}: ${value}\n` : `${this.errorMassage[0]}: ${this.errorMassage[1]} - ${this.errorMassage[2]}`
        this.color = this.errorMassage == [] ? 'green' : value == 'Недопустимый тип оператора!' ? 'red' : 'yellow'
    }

    this.changeValue = function(obj, key, value){
        obj[key] = value

        return obj
    }

    this.deleteParameter = function(obj, key){
        if (Array.isArray(obj)){
            if (key == ENV.allArray){
                let arrayLength = obj.length
                obj.splice(0, arrayLength)
            }
            else {
                obj.splice(key, 1)
            }
        }
        else{
            delete obj[key]
        }

        return obj
    }

    this.arrayHandler = function(operator, target, script){
        //
    }

    this.objectHandler = function(target, paths){
        let currentTarget = target
        let newPaths = [...paths]
        let currentPaths = newPaths

        for (let i = 0; i < currentPaths.length; i++){
            let tempTarget = currentTarget
            const key = currentPaths[i]
            const futureKey = newPaths[i + 1]

            currentPaths = newPaths

            if (i === newPaths.length - 1){
                return tempTarget, key, tempTarget[key]
            }
            else if (!tempTarget[key]){
                this.addErrorMessage('Warning', key, "Параметр не найден в изменяемом объекте. Проверь объект и сценарий!")
                continue
            }
            else if (Array.isArray(tempTarget[key]) && futureKey == ENV.allArray){
                this.arrayHandler(tempTarget)
            }

            newPaths = currentPaths.slice(1)
            tempTarget = tempTarget[key]
        }

        
    }

    this.operatorsMainFactory = function(){
        let currentTarget = this.target
        
        try {
            // Перебираем все операторы сценария
            for (let operator of this.scriptOperatorsArray){
                // Перебираем список объектов с параметрами сценария
                for (let item of script[operator]){
                    let targetPath = item.target.path
                    let targetValue = item.target.value ? item.target.value : null
                    let triggerPath = item.trigger && item.trigger.path ? item.trigger.path : null
                    let triggerValue = item.trigger && item.trigger.value ? item.trigger.value : null

                    let params = ['addComment', 'changeValue', 'deleteParameter', 'searchAndComment', 'searchAndChange', 'searchAndDelete']

                    switch (operator) {
                        case 'addComment':
                            let [a, b, c] = this.objectHandler(currentTarget, targetPath)
                            this.addComment(b, c)
                            break
                        case 'changeValue':
                            // this.changeValue(obj, key, value)
                            break
                        case 'deleteParameter':
                            // this.deleteParameter(obj, key)
                            break
                        case 'searchAndComment':
                            // this.searchAndComment(obj, script)
                            break
                        case 'searchAndChange':
                            break
                        case 'searchAndDelete':
                            break
                        default:
                            this.errorMassage = [`${operator}`, `Недопустимый тип оператора!`]
                            break
                    }
                }
            }
        }

        catch (error) {
            const errorInfo = {
                type: error.constructor.name,
                message: error.message,
                stack: error.stack
            };

            for (let param in errorInfo){
                this.comment += `${param}: ${errorInfo[param]}\n`   
            }

            this.color = ENV.errorColor
        }
    }

    this.operatorsMainFactory()
}

// module.exports = {
//   HandlerForEditingObject
// }

let body = {
    "first": {
        "second": {
            "trigger": "searchValue",
            "third": {
                "ChangingParameter": "value"
            }
        },
        'secondArray': [
            {
                "changeThis": 12
            },
            {
                "changeThis": 15
            }
        ]
    } 
}

let script = {
    // 'searchAndChange': [
    //     {
    //         'target': {
    //             path : ['first', 'second', 'third', 'ChangingParameter'],
    //             value: 'newValue'
    //         },
    //         'trigger': {
    //             path: ['first', 'second', 'trigger'],
    //             value: 'searchValue'
    //         }
    //     }
    // ],
    // 'addComment': [
    //     {
    //         'target': {
    //             path: ['first', 'secondArray', '@all', 'changeThis'],
    //             value: 99
    //         }
    //     }
    // ],
    'addComment':[
        {
            'target': {
                path: ['first', 'second', 'trigger'],
                value: 'searchValue'
            }
        }
    ]
}

let test = new HandlerForEditingObject(body, script)
console.log(test.comment, '\n', test.color)
