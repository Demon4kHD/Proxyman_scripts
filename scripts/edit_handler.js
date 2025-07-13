const ENV = {
    allArray: '@all',
    operators: [
        'viewParams', 'changeValue', 'deleteParameter', 'searchAndView',
        'searchAndChange', 'searchAndDelete', 'searchAndCheck'
    ],
    scriptsWithTrigger: [
        'searchAndComment', 'searchAndChange', 'searchAndDelete'
    ],
    scriptsWithValue: [
        'changeValue', 'searchAndChange', 'searchAndCheck'
    ],
    errorColor: 'red',
    nonFatalErrorColor: 'yellow',
    nonFatalErrorMessageArray: [
        'В объекте', 'отсутствует параметр', '\nПроверьте JSON и сценарий или проигнорируйте'
    ],
    errorMessageArray: ['Ошибка: В объекте', 'отсутсвтует обязательный элемент']
}

function HandlerForEditingObject(data, script){
    this.data = {...data}
    this.script = script
    this.color = ''
    this.comment = []
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
        this.comment.push[`${message}\n`]
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
        if (this.doesOperatorHaveValue(operator)){
            if (!item || !item.target || !item.target.value){
                throw new Error("Отсутствует target.value в параметрах")
            }

            result.target.value = item.target.value
        }

        // Добавляем trigger, если необходимо
        if (this.doesOperatorHaveTrigger(operator)){
            if (!item.trigger){
                throw new Error("Отсутствует trigger в параметрах или его дочерние параметры")
            }

            result.trigger = {
                path: item.trigger.path,
                value: item.trigger.value
            }
        }

        return result
    }

    this.checkingForMissingDeletedParameter = function(data, keyBeingChecked){
        
        return !data.hasOwnProperty(keyBeingChecked)
    }

    this.findingAndChoosingRightPath = function(params){
        let [mixedTriggerData , ,mixedTriggerValues] = this.performDataAnalysisAndSelectMethod(
            this.getData(), params.trigger.path
        )
        let [mixedTargetData , mixedTargetKeys, mixedTargetValues] = this.performDataAnalysisAndSelectMethod(
            this.getData(), params.target.path
        )
        let [rigthTargetData, rigthTargetKeys, rigthTargetValues] = [[], [], []]

        if (!Array.isArray(mixedTriggerData)){
            return (params.trigger.value == mixedTriggerValues ? [mixedTargetData , mixedTargetKeys, mixedTargetValues] : 
                [])
        }
        else {
            for (let i = 0; i < mixedTriggerData.length; i++){
                if (params.trigger.value == mixedTriggerValues[i]){
                    rigthTargetData.push(mixedTargetDat[i])
                    rigthTargetKeys.push(mixedTargetKeys[i])
                    rigthTargetValues.push(mixedTargetValues[i])
                }
            }
        }

        return [rigthTargetData, rigthTargetKeys, rigthTargetValues]
    }

    this.viewParams = function(params){
        let [mixedData , mixedKeys, mixedValues] = this.performDataAnalysisAndSelectMethod(this.getData(), params.target.path)

        if (!params.target.path.includes(ENV.allArray)){
            this.addComment(`${mixedKeys}: ${mixedValues}`)
        }
        else {
            for (let i = 0; i < mixedData.length; i++){
                this.addComment(`${mixedKeys[i]}: ${mixedValues[i]}`)
            }
        }
    }

    this.changeValue = function(params){
        let [mixedData , mixedKeys, ] = this.performDataAnalysisAndSelectMethod(this.getData(), params.target.path)

        if (!params.target.path.includes(ENV.allArray)){
            data[mixedKeys] = params.target.value
            let [ , newKey, newValue] = this.performDataAnalysisAndSelectMethod(this.getData(), params.target.path)

            this.addComment(`${newKey}: ${newValue}`)
        }
        else {
            for (let i = 0; i < mixedData.length; i++){
                data[mixedKeys[i]] = params.target.value
                let [ , newKey, newValue] = this.performDataAnalysisAndSelectMethod(this.getData(), params.target.path)

                this.addComment(`${newKey[i]}: ${newValue[i]}`)
            }
        }
    }

    this.deleteProcess = function(data, key){
        if (Array.isArray(data)){
            data.shift()
            this.addComment(`${key} удален: ${this.checkingForMissingDeletedParameter(data, key)}`)
        }
        else {
            delete data[key]
            this.addComment(`${key} удален: ${this.checkingForMissingDeletedParameter(data, key)}`)
        }
    }

    this.deleteParameter = function(params){
        let [mixedData , mixedKeys] = this.performDataAnalysisAndSelectMethod(this.getData(), params.target.path)

        if (!params.target.path.includes(ENV.allArray)){
            this.deleteProcess(mixedData, mixedKeys)
        }
        else {
            for (let i = 0; i < mixedData.length; i++){
                this.deleteProcess(mixedData[i], mixedKeys[i])
            }
        }
    }
    
    this.searchAndView = function(params){
        let [mixedData , mixedKeys, mixedValues] = this.findingAndChoosingRightPath(params)

        if (!params.target.path.includes(ENV.allArray)){
            this.addComment(`${mixedKeys}: ${mixedValues}`)
        }
        else {
            for (let i = 0; i < mixedData.length; i++){
                this.addComment(`${mixedKeys[i]}: ${mixedValues[i]}`)
            }
        }
    }
    let t = ['searchAndChange', 'searchAndDelete']

    this.searchAndChange = function(params){
        let [mixedData , mixedKeys] = this.findingAndChoosingRightPath(params)

        if (!params.target.path.includes(ENV.allArray)){
            data[mixedKeys] = params.target.value
            let [ , newKey, newValue] = this.performDataAnalysisAndSelectMethod(this.getData(), params.target.path)

            this.addComment(`${newKey}: ${newValue}`)
        }
        else {
            for (let i = 0; i < mixedData.length; i++){
                data[mixedKeys[i]] = params.target.value
                let [ , newKey, newValue] = this.performDataAnalysisAndSelectMethod(this.getData(), params.target.path)

                this.addComment(`${newKey[i]}: ${newValue[i]}`)
            }
        }
    }

    this.searchAndDelete = function(params){
        let [mixedData , mixedKeys] = this.findingAndChoosingRightPath(params)

        if (!params.target.path.includes(ENV.allArray)){
            this.deleteProcess(mixedData, mixedKeys)
        }
        else {
            for (let i = 0; i < mixedData.length; i++){
                this.deleteProcess(mixedData[i], mixedKeys[i])
            }
        }
    }

    this.objectHandler = function(data, paths){
        let currentData = data
        let value
        
        for (const key of paths) {
            if (!currentData.hasOwnProperty(key)) {
                this.addErrorMessage(
                    'Warning', key, 
                    'Параметр не найден в изменяемом объекте. Проверь объект или сценарий!'
                )
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

    this.preparingPathsWithoutAll = function(data, paths){
        let [currentData, currentPath] = [{...data}, [...paths]]
        let variationsOfPathElement = []
        let lastElementLength

        for (let key of currentPath){
            if (key != ENV.allArray){
                currentData = currentData[key]
                variationsOfPathElement.push([key])
            }
            else {
                lastElementLength = currentData.length - 1
                currentData = currentData[0]
                variationsOfPathElement.push(Array.from({
                    length: lastElementLength - 0 + 1
                }, (_, i) => 0 + i))
            }
        }
        
        let result = variationsOfPathElement.reduce((acc, array) => {
            return array.flatMap(value => 
                acc.map(combination => combination.concat(value))
            );
        }, [[]])

        return result
    }

    this.performDataAnalysisAndSelectMethod = function(data, paths){
        let [mixedData, mixedKeys, mixedValues] = [[], [], []]

        if (!paths.includes(ENV.allArray)){
            [mixedData, mixedKeys, mixedValues] =  this.objectHandler(data, paths)
        }
        else {
            let variationsOfPathElement = this.preparingPathsWithoutAll(data, paths)

            for (let newPaths of variationsOfPathElement){
                let [newData, newKeys, newValues] = this.objectHandler(data, newPaths)
                mixedData.push(newData)
                mixedKeys.push(newKeys)
                mixedValues.push(newValues)
            }
        }
        return [mixedData, mixedKeys, mixedValues]
    }

    this.operatorsMainFactory = function(){
        let scriptOperatorsArray = Object.getOwnPropertyNames(this.script)
  
        for (let operator of scriptOperatorsArray){
        // Перебираем все операторы сценария
            try{
                if (!ENV.operators.includes(operator)){
                    // Надо переделать сообщение об ошибках!!!
                    this.errorMassage = [`${operator}`, `Недопустимый тип оператора!`]
                }
                else{
                // Перебираем список объектов с параметрами сценария
                    for (let item of this.script[operator]){
                        this[operator](this.preparingParameters(item, operator))
                    }
                }
            }
            catch (error){
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
        this.operatorsMainFactory()

        return {
            'newData': this.getData(),
            'comment': this.getComment(),
            'color': this.getColor()
        }
    }
}

module.exports = {
  HandlerForEditingObject
}


// -------------------------------



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
    'searchAndChange': [
        {
            'target': {
                path : ['first', 'second', 'third', 'ChangingParameter'],
                value: 'newValue'
            },
            'trigger': {
                path: ['first', 'second', 'trigger'],
                value: 'searchValue'
            }
        }
    ],
    'deleteParameter': [
        {
            'target': {
                path: ['first', 'secondArray', '@all', 'changeThis'],
                // value: 99
            }
        },
        {
            'target': {
                path: ['first', 'second', 'trigger'],
                // value: 'newValue'
            }
        }
    ]
}

let trueAnswer = {
    'data':{
        "first": {
            "second": {
                // "trigger": "searchValue",
                "third": {
                    "ChangingParameter": "value"
                }
            },
            'secondArray': [{}, {}]
        }
    }, 
    "comment": {
        'ChangingParameter: value'
        'changeThis удален: true'
        'changeThis удален: true'
        'trigger удален: true'
    },
    'color': 'green'
     
}

let test = new HandlerForEditingObject(body, script)
let result = test.getResult()

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

console.log('--- This is comment---', '\n', test.getResult().comment)