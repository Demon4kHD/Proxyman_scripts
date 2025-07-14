const ENV = {
    allArray: '@all',
    operatorsData:{
        operators: [
            'viewParams', 'changeValue', 'addParameter', 'deleteParameter', 'searchAndView',
            'searchAndChange', 'searchAndDelete', 'searchAndCheck'
        ],
        scriptsWithTrigger: [
            'searchAndComment', 'searchAndChange', 'searchAndDelete'
        ],
        scriptsWithValue: [
            'changeValue', 'addParameter', 'searchAndChange', 'searchAndCheck'
        ]
    },
    colors: {
        'addMessageWithoutErrors': 'green',
        'addWarningMessage': 'yellow',
        'addErrorMessage': 'red'
    }
}



function HandlerForEditingObject(data, script){
    this.data = {...data}
    this.script = script
    this.colors = []
    this.messages = []

    this.addMessage = function(params){
        if (params.typeOfMessage === 'addMessageWithoutErrors'){
            this.messages.push(`${params.nameOfCallerFunction}: ${params.message}`)
            this.addColor(ENV.colors[params.typeOfMessage])
        }
        else if (params.typeOfMessage === 'addWarningMessage'){
            this.messages.push(`${params.nameOfCallerFunction}: ${params.message}`)
            this.addColor(ENV.colors[params.typeOfMessage])
        }
        else if (params.typeOfMessage === 'addMessageWithoutErrors'){
            this.messages.push(
                `---Critical Error---
                Ошибка возникла в ${params.nameOfCallerFunction}
                ${params.message}`)
            this.addColor(ENV.colors[params.typeOfMessage])
        }
    }

    this.getMessages = function(){
        return this.messages
    }

    this.addColor = function(color){
        this.colors.push(color)
    }

    this.getColor = function(){
        if (this.colors.includes(ENV.colors.addErrorMessage)){
            return ENV.colors.addErrorMessage
        }
        else if (this.colors.includes(ENV.colors.addWarningMessage)){
            return ENV.colors.addWarningMessage
        }
        else {
            return ENV.colors.addMessageWithoutErrors
        }
    }

    this.getData = function(){
        return this.data
    }

    this.doesOperatorHaveTrigger = function(operator){
        return ENV.operatorsData.scriptsWithTrigger.includes(operator)
    }

    this.doesOperatorHaveValue = function(operator){
        return ENV.operatorsData.scriptsWithValue.includes(operator)
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
            this.addMessage({
                'typeOfMessage': 'addMessageWithoutErrors', 
                'nameOfCallerFunction': 'viewParams',
                'message': `${mixedKeys} - ${mixedValues}`
            })
        }
        else {
            for (let i = 0; i < mixedData.length; i++){
                this.addMessage({
                    'typeOfMessage': 'addMessageWithoutErrors', 
                    'nameOfCallerFunction': 'viewParams',
                    'message': `${mixedKeys[i]} - ${mixedValues[i]}`
                })
            }
        }
    }

    this.changeValue = function(params){
        let [mixedData , mixedKeys, ] = this.performDataAnalysisAndSelectMethod(this.getData(), params.target.path)

        if (!params.target.path.includes(ENV.allArray)){
            data[mixedKeys] = params.target.value
            let [ , newKey, newValue] = this.performDataAnalysisAndSelectMethod(this.getData(), params.target.path)

            this.addMessage({
                'typeOfMessage': 'addMessageWithoutErrors', 
                'nameOfCallerFunction': 'changeValue',
                'message': `${newKey} - ${newValue}`
            })
        }
        else {
            for (let i = 0; i < mixedData.length; i++){
                data[mixedKeys[i]] = params.target.value
                let [ , newKey, newValue] = this.performDataAnalysisAndSelectMethod(this.getData(), params.target.path)

                this.addMessage({
                    'typeOfMessage': 'addMessageWithoutErrors', 
                    'nameOfCallerFunction': 'changeValue',
                    'message': `${newKey[i]} - ${newValue[i]}`
                })
            }
        }
    }

    this.deleteProcess = function(data, key){
        if (Array.isArray(data)){
            data.shift()
            this.addMessage({
                'typeOfMessage': 'addMessageWithoutErrors', 
                'nameOfCallerFunction': 'deleteParameter',
                'message': `${key} - ${this.checkingForMissingDeletedParameter(data, key)}`
            })
        }
        else {
            delete data[key]
            this.addMessage({
                'typeOfMessage': 'addMessageWithoutErrors', 
                'nameOfCallerFunction': 'deleteParameter',
                'message': `${key} - ${this.checkingForMissingDeletedParameter(data, key)}`
            })
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

    this.addParameter = function(params){
        let [mixedData , mixedKeys, ] = this.performDataAnalysisAndSelectMethod(this.getData(), params.target.path, params.target.value)

        if (!params.target.path.includes(ENV.allArray)){
            data[mixedKeys] = params.target.value
            let [ , newKey, newValue] = this.performDataAnalysisAndSelectMethod(this.getData(), params.target.path, params.target.value)

            this.addMessage({
                'typeOfMessage': 'addMessageWithoutErrors', 
                'nameOfCallerFunction': 'addParameter',
                'message': `${newKey} - ${newValue}`
            })
        }
        else {
            for (let i = 0; i < mixedData.length; i++){
                data[mixedKeys[i]] = params.target.value
                let [ , newKey, newValue] = this.performDataAnalysisAndSelectMethod(this.getData(), params.target.path, params.target.value)

                this.addMessage({
                    'typeOfMessage': 'addMessageWithoutErrors', 
                    'nameOfCallerFunction': 'addParameter',
                    'message': `${newKey[i]} - ${newValue[i]}`
                })
            }
        }
    }
    
    this.searchAndView = function(params){
        let [mixedData , mixedKeys, mixedValues] = this.findingAndChoosingRightPath(params)

        if (!params.target.path.includes(ENV.allArray)){
            this.addMessage({
                'typeOfMessage': 'addMessageWithoutErrors', 
                'nameOfCallerFunction': 'searchAndView',
                'message': `${mixedKeys} - ${mixedValues}`
            })
        }
        else {
            for (let i = 0; i < mixedData.length; i++){
                this.addMessage({
                    'typeOfMessage': 'addMessageWithoutErrors', 
                    'nameOfCallerFunction': 'searchAndView',
                    'message': `${mixedKeys[i]} - ${mixedValues[i]}`
                })
            }
        }
    }
    let t = ['searchAndChange', 'searchAndDelete']

    this.searchAndChange = function(params){
        let [mixedData , mixedKeys] = this.findingAndChoosingRightPath(params)

        if (!params.target.path.includes(ENV.allArray)){
            mixedData[mixedKeys] = params.target.value
            let [ , newKey, newValue] = this.performDataAnalysisAndSelectMethod(this.getData(), params.target.path)

            this.addMessage({
                'typeOfMessage': 'addMessageWithoutErrors', 
                'nameOfCallerFunction': 'searchAndChange',
                'message': `${newKey} - ${newValue}`
            })
        }
        else {
            for (let i = 0; i < mixedData.length; i++){
                mixedData[mixedKeys[i]] = params.target.value
                let [ , newKey, newValue] = this.performDataAnalysisAndSelectMethod(this.getData(), params.target.path)

                this.addMessage({
                    'typeOfMessage': 'addMessageWithoutErrors', 
                    'nameOfCallerFunction': 'searchAndChange',
                    'message': `${newKey[i]} - ${newValue[i]}`
                })
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

    this.objectHandler = function(data, paths, toCreateKey){
        let currentData = data
        let value
        
        for (const key of paths) {
            if (!currentData.hasOwnProperty(key)) {
                if (key === toCreateKey){
                    currentData[key] = ''
                    value = currentData[key]

                    return [currentData, key, value]
                }
                else {
                    this.addMessage({
                        'typeOfMessage': 'addWarningMessage', 
                        'nameOfCallerFunction': 'objectHandler',
                        'message':`Параметр ${key} не найден в изменяемом объекте. Проверь объект или сценарий!`
                    })
                }
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

    this.performDataAnalysisAndSelectMethod = function(data, paths, toCreateKey){
        let [mixedData, mixedKeys, mixedValues] = [[], [], []]

        if (!paths.includes(ENV.allArray)){
            [mixedData, mixedKeys, mixedValues] =  this.objectHandler(data, paths, toCreateKey)
        }
        else {
            let variationsOfPathElement = this.preparingPathsWithoutAll(data, paths)

            for (let newPaths of variationsOfPathElement){
                let [newData, newKeys, newValues] = this.objectHandler(data, newPaths, toCreateKey)
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
                if (!ENV.operatorsData.operators.includes(operator)){
                    this.addMessage({'typeOfMessage': 'addMessageWithoutErrors', 'message': `${operator} - Недопустимый тип оператора!`})
                }
                else{
                // Перебираем список объектов с параметрами сценария
                    for (let item of this.script[operator]){
                        this[operator](this.preparingParameters(item, operator))
                    }
                }
            }
            catch (error){
                this.addMessage({'typeOfMessage': 'addErrorMessage', 'message': `${error.constructor.name}: ${error.message}`})
            }
        }
    }

    this.getResult = function(){
        this.operatorsMainFactory()

        return {
            'newData': this.getData(),
            'comment': this.getMessages(),
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
    'newData':{
        "first": {
            "second": {
                // "trigger": "searchValue",
                "third": {
                    "ChangingParameter": "newValue"
                }
            },
            'secondArray': [{}, {}]
        }
    }, 
    "comment": [
        'searchAndChange: ChangingParameter - newValue',
        'deleteParameter: changeThis - true',
        'deleteParameter: changeThis - true',
        'deleteParameter: trigger - true'
    ],
    'color': 'green'
     
}

let test = new HandlerForEditingObject(body, script)
let result = test.getResult()

// console.log(result.newData.first)

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
