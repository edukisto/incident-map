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

## Установка JavaScript­‑зависимостей (уже выполнено)

### Windows (CMD)

```sh
docker container run ^
  --interactive ^
  --rm ^
  --tty ^
  --user "1000:1000" ^
  --volume="%CD%\src\laravel\:/srv/laravel/" ^
  --workdir="/srv/laravel/" ^
  -- ^
  node:24-slim ^
  npm install @inertiajs/react@^2.0 react@^18 react-dom@^18 @vitejs/plugin-react@^4.3 maplibre-gl
```

### Unix­‑подобные ОС

```sh
docker container run \
  --interactive \
  --rm \
  --tty \
  --user "1000:1000" \
  --volume="./src/laravel/:/srv/laravel/" \
  --workdir="/srv/laravel/" \
  -- \
  node:24-slim \
  npm install @inertiajs/react@^2.0 react@^18 react-dom@^18 @vitejs/plugin-react@^4.3 maplibre-gl
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
npm install
php artisan migrate
php artisan db:seed
exit
```

```sh
docker compose exec node_service npm install
```

## Эксплуатация

Открыть <http://localhost:8080/> в браузере.

## Останов

```sh
docker compose down --remove-orphans --volumes
```
