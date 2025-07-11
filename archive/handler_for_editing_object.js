function HandlerForEditingObject(target, script){
    this.target = {...target}
    this.comment = ''
    this.operators = [
        'comment', 'changeValue', 'deleteParameter', 'сomplexSearch'
    ]

    // Требует изменения под большее кол-во параметров
    //
    // 
    this.convertScript = function(script){
        let result = {}
        for (let operator in script){
            if (!this.operators.includes(operator)){
                throw new Error(`${operator} - Недопустимый тип оператора!`);
            }

            let newElement = {}
            let newArrayChangesParams = []
            let paramsValue = []

            for (let arrayElement of script[operator]){
                newArrayChangesParams.push(arrayElement.path.split('.').map(element => {
                    return isNaN(element) ? element : Number(element)
                }));
                
                if (arrayElement.value !== undefined){
                    paramsValue.push(arrayElement.value)
                }
            }

            newElement['paths'] = newArrayChangesParams

            if (paramsValue.length !== 0){
                newElement['values'] = paramsValue
            }

            result[operator] = newElement
        }

        return result
    }

    this.transformedScript = this.convertScript(script)
    this.witchScriptUse = Object.getOwnPropertyNames(this.transformedScript)

    this.addComment = function(obj, key){
        this.comment += `${key}: ${obj[key]}\n`
    }
}

Object.prototype.deleteParamsForJSON = function(obj, key){
    delete obj[key]
}

Object.prototype.setNewValueForParams = function(obj, key, value){
    obj[key] = value
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
    'сomplexSearch': [{
        target: {
            path : 'first.second.third.ChangingParameter',
            value: 'newValue'
        },
        trigger: {
            path: 'first.second.trigger',
            value: 'searchValue'
        }
    }]
}

let test = new HandlerForEditingObject(body, script)

Object.prototype.searchForObjectWithRequiredValue = function(obj, script){
    //
}

Object.prototype.operatorFactory = function(operator, obj, key, value){
    switch (operator) {
        case 'comment':
            this.addComment(obj, key)
        case 'change':
            this.setNewValueForParams(obj, key, value)
        case 'delete':
            this.deleteParamsForJSON(obj, key)
        case 'сomplexSearch':
            this.сomplexSearchForObjectWithRequiredValue(obj, script)
        default:
            throw new Error(`Недопустимый тип: ${operator}`);
    }
}

Object.prototype.workWithArray = function(){

}

Object.prototype.useHandler = function(){
    let currentTarget = this.target
        
    for (let operation of this.witchScriptUse){
        let paths = this.transformedScript[operation]["paths"]
        let values = this.transformedScript[operation]["values"] ?? null

        for (let i = 0; i < paths.length; i ++){
            let tempTarget = currentTarget
            let path = paths[i]
            let value = values ? values[i] : null

            for (let j = 0; j < path.length; j++){
                const key = path[j]
                
                if (j === path.length - 1){
                    tempTarget = this.operatorFactory(operation, tempTarget, key, value)
                }
                else {
                    if (!tempTarget[key]){
                        tempTarget = this.operatorFactory(operation, tempTarget, key, value)
                    }
                    tempTarget = tempTarget[key]
                }
            }
        }
    }

    return this.target
}

// function Ha(){
//  //
// }

// module.exports = {
//   HandlerForEditingObject
// }