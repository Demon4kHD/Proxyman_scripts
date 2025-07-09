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
        this.comment += `${message}\n`
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

    this.checkingForMissingDeletedParameter = function(keyBeingChecked, data, paths){
        let currentData = data

        for (const key of paths){
            if (key != keyBeingChecked){
                return !currentData.hasOwnProperty(key)
            }
            else {
                if (!currentData.hasOwnProperty(key)){
                    this.addErrorMessage('Warning', key, 'Параметр не найден в изменяемом объекте. Проверь объект или сценарий!')
                }
                else {
                    currentData = currentData[key]
                }
            }
        }
    }

    this.viewParams = function(params){
        let [data, key, value] = this.objectHandler(this.getData(), params.target.path)

        this.addComment(`${key}: ${value}`)
    }

    this.changeValue = function(params){
        let [data, key, value] = this.objectHandler(this.getData(), params.target.path)

        data[key] = params.target.value
        let [newData, newKey, newValue] = this.objectHandler(this.getData(), paths)

        this.addComment(`${newKey}: ${newValue}`)
    }

    this.deleteParameter = function(params){
        let [data, key, value] = this.objectHandler(this.getData(), params.target.path)

        delete data[key] 

        this.addComment(`${key} удален: 
            ${this.checkingForMissingDeletedParameter(key, data, paths)}`)
        // Надо переделать, Когда будет реализован arrayHandler!!!
    }
    

    this.arrayHandler = function(operator, target, script){
        // Надо добавить для автоматичекого прохода всех элементов массива при ключе == ENV.allArray
    }

    this.objectHandler = function(data, paths){
        let currentData = data
        let value

        for (const key of paths) {
            if (!currentData.hasOwnProperty(key)) {
                this.addErrorMessage('Warning', key, 'Параметр не найден в изменяемом объекте. Проверь объект или сценарий!')
                
                return [currentData, key, 'undefined']
            }
            else {
                if (key == paths[paths.length - 1]){
                    value = currentData[key]

                    return [currentData, key, value]
                }
                else {
                    currentData = currentData[key]
                }
            }
        }
    }

    this.operatorsMainFactory = function(){
        let scriptOperatorsArray = Object.getOwnPropertyNames(this.script)
  
        for (let operator of scriptOperatorsArray){
        // Перебираем все операторы сценария
            try {
                if (!ENV.operators.includes(operator)){
                    // Надо переделать сообщение об ошибках!!!
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
            catch (error) {
                // Надо переделать структуру фатальной ошибки
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
    'viewParams': [
        {
            'target': {
                path: ['first', 'secondArray', 1, 'changeThis'],
                value: 99
            }
        }
    ],
    'deleteParameter':[
        {
            'target': {
                path: ['first', 'second', 'trigger'],
                value: 'newValue'
            }
        }
    ]
}

let trueAnswer = {
    "first": {
        "second": {
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

let test = new HandlerForEditingObject(body, script)
let result = test.getResult().newData

function startCheck() {
    let answer = result
        isEqual = JSON.stringify(answer) === JSON.stringify(trueAnswer);


    if (isEqual) {
        // console.log(`\nIt's your answer:\n\n`, answer, `\n`)
        console.log(`GOOD JOB!\n`)
    }
    else {
        console.log(`It's TRUE_ANSWER:\n\n`, trueAnswer, `\n`)
        console.log(`\nIt's you answer:\n\n`, answer, `\n`)
        console.log(`ARE YOU STUPID ?\n`)
    }
}

startCheck()
console.log(test.getComment())