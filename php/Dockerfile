FROM php:8.5-fpm-alpine

RUN apk add --no-cache -- \
        libzip-dev \
        zip \
        unzip \
    && docker-php-ext-install \
        pdo_mysql \
        zip

RUN cp "${PHP_INI_DIR}/php.ini-development" "${PHP_INI_DIR}/php.ini" \
    && { \
        echo "max_execution_time = 180"; \
        echo "memory_limit = 512M"; \
    } > "${PHP_INI_DIR}/conf.d/custom.ini"


COPY --from=composer:latest -- /usr/bin/composer /usr/bin/composer

RUN adduser -D -u 1000 www

WORKDIR /srv/

RUN chown www:www /srv/

USER www

ENV PATH="/home/www/.composer/vendor/bin:${PATH}"

RUN composer global require laravel/installer --no-cache
