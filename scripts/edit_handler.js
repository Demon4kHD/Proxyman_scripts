// Конфигурация окружения и константы для работы с данными
const ENV = {
    // Специальные маркеры для обработки данных
    allArray: '@all', // Маркер для обозначения всех элементов массива
    any: '@any', // Маркер для обозначения любого элемента

    // Конфигурация операторов и их свойств
    operatorsData: {
        // Список всех поддерживаемых операторов
        operators: [
            'commentParameters', // Комментирование параметра
            'modifyParameters', // Изменение параметра
            'deleteParameters', // Удаление параметра
            'validateAndCommentParams', // Проверка и комментирование параметра
            'validateAndModifyParams', // Проверка и изменение параметра
            'validateAndModifyParams' // Проверка и удаление параметра
        ],

        // Операторы, требующие trigger для работы
        scriptsWithTrigger: [
            'validateAndCommentParams', // Проверка и просмотр
            'validateAndModifyParams', // Проверка и изменение
            'validateAndModifyParams' // Проверка и удаление
        ],

        // Операторы, требующие value для работы
        scriptsWithValue: [
            'modifyParameters', // Изменение значения
            'validateAndModifyParams', // Поиск и изменение

        ]
    },

    // Цветовая схема проблемных статусов операций
    colors: ['red', 'yellow']

}

/**
 * Класс для модификации данных с помощью скриптов
 * 
 * Представляет собой контейнер для данных и скриптов модификации,
 * содержит информацию о состоянии и комментариях
 */
function ScriptedModifier(data, script) {
    /**
     * Конструктор класса
     * 
     * Инициализирует основные свойства объекта
     * 
     * @param {object} data - исходные данные для модификации
     * @param {string|function} script - скрипт или функция модификации
     */
    this.data = {...data} // Глубокое копирование исходных данных
    this.script = script // Скрипт модификации
    this.color = 'green' // Статус-индикатор (возможно, для UI)
    this.comment = '' // Поле для комментариев

    /**
     * Метод получения текущих данных
     * 
     * Возвращает текущие модифицированные данные
     * 
     * @returns {object} - текущие данные
     */
    this.getData = function() {
        return this.data
    }

    /**
     * Метод получения статуса
     * 
     * Возвращает текущий статус в виде цвета
     * 
     * @returns {string} - значение цвета статуса
     */
    this.getColor = function() {
        return this.color
    }

    /**
     * Метод получения комментариев
     * 
     * Возвращает сохраненные комментарии
     * 
     * @returns {string} - текст комментария
     */
    this.getComment = function() {
        return this.comment
    }

    /**
     * Устанавливает цвет отображения сообщения с учетом валидации
     * 
     * Метод проверяет допустимость переданного цвета и устанавливает его,
     * соблюдая приоритет ошибок над другими типами сообщений
     * 
     * @param {string} color - цвет для установки (например, 'red', 'yellow')
     * @returns {void}
     */
    this.setColor = function(color) {
        /**
         * Проверяем:
         * 1. Наличие переданного цвета
         * 2. Присутствие цвета в списке допустимых значений ENV.colors
         */
        if (color && ENV.colors.includes(color)) {
            /**
             * Устанавливаем цвет с учетом следующих правил:
             * - Если цвет красный (ошибка), всегда устанавливаем его
             * - Если текущий цвет красный, сохраняем его
             * - В остальных случаях устанавливаем переданный цвет
             */
            this.color = 
                color === ENV.colors[0] 
                    ? ENV.colors[0] // приоритет красного цвета
                    : (
                        this.getColor() === ENV.colors[0] 
                            ? ENV.colors[0] // сохраняем красный, если уже установлен
                            : color // устанавливаем переданный цвет
                    )
        }
    }

    // Метод для добавления комментария с указанием типа сообщения и контекста
    this.setComment = function(params) {
        /**
         * Проверяем тип сообщения и формируем соответствующее сообщение
         * @param {string} params.typeOfMessage - тип сообщения (error, warning или другой)
         * @param {string} params.nameOfCallerFunction - название функции, вызвавшей метод
         * @param {string} params.message - текст сообщения
         */
        if (params.typeOfMessage === 'error') {
            // Формируем сообщение об ошибке с указанием места возникновения
            this.comment +=
                `Ошибка возникла в ${params.nameOfCallerFunction}: ${params.message}\n`
        } else {
            // Формируем обычное информационное сообщение
            this.comment +=
                `${params.nameOfCallerFunction}: ${params.message}\n`
        }

        /**
         * Определяем цвет отображения сообщения в зависимости от его типа
         * Используем тернарный оператор для выбора цвета
         */
        let color = (
            params.typeOfMessage === 'error' 
                ? ENV.colors[0] // красный цвет для ошибок
                : params.typeOfMessage === 'warning' 
                    ? ENV.colors[1] // желтый цвет для предупреждений
                    : undefined // неопределенный цвет для остальных случаев
        )

        // Устанавливаем выбранный цвет для отображения сообщения
        this.setColor(color)
    }

    /**
     * Метод для изменения значения параметра в объекте
     * 
     * Выполняет обновление значения указанного ключа в объекте
     * и добавляет информационное сообщение о произведенном изменении
     * 
     * @param {object} data - объект, в котором производится изменение
     * @param {string} key - ключ параметра для изменения
     * @param {any} value - новое значение параметра
     * @returns {void} - метод не возвращает значение
     */
    this.changeProcess = function(data, key, value) {
        /**
         * Обновление значения в объекте
         * Прямое присваивание нового значения по указанному ключу
         */
        data[key] = value
        
        /**
         * Добавление информационного сообщения
         * Оповещает о произведенном изменении значения
         */
        this.setComment({
            'typeOfMessage': 'normal', 
            'nameOfCallerFunction': 'changeProcess', // исправлено название функции в сообщении
            'message': `${key} - ${value}`
        })
    }

    /**
     * Метод для проверки отсутствия удаленного параметра
     * 
     * Проверяет, что указанный ключ отсутствует в объекте
     * после выполнения операции удаления
     * 
     * @param {object} data - объект для проверки
     * @param {string} keyBeingChecked - ключ, который должен быть удален
     * @returns {boolean} - true если ключ отсутствует, false если ключ существует
     */
    this.checkingForMissingDeletedParameter = function(data, keyBeingChecked) {
        /**
         * Проверка отсутствия ключа в объекте
         * Использует метод hasOwnProperty() для проверки наличия ключа
         * Возвращает противоположное значение (true если ключа нет)
         */
        return !data.hasOwnProperty(keyBeingChecked)
    }

    /**
     * Метод для удаления параметра из объекта или массива
     * 
     * Выполняет удаление указанного ключа из объекта
     * или удаление первого элемента из массива
     * с последующей записью информационного сообщения
     * 
     * @param {object|array} data - объект или массив для обработки
     * @param {string} key - ключ для удаления (для объекта)
     * @returns {void} - метод не возвращает значение
     */
    this.deleteProcess = function(data, key) {
        /**
         * Обработка случая с массивом
         * Если данные являются массивом, удаляется первый элемент
         */
        if (Array.isArray(data)) {
            data.shift() // Удаление первого элемента массива
            
            /**
             * Добавление информационного сообщения
             * с проверкой успешности удаления
             */
            this.setComment({
                'typeOfMessage': 'normal', 
                'nameOfCallerFunction': 'deleteProcess', // исправлено название функции
                'message': `${key} - ${this.checkingForMissingDeletedParameter(data, key)}`
            })
        }
        else {
            /**
             * Обработка случая с объектом
             * Удаление указанного ключа из объекта
             */
            delete data[key]
            
            /**
             * Добавление информационного сообщения
             * с проверкой успешности удаления
             */
            this.setComment({
                'typeOfMessage': 'normal', 
                'nameOfCallerFunction': 'deleteProcess', // исправлено название функции
                'message': `${key} - ${this.checkingForMissingDeletedParameter(data, key)}`
            })
        }
    }

    /**
     * Метод для подготовки путей без использования оператора "all"
     * 
     * Создает все возможные комбинации путей на основе входных данных
     * и массива путей, исключая использование оператора "all"
     * 
     * @param {object} data - исходные данные для обработки
     * @param {array} paths - массив путей для обработки
     * @returns {array} - массив всех возможных комбинаций путей
     */
    this.preparePaths = function(data, paths) {
        /**
         * Создаем копии входных данных для предотвращения изменения исходных объектов
         */
        let [currentData, currentPaths] = [{...data}, [...paths]]
        let result = []
        
        if (!currentPaths.includes(ENV.allArray)){
            result.push(currentPaths)
        }
        else {
            /**
             * Массивы для хранения промежуточных результатов
             */
            let variationsOfPathElement = [] // для хранения вариаций элементов пути
            let lastElementLength // для хранения длины последнего элемента

            /**
             * Проходим по каждому элементу пути
             */
            for (let key of currentPaths) {
                if (key !== ENV.allArray) {
                    // Если элемент не является оператором "all", переходим к следующему уровню данных
                    currentData = currentData[key]
                    variationsOfPathElement.push([key])
                } else {
                    // Если элемент - оператор "all", обрабатываем массив
                    lastElementLength = currentData.length - 1
                    currentData = currentData[0]
                    
                    // Создаем массив индексов для текущего уровня
                    variationsOfPathElement.push(Array.from({
                        length: lastElementLength - 0 + 1
                    }, (_, i) => 0 + i))
                }
            }

            result = variationsOfPathElement.reduce((acc, array) => {
                return array.flatMap(value => 
                    acc.map(combination => combination.concat(value))
                )
            }, [[]])
            /**
             * Возвращаем все возможные комбинации путей
             * через метод reduce и flatMap
             */
        }

        return result
    }

    /**
     * Метод для обработки данных объекта по заданным ключам
     * 
     * Выполняет навигацию по объекту, проверку наличия ключей
     * и при необходимости создает новые свойства
     * 
     * @param {object} data - исходный объект для обработки
     * @param {array} keys - массив ключей для навигации
     * @param {boolean} shouldAdd - флаг для создания отсутствующих ключей
     * @returns {array} - массив с тремя элементами:
     * - currentData: обработанный объект
     * - key: последний обработанный ключ
     * - value: значение по последнему ключу
     */
    this.processObjectData = function(data, keys, shouldAdd) {
        /**
         * Инициализация переменных для хранения текущего состояния
         */
        let currentData = data
        let value

        /**
         * Проход по всем ключам
         */
        for (const key of keys) {
            if (!currentData.hasOwnProperty(key)) {
                /**
                 * Обработка отсутствующего ключа
                 */
                if (key === keys[keys.length - 1] && shouldAdd === true) {
                    // Если это последний ключ и разрешено добавление
                    currentData[key] = null
                    value = null
                    return [currentData, key, value]
                } else {
                    // Добавление предупреждения
                    this.setComment({
                        'typeOfMessage': 'warning',
                        'nameOfCallerFunction': 'processObjectData',
                        'message': `Параметр ${key} не найден в изменяемом объекте. Проверь объект или сценарий!`
                    })
                }
            } else {
                // Ключ найден
                if (key === keys[keys.length - 1]) {
                    // Если это последний ключ
                    value = currentData[key]
                    return [currentData, key, value]
                } else {
                    // Переход к следующему уровню
                    currentData = currentData[key]
                }
            }
        }
    }

    /**
     * Метод для обработки данных по множеству путей
     * 
     * Выполняет обработку данных для каждого набора путей
     * и собирает результаты в единый структурированный массив
     * 
     * @param {object} data - исходные данные для обработки
     * @param {array} paths - массив путей для обработки
     * @param {boolean} shouldAdd - флаг для создания отсутствующих ключей
     * @returns {array} - массив с тремя элементами:
     * - mixedData: массив обработанных данных
     * - mixedKeys: массив извлеченных ключей
     * - mixedValues: массив извлеченных значений
     */
    this.processDataByPaths = function(data, paths, shouldAdd) {
        /**
         * Инициализация массивов для хранения результатов
         * Каждый массив будет содержать соответствующие данные
         * по всем обработанным путям
         */
        let mixedData = []
        let mixedKeys = []
        let mixedValues = []

        /**
         * Проход по всем наборам путей
         * Для каждого набора выполняется отдельная обработка
         */
        for (let keys of paths) {
            /**
             * Валидация входных данных
             * Проверка, что текущий набор путей является массивом
             */
            if (!Array.isArray(keys)) {
                throw new Error('Параметр paths должен быть массивом')
            }

            /**
             * Обработка текущего набора путей
             * Вызов метода для обработки данных по конкретному пути
             */
            let [newData, newKeys, newValues] = this.processObjectData(data, keys, shouldAdd)
            
            /**
             * Сохранение результатов обработки
             * Добавление полученных данных в соответствующие массивы
             */
            mixedData.push(newData)
            mixedKeys.push(newKeys)
            mixedValues.push(newValues)
        }

        /**
         * Возврат структурированного результата
         * Содержит все обработанные данные по всем путям
         */
        return [mixedData, mixedKeys, mixedValues]
    }

    /**
     * Метод для подготовки параметров оператора
     * 
     * Формирует структурированный объект параметров на основе входных данных
     * и требований конкретного оператора
     * 
     * @param {object} item - исходный объект с параметрами
     * @param {string} operator - название оператора, для которого готовятся параметры
     * @returns {object} - структурированный объект с подготовленными параметрами
     */
    this.prepareParameters = function(item, operator) {
        /**
         * Инициализация результирующего объекта
         */
        let result = {}

        /**
         * Подготовка базовой конфигурации
         * Включает формирование путей на основе текущих данных
         */
        result.target = {
            paths: this.preparePaths(
                this.getData(), 
                item.target.path
            )
        }

        /**
         * Проверка и добавление значения (value), если это требуется оператором
         */
        if (ENV.operatorsData.scriptsWithValue.includes(operator)) {
            // Проверка наличия обязательных полей
            if (!item || !item.target) {
                throw new Error("Отсутствует target в параметрах")
            }

            // Добавление значения в результирующий объект
            result.target.value = item.target.value
        }

        /**
         * Проверка и добавление триггера (trigger), если это требуется оператором
         */
        if (ENV.operatorsData.scriptsWithTrigger.includes(operator)) {
            // Проверка наличия обязательных полей
            if (!item.trigger) {
                throw new Error(
                    "Отсутствует trigger в параметрах или его дочерние параметры"
                )
            }

            // Подготовка триггера с путями и значением
            result.trigger = {
                paths: this.preparePaths(
                    this.getData(), 
                    item.trigger.path
                ),
                value: item.trigger.value
            }
        }

        // Возвращаем подготовленный объект параметров
        return result
    }

    /**
     * Метод для получения и комментирования параметров объекта
     * 
     * Выполняет анализ данных и формирует комментарии на основе полученных значений
     * 
     * @param {object} params - объект с параметрами вызова
     * @param {string} params.target.paths - путь к целевым данным
     * @returns {void}
     */
    this.commentParameters = function(params) {
        /**
         * Выполняем анализ данных и получаем три массива:
         * - mixedData: исходные данные
         * - mixedKeys: ключи данных
         * - mixedValues: значения данных
         */
        let [mixedData, mixedKeys, mixedValues] = this.processDataByPaths(
            this.getData(), 
            params.target.paths, 
            false
        )

        /**
         * Обрабатываем каждый элемент массива отдельно
         */
        for (let i = 0; i < mixedData.length; i++) {
            this.setComment({
                'typeOfMessage': 'normal', 
                'nameOfCallerFunction': 'viewParams',
                'message': `${mixedKeys[i]} - ${mixedValues[i]}`
            })
        }
    }

    /**
     * Метод для модификации выбранных параметров объекта
     * 
     * Выполняет массовое изменение значений указанных параметров
     * в объекте на основе заданных путей и нового значения
     * 
     * @param {object} params - объект с параметрами модификации
     * @param {object} params.target - объект с целевыми настройками
     * @param {array} params.target.paths - массив путей для модификации
     * @param {any} params.target.value - новое значение для установки
     * @returns {void} - метод не возвращает значение
     */
    this.modifyParameters = function(params) {
        /**
         * Получение данных для модификации
         * Вызов метода обработки данных по указанным путям
         * с возможностью создания отсутствующих ключей
         */
        let [mixedData, mixedKeys] = this.processDataByPaths(
            this.getData(), 
            params.target.paths, 
            true
        )

        /**
         * Массовая обработка и изменение значений
         * Проход по всем полученным данным и установка нового значения
         */
        for (let i = 0; i < mixedData.length; i++) {
            /**
             * Изменение значения для каждого найденного ключа
             * Вызов метода изменения с передачей:
             * - объекта данных
             * - целевого ключа
             * - нового значения
             */
            this.changeProcess(
                mixedData[i], 
                mixedKeys[i], 
                params.target.value
            )
        }
    }

    /**
     * Метод для удаления выбранных параметров объекта
     * 
     * Выполняет массовое удаление указанных параметров
     * в объекте на основе заданных путей
     * 
     * @param {object} params - объект с параметрами удаления
     * @param {object} params.target - объект с целевыми настройками
     * @param {array} params.target.path - массив путей для удаления
     * @returns {void} - метод не возвращает значение
     */
    this.deleteParameters = function(params) {
        /**
         * Получение данных для обработки
         * Вызов метода обработки данных по указанным путям
         * без создания новых ключей (shouldAdd = false)
         */
        let [mixedData, mixedKeys] = this.processDataByPaths(
            this.getData(), 
            params.target.path, 
            false
        )

        /**
         * Массовая обработка и удаление параметров
         * Проход по всем найденным объектам и ключам
         */
        for (let i = 0; i < mixedData.length; i++) {
            /**
             * Удаление параметра для каждого найденного ключа
             * Вызов метода удаления с передачей:
             * - объекта данных
             * - целевого ключа
             */
            this.deleteProcess(
                mixedData[i], 
                mixedKeys[i]
            )
        }
    }

    /**
     * Метод получения валидных параметров на основе триггеров
     * 
     * Выполняет фильтрацию целевых параметров на основе значений триггеров
     * и возвращает только те, которые соответствуют заданным условиям
     * 
     * @param {object} params - объект с параметрами фильтрации
     * @param {boolean} shouldAdd - флаг создания отсутствующих ключей
     * @returns {array} - массив с валидными данными [targetData, targetKeys, targetValues]
     */
    this.getValidParams = function(params, shouldAdd) {
        /**
         * Получение данных по путям триггеров
         * Обработка происходит без создания новых ключей (shouldAdd = false)
         */
        let [mixedTriggerData, , mixedTriggerValues] = this.processDataByPaths(
            this.getData(), 
            params.trigger.paths, 
            false
        )

        /**
         * Получение целевых данных
         * Создание новых ключей зависит от параметра shouldAdd
         */
        let [mixedTargetData, mixedTargetKeys, mixedTargetValues] = this.processDataByPaths(
            this.getData(), 
            params.target.paths, 
            shouldAdd
        )

        /**
         * Инициализация массивов для хранения валидных данных
         */
        let [rigthTargetData, rigthTargetKeys, rigthTargetValues] = [[], [], []]

        /**
         * Проверка соответствия количества путей
         * Бросает ошибку, если количество путей в trigger и target различается
         */
        if (mixedTriggerData.length !== mixedTargetData.length) {
            throw new Error(
                "Количество путей в trigger и target - различно. Проверь сценарий!!!"
            )
        }

        /**
         * Фильтрация валидных параметров
         * Проход по всем данным с проверкой условий
         */
        for (let i = 0; i < mixedTriggerData.length; i++) {
            /**
             * Определение текущего значения триггера
             * Если значение ENV.any, используется значение из данных
             */
            let currentTrigger = params.trigger.value === ENV.any ? mixedTriggerValues[i] : params.trigger.value

            /**
             * Проверка соответствия значения триггера
             * Добавление в результат при совпадении
             */
            if (currentTrigger === mixedTriggerValues[i]) {
                rigthTargetData.push(mixedTargetData[i])
                rigthTargetKeys.push(mixedTargetKeys[i])
                rigthTargetValues.push(mixedTargetValues[i])
            }
        }

        return [rigthTargetData, rigthTargetKeys, rigthTargetValues]
    }

    /**
     * Метод валидации параметров и формирования комментариев
     * 
     * Выполняет валидацию параметров и создает комментарии
     * для каждого валидного параметра с указанием ключа и значения
     * 
     * @param {object} params - объект с параметрами для валидации
     * @returns {void} - метод не возвращает значение
     */
    this.validateAndCommentParams = function(params) {
        /**
         * Получение валидных параметров
         * Вызов метода фильтрации параметров без создания новых ключей
         */
        let [mixedData, mixedKeys, mixedValues] = this.getValidParams(params, false)

        /**
         * Формирование комментариев для каждого валидного параметра
         * Проход по всем найденным параметрам
         */
        for (let i = 0; i < mixedData.length; i++) {
            /**
             * Создание комментария
             * Формируется сообщение с указанием ключа и значения параметра
             */
            this.setComment({
                'typeOfMessage': 'normal',        // тип сообщения
                'nameOfCallerFunction': 'validateAndCommentParams',  // название вызывающей функции
                'message': `${mixedKeys[i]} - ${mixedValues[i]}`  // текст сообщения с ключом и значением
            })
        }
    }

        /**
     * Метод валидации и модификации параметров
     * 
     * Выполняет валидацию параметров и их последующую модификацию
     * на основе заданных условий и значений
     * 
     * @param {object} params - объект с параметрами модификации
     * @returns {void} - метод не возвращает значение
     */
    this.validateAndModifyParams = function(params) {
        /**
         * Получение валидных параметров
         * Вызов метода фильтрации параметров без создания новых ключей
         */
        let mixedData, mixedKeys = this.getValidParams(params, false)

        /**
         * Массовая модификация валидных параметров
         * Проход по всем найденным параметрам
         */
        for (let i = 0; i < mixedData.length; i++) {
            /**
             * Применение изменений к каждому параметру
             * Вызов метода модификации с передачей:
             * - объекта данных
             * - целевого ключа
             * - нового значения
             */
            this.changeProcess(
                mixedData[i],    // объект данных
                mixedKeys[i],    // целевой ключ
                params.target.value  // новое значение
            )
        }
    }

    /**
     * Метод валидации и удаления параметров
     * 
     * Выполняет валидацию параметров и их последующее удаление
     * на основе заданных условий
     * 
     * @param {object} params - объект с параметрами удаления
     * @returns {void} - метод не возвращает значение
     */
    this.validateAndDeleteParams = function(params) {
        /**
         * Получение валидных параметров
         * Вызов метода фильтрации параметров без создания новых ключей
         */
        let mixedData, mixedKeys = this.getValidParams(params, false)

        /**
         * Массовое удаление валидных параметров
         * Проход по всем найденным параметрам
         */
        for (let i = 0; i < mixedData.length; i++) {
            /**
             * Удаление параметра
             * Вызов метода удаления с передачей:
             * - объекта данных
             * - целевого ключа
             * - дополнительного параметра (возможно, условия удаления)
             */
            this.deleteProcess(
                mixedData[i],     // объект данных
                mixedKeys[i],     // целевой ключ
                params.target.value  // дополнительный параметр
            )
        }
    }

    /**
     * Запускает выполнение сценария, перебирая все операторы и обрабатывая их
     * 
     * Метод выполняет следующие действия:
     * 1. Получает список всех операторов из сценария
     * 2. Проверяет каждый оператор на валидность
     * 3. Выполняет операторы, если они допустимы
     * 4. Обрабатывает ошибки при выполнении
     * 
     * @returns {void}
     */
    this.launch = function() {
        /**
         * Получаем все собственные имена свойств объекта сценария
         * Это даст нам список всех доступных операторов
         */
        let scriptOperatorsArray = Object.getOwnPropertyNames(this.script)
    
        /**
         * Перебираем каждый оператор из массива операторов сценария
         */
        for (let operator of scriptOperatorsArray) {
            // Проверяем валидность оператора
            if (!ENV.operatorsData.operators.includes(operator)) {
                /**
                 * Если оператор не найден в списке допустимых,
                 * добавляем предупреждение в лог
                 */
                this.setComment({
                    'typeOfMessage': 'warning', 
                    'nameOfCallerFunction': 'operatorsMainFactory',
                    'message': `${operator} - Недопустимый тип оператора!`
                })
            } else {
                try {
                    /**
                     * Если оператор валиден, выполняем его
                     * Проходим по каждому элементу в массиве операторов
                     */
                    for (let item of this.script[operator]) {
                        /**
                         * Вызываем соответствующий метод оператора
                         * с подготовленными параметрами
                         */
                        this[operator](this.prepareParameters(item, operator))
                    }
                } catch (error) {
                    /**
                     * Обрабатываем ошибки при выполнении операторов
                     * Добавляем информацию об ошибке в лог
                     */
                    this.setComment({ 
                        'typeOfMessage': 'error',
                        'nameOfCallerFunction': 'operatorsMainFactory',
                        'message': `${error.stack}`
                    })
                }
            }
        }
    }

    /**
     * Метод получения итогового результата обработки
     * 
     * Выполняет финальную обработку данных и возвращает структурированный результат
     * с информацией о новых данных, комментариях и статусе
     * 
     * @returns {object} - объект с результатами обработки
     */
    this.getResult = function() {
        /**
         * Выполнение основной обработки
         * Вызов запуска завершения всех операций
         */
        this.launch()

        /**
         * Формирование итогового объекта результата
         * Включает:
         * - новые данные
         * - комментарии по обработке
         * - статус в виде цвета
         */
        return {
            'newData': this.getData(),    // полученные после обработки данные
            'comment': this.getComment(), // комментарии по процессам обработки
            'color': this.getColor()       // статус обработки в виде цветового индикатора
        }
    }
}

/**
 * Экспорт класса для использования в других модулях
 * 
 * Экспортирует класс ScriptedModifier для возможности его использования
 * в других частях приложения
 */
module.exports = {
    ScriptedModifier
}

let test = new ScriptedModifier({a: ''}, 'a')

test.setComment()