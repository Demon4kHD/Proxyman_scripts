const ENV = {
    allArray: '@all',
    operators: [
        'viewParams', 'changeValue', 'deleteParameter', 'searchAndView', 'searchAndChange', 'searchAndDelete', 'searchAndCheck'
    ],
    scriptsWithTrigger: [
        'searchAndComment', 'searchAndChange', 'searchAndDelete'
    ],
    scriptsWithValue: [
        'changeValue', 'searchAndChange', 'searchAndCheck'
    ],
    errorColor: 'red',
    nonFatalErrorColor: 'yellow',
    nonFatalErrorMessageArray: ['В объекте', 'отсутствует параметр', '\nПроверьте JSON и сценарий или проигнорируйте'],
    errorMessageArray: ['Ошибка: В объекте', 'отсутсвтует обязательный элемент']
}

function HandlerForEditingObject(data, script){
    this.data = {...data}
    this.script = script
    this.color = ''
    this.comment = ''
    this.errorMassages = []

    this.addErrorMessage = function(type, element, textMessages){
        this.errorMessages.push({
            type: type,
            element: element,
            text: textMessages
        })
    }

    this.getErrorMessages = function(){
        return this.errorMassages
    }

    this.setColor = function(color){
        this.color = color
    }

    this.getColor = function(){
        return this.color
    }

    this.addComment = function(message){
        // Надо переделать!!!
        this.comment += `${message}`
    }

    this.createCommentText = function(...params){
        // Надо переделать!!!
        this.addComment(params)
    }

    this.getComment = function(){
        return this.comment
    }

    this.getData = function(){
        return this.data
    }

    this.doesOperatorHaveTrigger = function(operator){
        return ENV.scriptsWithTrigger.includes(operator)
    }

    this.doesOperatorHaveValue = function(operator){
        return ENV.scriptsWithValue.includes(operator)
    }

    this.preparingParameters = function(item, operator){
        let result = {}

        // Базовая конфигурация
        result.target = {
            path: item.target.path
        }

        // Добавляем value, если необходимо
        if (this.doesOperatorHaveValue(operator)) {
            if (!item || !item.target || !item.target.value) {
                throw new Error("Отсутствует target.value в параметрах")
            }

            result.target.value = item.target.value
        }

        // Добавляем trigger, если необходимо
        if (this.doesOperatorHaveTrigger(operator)) {
            if (!item.trigger) {
                throw new Error("Отсутствует trigger в параметрах или его дочерние параметры")
            }
            result.trigger = {
                path: item.trigger.path,
                value: item.trigger.value
            }
        }

        return result
    }


    this.viewParams = function(params){
        let paths = params.target.path
        let [key, data] = this.objectHandler(this.getData(), paths)

        this.addComment(`${key}: ${data[key]}`)
    }

    this.changeValue = function(params){
        // Надо переделать!!!
        let paths = params.target.path
        let [key, data] = this.objectHandler(this.getData(), paths)

        data[key] = params.target.value
        let [newKey, newData] = this.objectHandler(this.getData(), paths)

        this.addComment(`${newKey}: ${newData[key]}`)
    }

    this.deleteParameter = function(params){
        // Надо переделать!!!
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
        // Надо добавить для автоматичекого прохода всех элементов массива при ключе == ENV.allArray
    }

    this.objectHandler = function(data, paths){
        let currentData = data
        let currentKey
        let currentValue

        for (const key of paths) {
            if (!currentData.hasOwnProperty(key)) {
                this.addErrorMessage('Warning', key, 'Параметр не найден в изменяемом объекте. Проверь объект или сценарий!')
                return [null, null]
            }

            if (typeof currentData[key] !== 'object') {
                currentKey = key
                
            }
            else {
                currentData = currentData[key]
            }

        }

        return [currentKey, currentData]
    }

    this.operatorsMainFactory = function(){
        let scriptOperatorsArray = Object.getOwnPropertyNames(this.script)
        
        try {
            // Перебираем все операторы сценария
            for (let operator of scriptOperatorsArray){
                if (!ENV.operators.includes(operator)){
                    // Надо переделать!!!
                    this.errorMassage = [`${operator}`, `Недопустимый тип оператора!`]
                }
                else {
                // Перебираем список объектов с параметрами сценария
                    for (let item of this.script[operator]){
                        let params = this.preparingParameters(item, operator)

                        this[operator](params)
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

    this.getResult = function(){
        return {
            'newData': this.getData(),
            'comment': this.getComment(),
            'color': this.getColor()
        }
    }

    this.operatorsMainFactory()
}

module.exports = {
  HandlerForEditingObject
}

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
    // 'viewParams': [
    //     {
    //         'target': {
    //             path: ['first', 'secondArray', '@all', 'changeThis'],
    //             value: 99
    //         }
    //     }
    // ],
    'changeValue':[
        {
            'target': {
                path: ['first', 'second', 'trigger'],
                value: 'newValue'
            }
        }
    ]
}

let test = new HandlerForEditingObject(body, script)
console.log(test.getResult())
