# Тестовое задание веб-разработчика (Node.JS)
### Используемый стек:
* NestJS
* PostgreSQL (для хранения токенов)
* Docker
### Проверка работоспособности
Данные для входа в amoCRM:
```
логин: jcjet88@gmail.com
пароль: Asdfg579
```
Сервер доступен по следующему адресу, там же можно проверить эндпоинт:

https://2adc-78-37-56-211.ngrok-free.app/api

Эндпоинт со всеми параметрами выглядит следующим образом:
```
https://2adc-78-37-56-211.ngrok-free.app/create_lead?name=Vladimir&email=jet888%40mail.ru&phone=%2B78885552222
```
### Запуск сервера локально
* склонировать этот репозиторий
* в файле .env может потребоваться изменение значений на актуальные.
* в директории репозитория запустить Docker контейнеры следующей коммандой:
```
sudo docker compose up --build -V
```
* дождаться запуска сервера.
 
