/**
 * Основной обработчик валидации JSON-схемы.
 * Создаёт инкапсулированный контекст для сбора отчётов о валидации,
 * предоставляет методы для проверки данных и формирования итогового отчёта.
 *
 * @param {Object} jsonData — валидируемые данные (JSON-объект)
 * @param {Object} validationScheme — схема валидации (в формате JSON Schema)
 * @param {Object} params — дополнительные параметры проверки
 * @returns {Object} API с методами для работы валидатора
 */
function validateSchemaHandler(jsonData, validationScheme, params={}) {
  const data = jsonData
  const schema = validationScheme
  const additionalParams = params

  const isStrictMode = additionalParams.isStrictMode ?? false

  // Внутренний объект для хранения результатов валидации
  let __reportGeneration = {
    trackedFieldCategories: new Set(),        // Категории найденных полей (например, foundFieldValuePairs)
    trackedFieldsWithProblems: new Set(),     // Поля с проблемами (ошибки типов, отсутствующие поля и т.п.)
    errorsData: [],                           // Массив критических ошибок
    problematicData: {},                      // Детализированные данные по типам проблем
    unexpectedFields: [],                     // Некритичные данные (например, неожиданные поля)
    foundFieldValuePairs: [],                 // Найденные пары "поле-значение"
    foundField: []                            // Найденные поля (без привязки к значению)
  }


  /**
   * Возвращает текущий отчёт о валидации.
   * @returns {Object} объект отчёта
   */
  function getReportGeneration() {
    return __reportGeneration
  }


  /**
   * Заменяет текущий отчёт на новый.
   * @param {Object} newReport — новый объект отчёта
   */
  function setReportGeneration(newReport) {
    __reportGeneration = newReport
  }


  /**
   * Добавляет данные в отчёт по указанному типу.
   * Обрабатывает разные категории (ошибки, проблемы, найденные поля и т.д.).
   * @param {String} type — тип данных (например, 'requireFieldsNotInData', 'ERROR')
   * @param {*} params — данные, которые нужно добавить
   */
  function addDataToReportGeneration(type, params) {
    let newReport = getReportGeneration()

    if (type === 'requireFieldsNotInData') {
      newReport.problematicData[type] = params

    }

    if (type === 'notCorrectTypeFields') {
      const [key, targetType, correctType] = params

      if (!newReport.problematicData[type]) {
        newReport.problematicData[type] = {}
      }

      if (!newReport.problematicData[type][correctType]) {
        newReport.problematicData[type][correctType] = {}
      }

      if (!Array.isArray(newReport.problematicData[type][correctType][targetType])) {
        newReport.problematicData[type][correctType][targetType] = []
      }

      newReport.problematicData[type][correctType][targetType].push(key)
    }

    if (type === 'notCorrectExpectedValues') {
      const [key, targetValue, correctValues] = params
 
      if (!Array.isArray(correctValues)) {
        console.warn('correctValues не является массивом:', correctValues)
        return
      }

      const valuesKey = correctValues.join(', ')

      let section = newReport.problematicData[type]
      if (!section) {
        section = {}
        newReport.problematicData[type] = section
      }

      let valueGroup = section[valuesKey]
      if (!valueGroup) {
        valueGroup = {}
        section[valuesKey] = valueGroup
      }

      if (!valueGroup[targetValue]) {
        valueGroup[targetValue] = [key]
      } else {
        valueGroup[targetValue].push(key)
      }
    }

    if (type === 'unexpectedFields') {
      newReport.unexpectedFields = params
    }

    if (type === 'ERROR') {
      newReport.errorsData.push(params)
    }

    // Категории, которые не попадают в trackedFieldsWithProblems
    const includesType = ['foundFieldValuePairs', 'foundField', 'ERROR', 'unexpectedFields']

    if (!includesType.includes(type)) {
      newReport.trackedFieldsWithProblems.add(type)
    }
    else {
      if (type !== 'ERROR' && type !== 'unexpectedFields') {
      newReport[type].push(params)
      newReport.trackedFieldCategories.add(type)
      }
    }

    setReportGeneration(newReport)
  }


  /**
   * Проверяет, является ли значение объектом (не массивом, не null).
   * @param {*} targetValue — проверяемое значение
   * @param {String} correctType — ожидаемый тип (по умолчанию 'object')
   * @returns {Boolean} true, если это объект
   */
  function isObject(targetValue, correctType = 'object') {
    return typeof targetValue === 'object' && targetValue !== null && !(targetValue instanceof Array) && correctType === 'object'
  }


  /**
   * Определяет тип значения (array, object, string и т.д.).
   * @param {*} targetValue — значение для проверки
   * @returns {String} тип значения
   */
  function getTypeOfTargetValue(targetValue) {
    let result = ''

    if (Array.isArray(targetValue)) {
      result = 'array'
    } else if (isObject(targetValue)) {
      result = 'object'
    } else {
      result = typeof targetValue
    }

    return result
  }


  /**
   * Проверяет соответствие типа значения ожидаемому.
   * @param {*} targetValue — проверяемое значение
   * @param {String} correctType — ожидаемый тип
   * @returns {Boolean} true, если тип совпадает
   */
  function isCorrectTypeFields(targetValue, correctType) {
    let result = false

    if (correctType === 'array') {
      result = Array.isArray(targetValue) 
    } else if (correctType === 'object') {
      result = isObject(targetValue, correctType)
    } else {
      result = typeof targetValue !== correctType
    }

    return result
  }


  /**
   * Проверяет, входит ли значение в список допустимых.
   * @param {*} targetValue — проверяемое значение
   * @param {Array} correctValues — список допустимых значений
   * @returns {Boolean} false, если значение допустимо
   */
  function isExpectedValues(targetValue, correctValues) {
    return correctValues.includes(targetValue)
  }


  /**
   * Проверяет наличие обязательных полей в данных.
   * @param {Array} dataFields — поля из данных (Object.keys(data))
   * @param {Array} schemaRequireFields — обязательные поля из схемы
   */
  function checkRequireFields(dataFields, schemaRequireFields) {
    let requireFieldsNotInData = []

    for (let field of schemaRequireFields) {
      if (!dataFields.includes(field)) {
        requireFieldsNotInData.push(field)
      }
    }

    if (requireFieldsNotInData.length > 0) {
      addDataToReportGeneration('requireFieldsNotInData', requireFieldsNotInData)
    }
  }


  /**
   * Проверяет тип и допустимость значения по схеме.
   * @param {String} key — имя поля
   * @param {*} targetValue — значение поля
   * @param {Object} correctValues — правила из схемы (type, enum и т.д.)
   */
  function checkValueAndTypeCorrect(key, targetValue, correctValues) {
    const targetValueType = getTypeOfTargetValue(targetValue)
    if (targetValueType !== correctValues.type && targetValue) {
      addDataToReportGeneration('notCorrectTypeFields', [key, targetValueType, correctValues.type])
    }

    if (correctValues.enum && !isExpectedValues(targetValue, correctValues.enum)) {
      addDataToReportGeneration('notCorrectExpectedValues', [key, targetValue, correctValues.enum])
    }
  }


  /**
   * Проверяет наличие полей, не описанных в схеме.
   * @param {Array} dataFields — поля из данных
   * @param {Array} schemaFields — поля из схемы
   */
  function checkUnexpectedFields(dataFields, schemaFields) {
    let unexpectedFields = []

    for (let field of dataFields) {
      if (!schemaFields.includes(field)) {
        unexpectedFields.push(field)
      }
    }

    addDataToReportGeneration('unexpectedFields', unexpectedFields)
  }


  /**
   * Проверяет корректность схемы (наличие properties).
   * @param {Object} schema — схема валидации
   */ 
  function checkSchema(schema) {
    if (schema || !schema.properties) {
      // addDataToReportGeneration('ERROR', 'Ошибка: схема не определена или некорректна!')
    }
  }


  /**
   * Рекурсивно ищет значение по ключу в объекте/массиве.
   * @param {Object|Array} obj — объект/массив для поиска
   * @param {String} targetKey — искомый ключ
   * @returns {Array} найденные значения
   */
  function deepFind(obj, targetKey) {
    let result = []

    function search(current) {
      if (Array.isArray(current)) {
        current.forEach(item => search(item))
      } else if (current !== null && typeof current === 'object') {
        for (let key in current) {
          if (key === targetKey) {
            result.push(current[key])
          }
          search(current[key])
        }
      }
    }

    search(obj)
    return result
  }

  /**
   * Основная функция валидации данных по схеме.
   * Запускает рекурсивный процесс проверки структуры данных согласно предоставленной схеме.
   */
  function validateSchema() {
    /**
     * Вложенная рекурсивная функция для пошаговой проверки вложенных структур.
     * Обрабатывает:
     * - обязательные поля
     * - типы данных
     * - вложенные объекты/массивы
     * - неожиданные поля
     */
    function rec(data, schema) {
      
      // Проверяем корректность самой схемы (наличие properties и т.п.)
      checkSchema(schema)

      try {
        const requiredFields = schema.required || []
        const dataFields = Object.keys(data)
        const schemaFields = Object.keys(schema.properties)

        checkRequireFields(dataFields, requiredFields)

        const requireFieldsNotInData = getReportGeneration().problematicData.requireFieldsNotInData ?? []
        

        for (const field of schemaFields) {
          const [targetValue, correctValues] = [data[field], schema.properties[field]]

          if (!requireFieldsNotInData.includes(field)) {
            checkValueAndTypeCorrect(field, targetValue, correctValues)
          }
          
          if (correctValues.properties) {
            rec(targetValue, correctValues)
          }

          if (correctValues.items && requireFieldsNotInData.includes(field)) {
            console.log('Проверяем поле:', field, 'Значение:', targetValue, 'Тип:', getTypeOfTargetValue(targetValue))
            for (const item of targetValue) {
              if (getTypeOfTargetValue(item) !== correctValues.items.type) {
                addDataToReportGeneration('notCorrectTypeFields', [correctValues.items.type, getTypeOfTargetValue(item), item])
              }
            }
          }
        }

        checkUnexpectedFields(dataFields, schemaFields)
      }
      catch (error) {
        console.log(`Ошибка исполнения кода: ${error.message}`)
        addDataToReportGeneration('ERROR', `Ошибка исполнения кода: ${error.message}`)
      }
    }

    // Запускаем рекурсивную проверку с начальными данными и схемой
    rec(data, schema)
  }

  /**
   * Ищет в объекте поля с указанными значениями.
   * Для каждой пары {field, value} из fieldValuePairs:
   * - находит все вхождения поля field в obj (рекурсивно)
   * - проверяет, есть ли среди найденных значений искомое value
   * - если найдено, добавляет запись в отчёт
   *
   * @param {Object|Array} obj — объект/массив, в котором ведётся поиск
   * @param {Array} fieldValuePairs — массив объектов вида { field: String, value: * }
   *   где field — имя искомого поля, value — искомое значение
   */
  function findFieldWithValue(obj, fieldValuePairs) {
    // Извлекаем имена полей и соответствующие им искомые значения
    const fields = fieldValuePairs.map(item => item.field)
    const values = fieldValuePairs.map(item => item.value)

    // Проходим по всем указанным полям
    for (let i = 0; i < fields.length; ++i) {
      // Получаем текущее поле и искомое значение

      const currentField = fields[i]
      const currentValue = values[i]

      // Рекурсивно ищем все значения поля currentField в объекте obj
      let foundValues = deepFind(obj, currentField)

      // Проверяем, встречается ли искомое значение currentValue среди найденных
      if (foundValues.includes(currentValue)) {
        // Если значение найдено — добавляем запись в отчёт
        addDataToReportGeneration('foundFieldValuePairs', [currentField, currentValue])
      }
    }
  }

  /**
  * Ищет в объекте указанные поля (рекурсивно).
  * Для каждого поля из fields:
  * - находит все его вхождения в obj
  * - добавляет запись в отчёт со списком найденных значений
  *
  * @param {Object|Array} obj — объект/массив, в котором ведётся поиск
  * @param {Array<String>} fields — массив имён искомых полей
  */
  function findField(obj, fields) {
    // Проходим по всем указанным полям
    for (let field of fields) {
      // Рекурсивно ищем все значения поля field в объекте obj
      let foundValues = deepFind(obj, field)

      // Добавляем запись в отчёт: поле и все найденные значения
      if (foundValues.length > 0) {
        addDataToReportGeneration('foundField', [field, foundValues])
      }
    }
  }



  /**
  * Проверяет, есть ли в отчёте критические ошибки.
  * @returns {boolean} true, если массив errorsData содержит хотя бы одну ошибку
  */
  function isHasError() {
    return getReportGeneration().errorsData.length > 0
  }

  
  /**
  * Проверяет, обнаружены ли проблемы в валидации (кроме критических ошибок).
  * @returns {boolean} true, если в trackedFieldsWithProblems есть хотя бы одно поле
  */
  function isHasProblems() {
    return getReportGeneration().trackedFieldsWithProblems.size > 0
  }




  /**
  * Проверяет наличие некритичных данных (например, неожиданных полей).
  * @returns {boolean} true, если массив unexpectedFields не пуст
  */
  function isHasNonCritical() {
    return getReportGeneration().unexpectedFields.length > 0
  }


  /**
  * Проверяет, есть ли информационная составляющая в отчёте (найденные поля и т.п.).
  * @returns {boolean} true, если trackedFieldCategories содержит хотя бы одну категорию
  */
  function isHasInformation() {
    return getReportGeneration().trackedFieldCategories.size > 0
  }


  /**
  * Формирует текстовое сообщение с результатами валидации.
  * Учитывает:
  * - критические ошибки
  * - информационные данные (найденные поля)
  * - некритичные данные (неожиданные поля)
  * - режим строгой валидации (isStrictMode)
  *
  * @returns {string} сформированное сообщение отчёта
  */
  function getMessage() {
    let message = ''
    const reportTemplates = {
      error: 'Critical errors: \n',
      validationReportTemplates: {
        requireFieldsNotInData: [`Обязательные поля, которые отсутствуют:\n  - `, ],
        notCorrectTypeFields: ['Ожидаемый результат ', '; Фактический результат ', ':\n'],
        notCorrectExpectedValues: ['Ожидаемый результат ', '; Фактический результат ', ':\n']  
      },
      informationTemplates: {
        foundFieldValuePairs: ['Искомое поле ', ', имеющее значение ', ' присутствует'],
        foundField: ['Искомое поле ', ' имеет значение ']
      },
      unexpectedFields: 'Поля, которых нет в схеме:\n',
      successfulTemplates: 'Искомый json соответствует схеме валидации!\n\n'
    }
    
    const report = getReportGeneration()

    if (isHasError()) {
      let errors = report.errorsData

      message += reportTemplates.error + errors.join('\n') + '\n'
      message += '\n'
    }

    
    if (isHasInformation()) {
      const informationTypes = report.trackedFieldCategories

      for (const category of informationTypes) {
        const messageTemp = reportTemplates.informationTemplates
        const informationTemplatesDataForCategory = report[category]

        for (let i = 0; i < informationTemplatesDataForCategory.length; i++) {
          for (let j = 0; j < informationTemplatesDataForCategory[i].length; j++){
            message += messageTemp[category][j] + `"${informationTemplatesDataForCategory[i][j]}"`
          }

          if (category === 'foundFieldValuePairs') {
            message += messageTemp[category][2]
          }

          message += '\n'
        }
        
        if (informationTypes.size > 1) {
          message += '\n'
        }
      }
      // message += '\n'
    }

    if (isHasProblems()) {
      for (const category of report.trackedFieldsWithProblems) { // <--- Вот проблема!!!

        const template = reportTemplates.validationReportTemplates[category]
        const problemData = report.problematicData[category]
        
        if (category === 'requireFieldsNotInData') {
          const fields = problemData || []
          if (fields.length > 0) {
            message += template[0] + fields.join('\n  - ') + '\n'
          }
        } 
        else {
          const expectedValues = Object.keys(problemData)

          for (const expectedValue of expectedValues) {
            const actualValues = problemData[expectedValue]
            const actualValueKeys = Object.keys(actualValues)

            for (const actualValue of actualValueKeys) {
              const keysList = actualValues[actualValue]
              if (!Array.isArray(keysList) || keysList.length === 0) continue

              const formattedKeys = keysList.join('\n  - ')

              message += template[0] + expectedValue + template[1] + actualValue + template[2] + '  - ' + formattedKeys + '\n'
            }
          }
        }
      }
      message += '\n'
    }

    if (isHasNonCritical()) {
      let unexpectedFields = report.unexpectedFields.join('\n')

      message += reportTemplates.unexpectedFields + unexpectedFields + '\n'
    }

    if (!isHasProblems() && !isHasError() && !(isStrictMode && isHasNonCritical())) {
      message = reportTemplates.successfulTemplates + message
    }

    message += '\n'

    return message
  }


  /**
  * Определяет цвет отчёта на основе результатов валидации.
  * Используется для визуальной индикации состояния (например, в интерфейсе).
  *
  * @returns {string} название цвета ('red', 'purple', 'blue', 'green')
  */
  function getColor() {
    const colorTemplates = {
      error: 'red',
      validationReportTemplates: 'red',
      foundFieldValuePairs: 'purple',
      foundField: 'blue',
      successfulTemplates: 'green'
    }

    let result = 'grey'
    
    const report = getReportGeneration()

    if (isHasError() || isHasProblems() || (isHasNonCritical() && isStrictMode)) {
      result = colorTemplates.error
    }
    else {
      if (isHasInformation()) {
        if (report.trackedFieldCategories.has('foundFieldValuePairs')) {
          result = colorTemplates.foundFieldValuePairs
        }
        else {
          result = colorTemplates.foundField
        }
      }
      else {
        result = colorTemplates.successfulTemplates
      }
    }

    return result
  }

  validateSchema(data, schema)
    
  if (additionalParams.requiredFieldValues) {
    findFieldWithValue(data, additionalParams.requiredFieldValues)
  }

  if (additionalParams.highlightedFields) {
    findField(data, additionalParams.highlightedFields)
  }

  return {
    findFieldWithValue,
    findField,
    getMessage,
    getColor,
    getReportGeneration
  }
}


/**
 * Экспорт класса для использования в других модулях
 * 
 * Экспортирует класс validateSchemaHandler для возможности его использования
 * в других частях приложения
 */
module.exports = {
  validateSchemaHandler
}

