const ENV = {
    allArray: '@all',
    operators: [
        'comment', 'changeValue', 'deleteParameter', 'searchAndComment', 'searchAndChange', 'searchAndDelete'
    ],
    errorColor: 'red',
    nonFatalErrorColor: 'yellow',
    nonFatalErrorMessageArray: ['В объекте', 'отсутствует параметр', '\nПроверьте JSON и сценарий или проигнорируйте'],
    errorMessageArray: ['Ошибка: В объекте', 'отсутсвтует обязательный элемент']
}

function HandlerForEditingObject(target, script){
    this.target = {...target}
    this.script = script
    this.color = ''
    this.comment = ''
    this.scriptOperatorsArray = Object.getOwnPropertyNames(this.script)
    
    // this.areTheseDependentScripts = function(operator){
    //     let dependentScripts = ['searchAndComment', 'searchAndChange']

    //     return dependentScripts.includes(operator)
    // }

    // this.doesThisScriptValue = function(operator){
    //     let opreatorsWithValue = ['changeValue', 'searchAndChange']

    //     return opreatorsWithValue.includes(operator)
    // }

    this.arrayHandler = function(operator, target, script){
        //
    }

    this.objectHandler = function(operator, target, script){
        
    }

    this.isThisRightValue = function(target, path, value){
        let currentTarget = target


    }

    this.operatorsMainFactory = function(){
        let currentTarget = this.target
        
        // Перебираем все операторы сценария
        for (let operator of this.scriptOperatorsArray){
            // Перебираем список объектов с параметрами сценария
            for (let item of script[operator]){
                let targetPath = item.target.path
                let targetValue = item.target.value ? item.target.value : null
                let triggerPath = item.trigger && item.trigger.path ? item.trigger.path : null
                let triggerValue = item.trigger && item.trigger.value ? item.trigger.value : null

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
        }
    }

    this.operatorsMainFactory(this.target, this.script)
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
    'changeValue': [
        {
            'target': {
                path: ['first', 'secondArray', '@all', 'changeThis'],
                value: 99
            }
        }
    ]
}

let test = new HandlerForEditingObject(body, script)
