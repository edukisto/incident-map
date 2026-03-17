# Incident map

## Установка Laravel (уже выполнено)

### Windows (CMD)

```batch
docker container run ^
  --interactive ^
  --rm ^
  --tty ^
  --volume="%CD%\src\:/srv/" ^
  -- ^
  incident-map-php:latest ^
  composer create-project --no-interaction laravel/laravel:^12 laravel
```

### Unix­‑подобные ОС

```sh
docker container run \
  --interactive \
  --rm \
  --tty \
  --volume="./src/:/srv/" \
  -- \
  incident-map-php:latest \
  composer create-project --no-interaction laravel/laravel:^12 laravel
```

## Запуск

```sh
docker compose up -d
```

## Проверка

1. Убедиться, что в корневом каталоге проекта появился каталог `db`. Если его нет, см. раздел «[Останов](#%D0%9E%D1%81%D1%82%D0%B0%D0%BD%D0%BE%D0%B2)».

2. Подать команду:

    ```sh
    docker compose ps
    ```

3. Открыть <http://localhost:8081/> в браузере и войти в phpMyAdmin (имя `root`, пароль `1`).

## БД и зависимости (однократно после `git clone`)

```sh
docker exec -it project-php sh
composer install
php artisan migrate
exit
```

## Эксплуатация

Открыть <http://localhost:8080/> в браузере.

## Останов

```sh
docker compose down --remove-orphans --volumes
```
