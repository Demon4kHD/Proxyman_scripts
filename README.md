Описание проекта
=

Данный модуль представляет собой систему модификации данных с помощью скриптов, которая позволяет выполнять различные операции над данными: комментирование, изменение, удаление параметров, а также их валидацию.

Конфигурация окружения
=

Основные константы
-

- allArray — маркер для обозначения всех элементов массива (@all)

- any — маркер для обозначения любого элемента (@any)

- operatorsData — конфигурация операторов и их свойств

- colors — цветовая схема проблемных статусов операций

Класс ScriptedModifier
=

Назначение
-

Класс для модификации данных с помощью скриптов. Содержит данные, скрипты модификации, статус и комментарии.

Основные методы
-

- getData() — получение текущих модифицированных данных

- getColor() — получение текущего статуса в виде цвета

- getComment() — получение сохраненных комментариев

- setColor() — установка цвета отображения сообщения

- setComment() — добавление комментария с указанием типа сообщения

- changeProcess() — изменение значения параметра

- deleteProcess() — удаление параметра

- preparePaths() — подготовка путей для обработки

- processObjectData() — обработка данных объекта по заданным ключам

- processDataByPaths() — обработка данных по множеству путей

- prepareParameters() — подготовка параметров оператора

- commentParameters() — комментирование параметров

- modifyParameters() — модификация параметров

- deleteParameters() — удаление параметров

- getValidParams() — получение валидных параметров

- validateAndCommentParams() — валидация и комментирование параметров

- validateAndModifyParams() — валидация и модификация параметров

- validateAndDeleteParams() — валидация и удаление параметров

- launch() — запуск выполнения сценария

- getResult() — получение итогового результата обработки

Операторы
-

__Поддерживаемые операторы:__

- commentParameters — комментирование параметра

- modifyParameters — изменение параметра

- deleteParameters — удаление параметра

- validateAndCommentParams — проверка и комментирование

- validateAndModifyParams — проверка и изменение

- validateAndDeleteParams — проверка и удаление

Использование
=

__Пример инициализации:__

```
  const modifier = new ScriptedModifier(data, script);
  modifier.launch();
  const result = modifier.getResult();
```

Обработка ошибок
=

Система поддерживает:
-

- Валидацию входных данных

- Обработку ошибок при выполнении операций

- Формирование комментариев с указанием места возникновения ошибок

- Цветовое отображение статуса операций

__Цветовое отображение:__

- red — ошибки

- yellow — предупреждения

- green — успешный статус (по умолчанию)

Примечания
=

- Все операции модификации выполняются с глубоким копированием данных

- Поддерживается обработка как объектов, так и массивов

- Система позволяет отслеживать изменения через комментарии

- Предусмотрена валидация параметров перед выполнением операций

Использование скрипта edit_handler.js для Proxyman
=
Установка и настройка ProxyMan:
-
- Установить, открыть и настроить ProxyMan (в том числе и проставить сертификаты на комп и телефон или симулятор(без VPN))
Включить в ProxyMan сбор данных
Установить приложение на телефон или симулятор и запустить его
Вернуться к ProxyMan
В левом столбе выбрать приложение Впрок/Впрок DEV (для симулируемого устройства) или IP - адрес (для физического девайса)(можно установить Nickname для девайса) и найти выделенный на картинке ниже адрес.

Важно! Требуется наличие Pro подписки. Инструмент scripting не доступен в бесплатной версии. 

Как пользоваться инструментом Scripting:
На запросе, который требуется изменить, вызвать контекстное меню и выбрать Tools -> Scripting... 


Импорт скрипта
-

Импортируйте файл edit_handler.js из репозитория.

Базовый пример конфигурации:
-

```
sharedState.details = {
    'modifyParameters': [
        {
            'target': {
                path: ["suborder", "features", "print_label_enabled"],
                value: ["10.229.131.131"]
            }
        }
    ]
}

async function onRequest(context, url, request) {
    return request;
}

async function onResponse(context, url, request, response) {
    let switcher = true;

    if (request.path == '/api/v1/sub-order/details' && switcher) {
        let handler = new file.ScriptedModifier(response.body, sharedState.details);
        let result = handler.getResult();
        
        response.body = result.newData;
        response.comment = result.comment;
        response.color = result.color;
    }
    
    return response;
```

Структура объекта sharedState.details:
- 

```
{
  "оператор": [
    {
      "target": {
        "path": ["путь", "к", "параметру"],
        "value": "новое значение"
      },
      "trigger": {
        "path": ["путь", "к", "триггеру"],
        "value": "значение триггера"
      }
    }
  ]
}
```

Специальные маркеры:
-

- @all — используется для обхода всех элементов массива

- @any — используется в trigger.value для поиска параметра независимо от значения

Пример использования маркеров:
-
```
{
  "changeValue": [
    {
      "target": {
        "path": ["slotsInfo", "slots", "@all", "isCurrent"],
        "value": false
      }
    },
    {
      "target": {
        "path": ["slotsInfo", "slots", "@all", "slots", "@all", "groupSlots", "@all", "isCurrent"],
        "value": false
      }
    }
  ],
  "searchAndChange": [
    {
      "target": {
        "path": ["slotsInfo", "slots", "@all", "slots", "@all", "groupSlots", "@all", "isCurrent"],
        "value": true
      },
      "trigger": {
        "path": ["slotsInfo", "slots", "@all", "slots", "@all", "groupSlots", "@all", "slotId"],
        "value": 475
      }
    }
  ]
}
```
!Важные замечания!
=

- Операторы 4-6 могут находить параметр с одним значением, но применять действия к другому

- Маркер @any не рекомендуется использовать с null и undefined значениями

- Параметр sharedState.details обязателен для работы скрипта

Примеры использования
=

Пример 1: Простая модификация
-
```
sharedState.details = {
  'modifyParameters': [
    {
      'target': {
        path: ["user", "status"],
        value: "active"
      }
    }
  ]
}
```
Пример 2: Сложный сценарий с триггером
-
```
sharedState.details = {
  'validateAndModifyParams': [
    {
      'target': {
        path: ["order", "total"],
        value: 1000
      },
      'trigger': {
        path: ["order", "items", "@all", "quantity"],
        value: ">5"
      }
    }
  ]
}
```
Рекомендации по использованию:
=

- Всегда проверяйте корректность путей

- Используйте маркеры только при необходимости

- Документируйте сложные сценарии модификации

- Тестируйте изменения на тестовых данных

- Сохраняйте резервные копии важных данных
