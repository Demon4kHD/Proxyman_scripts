function HandlerForEditingObject(target, script){
    this.target = {...target}
    this.comment = ''
    this.operators = [
        'comment', 'changeValue', 'deleteParameter', 'сomplexSearch'
    ]

    this.getTarget = function(){
        return this.target
    }

    this.convertScript = function(script){
        let result = {}
        for (let element in script){
            let newElement = {}
            let newArrayChangesParams = []
            let paramsValue = []

            for (let arrayElement of script[element]){
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

            result[element] = newElement
        }

        return result
    }

    this.transformedScript = this.convertScript(script)
    this.witchScriptUse = Object.getOwnPropertyNames(this.transformedScript)

    this.addComment = function(obj, key){
        this.comment += `${key}: ${obj[key]}\n`
        return this
    }

    this.deleteParamsForJSON = function(obj, key){
        delete obj[key]
        this.addComment(obj, key)
        return this
    }

    this.setNewValueForParams = function(obj, key, value){
        obj[key] = value
        this.addComment(obj, key)
        return this
    }

    this.operatorFactory = function(operator, obj, key, value){
        switch (operator) {
            case 'change':
                return this.setNewValueForParams(obj, key, value)
            case 'delete':
                return this.deleteParamsForJSON(obj, key)
            case 'show':
                return this.addComment(obj, key)
            default:
                throw new Error(`Недопустимый тип: ${operator}`);
        }
    }

    this.useScriptForParamsInJSON = function(){
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
}

module.exports = {
  HandlerForBodyObject
}